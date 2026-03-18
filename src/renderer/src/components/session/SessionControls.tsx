import { useSession } from '../../hooks/useSession'
import { useToastStore } from '../../stores/toastStore'
import AudioMeter from './AudioMeter'
import Button from '../ui/Button'
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
        <Button variant="primary" size="md" icon={<PlayIcon size={14} />} onClick={handleStart}>
          Start Session
        </Button>
      ) : (
        <>
          {status === 'paused' ? (
            <Button
              variant="success"
              size="md"
              icon={<PlayIcon size={13} />}
              onClick={resumeSession}
              style={{ backgroundColor: 'var(--success)', color: 'white', border: '1px solid transparent', boxShadow: '0 0 16px rgba(16, 185, 129, 0.2)' }}
            >
              Resume
            </Button>
          ) : (
            <Button variant="warning" size="md" icon={<PauseIcon size={13} />} onClick={pauseSession}>
              Pause
            </Button>
          )}
          <Button variant="danger" size="md" icon={<StopIcon size={13} />} onClick={stopSession}>
            Stop
          </Button>
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
