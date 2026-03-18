import type { DetectedQuestion } from './questionDetector'

export interface KnowledgeSnippet {
  id: string
  key: string
  value: string
}

export interface UserProfile {
  targetRole: string
  seniority: string
  industry: string
  resumeText: string
  jobDescription: string
  storyBank: StoryEntry[]
  knowledgeSnippets?: KnowledgeSnippet[]
}

export interface StoryEntry {
  title: string
  situation: string
  task: string
  action: string
  result: string
  tags: string[]
}

const SYSTEM_PROMPT_BASE = `You are an interview coach that helps the user communicate truthfully, clearly, and succinctly.
You help the user practice interviews and provide coaching notes during interviews.
Never suggest deception or misrepresentation.

Output rules:
- Prefer structured, skimmable outputs
- Keep answers concise (30-60 seconds spoken)
- Use bullet points, not paragraphs
- If uncertain, provide best-effort answer with assumptions labeled`

export function buildSystemPrompt(profile: UserProfile | null): string {
  if (!profile) return SYSTEM_PROMPT_BASE

  return `${SYSTEM_PROMPT_BASE}

<user_profile>
<role_target>${profile.targetRole}</role_target>
<seniority>${profile.seniority}</seniority>
<industry>${profile.industry}</industry>

<resume_highlights>
${profile.resumeText}
</resume_highlights>

<job_description>
${profile.jobDescription}
</job_description>

<story_bank>
${profile.storyBank
  .map(
    (s) => `<story title="${s.title}" tags="${s.tags.join(', ')}">
  Situation: ${s.situation}
  Task: ${s.task}
  Action: ${s.action}
  Result: ${s.result}
</story>`
  )
  .join('\n')}
</story_bank>
${
  profile.knowledgeSnippets?.length
    ? `<knowledge_context>
${profile.knowledgeSnippets
  .filter((s) => s.key && s.value)
  .map((s) => `<fact key="${s.key}">${s.value}</fact>`)
  .join('\n')}
</knowledge_context>`
    : ''
}
</user_profile>`
}

export function buildAnswerPrompt(
  question: DetectedQuestion,
  recentContext: string,
  timeBudgetSeconds: number = 45
): string {
  return `<input>
<mode>live_coaching</mode>
<live_context>
<transcript_snippet>${recentContext}</transcript_snippet>
<detected_question>${question.text}</detected_question>
<question_type>${question.type}</question_type>
</live_context>

<constraints>
<time_budget_seconds>${timeBudgetSeconds}</time_budget_seconds>
<format>structured</format>
</constraints>
</input>

<task>
Generate a truthful, role-aligned answer outline that the user can speak naturally.
If the question is unclear, suggest ONE short clarification question.
Also provide 2 optional "supporting details" the user can add if time allows.
Predict 2-3 likely follow-up questions.
</task>`
}

export function buildMockInterviewPrompt(
  targetRole: string,
  focusAreas: string[],
  difficulty: 'easy' | 'medium' | 'hard'
): string {
  return `<mock_interview>
<target_role>${targetRole}</target_role>
<focus_areas>${focusAreas.join(', ')}</focus_areas>
<difficulty>${difficulty}</difficulty>

<rubric>
- clarity (0-5)
- evidence/metrics (0-5)
- structure (0-5)
- authenticity (0-5)
</rubric>

<instructions>
Act as the interviewer. Ask ONE question at a time.
Wait for my answer.
Then score using the rubric and provide 3 concrete improvements + a rewritten "gold" answer.
</instructions>
</mock_interview>`
}

export const ANSWER_TOOL_SCHEMA = {
  name: 'provide_answer',
  description:
    'Provide a structured answer suggestion for the detected interview question',
  input_schema: {
    type: 'object' as const,
    properties: {
      answer_type: {
        type: 'string',
        enum: ['behavioral', 'technical', 'situational', 'general'],
        description: 'The type of interview question'
      },
      clarifying_question: {
        type: 'string',
        description: 'Optional clarifying question if the original question is unclear'
      },
      key_points: {
        type: 'array',
        items: { type: 'string' },
        description: '3-5 bullet points for the answer'
      },
      suggested_answer: {
        type: 'string',
        description: 'Full suggested answer the user could speak'
      },
      follow_up_prep: {
        type: 'array',
        items: { type: 'string' },
        description: '2-3 likely follow-up questions to prepare for'
      },
      relevant_story: {
        type: 'string',
        description: 'Which story from the story bank is most relevant'
      },
      risk_flags: {
        type: 'array',
        items: { type: 'string' },
        description: 'Warnings like overclaiming, missing metrics, etc.'
      }
    },
    required: ['answer_type', 'key_points', 'suggested_answer', 'follow_up_prep']
  }
}
