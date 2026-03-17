import { useState, useEffect, useCallback } from 'react'
import { useSettingsStore } from '../../stores/settingsStore'
import { ShieldIcon, CheckIcon } from '../ui/Icons'

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

  const inputStyle = {
    backgroundColor: 'var(--bg-tertiary)',
    border: '1px solid var(--border)',
    color: 'var(--text-primary)',
    transition: 'all 0.2s ease'
  }

  const providerBtnStyle = (active: boolean) => ({
    background: active ? 'var(--accent-gradient)' : 'var(--bg-tertiary)',
    color: active ? 'white' : 'var(--text-muted)',
    border: active ? '1px solid transparent' : '1px solid var(--border)',
    boxShadow: active ? 'var(--shadow-glow)' : 'none'
  })

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn">
      {/* Ghost Mode Section */}
      <section className="glass-panel p-5">
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
      </section>

      {/* AI Provider */}
      <section className="glass-panel p-5 space-y-4">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          AI Provider
        </h3>

        <div className="flex gap-2">
          <button
            onClick={() => setAIProvider('ollama')}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all"
            style={providerBtnStyle(aiProvider === 'ollama')}
          >
            Ollama (Free)
          </button>
          <button
            onClick={() => setAIProvider('claude')}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all"
            style={providerBtnStyle(aiProvider === 'claude')}
          >
            Claude (API Key)
          </button>
        </div>

        {aiProvider === 'ollama' ? (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Ollama URL
              </label>
              <div className="flex gap-2">
                <input
                  value={localOllamaUrl}
                  onChange={(e) => setLocalOllamaUrl(e.target.value)}
                  placeholder="http://localhost:11434"
                  className="flex-1 px-3 py-2 rounded-xl text-sm"
                  style={inputStyle}
                />
                <button
                  onClick={checkOllama}
                  disabled={ollamaTesting}
                  className="px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-all flex items-center gap-1.5"
                  style={{
                    backgroundColor: ollamaConnected ? 'var(--success-subtle)' : 'var(--bg-elevated)',
                    color: ollamaConnected ? 'var(--success)' : 'var(--text-secondary)',
                    border: `1px solid ${ollamaConnected ? 'rgba(16, 185, 129, 0.2)' : 'var(--border)'}`
                  }}
                >
                  {ollamaTesting ? (
                    <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : ollamaConnected ? (
                    <CheckIcon size={14} />
                  ) : null}
                  {ollamaTesting ? 'Testing' : ollamaConnected ? 'Connected' : 'Test'}
                </button>
              </div>
              {ollamaConnected === false && (
                <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>
                  Cannot connect — make sure Ollama is running
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Model
              </label>
              {ollamaModels.length > 0 ? (
                <select
                  value={ollamaModel}
                  onChange={(e) => setOllamaModel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-sm"
                  style={inputStyle}
                >
                  {ollamaModels.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              ) : (
                <input
                  value={ollamaModel}
                  onChange={(e) => setOllamaModel(e.target.value)}
                  placeholder="llama3.1:8b"
                  className="w-full px-3 py-2 rounded-xl text-sm"
                  style={inputStyle}
                />
              )}
              <p className="text-[11px] mt-1.5" style={{ color: 'var(--text-muted)' }}>
                Run <code className="gradient-text font-medium">ollama pull llama3.1:8b</code> to download
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Anthropic API Key
              </label>
              <input
                type="password"
                value={localAnthropicKey}
                onChange={(e) => setLocalAnthropicKey(e.target.value)}
                placeholder="sk-ant-..."
                className="w-full px-3 py-2 rounded-xl text-sm"
                style={inputStyle}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Model
              </label>
              <select
                value={claudeModel}
                onChange={(e) => setClaudeModel(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-sm"
                style={inputStyle}
              >
                <option value="claude-sonnet-4-20250514">Claude Sonnet 4 (Fastest)</option>
                <option value="claude-opus-4-20250514">Claude Opus 4 (Most capable)</option>
                <option value="claude-haiku-4-5-20251001">Claude Haiku 4.5 (Cheapest)</option>
              </select>
            </div>
          </div>
        )}
      </section>

      {/* STT Provider */}
      <section className="glass-panel p-5 space-y-4">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          Speech-to-Text
        </h3>

        <div className="flex gap-2">
          <button
            onClick={() => setSTTProvider('web-speech')}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all"
            style={providerBtnStyle(sttProvider === 'web-speech')}
          >
            Web Speech (Free)
          </button>
          <button
            onClick={() => setSTTProvider('deepgram')}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all"
            style={providerBtnStyle(sttProvider === 'deepgram')}
          >
            Deepgram (API Key)
          </button>
        </div>

        {sttProvider === 'web-speech' ? (
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Uses built-in browser speech recognition. No API key needed.
          </p>
        ) : (
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Deepgram API Key
            </label>
            <input
              type="password"
              value={localDeepgramKey}
              onChange={(e) => setLocalDeepgramKey(e.target.value)}
              placeholder="Enter your Deepgram API key"
              className="w-full px-3 py-2 rounded-xl text-sm"
              style={inputStyle}
            />
          </div>
        )}
      </section>

      {/* Keyboard Shortcuts */}
      <section className="glass-panel p-5">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
          Keyboard Shortcuts
        </h3>
        <div className="space-y-2">
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
      </section>

      {/* Save */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all"
          style={{
            background: 'var(--accent-gradient)',
            color: 'white',
            boxShadow: 'var(--shadow-glow)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.02)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
          }}
        >
          Save Settings
        </button>
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
