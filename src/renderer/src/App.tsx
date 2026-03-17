import { useState, useEffect } from 'react'
import Sidebar from './components/layout/Sidebar'
import Header from './components/layout/Header'
import StatusBar from './components/layout/StatusBar'
import TranscriptTimeline from './components/transcript/TranscriptTimeline'
import AnswerStream from './components/answer/AnswerStream'
import AnswerCard from './components/answer/AnswerCard'
import SessionControls from './components/session/SessionControls'
import SettingsPage from './components/settings/SettingsPage'
import ProfilePage from './components/profile/ProfilePage'
import MockInterviewPage from './components/mock/MockInterviewPage'
import ToastContainer from './components/ui/ToastContainer'
import { HistoryIcon, LightbulbIcon } from './components/ui/Icons'
import { useSession } from './hooks/useSession'
import { useAudioCapture } from './hooks/useAudioCapture'
import { useWebSpeech } from './hooks/useWebSpeech'
import { useSessionStore } from './stores/sessionStore'
import { useSettingsStore } from './stores/settingsStore'
import { useProfileStore } from './stores/profileStore'
import './types/ipc'

type Page = 'interview' | 'practice' | 'history' | 'profile' | 'settings'

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('interview')
  const loadSettings = useSettingsStore((s) => s.loadFromDisk)
  const loadProfile = useProfileStore((s) => s.loadFromDisk)

  // Load persisted data on mount
  useEffect(() => {
    loadSettings()
    loadProfile()
  }, [loadSettings, loadProfile])

  return (
    <div className="flex h-screen w-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />

      <div className="flex flex-col flex-1 min-w-0">
        <Header currentPage={currentPage} />

        <main
          className="flex-1 overflow-auto p-6"
          style={{ backgroundColor: 'var(--bg-primary)' }}
        >
          <div key={currentPage} className="animate-fadeIn h-full">
            {currentPage === 'interview' && <InterviewPage />}
            {currentPage === 'practice' && <MockInterviewPage />}
            {currentPage === 'history' && (
              <PlaceholderPage
                title="Session History"
                description="Start your first interview session to build history."
                Icon={HistoryIcon}
              />
            )}
            {currentPage === 'profile' && <ProfilePage />}
            {currentPage === 'settings' && <SettingsPage />}
          </div>
        </main>

        <StatusBar />
      </div>

      <ToastContainer />
    </div>
  )
}

function InterviewPage() {
  const { audioLevel } = useAudioCapture()
  const currentAnswerCard = useSessionStore((s) => s.currentAnswerCard)
  const answerHistory = useSessionStore((s) => s.answerHistory)
  const status = useSessionStore((s) => s.status)
  const sttProvider = useSettingsStore((s) => s.sttProvider)

  const webSpeechEnabled = sttProvider === 'web-speech' && (status === 'listening' || status === 'processing' || status === 'answering')
  useWebSpeech(webSpeechEnabled)

  return (
    <div className="flex flex-col gap-4 h-full">
      <SessionControls audioLevel={audioLevel} />

      <div className="flex gap-6 flex-1 min-h-0">
        {/* Transcript Panel */}
        <div
          className="flex-1 rounded-xl p-4 flex flex-col"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border)'
          }}
        >
          <h2
            className="text-xs font-semibold mb-3 shrink-0 uppercase tracking-wider"
            style={{ color: 'var(--text-muted)' }}
          >
            Live Transcript
          </h2>
          <TranscriptTimeline />
        </div>

        {/* Answer Panel */}
        <div
          className="w-[420px] rounded-xl p-4 flex flex-col"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border)'
          }}
        >
          <h2
            className="text-xs font-semibold mb-3 shrink-0 uppercase tracking-wider"
            style={{ color: 'var(--text-muted)' }}
          >
            AI Suggestions
          </h2>

          <div className="flex-1 overflow-auto space-y-3">
            <AnswerStream />

            {currentAnswerCard && <AnswerCard card={currentAnswerCard} />}

            {answerHistory.length === 0 && !currentAnswerCard && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="mb-4 flex justify-center">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center"
                      style={{
                        background: 'var(--accent-subtle)',
                        boxShadow: 'var(--shadow-glow)'
                      }}
                    >
                      <LightbulbIcon size={24} className="gradient-text" />
                    </div>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Suggestions appear when questions are detected
                  </p>
                </div>
              </div>
            )}

            {/* Previous answers */}
            {answerHistory.length > 1 && (
              <div className="space-y-3 mt-4">
                <h3
                  className="text-[10px] font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Previous Answers
                </h3>
                {answerHistory.slice(0, -1).reverse().map((card, i) => (
                  <AnswerCard key={i} card={card} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function PlaceholderPage({
  title,
  description,
  Icon
}: {
  title: string
  description: string
  Icon: React.ComponentType<{ size?: number; className?: string }>
}) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="mb-4 flex justify-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{
              background: 'var(--accent-subtle)',
              boxShadow: 'var(--shadow-glow)'
            }}
          >
            <Icon size={28} className="gradient-text" />
          </div>
        </div>
        <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
          {title}
        </h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{description}</p>
      </div>
    </div>
  )
}
