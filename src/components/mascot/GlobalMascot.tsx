import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Hand, Eye, Sparkles } from 'lucide-react';
import { GlobalMascotVariant, MascotMood } from '../../types/sportmate';

interface GlobalMascotProps {
  variant?: GlobalMascotVariant;
  mood?: MascotMood;
  size?: number;
  floating?: boolean;
  hasNotification?: boolean;
  forceWaveKey?: number;
  forceBlinkKey?: number;
  onInteract?: () => void;
}

/**
 * Maskotka SportMate — Ryś:
 * - Bez tła kołowego (wolnostojący, powiększony kadr wypełniający viewBox)
 * - Logo SportMate na piersi w barwach biało-miętowych (#FFFFFF + #3ED6A3)
 * - Realistyczna anatomia rysia z cieniowaniem futra, bokobrodami i płynnymi animacjami Framer Motion
 */
export const GlobalMascot: React.FC<GlobalMascotProps> = ({
  mood = 'happy',
  size = 110,
  floating = true,
  hasNotification = false,
  forceWaveKey = 0,
  forceBlinkKey = 0,
  onInteract,
}) => {
  const [isBlinking, setIsBlinking] = useState(false);
  const [isWaving, setIsWaving] = useState(false);
  const [earTwitch, setEarTwitch] = useState(false);

  const isHyped =
    mood === 'hyped' ||
    mood === 'fire' ||
    mood === 'cheer' ||
    mood === 'levelup';
  const isFocused = mood === 'focused' || mood === 'ready';

  // Naturalne mruganie powiekami co kilka sekund + strzyżenie uszami
  useEffect(() => {
    const blinkInterval = window.setInterval(() => {
      setIsBlinking(true);
      window.setTimeout(() => setIsBlinking(false), 165);
    }, 3600);

    const earInterval = window.setInterval(() => {
      setEarTwitch(true);
      window.setTimeout(() => setEarTwitch(false), 520);
    }, 4800);

    return () => {
      window.clearInterval(blinkInterval);
      window.clearInterval(earInterval);
    };
  }, []);

  // Wyzwolenie mrugnięcia na żądanie
  useEffect(() => {
    if (forceBlinkKey > 0) {
      setIsBlinking(true);
      const t = window.setTimeout(() => setIsBlinking(false), 240);
      return () => window.clearTimeout(t);
    }
  }, [forceBlinkKey]);

  // Wyzwolenie machania łapką na żądanie lub przy powiadomieniu
  useEffect(() => {
    if (forceWaveKey > 0 || hasNotification) {
      setIsWaving(true);
      const t = window.setTimeout(() => setIsWaving(false), 1850);
      return () => window.clearTimeout(t);
    }
  }, [forceWaveKey, hasNotification]);

  const handleMascotClick = () => {
    setIsWaving(true);
    setIsBlinking(true);
    window.setTimeout(() => setIsBlinking(false), 190);
    window.setTimeout(() => setIsWaving(false), 1700);
    if (onInteract) onInteract();
  };

  return (
    <motion.div
      style={{
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        flexShrink: 0,
        cursor: onInteract ? 'pointer' : 'default',
        userSelect: 'none',
      }}
      onClick={handleMascotClick}
      animate={
        floating
          ? {
              y: [0, -3.5, 0],
            }
          : undefined
      }
      transition={
        floating
          ? {
              duration: 3.4,
              repeat: Infinity,
              ease: 'easeInOut',
            }
          : undefined
      }
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
    >
      <svg
        viewBox="8 4 104 114"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Ryś SportMate"
        style={{ overflow: 'visible' }}
      >
        <defs>
          {/* Wielowarstwowe gradienty futra rysia */}
          <linearGradient id="lynxFurPrimary" x1="20" y1="15" x2="96" y2="105" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F2A96B" />
            <stop offset="48%" stopColor="#D9823B" />
            <stop offset="100%" stopColor="#A8581E" />
          </linearGradient>
          <linearGradient id="lynxFurForehead" x1="60" y1="22" x2="60" y2="68" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#E08A44" />
            <stop offset="100%" stopColor="#C46D29" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="lynxCreamCheeks" x1="60" y1="54" x2="60" y2="92" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFBF5" />
            <stop offset="100%" stopColor="#F5E1C8" />
          </linearGradient>
          <linearGradient id="lynxJerseyPro" x1="24" y1="80" x2="96" y2="116" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1B2234" />
            <stop offset="100%" stopColor="#0E121D" />
          </linearGradient>
          <radialGradient id="lynxEyeEmerald" cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#6EE7B7" />
            <stop offset="55%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#065F46" />
          </radialGradient>
          <radialGradient id="lynxSoftShadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Subtelny cień pod sylwetką (bez koła wokół rysia) */}
        <ellipse cx="60" cy="113" rx="34" ry="4.5" fill="url(#lynxSoftShadow)" />

        {/* ODDYCHAJĄCY KORPUS I KOSZULKA SPORTOWA */}
        <motion.g
          animate={{
            scaleY: [1, 1.018, 1],
            y: [0, -0.8, 0],
          }}
          transition={{
            duration: 2.8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{ transformOrigin: '60px 104px' }}
        >
          {/* Ramiona i koszulka treningowa */}
          <path
            d="M24 112C25 91 38 81 60 81C82 81 95 91 96 112C96 114.5 94 116 91 116H29C26 116 24 114.5 24 112Z"
            fill="url(#lynxJerseyPro)"
            stroke="#2B354F"
            strokeWidth="1.2"
          />

          {/* Sportowe pasy na ramionach (Miętowy + Biały) */}
          <path
            d="M29 97C34 89 42 84 50 83"
            stroke="#3ED6A3"
            strokeWidth="2.4"
            strokeLinecap="round"
            opacity="0.85"
          />
          <path
            d="M91 97C86 89 78 84 70 83"
            stroke="#FFFFFF"
            strokeWidth="2.4"
            strokeLinecap="round"
            opacity="0.65"
          />

          {/* Puszysty biało-kremowy kołnierz futra na szyi */}
          <path
            d="M44 80C49 85 54 87 60 87C66 87 71 85 76 80L72 91C64 94 56 94 48 91L44 80Z"
            fill="url(#lynxCreamCheeks)"
          />

          {/* Dekolt V-neck */}
          <path
            d="M46 82L60 92L74 82"
            stroke="#3ED6A3"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />

          {/* LOGO SPORTMATE NA PIERSI: BIAŁO-MIĘTOWE (#FFFFFF i #3ED6A3) */}
          <g transform="translate(0, 2)">
            <circle
              cx="56"
              cy="98"
              r="5.6"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              fill="none"
            />
            <circle
              cx="64"
              cy="98"
              r="5.6"
              stroke="#3ED6A3"
              strokeWidth="2.5"
              fill="none"
            />
          </g>

          {/* Lewa łapa spoczynkowa przy korpusie */}
          <path
            d="M24 106C21 101 22 94 27 92C31 91 34 95 34 101C34 106 30 111 26 111C24.5 111 24 109 24 106Z"
            fill="url(#lynxFurPrimary)"
            stroke="#7A3E12"
            strokeWidth="1.2"
          />
        </motion.g>

        {/* CAŁA GŁOWA RYSIA Z NATURALNYM PRZECHYŁEM I RUCHEM USZU */}
        <motion.g
          animate={
            isWaving
              ? { rotate: [0, -2.5, 2, -1.5, 0], y: [0, -1.5, 0] }
              : { rotate: [0, 1.1, 0, -1.1, 0], y: [0, -1, 0] }
          }
          transition={{
            duration: isWaving ? 1.5 : 4.6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{ transformOrigin: '60px 64px' }}
        >
          {/* LEWE UCHO Z PĘDZELKIEM */}
          <motion.g
            animate={
              earTwitch || isWaving
                ? { rotate: [0, -6, 3, -3, 0] }
                : { rotate: [0, -1.8, 0] }
            }
            transition={{ duration: earTwitch ? 0.45 : 3.2, repeat: earTwitch ? 0 : Infinity }}
            style={{ transformOrigin: '34px 36px' }}
          >
            <path
              d="M24 44L17 15L43 29Z"
              fill="url(#lynxFurPrimary)"
              stroke="#6E3710"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            <path d="M25 40L20 20L38 30Z" fill="#F7D6BA" opacity="0.9" />
            {/* Czarny pędzelek na czubku ucha */}
            <path
              d="M17 15C15 10 14 6 12 3C16 5 19 9 20 15Z"
              fill="#141722"
            />
          </motion.g>

          {/* PRAWE UCHO Z PĘDZELKIEM */}
          <motion.g
            animate={
              earTwitch || isWaving
                ? { rotate: [0, 7, -3, 4, 0] }
                : { rotate: [0, 1.8, 0] }
            }
            transition={{ duration: earTwitch ? 0.45 : 3.6, repeat: earTwitch ? 0 : Infinity }}
            style={{ transformOrigin: '86px 36px' }}
          >
            <path
              d="M96 44L103 15L77 29Z"
              fill="url(#lynxFurPrimary)"
              stroke="#6E3710"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            <path d="M95 40L100 20L82 30Z" fill="#F7D6BA" opacity="0.9" />
            {/* Czarny pędzelek na czubku ucha */}
            <path
              d="M103 15C105 10 106 6 108 3C104 5 101 9 100 15Z"
              fill="#141722"
            />
          </motion.g>

          {/* GŁÓWNY KSZTAŁT GŁOWY Z CHARAKTERYSTYCZNYMI BOKOBRODAMI (RUFF) */}
          <path
            d="M24 54C24 34 39 24 60 24C81 24 96 34 96 54C102 60 105 69 98 77C93 80 90 84 83 84C76 88 68 90 60 90C52 90 44 88 37 84C30 84 27 80 22 77C15 69 18 60 24 54Z"
            fill="url(#lynxFurPrimary)"
            stroke="#6E3710"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />

          {/* Cieniowanie czoła i grzbietu nosa */}
          <path
            d="M42 26C48 24 72 24 78 26C75 42 71 54 60 58C49 54 45 42 42 26Z"
            fill="url(#lynxFurForehead)"
          />

          {/* Jasne kremowe bokobrody i policzki rysia */}
          <path
            d="M21 63C19 70 23 77 32 81C39 85 48 88 60 88C72 88 81 85 88 81C97 77 101 70 99 63C93 66 86 62 80 57C73 61 66 62 60 62C54 62 47 61 40 57C34 62 27 66 21 63Z"
            fill="url(#lynxCreamCheeks)"
          />

          {/* Charakterystyczne ciemne cętki i pręgi rysia euroazjatyckiego */}
          <circle cx="30" cy="49" r="1.9" fill="#4A250B" opacity="0.72" />
          <circle cx="26" cy="56" r="1.6" fill="#4A250B" opacity="0.65" />
          <circle cx="33" cy="57" r="1.5" fill="#4A250B" opacity="0.58" />
          <circle cx="90" cy="49" r="1.9" fill="#4A250B" opacity="0.72" />
          <circle cx="94" cy="56" r="1.6" fill="#4A250B" opacity="0.65" />
          <circle cx="87" cy="57" r="1.5" fill="#4A250B" opacity="0.58" />
          <path
            d="M55 28L54 36M60 26L60 35M65 28L66 36"
            stroke="#4A250B"
            strokeWidth="1.7"
            strokeLinecap="round"
            opacity="0.6"
          />
          {/* Subtelne pręgi na bokobrodach */}
          <path
            d="M24 70C27 72 31 72 34 71M96 70C93 72 89 72 86 71"
            stroke="#5C2E0E"
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity="0.55"
          />

          {/* Jasne łuki brwiowe nad oczami */}
          <path
            d="M36 45C40 41 47 41 51 44"
            stroke="#FFFDF9"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <path
            d="M84 45C80 41 73 41 69 44"
            stroke="#FFFDF9"
            strokeWidth="3.2"
            strokeLinecap="round"
          />

          {/* OCZY RYSIA Z REALISTYCZNĄ TĘCZÓWKĄ I PŁYNNYM MRUGANIEM */}
          <g>
            {isBlinking ? (
              <>
                <path
                  d="M37 52Q44 56 51 52"
                  stroke="#181A24"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M69 52Q76 56 83 52"
                  stroke="#181A24"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                />
              </>
            ) : (
              <>
                {/* Lewe oko */}
                <ellipse cx="44" cy="51.5" rx="6.8" ry="6.2" fill="#141824" />
                <ellipse cx="44" cy="51.8" rx="5.2" ry="4.8" fill="url(#lynxEyeEmerald)" />
                <ellipse cx="44" cy="51.8" rx="2.3" ry="3.6" fill="#0F131D" />
                <circle cx="41.8" cy="49.4" r="1.9" fill="#FFFFFF" />
                <circle cx="46.2" cy="53.6" r="0.9" fill="#FFFFFF" opacity="0.85" />

                {/* Prawe oko */}
                <ellipse cx="76" cy="51.5" rx="6.8" ry="6.2" fill="#141824" />
                <ellipse cx="76" cy="51.8" rx="5.2" ry="4.8" fill="url(#lynxEyeEmerald)" />
                <ellipse cx="76" cy="51.8" rx="2.3" ry="3.6" fill="#0F131D" />
                <circle cx="73.8" cy="49.4" r="1.9" fill="#FFFFFF" />
                <circle cx="78.2" cy="53.6" r="0.9" fill="#FFFFFF" opacity="0.85" />
              </>
            )}

            {isFocused && !isBlinking && (
              <>
                <path d="M36 44L52 47" stroke="#3A1D08" strokeWidth="2.4" strokeLinecap="round" />
                <path d="M84 44L68 47" stroke="#3A1D08" strokeWidth="2.4" strokeLinecap="round" />
              </>
            )}
          </g>

          {/* KUFA, NOS I UŚMIECH */}
          <ellipse cx="60" cy="65" rx="13.5" ry="9.5" fill="#FFFDF9" />
          {/* Nosek rysia */}
          <path
            d="M54.5 60C54.5 58.3 57 57.5 60 57.5C63 57.5 65.5 58.3 65.5 60C65.5 62.5 62.5 65 60 65C57.5 65 54.5 62.5 54.5 60Z"
            fill="#D96B52"
            stroke="#231F20"
            strokeWidth="1.4"
          />
          <ellipse cx="58.5" cy="59.3" rx="2" ry="0.9" fill="#F9B4A4" opacity="0.7" />

          {/* Pyszczek */}
          {isHyped || isWaving ? (
            <path
              d="M52 67.5Q60 75.5 68 67.5Z"
              fill="#D9534F"
              stroke="#231F20"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
          ) : (
            <path
              d="M60 65V68.5M60 68.5Q54.5 72.5 50.5 68.5M60 68.5Q65.5 72.5 69.5 68.5"
              stroke="#231F20"
              strokeWidth="2.1"
              strokeLinecap="round"
              fill="none"
            />
          )}

          {/* Wibrysy (wąsy) */}
          <g stroke="#FFFDF9" strokeWidth="1.35" strokeLinecap="round" opacity="0.9">
            <path d="M45 65L27 63" />
            <path d="M45 68L29 69" />
            <path d="M75 65L93 63" />
            <path d="M75 68L91 69" />
          </g>
        </motion.g>

        {/* ANIMOWANA ŁAPKA RYSIA (PŁYNNE MACHANIE Z OPUSZKAMI) */}
        <motion.g
          initial={{ rotate: 0, y: 0 }}
          animate={
            isWaving
              ? {
                  rotate: [0, -24, 14, -22, 12, -16, 0],
                  y: [0, -10, -8, -10, -8, -6, 0],
                  x: [0, 3, -2, 3, -1, 0],
                }
              : {
                  rotate: [0, -3, 0],
                  y: [0, -1.5, 0],
                }
          }
          transition={
            isWaving
              ? { duration: 1.45, ease: 'easeInOut' }
              : { duration: 3.2, repeat: Infinity, ease: 'easeInOut' }
          }
          style={{ transformOrigin: '92px 104px' }}
        >
          {/* Ramię i puszysta łapa */}
          <path
            d="M84 106C81 96 84 83 92 80C99 78 105 84 103 94C101 102 96 108 89 109Z"
            fill="url(#lynxFurPrimary)"
            stroke="#6E3710"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          {/* Kremowy spód łapy */}
          <ellipse cx="93.5" cy="90" rx="6.2" ry="7.2" transform="rotate(-12 93.5 90)" fill="#FFF8EE" />
          {/* Opuszki łapy (poduszeczki) */}
          <ellipse cx="93.5" cy="92.5" rx="3.1" ry="2.5" fill="#E07A68" />
          <circle cx="89.5" cy="87.2" r="1.45" fill="#E07A68" />
          <circle cx="93" cy="85.8" r="1.55" fill="#E07A68" />
          <circle cx="96.6" cy="86.8" r="1.45" fill="#E07A68" />
        </motion.g>
      </svg>

      {/* Subtelny znacznik nowego powiadomienia */}
      <AnimatePresence>
        {hasNotification && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            style={{
              position: 'absolute',
              top: 2,
              right: 2,
              background: 'linear-gradient(135deg, #FF6B35, #F59E0B)',
              color: '#0E0F14',
              borderRadius: 999,
              padding: '3px 7px',
              fontSize: 10,
              fontWeight: 900,
              display: 'flex',
              alignItems: 'center',
              gap: 3,
              boxShadow: '0 4px 12px rgba(255, 107, 53, 0.45)',
              border: '1.5px solid var(--bg-surface)',
            }}
          >
            <Bell size={10} strokeWidth={2.6} />
            <span>!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

interface InteractiveHomeLynxBannerProps {
  userName: string;
  readinessScore: number;
  streakDays: number;
  unreadNotificationsCount: number;
  latestNotificationText: string;
  onOpenNotifications: () => void;
  onOpenAICoach: () => void;
}

export const InteractiveHomeLynxBanner: React.FC<InteractiveHomeLynxBannerProps> = ({
  userName,
  readinessScore,
  streakDays,
  unreadNotificationsCount,
  latestNotificationText,
  onOpenNotifications,
  onOpenAICoach,
}) => {
  const [waveCounter, setWaveCounter] = useState(1);
  const [blinkCounter, setBlinkCounter] = useState(0);
  const [statusLine, setStatusLine] = useState<string>(
    unreadNotificationsCount > 0
      ? latestNotificationText
      : `Gotowość ${readinessScore}/100 · Seria ${streakDays} dni`
  );

  const firstName = userName.split(' ')[0] || 'Mikołaj';

  const triggerWave = () => {
    setWaveCounter((c) => c + 1);
    setStatusLine(`Cześć ${firstName}! Świetne tempo w tym tygodniu.`);
  };

  const triggerBlink = () => {
    setBlinkCounter((c) => c + 1);
    setStatusLine(`Gotowość ${readinessScore}/100 — idealny dzień na mocny trening.`);
  };

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      style={{
        background:
          'radial-gradient(circle at 12% 35%, rgba(62, 214, 163, 0.14), transparent 55%), linear-gradient(145deg, var(--bg-surface), var(--bg-elevated))',
        border:
          unreadNotificationsCount > 0
            ? '1px solid rgba(255, 107, 53, 0.4)'
            : '1px solid rgba(62, 214, 163, 0.28)',
        padding: '12px 14px',
        marginBottom: 12,
      }}
      data-testid="home-lynx-banner"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <GlobalMascot
          size={84}
          mood={unreadNotificationsCount > 0 ? 'cheer' : 'happy'}
          floating
          hasNotification={unreadNotificationsCount > 0}
          forceWaveKey={waveCounter}
          forceBlinkKey={blinkCounter}
          onInteract={triggerWave}
        />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 6,
              marginBottom: 3,
            }}
          >
            <span style={{ fontSize: 15, fontWeight: 800, letterSpacing: '-0.3px' }}>
              Cześć, {firstName}!
            </span>
            {unreadNotificationsCount > 0 && (
              <button
                type="button"
                onClick={onOpenNotifications}
                className="badge badge-strava"
                style={{
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 9.5,
                  padding: '2px 7px',
                }}
              >
                <Bell size={10} /> {unreadNotificationsCount}
              </button>
            )}
          </div>

          <AnimatePresence mode="wait">
            <motion.p
              key={statusLine}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              transition={{ duration: 0.18 }}
              style={{
                fontSize: 11.5,
                color: 'var(--text-secondary)',
                lineHeight: 1.35,
                marginBottom: 8,
              }}
            >
              {statusLine}
            </motion.p>
          </AnimatePresence>

          <div style={{ display: 'flex', gap: 5, flexWrap: 'nowrap' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{
                width: 'auto',
                padding: '4px 8px',
                fontSize: 10.5,
                borderRadius: 8,
              }}
              onClick={triggerWave}
              data-testid="lynx-wave-btn"
            >
              <Hand size={11} style={{ color: '#F59E0B' }} /> Pomachaj
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{
                width: 'auto',
                padding: '4px 8px',
                fontSize: 10.5,
                borderRadius: 8,
              }}
              onClick={triggerBlink}
              data-testid="lynx-blink-btn"
            >
              <Eye size={11} style={{ color: 'var(--accent-mint-bright)' }} /> Mrugnij
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{
                width: 'auto',
                padding: '4px 8px',
                fontSize: 10.5,
                borderRadius: 8,
              }}
              onClick={onOpenAICoach}
            >
              <Sparkles size={11} style={{ color: 'var(--accent-mint-bright)' }} /> Trener AI
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
