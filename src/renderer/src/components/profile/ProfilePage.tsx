import { useProfileStore, type KnowledgeSnippet } from '../../stores/profileStore'
import StoryBank from './StoryBank'
import Button from '../ui/Button'
import { LightbulbIcon } from '../ui/Icons'

export default function ProfilePage() {
  const {
    profile,
    setTargetRole,
    setSeniority,
    setIndustry,
    setResumeText,
    setJobDescription,
    addKnowledgeSnippet,
    updateKnowledgeSnippet,
    removeKnowledgeSnippet
  } = useProfileStore()

  const inputStyle = {
    backgroundColor: 'var(--bg-tertiary)',
    border: '1px solid var(--border)',
    color: 'var(--text-primary)',
    transition: 'all 0.2s ease'
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fadeIn">
      {/* Role Info */}
      <section className="glass-panel p-5 space-y-4">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          Target Role
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Role Title
            </label>
            <input
              value={profile.targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g., Senior Software Engineer"
              className="w-full px-3 py-2 rounded-xl text-sm"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Seniority
            </label>
            <select
              value={profile.seniority}
              onChange={(e) => setSeniority(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-sm"
              style={inputStyle}
            >
              <option value="">Select...</option>
              <option value="junior">Junior / Entry-level</option>
              <option value="mid">Mid-level</option>
              <option value="senior">Senior</option>
              <option value="staff">Staff / Principal</option>
              <option value="manager">Manager / Director</option>
              <option value="executive">VP / Executive</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Industry
            </label>
            <input
              value={profile.industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="e.g., FinTech, SaaS"
              className="w-full px-3 py-2 rounded-xl text-sm"
              style={inputStyle}
            />
          </div>
        </div>
      </section>

      {/* Resume */}
      <section className="glass-panel p-5 space-y-3">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          Resume
        </h3>
        <textarea
          value={profile.resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          placeholder="Paste your resume text here. Include key experiences, skills, and achievements."
          rows={8}
          className="w-full px-3 py-2 rounded-xl text-sm resize-y"
          style={inputStyle}
        />
      </section>

      {/* Job Description */}
      <section className="glass-panel p-5 space-y-3">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          Job Description
        </h3>
        <textarea
          value={profile.jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the job description for the role you're interviewing for."
          rows={6}
          className="w-full px-3 py-2 rounded-xl text-sm resize-y"
          style={inputStyle}
        />
      </section>

      {/* Knowledge Snippets */}
      <section className="glass-panel p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LightbulbIcon size={14} className="gradient-text" />
            <h3 className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Knowledge Context
            </h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              addKnowledgeSnippet({
                id: Date.now().toString(),
                key: '',
                value: ''
              })
            }
          >
            + Add
          </Button>
        </div>
        <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
          Add key facts about yourself that the AI should reference during interviews and coding.
        </p>
        {profile.knowledgeSnippets.map((snippet) => (
          <div key={snippet.id} className="flex gap-2 items-start">
            <input
              value={snippet.key}
              onChange={(e) => updateKnowledgeSnippet(snippet.id, { key: e.target.value })}
              placeholder="e.g., Current project"
              className="w-[160px] px-3 py-2 rounded-xl text-sm"
              style={inputStyle}
            />
            <input
              value={snippet.value}
              onChange={(e) => updateKnowledgeSnippet(snippet.id, { value: e.target.value })}
              placeholder="e.g., Building a React dashboard with GraphQL"
              className="flex-1 px-3 py-2 rounded-xl text-sm"
              style={inputStyle}
            />
            <button
              onClick={() => removeKnowledgeSnippet(snippet.id)}
              className="px-2 py-2 rounded-lg text-xs cursor-pointer transition-all"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--danger)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)' }}
            >
              x
            </button>
          </div>
        ))}
      </section>

      {/* STAR Stories */}
      <StoryBank />
    </div>
  )
}
