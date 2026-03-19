import { useState } from 'react'
import { useProfileStore, type StoryEntry } from '../../stores/profileStore'
import { TextInput, TextArea } from '../ui/Input'

const TAG_OPTIONS = [
  'leadership', 'teamwork', 'conflict', 'failure', 'success',
  'technical', 'communication', 'initiative', 'problem-solving',
  'time-management', 'customer-focus', 'innovation'
]

const STAR_LABELS = [
  { key: 'situation', label: 'S', color: '#6366f1' },
  { key: 'task', label: 'T', color: '#8b5cf6' },
  { key: 'action', label: 'A', color: '#a855f7' },
  { key: 'result', label: 'R', color: '#c084fc' }
]

export default function StoryBank() {
  const { profile, addStory, removeStory } = useProfileStore()
  const [isAdding, setIsAdding] = useState(false)
  const [newStory, setNewStory] = useState<Omit<StoryEntry, 'id'>>({
    title: '',
    situation: '',
    task: '',
    action: '',
    result: '',
    tags: []
  })

  const handleAdd = () => {
    if (!newStory.title.trim()) return
    addStory({ ...newStory, id: crypto.randomUUID() })
    setNewStory({ title: '', situation: '', task: '', action: '', result: '', tags: [] })
    setIsAdding(false)
  }

  const toggleTag = (tag: string) => {
    setNewStory((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag]
    }))
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          STAR Story Bank ({profile.storyBank.length})
        </h3>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all"
            style={{ background: 'var(--accent-gradient)', color: 'white', boxShadow: 'var(--shadow-glow)' }}
          >
            + Add Story
          </button>
        )}
      </div>

      {/* Add form */}
      {isAdding && (
        <div className="glass-panel p-5 space-y-3 animate-slideUp">
          <TextInput
            value={newStory.title}
            onChange={(e) => setNewStory((p) => ({ ...p, title: e.target.value }))}
            placeholder="Story title (e.g., 'Led migration to microservices')"
          />
          {(['situation', 'task', 'action', 'result'] as const).map((field) => (
            <TextArea
              key={field}
              value={newStory[field]}
              onChange={(e) => setNewStory((p) => ({ ...p, [field]: e.target.value }))}
              placeholder={`${field.charAt(0).toUpperCase() + field.slice(1)}: ${
                field === 'situation' ? 'What was the context?' :
                field === 'task' ? 'What was your responsibility?' :
                field === 'action' ? 'What did you do?' :
                'What was the outcome? Include metrics.'
              }`}
              rows={2}
              className="resize-y"
            />
          ))}

          {/* Tags */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Tags
            </label>
            <div className="flex flex-wrap gap-1.5">
              {TAG_OPTIONS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] cursor-pointer transition-all font-medium pill-toggle${newStory.tags.includes(tag) ? ' pill-toggle-active' : ''}`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              className="px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer"
              style={{ background: 'var(--accent-gradient)', color: 'white' }}
            >
              Save Story
            </button>
            <button
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 rounded-xl text-sm font-medium cursor-pointer"
              style={{ color: 'var(--text-muted)' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Story list */}
      <div className="space-y-3">
        {profile.storyBank.map((story) => (
          <div
            key={story.id}
            className="glass-panel story-card p-4"
            style={{ cursor: 'default' }}
          >
            <div className="flex items-start justify-between mb-3">
              <h4 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                {story.title}
              </h4>
              <button
                onClick={() => removeStory(story.id)}
                className="text-[11px] px-2 py-0.5 rounded-lg cursor-pointer transition-colors"
                style={{ color: 'var(--danger)', backgroundColor: 'var(--danger-subtle)' }}
              >
                Remove
              </button>
            </div>

            <div className="space-y-2">
              {STAR_LABELS.map(({ key, label, color }) => {
                const value = story[key as keyof typeof story] as string
                if (!value) return null
                return (
                  <div key={key} className="flex items-start gap-2 text-xs">
                    <span
                      className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0"
                      style={{ backgroundColor: `${color}20`, color }}
                    >
                      {label}
                    </span>
                    <span style={{ color: 'var(--text-secondary)' }}>{value}</span>
                  </div>
                )
              })}
            </div>

            {story.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {story.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-md text-[10px] font-medium"
                    style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent)' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}

        {profile.storyBank.length === 0 && !isAdding && (
          <div className="text-center py-8">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              No stories yet. Add STAR stories to personalize AI suggestions.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
