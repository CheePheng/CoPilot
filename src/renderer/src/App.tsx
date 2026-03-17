import { useState } from 'react'
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
import { useSession } from './hooks/useSession'
import { useAudioCapture } from './hooks/useAudioCapture'
import { useWebSpeech } from './hooks/useWebSpeech'
import { useSessionStore } from './stores/sessionStore'
import { useSettingsStore } from './stores/settingsStore'
import './types/ipc'

type Page = 'interview' | 'practice' | 'history' | 'profile' | 'settings'

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('interview')

  return (
    <div className="flex h-screen w-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />

      <div className="flex flex-col flex-1 min-w-0">
        <Header currentPage={currentPage} />

        <main
          className="flex-1 overflow-auto p-6"
          style={{ backgroundColor: 'var(--bg-primary)' }}
        >
          {currentPage === 'interview' && <InterviewPage />}
          {currentPage === 'practice' && <MockInterviewPage />}
          {currentPage === 'history' && (
            <PlaceholderPage
              title="Session History"
              description="Review past interview sessions and answers."
              icon="📋"
            />
          )}
          {currentPage === 'profile' && <ProfilePage />}
          {currentPage === 'settings' && <SettingsPage />}
        </main>

        <StatusBar />
      </div>
    </div>
  )
}

function InterviewPage() {
  const { audioLevel } = useAudioCapture()
  const currentAnswerCard = useSessionStore((s) => s.currentAnswerCard)
  const answerHistory = useSessionStore((s) => s.answerHistory)
  const status = useSessionStore((s) => s.status)
  const sttProvider = useSettingsStore((s) => s.sttProvider)

  // Auto-start Web Speech API when session is active and using web-speech provider
  const webSpeechEnabled = sttProvider === 'web-speech' && (status === 'listening' || status === 'processing' || status === 'answering')
  useWebSpeech(webSpeechEnabled)

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Session controls bar */}
      <SessionControls audioLevel={audioLevel} />

      {/* Main content */}
      <div className="flex gap-6 flex-1 min-h-0">
        {/* Transcript Panel */}
        <div
          className="flex-1 rounded-xl p-4 flex flex-col"
          style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
        >
          <h2 className="text-base font-semibold mb-3 shrink-0" style={{ color: 'var(--text-primary)' }}>
            Live Transcript
          </h2>
          <TranscriptTimeline />
        </div>

        {/* Answer Panel */}
        <div
          className="w-[420px] rounded-xl p-4 flex flex-col"
          style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
        >
          <h2 className="text-base font-semibold mb-3 shrink-0" style={{ color: 'var(--text-primary)' }}>
            AI Suggestions
          </h2>

          <div className="flex-1 overflow-auto space-y-3">
            <AnswerStream />

            {currentAnswerCard && <AnswerCard card={currentAnswerCard} />}

            {answerHistory.length === 0 && !currentAnswerCard && (
              <div className="flex items-center justify-center h-full" style={{ color: 'var(--text-secondary)' }}>
                <div className="text-center">
                  <div className="text-4xl mb-4">💡</div>
                  <p className="text-sm">
                    Answer suggestions will appear here when questions are detected
                  </p>
                </div>
              </div>
            )}

            {/* Previous answers */}
            {answerHistory.length > 1 && (
              <div className="space-y-3 mt-4">
                <h3 className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
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
  icon
}: {
  title: string
  description: string
  icon: string
}) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="text-5xl mb-4">{icon}</div>
        <h2 className="text-2xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
          {title}
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>{description}</p>
      </div>
    </div>
  )
}
