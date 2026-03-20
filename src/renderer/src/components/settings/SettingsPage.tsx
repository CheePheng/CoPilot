import { useState, useEffect, useCallback } from 'react'
import { useSettingsStore } from '../../stores/settingsStore'
import { ShieldIcon, CheckIcon } from '../ui/Icons'
import Button from '../ui/Button'
import Card, { SectionHeader } from '../ui/Card'
import { TextInput, SelectInput } from '../ui/Input'

export default function SettingsPage() {
  const {
    aiProvider, sttProvider, ghostMode,
    anthropicKey, deepgramKey,
    ollamaUrl, ollamaModel, claudeModel,
    setAIProvider, setSTTProvider, setGhostMode,
    setAnthropicKey, setDeepgramKey,
    setOllamaUrl, setOllamaModel, setClaudeModel
  } = useSettingsStore()

  const [localAnthropicKey, setLocalAnthropicKey] = useState(anthropicKey)
  const [localDeepgramKey, setLocalDeepgramKey] = useState(deepgramKey)
  const [localOllamaUrl, setLocalOllamaUrl] = useState(ollamaUrl)
  const [ollamaModels, setOllamaModels] = useState<string[]>([])
  const [ollamaConnected, setOllamaConnected] = useState<boolean | null>(null)
  const [ollamaTesting, setOllamaTesting] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setLocalAnthropicKey(anthropicKey)
    setLocalDeepgramKey(deepgramKey)
    setLocalOllamaUrl(ollamaUrl)
  }, [anthropicKey, deepgramKey, ollamaUrl])

  const checkOllama = useCallback(async () => {
    setOllamaTesting(true)
    const connected = await window.copilot?.ollama?.checkConnection?.()
    setOllamaConnected(connected ?? false)
    if (connected) {
      const models = await window.copilot?.ollama?.listModels?.()
      setOllamaModels(models ?? [])
    }
    setOllamaTesting(false)
  }, [])

  useEffect(() => {
    if (aiProvider === 'ollama') {
      checkOllama()
    }
  }, [aiProvider, checkOllama])

  const handleSave = useCallback(async () => {
    setAIProvider(aiProvider)
    setSTTProvider(sttProvider)
    await window.copilot?.ai?.setProvider?.(aiProvider)
    await window.copilot?.stt?.setProvider?.(sttProvider)

    if (aiProvider === 'ollama') {
      setOllamaUrl(localOllamaUrl)
      await window.copilot?.ollama?.setUrl?.(localOllamaUrl)
      await window.copilot?.ai?.setModel?.(ollamaModel)
    } else {
      setAnthropicKey(localAnthropicKey)
      await window.copilot?.ai?.setApiKey?.(localAnthropicKey)
      await window.copilot?.ai?.setModel?.(claudeModel)
    }

    if (sttProvider === 'deepgram') {
      setDeepgramKey(localDeepgramKey)
      await window.copilot?.stt?.setApiKey?.(localDeepgramKey)
    }

    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }, [
    aiProvider, sttProvider, localAnthropicKey, localDeepgramKey,
    localOllamaUrl, ollamaModel, claudeModel,
    setAIProvider, setSTTProvider, setAnthropicKey, setDeepgramKey, setOllamaUrl
  ])

  const toggleGhost = async () => {
    const result = await window.copilot?.ghost?.toggle?.()
    setGhostMode(result)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn">
      {/* Ghost Mode Section */}
      <Card padding="lg" className="animate-slideIn stagger-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: ghostMode ? 'var(--success-subtle)' : 'var(--bg-tertiary)',
                color: ghostMode ? 'var(--success)' : 'var(--text-muted)'
              }}
            >
              <ShieldIcon size={20} />
            </div>
            <div>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                Ghost Mode
              </h3>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Invisible to screen sharing & recording
              </p>
            </div>
          </div>
          <button
            onClick={toggleGhost}
            role="switch"
            aria-checked={ghostMode}
            aria-label="Toggle ghost mode"
            className="relative w-11 h-6 rounded-full cursor-pointer transition-all"
            style={{
              backgroundColor: ghostMode ? 'var(--success)' : 'var(--bg-elevated)',
              boxShadow: ghostMode ? '0 0 12px rgba(16, 185, 129, 0.3)' : 'none'
            }}
          >
            <span
              className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all shadow-md"
              style={{ left: ghostMode ? '22px' : '2px' }}
            />
          </button>
        </div>
        <p className="text-[11px] mt-3" style={{ color: 'var(--text-muted)' }}>
          Shortcut: Ctrl+Shift+G
        </p>
      </Card>

      {/* AI Provider */}
      <Card padding="lg" className="animate-slideIn stagger-2">
        <div className="space-y-4">
          <SectionHeader>AI Provider</SectionHeader>

          <div className="flex gap-2">
            <Button
              variant={aiProvider === 'ollama' ? 'primary' : 'secondary'}
              size="md"
              onClick={() => setAIProvider('ollama')}
            >
              Ollama (Free)
            </Button>
            <Button
              variant={aiProvider === 'claude' ? 'primary' : 'secondary'}
              size="md"
              onClick={() => setAIProvider('claude')}
            >
              Claude (API Key)
            </Button>
          </div>

          {aiProvider === 'ollama' ? (
            <div className="space-y-3">
              <div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <TextInput
                      label="Ollama URL"
                      value={localOllamaUrl}
                      onChange={(e) => setLocalOllamaUrl(e.target.value)}
                      placeholder="http://localhost:11434"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      variant={ollamaConnected ? 'success' : 'secondary'}
                      size="md"
                      loading={ollamaTesting}
                      icon={ollamaConnected ? <CheckIcon size={14} /> : undefined}
                      onClick={checkOllama}
                    >
                      {ollamaTesting ? 'Testing' : ollamaConnected ? 'Connected' : 'Test'}
                    </Button>
                  </div>
                </div>
                {ollamaConnected === false && (
                  <p className="text-xs mt-1 flex items-center gap-2" style={{ color: 'var(--danger)' }}>
                    Cannot connect — make sure Ollama is running
                    <button
                      onClick={checkOllama}
                      className="underline cursor-pointer"
                      style={{ color: 'var(--danger)' }}
                    >
                      Retry
                    </button>
                  </p>
                )}
              </div>

              {ollamaModels.length > 0 ? (
                <SelectInput
                  label="Model"
                  value={ollamaModel}
                  onChange={(e) => setOllamaModel(e.target.value)}
                  options={ollamaModels.map((m) => ({ value: m, label: m }))}
                />
              ) : (
                <TextInput
                  label="Model"
                  value={ollamaModel}
                  onChange={(e) => setOllamaModel(e.target.value)}
                  placeholder="llama3.1:8b"
                  hint={<>Run <code className="gradient-text font-medium">ollama pull llama3.1:8b</code> to download</>}
                />
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <TextInput
                label="Anthropic API Key"
                type="password"
                value={localAnthropicKey}
                onChange={(e) => setLocalAnthropicKey(e.target.value)}
                placeholder="sk-ant-..."
              />
              <SelectInput
                label="Model"
                value={claudeModel}
                onChange={(e) => setClaudeModel(e.target.value)}
                options={[
                  { value: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4 (Fastest)' },
                  { value: 'claude-opus-4-20250514', label: 'Claude Opus 4 (Most capable)' },
                  { value: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5 (Cheapest)' }
                ]}
              />
            </div>
          )}
        </div>
      </Card>

      {/* STT Provider */}
      <Card padding="lg" className="animate-slideIn stagger-3">
        <div className="space-y-4">
          <SectionHeader>Speech-to-Text</SectionHeader>

          <div className="flex gap-2">
            <Button
              variant={sttProvider === 'web-speech' ? 'primary' : 'secondary'}
              size="md"
              onClick={() => setSTTProvider('web-speech')}
            >
              Web Speech (Free)
            </Button>
            <Button
              variant={sttProvider === 'deepgram' ? 'primary' : 'secondary'}
              size="md"
              onClick={() => setSTTProvider('deepgram')}
            >
              Deepgram (API Key)
            </Button>
          </div>

          {sttProvider === 'web-speech' ? (
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Uses built-in browser speech recognition. No API key needed.
            </p>
          ) : (
            <TextInput
              label="Deepgram API Key"
              type="password"
              value={localDeepgramKey}
              onChange={(e) => setLocalDeepgramKey(e.target.value)}
              placeholder="Enter your Deepgram API key"
            />
          )}
        </div>
      </Card>

      {/* Keyboard Shortcuts */}
      <Card padding="lg" className="animate-slideIn stagger-4">
        <SectionHeader>Keyboard Shortcuts</SectionHeader>
        <div className="space-y-2 mt-3">
          {[
            { keys: 'Ctrl+Shift+G', desc: 'Toggle Ghost Mode' },
            { keys: 'Ctrl+Shift+O', desc: 'Toggle Overlay' },
            { keys: 'Ctrl+Shift+H', desc: 'Hide Overlay (Panic)' }
          ].map((s) => (
            <div key={s.keys} className="flex items-center justify-between">
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{s.desc}</span>
              <kbd
                className="text-[10px] font-mono px-2 py-0.5 rounded-lg"
                style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
              >
                {s.keys}
              </kbd>
            </div>
          ))}
        </div>
      </Card>

      {/* Save */}
      <div className="flex items-center gap-3">
        <Button variant="primary" size="lg" onClick={handleSave}>
          Save Settings
        </Button>
        {saved && (
          <span className="text-xs font-medium flex items-center gap-1" style={{ color: 'var(--success)' }}>
            <CheckIcon size={14} />
            Saved
          </span>
        )}
      </div>
    </div>
  )
}
