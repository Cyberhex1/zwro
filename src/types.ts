export type AudioType = 'brown' | 'pink' | 'binaural' | 'drone';

export interface TaskItem {
  id: string;
  label: string;
  completed: boolean;
  timestamp?: number;
  category?: string;
}

export interface SessionLog {
  id: string;
  date: string;
  timestamp: number;
  tasksCompleted: number;
  sprintsCount: number;
  energyEnd: number;
  notes?: string;
  effortRating: 'low' | 'standard' | 'high';
}

export type SprintPhase = 'work' | 'rest';

export interface SprintConfig {
  workDuration: number; // in seconds
  restDuration: number; // in seconds
  name: string;
}

export interface GroundingStep {
  id: string;
  title: string;
  instruction: string;
  detail: string;
  completed: boolean;
}

export type BurnoutPhase = 1 | 2 | 3;

export interface BurnoutPhaseInfo {
  phase: BurnoutPhase;
  title: string;
  daysRange: string;
  color: string;
  tagline: string;
  description: string;
  rules: string[];
}
