import React, { useState } from 'react';
import {
  Activity,
  Award,
  Calendar,
  Check,
  ChevronRight,
  Droplets,
  Flame,
  Gift,
  HeartPulse,
  Moon,
  Play,
  Target,
  Trophy,
  Zap,
} from 'lucide-react';
import {
  ActivitySubTab,
  DailyStreakQuest,
  DiscoverSubTab,
  GlobalMascotVariant,
  MuscleZoneProgress,
  NutritionState,
  ScreenName,
  SportEvent,
  UserProfile,
  WeekDayData,
  WeeklyGamificationQuest,
  WorkoutState,
} from '../../types/sportmate';
import {
  calculateOverallPhysiqueStatus,
  formatNumberPL,
  getNutritionTotals,
  getWorkoutSetsProgress,
} from '../../utils/formatters';
import { RadialGauge } from '../common/VisualWidgets';
import { InteractiveHomeLynxBanner } from '../mascot/GlobalMascot';

interface TodayScreenProps {
  user: UserProfile;
  weekDays: WeekDayData[];
  selectedDayIndex: number;
  workout: WorkoutState;
  nutrition: NutritionState;
  featuredEvent: SportEvent;
  mascotVariant?: GlobalMascotVariant;
  unreadNotificationsCount: number;
  latestNotificationText: string;
  dailyQuests: DailyStreakQuest[];
  weeklyQuests: WeeklyGamificationQuest[];
  muscleZones: MuscleZoneProgress[];
  onSelectWeekDay: (index: number) => void;
  onAddWater: (ml: number) => void;
  onNavigate: (screen: ScreenName) => void;
  onOpenTab: (tab: ScreenName, subTab?: ActivitySubTab | DiscoverSubTab) => void;
  onClaimDailyQuest: (questId: string) => void;
  onClaimWeeklyQuest: (questId: string) => void;
}

export const TodayScreen: React.FC<TodayScreenProps> = ({
  user,
  weekDays,
  selectedDayIndex,
  workout,
  nutrition,
  featuredEvent,
  unreadNotificationsCount,
  latestNotificationText,
  dailyQuests,
  weeklyQuests,
  muscleZones,
  onSelectWeekDay,
  onAddWater,
  onNavigate,
  onOpenTab,
  onClaimDailyQuest,
  onClaimWeeklyQuest,
}) => {
  const [todaySubView, setTodaySubView] = useState<'overview' | 'quests'>('overview');

  const day = weekDays[selectedDayIndex];
  const isLive = Boolean(day.isTodayLive);

  const readiness = isLive ? user.readinessScore : day.readiness || 80;
  const rStatus = isLive ? 'Wysoka gotowość' : day.readinessStatus || 'Optymalna';
  const rTitle = isLive
    ? 'Pełna regeneracja układu nerwowego'
    : day.readinessTitle || '';
  const sleep = isLive ? user.sleepHours : day.sleep || '7 godz. 30 min';
  const hr = isLive ? user.restingHr : day.hr || 61;
  const steps = isLive ? user.steps : day.steps || 8000;

  const liveProgress = getWorkoutSetsProgress(workout.exercises);
  const wTitle = isLive ? workout.planName : day.workoutTitle || '';
  const wSetsDone = isLive ? liveProgress.done : day.setsDone || 0;
  const wSetsTotal = isLive ? liveProgress.total : day.setsTotal || 1;
  const wPct = isLive
    ? liveProgress.pct
    : Math.round((wSetsDone / Math.max(1, wSetsTotal)) * 100);
  const wBadge = isLive ? `${wSetsDone}/${wSetsTotal} serii` : day.workoutBadge || '';
  const wDuration = isLive ? workout.durationEst : day.workoutDuration || '50 min';

  const liveNutr = getNutritionTotals(nutrition.meals);
  const kcal = isLive ? liveNutr.kcal : day.kcal || 0;
  const p = isLive ? liveNutr.p : day.p || 0;
  const f = isLive ? liveNutr.f : day.f || 0;
  const c = isLive ? liveNutr.c : day.c || 0;
  const waterMl = isLive ? nutrition.waterMl : day.waterMl || 0;

  const kcalLeft = Math.max(0, nutrition.kcalGoal - kcal);
  const pPct = Math.min(100, Math.round((p / nutrition.proteinGoal) * 100));
  const cPct = Math.min(100, Math.round((c / nutrition.carbsGoal) * 100));
  const fPct = Math.min(100, Math.round((f / nutrition.fatGoal) * 100));
  const waterPct = Math.min(100, Math.round((waterMl / nutrition.waterGoalMl) * 100));

  const dailyDoneCount = dailyQuests.filter((q) => q.completed || q.claimed).length;
  const physiqueStatus = calculateOverallPhysiqueStatus(muscleZones);

  return (
    <div>
      {/* 1. PASEK DNI TYGODNIA NA SAMEJ GÓRZE EKRANU DZIŚ */}
      <div className="week-strip" role="tablist" aria-label="Dni tygodnia">
        {weekDays.map((wd, idx) => (
          <button
            key={wd.short}
            type="button"
            role="tab"
            aria-selected={idx === selectedDayIndex}
            className={`day-pill ${wd.done ? 'done' : ''} ${
              idx === selectedDayIndex ? 'today' : ''
            }`}
            onClick={() => onSelectWeekDay(idx)}
          >
            <span className="day-name">{wd.short}</span>
            <span className="day-num">{wd.num}</span>
            <span className="day-dot" />
          </button>
        ))}
      </div>

      {/* 2. KOMPAKTOWY BANER Z RYSIEM */}
      <InteractiveHomeLynxBanner
        userName={user.name}
        readinessScore={readiness}
        streakDays={user.streakDays}
        unreadNotificationsCount={unreadNotificationsCount}
        latestNotificationText={latestNotificationText}
        onOpenNotifications={() => onNavigate('notifications')}
        onOpenAICoach={() => onOpenTab('ai')}
      />

      {/* 3. PRZEŁĄCZNIK POD-WIDOKÓW NA EKRANIE DZIŚ (KONIEC Z DŁUGIM PRZEWIJANIEM) */}
      <div
        className="segmented-control"
        role="tablist"
        aria-label="Widoki ekranu Dziś"
        style={{ marginBottom: 12 }}
      >
        <button
          type="button"
          data-testid="today-tab-overview"
          className={`segment-btn ${todaySubView === 'overview' ? 'active' : ''}`}
          onClick={() => setTodaySubView('overview')}
        >
          Plan dnia
        </button>
        <button
          type="button"
          data-testid="today-tab-quests"
          className={`segment-btn ${todaySubView === 'quests' ? 'active' : ''}`}
          onClick={() => setTodaySubView('quests')}
        >
          Cele i zadania ({dailyDoneCount}/{dailyQuests.length})
        </button>
      </div>

      {todaySubView === 'overview' ? (
        <div>
          {/* Karta Gotowości i Biometrii */}
          <div className="card" style={{ padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <RadialGauge
                pct={readiness}
                size={72}
                strokeWidth={6}
                color="var(--accent-mint)"
                centerLabel={readiness}
                subLabel="GOTOWOŚĆ"
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <span className="badge badge-mint" style={{ marginBottom: 4 }}>
                  {rStatus}
                </span>
                <h2
                  style={{
                    fontSize: 14.5,
                    fontWeight: 800,
                    lineHeight: 1.25,
                    letterSpacing: '-0.3px',
                  }}
                >
                  {rTitle}
                </h2>
                <div
                  style={{
                    display: 'flex',
                    gap: 10,
                    marginTop: 7,
                    fontSize: 11.5,
                    color: 'var(--text-secondary)',
                    flexWrap: 'wrap',
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <Moon size={12} className="mono-icon" />
                    <strong style={{ color: 'var(--text-primary)' }}>{sleep}</strong>
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <HeartPulse size={12} className="mono-icon" />
                    <strong style={{ color: 'var(--text-primary)' }}>{hr} bpm</strong>
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <Activity size={12} className="mono-icon" />
                    <strong style={{ color: 'var(--text-primary)' }}>
                      {formatNumberPL(steps)}
                    </strong>{' '}
                    kr.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Plan Treningowy na wybrany dzień */}
          <div
            className="card clickable"
            onClick={() => onOpenTab('activity', 'training')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onOpenTab('activity', 'training');
            }}
            style={{ padding: '12px 14px' }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 8,
                gap: 8,
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                  <span className="badge badge-strava">{wBadge}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 }}>
                    {workout.exercises.length} ćw. · {wDuration}
                  </span>
                </div>
                <h3
                  style={{
                    fontSize: 14.5,
                    fontWeight: 800,
                    lineHeight: 1.25,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {wTitle}
                </h3>
              </div>
              {isLive ? (
                <button
                  type="button"
                  className="btn btn-strava btn-sm"
                  style={{ width: 'auto', padding: '7px 12px', flexShrink: 0 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate('active-workout');
                  }}
                >
                  <Play size={12} fill="currentColor" /> Start ({wPct}%)
                </button>
              ) : (
                <Zap size={16} style={{ color: 'var(--accent-strava)', flexShrink: 0 }} />
              )}
            </div>

            <div className="progress-track" style={{ height: 5 }}>
              <div
                className="progress-fill"
                style={{
                  width: `${wPct}%`,
                  background: 'var(--accent-strava)',
                }}
              />
            </div>
          </div>

          {/* Bilans kalorii, makro i nawodnienia */}
          <div
            className="card clickable"
            onClick={() => onOpenTab('activity', 'nutrition')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onOpenTab('activity', 'nutrition');
            }}
            style={{ padding: '12px 14px' }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 10,
              }}
            >
              <div>
                <div
                  className="tabular-nums"
                  style={{
                    fontSize: 19,
                    fontWeight: 800,
                    letterSpacing: '-0.4px',
                  }}
                >
                  {formatNumberPL(kcal)}{' '}
                  <span
                    style={{
                      fontSize: 12,
                      color: 'var(--text-secondary)',
                      fontWeight: 600,
                    }}
                  >
                    / {formatNumberPL(nutrition.kcalGoal)} kcal
                  </span>
                </div>
                <div style={{ fontSize: 10.5, color: 'var(--text-secondary)' }}>
                  Pozostało {formatNumberPL(kcalLeft)} kcal
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  className="tabular-nums"
                  style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--accent-water)' }}
                >
                  <Droplets
                    size={12}
                    style={{ display: 'inline', verticalAlign: '-2px', marginRight: 3 }}
                  />
                  {(waterMl / 1000).toFixed(2).replace('.', ',')} L
                </span>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ width: 'auto', padding: '4px 9px', fontSize: 10.5 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddWater(250);
                  }}
                >
                  +250 ml
                </button>
              </div>
            </div>

            <div className="grid-3">
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 10.5,
                    marginBottom: 3,
                  }}
                >
                  <span style={{ color: 'var(--text-secondary)' }}>Białko</span>
                  <strong className="tabular-nums">
                    {p}/{nutrition.proteinGoal}g
                  </strong>
                </div>
                <div className="progress-track" style={{ height: 4 }}>
                  <div
                    className="progress-fill"
                    style={{ width: `${pPct}%`, background: 'var(--accent-mint)' }}
                  />
                </div>
              </div>
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 10.5,
                    marginBottom: 3,
                  }}
                >
                  <span style={{ color: 'var(--text-secondary)' }}>Węgle</span>
                  <strong className="tabular-nums">
                    {c}/{nutrition.carbsGoal}g
                  </strong>
                </div>
                <div className="progress-track" style={{ height: 4 }}>
                  <div
                    className="progress-fill"
                    style={{ width: `${cPct}%`, background: 'var(--accent-strava)' }}
                  />
                </div>
              </div>
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 10.5,
                    marginBottom: 3,
                  }}
                >
                  <span style={{ color: 'var(--text-secondary)' }}>Tłuszcz</span>
                  <strong className="tabular-nums">
                    {f}/{nutrition.fatGoal}g
                  </strong>
                </div>
                <div className="progress-track" style={{ height: 4 }}>
                  <div
                    className="progress-fill"
                    style={{ width: `${fPct}%`, background: '#F59E0B' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Kompaktowy 2-kolumnowy rząd skrótów: Sylwetka i Wydarzenie */}
          <div className="grid-2" style={{ gap: 10 }}>
            <div
              className="card clickable"
              onClick={() => onOpenTab('activity', 'muscles')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onOpenTab('activity', 'muscles');
              }}
              style={{ padding: '11px 12px', marginBottom: 0 }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 4,
                }}
              >
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 800,
                    color: 'var(--accent-mint-bright)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <Target size={12} /> Mapa Mięśni
                </span>
                <ChevronRight size={13} className="mono-icon" />
              </div>
              <div style={{ fontWeight: 800, fontSize: 13 }}>
                Ranga {physiqueStatus.overallRank}
              </div>
              <div style={{ fontSize: 10.5, color: 'var(--text-secondary)', marginTop: 1 }}>
                Symetria {physiqueStatus.symmetryScore}%
              </div>
            </div>

            <div
              className="card clickable"
              onClick={() => onOpenTab('discover', 'events')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onOpenTab('discover', 'events');
              }}
              style={{ padding: '11px 12px', marginBottom: 0 }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 4,
                }}
              >
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 800,
                    color: 'var(--accent-strava)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <Calendar size={12} /> {featuredEvent.sport}
                </span>
                <ChevronRight size={13} className="mono-icon" />
              </div>
              <div
                style={{
                  fontWeight: 800,
                  fontSize: 12.5,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {featuredEvent.title}
              </div>
              <div
                style={{
                  fontSize: 10.5,
                  color: 'var(--text-secondary)',
                  marginTop: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {featuredEvent.date.split('·')[0].trim()}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          {/* CELE DZIENNE — CZYSTA PŁASKA LISTA */}
          <div
            className="grouped-list"
            data-testid="daily-streak-quests-card"
            style={{ marginBottom: 12 }}
          >
            <div
              className="list-row"
              style={{
                padding: '11px 14px',
                background: 'rgba(255, 107, 53, 0.05)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Flame size={15} style={{ color: 'var(--accent-strava)', flexShrink: 0 }} />
                <span style={{ fontWeight: 800, fontSize: 13.5 }}>
                  Cele dzienne · Seria {user.streakDays} dni
                </span>
              </div>
              <span
                className="tabular-nums"
                style={{
                  fontSize: 11.5,
                  fontWeight: 800,
                  color:
                    dailyDoneCount === dailyQuests.length
                      ? 'var(--accent-mint-bright)'
                      : 'var(--text-secondary)',
                }}
              >
                {dailyDoneCount}/{dailyQuests.length}
              </span>
            </div>

            {dailyQuests.map((quest) => {
              const pct = Math.min(
                100,
                Math.round((quest.current / Math.max(1, quest.target)) * 100)
              );
              const isDone = quest.completed || quest.current >= quest.target;

              return (
                <div
                  key={quest.id}
                  className="list-row"
                  style={{
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 10,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'baseline',
                        gap: 8,
                        marginBottom: 5,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 12.5,
                          fontWeight: 700,
                          color: quest.claimed
                            ? 'var(--text-secondary)'
                            : 'var(--text-primary)',
                          textDecoration: quest.claimed ? 'line-through' : 'none',
                        }}
                      >
                        {quest.title}
                      </span>
                      <span
                        className="tabular-nums"
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: 'var(--text-secondary)',
                          flexShrink: 0,
                        }}
                      >
                        {formatNumberPL(quest.current)}/{formatNumberPL(quest.target)} {quest.unit}
                      </span>
                    </div>
                    <div className="progress-track" style={{ height: 4 }}>
                      <div
                        className="progress-fill"
                        style={{
                          width: `${pct}%`,
                          background: quest.claimed
                            ? 'var(--accent-mint)'
                            : isDone
                            ? '#F59E0B'
                            : 'var(--accent-strava)',
                        }}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    data-testid={`claim-daily-${quest.id}`}
                    disabled={quest.claimed}
                    onClick={() => onClaimDailyQuest(quest.id)}
                    className={`btn ${
                      quest.claimed
                        ? 'btn-secondary'
                        : isDone
                        ? 'btn-primary'
                        : 'btn-secondary'
                    } btn-sm`}
                    style={{
                      width: 'auto',
                      padding: '5px 10px',
                      fontSize: 11,
                      flexShrink: 0,
                    }}
                  >
                    {quest.claimed ? (
                      <>
                        <Check size={12} /> +{quest.rewardExp}
                      </>
                    ) : (
                      `+${quest.rewardExp} EXP`
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* ZADANIA TYGODNIOWE — CZYSTA PŁASKA LISTA */}
          <div
            className="grouped-list"
            data-testid="weekly-gamification-quests-card"
            style={{ marginBottom: 12 }}
          >
            <div
              className="list-row"
              style={{
                padding: '11px 14px',
                background: 'rgba(62, 214, 163, 0.05)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Trophy size={15} style={{ color: 'var(--accent-mint-bright)', flexShrink: 0 }} />
                <span style={{ fontWeight: 800, fontSize: 13.5 }}>Zadania tygodnia</span>
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 700 }}>
                Nagrody EXP
              </span>
            </div>

            {weeklyQuests.map((wq) => {
              const pct = Math.min(
                100,
                Math.round((wq.current / Math.max(1, wq.target)) * 100)
              );
              const isCompleted = wq.current >= wq.target;

              return (
                <div
                  key={wq.id}
                  className="list-row"
                  style={{
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 10,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'baseline',
                        gap: 8,
                        marginBottom: 3,
                      }}
                    >
                      <span style={{ fontSize: 12.5, fontWeight: 700 }}>{wq.title}</span>
                      <span
                        className="tabular-nums"
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: 'var(--text-secondary)',
                          flexShrink: 0,
                        }}
                      >
                        {formatNumberPL(wq.current)}/{formatNumberPL(wq.target)} {wq.unit}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: 10.5,
                        color: 'var(--text-secondary)',
                        marginBottom: 5,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <Award size={11} style={{ color: '#F59E0B', flexShrink: 0 }} />
                      <span>{wq.rewardBadgeName}</span>
                    </div>
                    <div className="progress-track" style={{ height: 4 }}>
                      <div
                        className="progress-fill"
                        style={{
                          width: `${pct}%`,
                          background: wq.claimed
                            ? 'var(--accent-mint)'
                            : 'linear-gradient(90deg, #3ED6A3, #F59E0B)',
                        }}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    data-testid={`claim-weekly-${wq.id}`}
                    disabled={wq.claimed}
                    onClick={() => onClaimWeeklyQuest(wq.id)}
                    className={`btn ${
                      wq.claimed
                        ? 'btn-secondary'
                        : isCompleted
                        ? 'btn-primary'
                        : 'btn-secondary'
                    } btn-sm`}
                    style={{
                      width: 'auto',
                      padding: '5px 10px',
                      fontSize: 11,
                      flexShrink: 0,
                    }}
                  >
                    {wq.claimed ? (
                      <>
                        <Check size={12} /> Odebrano
                      </>
                    ) : (
                      <>
                        <Gift size={12} /> +{wq.rewardExp} EXP
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
