import { useState } from 'react'
import { useProfileStore, type StoryEntry } from '../../stores/profileStore'

const TAG_OPTIONS = [
  'leadership', 'teamwork', 'conflict', 'failure', 'success',
  'technical', 'communication', 'initiative', 'problem-solving',
  'time-management', 'customer-focus', 'innovation'
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
    addStory({
      ...newStory,
      id: `story-${Date.now()}`
    })
    setNewStory({ title: '', situation: '', task: '', action: '', result: '', tags: [] })
    setIsAdding(false)
  }

  const toggleTag = (tag: string) => {
    setNewStory((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag]
    }))
  }

  const inputStyle = {
    backgroundColor: 'var(--bg-tertiary)',
    border: '1px solid var(--border)',
    color: 'var(--text-primary)'
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
          STAR Story Bank ({profile.storyBank.length})
        </h3>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-3 py-1 rounded-lg text-xs font-medium cursor-pointer"
            style={{ backgroundColor: 'var(--accent)', color: 'white' }}
          >
            + Add Story
          </button>
        )}
      </div>

      {/* Add form */}
      {isAdding && (
        <div
          className="rounded-xl p-4 space-y-3"
          style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
        >
          <input
            value={newStory.title}
            onChange={(e) => setNewStory((p) => ({ ...p, title: e.target.value }))}
            placeholder="Story title (e.g., 'Led migration to microservices')"
            className="w-full px-3 py-2 rounded-lg text-sm"
            style={inputStyle}
          />
          <textarea
            value={newStory.situation}
            onChange={(e) => setNewStory((p) => ({ ...p, situation: e.target.value }))}
            placeholder="Situation: What was the context?"
            rows={2}
            className="w-full px-3 py-2 rounded-lg text-sm resize-y"
            style={inputStyle}
          />
          <textarea
            value={newStory.task}
            onChange={(e) => setNewStory((p) => ({ ...p, task: e.target.value }))}
            placeholder="Task: What was your responsibility?"
            rows={2}
            className="w-full px-3 py-2 rounded-lg text-sm resize-y"
            style={inputStyle}
          />
          <textarea
            value={newStory.action}
            onChange={(e) => setNewStory((p) => ({ ...p, action: e.target.value }))}
            placeholder="Action: What did you do?"
            rows={2}
            className="w-full px-3 py-2 rounded-lg text-sm resize-y"
            style={inputStyle}
          />
          <textarea
            value={newStory.result}
            onChange={(e) => setNewStory((p) => ({ ...p, result: e.target.value }))}
            placeholder="Result: What was the outcome? Include metrics."
            rows={2}
            className="w-full px-3 py-2 rounded-lg text-sm resize-y"
            style={inputStyle}
          />

          {/* Tags */}
          <div>
            <label className="block text-xs mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Tags
            </label>
            <div className="flex flex-wrap gap-1.5">
              {TAG_OPTIONS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className="px-2 py-0.5 rounded text-xs cursor-pointer transition-colors"
                  style={{
                    backgroundColor: newStory.tags.includes(tag)
                      ? 'var(--accent)'
                      : 'var(--bg-tertiary)',
                    color: newStory.tags.includes(tag) ? 'white' : 'var(--text-secondary)',
                    border: '1px solid var(--border)'
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              className="px-4 py-1.5 rounded-lg text-sm font-medium cursor-pointer"
              style={{ backgroundColor: 'var(--accent)', color: 'white' }}
            >
              Save Story
            </button>
            <button
              onClick={() => setIsAdding(false)}
              className="px-4 py-1.5 rounded-lg text-sm font-medium cursor-pointer"
              style={{ color: 'var(--text-secondary)' }}
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
            className="rounded-xl p-4"
            style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                {story.title}
              </h4>
              <button
                onClick={() => removeStory(story.id)}
                className="text-xs px-2 py-0.5 rounded cursor-pointer"
                style={{ color: 'var(--danger)' }}
              >
                Remove
              </button>
            </div>

            <div className="space-y-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
              <p><strong>S:</strong> {story.situation}</p>
              <p><strong>T:</strong> {story.task}</p>
              <p><strong>A:</strong> {story.action}</p>
              <p><strong>R:</strong> {story.result}</p>
            </div>

            {story.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {story.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-1.5 py-0.5 rounded text-xs"
                    style={{
                      backgroundColor: 'rgba(99, 102, 241, 0.1)',
                      color: 'var(--accent)'
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}

        {profile.storyBank.length === 0 && !isAdding && (
          <p className="text-sm text-center py-4" style={{ color: 'var(--text-secondary)' }}>
            No stories yet. Add your STAR stories to help AI give personalized suggestions.
          </p>
        )}
      </div>
    </section>
  )
}
