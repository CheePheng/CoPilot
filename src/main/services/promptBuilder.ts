import type { DetectedQuestion } from './questionDetector'

// Task 16: Strip prompt injection patterns from user-supplied text
export function sanitizeProfileData(text: string): string {
  return text
    .replace(/<\/?system>/gi, '')
    .replace(/IGNORE\s+PREVIOUS/gi, '')
    .replace(/DISREGARD/gi, '')
    .replace(/FORGET/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\[\s*INST\s*\]/gi, '')
    .replace(/\[\s*\/INST\s*\]/gi, '')
}

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

  // Task 16: sanitize all user-supplied string fields before injection
  const safeTargetRole = sanitizeProfileData(profile.targetRole)
  const safeSeniority = sanitizeProfileData(profile.seniority)
  const safeIndustry = sanitizeProfileData(profile.industry)
  const safeResumeText = sanitizeProfileData(profile.resumeText)
  const safeJobDescription = sanitizeProfileData(profile.jobDescription)

  return `${SYSTEM_PROMPT_BASE}

<user_profile>
<role_target>${safeTargetRole}</role_target>
<seniority>${safeSeniority}</seniority>
<industry>${safeIndustry}</industry>

<resume_highlights>
${safeResumeText}
</resume_highlights>

<job_description>
${safeJobDescription}
</job_description>

<story_bank>
${profile.storyBank
  .map(
    (s) => `<story title="${sanitizeProfileData(s.title)}" tags="${s.tags.map(sanitizeProfileData).join(', ')}">
  Situation: ${sanitizeProfileData(s.situation)}
  Task: ${sanitizeProfileData(s.task)}
  Action: ${sanitizeProfileData(s.action)}
  Result: ${sanitizeProfileData(s.result)}
</story>`
  )
  .join('\n')}
</story_bank>
${
  profile.knowledgeSnippets?.length
    ? `<knowledge_context>
${profile.knowledgeSnippets
  .filter((s) => s.key && s.value)
  .map((s) => `<fact key="${sanitizeProfileData(s.key)}">${sanitizeProfileData(s.value)}</fact>`)
  .join('\n')}
</knowledge_context>`
    : ''
}
</user_profile>`
}

export function buildAnswerPrompt(
  question: DetectedQuestion,
  recentContext: string,
  timeBudgetSeconds: number = 45,
  sessionContextSummary?: string
): string {
  const contextBlock = sessionContextSummary
    ? `\n<session_context>\n${sessionContextSummary}\n</session_context>\n\nUse the session context to build on previous discussion. Don't repeat topics already covered. Reference earlier answers when relevant.`
    : ''

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
${contextBlock}
<task>
Generate a truthful, role-aligned answer outline that the user can speak naturally.
If the question is unclear, suggest ONE short clarification question.
Also provide 2 optional "supporting details" the user can add if time allows.
Predict 2-3 likely follow-up questions.
Include a "confidence" field at the end of your response indicating how confident this answer is: high, medium, or low.
Format: [confidence: high] or [confidence: medium] or [confidence: low]
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

export function buildMockQuestionPrompt(
  targetRole: string,
  focusAreas: string[],
  difficulty: 'easy' | 'medium' | 'hard',
  previousQuestions: string[]
): string {
  const avoidList = previousQuestions.length > 0
    ? `\n<avoid_repeats>\n${previousQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}\n</avoid_repeats>`
    : ''

  return `<mock_question_generation>
<target_role>${targetRole || 'Software Engineer'}</target_role>
<focus_areas>${focusAreas.join(', ') || 'behavioral'}</focus_areas>
<difficulty>${difficulty}</difficulty>
${avoidList}

<instructions>
Generate ONE interview question for the target role.
- Match the difficulty level
- Focus on the specified areas
- Do NOT repeat any previously asked questions
- Output ONLY the question text, nothing else — no preamble, no quotes, no numbering
</instructions>
</mock_question_generation>`
}

export function buildMockEvaluationPrompt(
  question: string,
  answer: string,
  targetRole: string
): string {
  return `<mock_evaluation>
<target_role>${targetRole || 'Software Engineer'}</target_role>
<question>${question}</question>
<candidate_answer>${answer}</candidate_answer>

<rubric>
Score each dimension 0-10:
- clarity: How clear and understandable is the answer?
- evidence: Does the answer use specific examples, metrics, or data?
- structure: Is the answer well-organized (e.g., STAR format)?
- authenticity: Does the answer feel genuine and unrehearsed?
- conciseness: Is the answer appropriately brief and on-point without padding?
</rubric>

<instructions>
Evaluate the candidate's answer. You MUST respond with ONLY valid JSON in this exact format (no markdown, no code blocks):
{"clarity":N,"evidence":N,"structure":N,"authenticity":N,"conciseness":N,"strengths":["strength1","strength2"],"improvements":["improvement1","improvement2"],"gold_answer":"A concise, improved version of their answer"}
</instructions>
</mock_evaluation>`
}

// Task 15: Compare two answers for the same question
export function buildComparisonPrompt(
  question: string,
  prevAnswer: string,
  currAnswer: string,
  prevScores: Record<string, number>,
  currScores: Record<string, number>,
  targetRole: string
): string {
  const prevScoreStr = Object.entries(prevScores).map(([k, v]) => `${k}: ${v}`).join(', ')
  const currScoreStr = Object.entries(currScores).map(([k, v]) => `${k}: ${v}`).join(', ')

  return `<answer_comparison>
<target_role>${sanitizeProfileData(targetRole)}</target_role>
<question>${sanitizeProfileData(question)}</question>

<previous_answer>
${sanitizeProfileData(prevAnswer)}
<scores>${prevScoreStr}</scores>
</previous_answer>

<current_answer>
${sanitizeProfileData(currAnswer)}
<scores>${currScoreStr}</scores>
</current_answer>

<instructions>
Compare these two answers to the same interview question. Identify what improved, what regressed, and what stayed the same between the previous and current answer.
You MUST respond with ONLY valid JSON in this exact format (no markdown, no code blocks):
{"improved":["area1","area2"],"regressed":["area1"],"unchanged":["area1"],"overallDelta":1.5,"advice":"specific actionable advice for further improvement"}

Rules:
- "improved": areas where the current answer is meaningfully better than the previous
- "regressed": areas where the current answer is worse
- "unchanged": areas that are about the same
- "overallDelta": a number (positive = overall improvement, negative = regression, 0 = same). Range: -10 to +10
- "advice": one to two sentences of specific, actionable advice for the ${sanitizeProfileData(targetRole)} role
</instructions>
</answer_comparison>`
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
