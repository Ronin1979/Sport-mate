import {
  ChartPeriodKey,
  ExerciseCatalogItem,
  FatSecretFoodItem,
  FatSecretMacroSuggestion,
  HumanAvatarConfig,
  LodzVenue,
  MacroDeficitSummary,
  MacroSuggestionFocus,
  MealEntry,
  MuscleAnatomyZoneId,
  MuscleGroupCategory,
  MuscleRankTier,
  MuscleZoneProgress,
  NutritionState,
  RegistrationFormData,
  SavedWorkoutPlan,
  SegmentLeaderboardEntry,
  SportEvent,
  StravaActivityItem,
  UserRankTier,
  VenueFacilityUnit,
  VenueLiveDetails,
  WeeklyChallenge,
  WeeklyChallengeEntry,
  WeeklyComparisonDay,
  WorkoutExercise,
  WorkoutPlanHistorySession,
  WorkoutPlanTemplateType,
} from '../types/sportmate';

/**
 * Formatowanie liczb całkowitych zgodnie z polską normą typograficzną z Księgi Standardów
 * (separator tysięcy to spacja, np. 52 800, 8 420)
 */
export function formatNumberPL(num: number): string {
  return Math.round(num)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

/**
 * Formatowanie liczb dziesiętnych zgodnie z polską normą (przecinek jako separator dziesiętny)
 */
export function formatDecimalPL(num: number, decimals = 1): string {
  const factor = Math.pow(10, decimals);
  const rounded = Math.round((num + Number.EPSILON) * factor) / factor;
  return rounded.toFixed(decimals).replace('.', ',');
}

/**
 * Formatowanie czasu timera w formacie MM:SS
 */
export function formatTimerMMSS(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const m = String(Math.floor(safe / 60)).padStart(2, '0');
  const s = String(safe % 60).padStart(2, '0');
  return `${m}:${s}`;
}

/**
 * Oblicza postęp serii w planie treningowym
 */
export function getWorkoutSetsProgress(exercises: WorkoutExercise[]): {
  done: number;
  total: number;
  pct: number;
} {
  let done = 0;
  let total = 0;
  for (const ex of exercises) {
    for (const st of ex.sets) {
      total++;
      if (st.done) done++;
    }
  }
  return {
    done,
    total,
    pct: total > 0 ? Math.round((done / total) * 100) : 0,
  };
}

/**
 * Oblicza łączną objętość (tonaż w kg) wykonanych serii
 */
export function getWorkoutVolumeKg(exercises: WorkoutExercise[]): number {
  let vol = 0;
  for (const ex of exercises) {
    for (const st of ex.sets) {
      if (st.done) {
        vol += (Number(st.weight) || 0) * (Number(st.reps) || 0);
      }
    }
  }
  return Math.round(vol);
}

/**
 * Oblicza sumę spożytych kalorii i makroskładników z listy posiłków
 */
export function getNutritionTotals(meals: MealEntry[]): {
  kcal: number;
  p: number;
  c: number;
  f: number;
} {
  let kcal = 0;
  let p = 0;
  let c = 0;
  let f = 0;
  for (const m of meals) {
    kcal += m.kcal;
    p += m.p;
    c += m.c;
    f += m.f;
  }
  return { kcal, p, c, f };
}

/**
 * Oblicza statystyki porównawcze obecnego tygodnia względem poprzedniego tygodnia (spalone kcal i objętość w kg)
 */
export function computeWeeklyComparisonMetrics(
  days: WeeklyComparisonDay[],
  liveTodayVolumeKg?: number
): {
  totalCurrentKcal: number;
  totalPrevKcal: number;
  kcalDeltaPct: number;
  kcalDeltaAbs: number;
  totalCurrentVolumeKg: number;
  totalPrevVolumeKg: number;
  volumeDeltaPct: number;
  volumeDeltaAbs: number;
  enrichedDays: (WeeklyComparisonDay & {
    kcalDiff: number;
    volumeDiff: number;
  })[];
} {
  const enrichedDays = days.map((d, idx) => {
    // Sobota (indeks 5) może odzwierciedlać na żywo dzisiejszy tonaż treningowy
    const currentVolumeKg =
      idx === 5 && typeof liveTodayVolumeKg === 'number' && liveTodayVolumeKg > 0
        ? liveTodayVolumeKg
        : d.currentVolumeKg;
    return {
      ...d,
      currentVolumeKg,
      kcalDiff: d.currentKcalBurned - d.prevKcalBurned,
      volumeDiff: currentVolumeKg - d.prevVolumeKg,
    };
  });

  const totalCurrentKcal = enrichedDays.reduce((acc, d) => acc + d.currentKcalBurned, 0);
  const totalPrevKcal = enrichedDays.reduce((acc, d) => acc + d.prevKcalBurned, 0);
  const kcalDeltaAbs = totalCurrentKcal - totalPrevKcal;
  const kcalDeltaPct =
    totalPrevKcal > 0
      ? Number((((totalCurrentKcal - totalPrevKcal) / totalPrevKcal) * 100).toFixed(1))
      : 0;

  const totalCurrentVolumeKg = enrichedDays.reduce((acc, d) => acc + d.currentVolumeKg, 0);
  const totalPrevVolumeKg = enrichedDays.reduce((acc, d) => acc + d.prevVolumeKg, 0);
  const volumeDeltaAbs = totalCurrentVolumeKg - totalPrevVolumeKg;
  const volumeDeltaPct =
    totalPrevVolumeKg > 0
      ? Number((((totalCurrentVolumeKg - totalPrevVolumeKg) / totalPrevVolumeKg) * 100).toFixed(1))
      : 0;

  return {
    totalCurrentKcal,
    totalPrevKcal,
    kcalDeltaPct,
    kcalDeltaAbs,
    totalCurrentVolumeKg,
    totalPrevVolumeKg,
    volumeDeltaPct,
    volumeDeltaAbs,
    enrichedDays,
  };
}

/**
 * Zwraca wymagane partie mięśniowe dla wybranego szablonu planu (np. FBW, Push, Pull, Legs)
 */
export function getPlanTemplateRequiredGroups(
  template: WorkoutPlanTemplateType
): MuscleGroupCategory[] {
  switch (template) {
    case 'FBW':
      return [
        'Klatka piersiowa',
        'Plecy',
        'Nogi (Czworogłowe i Pośladki)',
        'Nogi (Dwugłowe i Łydki)',
        'Barki',
        'Brzuch i Core',
      ];
    case 'Push':
      return ['Klatka piersiowa', 'Barki', 'Triceps'];
    case 'Pull':
      return ['Plecy', 'Biceps', 'Brzuch i Core'];
    case 'Legs':
      return ['Nogi (Czworogłowe i Pośladki)', 'Nogi (Dwugłowe i Łydki)', 'Brzuch i Core'];
    case 'Upper':
      return ['Klatka piersiowa', 'Plecy', 'Barki', 'Biceps', 'Triceps'];
    case 'Custom':
    default:
      return ['Klatka piersiowa', 'Plecy', 'Nogi (Czworogłowe i Pośladki)'];
  }
}

/**
 * Zwraca brakujące partie mięśniowe w aktualnie układanym planie względem szablonu
 */
export function getMissingMuscleGroupsForTemplate(
  template: WorkoutPlanTemplateType,
  selectedExercises: { muscleGroup?: MuscleGroupCategory }[]
): MuscleGroupCategory[] {
  const required = getPlanTemplateRequiredGroups(template);
  const covered = new Set(selectedExercises.map((e) => e.muscleGroup).filter(Boolean));
  return required.filter((group) => !covered.has(group));
}

/**
 * Zwraca inteligentne podpowiedzi ćwiczeń z bazy dla wybranego szablonu (priorytetyzując brakujące partie)
 */
export function getRecommendedExercisesForTemplate(
  template: WorkoutPlanTemplateType,
  catalog: ExerciseCatalogItem[],
  alreadySelectedNames: string[]
): ExerciseCatalogItem[] {
  const selectedSet = new Set(alreadySelectedNames);
  const selectedItems = catalog.filter((item) => selectedSet.has(item.name));
  const missingGroups = new Set(getMissingMuscleGroupsForTemplate(template, selectedItems));

  const candidates = catalog.filter(
    (item) => !selectedSet.has(item.name) && item.recommendedFor.includes(template)
  );

  return candidates.sort((a, b) => {
    const aMissing = missingGroups.has(a.muscleGroup) ? 0 : 1;
    const bMissing = missingGroups.has(b.muscleGroup) ? 0 : 1;
    return aMissing - bMissing;
  });
}

/**
 * Aktualizuje tabelę wyników segmentu Strava o nowy czas bieżącego użytkownika i sortuje rosnąco
 */
export function insertOrUpdateSegmentAttempt(
  leaderboard: SegmentLeaderboardEntry[],
  userName: string,
  userAvatar: HumanAvatarConfig,
  newTimeSeconds: number,
  distanceKm: number,
  sport: 'run' | 'bike' | 'Bieganie' | 'Kolarstwo'
): SegmentLeaderboardEntry[] {
  const safeSeconds = Math.max(30, Math.round(newTimeSeconds));
  const timeFormatted = formatTimerMMSS(safeSeconds);

  let paceOrSpeed = '';
  if (sport === 'run' || sport === 'Bieganie') {
    const secPerKm = safeSeconds / Math.max(0.1, distanceKm);
    paceOrSpeed = `${formatTimerMMSS(secPerKm)} /km`;
  } else {
    const hours = safeSeconds / 3600;
    const kmh = distanceKm / Math.max(0.001, hours);
    paceOrSpeed = `${formatDecimalPL(kmh, 1)} km/h`;
  }

  const filtered = leaderboard.filter((entry) => !entry.isCurrentUser && entry.name !== userName);
  filtered.push({
    rank: 0,
    name: userName,
    isCurrentUser: true,
    avatar: userAvatar,
    timeFormatted,
    timeSeconds: safeSeconds,
    paceOrSpeed,
    date: 'Dziś (Nowy wynik!)',
  });

  filtered.sort((a, b) => a.timeSeconds - b.timeSeconds);
  return filtered.map((entry, idx) => ({
    ...entry,
    rank: idx + 1,
    isKom: idx === 0,
  }));
}

/**
 * Walidacja formularza rejestracji nowego konta
 */
export function validateRegistrationForm(form: RegistrationFormData): {
  valid: boolean;
  error?: string;
} {
  if (!form.fullName || form.fullName.trim().length < 2) {
    return { valid: false, error: 'Podaj imię i nazwisko (minimum 2 znaki).' };
  }
  if (!form.email || !form.email.includes('@')) {
    return { valid: false, error: 'Podaj poprawny adres e-mail.' };
  }
  if (!form.password || form.password.length < 6) {
    return { valid: false, error: 'Hasło musi zawierać minimum 6 znaków.' };
  }
  if (form.age < 13 || form.age > 100) {
    return { valid: false, error: 'Podaj prawidłowy wiek (13–100 lat).' };
  }
  if (form.weightKg < 30 || form.weightKg > 250) {
    return { valid: false, error: 'Podaj prawidłową masę ciała (30–250 kg).' };
  }
  if (form.heightCm < 120 || form.heightCm > 230) {
    return { valid: false, error: 'Podaj prawidłowy wzrost (120–230 cm).' };
  }
  if (!form.acceptTerms) {
    return { valid: false, error: 'Zaakceptuj regulamin i politykę prywatności SportMate.' };
  }
  return { valid: true };
}

/**
 * Oblicza adaptacyjne zapotrzebowanie kaloryczne (na podstawie masy ciała i celu)
 */
export function calculateAdaptiveMacros(
  weightKg: number,
  primaryGoal: string
): {
  kcalGoal: number;
  proteinGoal: number;
  fatGoal: number;
  carbsGoal: number;
} {
  const safeWeight = Math.max(40, Math.min(200, Number(weightKg) || 78));
  let baseKcal = Math.round(safeWeight * 33);

  const g = (primaryGoal || '').toLowerCase();
  if (g.includes('siła') || g.includes('masa') || g.includes('hipertrof')) {
    baseKcal += 250;
  } else if (g.includes('redukcja')) {
    baseKcal -= 300;
  }

  const kcalGoal = Math.round(baseKcal / 10) * 10;
  const proteinGoal = Math.round(safeWeight * 2.1);
  const fatGoal = Math.round((kcalGoal * 0.25) / 9);
  const carbsGoal = Math.max(120, Math.round((kcalGoal - proteinGoal * 4 - fatGoal * 9) / 4));

  return { kcalGoal, proteinGoal, fatGoal, carbsGoal };
}

/**
 * Zwięzły silnik odpowiedzi Trenera AI (używany również jako natychmiastowy fallback offline):
 * Odpowiada krótko, konkretnie i bez sztucznych formułek wstępnych ani powtarzania telemetrii Garmin.
 */
export function buildAIReply(
  promptText: string,
  ctx: {
    restingHr: number;
    sleepHours: string;
    readinessScore: number;
    kcalGoal: number;
    proteinGoal: number;
    kcalEaten: number;
    proteinEaten: number;
    planName: string;
    mascotName: string;
    weightKg?: number;
  }
): string {
  const cleanPrompt = promptText.trim();
  const lower = cleanPrompt.toLowerCase();
  const leftKcal = Math.max(0, ctx.kcalGoal - ctx.kcalEaten);
  const leftProt = Math.max(0, ctx.proteinGoal - ctx.proteinEaten);
  const userWeight = ctx.weightKg || 79;

  const matchedNumbers = cleanPrompt.match(/\d+([.,]\d+)?/g) || [];
  const firstNum = matchedNumbers.length > 0 ? parseFloat(matchedNumbers[0].replace(',', '.')) : null;

  // Krótkie powitania lub jednowyrazowe zaczepki
  if (
    /^(cześć|czesc|hej|siema|witaj|dzień dobry|dzien dobry|halo|elo|yo|hi|hello)[!?.]*$/i.test(
      cleanPrompt
    )
  ) {
    return 'Cześć! Napisz, nad czym dziś pracujemy — chętnie pomogę z doborem ćwiczeń, techniką, dietą lub trasą biegową w Łodzi.';
  }

  if (cleanPrompt.length <= 2) {
    return 'Napisz proszę pełne pytanie (np. o plan treningowy, konkretne ćwiczenie, dietę lub trasę biegową), a od razu krótko i konkretnie podpowiem!';
  }

  const segments: string[] = [];

  // 1. Stawy / kontuzje / ból
  if (
    lower.includes('kolan') ||
    lower.includes('łąkotk') ||
    lower.includes('rzepk') ||
    lower.includes('więzadł')
  ) {
    segments.push(
      'Przy dyskomforcie kolana zamień głębokie przysiady na Rumuński Martwy Ciąg (RDL 3×10), Hip Thrust oraz izometryczne krzesełko przy ścianie (Wall Sit 3×35 s). Do biegania wybieraj miękkie ścieżki leśne w Arturówku zamiast asfaltu.'
    );
  }

  if (
    lower.includes('bark') ||
    lower.includes('ramię') ||
    lower.includes('ohp') ||
    lower.includes('stożek') ||
    lower.includes('obojczyk')
  ) {
    segments.push(
      'Aby odciążyć barki, zamień sztangę na hantle trzymane chwytem neutralnym (młotkowym) na ławce skośnej 30°. Przed treningiem wykonaj 3×15 Face Pulls na wyciągu dla stabilizacji stożka rotatorów.'
    );
  }

  if (
    lower.includes('plec') ||
    lower.includes('lędźwi') ||
    lower.includes('kręgosłup') ||
    lower.includes('rwa')
  ) {
    segments.push(
      'Na plecy bez obciążania lędźwi najlepiej sprawdza się wiosłowanie leżąc przodem na ławce (Seal Row), podciąganie na drążku oraz ściąganie wyciągu górnego. Pilnuj napięcia brzucha (bracingu) w każdej serii.'
    );
  }

  // 2. Ćwiczenia siłowe
  if (lower.includes('przysiad') || lower.includes('squat') || lower.includes('nogi')) {
    const targetLoad = firstNum && firstNum >= 30 && firstNum <= 250 ? ` (${firstNum} kg)` : '';
    segments.push(
      `W przysiadzie${targetLoad} utrzymuj ciężar na całej stopie, prowadź kolana w linii palców i kontroluj fazę opuszczania przez 2–3 sekundy. Dobrym uzupełnieniem na czworogłowe i pośladki będzie przysiad bułgarski (3×10 na nogę).`
    );
  }

  if (
    lower.includes('wyciskan') ||
    lower.includes('klat') ||
    lower.includes('ławk') ||
    lower.includes('bench')
  ) {
    segments.push(
      'W wyciskaniu na klatkę ściągnij i obniż łopatki, wbij stopy w podłoże i prowadź sztangę lub hantle pod kątem ok. 45° względem tułowia. Aby przełamać stagnację, dodaj 1-sekundową pauzę na dole ruchu.'
    );
  }

  if (lower.includes('martwy') || lower.includes('deadlift') || lower.includes('rdl')) {
    segments.push(
      'W martwym ciągu ustaw gryf nad środkiem stopy, wybierz luz ze sztangi przed oderwaniem ciężaru i prowadź ją blisko piszczeli przy sztywnym korpusie.'
    );
  }

  if (lower.includes('podciąg') || lower.includes('drążek') || lower.includes('pull-up')) {
    segments.push(
      'Zaczynaj każde podciągnięcie od obniżenia łopatek i ciągnij łokcie w dół w stronę bioder. Jeśli chcesz zwiększyć liczbę powtórzeń, rób 4 serie z zapasem 1 powtórzenia lub powolne opuszczania (negatywy 4 s).'
    );
  }

  if (
    lower.includes('biceps') ||
    lower.includes('triceps') ||
    lower.includes('ramion') ||
    lower.includes('łapy')
  ) {
    segments.push(
      'Na ramiona połącz uginanie z hantlami na ławce skośnej oraz prostowanie ramion z liną wyciągu górnego w zakresie 10–14 powtórzeń (zostawiając 1 powtórzenie w zapasie).'
    );
  }

  if (lower.includes('brzuch') || lower.includes('core') || lower.includes('abs')) {
    segments.push(
      'Na brzuch najlepiej działają ćwiczenia z obciążeniem: Allahy (skłony z liną wyciągu klęcząc 3×15), unoszenie nóg w zwisie na drążku oraz Pallof Press.'
    );
  }

  // 3. Dieta, białko, posiłki, suplementy
  if (
    lower.includes('białk') ||
    lower.includes('protein') ||
    lower.includes('makro') ||
    lower.includes('ile gram')
  ) {
    const targetWeight = firstNum && firstNum >= 40 && firstNum <= 160 ? firstNum : userWeight;
    const minP = Math.round(targetWeight * 1.8);
    const maxP = Math.round(targetWeight * 2.2);
    segments.push(
      `Przy wadze ${targetWeight} kg celuj w ${minP}–${maxP} g białka dziennie (po 35–45 g na posiłek). Do zamknięcia dzisiejszej puli brakuje Ci jeszcze ${leftProt} g białka.`
    );
  }

  if (
    lower.includes('śniadan') ||
    lower.includes('obiad') ||
    lower.includes('kolacj') ||
    lower.includes('posił') ||
    lower.includes('zjeść') ||
    lower.includes('jedzen') ||
    lower.includes('kalori')
  ) {
    segments.push(
      `Do końca dnia masz w bilansie ${formatNumberPL(leftKcal)} kcal i ${leftProt} g białka. Po treningu świetnie sprawdzi się 200 g piersi z kurczaka z ryżem jaśminowym lub skyr z płatkami owsianymi i owocami.`
    );
  }

  if (
    lower.includes('kreatyn') ||
    lower.includes('suple') ||
    lower.includes('kofein') ||
    lower.includes('witamin')
  ) {
    segments.push(
      'Stosuj 5 g monohydratu kreatyny dziennie o stałej porze oraz 2000–4000 IU witaminy D3 do posiłku. Kofeinę (3 mg/kg m.c.) przyjmuj najpóźniej 6 godzin przed snem.'
    );
  }

  if (lower.includes('redukcj') || lower.includes('schud') || lower.includes('tłuszcz')) {
    segments.push(
      `Na redukcji utrzymuj deficyt 300–400 kcal (ok. ${formatNumberPL(ctx.kcalGoal - 350)} kcal), jedz ${ctx.proteinGoal} g białka i utrzymuj ciężary siłowe, aby zachować pełną masę mięśniową.`
    );
  }

  // 4. Bieganie, rower, Łódź
  if (
    lower.includes('bieg') ||
    lower.includes('tempo') ||
    lower.includes('5 km') ||
    lower.includes('10 km') ||
    lower.includes('arturów') ||
    lower.includes('poniatowsk') ||
    lower.includes('zdrowi') ||
    lower.includes('tras')
  ) {
    const dist = firstNum && firstNum <= 42 ? `${firstNum} km` : '5 km';
    segments.push(
      `Na bieg ${dist} w Łodzi polecam pętlę wokół stawów w Arturówku lub alejki Parku Poniatowskiego. Zacznij pierwsze 1,5 km spokojnie w Strefie 2, utrzymuj kadencję ~175 kroków/min i przyspiesz na ostatnim kilometrze.`
    );
  }

  if (
    lower.includes('rower') ||
    lower.includes('kolar') ||
    lower.includes('szos') ||
    lower.includes('gravel') ||
    lower.includes('łagiewnik')
  ) {
    segments.push(
      'Na szosę lub gravel wybierz trasę przez Las Łagiewnicki i podjazd ul. Wycieczkową. Utrzymuj kadencję 85–90 obr./min i zabierz bidon z izotonikiem.'
    );
  }

  // 5. Planowanie treningu / Sen (tylko gdy użytkownik o to pyta!)
  if (
    lower.includes('fbw') ||
    lower.includes('push') ||
    lower.includes('pull') ||
    lower.includes('legs') ||
    lower.includes('plan') ||
    lower.includes('rozpisz') ||
    lower.includes('ułóż')
  ) {
    segments.push(
      'W planie FBW 3× w tygodniu wybieraj po 1 ćwiczeniu wielostawowym na nogi, klatkę, plecy i barki (po 3–4 serie robocze w zakresie 6–12 powtórzeń). Możesz go ułożyć jednym kliknięciem w zakładce „Aktywność → Kreator Planu”.'
    );
  }

  if (
    lower.includes('sen') ||
    lower.includes('regeneracj') ||
    lower.includes('zmęcz') ||
    lower.includes('hrv') ||
    lower.includes('tętno') ||
    lower.includes('tydzień')
  ) {
    segments.push(
      `Twój sen (${ctx.sleepHours}), tętno spoczynkowe ${ctx.restingHr} bpm i gotowość ${ctx.readinessScore}/100 wskazują na pełną regenerację układu nerwowego — możesz dziś wykonać mocny trening.`
    );
  }

  if (segments.length > 0) {
    return segments.join(' ');
  }

  return `Aby zrobić szybki progres w tym obszarze, postaw na regularność (3–4 sesje w tygodniu), kontrolę techniki z zapasem 1–2 powtórzeń (RIR 1–2) i domknięcie dziennego białka (${ctx.proteinGoal} g). Napisz, o jakie konkretne ćwiczenie lub cel Ci chodzi, a podam dokładne wskazówki!`;
}

/**
 * Aktualizuje wynik w Wyzwaniu Tygodniowym w czasie rzeczywistym, przelicza ranking i pozycję użytkownika
 */
export function updateWeeklyChallengeScore(
  challenge: WeeklyChallenge,
  deltaOrNewValue: number,
  userName: string,
  userAvatar: HumanAvatarConfig,
  mode: 'user_progress' | 'rival_tick' = 'user_progress'
): {
  updatedChallenge: WeeklyChallenge;
  userRank: number;
  previousRank: number;
} {
  const prevUserEntry = challenge.leaderboard.find((e) => e.isCurrentUser);
  const previousRank = prevUserEntry ? prevUserEntry.rank : challenge.leaderboard.length;

  const formatScore = (val: number): string => {
    if (challenge.metricType === 'distance_km') {
      return `${formatDecimalPL(val, 1)} km`;
    }
    if (challenge.metricType === 'segment_time_sec') {
      return formatTimerMMSS(val);
    }
    return `${formatNumberPL(val)} kg`;
  };

  let entries: WeeklyChallengeEntry[] = challenge.leaderboard.map((entry) => ({ ...entry }));

  if (mode === 'user_progress') {
    const idx = entries.findIndex((e) => e.isCurrentUser || e.name === userName);
    if (idx >= 0) {
      const curr = entries[idx];
      let nextVal = curr.scoreValue;
      let deltaText = '';
      if (challenge.metricType === 'segment_time_sec') {
        // Dla segmentu czasowego: jeśli podano pełny czas (>120 s), ustaw go, w przeciwnym razie odejmij sekundy (poprawa czasu)
        nextVal =
          deltaOrNewValue > 120
            ? Math.max(180, Math.round(deltaOrNewValue))
            : Math.max(180, curr.scoreValue - Math.abs(Math.round(deltaOrNewValue)));
        const diffSec = curr.scoreValue - nextVal;
        deltaText = diffSec > 0 ? `-${diffSec} s (Nowy PB!)` : 'Zaktualizowano na żywo';
      } else if (challenge.metricType === 'distance_km') {
        const addKm = Math.max(0.5, Number(deltaOrNewValue) || 5);
        nextVal = Number((curr.scoreValue + addKm).toFixed(1));
        deltaText = `+${formatDecimalPL(addKm, 1)} km przed chwilą`;
      } else {
        const addKg = Math.max(100, Math.round(deltaOrNewValue) || 1800);
        nextVal = curr.scoreValue + addKg;
        deltaText = `+${formatNumberPL(addKg)} kg przed chwilą`;
      }

      entries[idx] = {
        ...curr,
        name: userName,
        avatar: userAvatar,
        isCurrentUser: true,
        scoreValue: nextVal,
        scoreFormatted: formatScore(nextVal),
        deltaLabel: deltaText,
      };
    } else {
      const initVal =
        challenge.metricType === 'segment_time_sec'
          ? Math.max(300, Math.round(deltaOrNewValue))
          : Math.max(1, Number(deltaOrNewValue));
      entries.push({
        id: 'wc-user-' + Date.now(),
        name: userName,
        district: 'Łódź, Śródmieście',
        avatar: userAvatar,
        isCurrentUser: true,
        scoreValue: initVal,
        scoreFormatted: formatScore(initVal),
        secondaryLabel: 'Twój wynik na żywo',
        rank: entries.length + 1,
        deltaLabel: 'Nowy wpis',
      });
    }
  } else {
    // Symulacja aktualizacji rywali w czasie rzeczywistym (Live Rival Tick)
    const rivalIdx = entries.findIndex((e) => !e.isCurrentUser && e.rank > 1);
    const targetIdx = rivalIdx >= 0 ? rivalIdx : entries.findIndex((e) => !e.isCurrentUser);
    if (targetIdx >= 0) {
      const riv = entries[targetIdx];
      let nextVal = riv.scoreValue;
      let deltaText = '';
      if (challenge.metricType === 'distance_km') {
        const add = Number((deltaOrNewValue || 2.4).toFixed(1));
        nextVal = Number((riv.scoreValue + add).toFixed(1));
        deltaText = `+${formatDecimalPL(add, 1)} km LIVE`;
      } else if (challenge.metricType === 'segment_time_sec') {
        nextVal = Math.max(300, riv.scoreValue - 4);
        deltaText = '-4 s LIVE';
      } else {
        const addKg = Math.round(deltaOrNewValue || 1250);
        nextVal = riv.scoreValue + addKg;
        deltaText = `+${formatNumberPL(addKg)} kg LIVE`;
      }
      entries[targetIdx] = {
        ...riv,
        scoreValue: nextVal,
        scoreFormatted: formatScore(nextVal),
        deltaLabel: deltaText,
      };
    }
  }

  // Sortowanie w czasie rzeczywistym
  entries.sort((a, b) =>
    challenge.sortDirection === 'asc'
      ? a.scoreValue - b.scoreValue
      : b.scoreValue - a.scoreValue
  );

  const leaderVal = entries[0]?.scoreValue || 0;

  entries = entries.map((entry, index) => {
    const rank = index + 1;
    let secondaryLabel = entry.secondaryLabel;
    if (entry.isCurrentUser) {
      if (rank === 1) {
        secondaryLabel = '👑 Prowadzisz w wyzwaniu tygodniowym w Łodzi!';
      } else if (challenge.metricType === 'distance_km') {
        const diff = Math.max(0.1, Number((leaderVal - entry.scoreValue).toFixed(1)));
        secondaryLabel = `Twój wynik · Do lidera (#1) brakuje ${formatDecimalPL(diff, 1)} km`;
      } else if (challenge.metricType === 'segment_time_sec') {
        const diffSec = Math.max(1, entry.scoreValue - leaderVal);
        const paceSec = Math.round(entry.scoreValue / 4.2);
        secondaryLabel = `Tempo: ${formatTimerMMSS(paceSec)} /km · Strata ${formatTimerMMSS(diffSec)} do #1`;
      } else {
        const diffKg = Math.max(50, leaderVal - entry.scoreValue);
        secondaryLabel = `Twój wynik · Do lidera (#1) brakuje ${formatNumberPL(diffKg)} kg`;
      }
    } else if (challenge.metricType === 'segment_time_sec') {
      const paceSec = Math.round(entry.scoreValue / 4.2);
      secondaryLabel =
        rank === 1
          ? `Tempo: ${formatTimerMMSS(paceSec)} /km · Lider tygodnia`
          : `Tempo: ${formatTimerMMSS(paceSec)} /km`;
    }
    return {
      ...entry,
      rank,
      secondaryLabel,
    };
  });

  const userRank = entries.find((e) => e.isCurrentUser)?.rank || 1;

  return {
    updatedChallenge: {
      ...challenge,
      joined: true,
      leaderboard: entries,
    },
    userRank,
    previousRank,
  };
}

/**
 * Kontekstowy generator odpowiedzi partnera treningowego / czatu grupowego (oraz fallback offline),
 * dopasowujący odpowiedź bezpośrednio do treści wiadomości użytkownika.
 */
export function buildPartnerReply(
  userMessage: string,
  partner: {
    id?: string;
    title: string;
    subtitle?: string;
    type?: 'partner' | 'event';
  }
): string {
  const clean = userMessage.trim();
  const lower = clean.toLowerCase();
  const firstName = partner.title.split(' ')[0];
  const subLower = (partner.subtitle || '').toLowerCase();

  // Wykryj godzinę podaną przez użytkownika (np. "18:00", "19:30", "o 17", "o 9")
  const timeMatch =
    clean.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/) ||
    clean.match(/\bo\s*([01]?\d|2[0-3])\b/i);
  const extractedTime = timeMatch
    ? timeMatch[0].replace(/^o\s*/i, '').includes(':')
      ? timeMatch[0].replace(/^o\s*/i, '')
      : `${timeMatch[1]}:00`
    : null;

  // Wykryj dzień tygodnia
  const dayMatch = lower.match(
    /(poniedział|wtorek|wtork|środ|czwart|piątek|piątk|sobot|niedziel|jutro|dzisiaj|dziś)/
  );
  const dayPhrase = dayMatch ? dayMatch[0] : null;

  const isCycling =
    subLower.includes('kolar') ||
    subLower.includes('szos') ||
    partner.title.includes('Bartek') ||
    partner.title.includes('Arturówek');
  const isTennis =
    subLower.includes('tenis') || partner.title.includes('Karolina');
  const isGym =
    subLower.includes('siłowni') ||
    subLower.includes('zatoka') ||
    partner.title.includes('Michał');

  // 1. Pytania o godzinę / termin spotkania
  if (
    extractedTime ||
    lower.includes('której') ||
    lower.includes('kiedy') ||
    lower.includes('godzin') ||
    lower.includes('pasuje') ||
    lower.includes('jutro') ||
    lower.includes('dziś') ||
    lower.includes('dzisiaj')
  ) {
    const timeStr = extractedTime || (isCycling ? '09:30' : isGym ? '18:00' : '18:30');
    if (isCycling) {
      return `Godzina ${timeStr}${dayPhrase ? ` (${dayPhrase})` : ''} pasuje mi idealnie! Spotkajmy się przy głównym parkingu obok stawów w Arturówku — wezmę pompkę i zapasową dętkę.`;
    }
    if (isTennis) {
      return `${timeStr} brzmi super! Zarezerwuję kort w Parku Poniatowskiego i wezmę nową puszkę piłek, do zobaczenia na miejscu.`;
    }
    if (isGym) {
      return `Jasne, ${timeStr} w Zatoce Sportu PŁ mi pasuje! Będę czekał przy strefie wolnych ciężarów i ławkach po szybkiej rozgrzewce.`;
    }
    return `Super, godzina ${timeStr} jak najbardziej mi pasuje! Widzimy się przy głównym wejściu do parku 5 minut przed startem.`;
  }

  // 2. Pytania o miejsce / lokalizację w Łodzi
  if (
    lower.includes('gdzie') ||
    lower.includes('miejsc') ||
    lower.includes('adres') ||
    lower.includes('skąd') ||
    lower.includes('park') ||
    lower.includes('zatok') ||
    lower.includes('fitfabric') ||
    lower.includes('arturów')
  ) {
    if (isCycling) {
      return 'Startujemy przy przystani w Arturówku (ul. Skrzydlata 75), a stamtąd lecimy pętlą przez Las Łagiewnicki i Wzniesienia Łódzkie.';
    }
    if (isTennis) {
      return 'Najwygodniej będzie na kortach MKT w Parku Poniatowskiego (wejście od ul. Inżynierskiej) albo na ścieżce biegowej wokół parku.';
    }
    if (isGym) {
      return 'Widzimy się na siłowni w Zatoce Sportu PŁ (Al. Politechniki 10) przy pomostach i wolnych ciężarach.';
    }
    return 'Spotkajmy się w Parku Poniatowskiego przy alei głównej od strony ul. Inżynierskiej — jest tam dobre miejsce na rozgrzewkę.';
  }

  // 3. Pytania o tempo / dystans / ciężary / plan treningu
  if (
    lower.includes('temp') ||
    lower.includes('ile km') ||
    lower.includes('dystans') ||
    lower.includes('szybk') ||
    lower.includes('ciężar') ||
    lower.includes('co robimy') ||
    lower.includes('plan') ||
    lower.includes('jakie')
  ) {
    if (isCycling) {
      return 'Planuję ok. 42–45 km równym tempem 29–30 km/h w kole, a na podjeździe ul. Wycieczkową możemy zrobić mocniejszy sprawdzian pod segment KOM!';
    }
    if (isTennis) {
      return 'Zaczniemy od 15 minut luźnego przebijania z głębi kortu, a potem zagramy dwa sety na punkty lub przebiegniemy 5 km w tempie 4:55/km.';
    }
    if (isGym) {
      return 'Dziś w planie mam wyciskanie na ławce, wiosłowanie sztangą i barki — chętnie poasekuruję Cię przy cięższych seriach roboczych!';
    }
    return 'Planuję spokojne 5–6 km w tempie konwersacyjnym (ok. 5:00–5:15/km), żeby utrzymać drugą strefę tętna.';
  }

  // 4. Krótkie przywitania
  if (
    /^(cześć|czesc|hej|siema|witaj|dzień dobry|dzien dobry|halo|elo)[!?.]*$/i.test(clean)
  ) {
    return `Cześć! Tu ${firstName} — super że piszesz. Daj znać, jaki dzień i godzina w tym tygodniu najbardziej pasują Ci na wspólny trening w Łodzi!`;
  }

  // 5. Odpowiedź domyślna nawiązująca bezpośrednio do wiadomości użytkownika
  if (isCycling) {
    return `Brzmi świetnie! Dopasuję się do Twojej propozycji — sprzęt mam już naszykowany na trasę w Arturówku, daj tylko znać czy potwierdzamy start.`;
  }
  if (isTennis) {
    return `Super pomysł! Chętnie się dostosuję — uwielbiam trenować w Parku Poniatowskiego, więc daj znać na którą godzinę mam rezerwować termin.`;
  }
  if (isGym) {
    return `Elegancko, wchodzę w to! Na siłowni w Zatoce Sportu we dwóch zawsze wchodzi lepszy progres i pewniejsza asekuracja.`;
  }
  return `Dzięki za wiadomość! Brzmi bardzo dobrze — dopasuję się do szczegółów, daj tylko znać o której dokładnie się łapiemy.`;
}

/**
 * Zwraca informację o randze mięśniowej i kolorze na mapie anatomicznej na podstawie poziomu (1..6+)
 */
export function getMuscleRankInfo(level: number): {
  tier: MuscleRankTier;
  color: string;
  strokeColor: string;
  fillOpacity: number;
  badgeBg: string;
  nextTierLabel: string;
} {
  if (level <= 1) {
    return {
      tier: 'Unranked',
      color: '#64748B',
      strokeColor: '#94A3B8',
      fillOpacity: 0.45,
      badgeBg: 'rgba(100, 116, 139, 0.18)',
      nextTierLabel: 'Bronze',
    };
  }
  if (level === 2) {
    return {
      tier: 'Bronze',
      color: '#CD7F32',
      strokeColor: '#F59E0B',
      fillOpacity: 0.72,
      badgeBg: 'rgba(205, 127, 50, 0.2)',
      nextTierLabel: 'Silver',
    };
  }
  if (level === 3) {
    return {
      tier: 'Silver',
      color: '#94A3B8',
      strokeColor: '#E2E8F0',
      fillOpacity: 0.78,
      badgeBg: 'rgba(148, 163, 184, 0.22)',
      nextTierLabel: 'Gold',
    };
  }
  if (level === 4) {
    return {
      tier: 'Gold',
      color: '#F59E0B',
      strokeColor: '#FDE68A',
      fillOpacity: 0.86,
      badgeBg: 'rgba(245, 158, 11, 0.22)',
      nextTierLabel: 'Emerald',
    };
  }
  if (level === 5) {
    return {
      tier: 'Emerald',
      color: '#3ED6A3',
      strokeColor: '#6EE7B7',
      fillOpacity: 0.92,
      badgeBg: 'rgba(62, 214, 163, 0.22)',
      nextTierLabel: 'Master',
    };
  }
  return {
    tier: 'Master',
    color: '#FF6B35',
    strokeColor: '#FDBA74',
    fillOpacity: 0.96,
    badgeBg: 'rgba(255, 107, 53, 0.24)',
    nextTierLabel: 'Max Rank',
  };
}

/**
 * Mapuje nazwę ćwiczenia, opis mięśni i kategorię na strefy anatomiczne (główne i pomocnicze)
 */
export function getExerciseTargetZones(
  exerciseName: string,
  muscleLabel: string,
  muscleGroup?: MuscleGroupCategory
): {
  primary: MuscleAnatomyZoneId[];
  secondary: MuscleAnatomyZoneId[];
} {
  const nameLower = exerciseName.toLowerCase();
  const text = `${exerciseName} ${muscleLabel} ${muscleGroup || ''}`.toLowerCase();
  const primary = new Set<MuscleAnatomyZoneId>();
  const secondary = new Set<MuscleAnatomyZoneId>();

  if (
    muscleGroup === 'Klatka piersiowa' ||
    nameLower.includes('klatk') ||
    nameLower.includes('ławce') ||
    nameLower.includes('rozpiętki') ||
    nameLower.includes('krzyżowanie')
  ) {
    primary.add('chest');
    secondary.add('shoulders');
    secondary.add('triceps');
  }

  if (
    muscleGroup === 'Plecy' ||
    nameLower.includes('wiosłowanie') ||
    nameLower.includes('podciąganie') ||
    nameLower.includes('ściąganie drążka') ||
    nameLower.includes('najszersz') ||
    nameLower.includes('narciarz')
  ) {
    primary.add('back');
    secondary.add('biceps');
    secondary.add('traps');
    if (text.includes('martwy ciąg') || nameLower.includes('wiosłowanie sztangą')) {
      secondary.add('lower_back');
    }
  }

  if (
    nameLower.includes('face pull') ||
    nameLower.includes('kaptur') ||
    nameLower.includes('czworoboczn') ||
    nameLower.includes('szrugs')
  ) {
    primary.add('traps');
    primary.add('shoulders');
    secondary.add('back');
  }

  if (
    muscleGroup === 'Barki' ||
    nameLower.includes('bark') ||
    nameLower.includes('żołnierskie') ||
    nameLower.includes('ohp') ||
    nameLower.includes('wznosy bokiem') ||
    nameLower.includes('arnoldki')
  ) {
    primary.add('shoulders');
    secondary.add('traps');
    if (nameLower.includes('wyciskanie') || nameLower.includes('ohp') || nameLower.includes('arnold')) {
      secondary.add('triceps');
    }
  }

  if (
    muscleGroup === 'Biceps' ||
    nameLower.includes('biceps') ||
    nameLower.includes('uginanie ramion') ||
    nameLower.includes('młotkow') ||
    nameLower.includes('modlitewnik') ||
    nameLower.includes('zottman')
  ) {
    primary.add('biceps');
  }

  if (
    muscleGroup === 'Triceps' ||
    nameLower.includes('triceps') ||
    nameLower.includes('prostowanie ramion') ||
    nameLower.includes('francuskie') ||
    nameLower.includes('poręczach') ||
    nameLower.includes('dipy')
  ) {
    primary.add('triceps');
    if (nameLower.includes('poręczach') || nameLower.includes('dipy')) {
      secondary.add('chest');
      secondary.add('shoulders');
    }
  }

  if (
    muscleGroup === 'Nogi (Czworogłowe i Pośladki)' ||
    nameLower.includes('przysiad') ||
    nameLower.includes('suwnic') ||
    nameLower.includes('wykrok') ||
    nameLower.includes('prostowanie nóg')
  ) {
    primary.add('quads');
    if (!nameLower.includes('prostowanie nóg')) {
      primary.add('glutes');
      secondary.add('hamstrings');
      secondary.add('abs');
    }
  }

  if (nameLower.includes('hip thrust') || nameLower.includes('pośladk')) {
    primary.add('glutes');
    secondary.add('hamstrings');
    secondary.add('lower_back');
  }

  if (
    muscleGroup === 'Nogi (Dwugłowe i Łydki)' ||
    nameLower.includes('rumuński') ||
    nameLower.includes('rdl') ||
    nameLower.includes('uginanie nóg') ||
    nameLower.includes('dwugłow') ||
    nameLower.includes('żuraw')
  ) {
    if (nameLower.includes('wspięcia') || nameLower.includes('łydk')) {
      primary.add('calves');
    } else {
      primary.add('hamstrings');
      secondary.add('glutes');
      secondary.add('lower_back');
    }
  }

  if (nameLower.includes('wspięcia') || nameLower.includes('łydk')) {
    primary.add('calves');
  }

  if (nameLower.includes('martwy ciąg klasyczny')) {
    primary.add('lower_back');
    primary.add('hamstrings');
    primary.add('glutes');
    secondary.add('back');
    secondary.add('traps');
  }

  if (
    muscleGroup === 'Brzuch i Core' ||
    nameLower.includes('brzuch') ||
    nameLower.includes('plank') ||
    nameLower.includes('deska') ||
    nameLower.includes('allah') ||
    nameLower.includes('w zwisie') ||
    nameLower.includes('core') ||
    nameLower.includes('pallof') ||
    nameLower.includes('ab wheel')
  ) {
    primary.add('abs');
    secondary.add('lower_back');
  }

  // Dodatkowe mięśnie pomocnicze z opisu muscleLabel
  if (text.includes('triceps')) secondary.add('triceps');
  if (text.includes('biceps')) secondary.add('biceps');
  if (text.includes('bark')) secondary.add('shoulders');
  if (text.includes('pośladk')) secondary.add('glutes');
  if (text.includes('brzuch') || text.includes('core')) secondary.add('abs');

  if (primary.size === 0) {
    primary.add('chest');
    secondary.add('shoulders');
  }

  // Ensure secondary doesn't duplicate primary
  primary.forEach((zone) => secondary.delete(zone));

  return {
    primary: Array.from(primary),
    secondary: Array.from(secondary),
  };
}

/**
 * Dodaje punkty XP oraz serie do wskazanych stref anatomicznych i obsługuje awans na wyższy poziom/rangę
 */
export function addMuscleZoneXp(
  zones: MuscleZoneProgress[],
  primaryZones: MuscleAnatomyZoneId[],
  secondaryZones: MuscleAnatomyZoneId[] = [],
  primaryXpGain = 55,
  setsAdded = 1,
  exerciseName?: string
): {
  updatedZones: MuscleZoneProgress[];
  leveledUpZones: MuscleZoneProgress[];
} {
  const leveledUpZones: MuscleZoneProgress[] = [];
  const primarySet = new Set(primaryZones);
  const secondarySet = new Set(secondaryZones);

  const updatedZones = zones.map((zone) => {
    const isPrimary = primarySet.has(zone.id);
    const isSecondary = !isPrimary && secondarySet.has(zone.id);
    if (!isPrimary && !isSecondary) {
      return zone;
    }

    const xpDelta = isPrimary ? primaryXpGain : Math.round(primaryXpGain * 0.45);
    const setsDelta = isPrimary ? setsAdded : Math.max(0, Math.floor(setsAdded * 0.5));

    let nextXp = zone.xp + xpDelta;
    let nextLevel = zone.level;
    let nextThreshold = zone.xpToNextLevel;
    let didLevelUp = false;

    while (nextXp >= nextThreshold) {
      nextXp -= nextThreshold;
      nextLevel += 1;
      nextThreshold = Math.round(nextThreshold * 1.25);
      didLevelUp = true;
    }

    const updated: MuscleZoneProgress = {
      ...zone,
      level: nextLevel,
      xp: nextXp,
      xpToNextLevel: nextThreshold,
      weeklySets: zone.weeklySets + setsDelta,
      lastTrainedLabel: 'Przed chwilą',
      topExercise: isPrimary && exerciseName ? exerciseName : zone.topExercise,
    };

    if (didLevelUp) {
      leveledUpZones.push(updated);
    }

    return updated;
  });

  return { updatedZones, leveledUpZones };
}

/**
 * Oblicza ogólną rangę sylwetki, symetrię Przód/Tył oraz liczbę przepracowanych partii
 */
export function calculateOverallPhysiqueStatus(zones: MuscleZoneProgress[]): {
  averageLevel: number;
  overallRank: MuscleRankTier;
  overallColor: string;
  trainedZonesCount: number;
  totalWeeklySets: number;
  symmetryScore: number;
} {
  if (zones.length === 0) {
    return {
      averageLevel: 1,
      overallRank: 'Unranked',
      overallColor: '#64748B',
      trainedZonesCount: 0,
      totalWeeklySets: 0,
      symmetryScore: 50,
    };
  }

  const totalLevels = zones.reduce((acc, z) => acc + z.level, 0);
  const avg = totalLevels / zones.length;
  const roundedLevel = Math.max(1, Math.min(6, Math.round(avg)));
  const rankInfo = getMuscleRankInfo(roundedLevel);

  const trainedZonesCount = zones.filter((z) => z.level >= 3 || z.weeklySets >= 6).length;
  const totalWeeklySets = zones.reduce((acc, z) => acc + z.weeklySets, 0);

  const frontZones = zones.filter((z) => z.viewSide === 'front' || z.viewSide === 'both');
  const backZones = zones.filter((z) => z.viewSide === 'back' || z.viewSide === 'both');
  const frontAvg = frontZones.reduce((a, z) => a + z.level, 0) / Math.max(1, frontZones.length);
  const backAvg = backZones.reduce((a, z) => a + z.level, 0) / Math.max(1, backZones.length);
  const diff = Math.abs(frontAvg - backAvg);
  const symmetryScore = Math.max(60, Math.min(100, Math.round(100 - diff * 12)));

  return {
    averageLevel: Number(avg.toFixed(1)),
    overallRank: rankInfo.tier,
    overallColor: rankInfo.color,
    trainedZonesCount,
    totalWeeklySets,
    symmetryScore,
  };
}

/**
 * Tworzy nowy zapisany plan treningowy (SavedWorkoutPlan) bez nadpisywania istniejących planów w bibliotece
 */
export function createSavedWorkoutPlan(
  planName: string,
  planType: WorkoutPlanTemplateType,
  chosen: ExerciseCatalogItem[],
  existingPlansCount = 4
): SavedWorkoutPlan {
  const cleanName = planName.trim() || `Plan ${planType} #${existingPlansCount + 1}`;
  const estMinutes = Math.max(35, chosen.length * 10);

  const exercises: WorkoutExercise[] = chosen.map((c, idx) => {
    const kg = c.defaultKg ?? c.defaultWeight ?? 20;
    const reps = c.defaultReps || 10;
    const setsCount = c.defaultSets || 3;
    const prevKg = kg > 5 ? Number((kg - 2.5).toFixed(1)) : kg;

    return {
      name: c.name,
      muscle: c.muscle,
      muscleGroup: c.muscleGroup,
      prevResult: `${formatDecimalPL(prevKg, prevKg % 1 === 0 ? 0 : 1)} kg × ${reps} (Tydz. temu)`,
      ytUrl: c.ytUrl || c.yt || 'https://www.youtube.com',
      sets: Array.from({ length: setsCount }, (_, sIdx) => ({
        weight: kg,
        reps,
        done: idx === 0 && sIdx === 0,
      })),
      historyLogs: [
        {
          weekLabel: 'Tydzień temu (Bazowy)',
          dateLabel: '17.10',
          setsSummary: `${setsCount} serie: ${formatDecimalPL(prevKg, prevKg % 1 === 0 ? 0 : 1)} kg × ${reps}`,
          topWeightKg: prevKg,
          volumeKg: Math.round(prevKg * reps * setsCount),
        },
      ],
    };
  });

  const baselineExercisesSummary = exercises.slice(0, 4).map((ex) => {
    const log = ex.historyLogs?.[0];
    return {
      exerciseName: ex.name,
      setsSummary: log ? log.setsSummary : ex.prevResult,
      topWeightKg: log ? log.topWeightKg : ex.sets[0]?.weight || 20,
      volumeKg: log ? log.volumeKg : 600,
    };
  });

  const baselineTotalVolume = baselineExercisesSummary.reduce((sum, item) => sum + item.volumeKg, 0);

  return {
    id: `plan-${planType.toLowerCase()}-${Date.now()}-${existingPlansCount + 1}`,
    planName: cleanName,
    planType,
    planTemplate: planType,
    durationEst: `${estMinutes} min`,
    currentExerciseIdx: 0,
    restTimerSeconds: 90,
    restTimerInitial: 90,
    restTimerRunning: false,
    createdAtLabel: 'Dzisiaj',
    lastPerformedLabel: 'Nowy plan (1 sesja bazowa)',
    completedCount: 1,
    exercises,
    sessionHistory: [
      {
        id: `hist-init-${Date.now()}`,
        weekLabel: 'Tydzień temu (Sesja bazowa)',
        dateLabel: 'Sobota, 17.10',
        durationLabel: `${estMinutes} min`,
        totalVolumeKg: baselineTotalVolume,
        setsCompleted: exercises.reduce((acc, e) => acc + e.sets.length, 0),
        exercisesSummary: baselineExercisesSummary,
      },
    ],
  };
}

/**
 * Zapisuje ukończoną sesję treningową do historii danego planu (sessionHistory) oraz aktualizuje
 * poprzednie wyniki (prevResult i historyLogs) każdego ćwiczenia na kolejny tydzień/trening.
 */
export function recordCompletedWorkoutSession(
  plan: SavedWorkoutPlan,
  dateLabel = 'Dzisiaj, 24.10'
): SavedWorkoutPlan {
  const sessionNumber = plan.completedCount + 1;
  const weekLabel = `Sesja #${sessionNumber} (Zapisana)`;

  let totalVolumeKg = 0;
  let setsCompleted = 0;

  const exercisesSummary: WorkoutPlanHistorySession['exercisesSummary'] = [];

  const updatedExercises: WorkoutExercise[] = plan.exercises.map((ex) => {
    const activeSets = ex.sets.some((s) => s.done) ? ex.sets.filter((s) => s.done) : ex.sets;
    const topWeightKg = activeSets.reduce((maxW, s) => Math.max(maxW, Number(s.weight) || 0), 0);
    const topSet =
      activeSets.find((s) => Number(s.weight) === topWeightKg) ||
      activeSets[0] || { weight: 20, reps: 10 };
    const exVolume = Math.round(
      activeSets.reduce((sum, s) => sum + (Number(s.weight) || 0) * (Number(s.reps) || 0), 0)
    );

    totalVolumeKg += exVolume;
    setsCompleted += activeSets.length;

    const formattedTopWeight = formatDecimalPL(
      topWeightKg,
      topWeightKg % 1 === 0 ? 0 : 1
    );
    const repsList = activeSets.map((s) => s.reps).join(', ');
    const setsSummary = `${activeSets.length} serie: ${formattedTopWeight} kg × ${repsList}`;

    exercisesSummary.push({
      exerciseName: ex.name,
      setsSummary,
      topWeightKg,
      volumeKg: exVolume,
    });

    const newLog = {
      weekLabel,
      dateLabel,
      setsSummary,
      topWeightKg,
      volumeKg: exVolume,
    };

    return {
      ...ex,
      prevResult: `${formattedTopWeight} kg × ${topSet.reps} (${dateLabel.split(',')[0]})`,
      historyLogs: [newLog, ...(ex.historyLogs || [])].slice(0, 6),
    };
  });

  const newSessionEntry: WorkoutPlanHistorySession = {
    id: `hist-${plan.id}-${Date.now()}`,
    weekLabel,
    dateLabel,
    durationLabel: plan.durationEst || '50 min',
    totalVolumeKg,
    setsCompleted,
    exercisesSummary,
  };

  return {
    ...plan,
    lastPerformedLabel: dateLabel,
    completedCount: sessionNumber,
    restTimerRunning: false,
    exercises: updatedExercises,
    sessionHistory: [newSessionEntry, ...(plan.sessionHistory || [])],
  };
}

/**
 * Parsuje oficjalny opis wartości odżywczych z FatSecret Platform REST API (food_description),
 * np. "Per 100g - Calories: 165kcal | Fat: 3.60g | Carbs: 0.00g | Protein: 31.00g"
 * lub "Per 1 serving (150g) - Calories: 96kcal | Fat: 0.30g | Carbs: 6.10g | Protein: 18.00g"
 */
export function parseFatSecretFoodDescription(rawDescription: string): {
  servingLabel: string;
  servingGrams: number;
  kcalPerServing: number;
  pPerServing: number;
  fPerServing: number;
  cPerServing: number;
  kcal100: number;
  p100: number;
  f100: number;
  c100: number;
} {
  const clean = (rawDescription || '').trim();
  const perMatch = clean.match(/^Per\s+([^-]+)-/i);
  const servingLabel = perMatch ? perMatch[1].trim() : '100 g';

  let servingGrams = 100;
  const gramsInParens = servingLabel.match(/\((\d+(?:[.,]\d+)?)\s*(?:g|ml)\)/i);
  const directGrams = servingLabel.match(/^(\d+(?:[.,]\d+)?)\s*(?:g|ml)$/i);
  if (gramsInParens) {
    servingGrams = Math.max(1, parseFloat(gramsInParens[1].replace(',', '.')));
  } else if (directGrams) {
    servingGrams = Math.max(1, parseFloat(directGrams[1].replace(',', '.')));
  } else if (/oz/i.test(servingLabel)) {
    const ozMatch = servingLabel.match(/(\d+(?:[.,]\d+)?)\s*oz/i);
    if (ozMatch) {
      servingGrams = Math.max(1, Math.round(parseFloat(ozMatch[1].replace(',', '.')) * 28.35));
    }
  }

  const extractVal = (pattern: RegExp): number => {
    const m = clean.match(pattern);
    if (!m) return 0;
    const val = parseFloat(m[1].replace(',', '.'));
    return Number.isNaN(val) ? 0 : val;
  };

  const kcalPerServing = extractVal(/Calories:\s*(\d+(?:[.,]\d+)?)\s*kcal/i);
  const fPerServing = extractVal(/Fat:\s*(\d+(?:[.,]\d+)?)\s*g/i);
  const cPerServing = extractVal(/Carbs:\s*(\d+(?:[.,]\d+)?)\s*g/i);
  const pPerServing = extractVal(/Protein:\s*(\d+(?:[.,]\d+)?)\s*g/i);

  const scaleTo100 = 100 / Math.max(1, servingGrams);
  return {
    servingLabel,
    servingGrams: Math.round(servingGrams),
    kcalPerServing: Math.round(kcalPerServing),
    pPerServing: Number(pPerServing.toFixed(1)),
    fPerServing: Number(fPerServing.toFixed(1)),
    cPerServing: Number(cPerServing.toFixed(1)),
    kcal100: Math.round(kcalPerServing * scaleTo100),
    p100: Number((pPerServing * scaleTo100).toFixed(1)),
    f100: Number((fPerServing * scaleTo100).toFixed(1)),
    c100: Number((cPerServing * scaleTo100).toFixed(1)),
  };
}

/**
 * Oblicza dokładne makroskładniki, kalorie i procentowy rozkład energii dla wybranej porcji z FatSecret API
 */
export function calculateFatSecretServingMacros(
  food: Pick<FatSecretFoodItem, 'kcal100' | 'p100' | 'f100' | 'c100' | 'fiber100'>,
  grams: number
): {
  grams: number;
  kcal: number;
  p: number;
  f: number;
  c: number;
  fiber: number;
  macroSplitPct: { proteinPct: number; fatPct: number; carbsPct: number };
} {
  const safeGrams = Math.max(1, Math.min(3000, Math.round(Number(grams) || 100)));
  const ratio = safeGrams / 100;
  const kcal = Math.round(food.kcal100 * ratio);
  const p = Math.round(food.p100 * ratio);
  const f = Math.round(food.f100 * ratio);
  const c = Math.round(food.c100 * ratio);
  const fiber = Number(((food.fiber100 || 0) * ratio).toFixed(1));

  const pKcal = p * 4;
  const fKcal = f * 9;
  const cKcal = c * 4;
  const totalMacroKcal = Math.max(1, pKcal + fKcal + cKcal);

  const proteinPct = Math.round((pKcal / totalMacroKcal) * 100);
  const fatPct = Math.round((fKcal / totalMacroKcal) * 100);
  const carbsPct = Math.max(0, 100 - proteinPct - fatPct);

  return {
    grams: safeGrams,
    kcal,
    p,
    f,
    c,
    fiber,
    macroSplitPct: { proteinPct, fatPct, carbsPct },
  };
}

/**
 * Konwertuje obiekt aktywności z oficjalnego Strava API v3 (/api/v3/athlete/activities)
 * na ustrukturyzowany obiekt StravaActivityItem w ekosystemie SportMate
 */
export function normalizeStravaActivityToSportMate(raw: {
  id?: number | string;
  name?: string;
  type?: string;
  sport_type?: string;
  distance?: number;
  moving_time?: number;
  total_elevation_gain?: number;
  start_date_local?: string;
  average_heartrate?: number;
  max_heartrate?: number;
  average_watts?: number;
  kilojoules?: number;
  calories?: number;
  kudos_count?: number;
  pr_count?: number;
  location_city?: string;
  segmentId?: string;
}): StravaActivityItem {
  const stravaId = Number(raw.id) || Math.floor(1000000000 + Math.random() * 900000000);
  const rawType = (raw.sport_type || raw.type || 'Run').toString();
  const isRide = /ride|cycling|virtualride|gravel/i.test(rawType);
  const isWeights = /weight|workout|crossfit|strength/i.test(rawType);
  const type: 'Run' | 'Ride' | 'WeightTraining' = isRide
    ? 'Ride'
    : isWeights
    ? 'WeightTraining'
    : 'Run';

  const sportLabel =
    type === 'Ride'
      ? 'Kolarstwo · Strava GPS'
      : type === 'WeightTraining'
      ? 'Siłownia · Strava Sync'
      : 'Bieganie · Strava GPS';

  const distanceMeters = Math.max(0, Number(raw.distance) || 0);
  const distanceKm = Number((distanceMeters / 1000).toFixed(2));
  const movingTimeSec = Math.max(60, Math.round(Number(raw.moving_time) || 2400));

  const hours = Math.floor(movingTimeSec / 3600);
  const mins = Math.floor((movingTimeSec % 3600) / 60);
  const secs = movingTimeSec % 60;
  const movingTimeFormatted =
    hours > 0
      ? `${hours}h ${String(mins).padStart(2, '0')}m`
      : `${mins}:${String(secs).padStart(2, '0')} min`;

  let paceOrSpeed = '';
  if (type === 'Run' && distanceKm > 0.1) {
    const secPerKm = movingTimeSec / distanceKm;
    paceOrSpeed = `${formatTimerMMSS(secPerKm)} /km`;
  } else if (type === 'Ride' && distanceKm > 0.1) {
    const kmh = distanceKm / (movingTimeSec / 3600);
    paceOrSpeed = `${formatDecimalPL(kmh, 1)} km/h`;
  } else {
    paceOrSpeed = `${Math.round(movingTimeSec / 60)} min sesji`;
  }

  const elevationGainM = Math.round(Number(raw.total_elevation_gain) || 0);
  const avgHr = Math.round(Number(raw.average_heartrate) || 152);
  const maxHr = Math.round(Number(raw.max_heartrate) || avgHr + 21);
  const wattsAvg = raw.average_watts ? Math.round(Number(raw.average_watts)) : undefined;
  const calories = raw.calories
    ? Math.round(Number(raw.calories))
    : raw.kilojoules
    ? Math.round(Number(raw.kilojoules) * 1.05)
    : Math.round((movingTimeSec / 60) * 10.5);

  let startDateLabel = 'Dzisiaj · Synchronizacja Live';
  if (raw.start_date_local) {
    try {
      const d = new Date(raw.start_date_local);
      if (!Number.isNaN(d.getTime())) {
        startDateLabel = d.toLocaleDateString('pl-PL', {
          weekday: 'short',
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        });
      }
    } catch {
      startDateLabel = raw.start_date_local;
    }
  }

  return {
    id: `strava-${stravaId}`,
    stravaId,
    name: raw.name || (type === 'Ride' ? 'Pętla szosowa Łódź' : 'Trening biegowy Łódź'),
    type,
    sportLabel,
    startDateLabel,
    distanceKm,
    movingTimeFormatted,
    movingTimeSec,
    paceOrSpeed,
    elevationGainM,
    avgHr,
    maxHr,
    wattsAvg,
    calories,
    kudosCount: Number(raw.kudos_count) ?? 14,
    prCount: Number(raw.pr_count) ?? 2,
    segmentId: raw.segmentId,
    location: raw.location_city || 'Łódź, Polska',
  };
}

/**
 * Przełącza rezerwację terminu (slotu godzinowego) na korcie, sali lub torze wybranego obiektu sportowego
 */
export function toggleVenueSlotReservation(
  bookedSlotIds: string[],
  slotId: string
): {
  nextBookedSlotIds: string[];
  action: 'booked' | 'cancelled';
} {
  const exists = bookedSlotIds.includes(slotId);
  if (exists) {
    return {
      nextBookedSlotIds: bookedSlotIds.filter((id) => id !== slotId),
      action: 'cancelled',
    };
  }
  return {
    nextBookedSlotIds: [...bookedSlotIds, slotId],
    action: 'booked',
  };
}

/**
 * Generuje szczegółowy status obiektu sportowego w Łodzi:
 * - czy jest teraz otwarty i w jakich godzinach (dni robocze / weekendy),
 * - dostępność konkretnych kortów, sal treningowych, torów pływackich i stref (wolny / zajęty / rezerwacja slotów),
 * - wydarzenia społecznościowe odbywające się na tym obiekcie.
 */
export function getVenueLiveDetails(
  venue: LodzVenue,
  allEvents: SportEvent[],
  bookedSlotIds: string[] = []
): VenueLiveDetails {
  const nameLower = venue.name.toLowerCase();
  const subLower = venue.sub.toLowerCase();
  const cat = venue.category || 'Siłownia';

  // 1. Godziny otwarcia i status otwarcia
  let isOpenNow = true;
  let openStatusLabel = 'Otwarte teraz · do 22:30';
  let hoursWeekday = venue.hoursWeekday || 'Pon–Pt: 06:00 – 22:30';
  let hoursWeekend = venue.hoursWeekend || 'Sob–Ndz: 07:30 – 21:00';
  let passesAccepted: string[] = ['MultiSport Plus', 'Medicover Sport', 'FitProfit', 'Wejście jednorazowe'];

  if (
    venue.isOpen24h ||
    nameLower.includes('mcfit') ||
    cat === 'Street Workout' ||
    nameLower.includes('las łagiewnicki') ||
    nameLower.includes('lublinek')
  ) {
    hoursWeekday = 'Pon–Pt: 00:00 – 24:00 (Całodobowo 24/7)';
    hoursWeekend = 'Sob–Ndz: 00:00 – 24:00 (Całodobowo 24/7)';
    openStatusLabel = 'Otwarte 24/7 (Całodobowo)';
    passesAccepted = nameLower.includes('mcfit')
      ? ['Karnet McFIT 24/7', 'MultiSport Plus', 'Wejście dzienne']
      : ['Wstęp bezpłatny 24/7 (Strefa miejska)'];
  } else if (nameLower.includes('zatoka sportu')) {
    hoursWeekday = 'Pon–Pt: 06:00 – 22:00';
    hoursWeekend = 'Sob–Ndz: 07:00 – 21:00';
    openStatusLabel = 'Otwarte teraz · do 22:00';
    passesAccepted = ['MultiSport Plus', 'Medicover Sport', 'Zniżka Studencka PŁ', 'Bilet jednorazowy'];
  } else if (nameLower.includes('fitfabric')) {
    hoursWeekday = 'Pon–Pt: 06:00 – 23:00';
    hoursWeekend = 'Sob–Ndz: 08:00 – 20:00';
    openStatusLabel = 'Otwarte teraz · do 23:00';
    passesAccepted = ['MultiSport Plus', 'FitProfit', 'Medicover Sport', 'Karnet FitFabric'];
  } else if (
    nameLower.includes('verasport') ||
    nameLower.includes('nowa gdynia') ||
    nameLower.includes('fiord') ||
    nameLower.includes('manufaktura') ||
    nameLower.includes('wodny raj') ||
    nameLower.includes('fala')
  ) {
    hoursWeekday = 'Pon–Pt: 06:30 – 22:30';
    hoursWeekend = 'Sob–Ndz: 08:00 – 21:30';
    openStatusLabel = 'Otwarte teraz · do 22:30';
    passesAccepted = ['MultiSport Plus', 'Medicover Sport', 'Prowadzimy rezerwacje kortów i sal'];
  } else if (cat === 'Trasa biegowa' || cat === 'Kolarstwo i Trail') {
    if (subLower.includes('kort') || subLower.includes('bieżnia') || subLower.includes('hala')) {
      hoursWeekday = 'Pon–Pt: 06:30 – 22:00 (Park 24/7)';
      hoursWeekend = 'Sob–Ndz: 07:30 – 21:00 (Park 24/7)';
      openStatusLabel = 'Otwarte teraz · Korty i hala do 22:00';
      passesAccepted = ['Rezerwacja kortu / bieżni', 'MultiSport', 'Alejki parkowe bezpłatne 24/7'];
    } else {
      hoursWeekday = 'Pon–Pt: 05:00 – 23:30 (Oświetlone alejki)';
      hoursWeekend = 'Sob–Ndz: 05:00 – 23:30 (Oświetlone alejki)';
      openStatusLabel = 'Otwarte teraz · Oświetlenie do 23:30';
      passesAccepted = ['Wstęp bezpłatny (Teren rekreacyjny Miasta Łodzi)'];
    }
  }

  // 2. Obłożenie na żywo
  const activeCount = venue.activeUsersCount || 18;
  const occupancyPct = Math.min(88, Math.max(22, Math.round(activeCount * 1.85)));
  const occupancyLabel =
    occupancyPct < 45
      ? `Niskie obłożenie (${occupancyPct}%) — dużo wolnego miejsca`
      : occupancyPct < 70
      ? `Umiarkowany ruch (${occupancyPct}%) — wolne stanowiska i korty`
      : `Wysoka aktywność (${occupancyPct}%) — ostatnie wolne terminy`;

  // 3. Korty, sale, tory i strefy z terminami rezerwacji
  type RawUnitTemplate = {
    suffix: string;
    name: string;
    unitType: 'court' | 'hall' | 'lane' | 'zone';
    baseStatus: 'free' | 'moderate' | 'busy';
    baseStatusLabel: string;
    capacityLabel: string;
    slotAvailability: [boolean, boolean, boolean, boolean];
  };

  let templates: RawUnitTemplate[] = [];

  if (nameLower.includes('zatoka sportu')) {
    templates = [
      {
        suffix: 'u1',
        name: 'Basen Olimpijski 50m — Tory Sportowe #3 i #4',
        unitType: 'lane',
        baseStatus: 'free',
        baseStatusLabel: 'Wolny teraz (3 z 8 miejsc na torze)',
        capacityLabel: 'Tor szybki · 50 m',
        slotAvailability: [true, true, false, true],
      },
      {
        suffix: 'u2',
        name: 'Sala Wolnych Ciężarów i Pomosty Akademickie',
        unitType: 'hall',
        baseStatus: 'free',
        baseStatusLabel: 'Wolna (4 z 6 pomostów dostępne)',
        capacityLabel: 'Strefa siłowa · 28 stanowisk',
        slotAvailability: [true, true, true, true],
      },
      {
        suffix: 'u3',
        name: 'Ścianka Wspinaczkowa & Korty Badminton (Hala Główna)',
        unitType: 'court',
        baseStatus: 'moderate',
        baseStatusLabel: 'Wolne 2 korty i 6 dróg z liną',
        capacityLabel: 'Hala wielofunkcyjna',
        slotAvailability: [false, true, true, true],
      },
    ];
  } else if (
    nameLower.includes('verasport') ||
    nameLower.includes('nowa gdynia') ||
    nameLower.includes('fiord')
  ) {
    templates = [
      {
        suffix: 'u1',
        name: 'Kort Badminton / Squash #1 (Nawierzchnia Pro)',
        unitType: 'court',
        baseStatus: 'free',
        baseStatusLabel: 'Wolny teraz — gotowy do gry',
        capacityLabel: '2–4 graczy · Klimatyzacja',
        slotAvailability: [true, true, false, true],
      },
      {
        suffix: 'u2',
        name: 'Kort Squash #2 (Szklana Klatka Turniejowa)',
        unitType: 'court',
        baseStatus: 'busy',
        baseStatusLabel: 'Zajęty do 18:30 (Wolny od 18:30)',
        capacityLabel: '2 graczy · Sprzęt w recepcji',
        slotAvailability: [false, true, true, true],
      },
      {
        suffix: 'u3',
        name: 'Sala Treningu Funkcjonalnego & Siłownia',
        unitType: 'hall',
        baseStatus: 'free',
        baseStatusLabel: 'Wolna — luźno na strefie ciężarów',
        capacityLabel: 'Wolne 14 z 20 stanowisk',
        slotAvailability: [true, true, true, true],
      },
    ];
  } else if (
    subLower.includes('kort') ||
    nameLower.includes('poniatowskiego') ||
    nameLower.includes('3 maja') ||
    nameLower.includes('wodny raj')
  ) {
    templates = [
      {
        suffix: 'u1',
        name: 'Kort Tenisowy #1 — Ceglany (Oświetlony / Balon)',
        unitType: 'court',
        baseStatus: 'free',
        baseStatusLabel: 'Wolny teraz — dostępna rezerwacja',
        capacityLabel: 'Singiel / Debel (2–4 os.)',
        slotAvailability: [true, true, false, true],
      },
      {
        suffix: 'u2',
        name: 'Kort Tenisowy #2 — Nawierzchnia Hard / Kryty',
        unitType: 'court',
        baseStatus: 'moderate',
        baseStatusLabel: 'Zajęty do 18:30 · Wolne wieczorem',
        capacityLabel: 'Singiel / Debel (2–4 os.)',
        slotAvailability: [false, true, true, true],
      },
      {
        suffix: 'u3',
        name: 'Pętla Biegowa & Strefa Rozgrzewki Plenerowej',
        unitType: 'zone',
        baseStatus: 'free',
        baseStatusLabel: 'Wolna — oświetlone alejki',
        capacityLabel: 'Bez limitu miejsc',
        slotAvailability: [true, true, true, true],
      },
    ];
  } else if (cat === 'Siłownia') {
    templates = [
      {
        suffix: 'u1',
        name: 'Strefa Wolnych Ciężarów, Ławki i Pomosty Olimpijskie',
        unitType: 'hall',
        baseStatus: 'free',
        baseStatusLabel: 'Wolne 5 z 7 pomostów i ławek',
        capacityLabel: 'Strefa ciężka · Brak kolejek',
        slotAvailability: [true, true, true, true],
      },
      {
        suffix: 'u2',
        name: 'Sala CrossFit, Kettlebell & Klatka Funkcjonalna',
        unitType: 'hall',
        baseStatus: 'free',
        baseStatusLabel: 'Wolna (poza godzinami zajęć grupowych)',
        capacityLabel: 'Max 16 osób · Ergometry wolne',
        slotAvailability: [true, false, true, true],
      },
      {
        suffix: 'u3',
        name: 'Sala Fitness & Stretching / Strefa Kardio',
        unitType: 'zone',
        baseStatus: 'moderate',
        baseStatusLabel: 'Dostępna — 18 wolnych bieżni i schodów',
        capacityLabel: 'Klimatyzowana strefa kardio',
        slotAvailability: [true, true, true, true],
      },
    ];
  } else if (cat === 'Basen i Wielofunkcyjny') {
    templates = [
      {
        suffix: 'u1',
        name: 'Basen Sportowy — Tor Pływacki Szybki #1–#2',
        unitType: 'lane',
        baseStatus: 'free',
        baseStatusLabel: 'Wolny teraz (tylko 2 osoby na torze)',
        capacityLabel: 'Pływanie ciągłe · Kraul',
        slotAvailability: [true, true, false, true],
      },
      {
        suffix: 'u2',
        name: 'Boisko / Sala Wielofunkcyjna & Wspinaczka',
        unitType: 'court',
        baseStatus: 'free',
        baseStatusLabel: 'Wolne — gotowe do rezerwacji',
        capacityLabel: 'Rezerwacja na 60 / 90 min',
        slotAvailability: [true, false, true, true],
      },
      {
        suffix: 'u3',
        name: 'Strefa Regeneracji, Sauny Fińskie i Mobilność',
        unitType: 'zone',
        baseStatus: 'moderate',
        baseStatusLabel: 'Otwarta — niski ruch',
        capacityLabel: 'Do 20 osób jednocześnie',
        slotAvailability: [true, true, true, true],
      },
    ];
  } else if (cat === 'Street Workout') {
    templates = [
      {
        suffix: 'u1',
        name: 'Klatka Główna — Drążki Wysokie i Kółka Gimnastyczne',
        unitType: 'zone',
        baseStatus: 'free',
        baseStatusLabel: 'Wolna teraz — 4 drążki dostępne',
        capacityLabel: 'Strefa kalisteniki · Nawierzchnia bezpieczna',
        slotAvailability: [true, true, true, true],
      },
      {
        suffix: 'u2',
        name: 'Poręcze Równoległe (Dipy) i Ławki Skośne',
        unitType: 'zone',
        baseStatus: 'free',
        baseStatusLabel: 'Wolne — brak kolejki',
        capacityLabel: '3 stanowiska równoległe',
        slotAvailability: [true, true, true, true],
      },
    ];
  } else {
    templates = [
      {
        suffix: 'u1',
        name: 'Główna Pętla Treningowa & Punkt Zbiórki GPS',
        unitType: 'zone',
        baseStatus: 'free',
        baseStatusLabel: 'Wolna — idealne warunki nawierzchni',
        capacityLabel: 'Pomiar segmentu Strava Live',
        slotAvailability: [true, true, true, true],
      },
      {
        suffix: 'u2',
        name: 'Bieżnia / Sektor Interwałowy i Strefa Rozgrzewki',
        unitType: 'lane',
        baseStatus: 'free',
        baseStatusLabel: 'Wolne tory zewnętrzne i wewnętrzne',
        capacityLabel: 'Dostępne oświetlenie wieczorne',
        slotAvailability: [true, true, false, true],
      },
    ];
  }

  const slotTimes = ['17:00', '18:30', '20:00', '21:00'];

  const facilities: VenueFacilityUnit[] = templates.map((tpl) => {
    const unitId = `${venue.id}_${tpl.suffix}`;
    const slots = slotTimes.map((timeStr, idx) => {
      const slotId = `${unitId}_${timeStr}`;
      const reservedByUser = bookedSlotIds.includes(slotId);
      const available = reservedByUser ? true : tpl.slotAvailability[idx] ?? true;
      return {
        id: slotId,
        time: timeStr,
        available,
        reservedByUser,
      };
    });

    const userReservedSlot = slots.find((s) => s.reservedByUser);
    const status: VenueFacilityUnit['status'] = userReservedSlot
      ? 'reserved_by_user'
      : tpl.baseStatus;
    const statusLabel = userReservedSlot
      ? `Zarezerwowano przez Ciebie (${userReservedSlot.time})`
      : tpl.baseStatusLabel;

    return {
      id: unitId,
      name: tpl.name,
      unitType: tpl.unitType,
      status,
      statusLabel,
      capacityLabel: tpl.capacityLabel,
      slots,
    };
  });

  const freeUnitsCount = facilities.filter(
    (f) => f.status === 'free' || f.status === 'reserved_by_user' || f.status === 'moderate'
  ).length;

  // 4. Wydarzenia przypisane do tego obiektu (po venueId lub nazwie / lokalizacji)
  const coreKeyword = venue.name
    .split('—')[0]
    .split('(')[0]
    .replace(/Park im\.|Kompleks|Centrum|Pływalnia/gi, '')
    .trim()
    .toLowerCase();

  const matchedEvents = allEvents.filter((ev) => {
    if (ev.venueId && ev.venueId === venue.id) return true;
    const locLower = ev.location.toLowerCase();
    const titleLower = ev.title.toLowerCase();
    if (coreKeyword.length >= 4 && (locLower.includes(coreKeyword) || titleLower.includes(coreKeyword))) {
      return true;
    }
    return false;
  });

  return {
    venueId: venue.id,
    isOpenNow,
    openStatusLabel,
    hoursWeekday,
    hoursWeekend,
    occupancyPct,
    occupancyLabel,
    passesAccepted,
    freeUnitsCount,
    totalUnitsCount: facilities.length,
    facilities,
    events: matchedEvents,
  };
}

/**
 * Oblicza wymagane EXP na dany poziom użytkownika (progresywna krzywa trudności: każdy poziom wymaga więcej EXP)
 */
export function getExpTargetForLevel(level: number): number {
  const safeLevel = Math.max(1, Math.floor(level));
  // Poziom 1 -> 500 EXP, każdy kolejny rośnie nieliniowo (np. Poz. 5 -> 1140, Poz. 10 -> 2150, Poz. 14 -> 3120)
  return Math.round((500 + (safeLevel - 1) * 140 + Math.pow(safeLevel - 1, 1.45) * 28) / 10) * 10;
}

/**
 * Dodaje EXP użytkownikowi z uwzględnieniem progresywnego progu na każdy kolejny poziom
 */
export function applyUserExpGain(
  currentLevel: number,
  currentExp: number,
  expAdded: number
): {
  level: number;
  exp: number;
  expTarget: number;
  leveledUp: boolean;
} {
  let nextLevel = Math.max(1, Math.floor(currentLevel));
  let nextExp = Math.max(0, Math.floor(currentExp)) + Math.max(0, Math.floor(expAdded));
  let target = getExpTargetForLevel(nextLevel);
  let leveledUp = false;

  while (nextExp >= target) {
    nextExp -= target;
    nextLevel += 1;
    target = getExpTargetForLevel(nextLevel);
    leveledUp = true;
  }

  return {
    level: nextLevel,
    exp: nextExp,
    expTarget: target,
    leveledUp,
  };
}

/**
 * Zwraca rangę profilu użytkownika (Bronze, Silver, Gold, Platinum, Diamond, Master) na podstawie poziomu
 */
export function getUserRankInfo(level: number): {
  tier: UserRankTier;
  labelPl: string;
  color: string;
  bgColor: string;
  bgTint: string;
  borderColor: string;
  minLevel: number;
  maxLevel: number;
  nextRankLabel: string;
} {
  if (level <= 5) {
    return {
      tier: 'Bronze',
      labelPl: 'Bronze',
      color: '#CD7F32',
      bgColor: 'rgba(205, 127, 50, 0.16)',
      bgTint: 'rgba(205, 127, 50, 0.16)',
      borderColor: 'rgba(205, 127, 50, 0.45)',
      minLevel: 1,
      maxLevel: 5,
      nextRankLabel: 'Silver (od Poz. 6)',
    };
  }
  if (level <= 10) {
    return {
      tier: 'Silver',
      labelPl: 'Silver',
      color: '#CBD5E1',
      bgColor: 'rgba(148, 163, 184, 0.18)',
      bgTint: 'rgba(148, 163, 184, 0.18)',
      borderColor: 'rgba(203, 213, 225, 0.45)',
      minLevel: 6,
      maxLevel: 10,
      nextRankLabel: 'Gold (od Poz. 11)',
    };
  }
  if (level <= 15) {
    return {
      tier: 'Gold',
      labelPl: 'Gold',
      color: '#F59E0B',
      bgColor: 'rgba(245, 158, 11, 0.18)',
      bgTint: 'rgba(245, 158, 11, 0.18)',
      borderColor: 'rgba(245, 158, 11, 0.5)',
      minLevel: 11,
      maxLevel: 15,
      nextRankLabel: 'Platinum (od Poz. 16)',
    };
  }
  if (level <= 20) {
    return {
      tier: 'Platinum',
      labelPl: 'Platinum',
      color: '#38BDF8',
      bgColor: 'rgba(56, 189, 248, 0.18)',
      bgTint: 'rgba(56, 189, 248, 0.18)',
      borderColor: 'rgba(56, 189, 248, 0.5)',
      minLevel: 16,
      maxLevel: 20,
      nextRankLabel: 'Diamond (od Poz. 21)',
    };
  }
  if (level <= 25) {
    return {
      tier: 'Diamond',
      labelPl: 'Diamond',
      color: '#A855F7',
      bgColor: 'rgba(168, 85, 247, 0.18)',
      bgTint: 'rgba(168, 85, 247, 0.18)',
      borderColor: 'rgba(168, 85, 247, 0.5)',
      minLevel: 21,
      maxLevel: 25,
      nextRankLabel: 'Master (od Poz. 26)',
    };
  }
  return {
    tier: 'Master',
    labelPl: 'Master',
    color: '#FF6B35',
    bgColor: 'rgba(255, 107, 53, 0.2)',
    bgTint: 'rgba(255, 107, 53, 0.2)',
    borderColor: 'rgba(255, 107, 53, 0.55)',
    minLevel: 26,
    maxLevel: 99,
    nextRankLabel: 'Maksymalna Ranga',
  };
}

/**
 * Generuje dane wykresu w Profilu dla wybranego okresu czasu (7d, 14d, 30d, 90d)
 */
export function getChartDataForPeriod(
  baseDays: WeeklyComparisonDay[],
  period: ChartPeriodKey,
  liveTodayVolumeKg?: number
): WeeklyComparisonDay[] {
  const days7 = baseDays.map((item, idx) => {
    if (idx === 5 && typeof liveTodayVolumeKg === 'number' && liveTodayVolumeKg > 0) {
      return { ...item, currentVolumeKg: liveTodayVolumeKg };
    }
    return item;
  });

  if (period === '7d') {
    return days7;
  }

  if (period === '14d') {
    const prevWeek: WeeklyComparisonDay[] = days7.map((d) => ({
      dayShort: `${d.dayShort}-1`,
      dayFull: `${d.dayFull} (Ub. tydz.)`,
      currentVolumeKg: d.prevVolumeKg,
      prevVolumeKg: Math.max(0, Math.round(d.prevVolumeKg * 0.88)),
      currentKcalBurned: d.prevKcalBurned,
      prevKcalBurned: Math.round(d.prevKcalBurned * 0.9),
      sessionFocus: d.sessionFocus,
    }));
    const currWeek: WeeklyComparisonDay[] = days7.map((d) => ({
      ...d,
      dayShort: `${d.dayShort}-2`,
    }));
    return [...prevWeek, ...currWeek];
  }

  if (period === '30d') {
    return [
      {
        dayShort: 'Tydz. 1',
        dayFull: '1–7 października',
        currentVolumeKg: 14800,
        prevVolumeKg: 13200,
        currentKcalBurned: 3650,
        prevKcalBurned: 3290,
        sessionFocus: 'Mezocykl budowania bazy siłowej',
      },
      {
        dayShort: 'Tydz. 2',
        dayFull: '8–14 października',
        currentVolumeKg: 16450,
        prevVolumeKg: 14800,
        currentKcalBurned: 3980,
        prevKcalBurned: 3650,
        sessionFocus: 'Progresja ciężaru roboczego (+2.5 kg)',
      },
      {
        dayShort: 'Tydz. 3',
        dayFull: '15–21 października',
        currentVolumeKg: 17370,
        prevVolumeKg: 16450,
        currentKcalBurned: 4120,
        prevKcalBurned: 3980,
        sessionFocus: 'Tydzień szczytowej objętości (FBW + Góra)',
      },
      {
        dayShort: 'Tydz. 4',
        dayFull: '22–28 października (Bieżący)',
        currentVolumeKg: days7.reduce((s, d) => s + d.currentVolumeKg, 0),
        prevVolumeKg: 17370,
        currentKcalBurned: days7.reduce((s, d) => s + d.currentKcalBurned, 0),
        prevKcalBurned: 4120,
        sessionFocus: 'Bieżący tydzień treningowy',
      },
    ];
  }

  // 90d (3 miesiące / 6 bloków dwutygodniowych)
  return [
    {
      dayShort: 'Sie I',
      dayFull: '1–15 sierpnia',
      currentVolumeKg: 26400,
      prevVolumeKg: 23800,
      currentKcalBurned: 6850,
      prevKcalBurned: 6200,
      sessionFocus: 'Adaptacja anatomiczna (Sierpień I)',
    },
    {
      dayShort: 'Sie II',
      dayFull: '16–31 sierpnia',
      currentVolumeKg: 28900,
      prevVolumeKg: 26400,
      currentKcalBurned: 7340,
      prevKcalBurned: 6850,
      sessionFocus: 'Rozbudowa bazy tlenowej i siły (Sierpień II)',
    },
    {
      dayShort: 'Wrz I',
      dayFull: '1–15 września',
      currentVolumeKg: 31200,
      prevVolumeKg: 28900,
      currentKcalBurned: 7820,
      prevKcalBurned: 7340,
      sessionFocus: 'Mezocykl hipertrofii (Wrzesień I)',
    },
    {
      dayShort: 'Wrz II',
      dayFull: '16–30 września',
      currentVolumeKg: 33600,
      prevVolumeKg: 31200,
      currentKcalBurned: 8290,
      prevKcalBurned: 7820,
      sessionFocus: 'Progresja wielostawów (Wrzesień II)',
    },
    {
      dayShort: 'Paź I',
      dayFull: '1–15 października',
      currentVolumeKg: 35400,
      prevVolumeKg: 33600,
      currentKcalBurned: 8640,
      prevKcalBurned: 8290,
      sessionFocus: 'Blok siły maksymalnej (Październik I)',
    },
    {
      dayShort: 'Paź II',
      dayFull: '16–30 października',
      currentVolumeKg: 37850,
      prevVolumeKg: 35400,
      currentKcalBurned: 9120,
      prevKcalBurned: 8640,
      sessionFocus: 'Bieżący blok szczytowy (Październik II)',
    },
  ];
}

/**
 * Moderacja czatu: wykrywa numery telefonów, adresy e-mail, wulgaryzmy oraz próby
 * przeniesienia kontaktu poza aplikację i zastępuje wiadomość pięcioma gwiazdkami (*****).
 */
export function censorChatMessage(rawText: string): {
  text: string;
  censored: boolean;
} {
  const trimmed = (rawText || '').trim();
  if (!trimmed) {
    return { text: '', censored: false };
  }

  const lower = trimmed.toLowerCase();

  // 1. Adres e-mail lub domena pocztowa
  const emailRegex = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;
  const emailKeywords = /\b(gmail\.com|wp\.pl|onet\.pl|interia\.pl|o2\.pl|icloud\.com|outlook\.com|e-mail|email)\b/i;

  // 2. Numer telefonu (np. +48 500 600 700, 500-600-700, 500600700, 9 cyfr lub ciąg 7+ cyfr)
  const digitsOnly = trimmed.replace(/\D/g, '');
  const phonePattern =
    /(?:\+?48[\s-]?)?(?:\d{3}[\s-]?){2}\d{3}|\b\d{7,12}\b/;
  const hasPhoneNumber = phonePattern.test(trimmed) || digitsOnly.length >= 7;

  // 3. Wulgaryzmy (PL / EN)
  const profanityRegex =
    /(kurw|chuj|huj|pierdol|pierdoli|jeba[ćc]|jebn|pojeban|zajebi|pizd|skurw|spierdal|wypierdal|odpierdol|gówn|gown|dup[ayę]|cholera|fuck|shit|bitch|cunt|asshole)/i;

  // 4. Próba kontaktu poza aplikacją
  const offPlatformRegex =
    /(poza\s*aplikacj|poza\s*apk|poza\s*sportmate|whatsapp|whats\s*app|messeng|instagram|insta\b|telegram|snapchat|discord|napisz\s+na\s+(fb|ig|priv|pw|mail)|odezwij\s+si[ęe]\s+na|zadzwo[ńn]|przedzwo[ńn]|daj\s+numer|podaj\s+numer|m[óo]j\s+numer|numer\s+tel|kontakt\s+poza)/i;

  if (
    emailRegex.test(trimmed) ||
    emailKeywords.test(lower) ||
    hasPhoneNumber ||
    profanityRegex.test(lower) ||
    offPlatformRegex.test(lower)
  ) {
    return {
      text: '*****',
      censored: true,
    };
  }

  return {
    text: trimmed,
    censored: false,
  };
}

/**
 * Sugeruje zdrowe produkty z bazy FatSecret dopasowane do brakujących makroskładników
 * (białka, węglowodanów, zdrowych tłuszczów) oraz pozostałych kalorii w dziennym bilansie.
 */
export function getSmartFatSecretMacroSuggestions(
  nutrition: Pick<
    NutritionState,
    'kcalGoal' | 'proteinGoal' | 'fatGoal' | 'carbsGoal' | 'meals'
  >,
  catalog: FatSecretFoodItem[],
  focus: MacroSuggestionFocus = 'auto',
  limit = 4
): {
  deficit: MacroDeficitSummary;
  suggestions: FatSecretMacroSuggestion[];
  recommendedSearchQuery: string;
} {
  const totals = getNutritionTotals(nutrition.meals || []);

  const missingKcal = Math.max(0, Math.round(nutrition.kcalGoal - totals.kcal));
  const missingProtein = Math.max(0, Math.round(nutrition.proteinGoal - totals.p));
  const missingCarbs = Math.max(0, Math.round(nutrition.carbsGoal - totals.c));
  const missingFat = Math.max(0, Math.round(nutrition.fatGoal - totals.f));

  const proteinDeficitPct =
    nutrition.proteinGoal > 0
      ? Math.min(100, Math.round((missingProtein / nutrition.proteinGoal) * 100))
      : 0;
  const carbsDeficitPct =
    nutrition.carbsGoal > 0
      ? Math.min(100, Math.round((missingCarbs / nutrition.carbsGoal) * 100))
      : 0;
  const fatDeficitPct =
    nutrition.fatGoal > 0
      ? Math.min(100, Math.round((missingFat / nutrition.fatGoal) * 100))
      : 0;

  let dominantDeficit: 'protein' | 'carbs' | 'fat' | 'balanced' = 'balanced';
  if (focus !== 'auto') {
    dominantDeficit = focus;
  } else if (missingProtein <= 5 && missingCarbs <= 10 && missingFat <= 5) {
    dominantDeficit = 'balanced';
  } else {
    // Ważymy priorytet pod kątem brakujących gramów oraz % celu
    const pWeight = missingProtein * 1.45 + proteinDeficitPct * 0.8;
    const cWeight = missingCarbs * 0.95 + carbsDeficitPct * 0.7;
    const fWeight = missingFat * 1.35 + fatDeficitPct * 0.75;

    if (pWeight >= cWeight && pWeight >= fWeight && missingProtein > 5) {
      dominantDeficit = 'protein';
    } else if (cWeight >= pWeight && cWeight >= fWeight && missingCarbs > 10) {
      dominantDeficit = 'carbs';
    } else if (missingFat > 5) {
      dominantDeficit = 'fat';
    }
  }

  const dominantLabelPl =
    dominantDeficit === 'protein'
      ? `Brakuje ${missingProtein}g białka`
      : dominantDeficit === 'carbs'
      ? `Brakuje ${missingCarbs}g węglowodanów`
      : dominantDeficit === 'fat'
      ? `Brakuje ${missingFat}g zdrowych tłuszczów`
      : 'Bilans makro bliski celu';

  const deficit: MacroDeficitSummary = {
    missingKcal,
    missingProtein,
    missingCarbs,
    missingFat,
    proteinDeficitPct,
    carbsDeficitPct,
    fatDeficitPct,
    dominantDeficit,
    dominantLabelPl,
  };

  const recommendedSearchQuery =
    dominantDeficit === 'protein'
      ? 'twaróg skyr kurczak'
      : dominantDeficit === 'carbs'
      ? 'płatki owsiane ryż kasza'
      : dominantDeficit === 'fat'
      ? 'awokado łosoś orzechowe'
      : 'skyr banan';

  if (!catalog || catalog.length === 0) {
    return { deficit, suggestions: [], recommendedSearchQuery };
  }

  // Wykluczamy produkty, które są już wpisane dzisiaj w posiłkach (o ile mamy zapas w katalogu)
  const eatenKeywords = (nutrition.meals || []).map((m) => m.name.toLowerCase());
  const isAlreadyEaten = (foodName: string): boolean => {
    const lower = foodName.toLowerCase();
    return eatenKeywords.some((eaten) => {
      if (lower.includes('skyr') && eaten.includes('skyr')) return true;
      if (lower.includes('kurczak') && eaten.includes('kurczak')) return true;
      if (lower.includes('owsian') && eaten.includes('owsian')) return true;
      return eaten.includes(lower.slice(0, 10));
    });
  };

  const maxAllowedKcal = Math.max(160, missingKcal > 0 ? missingKcal + 60 : 280);

  const scored: FatSecretMacroSuggestion[] = catalog.map((food) => {
    const servingsList =
      food.servings && food.servings.length > 0
        ? food.servings
        : [
            {
              id: 'default',
              label: food.defaultServingLabel || `${food.defaultServingGrams || 100} g`,
              grams: food.defaultServingGrams || 100,
              isDefault: true,
            },
          ];

    // Dobierz optymalną porcję z dostępnych porcji FatSecret
    let bestServing =
      servingsList.find((s) => s.isDefault) || servingsList[0];
    let bestServingDiff = Infinity;

    for (const srv of servingsList) {
      const m = calculateFatSecretServingMacros(food, srv.grams);
      if (m.kcal > maxAllowedKcal && srv.grams > 50) continue;

      let targetGap = 0;
      if (dominantDeficit === 'protein') {
        targetGap = Math.abs(Math.max(18, missingProtein) - m.p);
      } else if (dominantDeficit === 'carbs') {
        targetGap = Math.abs(Math.max(30, missingCarbs) - m.c);
      } else if (dominantDeficit === 'fat') {
        targetGap = Math.abs(Math.max(12, missingFat) - m.f);
      } else {
        targetGap = Math.abs(180 - m.kcal);
      }

      if (targetGap < bestServingDiff) {
        bestServingDiff = targetGap;
        bestServing = srv;
      }
    }

    const macros = calculateFatSecretServingMacros(food, bestServing.grams);
    const fiberBonus = (food.fiber100 || 0) * 1.8;
    const lowSugarBonus = (food.sugar100 || 0) <= 5 ? 8 : 0;
    const alreadyEatenPenalty = isAlreadyEaten(food.name) ? -35 : 0;
    const calorieFitBonus = macros.kcal <= maxAllowedKcal ? 18 : -25;

    let score = fiberBonus + lowSugarBonus + alreadyEatenPenalty + calorieFitBonus;
    let coveragePct = 0;
    let badgeLabel = '';
    let reasonLabel = '';

    if (dominantDeficit === 'protein') {
      const proteinDensity = (food.p100 / Math.max(40, food.kcal100)) * 100; // g białka na 100 kcal
      score += proteinDensity * 6 + macros.p * 2.2 - macros.f * 0.9;
      if (food.category === 'Źródła białka') score += 25;
      coveragePct =
        missingProtein > 0
          ? Math.min(100, Math.round((macros.p / missingProtein) * 100))
          : 100;
      badgeLabel = `+${macros.p}g białka`;
      reasonLabel =
        missingProtein > 0
          ? `Pokrywa ${coveragePct}% brakującego białka (${macros.kcal} kcal)`
          : `Wysokobiałkowa porcja regeneracyjna (${macros.kcal} kcal)`;
    } else if (dominantDeficit === 'carbs') {
      const carbDensity = (food.c100 / Math.max(50, food.kcal100)) * 100;
      score += carbDensity * 4.5 + macros.c * 1.8 + (food.fiber100 || 0) * 4 - macros.f * 1.2;
      if (food.category === 'Węglowodany i zboża' || food.name.toLowerCase().includes('banan')) {
        score += 30;
      }
      coveragePct =
        missingCarbs > 0
          ? Math.min(100, Math.round((macros.c / missingCarbs) * 100))
          : 100;
      badgeLabel = `+${macros.c}g węgli`;
      reasonLabel =
        missingCarbs > 0
          ? `Uzupełnia ${coveragePct}% brakujących węglowodanów (${macros.kcal} kcal)`
          : `Zdrowe węglowodany złożone (${macros.kcal} kcal)`;
    } else if (dominantDeficit === 'fat') {
      score += food.f100 * 3.2 + macros.f * 2.5 + macros.p * 0.8 - (food.sugar100 || 0) * 2;
      const lowerName = food.name.toLowerCase();
      if (
        lowerName.includes('awokado') ||
        lowerName.includes('orzech') ||
        lowerName.includes('łosoś') ||
        lowerName.includes('jaja') ||
        lowerName.includes('tofu')
      ) {
        score += 35;
      }
      coveragePct =
        missingFat > 0
          ? Math.min(100, Math.round((macros.f / missingFat) * 100))
          : 100;
      badgeLabel = `+${macros.f}g tłuszczów`;
      reasonLabel =
        missingFat > 0
          ? `Pokrywa ${coveragePct}% brakujących zdrowych tłuszczów (${macros.kcal} kcal)`
          : `Źródło kwasów Omega i zdrowych tłuszczów (${macros.kcal} kcal)`;
    } else {
      // Balanced
      score += macros.p * 1.5 + (food.fiber100 || 0) * 3 - Math.abs(180 - macros.kcal) * 0.2;
      coveragePct =
        missingKcal > 0
          ? Math.min(100, Math.round((macros.kcal / missingKcal) * 100))
          : 100;
      badgeLabel = `${macros.kcal} kcal · B: ${macros.p}g`;
      reasonLabel = `Zbilansowana przekąska FatSecret (${macros.p}g B · ${macros.c}g W · ${macros.f}g T)`;
    }

    return {
      food,
      recommendedGrams: bestServing.grams,
      recommendedServingLabel: bestServing.label,
      kcal: macros.kcal,
      p: macros.p,
      f: macros.f,
      c: macros.c,
      targetMacro: dominantDeficit,
      badgeLabel,
      reasonLabel,
      coveragePct,
      score: Math.round(score * 10) / 10,
    };
  });

  scored.sort((a, b) => b.score - a.score);

  return {
    deficit,
    suggestions: scored.slice(0, Math.max(1, limit)),
    recommendedSearchQuery,
  };
}


