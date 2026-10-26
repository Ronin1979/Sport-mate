import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  Droplets,
  Dumbbell,
  ExternalLink,
  Flag,
  Pause,
  Play,
  PlayCircle,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import {
  ActivitySubTab,
  ExerciseCatalogItem,
  FatSecretFoodItem,
  FoodCategory,
  MacroSuggestionFocus,
  MuscleAnatomyZoneId,
  MuscleGroupCategory,
  MuscleZoneProgress,
  NutritionState,
  SavedWorkoutPlan,
  ScreenName,
  StravaActivityItem,
  StravaAthleteProfile,
  WorkoutPlanTemplateType,
  WorkoutState,
} from '../../types/sportmate';
import {
  FATSECRET_CURATED_FOODS,
  INITIAL_STRAVA_ACTIVITIES,
  INITIAL_STRAVA_ATHLETE,
} from '../../data/apiCatalogs';
import {
  calculateFatSecretServingMacros,
  calculateOverallPhysiqueStatus,
  formatDecimalPL,
  formatNumberPL,
  getMissingMuscleGroupsForTemplate,
  getMuscleRankInfo,
  getNutritionTotals,
  getPlanTemplateRequiredGroups,
  getRecommendedExercisesForTemplate,
  getSmartFatSecretMacroSuggestions,
  getWorkoutSetsProgress,
  getWorkoutVolumeKg,
} from '../../utils/formatters';
import { MuscleAnatomyMap } from '../common/MuscleAnatomyMap';
import { RadialGauge } from '../common/VisualWidgets';

interface ActivityScreenProps {
  subTab: ActivitySubTab;
  workout: WorkoutState;
  workoutPlans: SavedWorkoutPlan[];
  activePlanId: string;
  nutrition: NutritionState;
  exerciseCatalog: ExerciseCatalogItem[];
  exerciseFilter: string;
  exerciseSearch: string;
  streakDays: number;
  muscleZones: MuscleZoneProgress[];
  stravaAthlete?: StravaAthleteProfile;
  stravaActivities?: StravaActivityItem[];
  isStravaSyncing?: boolean;
  onSwitchSubTab: (sub: ActivitySubTab) => void;
  onNavigate: (screen: ScreenName) => void;
  onOpenHistoryModal: (actId: string) => void;
  onSetExerciseFilter: (filter: string) => void;
  onSetExerciseSearch: (search: string) => void;
  onSelectWorkoutPlan: (planId: string) => void;
  onCreateNewWorkoutPlan: (
    planName: string,
    planType: WorkoutPlanTemplateType,
    exercises: ExerciseCatalogItem[]
  ) => void;
  onDeleteWorkoutPlan?: (planId: string) => void;
  onRecordWorkoutSessionToHistory?: () => void;
  onAddExerciseToWorkout: (
    name: string,
    muscle: string,
    ytUrl: string,
    muscleGroup?: MuscleGroupCategory,
    defaultKg?: number,
    defaultSets?: number,
    defaultReps?: number
  ) => void;
  onRemoveExerciseFromWorkout?: (name: string) => void;
  onApplyPlanTemplate?: (
    planName: string,
    planType: WorkoutPlanTemplateType,
    exercises: ExerciseCatalogItem[]
  ) => void;
  onUpdateNutritionState: (patch: Partial<NutritionState>) => void;
  onAddProductToDiary: (prodName: string) => void;
  onAddFatSecretMealToDiary?: (
    food: FatSecretFoodItem,
    grams: number,
    servingLabel: string,
    mealType: string
  ) => void;
  onAddWater?: (ml: number) => void;
  onRemoveMeal: (id: number) => void;
  onTrainMuscleZone?: (
    zoneId: MuscleAnatomyZoneId,
    setsCount?: number,
    customExerciseName?: string
  ) => void;
  onConnectStravaOAuth?: () => void;
  onSyncStravaApi?: () => void;
}

const MUSCLE_FILTERS: ('Wszystkie' | MuscleGroupCategory)[] = [
  'Wszystkie',
  'Klatka piersiowa',
  'Plecy',
  'Nogi (Czworogłowe i Pośladki)',
  'Nogi (Dwugłowe i Łydki)',
  'Barki',
  'Biceps',
  'Triceps',
  'Brzuch i Core',
];

const PLAN_TEMPLATES: {
  id: WorkoutPlanTemplateType;
  label: string;
  shortDesc: string;
  defaultTitle: string;
}[] = [
  {
    id: 'FBW',
    label: 'FBW (Całe ciało)',
    shortDesc: '1 ćwiczenie na każdą główną partię mięśniową.',
    defaultTitle: 'Plan FBW A — Całe Ciało',
  },
  {
    id: 'Push',
    label: 'Push (Klatka, Barki, Triceps)',
    shortDesc: 'Ruchy wypychające górnej części ciała.',
    defaultTitle: 'Plan Push — Klatka, Barki i Triceps',
  },
  {
    id: 'Pull',
    label: 'Pull (Plecy, Biceps)',
    shortDesc: 'Ruchy przyciągające — grzbiet oraz ramiona.',
    defaultTitle: 'Plan Pull — Plecy i Biceps',
  },
  {
    id: 'Legs',
    label: 'Legs (Nogi i Brzuch)',
    shortDesc: 'Czworogłowe, dwugłowe, pośladki, łydki i core.',
    defaultTitle: 'Plan Legs — Dół Ciała i Core',
  },
  {
    id: 'Upper',
    label: 'Upper (Góra ciała)',
    shortDesc: 'Klatka, plecy, barki oraz ramiona na jednej sesji.',
    defaultTitle: 'Góra ciała A — Siła i Hipertrofia',
  },
  {
    id: 'Custom',
    label: 'Własny układ (Custom)',
    shortDesc: 'Dowolny wybór ćwiczeń z katalogu 60 ruchów.',
    defaultTitle: 'Mój Własny Plan Siłowy',
  },
];

const FOOD_CATEGORIES: FoodCategory[] = [
  'Wszystkie',
  'Źródła białka',
  'Węglowodany i zboża',
  'Owoce i zdrowe tłuszcze',
  'Gotowe posiłki i przekąski',
];

export const ActivityScreen: React.FC<ActivityScreenProps> = ({
  subTab,
  workout,
  workoutPlans,
  activePlanId,
  nutrition,
  exerciseCatalog,
  exerciseFilter,
  exerciseSearch,
  streakDays,
  muscleZones,
  stravaAthlete = INITIAL_STRAVA_ATHLETE,
  stravaActivities = INITIAL_STRAVA_ACTIVITIES,
  isStravaSyncing = false,
  onSwitchSubTab,
  onNavigate,
  onOpenHistoryModal,
  onSetExerciseFilter,
  onSetExerciseSearch,
  onSelectWorkoutPlan,
  onCreateNewWorkoutPlan,
  onDeleteWorkoutPlan,
  onRecordWorkoutSessionToHistory,
  onAddExerciseToWorkout,
  onRemoveExerciseFromWorkout,
  onApplyPlanTemplate,
  onUpdateNutritionState,
  onAddProductToDiary,
  onAddFatSecretMealToDiary,
  onAddWater,
  onRemoveMeal,
  onTrainMuscleZone,
  onConnectStravaOAuth,
  onSyncStravaApi,
}) => {
  // Pod-widoki wewnątrz poszczególnych zakładek — eliminują długie przewijanie
  const [trainingViewMode, setTrainingViewMode] = useState<'exercises' | 'history'>('exercises');
  const [showAllMuscleZones, setShowAllMuscleZones] = useState<boolean>(false);
  const [creatorSubView, setCreatorSubView] = useState<'config' | 'catalog'>('config');
  const [nutritionSubView, setNutritionSubView] = useState<'diary' | 'search'>('diary');

  const [selectedTemplate, setSelectedTemplate] = useState<WorkoutPlanTemplateType>(
    workout.planType || 'FBW'
  );
  const [customPlanName, setCustomPlanName] = useState<string>(
    'Plan Pull — Szerokie Plecy i Biceps'
  );
  const [selectedZoneId, setSelectedZoneId] = useState<MuscleAnatomyZoneId>('chest');
  const [previewAnatomyExerciseId, setPreviewAnatomyExerciseId] = useState<string | null>(null);

  // Stan dla integracji FatSecret Platform API v2 w Liczniku Kalorii
  const [fatSecretFoods, setFatSecretFoods] = useState<FatSecretFoodItem[]>(FATSECRET_CURATED_FOODS);
  const [fatSecretLoading, setFatSecretLoading] = useState<boolean>(false);
  const [fatSecretFoodTypeFilter, setFatSecretFoodTypeFilter] = useState<'ALL' | 'Brand' | 'Generic'>('ALL');
  const [selectedFatSecretFoodId, setSelectedFatSecretFoodId] = useState<string>(
    FATSECRET_CURATED_FOODS[0].id
  );
  const [selectedServingLabel, setSelectedServingLabel] = useState<string>(
    FATSECRET_CURATED_FOODS[0].defaultServingLabel
  );
  const [macroSuggestionFocus, setMacroSuggestionFocus] = useState<MacroSuggestionFocus>('auto');

  const smartMacroSuggestions = getSmartFatSecretMacroSuggestions(
    nutrition,
    fatSecretFoods.length >= 6 ? fatSecretFoods : FATSECRET_CURATED_FOODS,
    macroSuggestionFocus,
    3
  );

  const activeSavedPlan =
    workoutPlans.find((p) => p.id === activePlanId) || workoutPlans[0];

  const physiqueStatus = calculateOverallPhysiqueStatus(muscleZones);
  const activeMuscleZone =
    muscleZones.find((z) => z.id === selectedZoneId) || muscleZones[0];

  const volumeKg = getWorkoutVolumeKg(workout.exercises);
  const totals = getNutritionTotals(nutrition.meals);
  const kcalPct = Math.min(100, Math.round((totals.kcal / nutrition.kcalGoal) * 100));
  const pPct = Math.min(100, Math.round((totals.p / nutrition.proteinGoal) * 100));
  const fPct = Math.min(100, Math.round((totals.f / nutrition.fatGoal) * 100));
  const cPct = Math.min(100, Math.round((totals.c / nutrition.carbsGoal) * 100));
  const leftKcal = Math.max(0, nutrition.kcalGoal - totals.kcal);

  const parsedGrams = parseFloat(nutrition.selectedGramsRaw);
  const effectiveGrams = !Number.isNaN(parsedGrams) && parsedGrams > 0 ? parsedGrams : 100;
  const activeFoodCat = nutrition.selectedFoodCategory || 'Wszystkie';

  useEffect(() => {
    if (subTab !== 'nutrition') return;
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setFatSecretLoading(true);
      try {
        const params = new URLSearchParams({
          q: nutrition.searchQuery || '',
          category: activeFoodCat,
          foodType: fatSecretFoodTypeFilter,
        });
        const resp = await fetch(`/api/fatsecret/search?${params.toString()}`);
        if (resp.ok && !cancelled) {
          const data = await resp.json();
          if (Array.isArray(data.foods)) {
            setFatSecretFoods(data.foods);
            if (
              data.foods.length > 0 &&
              !data.foods.some((f: FatSecretFoodItem) => f.id === selectedFatSecretFoodId)
            ) {
              setSelectedFatSecretFoodId(data.foods[0].id);
              setSelectedServingLabel(data.foods[0].defaultServingLabel);
            }
          }
        }
      } catch {
        // zachowaj lokalny katalog FatSecret
      } finally {
        if (!cancelled) setFatSecretLoading(false);
      }
    }, 180);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [subTab, nutrition.searchQuery, activeFoodCat, fatSecretFoodTypeFilter]);

  const activeFatSecretFood =
    fatSecretFoods.find((f) => f.id === selectedFatSecretFoodId) ||
    fatSecretFoods[0] ||
    FATSECRET_CURATED_FOODS[0];

  const handleSelectFatSecretItem = (item: FatSecretFoodItem) => {
    setSelectedFatSecretFoodId(item.id);
    setSelectedServingLabel(item.defaultServingLabel);
    onUpdateNutritionState({ selectedGramsRaw: String(item.defaultServingGrams) });
  };

  const filteredExercises = exerciseCatalog.filter((e) => {
    const matchCat =
      exerciseFilter === 'Wszystkie' ||
      e.muscleGroup === exerciseFilter ||
      e.muscle.toLowerCase().includes(exerciseFilter.toLowerCase());
    const matchSearch =
      e.name.toLowerCase().includes(exerciseSearch.toLowerCase()) ||
      e.muscle.toLowerCase().includes(exerciseSearch.toLowerCase()) ||
      e.muscleGroup.toLowerCase().includes(exerciseSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  const selectedExerciseNames = workout.exercises.map((e) => e.name);
  const requiredGroups = getPlanTemplateRequiredGroups(selectedTemplate);
  const missingGroups = getMissingMuscleGroupsForTemplate(selectedTemplate, workout.exercises);
  const recommendedForTemplate = getRecommendedExercisesForTemplate(
    selectedTemplate,
    exerciseCatalog,
    selectedExerciseNames
  );

  const handleSelectTemplate = (tpl: WorkoutPlanTemplateType) => {
    setSelectedTemplate(tpl);
    const found = PLAN_TEMPLATES.find((t) => t.id === tpl);
    if (found) {
      setCustomPlanName(found.defaultTitle);
    }
  };

  const buildTemplateExercises = (tpl: WorkoutPlanTemplateType): ExerciseCatalogItem[] => {
    const req = getPlanTemplateRequiredGroups(tpl);
    const chosen: ExerciseCatalogItem[] = [];
    for (const grp of req) {
      const match = exerciseCatalog.find(
        (item) => item.muscleGroup === grp && item.recommendedFor.includes(tpl)
      );
      if (match) chosen.push(match);
    }
    for (const item of exerciseCatalog) {
      if (chosen.length >= 5) break;
      if (
        item.recommendedFor.includes(tpl) &&
        !chosen.some((c) => c.name === item.name)
      ) {
        chosen.push(item);
      }
    }
    return chosen;
  };

  const handleCreateAndSaveNewPlan = () => {
    const chosen = buildTemplateExercises(selectedTemplate);
    onCreateNewWorkoutPlan(customPlanName, selectedTemplate, chosen);
  };

  const handleAutoFillTemplate = () => {
    if (!onApplyPlanTemplate) return;
    const chosen = buildTemplateExercises(selectedTemplate);
    onApplyPlanTemplate(customPlanName, selectedTemplate, chosen);
  };

  return (
    <div>
      {/* Segmented Control (5 pod-widoków) */}
      <div className="segmented-tabs" role="tablist" aria-label="Moduły aktywności">
        <button
          type="button"
          className={`seg-btn ${subTab === 'training' ? 'active' : ''}`}
          onClick={() => onSwitchSubTab('training')}
        >
          Siłownia
        </button>
        <button
          type="button"
          className={`seg-btn ${subTab === 'muscles' ? 'active' : ''}`}
          onClick={() => onSwitchSubTab('muscles')}
        >
          Sylwetka
        </button>
        <button
          type="button"
          className={`seg-btn ${subTab === 'plan-creator' ? 'active' : ''}`}
          onClick={() => onSwitchSubTab('plan-creator')}
        >
          Kreator
        </button>
        <button
          type="button"
          className={`seg-btn ${subTab === 'nutrition' ? 'active' : ''}`}
          onClick={() => onSwitchSubTab('nutrition')}
        >
          Dieta
        </button>
        <button
          type="button"
          className={`seg-btn ${subTab === 'history' ? 'active' : ''}`}
          onClick={() => onSwitchSubTab('history')}
        >
          Historia
        </button>
      </div>

      {/* POD-WIDOK 1: SIŁOWNIA (KOMPAKTOWY WYBÓR PLANU + PRZEŁĄCZNIK ĆWICZENIA / HISTORIA) */}
      {subTab === 'training' && (
        <div>
          {/* Pasek wyboru zapisanych planów w formie czytelnych pigułek */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 6,
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                textTransform: 'uppercase',
                color: 'var(--text-secondary)',
                letterSpacing: '0.4px',
              }}
            >
              Twoje plany ({workoutPlans.length})
            </span>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ width: 'auto', padding: '4px 9px', fontSize: 10.5 }}
              onClick={() => onSwitchSubTab('plan-creator')}
            >
              <Plus size={12} /> Nowy plan
            </button>
          </div>

          <div className="filter-pills" style={{ marginBottom: 12 }}>
            {workoutPlans.map((plan, pIdx) => {
              const isSelected = plan.id === activePlanId;
              return (
                <button
                  key={plan.id}
                  type="button"
                  className={`filter-pill ${isSelected ? 'active' : ''}`}
                  onClick={() => onSelectWorkoutPlan(plan.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <span>
                    #{pIdx + 1} {plan.planName.split('—')[0].trim()} ({plan.completedCount}×)
                  </span>
                </button>
              );
            })}
          </div>

          {/* Karta aktywnego planu */}
          <div
            className="card"
            style={{
              background:
                'linear-gradient(135deg, rgba(255,107,53,0.14), rgba(62,214,163,0.08)), var(--bg-surface)',
              borderColor: 'rgba(255,107,53,0.3)',
              padding: '13px 14px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: 8,
                marginBottom: 4,
              }}
            >
              <div>
                <span className="badge badge-mint" style={{ marginBottom: 4 }}>
                  {workout.planType || 'FBW'} · {workout.exercises.length} ćwiczeń
                </span>
                <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>{workout.planName}</h2>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span
                  className="tabular-nums"
                  style={{ fontSize: 13, fontWeight: 800, color: 'var(--accent-mint-bright)' }}
                >
                  {formatNumberPL(volumeKg)} kg
                </span>
                {onDeleteWorkoutPlan && workoutPlans.length > 1 && (
                  <button
                    type="button"
                    className="icon-btn"
                    style={{ width: 26, height: 26 }}
                    onClick={() => onDeleteWorkoutPlan(activePlanId)}
                    title="Usuń plan"
                    aria-label="Usuń plan"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </div>

            <p style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginBottom: 10 }}>
              Ostatnio: <strong style={{ color: 'var(--text-primary)' }}>{activeSavedPlan?.lastPerformedLabel || 'Tydzień temu'}</strong> · Wykonano {activeSavedPlan?.completedCount || 1}×
            </p>

            <div className="card-actions-row">
              <button
                type="button"
                className="btn btn-strava btn-sm"
                onClick={() => onNavigate('active-workout')}
              >
                <Play size={13} fill="currentColor" />
                Dziennik serii
              </button>
              {onRecordWorkoutSessionToHistory && (
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={onRecordWorkoutSessionToHistory}
                >
                  <Check size={13} />
                  Zapisz sesję
                </button>
              )}
            </div>
          </div>

          {/* Przełącznik: Ćwiczenia w planie vs Historia tygodniowa */}
          <div className="segmented-control" style={{ marginBottom: 10 }}>
            <button
              type="button"
              className={`segment-btn ${trainingViewMode === 'exercises' ? 'active' : ''}`}
              onClick={() => setTrainingViewMode('exercises')}
            >
              Ćwiczenia ({workout.exercises.length})
            </button>
            <button
              type="button"
              className={`segment-btn ${trainingViewMode === 'history' ? 'active' : ''}`}
              onClick={() => setTrainingViewMode('history')}
            >
              Historia planu ({activeSavedPlan?.sessionHistory?.length || 0} tyg.)
            </button>
          </div>

          {trainingViewMode === 'exercises' ? (
            <div className="grouped-list">
              {workout.exercises.map((ex, idx) => {
                const doneCount = ex.sets.filter((s) => s.done).length;
                return (
                  <div
                    key={ex.name}
                    className="list-row"
                    style={{
                      padding: '11px 14px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 10,
                    }}
                  >
                    <div
                      style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}
                      onClick={() => onNavigate('active-workout')}
                    >
                      <div style={{ fontWeight: 800, fontSize: 13.5 }}>
                        {idx + 1}. {ex.name}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: 'var(--text-secondary)',
                          marginTop: 2,
                          display: 'flex',
                          gap: 8,
                          flexWrap: 'wrap',
                        }}
                      >
                        <span style={{ color: 'var(--accent-mint-bright)', fontWeight: 700 }}>
                          {ex.muscleGroup || ex.muscle.split('·')[0]}
                        </span>
                        <span>· {ex.prevResult}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                      <span
                        className={`badge ${
                          doneCount === ex.sets.length ? 'badge-mint' : 'badge-amber'
                        }`}
                      >
                        {doneCount}/{ex.sets.length}
                      </span>
                      {onRemoveExerciseFromWorkout && workout.exercises.length > 1 && (
                        <button
                          type="button"
                          className="icon-btn"
                          style={{ width: 26, height: 26 }}
                          onClick={() => onRemoveExerciseFromWorkout(ex.name)}
                          title="Usuń ćwiczenie"
                          aria-label={`Usuń ${ex.name}`}
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grouped-list">
              {(activeSavedPlan?.sessionHistory || []).map((sess, sIdx) => (
                <div
                  key={sess.id}
                  className="list-row"
                  style={{
                    padding: '12px 14px',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    gap: 6,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <span
                        className={`badge ${sIdx === 0 ? 'badge-mint' : 'badge-water'}`}
                        style={{ marginRight: 6 }}
                      >
                        {sess.weekLabel}
                      </span>
                      <span style={{ fontSize: 11.5, color: 'var(--text-secondary)', fontWeight: 700 }}>
                        {sess.dateLabel} · {sess.durationLabel}
                      </span>
                    </div>
                    <span
                      className="tabular-nums"
                      style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--accent-mint-bright)' }}
                    >
                      {formatNumberPL(sess.totalVolumeKg)} kg
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {sess.exercisesSummary.map((exSum) => (
                      <div
                        key={exSum.exerciseName}
                        className="tabular-nums"
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: 11,
                          color: 'var(--text-secondary)',
                        }}
                      >
                        <span
                          style={{
                            color: 'var(--text-primary)',
                            fontWeight: 600,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '58%',
                          }}
                        >
                          • {exSum.exerciseName}
                        </span>
                        <span>{exSum.setsSummary}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* POD-WIDOK 2: SYLWETKA I ANATOMIA MIĘŚNI */}
      {subTab === 'muscles' && (
        <div>
          <div
            className="card"
            style={{
              background:
                'linear-gradient(135deg, rgba(62,214,163,0.12), rgba(255,107,53,0.08)), var(--bg-surface)',
              borderColor: 'rgba(62,214,163,0.35)',
              padding: '13px 14px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 8,
                marginBottom: 8,
              }}
            >
              <div>
                <h2 style={{ fontSize: 16.5, fontWeight: 800, margin: 0 }}>
                  Mapa anatomiczna mięśni
                </h2>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                  Symetria {physiqueStatus.symmetryScore}% · {physiqueStatus.totalWeeklySets} serii / tydz.
                </div>
              </div>
              <span
                className="badge"
                style={{
                  background: 'rgba(245, 158, 11, 0.2)',
                  color: physiqueStatus.overallColor,
                  fontWeight: 900,
                }}
              >
                Ranga {physiqueStatus.overallRank}
              </span>
            </div>

            <MuscleAnatomyMap
              mode="full"
              zones={muscleZones}
              selectedZoneId={selectedZoneId}
              onSelectZone={(zId) => setSelectedZoneId(zId)}
            />
          </div>

          {/* Karta wybranej partii mięśniowej */}
          {activeMuscleZone &&
            (() => {
              const rankInfo = getMuscleRankInfo(activeMuscleZone.level);
              const xpPct = Math.min(
                100,
                Math.round(
                  (activeMuscleZone.xp / Math.max(1, activeMuscleZone.xpToNextLevel)) * 100
                )
              );
              return (
                <div
                  className="card"
                  style={{
                    borderColor: rankInfo.color,
                    padding: '12px 14px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 8,
                      marginBottom: 6,
                    }}
                  >
                    <div>
                      <h3 style={{ fontSize: 15.5, fontWeight: 800, margin: 0 }}>
                        {activeMuscleZone.namePl}
                      </h3>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                        {activeMuscleZone.weeklySets}/{activeMuscleZone.targetWeeklySets} serii w tyg. ·{' '}
                        {activeMuscleZone.xp}/{activeMuscleZone.xpToNextLevel} XP
                      </div>
                    </div>
                    <span
                      className="badge"
                      style={{
                        background: rankInfo.badgeBg,
                        color: rankInfo.color,
                        fontWeight: 900,
                        border: `1px solid ${rankInfo.color}`,
                      }}
                    >
                      {rankInfo.tier}
                    </span>
                  </div>

                  <div className="progress-track" style={{ marginBottom: 10 }}>
                    <div
                      className="progress-fill"
                      style={{
                        width: `${xpPct}%`,
                        background: rankInfo.color,
                      }}
                    />
                  </div>

                  <div className="card-actions-row">
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() =>
                        onTrainMuscleZone &&
                        onTrainMuscleZone(
                          activeMuscleZone.id,
                          2,
                          activeMuscleZone.topExercise
                        )
                      }
                    >
                      <Dumbbell size={13} /> +2 Serie (+130 XP)
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setShowAllMuscleZones((prev) => !prev)}
                    >
                      {showAllMuscleZones ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      {showAllMuscleZones ? 'Ukryj listę (12)' : 'Wszystkie partie (12)'}
                    </button>
                  </div>
                </div>
              );
            })()}

          {/* Rozwijana lista wszystkich 12 partii anatomicznych */}
          {showAllMuscleZones && (
            <div className="grouped-list">
              {muscleZones.map((zone) => {
                const rInfo = getMuscleRankInfo(zone.level);
                const isSelected = zone.id === selectedZoneId;
                return (
                  <div
                    key={zone.id}
                    className="list-row interactive"
                    onClick={() => setSelectedZoneId(zone.id)}
                    style={{
                      padding: '10px 14px',
                      background: isSelected ? 'rgba(62, 214, 163, 0.08)' : undefined,
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 800 }}>{zone.namePl}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                        Serie: {zone.weeklySets}/{zone.targetWeeklySets} · XP: {zone.xp}/
                        {zone.xpToNextLevel}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span
                        className="badge"
                        style={{
                          background: rInfo.badgeBg,
                          color: rInfo.color,
                          fontWeight: 800,
                        }}
                      >
                        {rInfo.tier}
                      </span>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ width: 'auto', padding: '4px 8px', fontSize: 10.5 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedZoneId(zone.id);
                          if (onTrainMuscleZone) {
                            onTrainMuscleZone(zone.id, 1, zone.topExercise);
                          }
                        }}
                      >
                        +1 Seria
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* POD-WIDOK 3: KREATOR PLANU (PODZIAŁ NA KONFIGURACJĘ I KATALOG ĆWICZEŃ) */}
      {subTab === 'plan-creator' && (
        <div>
          <div className="segmented-control" style={{ marginBottom: 12 }}>
            <button
              type="button"
              className={`segment-btn ${creatorSubView === 'config' ? 'active' : ''}`}
              onClick={() => setCreatorSubView('config')}
            >
              1. Szablon i zapis
            </button>
            <button
              type="button"
              className={`segment-btn ${creatorSubView === 'catalog' ? 'active' : ''}`}
              onClick={() => setCreatorSubView('catalog')}
            >
              2. Baza ćwiczeń ({exerciseCatalog.length})
            </button>
          </div>

          {creatorSubView === 'config' ? (
            <div>
              <div className="card" style={{ padding: '13px 14px' }}>
                <div className="input-group" style={{ marginBottom: 10 }}>
                  <label className="input-label">System treningowy</label>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                      gap: 6,
                    }}
                  >
                    {PLAN_TEMPLATES.map((tpl) => {
                      const isActive = selectedTemplate === tpl.id;
                      return (
                        <button
                          key={tpl.id}
                          type="button"
                          onClick={() => handleSelectTemplate(tpl.id)}
                          style={{
                            padding: '8px 10px',
                            borderRadius: 10,
                            fontSize: 11.5,
                            fontWeight: isActive ? 800 : 600,
                            textAlign: 'left',
                            background: isActive
                              ? 'var(--accent-mint-bright)'
                              : 'var(--bg-elevated)',
                            color: isActive ? '#04120C' : 'var(--text-primary)',
                            border: isActive
                              ? '1px solid transparent'
                              : '1px solid var(--border-subtle)',
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                            lineHeight: 1.25,
                          }}
                        >
                          {tpl.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="input-group" style={{ marginBottom: 10 }}>
                  <label className="input-label" htmlFor="plan-creator-title">
                    Nazwa planu
                  </label>
                  <input
                    id="plan-creator-title"
                    type="text"
                    className="input-field"
                    value={customPlanName}
                    onChange={(e) => setCustomPlanName(e.target.value)}
                    placeholder="Np. Plan Pull B — Szerokie Plecy"
                  />
                </div>

                {/* Pokrycie partii */}
                <div
                  style={{
                    background: 'var(--bg-elevated)',
                    borderRadius: 12,
                    padding: 10,
                    marginBottom: 12,
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 6,
                    }}
                  >
                    <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-secondary)' }}>
                      Pokrycie partii ({selectedTemplate})
                    </span>
                    <span className="badge badge-mint">
                      {requiredGroups.length - missingGroups.length}/{requiredGroups.length}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {requiredGroups.map((grp) => {
                      const isMissing = missingGroups.includes(grp);
                      return (
                        <span
                          key={grp}
                          className={`badge ${isMissing ? 'badge-amber' : 'badge-mint'}`}
                          style={{ fontSize: 10, cursor: 'pointer' }}
                          onClick={() => {
                            onSetExerciseFilter(grp);
                            setCreatorSubView('catalog');
                          }}
                        >
                          {isMissing ? `+ ${grp}` : `✓ ${grp}`}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="card-actions-row">
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={handleCreateAndSaveNewPlan}
                  >
                    <Plus size={13} /> Zapisz nowy plan
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={handleAutoFillTemplate}
                  >
                    <Sparkles size={13} /> Zastąp aktualny
                  </button>
                </div>
              </div>

              {/* Podpowiadane ćwiczenia dla brakujących partii */}
              {recommendedForTemplate.length > 0 && (
                <div className="grouped-list">
                  <div className="list-row" style={{ padding: '10px 14px' }}>
                    <span style={{ fontWeight: 800, fontSize: 13 }}>
                      Polecane do planu {selectedTemplate}
                    </span>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      style={{ width: 'auto', padding: '2px 8px', fontSize: 11 }}
                      onClick={() => setCreatorSubView('catalog')}
                    >
                      Pełny katalog →
                    </button>
                  </div>
                  {recommendedForTemplate.slice(0, 3).map((rec) => (
                    <div
                      key={rec.id}
                      className="list-row"
                      style={{
                        padding: '10px 14px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 10,
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 800, fontSize: 13 }}>{rec.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                          {rec.muscleGroup} · {rec.defaultSets}×{rec.defaultReps} ({rec.defaultKg} kg)
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        style={{ width: 'auto', padding: '6px 11px', flexShrink: 0 }}
                        onClick={() =>
                          onAddExerciseToWorkout(
                            rec.name,
                            rec.muscle,
                            rec.ytUrl,
                            rec.muscleGroup,
                            rec.defaultKg,
                            rec.defaultSets,
                            rec.defaultReps
                          )
                        }
                      >
                        <Plus size={13} /> Dodaj
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="input-group" style={{ marginBottom: 8 }}>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Szukaj ćwiczenia lub partii..."
                  value={exerciseSearch}
                  onChange={(e) => onSetExerciseSearch(e.target.value)}
                />
              </div>

              <div className="filter-pills" style={{ marginBottom: 10 }}>
                {MUSCLE_FILTERS.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`filter-pill ${exerciseFilter === cat ? 'active' : ''}`}
                    onClick={() => onSetExerciseFilter(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="grouped-list">
                {filteredExercises.slice(0, 12).map((e) => {
                  const alreadyInPlan = selectedExerciseNames.includes(e.name);
                  const showAnatomyPreview = previewAnatomyExerciseId === e.id;
                  return (
                    <div
                      key={e.id}
                      className="list-row"
                      style={{
                        padding: '11px 14px',
                        flexDirection: 'column',
                        alignItems: 'stretch',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: 10,
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 800, fontSize: 13.5 }}>{e.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                            <strong style={{ color: 'var(--accent-mint-bright)' }}>
                              {e.muscleGroup}
                            </strong>{' '}
                            · {e.equipment} · {e.defaultSets}×{e.defaultReps}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            style={{ width: 'auto', padding: '5px 8px', fontSize: 10.5 }}
                            onClick={() =>
                              setPreviewAnatomyExerciseId((prev) => (prev === e.id ? null : e.id))
                            }
                          >
                            <Dumbbell size={11} /> {showAnatomyPreview ? 'Ukryj' : 'Mięśnie'}
                          </button>
                          {alreadyInPlan ? (
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              style={{
                                width: 'auto',
                                padding: '5px 10px',
                                fontSize: 11,
                                color: 'var(--accent-mint-bright)',
                              }}
                              onClick={() =>
                                onRemoveExerciseFromWorkout && onRemoveExerciseFromWorkout(e.name)
                              }
                            >
                              <Check size={12} /> W planie
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              style={{ width: 'auto', padding: '5px 10px', fontSize: 11 }}
                              onClick={() =>
                                onAddExerciseToWorkout(
                                  e.name,
                                  e.muscle,
                                  e.ytUrl,
                                  e.muscleGroup,
                                  e.defaultKg,
                                  e.defaultSets,
                                  e.defaultReps
                                )
                              }
                            >
                              <Plus size={12} /> Dodaj
                            </button>
                          )}
                        </div>
                      </div>

                      {showAnatomyPreview && (
                        <div style={{ marginTop: 10 }}>
                          <MuscleAnatomyMap
                            mode="exercise-preview"
                            exerciseName={e.name}
                            muscleLabel={e.muscle}
                            muscleGroup={e.muscleGroup}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* POD-WIDOK 4: DIETA I WODA (PODZIAŁ NA DZIENNIK POSIŁKÓW I WYSZUKIWARKĘ FATSECRET) */}
      {subTab === 'nutrition' && (
        <div>
          {/* Kompaktowy bilans kalorii, makro i wody */}
          <div className="card" style={{ padding: '13px 14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div className="hero-metric" style={{ fontSize: 26 }}>
                  {formatNumberPL(totals.kcal)}
                  <span className="hero-unit"> / {formatNumberPL(nutrition.kcalGoal)} kcal</span>
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 2 }}>
                  Pozostało:{' '}
                  <strong className="tabular-nums" style={{ color: 'var(--accent-mint-bright)' }}>
                    {formatNumberPL(leftKcal)} kcal
                  </strong>
                </div>
              </div>
              <RadialGauge
                pct={kcalPct}
                size={68}
                strokeWidth={7}
                color="var(--accent-strava)"
                centerLabel={`${kcalPct}%`}
              />
            </div>

            <div className="grid-3" style={{ marginTop: 10 }}>
              <div
                style={{
                  background: 'var(--bg-elevated)',
                  padding: '8px 9px',
                  borderRadius: 10,
                }}
              >
                <div style={{ fontSize: 10.5, color: 'var(--text-secondary)', fontWeight: 700 }}>
                  Białko
                </div>
                <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 800, margin: '2px 0 5px' }}>
                  {totals.p}/{nutrition.proteinGoal}g
                </div>
                <div className="progress-track" style={{ height: 4 }}>
                  <div
                    className="progress-fill"
                    style={{ width: `${pPct}%`, background: 'var(--accent-mint-bright)' }}
                  />
                </div>
              </div>
              <div
                style={{
                  background: 'var(--bg-elevated)',
                  padding: '8px 9px',
                  borderRadius: 10,
                }}
              >
                <div style={{ fontSize: 10.5, color: 'var(--text-secondary)', fontWeight: 700 }}>
                  Tłuszcze
                </div>
                <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 800, margin: '2px 0 5px' }}>
                  {totals.f}/{nutrition.fatGoal}g
                </div>
                <div className="progress-track" style={{ height: 4 }}>
                  <div
                    className="progress-fill"
                    style={{ width: `${fPct}%`, background: 'var(--status-amber)' }}
                  />
                </div>
              </div>
              <div
                style={{
                  background: 'var(--bg-elevated)',
                  padding: '8px 9px',
                  borderRadius: 10,
                }}
              >
                <div style={{ fontSize: 10.5, color: 'var(--text-secondary)', fontWeight: 700 }}>
                  Węgle
                </div>
                <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 800, margin: '2px 0 5px' }}>
                  {totals.c}/{nutrition.carbsGoal}g
                </div>
                <div className="progress-track" style={{ height: 4 }}>
                  <div
                    className="progress-fill"
                    style={{ width: `${cPct}%`, background: 'var(--accent-water)' }}
                  />
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: 10,
                paddingTop: 10,
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Droplets size={15} style={{ color: 'var(--accent-water)', flexShrink: 0 }} />
                <span style={{ fontSize: 12, fontWeight: 800 }}>
                  Woda: {formatNumberPL(nutrition.waterMl)} / {formatNumberPL(nutrition.waterGoalMl)} ml
                </span>
              </div>
              {onAddWater && (
                <div style={{ display: 'flex', gap: 5 }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ width: 'auto', padding: '4px 9px', fontSize: 10.5 }}
                    onClick={() => onAddWater(250)}
                  >
                    +250 ml
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ width: 'auto', padding: '4px 9px', fontSize: 10.5 }}
                    onClick={() => onAddWater(500)}
                  >
                    +500 ml
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Przełącznik: Dziennik posiłków vs Baza FatSecret */}
          <div className="segmented-control" style={{ marginBottom: 12 }}>
            <button
              type="button"
              className={`segment-btn ${nutritionSubView === 'diary' ? 'active' : ''}`}
              onClick={() => setNutritionSubView('diary')}
            >
              Dziennik posiłków ({nutrition.meals.length})
            </button>
            <button
              type="button"
              data-testid="open-fatsecret-tab-btn"
              className={`segment-btn ${nutritionSubView === 'search' ? 'active' : ''}`}
              onClick={() => setNutritionSubView('search')}
            >
              Dodaj produkt (FatSecret)
            </button>
          </div>

          {nutritionSubView === 'diary' ? (
            <div>
              {/* KARTA SUGESTII ZDROWYCH PRODUKTÓW FATSECRET NA PODSTAWIE BRAKÓW MAKRO */}
              <div
                className="card"
                data-testid="fatsecret-macro-suggestions-card"
                style={{
                  padding: '12px 14px',
                  marginBottom: 10,
                  borderColor: 'rgba(62, 214, 163, 0.35)',
                  background:
                    'radial-gradient(circle at 92% 12%, rgba(62, 214, 163, 0.12), transparent 58%), var(--bg-surface)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 8,
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Sparkles size={14} style={{ color: 'var(--accent-mint-bright)' }} />
                    <span style={{ fontWeight: 800, fontSize: 13 }}>
                      Zdrowe sugestie FatSecret
                    </span>
                  </div>
                  <span
                    className="badge badge-mint"
                    data-testid="macro-deficit-summary-badge"
                    style={{ fontSize: 10 }}
                  >
                    {smartMacroSuggestions.deficit.dominantLabelPl}
                  </span>
                </div>

                {/* Pigułki wyboru priorytetu brakującego makroskładnika w jednym wierszu */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: 5,
                    marginBottom: 9,
                  }}
                >
                  <button
                    type="button"
                    data-testid="macro-focus-auto"
                    className={`filter-pill ${macroSuggestionFocus === 'auto' ? 'active' : ''}`}
                    style={{ padding: '5px 4px', fontSize: 10.5, textAlign: 'center' }}
                    onClick={() => setMacroSuggestionFocus('auto')}
                  >
                    Auto
                  </button>
                  <button
                    type="button"
                    data-testid="macro-focus-protein"
                    className={`filter-pill ${macroSuggestionFocus === 'protein' ? 'active' : ''}`}
                    style={{ padding: '5px 4px', fontSize: 10.5, textAlign: 'center' }}
                    onClick={() => setMacroSuggestionFocus('protein')}
                  >
                    Białko (-{smartMacroSuggestions.deficit.missingProtein}g)
                  </button>
                  <button
                    type="button"
                    data-testid="macro-focus-carbs"
                    className={`filter-pill ${macroSuggestionFocus === 'carbs' ? 'active' : ''}`}
                    style={{ padding: '5px 4px', fontSize: 10.5, textAlign: 'center' }}
                    onClick={() => setMacroSuggestionFocus('carbs')}
                  >
                    Węgle (-{smartMacroSuggestions.deficit.missingCarbs}g)
                  </button>
                  <button
                    type="button"
                    data-testid="macro-focus-fat"
                    className={`filter-pill ${macroSuggestionFocus === 'fat' ? 'active' : ''}`}
                    style={{ padding: '5px 4px', fontSize: 10.5, textAlign: 'center' }}
                    onClick={() => setMacroSuggestionFocus('fat')}
                  >
                    Tłuszcz (-{smartMacroSuggestions.deficit.missingFat}g)
                  </button>
                </div>

                <div className="grouped-list" style={{ marginBottom: 0 }}>
                  {smartMacroSuggestions.suggestions.map((sug) => (
                    <div
                      key={sug.food.id}
                      data-testid={`macro-suggestion-item-${sug.food.id}`}
                      className="list-row"
                      style={{
                        padding: '9px 11px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 10,
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            flexWrap: 'wrap',
                            marginBottom: 2,
                          }}
                        >
                          <span style={{ fontWeight: 800, fontSize: 12.5 }}>{sug.food.name}</span>
                          <span
                            className={`badge ${
                              sug.targetMacro === 'protein'
                                ? 'badge-mint'
                                : sug.targetMacro === 'carbs'
                                ? 'badge-water'
                                : 'badge-amber'
                            }`}
                            style={{ fontSize: 9.5, padding: '1px 6px' }}
                          >
                            {sug.badgeLabel}
                          </span>
                        </div>
                        <div
                          className="tabular-nums"
                          style={{ fontSize: 10.5, color: 'var(--text-secondary)' }}
                        >
                          {sug.recommendedServingLabel} · {sug.reasonLabel}
                        </div>
                      </div>
                      <button
                        type="button"
                        data-testid={`add-macro-suggestion-btn-${sug.food.id}`}
                        className="btn btn-primary btn-sm"
                        style={{
                          width: 'auto',
                          padding: '5px 10px',
                          fontSize: 11,
                          flexShrink: 0,
                        }}
                        onClick={() => {
                          if (onAddFatSecretMealToDiary) {
                            onAddFatSecretMealToDiary(
                              sug.food,
                              sug.recommendedGrams,
                              sug.recommendedServingLabel,
                              nutrition.selectedMealType || 'Kolacja'
                            );
                          } else {
                            onAddProductToDiary(sug.food.name);
                          }
                        }}
                      >
                        <Plus size={12} /> Dodaj
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grouped-list" style={{ marginBottom: 10 }}>
                {nutrition.meals.map((m) => (
                  <div key={m.id} className="list-row" style={{ padding: '10px 14px' }}>
                    <div>
                      <div
                        style={{
                          fontSize: 10.5,
                          fontWeight: 700,
                          color: 'var(--accent-mint-bright)',
                          textTransform: 'uppercase',
                        }}
                      >
                        {m.mealType} · {m.servingLabel || `${m.grams} g`}
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 13.5, margin: '1px 0' }}>{m.name}</div>
                      <div
                        className="tabular-nums"
                        style={{ fontSize: 11, color: 'var(--text-secondary)' }}
                      >
                        B: {m.p}g · T: {m.f}g · W: {m.c}g
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span className="tabular-nums" style={{ fontWeight: 800, fontSize: 13.5 }}>
                        {m.kcal} kcal
                      </span>
                      <button
                        type="button"
                        className="icon-btn"
                        style={{ width: 26, height: 26 }}
                        onClick={() => onRemoveMeal(m.id)}
                        title="Usuń posiłek"
                        aria-label={`Usuń ${m.name}`}
                      >
                        <X size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setNutritionSubView('search')}
              >
                <Search size={13} /> Pełna wyszukiwarka FatSecret
              </button>
            </div>
          ) : (
            <div className="card" data-testid="fatsecret-search-card" style={{ padding: '13px 14px' }}>
              <div style={{ position: 'relative', marginBottom: 8 }}>
                <Search
                  size={15}
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-secondary)',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  type="text"
                  className="input-field"
                  data-testid="fatsecret-search-input"
                  style={{ padding: '9px 12px 9px 34px', fontSize: 12.5 }}
                  placeholder="Szukaj produktu (np. Skyr, WPC 80, kurczak, banan)..."
                  value={nutrition.searchQuery}
                  onChange={(e) => onUpdateNutritionState({ searchQuery: e.target.value })}
                />
              </div>

              <div className="filter-pills" style={{ marginBottom: 10 }}>
                {FOOD_CATEGORIES.map((fCat) => (
                  <button
                    key={fCat}
                    type="button"
                    className={`filter-pill ${activeFoodCat === fCat ? 'active' : ''}`}
                    onClick={() => onUpdateNutritionState({ selectedFoodCategory: fCat })}
                  >
                    {fCat}
                  </button>
                ))}
              </div>

              {activeFatSecretFood &&
                (() => {
                  const liveMacros = calculateFatSecretServingMacros(
                    activeFatSecretFood,
                    effectiveGrams
                  );
                  return (
                    <div
                      data-testid="fatsecret-inspector"
                      style={{
                        background: 'var(--bg-elevated)',
                        border: '1px solid rgba(62, 214, 163, 0.35)',
                        borderRadius: 12,
                        padding: 10,
                        marginBottom: 10,
                      }}
                    >
                      <div style={{ fontWeight: 800, fontSize: 13.5, marginBottom: 6 }}>
                        {activeFatSecretFood.name}
                        {activeFatSecretFood.brandName ? ` · ${activeFatSecretFood.brandName}` : ''}
                      </div>

                      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 8 }}>
                        {activeFatSecretFood.servings.map((srv) => {
                          const isSelected =
                            Number(nutrition.selectedGramsRaw) === srv.grams &&
                            selectedServingLabel === srv.label;
                          return (
                            <button
                              key={srv.id}
                              type="button"
                              className={`chip ${isSelected ? 'selected' : ''}`}
                              style={{ padding: '4px 8px', fontSize: 10.5 }}
                              onClick={() => {
                                setSelectedServingLabel(srv.label);
                                onUpdateNutritionState({ selectedGramsRaw: String(srv.grams) });
                              }}
                            >
                              {srv.label}
                            </button>
                          );
                        })}
                      </div>

                      <div className="grid-2" style={{ gap: 8, marginBottom: 8 }}>
                        <select
                          id="meal-type-select"
                          className="input-field"
                          style={{ padding: '7px 9px', fontSize: 12 }}
                          value={nutrition.selectedMealType}
                          onChange={(e) =>
                            onUpdateNutritionState({ selectedMealType: e.target.value })
                          }
                        >
                          {[
                            'Śniadanie',
                            'II Śniadanie',
                            'Obiad',
                            'Przed treningiem',
                            'Kolacja',
                            'Przekąska',
                          ].map((mt) => (
                            <option key={mt} value={mt}>
                              {mt}
                            </option>
                          ))}
                        </select>
                        <input
                          id="meal-grams-input"
                          type="number"
                          step="5"
                          min="5"
                          max="2000"
                          className="input-field tabular-nums"
                          style={{ padding: '7px 9px', fontSize: 12.5, fontWeight: 800 }}
                          value={nutrition.selectedGramsRaw}
                          onChange={(e) => {
                            setSelectedServingLabel(`${e.target.value || 100} g`);
                            onUpdateNutritionState({ selectedGramsRaw: e.target.value });
                          }}
                        />
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        <span className="tabular-nums" style={{ fontSize: 11.5, fontWeight: 700 }}>
                          <strong style={{ color: 'var(--accent-strava)' }}>
                            {liveMacros.kcal} kcal
                          </strong>{' '}
                          · B: {liveMacros.p}g · T: {liveMacros.f}g · W: {liveMacros.c}g
                        </span>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          style={{ width: 'auto', padding: '6px 12px' }}
                          onClick={() => {
                            if (onAddFatSecretMealToDiary) {
                              onAddFatSecretMealToDiary(
                                activeFatSecretFood,
                                effectiveGrams,
                                selectedServingLabel,
                                nutrition.selectedMealType
                              );
                            } else {
                              onAddProductToDiary(activeFatSecretFood.name);
                            }
                            setNutritionSubView('diary');
                          }}
                        >
                          <Plus size={13} /> Dodaj
                        </button>
                      </div>
                    </div>
                  );
                })()}

              <div className="grouped-list">
                {fatSecretFoods.slice(0, 6).map((item) => {
                  const itemMacros = calculateFatSecretServingMacros(item, effectiveGrams);
                  const isCurrent = item.id === activeFatSecretFood?.id;
                  return (
                    <div
                      key={item.id}
                      className="list-row interactive"
                      onClick={() => handleSelectFatSecretItem(item)}
                      style={{
                        padding: '9px 12px',
                        background: isCurrent ? 'rgba(62, 214, 163, 0.08)' : undefined,
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 12.5 }}>{item.name}</div>
                        <div
                          className="tabular-nums"
                          style={{ fontSize: 10.5, color: 'var(--text-secondary)' }}
                        >
                          {itemMacros.kcal} kcal · B: {itemMacros.p}g · T: {itemMacros.f}g · W:{' '}
                          {itemMacros.c}g
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ width: 'auto', padding: '4px 9px', fontSize: 10.5 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onAddFatSecretMealToDiary) {
                            onAddFatSecretMealToDiary(
                              item,
                              effectiveGrams,
                              `${effectiveGrams} g`,
                              nutrition.selectedMealType
                            );
                          } else {
                            onAddProductToDiary(item.name);
                          }
                        }}
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* POD-WIDOK 5: HISTORIA AKTYWNOŚCI */}
      {subTab === 'history' && (
        <div>
          <div className="card" style={{ padding: '12px 14px' }}>
            <div className="grid-3" style={{ textAlign: 'center', marginBottom: 10 }}>
              <div>
                <div className="hero-metric" style={{ fontSize: 20 }}>
                  {stravaAthlete.recentActivitiesCount}
                </div>
                <div style={{ fontSize: 10.5, color: 'var(--text-secondary)' }}>Treningi (30 d)</div>
              </div>
              <div>
                <div
                  className="hero-metric"
                  style={{ fontSize: 20, color: 'var(--accent-mint-bright)' }}
                >
                  52,8 t
                </div>
                <div style={{ fontSize: 10.5, color: 'var(--text-secondary)' }}>Tonaż siłowy</div>
              </div>
              <div>
                <div
                  className="hero-metric"
                  style={{ fontSize: 20, color: 'var(--accent-strava)' }}
                >
                  {streakDays} dni
                </div>
                <div style={{ fontSize: 10.5, color: 'var(--text-secondary)' }}>Seria</div>
              </div>
            </div>

            <div
              data-testid="strava-history-sync-card"
              style={{
                paddingTop: 10,
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 8,
                flexWrap: 'wrap',
              }}
            >
              <div style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>
                Strava: <strong style={{ color: 'var(--text-primary)' }}>@{stravaAthlete.username}</strong> · Szosa{' '}
                {formatDecimalPL(stravaAthlete.ytdRideKm, 1)} km
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {onSyncStravaApi && (
                  <button
                    type="button"
                    className="btn btn-strava btn-sm"
                    style={{ width: 'auto', padding: '5px 10px', fontSize: 11 }}
                    disabled={isStravaSyncing}
                    onClick={onSyncStravaApi}
                  >
                    <RefreshCw size={12} /> {isStravaSyncing ? 'Synchronizacja...' : 'Synchronizuj'}
                  </button>
                )}
                {onConnectStravaOAuth && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ width: 'auto', padding: '5px 9px', fontSize: 11 }}
                    onClick={onConnectStravaOAuth}
                  >
                    <ExternalLink size={12} /> OAuth
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grouped-list">
            {stravaActivities.slice(0, 3).map((sAct) => (
              <div
                key={sAct.id}
                className="list-row interactive"
                onClick={() => onOpenHistoryModal(sAct.type === 'Ride' ? 'act1' : 'act3')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onOpenHistoryModal(sAct.type === 'Ride' ? 'act1' : 'act3');
                }}
                style={{ padding: '11px 14px' }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                    <span className="badge badge-strava">{sAct.sportLabel}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                      {sAct.startDateLabel}
                    </span>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 13.5 }}>{sAct.name}</div>
                  <div
                    className="tabular-nums"
                    style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}
                  >
                    {formatDecimalPL(sAct.distanceKm, 1)} km · {sAct.paceOrSpeed} · {sAct.avgHr} bpm
                  </div>
                </div>
              </div>
            ))}

            <div
              className="list-row interactive"
              onClick={() => onOpenHistoryModal('act2')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onOpenHistoryModal('act2');
              }}
              style={{ padding: '11px 14px' }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                  <span className="badge badge-mint">Siłownia · Zatoka Sportu PŁ</span>
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Wtorek, 20.10</span>
                </div>
                <div style={{ fontWeight: 800, fontSize: 13.5 }}>
                  Dół ciała A — Siła i Przysiady
                </div>
                <div
                  className="tabular-nums"
                  style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}
                >
                  Tonaż: 6 840 kg · Serie: 14/14 · 55 min
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface ActiveWorkoutScreenProps {
  workout: WorkoutState;
  onSelectExerciseIdx: (idx: number) => void;
  onUpdateSetData: (exIdx: number, setIdx: number, field: 'weight' | 'reps', val: number) => void;
  onToggleSet: (exIdx: number, setIdx: number) => void;
  onAddExtraSet: (exIdx: number) => void;
  onToggleRestTimer: () => void;
  onAdjustRestTimer: (sec: number) => void;
  onResetRestTimer: () => void;
  onFinishWorkout: () => void;
}

export const ActiveWorkoutScreen: React.FC<ActiveWorkoutScreenProps> = ({
  workout,
  onSelectExerciseIdx,
  onUpdateSetData,
  onToggleSet,
  onAddExtraSet,
  onToggleRestTimer,
  onAdjustRestTimer,
  onResetRestTimer,
  onFinishWorkout,
}) => {
  const [showExerciseAnatomy, setShowExerciseAnatomy] = useState<boolean>(false);
  const safeIdx = Math.min(workout.currentExerciseIdx, Math.max(0, workout.exercises.length - 1));
  const ex = workout.exercises[safeIdx] || workout.exercises[0];
  const setsProgress = getWorkoutSetsProgress(workout.exercises);
  const sessionVolumeKg = getWorkoutVolumeKg(workout.exercises);
  const mins = String(Math.floor(workout.restTimerSeconds / 60)).padStart(2, '0');
  const secs = String(workout.restTimerSeconds % 60).padStart(2, '0');
  const timerPct =
    workout.restTimerInitial > 0
      ? Math.round((workout.restTimerSeconds / workout.restTimerInitial) * 100)
      : 0;

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
        }}
      >
        <span className="badge badge-strava">
          Ćwiczenie {safeIdx + 1} z {workout.exercises.length}
        </span>
        <div
          className="tabular-nums"
          style={{
            fontSize: 11.5,
            fontWeight: 700,
            color: 'var(--text-secondary)',
            display: 'flex',
            gap: 10,
          }}
        >
          <span>
            Serie:{' '}
            <strong style={{ color: 'var(--text-primary)' }}>
              {setsProgress.done}/{setsProgress.total}
            </strong>
          </span>
          <span>
            Tonaż:{' '}
            <strong style={{ color: 'var(--accent-mint-bright)' }}>
              {formatNumberPL(sessionVolumeKg)} kg
            </strong>
          </span>
        </div>
      </div>

      <div className="filter-pills" style={{ marginBottom: 10 }}>
        {workout.exercises.map((item, idx) => {
          const doneC = item.sets.filter((s) => s.done).length;
          return (
            <button
              key={item.name}
              type="button"
              className={`filter-pill ${idx === safeIdx ? 'active' : ''}`}
              onClick={() => onSelectExerciseIdx(idx)}
            >
              {idx + 1}. {item.name.split(' ')[0]} ({doneC}/{item.sets.length})
            </button>
          );
        })}
      </div>

      <div className="card" style={{ padding: '13px 14px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 8,
            marginBottom: 8,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 10.5,
                color: 'var(--accent-mint-bright)',
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              {ex.muscleGroup || ex.muscle}
            </div>
            <h2 style={{ fontSize: 16, fontWeight: 800, margin: '2px 0' }}>{ex.name}</h2>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ width: 'auto', padding: '5px 9px', fontSize: 11 }}
              onClick={() => setShowExerciseAnatomy((prev) => !prev)}
            >
              <Dumbbell size={12} /> {showExerciseAnatomy ? 'Ukryj mięśnie' : 'Mięśnie'}
            </button>
            <a
              href={ex.ytUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm"
              style={{ width: 'auto', padding: '5px 9px', fontSize: 11 }}
              title="Zobacz technikę wideo"
            >
              <PlayCircle size={13} /> Wideo
            </a>
          </div>
        </div>

        {showExerciseAnatomy && (
          <div style={{ marginBottom: 10 }}>
            <MuscleAnatomyMap
              mode="exercise-preview"
              exerciseName={ex.name}
              muscleLabel={ex.muscle}
              muscleGroup={ex.muscleGroup}
            />
          </div>
        )}

        <table className="sets-table" aria-label="Tabela serii ćwiczenia">
          <thead>
            <tr>
              <th>Seria</th>
              <th>Poprzednio</th>
              <th style={{ textAlign: 'center' }}>Ciężar (kg)</th>
              <th style={{ textAlign: 'center' }}>Powt.</th>
              <th style={{ textAlign: 'right' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {ex.sets.map((s, sIdx) => (
              <tr key={sIdx} className={`set-row ${s.done ? 'completed' : ''}`}>
                <td
                  className="tabular-nums"
                  style={{ fontWeight: 800, fontSize: 13, color: 'var(--text-secondary)' }}
                >
                  #{sIdx + 1}
                </td>
                <td style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>{ex.prevResult}</td>
                <td style={{ textAlign: 'center' }}>
                  <input
                    type="number"
                    step="0.5"
                    className="set-input"
                    aria-label={`Ciężar w serii ${sIdx + 1}`}
                    value={s.weight}
                    onChange={(e) => onUpdateSetData(safeIdx, sIdx, 'weight', Number(e.target.value))}
                  />
                </td>
                <td style={{ textAlign: 'center' }}>
                  <input
                    type="number"
                    className="set-input"
                    aria-label={`Powtórzenia w serii ${sIdx + 1}`}
                    value={s.reps}
                    onChange={(e) => onUpdateSetData(safeIdx, sIdx, 'reps', Number(e.target.value))}
                  />
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button
                    type="button"
                    className={`set-check-btn ${s.done ? 'done' : ''}`}
                    onClick={() => onToggleSet(safeIdx, sIdx)}
                    aria-label={`Zatwierdź serię ${sIdx + 1}`}
                  >
                    <Check size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ flex: 1 }}
            onClick={() => onAddExtraSet(safeIdx)}
          >
            <Plus size={14} /> Dodaj serię
          </button>
          {safeIdx < workout.exercises.length - 1 && (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              style={{ flex: 1 }}
              onClick={() => onSelectExerciseIdx(safeIdx + 1)}
            >
              Następne <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>

      <button type="button" className="btn btn-strava" onClick={onFinishWorkout}>
        <Flag size={15} />
        Zakończ trening (+150 EXP)
      </button>

      <div className="floating-rest-bar" role="region" aria-label="Timer przerwy między seriami">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <RadialGauge
            pct={timerPct}
            size={40}
            strokeWidth={4}
            color="#3ED6A3"
            centerLabel=""
            trackColor="rgba(255,255,255,0.16)"
          />
          <div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                textTransform: 'uppercase',
                color: '#8E95B2',
              }}
            >
              Przerwa
            </div>
            <div
              className="tabular-nums"
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: '#F5F6FA',
                letterSpacing: '0.5px',
              }}
            >
              {mins}:{secs}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button type="button" className="rest-bar-btn" onClick={onToggleRestTimer}>
            {workout.restTimerRunning ? <Pause size={13} /> : <Play size={13} />}
            {workout.restTimerRunning ? 'Pauza' : 'Start'}
          </button>
          <button type="button" className="rest-bar-btn" onClick={() => onAdjustRestTimer(15)}>
            +15 s
          </button>
          <button type="button" className="rest-bar-btn" onClick={onResetRestTimer}>
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};
