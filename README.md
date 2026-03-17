# CoPilot - AI Interview Assistant

Real-time AI-powered interview copilot with live transcription, question detection, and answer suggestions.

## Quick Start (VS Code)

1. **Open the project** in VS Code: `File > Open Folder > select CoPilot`
2. **Open terminal**: Press `` Ctrl+` `` (backtick key)
3. **Install dependencies** (first time only):
   ```
   npm install
   ```
4. **Install Ollama** (free AI, one-time setup):
   - Download from https://ollama.com and install
   - Pull a model:
     ```
     ollama pull llama3.1:8b
     ```
   - Make sure Ollama is running (it starts automatically after install)
5. **Run the app**:
   ```
   npm run dev
   ```

The app launches with two windows:
- **Main window** — transcript, answer suggestions, profile, settings
- **Overlay** — floating always-on-top panel with real-time answers

## Free vs Paid Providers

| Feature | Free (Default) | Paid (Optional) |
|---------|---------------|-----------------|
| **AI Answers** | Ollama (local, unlimited) | Claude API (~$0.39/session) |
| **Speech-to-Text** | Web Speech API (built-in) | Deepgram (~$0.46/hr) |

The app works completely free with Ollama + Web Speech API. No API keys needed.

To use paid providers, go to Settings and switch providers + enter your API keys.

## Keyboard Shortcuts

- `Ctrl+Shift+O` — Toggle overlay
- `Ctrl+Shift+H` — Quick hide overlay

## Tech Stack

- Electron + React + TypeScript
- Tailwind CSS + Zustand
- Ollama / Claude API (AI)
- Web Speech API / Deepgram (STT)
