import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  AreaChart,
  Bar,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { Flame, Dumbbell, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { ChartPeriodKey, WeeklyComparisonDay } from '../../types/sportmate';
import {
  computeWeeklyComparisonMetrics,
  formatDecimalPL,
  formatNumberPL,
  getChartDataForPeriod,
} from '../../utils/formatters';

interface WeeklyProgressChartProps {
  days: WeeklyComparisonDay[];
  liveSaturdayVolumeKg?: number;
}

type ChartMode = 'combined' | 'calories' | 'volume';

const PERIOD_OPTIONS: { key: ChartPeriodKey; label: string; desc: string }[] = [
  { key: '7d', label: '7 dni', desc: 'Bieżący tydzień' },
  { key: '14d', label: '14 dni', desc: 'Ostatnie 2 tygodnie' },
  { key: '30d', label: '30 dni', desc: 'Miesiąc (4 tygodnie)' },
  { key: '90d', label: '90 dni', desc: 'Kwartał (3 miesiące)' },
];

export const WeeklyProgressChart: React.FC<WeeklyProgressChartProps> = ({
  days,
  liveSaturdayVolumeKg,
}) => {
  const [mode, setMode] = useState<ChartMode>('combined');
  const [period, setPeriod] = useState<ChartPeriodKey>('7d');
  const [expandedDetails, setExpandedDetails] = useState<boolean>(false);

  const effectiveSatVolume =
    typeof liveSaturdayVolumeKg === 'number' && liveSaturdayVolumeKg > 0
      ? Math.max(5980, 3900 + liveSaturdayVolumeKg)
      : undefined;

  const periodDays = useMemo(
    () => getChartDataForPeriod(days, period, effectiveSatVolume),
    [days, period, effectiveSatVolume]
  );

  const summary = useMemo(
    () =>
      computeWeeklyComparisonMetrics(
        periodDays,
        period === '7d' ? effectiveSatVolume : undefined
      ),
    [periodDays, period, effectiveSatVolume]
  );

  const chartData = summary.enrichedDays;

  const peakDayLabel = useMemo(() => {
    if (!chartData.length) return 'Sobota';
    const best = [...chartData].sort(
      (a, b) =>
        b.currentKcalBurned + b.currentVolumeKg / 8 - (a.currentKcalBurned + a.currentVolumeKg / 8)
    )[0];
    return `${best.dayFull} (${formatNumberPL(best.currentKcalBurned)} kcal)`;
  }, [chartData]);

  const activePeriodMeta =
    PERIOD_OPTIONS.find((p) => p.key === period) || PERIOD_OPTIONS[0];

  const renderCustomTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
    if (!active || !payload || !payload.length) return null;
    const row: WeeklyComparisonDay & { kcalDiff: number; volumeDiff: number } = payload[0].payload;

    return (
      <div
        style={{
          background: 'var(--chart-tooltip-bg)',
          border: '1px solid var(--chart-tooltip-border)',
          borderRadius: 12,
          padding: '10px 12px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.25)',
          fontSize: 11,
          color: 'var(--chart-tooltip-text)',
          minWidth: 195,
        }}
      >
        <div
          style={{
            fontWeight: 800,
            fontSize: 12,
            marginBottom: 2,
            color: 'var(--chart-tooltip-text)',
          }}
        >
          {row.dayFull} ({row.dayShort})
        </div>
        {row.sessionFocus && (
          <div style={{ fontSize: 10, color: 'var(--chart-tooltip-sub)', marginBottom: 8 }}>
            {row.sessionFocus}
          </div>
        )}

        {(mode === 'combined' || mode === 'calories') && (
          <div style={{ marginBottom: mode === 'combined' ? 6 : 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
              <span style={{ color: '#FF6B35', fontWeight: 700 }}>Kalorie:</span>
              <span className="tabular-nums" style={{ fontWeight: 800 }}>
                {formatNumberPL(row.currentKcalBurned)} kcal
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 10,
                color: 'var(--chart-tooltip-sub)',
              }}
            >
              <span>Poprzedni okres:</span>
              <span className="tabular-nums">{formatNumberPL(row.prevKcalBurned)} kcal</span>
            </div>
          </div>
        )}

        {(mode === 'combined' || mode === 'volume') && (
          <div
            style={{
              paddingTop: mode === 'combined' ? 6 : 0,
              borderTop: mode === 'combined' ? '1px solid var(--border-divider)' : 'none',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
              <span style={{ color: 'var(--accent-mint-bright)', fontWeight: 700 }}>
                Objętość:
              </span>
              <span className="tabular-nums" style={{ fontWeight: 800 }}>
                {formatNumberPL(row.currentVolumeKg)} kg
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 10,
                color: 'var(--chart-tooltip-sub)',
              }}
            >
              <span>Poprzedni okres:</span>
              <span className="tabular-nums">{formatNumberPL(row.prevVolumeKg)} kg</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="card" style={{ marginBottom: 12 }}>
      {/* Minimalistyczny nagłówek z przełącznikiem okresu i wejściem w szczegóły wykresu */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 8,
          marginBottom: 10,
        }}
      >
        <div
          onClick={() => setExpandedDetails((prev) => !prev)}
          style={{ cursor: 'pointer', flex: 1 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>
              Wykres Postępów ({activePeriodMeta.label})
            </h3>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 2,
                fontSize: 10,
                fontWeight: 700,
                color: 'var(--accent-mint)',
                background: 'rgba(62, 214, 163, 0.12)',
                padding: '2px 7px',
                borderRadius: 6,
              }}
            >
              {expandedDetails ? 'Zwiń' : 'Szczegóły'}
              {expandedDetails ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
            {activePeriodMeta.desc} · Kliknij, aby dostosować widok i okres
          </div>
        </div>
      </div>

      {/* Wybór okresu czasu (7 dni / 14 dni / 30 dni / 90 dni) */}
      <div
        data-testid="chart-period-selector"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 6,
          marginBottom: 10,
        }}
      >
        {PERIOD_OPTIONS.map((opt) => {
          const isActive = period === opt.key;
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => setPeriod(opt.key)}
              style={{
                padding: '6px 4px',
                borderRadius: 9,
                fontSize: 11,
                fontWeight: 800,
                cursor: 'pointer',
                border: isActive
                  ? '1px solid var(--accent-mint)'
                  : '1px solid var(--border-subtle)',
                background: isActive
                  ? 'rgba(62, 214, 163, 0.16)'
                  : 'var(--bg-elevated)',
                color: isActive ? 'var(--accent-mint)' : 'var(--text-secondary)',
                transition: 'all 0.15s ease',
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* KPI Wybranego Okresu */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
        <div
          style={{
            background: 'var(--bg-elevated)',
            borderRadius: 12,
            padding: '9px 11px',
            border: '1px solid rgba(255,107,53,0.22)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 3,
            }}
          >
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Flame size={12} color="#FF6B35" /> Spalone Kalorie
            </span>
            <span
              className="tabular-nums"
              style={{
                fontSize: 10,
                fontWeight: 800,
                padding: '1px 6px',
                borderRadius: 99,
                background: 'rgba(16, 185, 129, 0.16)',
                color: 'var(--accent-mint-bright)',
              }}
            >
              {summary.kcalDeltaPct >= 0 ? '+' : ''}
              {formatDecimalPL(summary.kcalDeltaPct, 1)}%
            </span>
          </div>
          <div className="tabular-nums" style={{ fontSize: 16, fontWeight: 800, color: '#FF6B35' }}>
            {formatNumberPL(summary.totalCurrentKcal)} kcal
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-elevated)',
            borderRadius: 12,
            padding: '9px 11px',
            border: '1px solid rgba(16, 185, 129, 0.24)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 3,
            }}
          >
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Dumbbell size={12} color="#10B981" /> Objętość (Tonaż)
            </span>
            <span
              className="tabular-nums"
              style={{
                fontSize: 10,
                fontWeight: 800,
                padding: '1px 6px',
                borderRadius: 99,
                background: 'rgba(16, 185, 129, 0.16)',
                color: 'var(--accent-mint-bright)',
              }}
            >
              {summary.volumeDeltaPct >= 0 ? '+' : ''}
              {formatDecimalPL(summary.volumeDeltaPct, 1)}%
            </span>
          </div>
          <div
            className="tabular-nums"
            style={{ fontSize: 16, fontWeight: 800, color: 'var(--accent-mint-bright)' }}
          >
            {formatNumberPL(summary.totalCurrentVolumeKg)} kg
          </div>
        </div>
      </div>

      {/* Przełącznik metryki wykresu */}
      <div className="segmented-control" style={{ marginBottom: 10 }}>
        <button
          type="button"
          className={`segment-btn ${mode === 'combined' ? 'active' : ''}`}
          onClick={() => setMode('combined')}
        >
          Łączony
        </button>
        <button
          type="button"
          className={`segment-btn ${mode === 'calories' ? 'active' : ''}`}
          onClick={() => setMode('calories')}
        >
          Kalorie (kcal)
        </button>
        <button
          type="button"
          className={`segment-btn ${mode === 'volume' ? 'active' : ''}`}
          onClick={() => setMode('volume')}
        >
          Objętość (kg)
        </button>
      </div>

      {/* Kontener wykresu — kliknięcie rozwija szczegółową tabelę okresu */}
      <div
        data-testid="weekly-progress-chart-plot"
        onClick={() => setExpandedDetails((prev) => !prev)}
        style={{
          width: '100%',
          height: expandedDetails ? 245 : 215,
          background: 'var(--chart-plot-bg)',
          borderRadius: 14,
          padding: '10px 6px 4px 0',
          border: '1px solid var(--chart-plot-border)',
          cursor: 'pointer',
          transition: 'height 0.2s ease',
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          {mode === 'combined' ? (
            <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="volBarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="#3ED6A3" stopOpacity={0.35} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--chart-grid-stroke)"
                vertical={false}
              />
              <XAxis
                dataKey="dayShort"
                tick={{ fill: 'var(--chart-axis-tick)', fontSize: 9.5, fontWeight: 700 }}
                axisLine={{ stroke: 'var(--chart-axis-line)' }}
                tickLine={false}
              />
              <YAxis
                yAxisId="vol"
                tick={{ fill: '#10B981', fontSize: 9, fontWeight: 700 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${Math.round(v / 1000)}t`}
              />
              <YAxis
                yAxisId="kcal"
                orientation="right"
                tick={{ fill: '#FF6B35', fontSize: 9, fontWeight: 700 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={renderCustomTooltip} />
              <Bar
                yAxisId="vol"
                dataKey="prevVolumeKg"
                name="Objętość (Poprz.)"
                fill="var(--chart-prev-bar)"
                radius={[4, 4, 0, 0]}
                barSize={period === '14d' ? 6 : 11}
              />
              <Bar
                yAxisId="vol"
                dataKey="currentVolumeKg"
                name="Objętość (Teraz)"
                fill="url(#volBarGrad)"
                radius={[4, 4, 0, 0]}
                barSize={period === '14d' ? 6 : 11}
              />
              <Line
                yAxisId="kcal"
                type="monotone"
                dataKey="prevKcalBurned"
                name="Kalorie (Poprz.)"
                stroke="#64748B"
                strokeWidth={1.6}
                strokeDasharray="4 4"
                dot={false}
              />
              <Line
                yAxisId="kcal"
                type="monotone"
                dataKey="currentKcalBurned"
                name="Kalorie (Teraz)"
                stroke="#FF6B35"
                strokeWidth={2.6}
                dot={{ r: 3, fill: '#FF6B35', stroke: '#FFFFFF', strokeWidth: 1.5 }}
                activeDot={{ r: 5, fill: '#FF6B35', stroke: '#FFFFFF', strokeWidth: 2 }}
              />
            </ComposedChart>
          ) : mode === 'calories' ? (
            <AreaChart data={chartData} margin={{ top: 8, right: 10, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="kcalAreaCurrent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.42} />
                  <stop offset="95%" stopColor="#FF6B35" stopOpacity={0.04} />
                </linearGradient>
                <linearGradient id="kcalAreaPrev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#64748B" stopOpacity={0.22} />
                  <stop offset="95%" stopColor="#64748B" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--chart-grid-stroke)"
                vertical={false}
              />
              <XAxis
                dataKey="dayShort"
                tick={{ fill: 'var(--chart-axis-tick)', fontSize: 9.5, fontWeight: 700 }}
                axisLine={{ stroke: 'var(--chart-axis-line)' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: 'var(--chart-axis-tick)', fontSize: 9 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={renderCustomTooltip} />
              <Area
                type="monotone"
                dataKey="prevKcalBurned"
                name="Poprzedni okres (kcal)"
                stroke="#64748B"
                strokeWidth={1.6}
                strokeDasharray="4 4"
                fill="url(#kcalAreaPrev)"
              />
              <Area
                type="monotone"
                dataKey="currentKcalBurned"
                name="Wybrany okres (kcal)"
                stroke="#FF6B35"
                strokeWidth={2.6}
                fill="url(#kcalAreaCurrent)"
                dot={{ r: 3, fill: '#FF6B35', stroke: '#FFFFFF', strokeWidth: 1.5 }}
              />
            </AreaChart>
          ) : (
            <BarChart data={chartData} margin={{ top: 8, right: 10, left: -12, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--chart-grid-stroke)"
                vertical={false}
              />
              <XAxis
                dataKey="dayShort"
                tick={{ fill: 'var(--chart-axis-tick)', fontSize: 9.5, fontWeight: 700 }}
                axisLine={{ stroke: 'var(--chart-axis-line)' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: 'var(--chart-axis-tick)', fontSize: 9 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(1)}t`}
              />
              <Tooltip content={renderCustomTooltip} />
              <Bar
                dataKey="prevVolumeKg"
                name="Poprzedni okres (kg)"
                fill="var(--chart-prev-bar)"
                radius={[5, 5, 0, 0]}
                barSize={period === '14d' ? 7 : 13}
              />
              <Bar
                dataKey="currentVolumeKg"
                name="Wybrany okres (kg)"
                fill="#10B981"
                radius={[5, 5, 0, 0]}
                barSize={period === '14d' ? 7 : 13}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Rozwijany panel szczegółowy po kliknięciu w wykres */}
      {expandedDetails && (
        <div
          style={{
            marginTop: 10,
            padding: 10,
            borderRadius: 12,
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 8,
              fontSize: 11,
              fontWeight: 800,
            }}
          >
            <span>Zestawienie punktów w okresie ({activePeriodMeta.label})</span>
            <span style={{ color: 'var(--accent-mint)', fontSize: 10 }}>
              Szczyt: {peakDayLabel}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, maxHeight: 165, overflowY: 'auto' }}>
            {chartData.map((item) => (
              <div
                key={item.dayShort}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '5px 8px',
                  borderRadius: 8,
                  background: 'var(--bg-card)',
                  fontSize: 11,
                }}
              >
                <div>
                  <span style={{ fontWeight: 800 }}>{item.dayFull}</span>
                  {item.sessionFocus && (
                    <span style={{ color: 'var(--text-secondary)', fontSize: 10, marginLeft: 6 }}>
                      · {item.sessionFocus}
                    </span>
                  )}
                </div>
                <div className="tabular-nums" style={{ display: 'flex', gap: 10, fontWeight: 700 }}>
                  <span style={{ color: '#FF6B35' }}>
                    {formatNumberPL(item.currentKcalBurned)} kcal
                  </span>
                  <span style={{ color: 'var(--accent-mint)' }}>
                    {formatNumberPL(item.currentVolumeKg)} kg
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Zwięzła stopka legendy */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 8,
          marginTop: 8,
          fontSize: 10,
          color: 'var(--text-secondary)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 2,
                background: '#3ED6A3',
                display: 'inline-block',
              }}
            />
            Objętość
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 99,
                background: '#FF6B35',
                display: 'inline-block',
              }}
            />
            Kalorie
          </span>
        </div>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            color: '#3ED6A3',
            fontWeight: 700,
          }}
        >
          <Calendar size={11} /> {peakDayLabel}
        </span>
      </div>
    </div>
  );
};
