export class SessionContext {
  private topicsDiscussed: string[] = []
  private questionsAsked: { question: string; type: string; timestamp: number }[] = []
  private answersGiven: { answer: string; score?: number }[] = []
  private strengths: string[] = []
  private weaknesses: string[] = []

  addQuestionAnswer(question: string, answer: string, type: string = 'general', score?: number) {
    this.questionsAsked.push({ question, type, timestamp: Date.now() })
    this.answersGiven.push({ answer, score })
    // Extract key topics (simple: take first 5 significant words from question)
    const topics = question.split(/\s+/)
      .filter(w => w.length > 4)
      .slice(0, 3)
    this.topicsDiscussed.push(...topics)
  }

  addStrength(strength: string) { this.strengths.push(strength) }
  addWeakness(weakness: string) { this.weaknesses.push(weakness) }

  getSummary(): string {
    if (this.questionsAsked.length === 0) return ''
    const parts: string[] = []
    parts.push(`Questions discussed (${this.questionsAsked.length}):`)
    this.questionsAsked.forEach((q, i) => {
      const answerPreview = this.answersGiven[i]?.answer?.substring(0, 100) || 'No answer'
      parts.push(`  ${i + 1}. [${q.type}] ${q.question.substring(0, 80)}`)
      parts.push(`     Answer preview: ${answerPreview}...`)
    })
    if (this.strengths.length > 0) parts.push(`\nStrengths noted: ${this.strengths.join(', ')}`)
    if (this.weaknesses.length > 0) parts.push(`Areas to improve: ${this.weaknesses.join(', ')}`)
    return parts.join('\n')
  }

  reset() {
    this.topicsDiscussed = []
    this.questionsAsked = []
    this.answersGiven = []
    this.strengths = []
    this.weaknesses = []
  }

  getQuestionCount() { return this.questionsAsked.length }
  getPreviousQuestions() { return this.questionsAsked.map(q => q.question) }
}

export const sessionContext = new SessionContext()
