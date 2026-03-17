import { useSession } from '../../hooks/useSession'
import { useToastStore } from '../../stores/toastStore'
import AudioMeter from './AudioMeter'
import { PlayIcon, PauseIcon, StopIcon } from '../ui/Icons'

interface Props {
  audioLevel: number
}

export default function SessionControls({ audioLevel }: Props) {
  const { status, startSession, stopSession, pauseSession, resumeSession } = useSession()
  const addToast = useToastStore((s) => s.addToast)

  const isActive = status !== 'idle'

  const handleStart = async () => {
    const result = await startSession()
    if (result && !result.success && result.error) {
      addToast('error', result.error)
    }
  }

  return (
    <div
      className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
      style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}
    >
      {!isActive ? (
        <button
          onClick={handleStart}
          className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold cursor-pointer transition-all"
          style={{
            background: 'var(--accent-gradient)',
            color: 'white',
            boxShadow: 'var(--shadow-glow)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.02)'
            e.currentTarget.style.boxShadow = '0 0 32px rgba(124, 92, 252, 0.3)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.boxShadow = 'var(--shadow-glow)'
          }}
        >
          <PlayIcon size={14} />
          Start Session
        </button>
      ) : (
        <>
          {status === 'paused' ? (
            <button
              onClick={resumeSession}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer transition-all"
              style={{
                backgroundColor: 'var(--success)',
                color: 'white',
                boxShadow: '0 0 16px rgba(16, 185, 129, 0.2)'
              }}
            >
              <PlayIcon size={13} />
              Resume
            </button>
          ) : (
            <button
              onClick={pauseSession}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer transition-all"
              style={{
                backgroundColor: 'var(--warning-subtle)',
                color: 'var(--warning)',
                border: '1px solid rgba(245, 158, 11, 0.2)'
              }}
            >
              <PauseIcon size={13} />
              Pause
            </button>
          )}
          <button
            onClick={stopSession}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer transition-all"
            style={{
              backgroundColor: 'var(--danger-subtle)',
              color: 'var(--danger)',
              border: '1px solid rgba(239, 68, 68, 0.2)'
            }}
          >
            <StopIcon size={13} />
            Stop
          </button>
        </>
      )}

      {isActive && <AudioMeter level={audioLevel} />}

      <span className="text-xs ml-auto font-medium" style={{ color: 'var(--text-muted)' }}>
        {status === 'idle' && 'Ready to assist'}
        {status === 'listening' && 'Listening...'}
        {status === 'processing' && 'Detecting question...'}
        {status === 'answering' && 'Generating answer...'}
        {status === 'paused' && 'Paused'}
      </span>
    </div>
  )
}
