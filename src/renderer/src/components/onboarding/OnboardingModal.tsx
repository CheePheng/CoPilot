import { useState } from 'react'
import Button from '../ui/Button'
import { ShieldIcon, SparklesIcon, MicrophoneIcon, CheckIcon } from '../ui/Icons'

interface Props {
  onComplete: () => void
}

const steps = [
  {
    title: 'Welcome to CoPilot',
    subtitle: 'Your invisible AI interview assistant',
    Icon: SparklesIcon,
    content: (
      <div className="space-y-3">
        <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: 'var(--success-subtle)' }}>
          <ShieldIcon size={20} className="shrink-0" style={{ color: 'var(--success)' }} />
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--success)' }}>Ghost Mode Active</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Your screen is protected — this app is invisible to screen sharing and recording.
            </p>
          </div>
        </div>
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          CoPilot listens to your interview, detects questions, and provides AI-powered answer suggestions in real-time.
        </p>
      </div>
    )
  },
  {
    title: 'Choose AI Provider',
    subtitle: 'Pick how answers are generated',
    Icon: SparklesIcon,
    content: (
      <div className="space-y-3">
        <div className="p-3 rounded-xl" style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Ollama (Free)</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Runs AI locally on your machine. No API key needed. Install Ollama and pull a model to get started.
          </p>
        </div>
        <div className="p-3 rounded-xl" style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Claude (Paid)</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Uses Anthropic's Claude API. Higher quality answers. Requires an API key.
          </p>
        </div>
        <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
          You can change this anytime in Settings.
        </p>
      </div>
    )
  },
  {
    title: 'Speech Recognition',
    subtitle: 'How your interview is transcribed',
    Icon: MicrophoneIcon,
    content: (
      <div className="space-y-3">
        <div className="p-3 rounded-xl" style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Web Speech (Free)</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Built-in browser speech recognition. Works out of the box with no setup.
          </p>
        </div>
        <div className="p-3 rounded-xl" style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Deepgram (Paid)</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Cloud-based STT with higher accuracy. Requires an API key.
          </p>
        </div>
      </div>
    )
  },
  {
    title: 'Keyboard Shortcuts',
    subtitle: 'Quick access while interviewing',
    Icon: CheckIcon,
    content: (
      <div className="space-y-2">
        {[
          { keys: 'Ctrl+Shift+G', desc: 'Toggle Ghost Mode (screen protection)' },
          { keys: 'Ctrl+Shift+O', desc: 'Toggle Overlay window' },
          { keys: 'Ctrl+Shift+H', desc: 'Panic Hide overlay' }
        ].map((s) => (
          <div key={s.keys} className="flex items-center justify-between p-2.5 rounded-xl" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{s.desc}</span>
            <kbd
              className="text-[10px] font-mono px-2 py-0.5 rounded-lg"
              style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--accent)', border: '1px solid var(--border)' }}
            >
              {s.keys}
            </kbd>
          </div>
        ))}
        <p className="text-xs mt-3" style={{ color: 'var(--success)' }}>
          You're all set! Start an interview session or try the Coding Mode.
        </p>
      </div>
    )
  }
]

export default function OnboardingModal({ onComplete }: Props) {
  const [step, setStep] = useState(0)
  const current = steps[step]
  const isLast = step === steps.length - 1

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)' }}
    >
      <div
        className="glass-panel w-[440px] p-6 animate-fadeIn"
        style={{ boxShadow: '0 0 60px rgba(124, 92, 252, 0.15)' }}
      >
        {/* Progress */}
        <div className="flex gap-1.5 mb-6">
          {steps.map((_, i) => (
            <div
              key={i}
              className="h-1 flex-1 rounded-full transition-all"
              style={{
                background: i <= step ? 'var(--accent-gradient)' : 'var(--bg-elevated)'
              }}
            />
          ))}
        </div>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: 'var(--accent-subtle)', boxShadow: 'var(--shadow-glow)' }}
          >
            <current.Icon size={24} className="gradient-text" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-lg font-semibold text-center mb-1" style={{ color: 'var(--text-primary)' }}>
          {current.title}
        </h2>
        <p className="text-xs text-center mb-5" style={{ color: 'var(--text-muted)' }}>
          {current.subtitle}
        </p>

        {/* Content */}
        <div className="mb-6" key={step}>
          <div className="animate-fadeIn">
            {current.content}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <div>
            {step > 0 && (
              <Button variant="ghost" size="md" onClick={() => setStep(step - 1)}>
                Back
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="md" onClick={onComplete}>
              Skip
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                if (isLast) {
                  onComplete()
                } else {
                  setStep(step + 1)
                }
              }}
            >
              {isLast ? 'Get Started' : 'Next'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
