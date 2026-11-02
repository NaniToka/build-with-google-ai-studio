export interface TitleIdea {
  title: string;
  style: string;
  estimatedCtr: string;
  characterCount: number;
  whyItWorks: string;
}

export interface ThumbnailIdea {
  text: string;
  visualHook: string;
  badgeStyle: 'URGENT_RED' | 'ELECTRIC_YELLOW' | 'NEON_CYAN' | 'VIOLET_MYSTERY' | string;
  targetEmotion: string;
  previewBg?: string;
}

export interface VideoHook {
  style: string;
  description: string;
  script: string;
}

export interface EraComparison {
  era: string;
  title: string;
  tagline: string;
  howItWasMade: string;
  distribution: string;
  audienceReach: string;
  monetization: string;
  aiRole: string;
}

export interface TimeMachineData {
  year1996: EraComparison;
  year2026: EraComparison;
  year2056: EraComparison;
}

export interface GenerationResponse {
  topic: string;
  style: string;
  format: string;
  titles: TitleIdea[];
  thumbnails: ThumbnailIdea[];
  hooks: VideoHook[];
  hashtags: string[];
  seoKeywords: string[];
  description: string;
  timeMachine: TimeMachineData;
  generatedWith?: string;
  timestamp?: number;
}

export interface SavedTitleItem {
  id: string;
  title: string;
  topic: string;
  style: string;
  estimatedCtr: string;
  savedAt: number;
}
