import { useState, useEffect, useCallback } from 'react'
import { useSettingsStore } from '../../stores/settingsStore'
import type { AIProviderType, STTProviderType } from '../../types/ipc'

export default function SettingsPage() {
  const {
    aiProvider, sttProvider,
    anthropicKey, deepgramKey,
    ollamaUrl, ollamaModel, claudeModel,
    setAIProvider, setSTTProvider,
    setAnthropicKey, setDeepgramKey,
    setOllamaUrl, setOllamaModel, setClaudeModel
  } = useSettingsStore()

  const [localAnthropicKey, setLocalAnthropicKey] = useState(anthropicKey)
  const [localDeepgramKey, setLocalDeepgramKey] = useState(deepgramKey)
  const [localOllamaUrl, setLocalOllamaUrl] = useState(ollamaUrl)
  const [ollamaModels, setOllamaModels] = useState<string[]>([])
  const [ollamaConnected, setOllamaConnected] = useState<boolean | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setLocalAnthropicKey(anthropicKey)
    setLocalDeepgramKey(deepgramKey)
    setLocalOllamaUrl(ollamaUrl)
  }, [anthropicKey, deepgramKey, ollamaUrl])

  // Check Ollama connection and list models
  const checkOllama = useCallback(async () => {
    const connected = await window.copilot?.ollama?.checkConnection?.()
    setOllamaConnected(connected ?? false)
    if (connected) {
      const models = await window.copilot?.ollama?.listModels?.()
      setOllamaModels(models ?? [])
    }
  }, [])

  useEffect(() => {
    if (aiProvider === 'ollama') {
      checkOllama()
    }
  }, [aiProvider, checkOllama])

  const handleSave = useCallback(async () => {
    // Save provider selections
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

  const inputStyle = {
    backgroundColor: 'var(--bg-tertiary)',
    border: '1px solid var(--border)',
    color: 'var(--text-primary)'
  }

  const providerBtnStyle = (active: boolean) => ({
    backgroundColor: active ? 'var(--accent)' : 'var(--bg-tertiary)',
    color: active ? 'white' : 'var(--text-secondary)',
    border: '1px solid var(--border)'
  })

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
          Settings
        </h2>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Default providers are free — no API keys needed.
        </p>
      </div>

      {/* AI Provider */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
          AI Provider
        </h3>

        <div className="flex gap-2">
          <button
            onClick={() => setAIProvider('ollama')}
            className="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer"
            style={providerBtnStyle(aiProvider === 'ollama')}
          >
            Ollama (Free, Local)
          </button>
          <button
            onClick={() => setAIProvider('claude')}
            className="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer"
            style={providerBtnStyle(aiProvider === 'claude')}
          >
            Claude (API Key)
          </button>
        </div>

        {aiProvider === 'ollama' ? (
          <div className="space-y-3">
            <div>
              <label className="block text-sm mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Ollama URL
              </label>
              <div className="flex gap-2">
                <input
                  value={localOllamaUrl}
                  onChange={(e) => setLocalOllamaUrl(e.target.value)}
                  placeholder="http://localhost:11434"
                  className="flex-1 px-3 py-2 rounded-lg text-sm"
                  style={inputStyle}
                />
                <button
                  onClick={checkOllama}
                  className="px-3 py-2 rounded-lg text-sm cursor-pointer"
                  style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
                >
                  Test
                </button>
              </div>
              {ollamaConnected !== null && (
                <p className="text-xs mt-1" style={{ color: ollamaConnected ? 'var(--success)' : 'var(--danger)' }}>
                  {ollamaConnected ? 'Connected to Ollama' : 'Cannot connect — make sure Ollama is running'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Model
              </label>
              {ollamaModels.length > 0 ? (
                <select
                  value={ollamaModel}
                  onChange={(e) => setOllamaModel(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm"
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
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={inputStyle}
                />
              )}
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                Run <code style={{ color: 'var(--accent)' }}>ollama pull llama3.1:8b</code> to download a model
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-sm mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Anthropic API Key
              </label>
              <input
                type="password"
                value={localAnthropicKey}
                onChange={(e) => setLocalAnthropicKey(e.target.value)}
                placeholder="sk-ant-..."
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={inputStyle}
              />
            </div>
            <div>
              <label className="block text-sm mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Model
              </label>
              <select
                value={claudeModel}
                onChange={(e) => setClaudeModel(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm"
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
      <section className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
          Speech-to-Text Provider
        </h3>

        <div className="flex gap-2">
          <button
            onClick={() => setSTTProvider('web-speech')}
            className="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer"
            style={providerBtnStyle(sttProvider === 'web-speech')}
          >
            Web Speech API (Free)
          </button>
          <button
            onClick={() => setSTTProvider('deepgram')}
            className="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer"
            style={providerBtnStyle(sttProvider === 'deepgram')}
          >
            Deepgram (API Key)
          </button>
        </div>

        {sttProvider === 'web-speech' ? (
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Uses your browser's built-in speech recognition. No API key needed. Works best in English.
          </p>
        ) : (
          <div>
            <label className="block text-sm mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Deepgram API Key
            </label>
            <input
              type="password"
              value={localDeepgramKey}
              onChange={(e) => setLocalDeepgramKey(e.target.value)}
              placeholder="Enter your Deepgram API key"
              className="w-full px-3 py-2 rounded-lg text-sm"
              style={inputStyle}
            />
          </div>
        )}
      </section>

      {/* Save */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          className="px-6 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
          style={{ backgroundColor: 'var(--accent)', color: 'white' }}
        >
          Save Settings
        </button>
        {saved && (
          <span className="text-sm" style={{ color: 'var(--success)' }}>
            Settings saved!
          </span>
        )}
      </div>
    </div>
  )
}
