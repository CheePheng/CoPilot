import { create } from 'zustand'

export interface StoryEntry {
  id: string
  title: string
  situation: string
  task: string
  action: string
  result: string
  tags: string[]
}

export interface KnowledgeSnippet {
  id: string
  key: string
  value: string
}

export interface Profile {
  targetRole: string
  seniority: string
  industry: string
  resumeText: string
  jobDescription: string
  storyBank: StoryEntry[]
  knowledgeSnippets: KnowledgeSnippet[]
}

interface ProfileState {
  profile: Profile
  isSaving: boolean
  lastSaved: number | null
  setTargetRole: (role: string) => void
  setSeniority: (seniority: string) => void
  setIndustry: (industry: string) => void
  setResumeText: (text: string) => void
  setJobDescription: (text: string) => void
  addStory: (story: StoryEntry) => void
  updateStory: (id: string, story: Partial<StoryEntry>) => void
  removeStory: (id: string) => void
  addKnowledgeSnippet: (snippet: KnowledgeSnippet) => void
  updateKnowledgeSnippet: (id: string, updates: Partial<KnowledgeSnippet>) => void
  removeKnowledgeSnippet: (id: string) => void
  loadFromDisk: () => Promise<void>
}

const PROFILE_KEY = 'profile'

type SetFn = (partial: Partial<ProfileState>) => void

const saveState = { timer: null as ReturnType<typeof setTimeout> | null }

function debouncedSave(profile: Profile, set: SetFn): void {
  if (saveState.timer) clearTimeout(saveState.timer)
  set({ isSaving: true })
  saveState.timer = setTimeout(async () => {
    saveState.timer = null
    window.copilot?.storage?.set(PROFILE_KEY, profile)
    window.copilot?.profile?.sync(profile)
    set({ isSaving: false, lastSaved: Date.now() })
  }, 500)
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: {
    targetRole: '',
    seniority: '',
    industry: '',
    resumeText: '',
    jobDescription: '',
    storyBank: [],
    knowledgeSnippets: []
  },
  isSaving: false,
  lastSaved: null,

  setTargetRole: (role) => {
    set((state) => ({ profile: { ...state.profile, targetRole: role } }))
    debouncedSave(get().profile, set)
  },
  setSeniority: (seniority) => {
    set((state) => ({ profile: { ...state.profile, seniority } }))
    debouncedSave(get().profile, set)
  },
  setIndustry: (industry) => {
    set((state) => ({ profile: { ...state.profile, industry } }))
    debouncedSave(get().profile, set)
  },
  setResumeText: (text) => {
    set((state) => ({ profile: { ...state.profile, resumeText: text } }))
    debouncedSave(get().profile, set)
  },
  setJobDescription: (text) => {
    set((state) => ({ profile: { ...state.profile, jobDescription: text } }))
    debouncedSave(get().profile, set)
  },
  addStory: (story) => {
    set((state) => ({
      profile: { ...state.profile, storyBank: [...state.profile.storyBank, story] }
    }))
    debouncedSave(get().profile, set)
  },
  updateStory: (id, updates) => {
    set((state) => ({
      profile: {
        ...state.profile,
        storyBank: state.profile.storyBank.map((s) =>
          s.id === id ? { ...s, ...updates } : s
        )
      }
    }))
    debouncedSave(get().profile, set)
  },
  removeStory: (id) => {
    set((state) => ({
      profile: {
        ...state.profile,
        storyBank: state.profile.storyBank.filter((s) => s.id !== id)
      }
    }))
    debouncedSave(get().profile, set)
  },
  addKnowledgeSnippet: (snippet) => {
    set((state) => ({
      profile: { ...state.profile, knowledgeSnippets: [...state.profile.knowledgeSnippets, snippet] }
    }))
    debouncedSave(get().profile, set)
  },
  updateKnowledgeSnippet: (id, updates) => {
    set((state) => ({
      profile: {
        ...state.profile,
        knowledgeSnippets: state.profile.knowledgeSnippets.map((s) =>
          s.id === id ? { ...s, ...updates } : s
        )
      }
    }))
    debouncedSave(get().profile, set)
  },
  removeKnowledgeSnippet: (id) => {
    set((state) => ({
      profile: {
        ...state.profile,
        knowledgeSnippets: state.profile.knowledgeSnippets.filter((s) => s.id !== id)
      }
    }))
    debouncedSave(get().profile, set)
  },
  loadFromDisk: async () => {
    try {
      const data = (await window.copilot?.storage?.get(PROFILE_KEY)) as Profile | null
      if (data) {
        set({ profile: data })
        window.copilot?.profile?.sync(data)
      }
    } catch {
      // First run, no saved profile
    }
  }
}))
