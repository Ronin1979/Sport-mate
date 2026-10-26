import test from 'node:test';
import assert from 'node:assert/strict';
import {
  addMuscleZoneXp,
  buildAIReply,
  buildPartnerReply,
  calculateAdaptiveMacros,
  calculateOverallPhysiqueStatus,
  computeWeeklyComparisonMetrics,
  createSavedWorkoutPlan,
  formatDecimalPL,
  formatNumberPL,
  formatTimerMMSS,
  getExerciseTargetZones,
  getMissingMuscleGroupsForTemplate,
  getMuscleRankInfo,
  getNutritionTotals,
  getWorkoutSetsProgress,
  getWorkoutVolumeKg,
  insertOrUpdateSegmentAttempt,
  recordCompletedWorkoutSession,
  updateWeeklyChallengeScore,
  validateRegistrationForm,
} from './formatters';
import {
  DEFAULT_USER_AVATAR,
  INITIAL_AI_MESSAGES,
  INITIAL_EXERCISE_CATALOG,
  INITIAL_MUSCLE_ZONES,
  INITIAL_WEEKLY_CHALLENGES,
  INITIAL_WORKOUT_PLANS,
  LODZ_VENUES,
} from '../data/initialData';

test('formatNumberPL formats thousands with space separator per Brandbook', () => {
  assert.equal(formatNumberPL(52800), '52 800');
  assert.equal(formatNumberPL(8420), '8 420');
  assert.equal(formatNumberPL(950), '950');
});

test('formatDecimalPL formats decimals with Polish comma', () => {
  assert.equal(formatDecimalPL(82.5, 1), '82,5');
  assert.equal(formatDecimalPL(12.45, 1), '12,5');
});

test('getWorkoutSetsProgress and getWorkoutVolumeKg compute sets and volume accurately', () => {
  const exercises = [
    {
      name: 'Wyciskanie',
      muscle: 'Klatka',
      prevResult: '',
      ytUrl: '',
      sets: [
        { weight: 80, reps: 10, done: true },
        { weight: 80, reps: 10, done: false },
      ],
    },
  ];
  const prog = getWorkoutSetsProgress(exercises);
  assert.equal(prog.done, 1);
  assert.equal(prog.total, 2);
  assert.equal(prog.pct, 50);
  assert.equal(getWorkoutVolumeKg(exercises), 800);
});

test('getNutritionTotals sums meal macros accurately', () => {
  const totals = getNutritionTotals([
    { id: 1, mealType: 'Śniadanie', name: 'Owsianka', grams: 300, kcal: 500, p: 35, f: 12, c: 60 },
    { id: 2, mealType: 'Obiad', name: 'Kurczak', grams: 400, kcal: 700, p: 55, f: 15, c: 80 },
  ]);
  assert.equal(totals.kcal, 1200);
  assert.equal(totals.p, 90);
  assert.equal(totals.f, 27);
  assert.equal(totals.c, 140);
});

test('getMissingMuscleGroupsForTemplate identifies missing groups in FBW plan', () => {
  const missing = getMissingMuscleGroupsForTemplate('FBW', [
    { muscleGroup: 'Klatka piersiowa' },
    { muscleGroup: 'Plecy' },
  ]);
  assert.equal(missing.includes('Nogi (Czworogłowe i Pośladki)'), true);
  assert.equal(missing.includes('Klatka piersiowa'), false);
});

test('insertOrUpdateSegmentAttempt inserts user attempt and updates KOM rank', () => {
  const initial = [
    {
      rank: 1,
      name: 'Karolina Nowak',
      avatar: DEFAULT_USER_AVATAR,
      timeFormatted: '16:48',
      timeSeconds: 1008,
      paceOrSpeed: '4:00 /km',
      date: '18 paź',
      isKom: true,
    },
  ];

  const updated = insertOrUpdateSegmentAttempt(
    initial,
    'Mikołaj Kowalski',
    DEFAULT_USER_AVATAR,
    990,
    4.2,
    'run'
  );

  assert.equal(updated.length, 2);
  assert.equal(updated[0].name, 'Mikołaj Kowalski');
  assert.equal(updated[0].rank, 1);
  assert.equal(updated[0].isKom, true);
  assert.equal(formatTimerMMSS(990), '16:30');
});

test('validateRegistrationForm and calculateAdaptiveMacros work properly', () => {
  const invalid = validateRegistrationForm({
    fullName: 'A',
    email: 'bad',
    password: '123',
    age: 25,
    gender: 'Mężczyzna',
    heightCm: 180,
    weightKg: 75,
    district: 'Łódź',
    primaryGoal: 'Siła',
    acceptTerms: true,
  });
  assert.equal(invalid.valid, false);

  const macros = calculateAdaptiveMacros(80, 'Siła i masa mięśniowa');
  assert.equal(macros.proteinGoal, 168);
  assert.equal(macros.kcalGoal > 2600, true);
});

test('computeWeeklyComparisonMetrics calculates weekly kcal and volume deltas accurately', () => {
  const sampleDays = [
    {
      dayShort: 'PON',
      dayFull: 'Poniedziałek',
      currentKcalBurned: 600,
      prevKcalBurned: 500,
      currentVolumeKg: 6000,
      prevVolumeKg: 5000,
    },
    {
      dayShort: 'WT',
      dayFull: 'Wtorek',
      currentKcalBurned: 500,
      prevKcalBurned: 500,
      currentVolumeKg: 4000,
      prevVolumeKg: 3000,
    },
  ];
  const res = computeWeeklyComparisonMetrics(sampleDays);
  assert.equal(res.totalCurrentKcal, 1100);
  assert.equal(res.totalPrevKcal, 1000);
  assert.equal(res.kcalDeltaPct, 10);
  assert.equal(res.totalCurrentVolumeKg, 10000);
  assert.equal(res.totalPrevVolumeKg, 8000);
  assert.equal(res.volumeDeltaPct, 25);
});

test('initialData has expanded exercises (60), expanded Łódź venues (27), and empty initial AI messages', () => {
  assert.equal(INITIAL_EXERCISE_CATALOG.length >= 58, true);
  assert.equal(LODZ_VENUES.length >= 27, true);
  assert.equal(INITIAL_AI_MESSAGES.length, 0);
  assert.equal(INITIAL_WEEKLY_CHALLENGES.length >= 3, true);
});

test('buildAIReply produces concise, tailored answers without repetitive prefixes', () => {
  const ctx = {
    restingHr: 61,
    sleepHours: '7 godz. 35 min',
    readinessScore: 89,
    kcalGoal: 2750,
    proteinGoal: 170,
    kcalEaten: 1840,
    proteinEaten: 134,
    planName: 'Góra ciała A',
    mascotName: 'Ryś SportMate',
    weightKg: 79,
  };

  const replyKnee = buildAIReply('Czuję lekkie kłucie w kolanie przy przysiadach', ctx);
  const replyProtein = buildAIReply('Ile białka zjeść przy wadze 85 kg po treningu?', ctx);
  const replyRun = buildAIReply('Jak pobiec 5 km na rekord w Arturówku?', ctx);
  const replyShort = buildAIReply('d', ctx);

  assert.notEqual(replyKnee, replyProtein);
  assert.notEqual(replyProtein, replyRun);
  assert.equal(replyKnee.includes('kolan'), true);
  assert.equal(replyProtein.includes('85 kg'), true);
  assert.equal(replyRun.includes('Arturówku'), true);
  assert.equal(replyShort.includes('Przeanalizowałem Twoje pytanie'), false);
  assert.equal(replyKnee.includes('Przeanalizowałem Twoje pytanie'), false);
});

test('updateWeeklyChallengeScore recalculates real-time rankings for distance and segment time challenges', () => {
  const distChallenge = INITIAL_WEEKLY_CHALLENGES[0];
  const resDist = updateWeeklyChallengeScore(
    distChallenge,
    7.5,
    'Mikołaj Kowalski',
    DEFAULT_USER_AVATAR,
    'user_progress'
  );
  assert.equal(resDist.previousRank, 3);
  assert.equal(resDist.userRank, 1);
  assert.equal(resDist.updatedChallenge.leaderboard[0].name, 'Mikołaj Kowalski');
  assert.equal(resDist.updatedChallenge.leaderboard[0].scoreFormatted, '40,1 km');

  const segChallenge = INITIAL_WEEKLY_CHALLENGES[1];
  const resSeg = updateWeeklyChallengeScore(
    segChallenge,
    995,
    'Mikołaj Kowalski',
    DEFAULT_USER_AVATAR,
    'user_progress'
  );
  assert.equal(resSeg.userRank, 1);
  assert.equal(resSeg.updatedChallenge.leaderboard[0].scoreFormatted, '16:35');
});

test('buildPartnerReply adapts partner responses to user questions about time, location, and pace', () => {
  const bartek = {
    id: 'p1',
    title: 'Bartek Walczak',
    subtitle: 'Kolarstwo · 0,8 km stąd',
    type: 'partner' as const,
  };
  const replyTime = buildPartnerReply('Pasuje Ci jutro o 10:15?', bartek);
  const replyPlace = buildPartnerReply('Gdzie dokładnie się spotykamy?', bartek);
  const replyPace = buildPartnerReply('Jakie tempo i dystans planujesz?', bartek);

  assert.equal(replyTime.includes('10:15'), true);
  assert.equal(replyPlace.includes('Arturówku'), true);
  assert.equal(replyPace.includes('km/h'), true);
  assert.notEqual(replyTime, replyPlace);
  assert.notEqual(replyPlace, replyPace);
});

test('getExerciseTargetZones and addMuscleZoneXp accurately map muscles and level up trained zones', () => {
  const benchTargets = getExerciseTargetZones(
    'Wyciskanie sztangi na ławce poziomej',
    'Klatka piersiowa / Triceps',
    'Klatka piersiowa'
  );
  assert.equal(benchTargets.primary.includes('chest'), true);
  assert.equal(benchTargets.secondary.includes('triceps'), true);

  const calvesBefore = INITIAL_MUSCLE_ZONES.find((z) => z.id === 'calves')!;
  assert.equal(calvesBefore.level, 1);
  assert.equal(getMuscleRankInfo(calvesBefore.level).tier, 'Unranked');

  const { updatedZones, leveledUpZones } = addMuscleZoneXp(
    INITIAL_MUSCLE_ZONES,
    ['calves'],
    [],
    95,
    3,
    'Wspięcia na palce stojąc'
  );

  const calvesAfter = updatedZones.find((z) => z.id === 'calves')!;
  assert.equal(calvesAfter.level, 2);
  assert.equal(getMuscleRankInfo(calvesAfter.level).tier, 'Bronze');
  assert.equal(leveledUpZones.length, 1);

  const status = calculateOverallPhysiqueStatus(updatedZones);
  assert.equal(status.totalWeeklySets > 100, true);
});

test('multi-plan library preserves existing plans and records multi-week session history', () => {
  assert.equal(INITIAL_WORKOUT_PLANS.length >= 4, true);

  const newPullPlan = createSavedWorkoutPlan(
    'Plan Pull B — Szerokie Plecy',
    'Pull',
    INITIAL_EXERCISE_CATALOG.slice(0, 4),
    INITIAL_WORKOUT_PLANS.length
  );

  const library = [...INITIAL_WORKOUT_PLANS, newPullPlan];
  assert.equal(library.length, 5);
  assert.equal(library[0].planName, 'Góra ciała A — siła i hipertrofia');
  assert.equal(library[4].planName, 'Plan Pull B — Szerokie Plecy');
  assert.equal(library[4].sessionHistory.length, 1);

  const upperBefore = INITIAL_WORKOUT_PLANS[0];
  assert.equal(upperBefore.completedCount, 6);
  assert.equal(upperBefore.sessionHistory.length, 3);

  const upperAfter = recordCompletedWorkoutSession(upperBefore, 'Dzisiaj, 24.10');
  assert.equal(upperAfter.completedCount, 7);
  assert.equal(upperAfter.sessionHistory.length, 4);
  assert.equal(upperAfter.sessionHistory[0].dateLabel, 'Dzisiaj, 24.10');
  assert.equal(upperAfter.exercises[0].prevResult.includes('Dzisiaj'), true);
  assert.equal((upperAfter.exercises[0].historyLogs?.length || 0) >= 4, true);
});

test('parseFatSecretFoodDescription and calculateFatSecretServingMacros parse and scale FatSecret API payloads accurately', async () => {
  const { parseFatSecretFoodDescription, calculateFatSecretServingMacros } = await import(
    './formatters'
  );

  const parsed100 = parseFatSecretFoodDescription(
    'Per 100g - Calories: 165kcal | Fat: 3.60g | Carbs: 0.00g | Protein: 31.00g'
  );
  assert.equal(parsed100.servingGrams, 100);
  assert.equal(parsed100.kcal100, 165);
  assert.equal(parsed100.p100, 31);
  assert.equal(parsed100.f100, 3.6);
  assert.equal(parsed100.c100, 0);

  const parsedServing = parseFatSecretFoodDescription(
    'Per 1 opakowanie (150g) - Calories: 96kcal | Fat: 0.30g | Carbs: 6.15g | Protein: 18.00g'
  );
  assert.equal(parsedServing.servingGrams, 150);
  assert.equal(parsedServing.kcalPerServing, 96);
  assert.equal(parsedServing.kcal100, 64);
  assert.equal(parsedServing.p100, 12);

  const scaled = calculateFatSecretServingMacros(
    { kcal100: 64, p100: 12, f100: 0.2, c100: 4.1, fiber100: 0 },
    150
  );
  assert.equal(scaled.kcal, 96);
  assert.equal(scaled.p, 18);
  assert.equal(scaled.macroSplitPct.proteinPct > 65, true);
});

test('normalizeStravaActivityToSportMate maps Strava v3 activity telemetry to SportMate format', async () => {
  const { normalizeStravaActivityToSportMate } = await import('./formatters');

  const ride = normalizeStravaActivityToSportMate({
    id: 981234567,
    name: 'Szybka pętla szosowa: Arturówek — Las Łagiewnicki',
    type: 'Ride',
    distance: 42600,
    moving_time: 4860,
    total_elevation_gain: 385,
    average_heartrate: 158,
    max_heartrate: 181,
    average_watts: 248,
    kilojoules: 1120,
    kudos_count: 29,
    pr_count: 3,
    location_city: 'Łódź',
  });

  assert.equal(ride.type, 'Ride');
  assert.equal(ride.distanceKm, 42.6);
  assert.equal(ride.elevationGainM, 385);
  assert.equal(ride.wattsAvg, 248);
  assert.equal(ride.paceOrSpeed.includes('km/h'), true);
});

test('getVenueLiveDetails and toggleVenueSlotReservation return opening hours, court/hall availability, and linked events', async () => {
  const { getVenueLiveDetails, toggleVenueSlotReservation } = await import('./formatters');
  const { INITIAL_EVENTS, LODZ_VENUES } = await import('../data/initialData');

  const zatoka = LODZ_VENUES.find((v) => v.id === 'v1')!;
  const detailsBefore = getVenueLiveDetails(zatoka, INITIAL_EVENTS, []);

  assert.equal(detailsBefore.isOpenNow, true);
  assert.equal(detailsBefore.hoursWeekday.includes('06:00'), true);
  assert.equal(detailsBefore.facilities.length, 3);
  assert.equal(detailsBefore.events.length >= 2, true);

  const firstSlotId = detailsBefore.facilities[0].slots[0].id;
  const booked = toggleVenueSlotReservation([], firstSlotId);
  assert.equal(booked.action, 'booked');
  assert.equal(booked.nextBookedSlotIds.includes(firstSlotId), true);

  const detailsAfter = getVenueLiveDetails(zatoka, INITIAL_EVENTS, booked.nextBookedSlotIds);
  assert.equal(detailsAfter.facilities[0].status, 'reserved_by_user');
  assert.equal(detailsAfter.facilities[0].statusLabel.includes('Zarezerwowano przez Ciebie'), true);

  const cancelled = toggleVenueSlotReservation(booked.nextBookedSlotIds, firstSlotId);
  assert.equal(cancelled.action, 'cancelled');
  assert.equal(cancelled.nextBookedSlotIds.length, 0);
});

test('progressive EXP curve, user rank tiers, and profile chart timeframe aggregation work accurately', async () => {
  const {
    getExpTargetForLevel,
    applyUserExpGain,
    getUserRankInfo,
    getChartDataForPeriod,
  } = await import('./formatters');
  const { INITIAL_WEEKLY_COMPARISON } = await import('../data/initialData');

  const targetL1 = getExpTargetForLevel(1);
  const targetL5 = getExpTargetForLevel(5);
  const targetL14 = getExpTargetForLevel(14);
  assert.equal(targetL5 > targetL1, true);
  assert.equal(targetL14 > targetL5, true);

  const leveled = applyUserExpGain(1, 450, 120);
  assert.equal(leveled.leveledUp, true);
  assert.equal(leveled.level, 2);
  assert.equal(leveled.expTarget, getExpTargetForLevel(2));

  assert.equal(getUserRankInfo(3).tier, 'Bronze');
  assert.equal(getUserRankInfo(8).tier, 'Silver');
  assert.equal(getUserRankInfo(14).tier, 'Gold');
  assert.equal(getUserRankInfo(18).tier, 'Platinum');
  assert.equal(getUserRankInfo(23).tier, 'Diamond');
  assert.equal(getUserRankInfo(28).tier, 'Master');

  assert.equal(getChartDataForPeriod(INITIAL_WEEKLY_COMPARISON, '7d').length, 7);
  assert.equal(getChartDataForPeriod(INITIAL_WEEKLY_COMPARISON, '14d').length, 14);
  assert.equal(getChartDataForPeriod(INITIAL_WEEKLY_COMPARISON, '30d').length, 4);
  assert.equal(getChartDataForPeriod(INITIAL_WEEKLY_COMPARISON, '90d').length, 6);
});

test('censorChatMessage replaces phone numbers, emails, profanities, and off-app contact attempts with *****', async () => {
  const { censorChatMessage } = await import('./formatters');

  assert.deepEqual(censorChatMessage('Spotkajmy się jutro o 18:00 w Zatoce Sportu'), {
    text: 'Spotkajmy się jutro o 18:00 w Zatoce Sportu',
    censored: false,
  });

  // Phone numbers
  assert.deepEqual(censorChatMessage('Mój numer to 505 606 707'), {
    text: '*****',
    censored: true,
  });
  assert.deepEqual(censorChatMessage('+48600123456'), {
    text: '*****',
    censored: true,
  });

  // Emails
  assert.deepEqual(censorChatMessage('Napisz na mikolaj@gmail.com'), {
    text: '*****',
    censored: true,
  });

  // Profanity
  assert.deepEqual(censorChatMessage('Ale kurwa ciężki trening'), {
    text: '*****',
    censored: true,
  });

  // Off-app contact attempts
  assert.deepEqual(censorChatMessage('Odezwij się na whatsapp albo poza aplikacją'), {
    text: '*****',
    censored: true,
  });
  assert.deepEqual(censorChatMessage('Napisz na ig albo zadzwoń'), {
    text: '*****',
    censored: true,
  });
});

test('getSmartFatSecretMacroSuggestions recommends healthy FatSecret products based on missing macros', async () => {
  const { getSmartFatSecretMacroSuggestions } = await import('./formatters');
  const { FATSECRET_CURATED_FOODS } = await import('../data/apiCatalogs');

  // 1. Duży brak białka (zjedzono 90g / 180g białka)
  const proteinGapResult = getSmartFatSecretMacroSuggestions(
    {
      kcalGoal: 2750,
      proteinGoal: 180,
      fatGoal: 75,
      carbsGoal: 320,
      meals: [
        {
          id: 1,
          mealType: 'Śniadanie',
          name: 'Owsianka z bananem',
          grams: 350,
          kcal: 1950,
          p: 90,
          f: 65,
          c: 295,
        },
      ],
    },
    FATSECRET_CURATED_FOODS,
    'auto',
    3
  );

  assert.equal(proteinGapResult.deficit.dominantDeficit, 'protein');
  assert.equal(proteinGapResult.deficit.missingProtein, 90);
  assert.equal(proteinGapResult.suggestions.length, 3);
  assert.equal(proteinGapResult.suggestions[0].p >= 18, true);
  assert.equal(proteinGapResult.suggestions[0].badgeLabel.includes('białka'), true);

  // 2. Wymuszony fokus na węglowodany ('carbs')
  const carbsGapResult = getSmartFatSecretMacroSuggestions(
    {
      kcalGoal: 2750,
      proteinGoal: 170,
      fatGoal: 75,
      carbsGoal: 340,
      meals: [
        {
          id: 1,
          mealType: 'Obiad',
          name: 'Pierś z kurczaka',
          grams: 300,
          kcal: 1600,
          p: 155,
          f: 60,
          c: 190,
        },
      ],
    },
    FATSECRET_CURATED_FOODS,
    'carbs',
    3
  );

  assert.equal(carbsGapResult.deficit.dominantDeficit, 'carbs');
  assert.equal(carbsGapResult.deficit.missingCarbs, 150);
  assert.equal(carbsGapResult.suggestions[0].c >= 20, true);
  assert.equal(carbsGapResult.suggestions[0].badgeLabel.includes('węgli'), true);

  // 3. Fokus na zdrowe tłuszcze ('fat')
  const fatGapResult = getSmartFatSecretMacroSuggestions(
    {
      kcalGoal: 2750,
      proteinGoal: 170,
      fatGoal: 80,
      carbsGoal: 340,
      meals: [
        {
          id: 1,
          mealType: 'Obiad',
          name: 'Ryż z kurczakiem',
          grams: 400,
          kcal: 2100,
          p: 165,
          f: 35,
          c: 325,
        },
      ],
    },
    FATSECRET_CURATED_FOODS,
    'fat',
    3
  );

  assert.equal(fatGapResult.deficit.dominantDeficit, 'fat');
  assert.equal(fatGapResult.deficit.missingFat, 45);
  assert.equal(fatGapResult.suggestions[0].f >= 9, true);
});



