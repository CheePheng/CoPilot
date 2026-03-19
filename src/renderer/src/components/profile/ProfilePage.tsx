import { useProfileStore } from '../../stores/profileStore'
import StoryBank from './StoryBank'
import Button from '../ui/Button'
import { TextInput, TextArea, SelectInput } from '../ui/Input'
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

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fadeIn">
      {/* Role Info */}
      <section className="glass-panel p-5 space-y-4">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          Target Role
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <TextInput
            label="Role Title"
            value={profile.targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="e.g., Senior Software Engineer"
          />
          <SelectInput
            label="Seniority"
            value={profile.seniority}
            onChange={(e) => setSeniority(e.target.value)}
            options={[
              { value: '', label: 'Select...' },
              { value: 'junior', label: 'Junior / Entry-level' },
              { value: 'mid', label: 'Mid-level' },
              { value: 'senior', label: 'Senior' },
              { value: 'staff', label: 'Staff / Principal' },
              { value: 'manager', label: 'Manager / Director' },
              { value: 'executive', label: 'VP / Executive' }
            ]}
          />
          <TextInput
            label="Industry"
            value={profile.industry}
            onChange={(e) => setIndustry(e.target.value)}
            placeholder="e.g., FinTech, SaaS"
          />
        </div>
      </section>

      {/* Resume */}
      <section className="glass-panel p-5 space-y-3">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          Resume
        </h3>
        <TextArea
          value={profile.resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          placeholder="Paste your resume text here. Include key experiences, skills, and achievements."
          rows={8}
          className="resize-y"
        />
      </section>

      {/* Job Description */}
      <section className="glass-panel p-5 space-y-3">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          Job Description
        </h3>
        <TextArea
          value={profile.jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the job description for the role you're interviewing for."
          rows={6}
          className="resize-y"
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
                id: crypto.randomUUID(),
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
            <div className="w-[160px]">
              <TextInput
                value={snippet.key}
                onChange={(e) => updateKnowledgeSnippet(snippet.id, { key: e.target.value })}
                placeholder="e.g., Current project"
              />
            </div>
            <div className="flex-1">
              <TextInput
                value={snippet.value}
                onChange={(e) => updateKnowledgeSnippet(snippet.id, { value: e.target.value })}
                placeholder="e.g., Building a React dashboard with GraphQL"
              />
            </div>
            <button
              onClick={() => removeKnowledgeSnippet(snippet.id)}
              className="snippet-remove px-2 py-2 rounded-lg text-xs cursor-pointer mt-0.5"
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
