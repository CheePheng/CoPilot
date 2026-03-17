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

export interface Profile {
  targetRole: string
  seniority: string
  industry: string
  resumeText: string
  jobDescription: string
  storyBank: StoryEntry[]
}

interface ProfileState {
  profile: Profile
  setTargetRole: (role: string) => void
  setSeniority: (seniority: string) => void
  setIndustry: (industry: string) => void
  setResumeText: (text: string) => void
  setJobDescription: (text: string) => void
  addStory: (story: StoryEntry) => void
  updateStory: (id: string, story: Partial<StoryEntry>) => void
  removeStory: (id: string) => void
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: {
    targetRole: '',
    seniority: '',
    industry: '',
    resumeText: '',
    jobDescription: '',
    storyBank: []
  },

  setTargetRole: (role) =>
    set((state) => ({ profile: { ...state.profile, targetRole: role } })),
  setSeniority: (seniority) =>
    set((state) => ({ profile: { ...state.profile, seniority } })),
  setIndustry: (industry) =>
    set((state) => ({ profile: { ...state.profile, industry } })),
  setResumeText: (text) =>
    set((state) => ({ profile: { ...state.profile, resumeText: text } })),
  setJobDescription: (text) =>
    set((state) => ({ profile: { ...state.profile, jobDescription: text } })),
  addStory: (story) =>
    set((state) => ({
      profile: { ...state.profile, storyBank: [...state.profile.storyBank, story] }
    })),
  updateStory: (id, updates) =>
    set((state) => ({
      profile: {
        ...state.profile,
        storyBank: state.profile.storyBank.map((s) =>
          s.id === id ? { ...s, ...updates } : s
        )
      }
    })),
  removeStory: (id) =>
    set((state) => ({
      profile: {
        ...state.profile,
        storyBank: state.profile.storyBank.filter((s) => s.id !== id)
      }
    }))
}))
