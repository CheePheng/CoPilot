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
    color: 'var(--text-primary)'
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
          Interview Profile
        </h2>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Set up your profile to personalize AI suggestions during interviews.
        </p>
      </div>

      {/* Role Info */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
          Target Role
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Role Title
            </label>
            <input
              value={profile.targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g., Senior Software Engineer"
              className="w-full px-3 py-2 rounded-lg text-sm"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="block text-sm mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Seniority
            </label>
            <select
              value={profile.seniority}
              onChange={(e) => setSeniority(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm"
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
            <label className="block text-sm mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Industry
            </label>
            <input
              value={profile.industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="e.g., FinTech, SaaS"
              className="w-full px-3 py-2 rounded-lg text-sm"
              style={inputStyle}
            />
          </div>
        </div>
      </section>

      {/* Resume */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
          Resume
        </h3>
        <textarea
          value={profile.resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          placeholder="Paste your resume text here, or upload a file above. Include key experiences, skills, and achievements."
          rows={8}
          className="w-full px-3 py-2 rounded-lg text-sm resize-y"
          style={inputStyle}
        />
      </section>

      {/* Job Description */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
          Job Description
        </h3>
        <textarea
          value={profile.jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the job description for the role you're interviewing for."
          rows={6}
          className="w-full px-3 py-2 rounded-lg text-sm resize-y"
          style={inputStyle}
        />
      </section>

      {/* STAR Stories */}
      <StoryBank />
    </div>
  )
}
