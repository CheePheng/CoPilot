import { useProfileStore } from '../../stores/profileStore'
import StoryBank from './StoryBank'

export default function ProfilePage() {
  const {
    profile,
    setTargetRole,
    setSeniority,
    setIndustry,
    setResumeText,
    setJobDescription
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

      {/* STAR Stories */}
      <StoryBank />
    </div>
  )
}
