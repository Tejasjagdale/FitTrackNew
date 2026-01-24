// src/components/progress/progressTypes.ts

export interface ProfileData {
  name?: string
  age?: number
  gender?: string
  heightCm?: number
  goalWeight?:number,
  targetBMI?: number
}

export interface MeasurementsEntry {
  unflexedArms?: number
  flexedArms?: number
  forearms?: number
  thighs?: number
  calf?: number
  chest?: number
  stomach?: number
  waist?: number
  neck?: number
  bodyFat?: number
  fatFreeMass?: number
}

export interface ProgressDataFile {
  profile?: ProfileData
  dailyWeight: Record<string, number>
  measurements: Record<string, MeasurementsEntry>
  workouts: WorkoutLogEntry[],
  dailyHealth?: Record<string, DailyHealthStatus>   // NEW
}

export interface DailyPoint {
  date: string
  weight: number
  bmi?: number
}

export interface MeasurementPoint {
  date: string
  value?: number
}

export interface WorkoutLogEntry {
  date: string
  variantId: string
  variantName: string
  completed: boolean,
  startTime:string,
  endTime:string
}

export interface DailyHealthStatus {
  condition: 'stomachIssue' | 'bodyPain' | 'coldOrFever' | 'healthy'
  dietQuality: 'insufficient' | 'adequate' | 'excess'
  mood: 'sad' | 'neutral' | 'happy'
  studied: boolean
}