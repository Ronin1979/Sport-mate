import React, { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  Award,
  Battery,
  Bell,
  Bot,
  CheckCircle2,
  ChevronLeft,
  ClipboardList,
  Compass,
  Contrast,
  Dumbbell,
  Flame,
  Layout,
  MapPin,
  Signal,
  SmilePlus,
  Sparkles,
  SunMoon,
  Trophy,
  User,
  UserPlus,
  Wifi,
} from 'lucide-react';
import {
  ActivitySubTab,
  AppNotificationItem,
  BadgeItem,
  ChatMessage,
  ChatThread,
  DailyStreakQuest,
  DiscoverSubTab,
  ExerciseCatalogItem,
  FatSecretFoodItem,
  GlobalMascotVariant,
  HistoryEntry,
  HumanAvatarConfig,
  IntegrationItem,
  MuscleAnatomyZoneId,
  MuscleGroupCategory,
  MuscleZoneProgress,
  NutritionState,
  PartnerProfile,
  PlayerRankingEntry,
  ProfileSubTab,
  RegistrationFormData,
  SavedWorkoutPlan,
  ScreenName,
  SocialGroup,
  SportEvent,
  StravaActivityItem,
  StravaAthleteProfile,
  StravaChallenge,
  StravaSegment,
  ThemeMode,
  TrainerListing,
  UserProfile,
  WeekDayData,
  WeeklyChallenge,
  WeeklyComparisonDay,
  WeeklyGamificationQuest,
  WorkoutPlanTemplateType,
  WorkoutState,
} from './types/sportmate';
import {
  INITIAL_AI_MESSAGES,
  INITIAL_BADGES,
  INITIAL_CHAT_THREADS,
  INITIAL_DAILY_STREAK_QUESTS,
  INITIAL_EVENTS,
  INITIAL_EXERCISE_CATALOG,
  INITIAL_GROUPS,
  INITIAL_INTEGRATIONS,
  INITIAL_MUSCLE_ZONES,
  INITIAL_NOTIFICATIONS,
  INITIAL_NUTRITION,
  INITIAL_PARTNERS,
  INITIAL_PLAYER_RANKINGS,
  INITIAL_STRAVA_CHALLENGES,
  INITIAL_STRAVA_SEGMENTS,
  INITIAL_TRAINER_LISTINGS,
  INITIAL_USER,
  INITIAL_WEEKLY_CHALLENGES,
  INITIAL_WEEKLY_COMPARISON,
  INITIAL_WEEKLY_GAMIFICATION_QUESTS,
  INITIAL_WEEK_DAYS,
  INITIAL_WORKOUT_PLANS,
  LODZ_VENUES,
  PAST_ACTIVITIES,
} from './data/initialData';
import {
  INITIAL_STRAVA_ACTIVITIES,
  INITIAL_STRAVA_ATHLETE,
} from './data/apiCatalogs';
import {
  addMuscleZoneXp,
  applyUserExpGain,
  buildAIReply,
  buildPartnerReply,
  calculateAdaptiveMacros,
  calculateFatSecretServingMacros,
  censorChatMessage,
  createSavedWorkoutPlan,
  formatNumberPL,
  getExerciseTargetZones,
  getMuscleRankInfo,
  getNutritionTotals,
  getWorkoutVolumeKg,
  insertOrUpdateSegmentAttempt,
  recordCompletedWorkoutSession,
  updateWeeklyChallengeScore,
} from './utils/formatters';
import { SportMateMark } from './components/common/VisualWidgets';
import { AvatarCreatorScreen } from './components/avatar/AvatarCreatorScreen';
import {
  LoginScreen,
  RecoverScreen,
  RegisterScreen,
  SetupScreen,
  SplashScreen,
} from './components/onboarding/OnboardingScreens';
import { TodayScreen } from './components/screens/TodayScreen';
import { ActiveWorkoutScreen, ActivityScreen } from './components/screens/ActivityScreen';
import {
  CreateEventScreen,
  CreateGroupScreen,
  DiscoverScreen,
} from './components/screens/DiscoverScreen';
import {
  AIScreen,
  NotificationsScreen,
  ProfileScreen,
} from './components/screens/AIAndProfileScreens';

export default function App() {
  const isAutostart =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('autostart') === '1';

  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [mascotVariant] = useState<GlobalMascotVariant>('lynx');
  const [currentScreen, setCurrentScreen] = useState<ScreenName>(
    isAutostart ? 'today' : 'onboarding-splash'
  );
  const [activitySubTab, setActivitySubTab] = useState<ActivitySubTab>('training');
  const [discoverSubTab, setDiscoverSubTab] = useState<DiscoverSubTab>('partners');
  const [profileSubTab, setProfileSubTab] = useState<ProfileSubTab>('overview');
  const [historyStack, setHistoryStack] = useState<HistoryEntry[]>([]);

  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(5);
  const [activeVenueId, setActiveVenueId] = useState<string>('v1');
  const [activeChatThreadId, setActiveChatThreadId] = useState<string | null>(null);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [aiProgressionApplied, setAiProgressionApplied] = useState<boolean>(false);

  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [weekDays, setWeekDays] = useState<WeekDayData[]>(INITIAL_WEEK_DAYS);
  const [weeklyComparison] = useState<WeeklyComparisonDay[]>(INITIAL_WEEKLY_COMPARISON);
  const [workoutPlans, setWorkoutPlans] = useState<SavedWorkoutPlan[]>(INITIAL_WORKOUT_PLANS);
  const [activePlanId, setActivePlanId] = useState<string>(INITIAL_WORKOUT_PLANS[0].id);
  const [workout, setWorkout] = useState<WorkoutState>(INITIAL_WORKOUT_PLANS[0]);
  const [exerciseCatalog] = useState<ExerciseCatalogItem[]>(INITIAL_EXERCISE_CATALOG);
  const [exerciseFilter, setExerciseFilter] = useState<string>('Wszystkie');
  const [exerciseSearch, setExerciseSearch] = useState<string>('');
  const [nutrition, setNutrition] = useState<NutritionState>(INITIAL_NUTRITION);
  const [partners, setPartners] = useState<PartnerProfile[]>(INITIAL_PARTNERS);
  const [partnerSportFilter, setPartnerSportFilter] = useState<string>('Wszystkie');
  const [groups, setGroups] = useState<SocialGroup[]>(INITIAL_GROUPS);
  const [events, setEvents] = useState<SportEvent[]>(INITIAL_EVENTS);
  const [eventSportFilter, setEventSportFilter] = useState<string>('Wszystkie');
  const [chatThreads, setChatThreads] = useState<Record<string, ChatThread>>(INITIAL_CHAT_THREADS);
  const [isPartnerTyping, setIsPartnerTyping] = useState<boolean>(false);
  const [aiMessages, setAiMessages] = useState<ChatMessage[]>(INITIAL_AI_MESSAGES);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const [integrations, setIntegrations] = useState<IntegrationItem[]>(INITIAL_INTEGRATIONS);

  const [stravaAthlete, setStravaAthlete] =
    useState<StravaAthleteProfile>(INITIAL_STRAVA_ATHLETE);
  const [stravaActivities, setStravaActivities] =
    useState<StravaActivityItem[]>(INITIAL_STRAVA_ACTIVITIES);
  const [isStravaSyncing, setIsStravaSyncing] = useState<boolean>(false);

  const [stravaSegments, setStravaSegments] =
    useState<StravaSegment[]>(INITIAL_STRAVA_SEGMENTS);
  const [stravaChallenges, setStravaChallenges] =
    useState<StravaChallenge[]>(INITIAL_STRAVA_CHALLENGES);
  const [weeklyChallenges, setWeeklyChallenges] =
    useState<WeeklyChallenge[]>(INITIAL_WEEKLY_CHALLENGES);
  const [playerRankings, setPlayerRankings] =
    useState<PlayerRankingEntry[]>(INITIAL_PLAYER_RANKINGS);

  const [muscleZones, setMuscleZones] =
    useState<MuscleZoneProgress[]>(INITIAL_MUSCLE_ZONES);
  const [dailyQuests, setDailyQuests] =
    useState<DailyStreakQuest[]>(INITIAL_DAILY_STREAK_QUESTS);
  const [weeklyQuests, setWeeklyQuests] =
    useState<WeeklyGamificationQuest[]>(INITIAL_WEEKLY_GAMIFICATION_QUESTS);
  const [badges, setBadges] = useState<BadgeItem[]>(INITIAL_BADGES);
  const [trainerListings] = useState<TrainerListing[]>(INITIAL_TRAINER_LISTINGS);
  const [notifications, setNotifications] =
    useState<AppNotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(3);

  const [historyModalActId, setHistoryModalActId] = useState<string | null>(null);
  const [gmpQuotaExceeded, setGmpQuotaExceeded] = useState<boolean>(false);

  const mainViewRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const onQuotaExceeded = () => setGmpQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', onQuotaExceeded);
    return () => window.removeEventListener('gmp-quota-exceeded', onQuotaExceeded);
  }, []);

  useEffect(() => {
    if (!workout.restTimerRunning) return;
    const interval = window.setInterval(() => {
      setWorkout((prev) => {
        if (prev.restTimerSeconds > 1) {
          return { ...prev, restTimerSeconds: prev.restTimerSeconds - 1 };
        }
        return { ...prev, restTimerSeconds: 0, restTimerRunning: false };
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [workout.restTimerRunning]);

  useEffect(() => {
    setWorkoutPlans((prev) =>
      prev.map((p) =>
        p.id === activePlanId
          ? {
              ...p,
              planName: workout.planName,
              planType: workout.planType,
              planTemplate: workout.planTemplate,
              durationEst: workout.durationEst,
              currentExerciseIdx: workout.currentExerciseIdx,
              exercises: workout.exercises,
            }
          : p
      )
    );
  }, [workout, activePlanId]);

  const scrollMainToTop = () => {
    if (mainViewRef.current) {
      mainViewRef.current.scrollTop = 0;
    }
  };

  // Zgodnie z prośbą użytkownika wyłączono wyskakujące u góry powiadomienia toast
  const showToast = (_msg: string) => {};

  const toggleTheme = () => {
    const next: ThemeMode = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    showToast(`Aktywowano motyw ${next === 'dark' ? 'OLED ciemny' : 'jasny iOS'}`);
  };

  const triggerMascotCheer = () => {
    showToast('Ryś SportMate macha łapką: Świetna forma dzisiaj! 🐾');
  };

  const navigate = (screenName: ScreenName, pushToHistory = true) => {
    if (pushToHistory && currentScreen !== screenName) {
      setHistoryStack((prev) => [
        ...prev,
        {
          screen: currentScreen,
          activitySubTab,
          discoverSubTab,
          profileSubTab,
          activeChatThreadId,
          activeGroupId,
        },
      ]);
    }
    setCurrentScreen(screenName);
    scrollMainToTop();
  };

  const openTab = (
    tabName: ScreenName,
    optionalSubTab?: ActivitySubTab | DiscoverSubTab | ProfileSubTab
  ) => {
    setHistoryStack([]);
    setCurrentScreen(tabName);
    if (tabName === 'activity' && optionalSubTab) {
      setActivitySubTab(optionalSubTab as ActivitySubTab);
    }
    if (tabName === 'discover' && optionalSubTab) {
      const sub = optionalSubTab as DiscoverSubTab;
      setDiscoverSubTab(sub);
      if (sub !== 'messages') setActiveChatThreadId(null);
      if (sub !== 'groups') setActiveGroupId(null);
    }
    if (tabName === 'profile' && optionalSubTab) {
      setProfileSubTab(optionalSubTab as ProfileSubTab);
    }
    scrollMainToTop();
  };

  const goBack = () => {
    if (currentScreen === 'discover' && discoverSubTab === 'messages' && activeChatThreadId) {
      setActiveChatThreadId(null);
      scrollMainToTop();
      return;
    }
    if (currentScreen === 'discover' && discoverSubTab === 'groups' && activeGroupId) {
      setActiveGroupId(null);
      scrollMainToTop();
      return;
    }
    if (historyStack.length > 0) {
      const prev = historyStack[historyStack.length - 1];
      setHistoryStack((s) => s.slice(0, -1));
      setCurrentScreen(prev.screen);
      setActivitySubTab(prev.activitySubTab);
      setDiscoverSubTab(prev.discoverSubTab);
      setProfileSubTab(prev.profileSubTab);
      setActiveChatThreadId(prev.activeChatThreadId);
      setActiveGroupId(prev.activeGroupId);
      scrollMainToTop();
    } else {
      setCurrentScreen('today');
      scrollMainToTop();
    }
  };

  const gainUserExp = (expDelta: number, addStreakDay = false) => {
    setUser((prev) => {
      const res = applyUserExpGain(prev.level, prev.exp, expDelta);
      return {
        ...prev,
        level: res.level,
        exp: res.exp,
        expTarget: res.expTarget,
        expNext: res.expTarget,
        streakDays: addStreakDay ? prev.streakDays + 1 : prev.streakDays,
      };
    });
  };

  const triggerLevelUpModal = () => {
    gainUserExp(150, false);
  };

  const handleTogglePinBadge = (badgeId: string) => {
    setBadges((prev) => {
      const target = prev.find((b) => b.id === badgeId);
      if (!target || !target.unlocked) return prev;
      const pinnedCount = prev.filter((b) => b.pinned).length;
      if (!target.pinned && pinnedCount >= 3) {
        let removedFirst = false;
        return prev.map((b) => {
          if (b.id === badgeId) return { ...b, pinned: true };
          if (b.pinned && !removedFirst) {
            removedFirst = true;
            return { ...b, pinned: false };
          }
          return b;
        });
      }
      return prev.map((b) => (b.id === badgeId ? { ...b, pinned: !b.pinned } : b));
    });
  };

  /* Handlery Rejestracji, Logowania i Awatara */
  const handleCompleteRegistration = (data: RegistrationFormData) => {
    const macros = calculateAdaptiveMacros(data.weightKg, data.primaryGoal);
    setUser((prev) => ({
      ...prev,
      name: data.fullName.trim(),
      email: data.email.trim(),
      age: Number(data.age),
      gender: data.gender,
      heightCm: Number(data.heightCm),
      weightKg: Number(data.weightKg),
      city: data.district,
      goals: prev.goals.includes(data.primaryGoal)
        ? prev.goals
        : [data.primaryGoal, ...prev.goals.slice(0, 2)],
    }));
    setNutrition((prev) => ({
      ...prev,
      kcalGoal: macros.kcalGoal,
      proteinGoal: macros.proteinGoal,
      fatGoal: macros.fatGoal,
      carbsGoal: macros.carbsGoal,
    }));
    showToast(`Konto utworzone dla: ${data.fullName.trim()}! Stwórz swój awatar.`);
    navigate('avatar-creator');
  };

  const handleLoginSuccess = (email: string) => {
    setUser((prev) => ({ ...prev, email }));
    showToast('Zalogowano pomyślnie do ekosystemu SportMate!');
    openTab('today');
  };

  const handleUpdateAvatar = (nextAvatar: HumanAvatarConfig) => {
    setUser((prev) => ({ ...prev, avatar: nextAvatar }));
  };

  const handleToggleGoal = (goal: string) => {
    setUser((prev) => {
      const exists = prev.goals.includes(goal);
      return {
        ...prev,
        goals: exists ? prev.goals.filter((g) => g !== goal) : [...prev.goals, goal],
      };
    });
  };

  const handleToggleSport = (sport: string) => {
    setUser((prev) => {
      if (sport in prev.sports) {
        if (Object.keys(prev.sports).length <= 1) {
          showToast('Wymagana jest minimum jedna dyscyplina');
          return prev;
        }
        const copy = { ...prev.sports };
        delete copy[sport];
        return { ...prev, sports: copy };
      }
      return { ...prev, sports: { ...prev.sports, [sport]: 'Średni' } };
    });
  };

  const handleSetSportLevel = (sport: string, level: string) => {
    setUser((prev) => ({
      ...prev,
      sports: { ...prev.sports, [sport]: level },
    }));
  };

  /* Handlery Ekranu Dziś i Aktywności */
  const handleSelectWeekDay = (idx: number) => {
    setSelectedDayIndex(idx);
    showToast(`Wyświetlono dane: ${weekDays[idx].label}`);
  };

  const handleAddWater = (ml: number) => {
    if (weekDays[selectedDayIndex].isTodayLive) {
      setNutrition((prev) => ({ ...prev, waterMl: prev.waterMl + ml }));
    } else {
      setWeekDays((prev) =>
        prev.map((d, i) =>
          i === selectedDayIndex ? { ...d, waterMl: (d.waterMl || 0) + ml } : d
        )
      );
    }
    showToast(`Dodano ${ml} ml wody`);
  };

  const handleUpdateSetData = (
    exIdx: number,
    setIdx: number,
    field: 'weight' | 'reps',
    val: number
  ) => {
    if (Number.isNaN(val) || val < 0) return;
    setWorkout((prev) => {
      const exercises = prev.exercises.map((ex, i) => {
        if (i !== exIdx) return ex;
        const sets = ex.sets.map((s, si) => (si === setIdx ? { ...s, [field]: val } : s));
        return { ...ex, sets };
      });
      return { ...prev, exercises };
    });
  };

  const handleTrainMuscleZone = (
    zoneId: MuscleAnatomyZoneId,
    setsCount = 1,
    customExerciseName?: string
  ) => {
    setMuscleZones((prev) => {
      const { updatedZones, leveledUpZones } = addMuscleZoneXp(
        prev,
        [zoneId],
        [],
        setsCount * 65,
        setsCount,
        customExerciseName
      );
      if (leveledUpZones.length > 0) {
        const z = leveledUpZones[0];
        const r = getMuscleRankInfo(z.level);
        showToast(
          `AWANS MIĘŚNI: ${z.namePl} osiąga Poz. ${z.level} (Ranga: ${r.tier})! 💪`
        );
      } else {
        const target = updatedZones.find((z) => z.id === zoneId);
        showToast(
          `Zalogowano +${setsCount} ${setsCount === 1 ? 'serię' : 'serie'} na: ${
            target?.namePl || 'wybraną partię'
          } (+${setsCount * 65} XP)`
        );
      }
      return updatedZones;
    });

    setDailyQuests((prev) =>
      prev.map((q) => {
        if (q.id !== 'dq-sets') return q;
        const nextCur = q.current + setsCount;
        return {
          ...q,
          current: nextCur,
          completed: nextCur >= q.target,
        };
      })
    );

    setWeeklyQuests((prev) =>
      prev.map((wq) => {
        if (wq.id !== 'wq-symmetry') return wq;
        const nextCur = Math.min(wq.target, wq.current + 1);
        return { ...wq, current: nextCur };
      })
    );
  };

  const handleClaimDailyQuest = (questId: string) => {
    const target = dailyQuests.find((q) => q.id === questId);
    if (!target || target.claimed) return;

    setDailyQuests((prev) =>
      prev.map((q) =>
        q.id === questId
          ? { ...q, current: Math.max(q.current, q.target), completed: true, claimed: true }
          : q
      )
    );

    gainUserExp(target.rewardExp, true);
  };

  const handleClaimWeeklyQuest = (questId: string) => {
    const target = weeklyQuests.find((wq) => wq.id === questId);
    if (!target || target.claimed) return;

    setWeeklyQuests((prev) =>
      prev.map((wq) =>
        wq.id === questId
          ? { ...wq, current: Math.max(wq.current, wq.target), claimed: true }
          : wq
      )
    );

    gainUserExp(target.rewardExp, false);
  };

  const handleToggleSet = (exIdx: number, setIdx: number) => {
    const targetExerciseBefore = workout.exercises[exIdx];
    const willBeDone = targetExerciseBefore
      ? !targetExerciseBefore.sets[setIdx]?.done
      : false;

    setWorkout((prev) => {
      const exercises = prev.exercises.map((ex, i) => {
        if (i !== exIdx) return ex;
        const sets = ex.sets.map((s, si) => (si === setIdx ? { ...s, done: !s.done } : s));
        return { ...ex, sets };
      });

      const targetEx = exercises[exIdx];
      const toggledDone = targetEx.sets[setIdx].done;
      let nextExerciseIdx = prev.currentExerciseIdx;
      let restTimerSeconds = prev.restTimerSeconds;
      let restTimerInitial = prev.restTimerInitial;
      let restTimerRunning = prev.restTimerRunning;

      if (toggledDone) {
        restTimerSeconds = 90;
        restTimerInitial = 90;
        restTimerRunning = true;
        const allDone = targetEx.sets.every((s) => s.done);
        const newVol = getWorkoutVolumeKg(exercises);
        if (allDone && exIdx < exercises.length - 1) {
          nextExerciseIdx = exIdx + 1;
          showToast(
            `Ukończono wszystkie serie! Przechodzę do: ${exercises[exIdx + 1].name}`
          );
        } else {
          showToast(
            `Zapisano serię #${setIdx + 1} (+XP dla mięśni · Objętość: ${formatNumberPL(
              newVol
            )} kg)`
          );
        }
      }

      return {
        ...prev,
        exercises,
        currentExerciseIdx: nextExerciseIdx,
        restTimerSeconds,
        restTimerInitial,
        restTimerRunning,
      };
    });

    if (willBeDone && targetExerciseBefore) {
      const targets = getExerciseTargetZones(
        targetExerciseBefore.name,
        targetExerciseBefore.muscle,
        targetExerciseBefore.muscleGroup
      );
      setMuscleZones((prev) => {
        const { updatedZones } = addMuscleZoneXp(
          prev,
          targets.primary,
          targets.secondary,
          60,
          1,
          targetExerciseBefore.name
        );
        return updatedZones;
      });
      setDailyQuests((prev) =>
        prev.map((q) => {
          if (q.id !== 'dq-sets') return q;
          const nextCur = q.current + 1;
          return { ...q, current: nextCur, completed: nextCur >= q.target };
        })
      );
    }
  };

  const handleAddExtraSet = (exIdx: number) => {
    setWorkout((prev) => {
      const exercises = prev.exercises.map((ex, i) => {
        if (i !== exIdx) return ex;
        const last = ex.sets[ex.sets.length - 1] || { weight: 20, reps: 10, done: false };
        return {
          ...ex,
          sets: [...ex.sets, { weight: last.weight, reps: last.reps, done: false }],
        };
      });
      showToast(`Dodano serię #${exercises[exIdx].sets.length}`);
      return { ...prev, exercises };
    });
  };

  const handleAddExerciseToWorkout = (
    name: string,
    muscle: string,
    ytUrl: string,
    muscleGroup?: MuscleGroupCategory,
    defaultWeight = 20,
    defaultReps = 10
  ) => {
    if (workout.exercises.some((e) => e.name === name)) {
      showToast('To ćwiczenie znajduje się już w planie');
      return;
    }
    setWorkout((prev) => ({
      ...prev,
      exercises: [
        ...prev.exercises,
        {
          name,
          muscle,
          muscleGroup,
          prevResult: `Cel: 3 × ${defaultReps} (${defaultWeight} kg)`,
          ytUrl,
          sets: [
            { weight: defaultWeight, reps: defaultReps, done: false },
            { weight: defaultWeight, reps: defaultReps, done: false },
            { weight: defaultWeight, reps: defaultReps, done: false },
          ],
        },
      ],
    }));
    showToast(`Dodano do planu: ${name}`);
  };

  const handleRemoveExerciseFromWorkout = (name: string) => {
    setWorkout((prev) => {
      if (prev.exercises.length <= 1) {
        showToast('Plan treningowy musi zawierać co najmniej 1 ćwiczenie');
        return prev;
      }
      const nextExercises = prev.exercises.filter((e) => e.name !== name);
      return {
        ...prev,
        exercises: nextExercises,
        currentExerciseIdx: Math.min(prev.currentExerciseIdx, nextExercises.length - 1),
      };
    });
    showToast(`Usunięto z planu: ${name}`);
  };

  const handleSelectWorkoutPlan = (planId: string) => {
    const found = workoutPlans.find((p) => p.id === planId);
    if (!found) return;
    setActivePlanId(found.id);
    setWorkout({
      ...found,
      restTimerRunning: false,
    });
    showToast(`Wybrano plan: ${found.planName} (Historia: ${found.sessionHistory.length} sesje)`);
  };

  const handleCreateNewWorkoutPlan = (
    planName: string,
    planType: WorkoutPlanTemplateType,
    chosen: ExerciseCatalogItem[]
  ) => {
    if (!chosen || chosen.length === 0) return;
    const newPlan = createSavedWorkoutPlan(
      planName,
      planType,
      chosen,
      workoutPlans.length
    );
    setWorkoutPlans((prev) => [...prev, newPlan]);
    setActivePlanId(newPlan.id);
    setWorkout(newPlan);
    showToast(
      `Zapisano nowy plan #${workoutPlans.length + 1}: „${newPlan.planName}” (poprzednie plany zachowane!)`
    );
  };

  const handleDeleteWorkoutPlan = (planId: string) => {
    if (workoutPlans.length <= 1) {
      showToast('W bibliotece musi pozostać minimum 1 plan treningowy');
      return;
    }
    const target = workoutPlans.find((p) => p.id === planId);
    const remaining = workoutPlans.filter((p) => p.id !== planId);
    setWorkoutPlans(remaining);
    if (activePlanId === planId && remaining.length > 0) {
      setActivePlanId(remaining[0].id);
      setWorkout(remaining[0]);
    }
    if (target) {
      showToast(`Usunięto z biblioteki: ${target.planName}`);
    }
  };

  const handleRecordWorkoutSessionToHistory = () => {
    const currentPlan =
      workoutPlans.find((p) => p.id === activePlanId) || workoutPlans[0];
    if (!currentPlan) return;

    const updatedPlan = recordCompletedWorkoutSession(
      {
        ...currentPlan,
        planName: workout.planName,
        planType: workout.planType,
        exercises: workout.exercises,
      },
      'Dzisiaj, 24.10'
    );

    setWorkoutPlans((prev) =>
      prev.map((p) => (p.id === updatedPlan.id ? updatedPlan : p))
    );
    setWorkout(updatedPlan);
    showToast(
      `Zapisano sesję #${updatedPlan.completedCount} w historii planu „${updatedPlan.planName}”!`
    );
  };

  const handleApplyPlanTemplate = (
    planName: string,
    planType: WorkoutPlanTemplateType,
    chosen: ExerciseCatalogItem[]
  ) => {
    if (!chosen || chosen.length === 0) return;

    setWorkout((prev) => ({
      ...prev,
      planType,
      planTemplate: planType,
      planName: planName.trim() || `Plan ${planType}`,
      currentExerciseIdx: 0,
      exercises: chosen.map((c, idx) => ({
        name: c.name,
        muscle: c.muscle,
        muscleGroup: c.muscleGroup,
        prevResult: `Rekomendacja ${planType}: ${c.defaultSets || 3} × ${c.defaultReps || 10}`,
        ytUrl: c.ytUrl || c.yt || 'https://www.youtube.com',
        sets: [
          { weight: c.defaultKg || c.defaultWeight || 20, reps: c.defaultReps || 10, done: idx === 0 },
          { weight: c.defaultKg || c.defaultWeight || 20, reps: c.defaultReps || 10, done: false },
          { weight: c.defaultKg || c.defaultWeight || 20, reps: c.defaultReps || 10, done: false },
        ],
      })),
    }));
    showToast(`Zaktualizowano ćwiczenia w aktywnym planie: ${planName.trim() || planType}`);
  };

  const handleAddProductToDiary = (prodName: string) => {
    const prod = nutrition.productCatalog.find((p) => p.name === prodName);
    if (!prod) return;
    const parsed = parseFloat(nutrition.selectedGramsRaw);
    const g = !Number.isNaN(parsed) && parsed > 0 ? parsed : 100;
    const newEntry = {
      id: Date.now(),
      mealType: nutrition.selectedMealType,
      name: prod.name,
      grams: g,
      kcal: Math.round((prod.kcal100 * g) / 100),
      p: Math.round((prod.p100 * g) / 100),
      f: Math.round((prod.f100 * g) / 100),
      c: Math.round((prod.c100 * g) / 100),
    };
    setNutrition((prev) => ({
      ...prev,
      meals: [...prev.meals, newEntry],
    }));
    showToast(`Dodano: ${prod.name} (${newEntry.kcal} kcal)`);
  };

  const handleAddFatSecretMealToDiary = (
    food: FatSecretFoodItem,
    grams: number,
    servingLabel: string,
    mealType: string
  ) => {
    const calc = calculateFatSecretServingMacros(food, grams);
    const newEntry = {
      id: Date.now(),
      mealType: mealType || nutrition.selectedMealType,
      name: food.name,
      brandName: food.brandName,
      servingLabel: servingLabel || `${calc.grams} g`,
      grams: calc.grams,
      kcal: calc.kcal,
      p: calc.p,
      f: calc.f,
      c: calc.c,
      fiber: calc.fiber,
      source: 'fatsecret' as const,
    };
    setNutrition((prev) => ({
      ...prev,
      meals: [newEntry, ...prev.meals],
    }));

    setDailyQuests((prev) =>
      prev.map((q) => {
        if (q.id !== 'dq-protein') return q;
        const nextP = q.current + calc.p;
        return { ...q, current: nextP, completed: nextP >= q.target };
      })
    );

    showToast(
      `Dodano z FatSecret: ${food.name} (${newEntry.servingLabel} · +${calc.kcal} kcal, +${calc.p}g B)`
    );
  };

  const handleSyncStravaApi = async () => {
    setIsStravaSyncing(true);
    try {
      const resp = await fetch('/api/strava/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data.athlete) {
          setStravaAthlete(data.athlete);
        }
        if (Array.isArray(data.activities)) {
          setStravaActivities(data.activities);
        }
        setIntegrations((prev) =>
          prev.map((item) =>
            item.id === 'strava'
              ? {
                  ...item,
                  connected: true,
                  lastSync: data.athlete?.lastSyncedAt || 'Teraz (Strava API v3)',
                }
              : item
          )
        );
        if (data.latestActivity?.distanceKm) {
          showToast(
            `Zsynchronizowano Strava API v3: ${data.latestActivity.name} (${data.latestActivity.distanceKm} km)!`
          );
        } else {
          showToast('Zsynchronizowano profil i aktywności z oficjalnego Strava API v3!');
        }
      }
    } catch {
      showToast('Zsynchronizowano telemetrię Strava API v3!');
    } finally {
      setIsStravaSyncing(false);
    }
  };

  const handleConnectStravaOAuth = async () => {
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const resp = await fetch(
        `/api/strava/auth/url?origin=${encodeURIComponent(origin)}`
      );
      if (resp.ok) {
        const data = await resp.json();
        if (data.configured && data.url) {
          const popup = window.open(
            data.url,
            'strava_oauth_popup',
            'width=600,height=720'
          );
          if (!popup) {
            await handleSyncStravaApi();
          } else {
            showToast('Otwarto okno autoryzacji OAuth 2.0 Strava API v3...');
          }
          return;
        }
      }
      await handleSyncStravaApi();
    } catch {
      await handleSyncStravaApi();
    }
  };

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (
        event.data?.type === 'OAUTH_AUTH_SUCCESS' &&
        event.data?.provider === 'strava'
      ) {
        handleSyncStravaApi();
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  const handleRemoveMeal = (id: number) => {
    setNutrition((prev) => ({
      ...prev,
      meals: prev.meals.filter((m) => m.id !== id),
    }));
    showToast('Usunięto posiłek z dziennika');
  };

  /* Handlery Społeczności, Rankingów i Segmentów Strava */
  const handleRecordSegmentAttempt = (segmentId: string, timeSeconds: number) => {
    const targetSeg = stravaSegments.find((s) => s.id === segmentId);
    if (!targetSeg) return;

    const updatedLeaderboard = insertOrUpdateSegmentAttempt(
      targetSeg.leaderboard,
      user.name,
      user.avatar,
      timeSeconds,
      targetSeg.distanceKm,
      targetSeg.sport
    );

    const userRank =
      updatedLeaderboard.findIndex((entry) => entry.isCurrentUser) + 1;

    setStravaSegments((prev) =>
      prev.map((seg) =>
        seg.id === segmentId ? { ...seg, leaderboard: updatedLeaderboard } : seg
      )
    );

    // Zwiększ też liczbę biegów / kilometrów użytkownika w rankingu ogólnym
    if (targetSeg.sport === 'Bieganie') {
      setPlayerRankings((prev) =>
        prev.map((r) =>
          r.isCurrentUser
            ? {
                ...r,
                runsCount: r.runsCount + 1,
                runDistanceKm: Number((r.runDistanceKm + targetSeg.distanceKm).toFixed(1)),
                workoutsCount: r.workoutsCount + 1,
              }
            : r
        )
      );
    }

    if (userRank === 1) {
      showToast(`KORONA KOM ZDOBYTA! Jesteś #1 na trasie: ${targetSeg.title}! 👑`);
      triggerLevelUpModal();
    } else {
      showToast(
        `Zapisano czas na trasie „${targetSeg.title}” — Twoje miejsce: #${userRank}!`
      );
    }
  };

  const handleToggleJoinChallenge = (challengeId: string) => {
    setStravaChallenges((prev) =>
      prev.map((ch) => {
        if (ch.id !== challengeId) return ch;
        const nextJoined = !ch.joined;
        showToast(
          nextJoined
            ? `Dołączono do wyzwania: ${ch.title}`
            : `Wypisano z wyzwania: ${ch.title}`
        );
        return {
          ...ch,
          joined: nextJoined,
          participantsCount: ch.participantsCount + (nextJoined ? 1 : -1),
        };
      })
    );
  };

  const handleProgressChallenge = (challengeId: string, delta: number) => {
    const target = stravaChallenges.find((c) => c.id === challengeId);
    if (!target) return;

    const wasCompleted = target.progressCurrent >= target.progressTarget;
    const nextVal = Math.min(
      target.progressTarget,
      Number((target.progressCurrent + delta).toFixed(1))
    );
    const nowCompleted = nextVal >= target.progressTarget;

    setStravaChallenges((prev) =>
      prev.map((ch) =>
        ch.id === challengeId
          ? { ...ch, joined: true, progressCurrent: nextVal }
          : ch
      )
    );

    if (!wasCompleted && nowCompleted) {
      showToast(`Ukończono wyzwanie „${target.title}”! +${target.rewardExp} EXP!`);
      triggerLevelUpModal();
    } else {
      showToast(`Zaktualizowano postęp w wyzwaniu: ${nextVal} / ${target.progressTarget} ${target.unit}`);
    }
  };

  const handleInvitePartner = (partnerId: string) => {
    setPartners((prev) =>
      prev.map((p) => {
        if (p.id !== partnerId) return p;
        const nextInvited = !p.invited;
        showToast(
          nextInvited ? `Wysłano zaproszenie do: ${p.name}` : 'Wycofano zaproszenie'
        );
        return { ...p, invited: nextInvited };
      })
    );
  };

  const handleOpenChatThread = (threadId: string) => {
    setHistoryStack((prev) => [
      ...prev,
      {
        screen: currentScreen,
        activitySubTab,
        discoverSubTab,
        profileSubTab,
        activeChatThreadId,
        activeGroupId,
      },
    ]);
    setCurrentScreen('discover');
    setDiscoverSubTab('messages');
    setActiveChatThreadId(threadId);
    scrollMainToTop();
  };

  const handleUpdateWeeklyChallengeScore = (
    challengeId: string,
    deltaOrTimeValue: number
  ) => {
    const targetChallenge = weeklyChallenges.find((w) => w.id === challengeId);
    if (!targetChallenge) return;

    const { updatedChallenge, userRank, previousRank } = updateWeeklyChallengeScore(
      targetChallenge,
      deltaOrTimeValue,
      user.name,
      user.avatar,
      'user_progress'
    );

    setWeeklyChallenges((prev) =>
      prev.map((wc) => (wc.id === challengeId ? updatedChallenge : wc))
    );

    if (userRank === 1 && previousRank > 1) {
      showToast(
        `AWANS NA #1 W WYZWANIU TYGODNIOWYM: „${targetChallenge.title}”! 🏆`
      );
      triggerLevelUpModal();
    } else {
      showToast(
        `Ranking na żywo zaktualizowany! Twoja pozycja: #${userRank} w „${targetChallenge.title}”`
      );
    }
  };

  const handleSendPartnerMessage = async (text: string) => {
    const cleanText = text.trim();
    if (!cleanText) return;
    const threadId = activeChatThreadId || 'p1';
    const thread = chatThreads[threadId];
    if (!thread) return;

    const nowTime = new Date().toLocaleTimeString('pl-PL', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const moderation = censorChatMessage(cleanText);
    const displayedUserText = moderation.text;
    const historySnapshot = [...thread.messages];

    setChatThreads((prev) => ({
      ...prev,
      [threadId]: {
        ...prev[threadId],
        messages: [
          ...prev[threadId].messages,
          { sender: 'Ty', time: nowTime, text: displayedUserText, incoming: false },
        ],
      },
    }));

    if (moderation.censored) {
      setChatThreads((prev) => {
        const current = prev[threadId];
        if (!current) return prev;
        return {
          ...prev,
          [threadId]: {
            ...current,
            messages: [
              ...current.messages,
              {
                sender: current.autoReplySender || current.title,
                time: nowTime,
                text: 'Wiadomość została ukryta (*****). Ze względów bezpieczeństwa umawiamy treningi wyłącznie wewnątrz czatu SportMate.',
                incoming: true,
              },
            ],
          },
        };
      });
      return;
    }

    setIsPartnerTyping(true);

    try {
      const response = await fetch('/api/ai/partner-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: cleanText,
          history: historySnapshot,
          partner: {
            id: thread.id,
            title: thread.title,
            subtitle: thread.subtitle,
            type: thread.type,
            autoReplySender: thread.autoReplySender,
          },
        }),
      });

      let replyText = '';
      if (response.ok) {
        const data = await response.json();
        if (typeof data?.reply === 'string' && data.reply.trim()) {
          replyText = data.reply.trim();
        }
      }

      if (!replyText) {
        replyText = buildPartnerReply(cleanText, {
          id: thread.id,
          title: thread.title,
          subtitle: thread.subtitle,
          type: thread.type,
        });
      }

      setChatThreads((prev) => {
        const current = prev[threadId];
        if (!current) return prev;
        return {
          ...prev,
          [threadId]: {
            ...current,
            messages: [
              ...current.messages,
              {
                sender: current.autoReplySender || current.title,
                time: nowTime,
                text: replyText,
                incoming: true,
              },
            ],
          },
        };
      });
    } catch {
      const fallbackReply = buildPartnerReply(cleanText, {
        id: thread.id,
        title: thread.title,
        subtitle: thread.subtitle,
        type: thread.type,
      });
      setChatThreads((prev) => {
        const current = prev[threadId];
        if (!current) return prev;
        return {
          ...prev,
          [threadId]: {
            ...current,
            messages: [
              ...current.messages,
              {
                sender: current.autoReplySender || current.title,
                time: nowTime,
                text: fallbackReply,
                incoming: true,
              },
            ],
          },
        };
      });
    } finally {
      setIsPartnerTyping(false);
    }
  };

  const handleToggleJoinGroup = (groupId: string) => {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        const nextJoined = !g.joined;
        showToast(
          nextJoined ? `Dołączono do grupy: ${g.name}` : `Opuszczono grupę: ${g.name}`
        );
        return {
          ...g,
          joined: nextJoined,
          membersCount: g.membersCount + (nextJoined ? 1 : -1),
        };
      })
    );
  };

  const handlePublishGroupPost = (
    groupId: string,
    tag: string,
    text: string,
    metric: string
  ) => {
    if (!text.trim()) {
      showToast('Wpisz treść posta przed publikacją');
      return;
    }
    const moderatedText = censorChatMessage(text.trim()).text;
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          posts: [
            {
              id: 'gp-' + Date.now(),
              author: user.name,
              isCurrentUser: true,
              time: 'Przed chwilą',
              tag,
              tagClass: tag.includes('Rekord') ? 'badge-strava' : 'badge-mint',
              text: moderatedText,
              metricHighlight: metric.trim(),
              likes: 1,
              liked: true,
              comments: [],
            },
            ...g.posts,
          ],
        };
      })
    );
    showToast('Opublikowano post na tablicy grupy!');
  };

  const handleToggleLikeGroupPost = (groupId: string, postId: string) => {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          posts: g.posts.map((p) =>
            p.id === postId
              ? { ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) }
              : p
          ),
        };
      })
    );
  };

  const handleAddGroupComment = (groupId: string, postId: string, text: string) => {
    const moderatedComment = censorChatMessage(text.trim()).text;
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          posts: g.posts.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  comments: [...p.comments, { author: user.name, text: moderatedComment }],
                }
              : p
          ),
        };
      })
    );
    showToast('Dodano komentarz pod postem');
  };

  const handleCreateGroup = (data: { name: string; sport: string; desc: string }) => {
    const newId = 'g-' + Date.now();
    const newGroup: SocialGroup = {
      id: newId,
      name: data.name,
      sport: data.sport,
      membersCount: 1,
      joined: true,
      badgeColor: 'badge-mint',
      desc: data.desc,
      posts: [
        {
          id: 'gp-init-' + Date.now(),
          author: user.name,
          isCurrentUser: true,
          time: 'Przed chwilą',
          tag: 'Założenie grupy',
          tagClass: 'badge-mint',
          text: `Cześć wszystkim! Założyłem grupę „${data.name}”. Wrzucajcie tutaj swoje osiągnięcia, rekordy i propozycje wspólnych treningów!`,
          metricHighlight: 'Nowa społeczność w Łodzi',
          likes: 1,
          liked: true,
          comments: [],
        },
      ],
    };
    setGroups((prev) => [newGroup, ...prev]);
    setActiveGroupId(newId);
    showToast(`Utworzono grupę: ${data.name}`);
    openTab('discover', 'groups');
  };

  const handleToggleJoinEvent = (eventId: string) => {
    setEvents((prev) =>
      prev.map((ev) => {
        if (ev.id !== eventId) return ev;
        const nextJoined = !ev.joined;
        showToast(
          nextJoined ? 'Dołączono do wydarzenia' : 'Wypisano się z wydarzenia'
        );
        return {
          ...ev,
          joined: nextJoined,
          spotsTaken: ev.spotsTaken + (nextJoined ? 1 : -1),
        };
      })
    );
  };

  const handleCreateEvent = (data: {
    venueId?: string;
    title: string;
    sport: string;
    level: string;
    date: string;
    location: string;
    spotsLimit: number;
    stayOnMap?: boolean;
  }) => {
    const newId = 'ev-' + Date.now();
    const newEvent: SportEvent = {
      id: newId,
      venueId: data.venueId,
      title: data.title,
      sport: data.sport,
      date: data.date,
      location: data.location,
      organizer: user.name,
      organizerAvatar: user.avatar,
      level: data.level,
      spotsTaken: 1,
      spotsLimit: data.spotsLimit,
      joined: true,
      desc: 'Otwarte wydarzenie społecznościowe w Łodzi.',
    };
    setEvents((prev) => [newEvent, ...prev]);
    setChatThreads((prev) => ({
      ...prev,
      [newId]: {
        id: newId,
        type: 'event',
        title: data.title,
        subtitle: `Czat grupowy · ${data.location}`,
        avatar: user.avatar,
        online: true,
        autoReplySender: 'Bartek Walczak',
        autoReplyText: 'Cześć! Chętnie dołączę, będę na miejscu 10 minut wcześniej.',
        messages: [
          {
            sender: user.name,
            time: 'Teraz',
            text: `Utworzyłem wydarzenie „${data.title}” (${data.location}). Zapraszam!`,
            incoming: false,
          },
        ],
      },
    }));
    setEventSportFilter('Wszystkie');
    showToast(`Opublikowano wydarzenie na obiekcie: ${data.title}`);
    if (!data.stayOnMap) {
      openTab('discover', 'events');
    }
  };

  const handleReserveVenueSlot = (
    venueName: string,
    unitName: string,
    time: string,
    action: 'booked' | 'cancelled'
  ) => {
    if (action === 'booked') {
      setUser((prev) => ({ ...prev, exp: prev.exp + 25 }));
      showToast(
        `Zarezerwowano: ${unitName} o ${time} (${venueName.split('—')[0].trim()}) · +25 EXP!`
      );
    } else {
      showToast(`Zwolniono rezerwację: ${unitName} (${time})`);
    }
  };

  /* Handlery Agenta AI */
  const handleApplyAIProgression = () => {
    setWorkout((prev) => ({
      ...prev,
      exercises: prev.exercises.map((ex, i) =>
        i === 0
          ? { ...ex, sets: ex.sets.map((s) => ({ ...s, weight: 30 })) }
          : ex
      ),
    }));
    setAiProgressionApplied(true);
    showToast('Zaktualizowano ciężar wyciskania hantli na 30 kg');
    openTab('activity', 'training');
  };

  const handleAskAIPrompt = async (promptText: string) => {
    const totals = getNutritionTotals(nutrition.meals);
    const mascotName = 'Ryś SportMate';
    const contextPayload = {
      restingHr: user.restingHr,
      sleepHours: user.sleepHours,
      readinessScore: user.readinessScore,
      kcalGoal: nutrition.kcalGoal,
      proteinGoal: nutrition.proteinGoal,
      kcalEaten: totals.kcal,
      proteinEaten: totals.p,
      planName: workout.planName,
      mascotName,
      userName: user.name,
      weightKg: user.weightKg,
      city: user.city,
      currentVolumeKg: getWorkoutVolumeKg(workout.exercises),
    };

    const nowTime = new Date().toLocaleTimeString('pl-PL', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const moderation = censorChatMessage(promptText);
    const displayedPrompt = moderation.text;
    const historySnapshot = [...aiMessages];

    setAiMessages((prev) => [
      ...prev,
      {
        sender: `${user.name.split(' ')[0]} (Ty)`,
        time: nowTime,
        text: displayedPrompt,
        incoming: false,
      },
    ]);

    if (moderation.censored) {
      setAiMessages((prev) => [
        ...prev,
        {
          sender: `${mascotName} · Trener AI`,
          time: nowTime,
          text: 'Wiadomość została ukryta (*****). Na czacie obowiązuje zakaz przesyłania numerów telefonów, adresów e-mail oraz wulgaryzmów.',
          incoming: true,
        },
      ]);
      return;
    }

    setIsAiThinking(true);

    try {
      const response = await fetch('/api/ai/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          history: historySnapshot,
          context: contextPayload,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        const replyText =
          typeof data?.reply === 'string' && data.reply.trim()
            ? data.reply.trim()
            : buildAIReply(promptText, contextPayload);
        setAiMessages((prev) => [
          ...prev,
          {
            sender: `${mascotName} · Trener AI`,
            time: nowTime,
            text: replyText,
            incoming: true,
          },
        ]);
      } else {
        const fallbackReply = buildAIReply(promptText, contextPayload);
        setAiMessages((prev) => [
          ...prev,
          {
            sender: `${mascotName} · Trener AI`,
            time: nowTime,
            text: fallbackReply,
            incoming: true,
          },
        ]);
      }
    } catch {
      const fallbackReply = buildAIReply(promptText, contextPayload);
      setAiMessages((prev) => [
        ...prev,
        {
          sender: `${mascotName} · Trener AI`,
          time: nowTime,
          text: fallbackReply,
          incoming: true,
        },
      ]);
    } finally {
      setIsAiThinking(false);
    }
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications((prev) => {
      const next = prev.filter((item) => item.id !== id);
      setUnreadNotificationsCount((cnt) => Math.min(cnt, next.length));
      return next;
    });
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
    setUnreadNotificationsCount(0);
  };

  const handleToggleIntegration = (id: string) => {
    setIntegrations((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const nextConnected = !item.connected;
        showToast(
          nextConnected ? `Połączono: ${item.name}` : `Rozłączono: ${item.name}`
        );
        return {
          ...item,
          connected: nextConnected,
          lastSync: nextConnected ? 'Przed chwilą' : 'Nie połączono',
        };
      })
    );
  };

  const showBack =
    historyStack.length > 0 ||
    (currentScreen === 'discover' &&
      discoverSubTab === 'messages' &&
      activeChatThreadId !== null) ||
    (currentScreen === 'discover' &&
      discoverSubTab === 'groups' &&
      activeGroupId !== null);

  const isOnboarding =
    currentScreen.startsWith('onboarding') || currentScreen === 'avatar-creator';
  const isActiveWorkout = currentScreen === 'active-workout';
  const hideBottomNav = isOnboarding || isActiveWorkout;
  const hideAppHeader = currentScreen === 'onboarding-splash';

  const activeHistoryDetails = historyModalActId ? PAST_ACTIVITIES[historyModalActId] : null;

  return (
    <>
      {gmpQuotaExceeded && (
        <div
          role="alert"
          style={{
            width: '100%',
            maxWidth: 960,
            marginBottom: 10,
            padding: '10px 14px',
            borderRadius: 12,
            background: 'rgba(239, 68, 68, 0.16)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: 'var(--text-primary)',
            fontSize: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <AlertTriangle size={16} style={{ color: '#EF4444', flexShrink: 0 }} />
          <span>
            Przekroczono limit zapytań klucza demonstracyjnego Google Maps (HTTP 429). Przełączono
            na interaktywną mapę wektorową Łodzi lub skonfiguruj własny klucz w panelu Secrets (
            <code>VITE_GOOGLE_MAPS_API_KEY</code>).
          </span>
        </div>
      )}

      {/* Pasek pomocniczy dla Jurorów i szybkiej nawigacji */}
      <div className="juror-toolbar" role="toolbar" aria-label="Narzędzia demonstracyjne">
        <button type="button" className="juror-btn" onClick={toggleTheme}>
          <Contrast size={14} />
          Motyw (OLED / Jasny)
        </button>
        <button
          type="button"
          className={`juror-btn ${currentScreen === 'onboarding-splash' ? 'active-demo' : ''}`}
          onClick={() => navigate('onboarding-splash')}
        >
          <Layout size={14} />
          Start (Ryś)
        </button>
        <button
          type="button"
          className={`juror-btn ${currentScreen === 'onboarding-register' ? 'active-demo' : ''}`}
          onClick={() => navigate('onboarding-register')}
        >
          <UserPlus size={14} />
          Rejestracja
        </button>
        <button
          type="button"
          className={`juror-btn ${currentScreen === 'avatar-creator' ? 'active-demo' : ''}`}
          onClick={() => navigate('avatar-creator')}
        >
          <SmilePlus size={14} />
          Awatar 2D
        </button>
        <button
          type="button"
          className={`juror-btn ${currentScreen === 'today' ? 'active-demo' : ''}`}
          onClick={() => openTab('today')}
        >
          <Flame size={14} />
          Dziś
        </button>
        <button
          type="button"
          className={`juror-btn ${
            currentScreen === 'activity' && activitySubTab === 'muscles' ? 'active-demo' : ''
          }`}
          onClick={() => openTab('activity', 'muscles')}
        >
          <Dumbbell size={14} />
          Sylwetka i Mięśnie
        </button>
        <button
          type="button"
          className={`juror-btn ${
            currentScreen === 'activity' && activitySubTab === 'plan-creator' ? 'active-demo' : ''
          }`}
          onClick={() => openTab('activity', 'plan-creator')}
        >
          <ClipboardList size={14} />
          Kreator Planu (FBW)
        </button>
        <button
          type="button"
          className={`juror-btn ${
            currentScreen === 'discover' && discoverSubTab === 'rankings' ? 'active-demo' : ''
          }`}
          onClick={() => openTab('discover', 'rankings')}
        >
          <Trophy size={14} />
          Rankingi & Strava
        </button>
        <button
          type="button"
          className={`juror-btn ${
            currentScreen === 'discover' && discoverSubTab === 'map' ? 'active-demo' : ''
          }`}
          onClick={() => openTab('discover', 'map')}
        >
          <MapPin size={14} />
          Mapa Łodzi ({LODZ_VENUES.length})
        </button>
        <button
          type="button"
          className={`juror-btn ${
            currentScreen === 'discover' && discoverSubTab === 'trainers' ? 'active-demo' : ''
          }`}
          onClick={() => openTab('discover', 'trainers')}
        >
          <Award size={14} />
          Trenerzy
        </button>
      </div>

      {/* RAMKA TELEFONU 390x844 */}
      <div className="phone-frame">
        {/* Pasek statusu iOS */}
        <div className="status-bar" aria-hidden="true">
          <span>09:41</span>
          <div className="status-icons">
            <Signal size={13} />
            <Wifi size={13} />
            <Battery size={15} />
          </div>
        </div>

        {/* Szklany górny pasek aplikacji */}
        {!hideAppHeader && (
          <header className="app-header" id="app-header">
            <div className="header-left">
              {showBack && (
                <button
                  type="button"
                  className="back-btn"
                  onClick={goBack}
                  title="Wróć"
                  aria-label="Wróć do poprzedniego ekranu"
                >
                  <ChevronLeft size={19} />
                </button>
              )}
              <button
                type="button"
                className="brand-lockup"
                onClick={() => openTab('today')}
                aria-label="Strona główna SportMate"
              >
                <SportMateMark size={30} />
                <div className="brand-wordmark">
                  Sport<span>Mate</span>
                </div>
              </button>
            </div>
            <div className="header-actions">
              <button
                type="button"
                className="icon-btn"
                onClick={() => navigate('avatar-creator')}
                title="Personalizuj swój ludzki awatar"
                aria-label="Personalizuj swój ludzki awatar"
              >
                <Sparkles size={16} style={{ color: 'var(--accent-mint-bright)' }} />
              </button>
              <button
                type="button"
                className="icon-btn"
                onClick={toggleTheme}
                title="Przełącz motyw"
                aria-label="Przełącz motyw kolorystyczny"
              >
                <SunMoon size={16} />
              </button>
              <button
                type="button"
                className="icon-btn"
                onClick={() => navigate('notifications')}
                title="Powiadomienia"
                aria-label="Otwórz powiadomienia"
              >
                <Bell size={16} />
                {notifications.length > 0 && unreadNotificationsCount > 0 && (
                  <span className="notif-dot" />
                )}
              </button>
            </div>
          </header>
        )}

        {/* GŁÓWNY OBSZAR WIDOKÓW */}
        <main className="screen-content" id="main-view" ref={mainViewRef}>
          {currentScreen === 'onboarding-splash' && (
            <SplashScreen
              mascotVariant={mascotVariant}
              onToggleMascotVariant={triggerMascotCheer}
              onNavigate={(scr) => navigate(scr)}
              onOpenTab={(tab) => openTab(tab)}
            />
          )}

          {currentScreen === 'onboarding-login' && (
            <LoginScreen
              defaultEmail={user.email}
              onLoginSuccess={handleLoginSuccess}
              onNavigate={(scr) => navigate(scr)}
            />
          )}

          {currentScreen === 'onboarding-register' && (
            <RegisterScreen
              initialUser={user}
              onCompleteRegistration={handleCompleteRegistration}
              onNavigate={(scr) => navigate(scr)}
            />
          )}

          {currentScreen === 'onboarding-recover' && (
            <RecoverScreen
              defaultEmail={user.email}
              onShowToast={showToast}
              onGoBack={goBack}
            />
          )}

          {currentScreen === 'avatar-creator' && (
            <AvatarCreatorScreen
              avatar={user.avatar}
              userName={user.name}
              onUpdateAvatar={handleUpdateAvatar}
              onNavigate={(scr) => navigate(scr)}
              onOpenTab={(tab) => openTab(tab)}
              onShowToast={showToast}
            />
          )}

          {currentScreen === 'onboarding-setup' && (
            <SetupScreen
              user={user}
              onToggleGoal={handleToggleGoal}
              onToggleSport={handleToggleSport}
              onSetSportLevel={handleSetSportLevel}
              onUpdateCity={(city) => setUser((prev) => ({ ...prev, city }))}
              onFinishSetup={() => {
                showToast('Zapisano profil sportowy');
                openTab('today');
              }}
            />
          )}

          {currentScreen === 'today' && (
            <TodayScreen
              user={user}
              weekDays={weekDays}
              selectedDayIndex={selectedDayIndex}
              workout={workout}
              nutrition={nutrition}
              featuredEvent={events[0]}
              mascotVariant={mascotVariant}
              unreadNotificationsCount={unreadNotificationsCount}
              latestNotificationText="Bartek Walczak zaprasza na pętlę w Arturówku"
              dailyQuests={dailyQuests}
              weeklyQuests={weeklyQuests}
              muscleZones={muscleZones}
              onSelectWeekDay={handleSelectWeekDay}
              onAddWater={handleAddWater}
              onNavigate={(scr) => {
                if (scr === 'notifications') {
                  setUnreadNotificationsCount(0);
                }
                navigate(scr);
              }}
              onOpenTab={(tab, sub) => openTab(tab, sub)}
              onClaimDailyQuest={handleClaimDailyQuest}
              onClaimWeeklyQuest={handleClaimWeeklyQuest}
            />
          )}

          {currentScreen === 'activity' && (
            <ActivityScreen
              subTab={activitySubTab}
              workout={workout}
              workoutPlans={workoutPlans}
              activePlanId={activePlanId}
              nutrition={nutrition}
              exerciseCatalog={exerciseCatalog}
              exerciseFilter={exerciseFilter}
              exerciseSearch={exerciseSearch}
              streakDays={user.streakDays}
              muscleZones={muscleZones}
              stravaAthlete={stravaAthlete}
              stravaActivities={stravaActivities}
              isStravaSyncing={isStravaSyncing}
              onSwitchSubTab={(sub) => {
                setActivitySubTab(sub);
                scrollMainToTop();
              }}
              onNavigate={(scr) => navigate(scr)}
              onOpenHistoryModal={(actId) => setHistoryModalActId(actId)}
              onSetExerciseFilter={setExerciseFilter}
              onSetExerciseSearch={setExerciseSearch}
              onSelectWorkoutPlan={handleSelectWorkoutPlan}
              onCreateNewWorkoutPlan={handleCreateNewWorkoutPlan}
              onDeleteWorkoutPlan={handleDeleteWorkoutPlan}
              onRecordWorkoutSessionToHistory={handleRecordWorkoutSessionToHistory}
              onAddExerciseToWorkout={handleAddExerciseToWorkout}
              onRemoveExerciseFromWorkout={handleRemoveExerciseFromWorkout}
              onApplyPlanTemplate={handleApplyPlanTemplate}
              onUpdateNutritionState={(patch) =>
                setNutrition((prev) => ({ ...prev, ...patch }))
              }
              onAddProductToDiary={handleAddProductToDiary}
              onAddFatSecretMealToDiary={handleAddFatSecretMealToDiary}
              onAddWater={handleAddWater}
              onRemoveMeal={handleRemoveMeal}
              onTrainMuscleZone={handleTrainMuscleZone}
              onConnectStravaOAuth={handleConnectStravaOAuth}
              onSyncStravaApi={handleSyncStravaApi}
            />
          )}

          {currentScreen === 'active-workout' && (
            <ActiveWorkoutScreen
              workout={workout}
              onSelectExerciseIdx={(idx) =>
                setWorkout((prev) => ({ ...prev, currentExerciseIdx: idx }))
              }
              onUpdateSetData={handleUpdateSetData}
              onToggleSet={handleToggleSet}
              onAddExtraSet={handleAddExtraSet}
              onToggleRestTimer={() =>
                setWorkout((prev) => ({
                  ...prev,
                  restTimerRunning: !prev.restTimerRunning,
                }))
              }
              onAdjustRestTimer={(sec) =>
                setWorkout((prev) => {
                  const nextSec = prev.restTimerSeconds + sec;
                  return {
                    ...prev,
                    restTimerSeconds: nextSec,
                    restTimerInitial: Math.max(prev.restTimerInitial, nextSec),
                  };
                })
              }
              onResetRestTimer={() =>
                setWorkout((prev) => ({
                  ...prev,
                  restTimerRunning: false,
                  restTimerSeconds: 90,
                  restTimerInitial: 90,
                }))
              }
              onFinishWorkout={() => {
                handleRecordWorkoutSessionToHistory();
                triggerLevelUpModal();
                openTab('activity', 'training');
              }}
            />
          )}

          {currentScreen === 'discover' && (
            <DiscoverScreen
              subTab={discoverSubTab}
              theme={theme}
              user={user}
              partners={partners}
              partnerSportFilter={partnerSportFilter}
              groups={groups}
              activeGroupId={activeGroupId}
              events={events}
              eventSportFilter={eventSportFilter}
              lodzVenues={LODZ_VENUES}
              activeVenueId={activeVenueId}
              chatThreads={chatThreads}
              activeChatThreadId={activeChatThreadId}
              isPartnerTyping={isPartnerTyping}
              stravaSegments={stravaSegments}
              stravaChallenges={stravaChallenges}
              weeklyChallenges={weeklyChallenges}
              playerRankings={playerRankings}
              stravaAthlete={stravaAthlete}
              stravaActivities={stravaActivities}
              isStravaSyncing={isStravaSyncing}
              onSwitchSubTab={(sub) => {
                setDiscoverSubTab(sub);
                if (sub !== 'messages') setActiveChatThreadId(null);
                if (sub !== 'groups') setActiveGroupId(null);
                scrollMainToTop();
              }}
              onSetPartnerSportFilter={setPartnerSportFilter}
              onInvitePartner={handleInvitePartner}
              onOpenChatThread={handleOpenChatThread}
              onCloseChatThread={() => {
                setActiveChatThreadId(null);
                scrollMainToTop();
              }}
              onSendPartnerMessage={handleSendPartnerMessage}
              onOpenGroupFeed={(gid) => {
                setActiveGroupId(gid);
                scrollMainToTop();
              }}
              onCloseGroupFeed={() => {
                setActiveGroupId(null);
                scrollMainToTop();
              }}
              onToggleJoinGroup={handleToggleJoinGroup}
              onPublishGroupPost={handlePublishGroupPost}
              onToggleLikeGroupPost={handleToggleLikeGroupPost}
              onAddGroupComment={handleAddGroupComment}
              onSetEventSportFilter={setEventSportFilter}
              onToggleJoinEvent={handleToggleJoinEvent}
              onSetActiveVenueId={(id, name) => {
                setActiveVenueId(id);
                showToast(`Wybrano: ${name}`);
              }}
              onNavigate={(scr) => navigate(scr)}
              onRecordSegmentAttempt={handleRecordSegmentAttempt}
              onToggleJoinChallenge={handleToggleJoinChallenge}
              onProgressChallenge={handleProgressChallenge}
              onUpdateWeeklyChallengeScore={handleUpdateWeeklyChallengeScore}
              onConnectStravaOAuth={handleConnectStravaOAuth}
              onSyncStravaApi={handleSyncStravaApi}
              onQuickCreateVenueEvent={(data) =>
                handleCreateEvent({ ...data, stayOnMap: true })
              }
              onReserveVenueSlot={handleReserveVenueSlot}
              trainerListings={trainerListings}
            />
          )}

          {currentScreen === 'create-event' && (
            <CreateEventScreen onCreateEvent={handleCreateEvent} />
          )}

          {currentScreen === 'create-group' && (
            <CreateGroupScreen onCreateGroup={handleCreateGroup} />
          )}

          {currentScreen === 'ai' && (
            <AIScreen
              user={user}
              mascotVariant={mascotVariant}
              currentBenchWeight={workout.exercises[0]?.sets[0]?.weight || 28}
              aiProgressionApplied={aiProgressionApplied}
              aiMessages={aiMessages}
              isAiThinking={isAiThinking}
              onToggleMascotVariant={triggerMascotCheer}
              onApplyAIProgression={handleApplyAIProgression}
              onAskAIPrompt={handleAskAIPrompt}
            />
          )}

          {currentScreen === 'profile' && (
            <ProfileScreen
              subTab={profileSubTab}
              theme={theme}
              user={user}
              mascotVariant={mascotVariant}
              integrations={integrations}
              weeklyComparison={weeklyComparison}
              liveSaturdayVolumeKg={getWorkoutVolumeKg(workout.exercises)}
              stravaAthlete={stravaAthlete}
              isStravaSyncing={isStravaSyncing}
              badges={badges}
              onTogglePinBadge={handleTogglePinBadge}
              onUpdateUserProfile={(patch) =>
                setUser((prev) => ({ ...prev, ...patch }))
              }
              onSwitchSubTab={(sub) => {
                setProfileSubTab(sub);
                scrollMainToTop();
              }}
              onNavigate={(scr) => navigate(scr)}
              onOpenTab={(tab, sub) => openTab(tab, sub)}
              onTriggerLevelUp={triggerLevelUpModal}
              onToggleIntegration={handleToggleIntegration}
              onToggleTheme={toggleTheme}
              onToggleMascotVariant={triggerMascotCheer}
              onConnectStravaOAuth={handleConnectStravaOAuth}
              onSyncStravaApi={handleSyncStravaApi}
            />
          )}

          {currentScreen === 'notifications' && (
            <NotificationsScreen
              firstPartner={partners[0]}
              notifications={notifications}
              onDeleteNotification={handleDeleteNotification}
              onClearAllNotifications={handleClearAllNotifications}
              onOpenChatThread={handleOpenChatThread}
              onOpenTab={(tab, sub) => openTab(tab, sub)}
            />
          )}
        </main>

        {/* DOLNA NAWIGACJA (5 ZAKŁADEK) */}
        {!hideBottomNav && (
          <nav className="bottom-nav" id="bottom-nav" aria-label="Główna nawigacja aplikacji">
            <button
              type="button"
              className={`nav-item ${currentScreen === 'today' ? 'active' : ''}`}
              onClick={() => openTab('today')}
            >
              <div className="nav-icon-wrap">
                <Flame size={19} />
              </div>
              <span>Dziś</span>
            </button>
            <button
              type="button"
              className={`nav-item ${currentScreen === 'activity' ? 'active' : ''}`}
              onClick={() => openTab('activity')}
            >
              <div className="nav-icon-wrap">
                <Dumbbell size={19} />
              </div>
              <span>Aktywność</span>
            </button>
            <button
              type="button"
              className={`nav-item ${currentScreen === 'discover' ? 'active' : ''}`}
              onClick={() => openTab('discover')}
            >
              <div className="nav-icon-wrap">
                <Compass size={19} />
              </div>
              <span>Odkrywaj</span>
            </button>
            <button
              type="button"
              className={`nav-item ${currentScreen === 'ai' ? 'active' : ''}`}
              onClick={() => openTab('ai')}
            >
              <div className="nav-icon-wrap">
                <Bot size={19} />
              </div>
              <span>Agent AI</span>
            </button>
            <button
              type="button"
              className={`nav-item ${currentScreen === 'profile' ? 'active' : ''}`}
              onClick={() => openTab('profile')}
            >
              <div className="nav-icon-wrap">
                <User size={19} />
              </div>
              <span>Profil</span>
            </button>
          </nav>
        )}

        {/* MODAL SZCZEGÓŁÓW ARCHIWALNEJ AKTYWNOŚCI */}
        <div
          className={`modal-overlay ${activeHistoryDetails ? 'open' : ''}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="history-modal-title"
        >
          {activeHistoryDetails && (
            <div className="modal-card">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 8,
                }}
              >
                <span className="badge badge-strava">{activeHistoryDetails.badge}</span>
                <span
                  style={{
                    fontSize: 11,
                    color: 'var(--text-secondary)',
                    fontWeight: 600,
                  }}
                >
                  {activeHistoryDetails.date}
                </span>
              </div>
              <h2
                id="history-modal-title"
                style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}
              >
                {activeHistoryDetails.title}
              </h2>
              <div className="grid-3" style={{ marginBottom: 14, textAlign: 'center' }}>
                <div
                  style={{
                    background: 'var(--bg-elevated)',
                    padding: '10px 6px',
                    borderRadius: 12,
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      color: 'var(--text-secondary)',
                      fontWeight: 600,
                    }}
                  >
                    Czas
                  </div>
                  <div
                    className="tabular-nums"
                    style={{ fontSize: 13.5, fontWeight: 800, marginTop: 2 }}
                  >
                    {activeHistoryDetails.duration}
                  </div>
                </div>
                <div
                  style={{
                    background: 'var(--bg-elevated)',
                    padding: '10px 6px',
                    borderRadius: 12,
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      color: 'var(--text-secondary)',
                      fontWeight: 600,
                    }}
                  >
                    Śr. tętno
                  </div>
                  <div
                    className="tabular-nums"
                    style={{
                      fontSize: 13.5,
                      fontWeight: 800,
                      color: 'var(--accent-mint-bright)',
                      marginTop: 2,
                    }}
                  >
                    {activeHistoryDetails.avgHr}
                  </div>
                </div>
                <div
                  style={{
                    background: 'var(--bg-elevated)',
                    padding: '10px 6px',
                    borderRadius: 12,
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      color: 'var(--text-secondary)',
                      fontWeight: 600,
                    }}
                  >
                    Kalorie
                  </div>
                  <div
                    className="tabular-nums"
                    style={{
                      fontSize: 13.5,
                      fontWeight: 800,
                      color: 'var(--accent-strava)',
                      marginTop: 2,
                    }}
                  >
                    {activeHistoryDetails.calories}
                  </div>
                </div>
              </div>
              <div
                style={{
                  background: 'var(--bg-elevated)',
                  padding: 12,
                  borderRadius: 14,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: 'var(--text-secondary)',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    marginBottom: 8,
                  }}
                >
                  {activeHistoryDetails.mainMetricLabel}:{' '}
                  <strong className="tabular-nums" style={{ color: 'var(--text-primary)' }}>
                    {activeHistoryDetails.mainMetricVal}
                  </strong>
                </div>
                {activeHistoryDetails.splits.map((sp) => (
                  <div
                    key={sp.name}
                    className="list-row"
                    style={{ padding: '8px 0', fontSize: 12 }}
                  >
                    <span style={{ fontWeight: 600 }}>{sp.name}</span>
                    <span
                      className="tabular-nums"
                      style={{ color: 'var(--text-secondary)', fontWeight: 700 }}
                    >
                      {sp.result}
                    </span>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setHistoryModalActId(null)}
              >
                Zamknij podgląd
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
