import { useSession } from '../../hooks/useSession'
import AudioMeter from './AudioMeter'

interface Props {
  audioLevel: number
}

export default function SessionControls({ audioLevel }: Props) {
  const { status, startSession, stopSession, pauseSession, resumeSession } = useSession()

  const isActive = status !== 'idle'

  return (
    <div
      className="flex items-center gap-3 px-4 py-2 rounded-lg"
      style={{ backgroundColor: 'var(--bg-tertiary)' }}
    >
      {!isActive ? (
        <button
          onClick={startSession}
          className="px-4 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer"
          style={{ backgroundColor: 'var(--accent)', color: 'white' }}
        >
          Start Session
        </button>
      ) : (
        <>
          {status === 'paused' ? (
            <button
              onClick={resumeSession}
              className="px-4 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer"
              style={{ backgroundColor: 'var(--success)', color: 'white' }}
            >
              Resume
            </button>
          ) : (
            <button
              onClick={pauseSession}
              className="px-4 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer"
              style={{ backgroundColor: 'var(--warning)', color: 'white' }}
            >
              Pause
            </button>
          )}
          <button
            onClick={stopSession}
            className="px-4 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer"
            style={{ backgroundColor: 'var(--danger)', color: 'white' }}
          >
            Stop
          </button>
        </>
      )}

      {isActive && <AudioMeter level={audioLevel} />}

      <span className="text-xs ml-auto" style={{ color: 'var(--text-secondary)' }}>
        {status === 'idle' && 'Ready'}
        {status === 'listening' && 'Listening...'}
        {status === 'processing' && 'Detecting question...'}
        {status === 'answering' && 'Generating answer...'}
        {status === 'paused' && 'Paused'}
      </span>
    </div>
  )
}
