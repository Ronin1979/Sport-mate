export type ThemeMode = 'dark' | 'light';

export type ScreenName =
  | 'onboarding-splash'
  | 'onboarding-login'
  | 'onboarding-register'
  | 'onboarding-recover'
  | 'avatar-creator'
  | 'onboarding-setup'
  | 'today'
  | 'activity'
  | 'active-workout'
  | 'discover'
  | 'create-event'
  | 'create-group'
  | 'ai'
  | 'profile'
  | 'notifications';

export type ActivitySubTab = 'training' | 'muscles' | 'plan-creator' | 'nutrition' | 'history';
export type DiscoverSubTab =
  | 'partners'
  | 'trainers'
  | 'groups'
  | 'rankings'
  | 'events'
  | 'map'
  | 'messages';
export type ProfileSubTab = 'overview' | 'integrations' | 'badges' | 'settings';
export type ChartPeriodKey = '7d' | '14d' | '30d' | '90d';

/**
 * Globalna maskotka aplikacji — naturalny Ryś SportMate.
 */
export type GlobalMascotVariant = 'lynx';
export type MascotMood =
  | 'happy'
  | 'hyped'
  | 'focused'
  | 'ready'
  | 'fire'
  | 'rest'
  | 'cheer'
  | 'levelup';

/**
 * System ludzkich awatarów 2D użytkownika.
 */
export type HumanSkinTone =
  | '#FFE6D4'
  | '#FCD7B6'
  | '#F3B991'
  | '#E09869'
  | '#BA7448'
  | '#7D492A';

export type HumanHairStyle =
  | 'short-fade'
  | 'curly-top'
  | 'spiky'
  | 'ponytail'
  | 'wavy-bob'
  | 'bun'
  | 'buzz'
  | 'braids'
  | 'undercut'
  | 'afro-puff';

export type HumanHairColor =
  | '#181B26'
  | '#4A2F20'
  | '#8C4427'
  | '#E6B84D'
  | '#D95338'
  | '#E2E8F0'
  | '#3B82F6'
  | '#2563EB'
  | '#EC4899';

export type HumanEyeColor =
  | '#2E221D'
  | '#10B981'
  | '#38BDF8'
  | '#D97706'
  | '#8B5CF6'
  | '#64748B'
  | '#2E6F95'
  | '#3D8C5A'
  | '#5C3A21'
  | '#232733'
  | '#8A6236'
  | '#7C4DFF';

export type HumanExpression =
  | 'smile'
  | 'determined'
  | 'hyped'
  | 'wink'
  | 'proud'
  | 'focused'
  | 'focused-zen';

export type HumanFacialHair = 'none' | 'stubble' | 'beard' | 'mustache' | 'goatee';

export type HumanAccessory =
  | 'none'
  | 'headband'
  | 'sweatband-mint'
  | 'sweatband-duo'
  | 'glasses'
  | 'smart-glasses'
  | 'cycling-glasses'
  | 'headphones'
  | 'cap'
  | 'visor';

export type HumanOutfitStyle =
  | 'jersey'
  | 'hoodie'
  | 'tank-top'
  | 'cycling-aero'
  | 'aero-cycling'
  | 'compression'
  | 'triathlon';

export type HumanSportProp =
  | 'none'
  | 'dumbbell'
  | 'bottle'
  | 'watch'
  | 'garmin-watch'
  | 'racket'
  | 'medal'
  | 'kom-medal';

export interface HumanAvatarConfig {
  skinTone: HumanSkinTone;
  hairStyle: HumanHairStyle;
  hairColor: HumanHairColor;
  eyeColor?: HumanEyeColor;
  expression: HumanExpression;
  facialHair: HumanFacialHair;
  accessory: HumanAccessory;
  outfitStyle?: HumanOutfitStyle;
  outfitColor: string;
  sportProp?: HumanSportProp;
  bgColor: string;
}

export interface WeeklyComparisonDay {
  dayShort: string;
  dayFull: string;
  currentKcalBurned: number;
  prevKcalBurned: number;
  currentVolumeKg: number;
  prevVolumeKg: number;
  sessionFocus?: string;
}

export interface RegistrationFormData {
  fullName: string;
  email: string;
  password: string;
  age: number;
  gender: 'Mężczyzna' | 'Kobieta' | 'Inna';
  heightCm: number;
  weightKg: number;
  district: string;
  primaryGoal: string;
  acceptTerms: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  age: number;
  gender: string;
  heightCm: number;
  weightKg: number;
  level: number;
  exp: number;
  expTarget: number;
  expNext?: number;
  streakDays: number;
  readinessScore: number;
  restingHr: number;
  sleepHours: string;
  steps: number;
  city: string;
  bio?: string;
  motto?: string;
  photoUrl?: string;
  goals: string[];
  sports: Record<string, string>;
  avatar: HumanAvatarConfig;
}

export interface WeekDayData {
  short: string;
  num: number;
  done: boolean;
  label: string;
  isTodayLive?: boolean;
  readiness?: number;
  readinessStatus?: string;
  readinessTitle?: string;
  readinessDesc?: string;
  sleep?: string;
  hr?: number;
  steps?: number;
  workoutTitle?: string;
  workoutBadge?: string;
  workoutDuration?: string;
  setsDone?: number;
  setsTotal?: number;
  exercisesCount?: number;
  kcal?: number;
  p?: number;
  f?: number;
  c?: number;
  waterMl?: number;
}

export type MuscleGroupCategory =
  | 'Klatka piersiowa'
  | 'Plecy'
  | 'Nogi (Czworogłowe i Pośladki)'
  | 'Nogi (Dwugłowe i Łydki)'
  | 'Barki'
  | 'Biceps'
  | 'Triceps'
  | 'Brzuch i Core';

export type WorkoutPlanTemplateType = 'FBW' | 'Push' | 'Pull' | 'Legs' | 'Upper' | 'Custom';

export interface WorkoutSet {
  weight: number;
  reps: number;
  done: boolean;
}

export interface WorkoutExerciseHistoryLog {
  weekLabel: string;
  dateLabel: string;
  setsSummary: string;
  topWeightKg: number;
  volumeKg: number;
}

export interface WorkoutExercise {
  name: string;
  muscle: string;
  muscleGroup?: MuscleGroupCategory;
  prevResult: string;
  ytUrl: string;
  sets: WorkoutSet[];
  historyLogs?: WorkoutExerciseHistoryLog[];
}

export interface WorkoutPlanHistorySession {
  id: string;
  weekLabel: string;
  dateLabel: string;
  durationLabel: string;
  totalVolumeKg: number;
  setsCompleted: number;
  exercisesSummary: {
    exerciseName: string;
    setsSummary: string;
    topWeightKg: number;
    volumeKg: number;
  }[];
}

export interface WorkoutState {
  planName: string;
  planType?: WorkoutPlanTemplateType;
  planTemplate?: WorkoutPlanTemplateType;
  durationEst: string;
  currentExerciseIdx: number;
  restTimerSeconds: number;
  restTimerInitial: number;
  restTimerRunning: boolean;
  exercises: WorkoutExercise[];
}

export interface SavedWorkoutPlan extends WorkoutState {
  id: string;
  createdAtLabel: string;
  lastPerformedLabel: string;
  completedCount: number;
  sessionHistory: WorkoutPlanHistorySession[];
}

export interface ExerciseCatalogItem {
  id: string;
  name: string;
  muscle: string;
  muscleGroup: MuscleGroupCategory;
  equipment: 'Sztanga' | 'Hantle' | 'Maszyna' | 'Wyciąg' | 'Masa ciała' | 'Kettlebell';
  defaultKg: number;
  defaultWeight?: number;
  defaultSets: number;
  defaultReps: number;
  recommendedFor: WorkoutPlanTemplateType[];
  tip: string;
  ytUrl: string;
  yt?: string;
}

export interface FatSecretServingOption {
  id: string;
  label: string;
  grams: number;
  isDefault?: boolean;
}

export interface FatSecretFoodItem {
  id: string;
  name: string;
  brandName?: string;
  foodType: 'Brand' | 'Generic';
  category: Exclude<FoodCategory, 'Wszystkie'>;
  verified?: boolean;
  barcode?: string;
  defaultServingLabel: string;
  defaultServingGrams: number;
  kcal100: number;
  p100: number;
  f100: number;
  c100: number;
  fiber100?: number;
  sugar100?: number;
  servings: FatSecretServingOption[];
  rawDescription?: string;
}

export interface MealEntry {
  id: number;
  mealType: string;
  name: string;
  brandName?: string;
  servingLabel?: string;
  grams: number;
  kcal: number;
  p: number;
  f: number;
  c: number;
  fiber?: number;
  source?: 'fatsecret' | 'local';
}

export type FoodCategory =
  | 'Wszystkie'
  | 'Źródła białka'
  | 'Węglowodany i zboża'
  | 'Owoce i zdrowe tłuszcze'
  | 'Gotowe posiłki i przekąski';

export interface ProductCatalogItem {
  id?: string;
  name: string;
  brandName?: string;
  foodType?: 'Brand' | 'Generic';
  verified?: boolean;
  category?: Exclude<FoodCategory, 'Wszystkie'>;
  portionLabel?: string;
  defaultServingGrams?: number;
  kcal100: number;
  p100: number;
  f100: number;
  c100: number;
  fiber100?: number;
  servings?: FatSecretServingOption[];
}

export interface NutritionState {
  kcalGoal: number;
  proteinGoal: number;
  fatGoal: number;
  carbsGoal: number;
  waterMl: number;
  waterGoalMl: number;
  selectedMealType: string;
  selectedGramsRaw: string;
  searchQuery: string;
  selectedFoodCategory?: FoodCategory;
  meals: MealEntry[];
  productCatalog: ProductCatalogItem[];
}

export type MacroSuggestionFocus = 'auto' | 'protein' | 'carbs' | 'fat';

export interface MacroDeficitSummary {
  missingKcal: number;
  missingProtein: number;
  missingCarbs: number;
  missingFat: number;
  proteinDeficitPct: number;
  carbsDeficitPct: number;
  fatDeficitPct: number;
  dominantDeficit: 'protein' | 'carbs' | 'fat' | 'balanced';
  dominantLabelPl: string;
}

export interface FatSecretMacroSuggestion {
  food: FatSecretFoodItem;
  recommendedGrams: number;
  recommendedServingLabel: string;
  kcal: number;
  p: number;
  f: number;
  c: number;
  targetMacro: 'protein' | 'carbs' | 'fat' | 'balanced';
  badgeLabel: string;
  reasonLabel: string;
  coveragePct: number;
  score: number;
}

export interface PastActivityDetails {
  title: string;
  date: string;
  badge: string;
  duration: string;
  avgHr: string;
  calories: string;
  mainMetricLabel: string;
  mainMetricVal: string;
  splits: { name: string; result: string }[];
}

export interface PartnerProfile {
  id: string;
  name: string;
  age: number;
  sport: string;
  level: string;
  distance: string;
  district: string;
  matchPct: number;
  avail: string;
  bio: string;
  avatar: HumanAvatarConfig;
  invited: boolean;
}

export interface GroupComment {
  author: string;
  text: string;
}

export interface GroupPost {
  id: string;
  author: string;
  authorAvatar?: HumanAvatarConfig;
  isCurrentUser?: boolean;
  time: string;
  tag: string;
  tagClass: string;
  text: string;
  metricHighlight?: string;
  likes: number;
  liked: boolean;
  comments: GroupComment[];
}

export interface SocialGroup {
  id: string;
  name: string;
  sport: string;
  membersCount: number;
  joined: boolean;
  badgeColor: string;
  desc: string;
  posts: GroupPost[];
}

export interface SportEvent {
  id: string;
  venueId?: string;
  title: string;
  sport: string;
  date: string;
  location: string;
  organizer: string;
  organizerAvatar: HumanAvatarConfig;
  level: string;
  spotsTaken: number;
  spotsLimit: number;
  joined: boolean;
  desc: string;
}

export type VenueCategory =
  | 'Wszystkie'
  | 'Siłownia'
  | 'Trasa biegowa'
  | 'Basen i Wielofunkcyjny'
  | 'Kolarstwo i Trail'
  | 'Street Workout';

export interface VenueTimeSlot {
  id: string;
  time: string;
  available: boolean;
  reservedByUser?: boolean;
}

export interface VenueFacilityUnit {
  id: string;
  name: string;
  unitType: 'court' | 'hall' | 'lane' | 'zone';
  status: 'free' | 'moderate' | 'busy' | 'reserved_by_user';
  statusLabel: string;
  capacityLabel: string;
  slots: VenueTimeSlot[];
}

export interface VenueLiveDetails {
  venueId: string;
  isOpenNow: boolean;
  openStatusLabel: string;
  hoursWeekday: string;
  hoursWeekend: string;
  occupancyPct: number;
  occupancyLabel: string;
  passesAccepted: string[];
  freeUnitsCount: number;
  totalUnitsCount: number;
  facilities: VenueFacilityUnit[];
  events: SportEvent[];
}

export interface LodzVenue {
  id: string;
  name: string;
  category?: Exclude<VenueCategory, 'Wszystkie'>;
  sub: string;
  address: string;
  coords: [number, number];
  color: string;
  activeUsersCount?: number;
  rating?: string;
  hoursWeekday?: string;
  hoursWeekend?: string;
  isOpen24h?: boolean;
}

export interface SegmentLeaderboardEntry {
  rank: number;
  name: string;
  isCurrentUser?: boolean;
  avatar: HumanAvatarConfig;
  timeFormatted: string;
  timeSeconds: number;
  paceOrSpeed: string;
  date: string;
  isKom?: boolean;
}

export interface StravaSegment {
  id: string;
  name: string;
  title?: string;
  sport: 'run' | 'bike' | 'Bieganie' | 'Kolarstwo';
  sportLabel: string;
  location: string;
  distanceKm: number;
  elevationGainM: number;
  recordHolder: string;
  recordTime: string;
  recordPace: string;
  attemptsCount: number;
  startCoords: [number, number];
  endCoords: [number, number];
  pathCoords: [number, number][];
  leaderboard: SegmentLeaderboardEntry[];
}

export interface StravaChallenge {
  id: string;
  title: string;
  subtitle: string;
  sport: 'run' | 'bike' | 'strength';
  sportLabel: string;
  targetValue: number;
  currentValue: number;
  progressTarget?: number;
  progressCurrent?: number;
  unit: string;
  daysLeft: number;
  participantsCount: number;
  rewardExp: number;
  joined: boolean;
  completed?: boolean;
}

export interface WeeklyChallengeEntry {
  id: string;
  name: string;
  district: string;
  avatar: HumanAvatarConfig;
  isCurrentUser?: boolean;
  scoreValue: number;
  scoreFormatted: string;
  secondaryLabel: string;
  rank: number;
  deltaLabel?: string;
}

export interface WeeklyChallenge {
  id: string;
  title: string;
  subtitle: string;
  badgeLabel: string;
  metricType: 'distance_km' | 'segment_time_sec' | 'volume_kg';
  sortDirection: 'asc' | 'desc';
  unit: string;
  targetValue: number;
  endsInLabel: string;
  rewardExp: number;
  participantsCount: number;
  joined: boolean;
  leaderboard: WeeklyChallengeEntry[];
}

export interface PlayerRankingEntry {
  id: string;
  name: string;
  isCurrentUser?: boolean;
  district: string;
  avatar: HumanAvatarConfig;
  runsKmMonth: number;
  runsCountMonth: number;
  workoutsMonth: number;
  volumeKgMonth: number;
  runsCount?: number;
  runDistanceKm?: number;
  workoutsCount?: number;
  streakDays: number;
  points: number;
}

export interface ChatMessage {
  sender: string;
  time: string;
  text: string;
  incoming: boolean;
}

export interface ChatThread {
  id: string;
  type: 'partner' | 'event';
  title: string;
  subtitle: string;
  avatar: HumanAvatarConfig;
  online: boolean;
  autoReplySender?: string;
  autoReplyText: string;
  messages: ChatMessage[];
}

export interface IntegrationItem {
  id: string;
  name: string;
  desc: string;
  connected: boolean;
  lastSync: string;
  brandColor: string;
}

export interface HistoryEntry {
  screen: ScreenName;
  activitySubTab: ActivitySubTab;
  discoverSubTab: DiscoverSubTab;
  profileSubTab: ProfileSubTab;
  activeChatThreadId: string | null;
  activeGroupId: string | null;
}

export type MuscleAnatomyZoneId =
  | 'chest'
  | 'shoulders'
  | 'traps'
  | 'biceps'
  | 'triceps'
  | 'abs'
  | 'back'
  | 'lower_back'
  | 'glutes'
  | 'quads'
  | 'hamstrings'
  | 'calves';

export type MuscleRankTier =
  | 'Unranked'
  | 'Bronze'
  | 'Silver'
  | 'Gold'
  | 'Emerald'
  | 'Master';

export type UserRankTier =
  | 'Bronze'
  | 'Silver'
  | 'Gold'
  | 'Platinum'
  | 'Diamond'
  | 'Master';

export interface BadgeItem {
  id: string;
  name: string;
  desc: string;
  requirement: string;
  category: string;
  unlocked: boolean;
  pinned: boolean;
  progressCurrent: number;
  progressTarget: number;
  progressUnit: string;
  accentColor: string;
  iconType:
    | 'flame'
    | 'dumbbell'
    | 'users'
    | 'bolt'
    | 'target'
    | 'trophy'
    | 'shield'
    | 'compass'
    | 'crown'
    | 'medal'
    | 'heart'
    | 'star';
}

export type TrainerSessionFormat = '1:1' | 'group';

export interface TrainerListing {
  id: string;
  trainerName: string;
  title: string;
  trainingType: 'personal' | 'group';
  sessionFormat?: TrainerSessionFormat;
  sportCategory: string;
  specialty?: string;
  locationName: string;
  location?: string;
  district: string;
  pricePln: number;
  durationMin: number;
  rating: number;
  reviewsCount: number;
  certifications: string[];
  description: string;
  bio?: string;
  photoUrl?: string;
  experienceYears?: number;
  achievements?: string[];
  scheduleSlots?: string[];
  nextAvailableLabel: string;
  nextAvailableSlot?: string;
  spotsLabel: string;
  verified: boolean;
  verifiedPro?: boolean;
  booked: boolean;
  avatar: HumanAvatarConfig;
}

export interface AppNotificationItem {
  id: string;
  title: string;
  subtitle: string;
  time: string;
  category: 'chat' | 'ranking' | 'group' | 'event';
  targetId?: string;
  unread?: boolean;
}

export interface MuscleZoneProgress {
  id: MuscleAnatomyZoneId;
  namePl: string;
  latinName: string;
  viewSide: 'front' | 'back' | 'both';
  level: number;
  xp: number;
  xpToNextLevel: number;
  weeklySets: number;
  targetWeeklySets: number;
  lastTrainedLabel: string;
  topExercise: string;
}

export interface DailyStreakQuest {
  id: string;
  title: string;
  subtitle: string;
  current: number;
  target: number;
  unit: string;
  rewardExp: number;
  completed: boolean;
  claimed: boolean;
  category: 'workout' | 'water' | 'nutrition' | 'steps';
}

export interface WeeklyGamificationQuest {
  id: string;
  title: string;
  subtitle: string;
  current: number;
  target: number;
  unit: string;
  rewardExp: number;
  rewardBadgeName: string;
  claimed: boolean;
}

export interface StravaAthleteProfile {
  id: number;
  username: string;
  fullName: string;
  city: string;
  premium: boolean;
  followersCount: number;
  clubsCount: number;
  ytdRunKm: number;
  ytdRideKm: number;
  ytdElevationM: number;
  recentActivitiesCount: number;
  lastSyncedAt: string;
  mode: 'oauth_live' | 'api_ready';
}

export interface StravaActivityItem {
  id: string;
  stravaId: number;
  name: string;
  type: 'Run' | 'Ride' | 'WeightTraining';
  sportLabel: string;
  startDateLabel: string;
  distanceKm: number;
  movingTimeFormatted: string;
  movingTimeSec: number;
  paceOrSpeed: string;
  elevationGainM: number;
  avgHr: number;
  maxHr: number;
  wattsAvg?: number;
  calories: number;
  kudosCount: number;
  prCount: number;
  segmentId?: string;
  location: string;
}
