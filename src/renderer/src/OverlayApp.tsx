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
  const [ghostMode, setGhostMode] = useState(true)
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

    unsubs.push(
      (window.copilot as { ghost?: { onStatusChange?: (cb: (e: boolean) => void) => () => void } })?.ghost?.onStatusChange?.(setGhostMode)
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
          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-lg"
          style={{
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            boxShadow: '0 0 20px rgba(124, 92, 252, 0.4)'
          }}
        >
          CP
        </div>
      </div>
    )
  }

  const statusConfig: Record<SessionStatus, { label: string; dot: string }> = {
    idle: { label: 'Ready', dot: '#5a5a74' },
    listening: { label: 'Listening', dot: '#10b981' },
    processing: { label: 'Detecting', dot: '#f59e0b' },
    answering: { label: 'Generating', dot: '#7c5cfc' },
    paused: { label: 'Paused', dot: '#f59e0b' }
  }

  const { label: statusLabel, dot: dotColor } = statusConfig[status]

  return (
    <div
      className="fixed inset-2 flex flex-col rounded-2xl overflow-hidden"
      style={{
        backgroundColor: `rgba(9, 9, 15, ${opacity})`,
        border: '1px solid rgba(124, 92, 252, 0.2)',
        backdropFilter: 'blur(24px)',
        boxShadow: '0 8px 40px rgba(0, 0, 0, 0.6), 0 0 30px rgba(124, 92, 252, 0.06)'
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Title bar */}
      <div
        className="flex items-center justify-between px-4 py-2.5 cursor-move select-none shrink-0"
        style={{
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          WebkitAppRegion: 'drag' as unknown as string
        }}
      >
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor: dotColor,
              boxShadow: status !== 'idle' ? `0 0 8px ${dotColor}` : 'none'
            }}
          />
          <span className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {statusLabel}
          </span>
          {ghostMode && (
            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
              GHOST
            </span>
          )}
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
              className="w-14 h-1 accent-indigo-500"
            />
            <button
              onClick={() => setIsMinimized(true)}
              className="text-[11px] w-6 h-6 rounded-lg flex items-center justify-center cursor-pointer"
              style={{ color: 'rgba(255,255,255,0.4)', backgroundColor: 'rgba(255,255,255,0.05)' }}
            >
              —
            </button>
            <button
              onClick={() => window.copilot?.overlay?.toggle?.()}
              className="text-[11px] w-6 h-6 rounded-lg flex items-center justify-center cursor-pointer"
              style={{ color: 'rgba(255,255,255,0.4)', backgroundColor: 'rgba(255,255,255,0.05)' }}
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
              <div
                className="w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(124, 92, 252, 0.1)' }}
              >
                <span className="text-lg" style={{ color: '#7c5cfc' }}>CP</span>
              </div>
              <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Waiting for session...
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Detected Question */}
            {lastQuestion && (
              <div className="rounded-xl p-3" style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderLeft: '2px solid rgba(124, 92, 252, 0.5)' }}>
                <p className="text-[10px] font-semibold mb-1 uppercase tracking-wider" style={{ color: 'rgba(124, 92, 252, 0.7)' }}>
                  Question
                </p>
                <p className="text-[13px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.85)' }}>
                  {lastQuestion}
                </p>
              </div>
            )}

            {/* Streaming Answer */}
            {streamingText && (
              <div className="rounded-xl p-3" style={{ backgroundColor: 'rgba(124, 92, 252, 0.06)', border: '1px solid rgba(124, 92, 252, 0.12)' }}>
                <p className="text-[10px] font-semibold mb-1 uppercase tracking-wider" style={{ color: 'rgba(124, 92, 252, 0.7)' }}>
                  Generating
                </p>
                <p className="text-[13px] whitespace-pre-wrap leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>
                  {streamingText}
                  <span className="inline-block w-1 h-3.5 ml-0.5 rounded-sm" style={{ backgroundColor: '#7c5cfc', animation: 'breathe 1.5s ease-in-out infinite' }} />
                </p>
              </div>
            )}

            {/* Completed Answer */}
            {currentAnswer && !streamingText && (
              <div className="space-y-2">
                {currentAnswer.keyPoints.length > 0 && (
                  <div className="rounded-xl p-3" style={{ backgroundColor: 'rgba(124, 92, 252, 0.06)' }}>
                    <p className="text-[10px] font-semibold mb-1.5 uppercase tracking-wider" style={{ color: 'rgba(124, 92, 252, 0.7)' }}>
                      Key Points
                    </p>
                    <ul className="space-y-1">
                      {currentAnswer.keyPoints.map((point, i) => (
                        <li key={i} className="text-[12px] flex items-start gap-1.5 leading-relaxed" style={{ color: 'rgba(255,255,255,0.8)' }}>
                          <span className="w-1 h-1 rounded-full mt-1.5 shrink-0" style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }} />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {currentAnswer.followUpPrep.length > 0 && (
                  <div className="rounded-xl p-3" style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                    <p className="text-[10px] font-semibold mb-1 uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      Prepare For
                    </p>
                    {currentAnswer.followUpPrep.map((q, i) => (
                      <p key={i} className="text-[11px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        {i + 1}. {q}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}

            {!lastQuestion && !streamingText && !currentAnswer && (
              <div className="flex items-center justify-center h-full">
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
                  Listening for questions...
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Mini transcript */}
      <div className="px-4 py-2 shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="text-[11px] truncate" style={{ color: 'rgba(255,255,255,0.25)' }}>
          {lastTranscript || 'Transcript will appear here...'}
        </p>
      </div>
    </div>
  )
}
