import React, { useState } from 'react';
import {
  MuscleAnatomyZoneId,
  MuscleGroupCategory,
  MuscleZoneProgress,
} from '../../types/sportmate';
import {
  getExerciseTargetZones,
  getMuscleRankInfo,
} from '../../utils/formatters';

interface MuscleAnatomyMapProps {
  mode?: 'full' | 'exercise-preview' | 'compact-card';
  zones?: MuscleZoneProgress[];
  selectedZoneId?: MuscleAnatomyZoneId | null;
  onSelectZone?: (zoneId: MuscleAnatomyZoneId) => void;
  exerciseName?: string;
  muscleLabel?: string;
  muscleGroup?: MuscleGroupCategory;
}

const ZONE_LABELS_SHORT: Record<MuscleAnatomyZoneId, string> = {
  traps: 'Kark / Czworoboczny',
  shoulders: 'Barki',
  chest: 'Klatka piersiowa',
  biceps: 'Biceps / Przedramię',
  abs: 'Brzuch i Skośne',
  quads: 'Czworogłowe uda',
  calves: 'Łydki',
  back: 'Najszerszy grzbietu',
  triceps: 'Triceps',
  lower_back: 'Prostowniki',
  glutes: 'Pośladki',
  hamstrings: 'Dwugłowe uda',
};

export const MuscleAnatomyMap: React.FC<MuscleAnatomyMapProps> = ({
  mode = 'full',
  zones = [],
  selectedZoneId = null,
  onSelectZone,
  exerciseName = '',
  muscleLabel = '',
  muscleGroup,
}) => {
  const [showReferenceAtlas, setShowReferenceAtlas] = useState(false);

  const exerciseTargets =
    mode === 'exercise-preview'
      ? getExerciseTargetZones(exerciseName, muscleLabel, muscleGroup)
      : { primary: [] as MuscleAnatomyZoneId[], secondary: [] as MuscleAnatomyZoneId[] };

  const getZoneStyle = (zoneId: MuscleAnatomyZoneId) => {
    if (mode === 'exercise-preview') {
      const isPrimary = exerciseTargets.primary.includes(zoneId);
      const isSecondary = exerciseTargets.secondary.includes(zoneId);
      if (isPrimary) {
        return {
          fill: '#FF5A36',
          fillOpacity: 0.95,
          stroke: '#FFD166',
          strokeWidth: 1.25,
        };
      }
      if (isSecondary) {
        return {
          fill: '#F59E0B',
          fillOpacity: 0.8,
          stroke: '#FDE68A',
          strokeWidth: 0.95,
        };
      }
      return {
        fill: '#334155',
        fillOpacity: 0.34,
        stroke: '#475569',
        strokeWidth: 0.65,
      };
    }

    const found = zones.find((z) => z.id === zoneId);
    const level = found ? found.level : 1;
    const rank = getMuscleRankInfo(level);
    const isSelected = selectedZoneId === zoneId;

    return {
      fill: rank.color,
      fillOpacity: isSelected ? 1 : rank.fillOpacity,
      stroke: isSelected ? '#FFFFFF' : rank.strokeColor,
      strokeWidth: isSelected ? 1.65 : 0.85,
    };
  };

  const handleZoneClick = (zoneId: MuscleAnatomyZoneId) => {
    if (onSelectZone) {
      onSelectZone(zoneId);
    }
  };

  const isCompact = mode === 'exercise-preview' || mode === 'compact-card';

  return (
    <div
      style={{
        width: '100%',
        borderRadius: isCompact ? '12px' : '16px',
        background: 'var(--chart-plot-bg)',
        border: '1px solid var(--chart-plot-border)',
        padding: isCompact ? '8px 10px' : '12px',
      }}
    >
      {/* Nagłówek widoku Przód / Tył */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: isCompact ? '4px' : '8px',
          gap: '6px',
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: isCompact ? '10px' : '11px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            color: 'var(--text-muted)',
          }}
        >
          <span>PRZÓD (ANTERIOR)</span>
          <span style={{ opacity: 0.4 }}>•</span>
          <span>TYŁ (POSTERIOR)</span>
        </div>

        {mode === 'full' && (
          <button
            type="button"
            onClick={() => setShowReferenceAtlas((prev) => !prev)}
            style={{
              background: showReferenceAtlas
                ? 'rgba(62, 214, 163, 0.16)'
                : 'rgba(148, 163, 184, 0.12)',
              color: showReferenceAtlas ? 'var(--accent-mint)' : 'var(--text-main)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '3px 8px',
              fontSize: '10px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {showReferenceAtlas ? 'Ukryj tablicę 1:1' : 'Tablica anatomii'}
          </button>
        )}
      </div>

      {/* Opcjonalny podgląd referencyjnej tablicy anatomicznej */}
      {mode === 'full' && showReferenceAtlas && (
        <div
          style={{
            marginBottom: '10px',
            padding: '8px',
            borderRadius: '12px',
            background: '#FFFFFF',
            border: '1px solid var(--border-subtle)',
            textAlign: 'center',
          }}
        >
          <img
            src="/assets/aistudio/istockphoto-1426397787-612x612_3f1d659c.jpg"
            alt="Anatomia mięśni człowieka - widok z przodu i z tyłu"
            style={{
              width: '100%',
              maxHeight: '210px',
              objectFit: 'contain',
              borderRadius: '8px',
              display: 'block',
              margin: '0 auto',
            }}
          />
        </div>
      )}

      {/* Interaktywny Diagram Anatomiczny SVG — organiczne obrysy włókien mięśniowych i ścięgien */}
      <svg
        viewBox="0 0 340 278"
        style={{
          width: '100%',
          height: isCompact ? '154px' : '266px',
          display: 'block',
          userSelect: 'none',
        }}
        role="img"
        aria-label="Mapa anatomiczna mięśni przód i tył"
      >
        <defs>
          <linearGradient id="anatomySkinBase" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#64748B" stopOpacity="0.28" />
            <stop offset="50%" stopColor="#475569" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#334155" stopOpacity="0.26" />
          </linearGradient>
          <linearGradient id="tendonFasciaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E2E8F0" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#94A3B8" stopOpacity="0.25" />
          </linearGradient>
        </defs>

        {/* Etykiety kolumn */}
        <text
          x="85"
          y="12"
          textAnchor="middle"
          fill="var(--text-muted)"
          fontSize="8.5"
          fontWeight="800"
          letterSpacing="0.8"
        >
          PRZÓD
        </text>
        <text
          x="255"
          y="12"
          textAnchor="middle"
          fill="var(--text-muted)"
          fontSize="8.5"
          fontWeight="800"
          letterSpacing="0.8"
        >
          TYŁ
        </text>

        {/* Linia podziału */}
        <line
          x1="170"
          y1="16"
          x2="170"
          y2="266"
          stroke="var(--chart-grid-stroke)"
          strokeDasharray="3 3"
          strokeWidth="1"
        />

        {/* ============================================================
            SYLWETKA 1: WIDOK Z PRZODU (centrum X = 85)
            Organiczna sylwetka anatomiczna z wyraźnymi brzuścami i powięziami
           ============================================================ */}
        <g>
          {/* Podkład sylwetki ciała (głowa, szyja, dłonie, kolana, kostki, stopy) */}
          <path
            d="M85 16
               C78 16 74 21 74 28
               C74 34 76 39 79 42
               C79 45 78 47 75 49
               C68 51 58 52 52 57
               C47 62 46 70 47 77
               C45 85 45 94 46 101
               C43 111 40 122 39 131
               C36 134 34 139 36 143
               C38 145 42 143 44 139
               C46 135 48 128 52 119
               C55 110 58 99 60 88
               C61 81 62 76 63 73
               C63 86 64 99 66 111
               C64 119 61 131 61 146
               C61 161 64 176 67 187
               C67 192 67 197 66 202
               C62 213 63 227 68 244
               C67 248 64 253 62 256
               C62 258 68 259 75 258
               C77 256 77 250 76 244
               C79 229 80 214 78 201
               C78 195 79 190 80 185
               C82 169 83 148 84 131
               L86 131
               C87 148 88 169 90 185
               C91 190 92 195 92 201
               C90 214 91 229 94 244
               C93 250 93 256 95 258
               C102 259 108 258 108 256
               C106 253 103 248 102 244
               C107 227 108 213 104 202
               C103 197 103 192 103 187
               C106 176 109 161 109 146
               C109 131 106 119 104 111
               C106 99 107 86 107 73
               C108 76 109 81 110 88
               C112 99 115 110 118 119
               C122 128 124 135 126 139
               C128 143 132 145 134 143
               C136 139 134 134 131 131
               C130 122 127 111 124 101
               C125 94 125 85 123 77
               C124 70 123 62 118 57
               C112 52 102 51 95 49
               C92 47 91 45 91 42
               C94 39 96 34 96 28
               C96 21 92 16 85 16 Z"
            fill="url(#anatomySkinBase)"
            stroke="#64748B"
            strokeWidth="0.85"
          />

          {/* Rysy głowy, obojczyków i rzepek kolanowych (powięzie referencyjne) */}
          <path
            d="M79 26 Q85 28 91 26 M81 36 Q85 38 89 36 M75 53 Q81 55 85 54 Q89 55 95 53"
            stroke="rgba(226,232,240,0.38)"
            strokeWidth="0.7"
            fill="none"
          />
          <path
            d="M69 189 C69 185 76 185 76 189 C76 194 69 194 69 189 Z M94 189 C94 185 101 185 101 189 C101 194 94 194 94 189 Z"
            fill="url(#tendonFasciaGrad)"
            stroke="rgba(226,232,240,0.35)"
            strokeWidth="0.6"
          />

          {/* 1. KARK / MOSTKOWO-OBOJCZYKOWO-SUTKOWY I CZWOROBOCZNY PRZÓD (traps) */}
          <g
            onClick={() => handleZoneClick('traps')}
            style={{ cursor: onSelectZone ? 'pointer' : 'default' }}
          >
            <title>Kark i Mięsień Czworoboczny (Trapezius & Sternocleidomastoideus)</title>
            <path
              d="M79 42 C78 46 71 50 63 53 C68 55 75 55 81 52 C82 48 81 44 79 42 Z"
              {...getZoneStyle('traps')}
            />
            <path
              d="M91 42 C92 46 99 50 107 53 C102 55 95 55 89 52 C88 48 89 44 91 42 Z"
              {...getZoneStyle('traps')}
            />
            <path
              d="M80 42 C81 47 83 51 84 54 L86 54 C87 51 89 47 90 42"
              stroke="rgba(255,255,255,0.32)"
              strokeWidth="0.6"
              fill="none"
            />
          </g>

          {/* 2. BARKI PRZÓD / BOK (shoulders - M. Deltoideus) */}
          <g
            onClick={() => handleZoneClick('shoulders')}
            style={{ cursor: onSelectZone ? 'pointer' : 'default' }}
          >
            <title>Barki — Mięsień Naramienny (Deltoideus)</title>
            {/* Prawy bark anatomiczny (lewa strona ekranu) */}
            <path
              d="M64 53 C55 54 48 60 47 69 C46 74 48 78 51 79 C55 77 60 72 63 65 C65 60 65 56 64 53 Z"
              {...getZoneStyle('shoulders')}
            />
            {/* Lewy bark anatomiczny (prawa strona ekranu) */}
            <path
              d="M106 53 C115 54 122 60 123 69 C124 74 122 78 119 79 C115 77 110 72 107 65 C105 60 105 56 106 53 Z"
              {...getZoneStyle('shoulders')}
            />
            {/* Włókna naramienne */}
            <path
              d="M58 56 C52 61 50 68 50 75 M61 58 C56 63 54 69 54 75 M112 56 C118 61 120 68 120 75 M109 58 C114 63 116 69 116 75"
              stroke="rgba(255,255,255,0.28)"
              strokeWidth="0.55"
              fill="none"
            />
          </g>

          {/* 3. KLATKA PIERSIOWA (chest - M. Pectoralis Major) */}
          <g
            onClick={() => handleZoneClick('chest')}
            style={{ cursor: onSelectZone ? 'pointer' : 'default' }}
          >
            <title>Klatka piersiowa (Pectoralis Major)</title>
            {/* Prawy brzusiec piersiowy */}
            <path
              d="M64 55 C70 54 78 54 84 55 L84 77 C79 80 71 80 65 76 C62 73 61 66 64 55 Z"
              {...getZoneStyle('chest')}
            />
            {/* Lewy brzusiec piersiowy */}
            <path
              d="M106 55 C100 54 92 54 86 55 L86 77 C91 80 99 80 105 76 C108 73 109 66 106 55 Z"
              {...getZoneStyle('chest')}
            />
            {/* Wachlarzowate włókna mięśnia piersiowego większego */}
            <path
              d="M64 62 Q74 64 83 61 M63 68 Q73 71 83 68 M66 74 Q75 76 83 74 M106 62 Q96 64 87 61 M107 68 Q97 71 87 68 M104 74 Q95 76 87 74"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="0.55"
              fill="none"
            />
          </g>

          {/* 4. BICEPS, RAMIENNY I PRZEDRAMIONA (biceps - M. Biceps Brachii & Brachioradialis) */}
          <g
            onClick={() => handleZoneClick('biceps')}
            style={{ cursor: onSelectZone ? 'pointer' : 'default' }}
          >
            <title>Biceps i Przedramiona (Biceps Brachii & Forearm Flexors)</title>
            {/* Wrzecionowaty brzusiec bicepsa lewy i prawy */}
            <path
              d="M50 77 C46 84 46 93 49 100 C53 102 58 97 60 89 C62 82 58 76 50 77 Z"
              {...getZoneStyle('biceps')}
            />
            <path
              d="M120 77 C124 84 124 93 121 100 C117 102 112 97 110 89 C108 82 112 76 120 77 Z"
              {...getZoneStyle('biceps')}
            />
            {/* Mięsień ramienno-promieniowy i zginacze przedramienia */}
            <path
              d="M47 101 C43 109 40 120 40 130 C42 132 45 131 47 128 C51 121 55 111 56 102 C53 100 50 100 47 101 Z"
              {...getZoneStyle('biceps')}
            />
            <path
              d="M123 101 C127 109 130 120 130 130 C128 132 125 131 123 128 C119 121 115 111 114 102 C117 100 120 100 123 101 Z"
              {...getZoneStyle('biceps')}
            />
            {/* Podział głów bicepsa */}
            <path
              d="M53 79 Q51 89 52 98 M117 79 Q119 89 118 98"
              stroke="rgba(255,255,255,0.28)"
              strokeWidth="0.55"
              fill="none"
            />
          </g>

          {/* 5. BRZUCH, ZĘBATY PRZEDNI I SKOŚNE (abs - M. Rectus Abdominis, Obliquus & Serratus) */}
          <g
            onClick={() => handleZoneClick('abs')}
            style={{ cursor: onSelectZone ? 'pointer' : 'default' }}
          >
            <title>Brzuch, Zębaty Przedni i Skośne (Rectus Abdominis & Obliques)</title>
            {/* Mięśnie skośne zewnętrzne i zębate boczne */}
            <path
              d="M64 77 C63 88 64 101 66 113 C68 119 71 124 74 126 C73 111 73 94 74 79 C70 79 67 78 64 77 Z"
              {...getZoneStyle('abs')}
            />
            <path
              d="M106 77 C107 88 106 101 104 113 C102 119 99 124 96 126 C97 111 97 94 96 79 C100 79 103 78 106 77 Z"
              {...getZoneStyle('abs')}
            />
            {/* Organiczne segmenty mięśnia prostego brzucha (bez prostokątów!) */}
            {/* Górna para */}
            <path
              d="M75 79 C78 78 82 78 84 79 L84 88 C81 89 77 89 75 87 Z M95 79 C92 78 88 78 86 79 L86 88 C89 89 93 89 95 87 Z"
              {...getZoneStyle('abs')}
            />
            {/* Środkowa-górna para */}
            <path
              d="M75 90 C78 89 82 89 84 90 L84 99 C81 100 77 100 75 98 Z M95 90 C92 89 88 89 86 90 L86 99 C89 100 93 100 95 98 Z"
              {...getZoneStyle('abs')}
            />
            {/* Środkowa-dolna para */}
            <path
              d="M75 101 C78 100 82 100 84 101 L84 110 C81 111 77 111 76 109 Z M95 101 C92 100 88 100 86 101 L86 110 C89 111 93 111 94 109 Z"
              {...getZoneStyle('abs')}
            />
            {/* Dolny segment podbrzusza (piramidowy) */}
            <path
              d="M76 112 L84 112 L84 127 C80 126 77 121 76 112 Z M94 112 L86 112 L86 127 C90 126 93 121 94 112 Z"
              {...getZoneStyle('abs')}
            />
            {/* Włókna zębatego przedniego i skośnych */}
            <path
              d="M65 82 L72 86 M65 89 L72 93 M66 96 L72 100 M105 82 L98 86 M105 89 L98 93 M104 96 L98 100"
              stroke="rgba(255,255,255,0.32)"
              strokeWidth="0.55"
              fill="none"
            />
          </g>

          {/* 6. CZWOROGŁOWE UDA I KRAWIECKI (quads - M. Quadriceps Femoris & Sartorius) */}
          <g
            onClick={() => handleZoneClick('quads')}
            style={{ cursor: onSelectZone ? 'pointer' : 'default' }}
          >
            <title>Mięśnie Czworogłowe Uda (Rectus Femoris, Vastus Lateralis & Medialis)</title>
            {/* Prawe udo (lewa strona ekranu) — głowa boczna, prosta i przyśrodkowa VMO („łezka”) */}
            <path
              d="M66 116 C61 131 60 151 64 172 C65 178 67 183 69 185 C72 183 75 184 79 185 C82 178 83 166 83 152 C83 141 83 132 82 128 C76 126 70 122 66 116 Z"
              {...getZoneStyle('quads')}
            />
            {/* Lewe udo (prawa strona ekranu) */}
            <path
              d="M104 116 C109 131 110 151 106 172 C105 178 103 183 101 185 C98 183 95 184 91 185 C88 178 87 166 87 152 C87 141 87 132 88 128 C94 126 100 122 104 116 Z"
              {...getZoneStyle('quads')}
            />
            {/* Anatomiczna separacja głów czworogłowego (Rectus Femoris, VMO i Sartorius) */}
            <path
              d="M68 122 C73 140 77 158 80 176 M73 128 C71 148 71 167 73 183 M78 164 C76 171 76 179 79 183
                 M102 122 C97 140 93 158 90 176 M97 128 C99 148 99 167 97 183 M92 164 C94 171 94 179 91 183"
              stroke="rgba(255,255,255,0.34)"
              strokeWidth="0.65"
              fill="none"
            />
          </g>

          {/* 7. ŁYDKI PRZÓD — PISZCZELOWY PRZEDNI I BRZUCHATY (calves - M. Tibialis Anterior & Gastrocnemius) */}
          <g
            onClick={() => handleZoneClick('calves')}
            style={{ cursor: onSelectZone ? 'pointer' : 'default' }}
          >
            <title>Podudzie i Łydki (Tibialis Anterior & Gastrocnemius)</title>
            {/* Lewe podudzie ekranowe */}
            <path
              d="M67 197 C62 209 62 224 68 242 L75 242 C79 227 80 211 77 197 C74 196 70 196 67 197 Z"
              {...getZoneStyle('calves')}
            />
            {/* Prawe podudzie ekranowe */}
            <path
              d="M103 197 C108 209 108 224 102 242 L95 242 C91 227 90 211 93 197 C96 196 100 196 103 197 Z"
              {...getZoneStyle('calves')}
            />
            {/* Linia kości piszczelowej i mięśnia piszczelowego */}
            <path
              d="M72 199 C70 213 71 228 72 240 M98 199 C100 213 99 228 98 240"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="0.6"
              fill="none"
            />
          </g>
        </g>

        {/* ============================================================
            SYLWETKA 2: WIDOK Z TYŁU (centrum X = 255)
            Organiczna sylwetka tylnej taśmy anatomicznej
           ============================================================ */}
        <g>
          {/* Podkład sylwetki ciała z tyłu */}
          <path
            d="M255 16
               C248 16 244 21 244 28
               C244 34 246 39 249 42
               C249 45 248 47 245 49
               C238 51 228 52 222 57
               C217 62 216 70 217 77
               C215 85 215 94 216 101
               C213 111 210 122 209 131
               C206 134 204 139 206 143
               C208 145 212 143 214 139
               C216 135 218 128 222 119
               C225 110 228 99 230 88
               C231 81 232 76 233 73
               C233 86 234 99 236 111
               C234 119 231 131 231 146
               C231 161 234 176 237 187
               C237 192 237 197 236 202
               C232 213 233 227 238 244
               C237 248 234 253 232 256
               C232 258 238 259 245 258
               C247 256 247 250 246 244
               C249 229 250 214 248 201
               C248 195 249 190 250 185
               C252 169 253 154 254 146
               L256 146
               C257 154 258 169 260 185
               C261 190 262 195 262 201
               C260 214 261 229 264 244
               C263 250 263 256 265 258
               C272 259 278 258 278 256
               C276 253 273 248 272 244
               C277 227 278 213 274 202
               C273 197 273 192 273 187
               C276 176 279 161 279 146
               C279 131 276 119 274 111
               C276 99 277 86 277 73
               C278 76 279 81 280 88
               C282 99 285 110 288 119
               C292 128 294 135 296 139
               C298 143 302 145 304 143
               C306 139 304 134 301 131
               C300 122 297 111 294 101
               C295 94 295 85 293 77
               C294 70 293 62 288 57
               C282 52 272 51 265 49
               C262 47 261 45 261 42
               C264 39 266 34 266 28
               C266 21 262 16 255 16 Z"
            fill="url(#anatomySkinBase)"
            stroke="#64748B"
            strokeWidth="0.85"
          />

          {/* 1. CZWOROBOCZNY GRZBIETU (traps - M. Trapezius) */}
          <g
            onClick={() => handleZoneClick('traps')}
            style={{ cursor: onSelectZone ? 'pointer' : 'default' }}
          >
            <title>Mięsień Czworoboczny Grzbietu (Upper, Middle & Lower Trapezius)</title>
            {/* Kaptur w kształcie anatomicznego rombu / latawca schodzącego wzdłuż kręgosłupa piersiowego */}
            <path
              d="M249 40 C246 46 239 50 232 53 C239 58 246 71 255 88 C264 71 271 58 278 53 C271 50 264 46 261 40 C257 41 253 41 249 40 Z"
              {...getZoneStyle('traps')}
            />
            {/* Włókna czworobocznego i bruzda kręgosłupa */}
            <path
              d="M255 41 L255 86 M240 54 Q248 58 254 62 M270 54 Q262 58 256 62 M244 63 Q250 67 254 72 M266 63 Q260 67 256 72"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="0.55"
              fill="none"
            />
          </g>

          {/* 2. TYLNY AKTON BARKÓW I PODGRZEBIENIOWY (shoulders - Posterior Deltoid) */}
          <g
            onClick={() => handleZoneClick('shoulders')}
            style={{ cursor: onSelectZone ? 'pointer' : 'default' }}
          >
            <title>Tylny Akton Barków (Posterior Deltoid & Infraspinatus)</title>
            <path
              d="M233 53 C224 54 218 60 217 69 C217 74 219 77 222 78 C227 76 232 70 235 63 C236 59 235 55 233 53 Z"
              {...getZoneStyle('shoulders')}
            />
            <path
              d="M277 53 C286 54 292 60 293 69 C293 74 291 77 288 78 C283 76 278 70 275 63 C274 59 275 55 277 53 Z"
              {...getZoneStyle('shoulders')}
            />
            <path
              d="M229 57 C224 62 221 68 221 74 M281 57 C286 62 289 68 289 74"
              stroke="rgba(255,255,255,0.28)"
              strokeWidth="0.55"
              fill="none"
            />
          </g>

          {/* 3. PLECY — NAJSZERSZY GRZBIETU I OBŁY WIĘKSZY (back - M. Latissimus Dorsi & Teres Major) */}
          <g
            onClick={() => handleZoneClick('back')}
            style={{ cursor: onSelectZone ? 'pointer' : 'default' }}
          >
            <title>Plecy — Najszerszy Grzbietu i Obły Większy (Latissimus Dorsi)</title>
            {/* Lewy płat najszerszego grzbietu (V-taper) */}
            <path
              d="M235 62 C240 65 246 75 253 88 L253 108 C246 104 239 99 236 93 C233 83 232 71 235 62 Z"
              {...getZoneStyle('back')}
            />
            {/* Prawy płat najszerszego grzbietu (V-taper) */}
            <path
              d="M275 62 C270 65 264 75 257 88 L257 108 C264 104 271 99 274 93 C277 83 278 71 275 62 Z"
              {...getZoneStyle('back')}
            />
            {/* Skośne włókna mięśnia najszerszego i obłego */}
            <path
              d="M235 70 Q244 77 252 86 M235 79 Q244 86 252 95 M237 88 Q245 94 252 102
                 M275 70 Q266 77 258 86 M275 79 Q266 86 258 95 M273 88 Q265 94 258 102"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="0.55"
              fill="none"
            />
          </g>

          {/* 4. TRICEPS I PROSTOWNIKI PRZEDRAMIENIA (triceps - M. Triceps Brachii) */}
          <g
            onClick={() => handleZoneClick('triceps')}
            style={{ cursor: onSelectZone ? 'pointer' : 'default' }}
          >
            <title>Triceps — Mięsień Trójgłowy Ramienia (Głowa Długa i Boczna)</title>
            {/* Charakterystyczna podkowa tricepsa (lewa i prawa) */}
            <path
              d="M221 76 C216 83 216 93 219 101 C223 102 228 97 230 89 C232 81 228 75 221 76 Z"
              {...getZoneStyle('triceps')}
            />
            <path
              d="M289 76 C294 83 294 93 291 101 C287 102 282 97 280 89 C278 81 282 75 289 76 Z"
              {...getZoneStyle('triceps')}
            />
            {/* Przedramię tył */}
            <path
              d="M217 102 C213 110 210 120 210 130 C212 132 215 131 217 128 C221 121 225 111 226 102 C223 100 220 100 217 102 Z"
              {...getZoneStyle('triceps')}
            />
            <path
              d="M293 102 C297 110 300 120 300 130 C298 132 295 131 293 128 C289 121 285 111 284 102 C287 100 290 100 293 102 Z"
              {...getZoneStyle('triceps')}
            />
            {/* Ścięgno podkowy tricepsa */}
            <path
              d="M220 80 C223 85 224 91 222 98 M290 80 C287 85 286 91 288 98"
              stroke="rgba(255,255,255,0.34)"
              strokeWidth="0.6"
              fill="none"
            />
          </g>

          {/* 5. PROSTOWNIKI GRZBIETU I POWIĘŹ PIERSIOWO-LĘDŹWIOWA (lower_back - Erector Spinae) */}
          <g
            onClick={() => handleZoneClick('lower_back')}
            style={{ cursor: onSelectZone ? 'pointer' : 'default' }}
          >
            <title>Prostowniki Grzbietu i Odcinek Lędźwiowy (Erector Spinae)</title>
            <path
              d="M237 95 C242 100 248 104 254 108 L254 126 C247 124 240 120 236 114 C236 107 236 101 237 95 Z"
              {...getZoneStyle('lower_back')}
            />
            <path
              d="M273 95 C268 100 262 104 256 108 L256 126 C263 124 270 120 274 114 C274 107 274 101 273 95 Z"
              {...getZoneStyle('lower_back')}
            />
            <path
              d="M246 103 L246 122 M264 103 L264 122"
              stroke="rgba(255,255,255,0.28)"
              strokeWidth="0.6"
              fill="none"
            />
          </g>

          {/* 6. POŚLADKI — POŚLADKOWY WIELKI I ŚREDNI (glutes - M. Gluteus Maximus & Medius) */}
          <g
            onClick={() => handleZoneClick('glutes')}
            style={{ cursor: onSelectZone ? 'pointer' : 'default' }}
          >
            <title>Mięśnie Pośladkowe (Gluteus Maximus & Medius)</title>
            {/* Lewy pośladek — anatomiczny półksiężyc z pośladkowym średnim u góry */}
            <path
              d="M236 116 C242 120 249 123 254 126 L254 149 C246 153 236 149 233 140 C231 132 232 123 236 116 Z"
              {...getZoneStyle('glutes')}
            />
            {/* Prawy pośladek */}
            <path
              d="M274 116 C268 120 261 123 256 126 L256 149 C264 153 274 149 277 140 C279 132 278 123 274 116 Z"
              {...getZoneStyle('glutes')}
            />
            {/* Skośne włókna pośladkowe */}
            <path
              d="M235 126 Q244 130 253 135 M234 135 Q243 139 253 143 M275 126 Q266 130 257 135 M276 135 Q267 139 257 143"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="0.55"
              fill="none"
            />
          </g>

          {/* 7. DWUGŁOWE UDA I PÓŁŚCIĘGNISTY (hamstrings - M. Biceps Femoris & Semitendinosus) */}
          <g
            onClick={() => handleZoneClick('hamstrings')}
            style={{ cursor: onSelectZone ? 'pointer' : 'default' }}
          >
            <title>Grupa Kulszowo-Goleniowa / Dwugłowe Uda (Biceps Femoris & Semitendinosus)</title>
            {/* Lewe udo tył — dwa wyraźne brzuśce rozchodzące się nad dołem podkolanowym */}
            <path
              d="M234 147 C240 151 248 152 253 149 C253 163 252 178 249 190 C245 188 241 188 237 190 C233 177 232 161 234 147 Z"
              {...getZoneStyle('hamstrings')}
            />
            {/* Prawe udo tył */}
            <path
              d="M276 147 C270 151 262 152 257 149 C257 163 258 178 261 190 C265 188 269 188 273 190 C277 177 278 161 276 147 Z"
              {...getZoneStyle('hamstrings')}
            />
            {/* Podział na głowę długą dwugłowego (boczną) i półścięgnisty (przyśrodkowy) */}
            <path
              d="M244 151 C243 164 243 177 243 188 M266 151 C267 164 267 177 267 188"
              stroke="rgba(255,255,255,0.35)"
              strokeWidth="0.65"
              fill="none"
            />
          </g>

          {/* 8. ŁYDKI TYŁ — DWUGŁOWY BRZUCHATY ŁYDKI I PŁASZCZKOWATY (calves - M. Gastrocnemius & Soleus) */}
          <g
            onClick={() => handleZoneClick('calves')}
            style={{ cursor: onSelectZone ? 'pointer' : 'default' }}
          >
            <title>Mięsień Brzuchaty Łydki i Płaszczkowaty (Gastrocnemius & Soleus)</title>
            {/* Lewa łydka z wyraźną głową przyśrodkową i boczną przechodzącą w ścięgno Achillesa */}
            <path
              d="M236 196 C231 207 231 221 236 234 C237 238 238 241 238 243 L245 243 C246 240 247 237 248 233 C251 220 251 207 248 196 C244 194 240 194 236 196 Z"
              {...getZoneStyle('calves')}
            />
            {/* Prawa łydka */}
            <path
              d="M274 196 C279 207 279 221 274 234 C273 238 272 241 272 243 L265 243 C264 240 263 237 262 233 C259 220 259 207 262 196 C266 194 270 194 274 196 Z"
              {...getZoneStyle('calves')}
            />
            {/* Wcięcie między głowami brzuchatego łydki i ścięgno Achillesa */}
            <path
              d="M242 196 L242 222 M237 220 Q242 225 247 220 M268 196 L268 222 M263 220 Q268 225 273 220"
              stroke="rgba(255,255,255,0.36)"
              strokeWidth="0.65"
              fill="none"
            />
          </g>
        </g>

        {/* Etykiety anatomiczne Callout w trybie pełnym */}
        {mode === 'full' && (
          <g fontSize="7.5" fontWeight="700" fill="var(--text-muted)">
            <text x="6" y="64">Barki</text>
            <line x1="29" y1="62" x2="48" y2="62" stroke="#64748B" strokeWidth="0.6" />

            <text x="6" y="76">Klatka</text>
            <line x1="33" y1="74" x2="64" y2="68" stroke="#64748B" strokeWidth="0.6" />

            <text x="6" y="92">Biceps</text>
            <line x1="33" y1="90" x2="48" y2="88" stroke="#64748B" strokeWidth="0.6" />

            <text x="6" y="108">Brzuch</text>
            <line x1="35" y1="106" x2="74" y2="100" stroke="#64748B" strokeWidth="0.6" />

            <text x="6" y="156">Czworogłowe</text>
            <line x1="56" y1="154" x2="65" y2="154" stroke="#64748B" strokeWidth="0.6" />

            <text x="298" y="54">Kaptury</text>
            <line x1="276" y1="53" x2="295" y2="53" stroke="#64748B" strokeWidth="0.6" />

            <text x="298" y="84">Najszerszy</text>
            <line x1="275" y1="82" x2="295" y2="82" stroke="#64748B" strokeWidth="0.6" />

            <text x="298" y="98">Triceps</text>
            <line x1="291" y1="92" x2="296" y2="96" stroke="#64748B" strokeWidth="0.6" />

            <text x="298" y="138">Pośladki</text>
            <line x1="276" y1="136" x2="295" y2="136" stroke="#64748B" strokeWidth="0.6" />

            <text x="298" y="172">Dwugłowe</text>
            <line x1="275" y1="170" x2="295" y2="170" stroke="#64748B" strokeWidth="0.6" />

            <text x="298" y="218">Łydki</text>
            <line x1="277" y1="216" x2="295" y2="216" stroke="#64748B" strokeWidth="0.6" />
          </g>
        )}
      </svg>

      {/* Legenda Rangi (Unranked / Bronze / Silver / Gold / Emerald / Master) lub podgląd ćwiczenia */}
      {mode === 'exercise-preview' ? (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px',
            marginTop: '6px',
            paddingTop: '6px',
            borderTop: '1px solid var(--border-subtle)',
            fontSize: '10px',
          }}
        >
          {exerciseTargets.primary.map((zId) => (
            <span
              key={`prim-${zId}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 7px',
                borderRadius: '6px',
                background: 'rgba(255, 90, 54, 0.16)',
                color: '#FF6B35',
                fontWeight: 800,
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#FF5A36',
                }}
              />
              Główny: {ZONE_LABELS_SHORT[zId]}
            </span>
          ))}
          {exerciseTargets.secondary.map((zId) => (
            <span
              key={`sec-${zId}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 7px',
                borderRadius: '6px',
                background: 'rgba(245, 158, 11, 0.14)',
                color: '#F59E0B',
                fontWeight: 700,
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#F59E0B',
                }}
              />
              Pomocniczy: {ZONE_LABELS_SHORT[zId]}
            </span>
          ))}
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            gap: '6px',
            marginTop: '8px',
            paddingTop: '8px',
            borderTop: '1px solid var(--border-subtle)',
            fontSize: '9.5px',
            fontWeight: 800,
            color: 'var(--text-muted)',
          }}
        >
          {[
            { label: 'Unranked', color: '#64748B' },
            { label: 'Bronze', color: '#CD7F32' },
            { label: 'Silver', color: '#94A3B8' },
            { label: 'Gold', color: '#F59E0B' },
            { label: 'Emerald', color: '#3ED6A3' },
            { label: 'Master', color: '#FF6B35' },
          ].map((item) => (
            <span
              key={item.label}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: item.color,
                  display: 'inline-block',
                }}
              />
              {item.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
