import { useState, useEffect, lazy, Suspense } from 'react'
import Sidebar from './components/layout/Sidebar'
import Header from './components/layout/Header'
import StatusBar from './components/layout/StatusBar'
import TranscriptTimeline from './components/transcript/TranscriptTimeline'
import AnswerStream from './components/answer/AnswerStream'
import AnswerCard from './components/answer/AnswerCard'
import SessionControls from './components/session/SessionControls'
import ToastContainer from './components/ui/ToastContainer'
import OnboardingModal from './components/onboarding/OnboardingModal'
import { ErrorBoundary } from './components/ui'
import { HistoryIcon, LightbulbIcon, ClipboardIcon } from './components/ui/Icons'
import { useClipboardMonitor } from './hooks/useClipboardMonitor'
import { SkeletonBlock } from './components/ui/Skeleton'
import { useAudioCapture } from './hooks/useAudioCapture'
import { useWebSpeech } from './hooks/useWebSpeech'
import { useSessionStore } from './stores/sessionStore'
import { useSettingsStore } from './stores/settingsStore'
import { useProfileStore } from './stores/profileStore'
import './types/ipc'
import type { Page } from './types/navigation'

const SettingsPage = lazy(() => import('./components/settings/SettingsPage'))
const ProfilePage = lazy(() => import('./components/profile/ProfilePage'))
const MockInterviewPage = lazy(() => import('./components/mock/MockInterviewPage'))
const CodingPage = lazy(() => import('./components/coding/CodingPage'))
const HistoryPage = lazy(() => import('./components/history/HistoryPage'))

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('interview')
  const [showOnboarding, setShowOnboarding] = useState(false)
  const loadSettings = useSettingsStore((s) => s.loadFromDisk)
  const loadProfile = useProfileStore((s) => s.loadFromDisk)

  // Load persisted data on mount and check onboarding
  useEffect(() => {
    loadSettings()
    loadProfile()

    // Check if onboarding has been completed
    window.copilot?.storage?.get?.('hasCompletedOnboarding').then((val) => {
      if (!val) setShowOnboarding(true)
    })
  }, [loadSettings, loadProfile])

  const handleOnboardingComplete = () => {
    setShowOnboarding(false)
    window.copilot?.storage?.set?.('hasCompletedOnboarding', true)
  }

  return (
    <div className="flex h-screen w-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {showOnboarding && <OnboardingModal onComplete={handleOnboardingComplete} />}
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />

      <div className="flex flex-col flex-1 min-w-0">
        <Header currentPage={currentPage} onNavigate={setCurrentPage} />

        <main
          className="flex-1 overflow-auto p-6"
          style={{ backgroundColor: 'var(--bg-primary)' }}
        >
          <div key={currentPage} className="animate-fadeIn page-enter h-full">
            <ErrorBoundary>
              <Suspense fallback={<PageSkeleton />}>
                {currentPage === 'interview' && <InterviewPage />}
                {currentPage === 'coding' && <CodingPage />}
                {currentPage === 'practice' && <MockInterviewPage />}
                {currentPage === 'history' && <HistoryPage />}
                {currentPage === 'profile' && <ProfilePage />}
                {currentPage === 'settings' && <SettingsPage />}
              </Suspense>
            </ErrorBoundary>
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

  const { detectedText: clipboardQuestion, dismiss: dismissClipboard } = useClipboardMonitor(status === 'listening')

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

      {/* Clipboard auto-detect */}
      {clipboardQuestion && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl animate-slideUp"
          style={{
            backgroundColor: 'var(--accent-subtle)',
            border: '1px solid rgba(124, 92, 252, 0.15)'
          }}
        >
          <ClipboardIcon size={14} style={{ color: 'var(--accent)' }} />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>
              Question detected in clipboard
            </p>
            <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
              {clipboardQuestion}
            </p>
          </div>
          <button
            onClick={dismissClipboard}
            className="text-[10px] font-medium px-2 py-1 rounded-lg cursor-pointer"
            style={{ color: 'var(--text-muted)' }}
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  )
}

function PageSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <SkeletonBlock style={{ height: '48px' }} />
      <div className="flex gap-4">
        <SkeletonBlock className="flex-1" style={{ height: '300px' }} />
        <SkeletonBlock style={{ height: '300px', width: '420px' }} />
      </div>
    </div>
  )
}
