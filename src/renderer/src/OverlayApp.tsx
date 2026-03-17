import { useState, useCallback, useEffect } from 'react'
import './types/ipc'

type SessionStatus = 'idle' | 'listening' | 'processing' | 'answering' | 'paused'

interface StreamChunk {
  text: string
  done: boolean
}

interface AnswerResult {
  answerType: string
  keyPoints: string[]
  suggestedAnswer: string
  followUpPrep: string[]
}

interface TranscriptEntry {
  id: string
  speaker: string
  text: string
  isQuestion: boolean
}

export default function OverlayApp() {
  const [opacity, setOpacity] = useState(0.9)
  const [isMinimized, setIsMinimized] = useState(false)
  const [status, setStatus] = useState<SessionStatus>('idle')
  const [showControls, setShowControls] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [currentAnswer, setCurrentAnswer] = useState<AnswerResult | null>(null)
  const [lastQuestion, setLastQuestion] = useState('')
  const [lastTranscript, setLastTranscript] = useState('')

  useEffect(() => {
    const unsubs: Array<(() => void) | undefined> = []

    unsubs.push(
      window.copilot?.session?.onStatusChange?.((s) => {
        setStatus(s as SessionStatus)
      })
    )

    unsubs.push(
      window.copilot?.ai?.onStreamChunk?.((data) => {
        const chunk = data as StreamChunk
        if (!chunk.done) {
          setStreamingText((prev) => prev + chunk.text)
        }
      })
    )

    unsubs.push(
      window.copilot?.ai?.onAnswerComplete?.((data) => {
        const answer = data as AnswerResult
        setCurrentAnswer(answer)
        setStreamingText('')
      })
    )

    unsubs.push(
      window.copilot?.transcript?.onUpdate?.((data) => {
        const entry = data as TranscriptEntry
        if (entry.isQuestion) {
          setLastQuestion(entry.text)
          setCurrentAnswer(null)
          setStreamingText('')
        }
        setLastTranscript(entry.text)
      })
    )

    return () => unsubs.forEach((u) => u?.())
  }, [])

  const handleMouseEnter = useCallback(() => {
    setShowControls(true)
    window.copilot?.overlay?.mouseEnter?.()
  }, [])

  const handleMouseLeave = useCallback(() => {
    setShowControls(false)
    window.copilot?.overlay?.mouseLeave?.()
  }, [])

  const handleOpacityChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value)
    setOpacity(val)
    window.copilot?.overlay?.setOpacity?.(val)
  }, [])

  if (isMinimized) {
    return (
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="fixed top-2 right-2 cursor-pointer"
        onClick={() => setIsMinimized(false)}
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg"
          style={{ backgroundColor: 'rgba(99, 102, 241, 0.9)' }}
        >
          CP
        </div>
      </div>
    )
  }

  const statusConfig: Record<SessionStatus, { label: string; dot: string }> = {
    idle: { label: 'Ready', dot: '#9898b0' },
    listening: { label: 'Listening...', dot: '#22c55e' },
    processing: { label: 'Detecting...', dot: '#f59e0b' },
    answering: { label: 'Generating...', dot: '#6366f1' },
    paused: { label: 'Paused', dot: '#f59e0b' }
  }

  const { label: statusLabel, dot: dotColor } = statusConfig[status]

  return (
    <div
      className="fixed inset-2 flex flex-col rounded-2xl overflow-hidden shadow-2xl"
      style={{
        backgroundColor: `rgba(15, 15, 20, ${opacity})`,
        border: '1px solid rgba(99, 102, 241, 0.3)',
        backdropFilter: 'blur(20px)'
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Title bar */}
      <div
        className="flex items-center justify-between px-4 py-2.5 cursor-move select-none shrink-0"
        style={{
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          WebkitAppRegion: 'drag' as unknown as string
        }}
      >
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor: dotColor,
              animation: status !== 'idle' ? 'pulse 2s infinite' : 'none'
            }}
          />
          <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>
            {statusLabel}
          </span>
        </div>

        {showControls && (
          <div
            className="flex items-center gap-2"
            style={{ WebkitAppRegion: 'no-drag' as unknown as string }}
          >
            <input
              type="range"
              min="0.2"
              max="1"
              step="0.05"
              value={opacity}
              onChange={handleOpacityChange}
              className="w-16 h-1 accent-indigo-500"
            />
            <button
              onClick={() => setIsMinimized(true)}
              className="text-xs px-1.5 py-0.5 rounded cursor-pointer hover:bg-white/10"
              style={{ color: 'rgba(255,255,255,0.5)' }}
            >
              —
            </button>
            <button
              onClick={() => window.copilot?.overlay?.toggle?.()}
              className="text-xs px-1.5 py-0.5 rounded cursor-pointer hover:bg-white/10"
              style={{ color: 'rgba(255,255,255,0.5)' }}
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-3">
        {status === 'idle' ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Waiting for session...
              </p>
              <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.25)' }}>
                Start a session from the main window
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Detected Question */}
            {lastQuestion && (
              <div className="rounded-lg p-3" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                <p className="text-xs font-medium mb-1" style={{ color: 'rgba(99, 102, 241, 0.8)' }}>
                  Detected Question
                </p>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.85)' }}>
                  {lastQuestion}
                </p>
              </div>
            )}

            {/* Streaming Answer */}
            {streamingText && (
              <div className="rounded-lg p-3" style={{ backgroundColor: 'rgba(99, 102, 241, 0.08)' }}>
                <p className="text-xs font-medium mb-1" style={{ color: 'rgba(99, 102, 241, 0.8)' }}>
                  Generating...
                </p>
                <p className="text-sm whitespace-pre-wrap" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  {streamingText}
                  <span className="animate-pulse">▊</span>
                </p>
              </div>
            )}

            {/* Completed Answer */}
            {currentAnswer && !streamingText && (
              <div className="space-y-2">
                {/* Key Points */}
                {currentAnswer.keyPoints.length > 0 && (
                  <div className="rounded-lg p-3" style={{ backgroundColor: 'rgba(99, 102, 241, 0.08)' }}>
                    <p className="text-xs font-medium mb-1.5" style={{ color: 'rgba(99, 102, 241, 0.8)' }}>
                      Key Points
                    </p>
                    <ul className="space-y-1">
                      {currentAnswer.keyPoints.map((point, i) => (
                        <li key={i} className="text-sm flex items-start gap-1.5" style={{ color: 'rgba(255,255,255,0.8)' }}>
                          <span style={{ color: 'rgba(99, 102, 241, 0.7)' }}>•</span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Follow-ups */}
                {currentAnswer.followUpPrep.length > 0 && (
                  <div className="rounded-lg p-3" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
                    <p className="text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      Prepare for
                    </p>
                    {currentAnswer.followUpPrep.map((q, i) => (
                      <p key={i} className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        {i + 1}. {q}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}

            {!lastQuestion && !streamingText && !currentAnswer && (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  Listening for questions...
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Mini transcript */}
      <div className="px-4 py-2 shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.3)' }}>
          {lastTranscript || 'Transcript will appear here...'}
        </p>
      </div>
    </div>
  )
}
