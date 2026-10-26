import React, { useEffect, useRef, useState } from 'react';
import {
  Calendar,
  Camera,
  Check,
  Edit3,
  Lock,
  MessageCircle,
  Pin,
  Send,
  Sparkles,
  Trash2,
  Trophy,
  Users,
  X,
  Zap,
} from 'lucide-react';
import {
  ActivitySubTab,
  AppNotificationItem,
  BadgeItem,
  ChatMessage,
  DiscoverSubTab,
  GlobalMascotVariant,
  IntegrationItem,
  PartnerProfile,
  ProfileSubTab,
  ScreenName,
  StravaAthleteProfile,
  ThemeMode,
  UserProfile,
  WeeklyComparisonDay,
} from '../../types/sportmate';
import { INITIAL_BADGES, INITIAL_NOTIFICATIONS } from '../../data/initialData';
import {
  formatDecimalPL,
  formatNumberPL,
  getExpTargetForLevel,
  getUserRankInfo,
} from '../../utils/formatters';
import { HumanAvatar } from '../avatar/HumanAvatar';
import { HexBadge } from '../common/VisualWidgets';
import { WeeklyProgressChart } from '../common/WeeklyProgressChart';
import { GlobalMascot } from '../mascot/GlobalMascot';

interface AIScreenProps {
  user: UserProfile;
  mascotVariant?: GlobalMascotVariant;
  currentBenchWeight: number;
  aiProgressionApplied: boolean;
  aiMessages: ChatMessage[];
  isAiThinking?: boolean;
  onToggleMascotVariant?: () => void;
  onApplyAIProgression: () => void;
  onAskAIPrompt: (promptText: string) => void;
}

export const AIScreen: React.FC<AIScreenProps> = ({
  user,
  currentBenchWeight,
  aiProgressionApplied,
  aiMessages,
  isAiThinking = false,
  onToggleMascotVariant,
  onApplyAIProgression,
  onAskAIPrompt,
}) => {
  const [inputVal, setInputVal] = useState('');
  const chatBoxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [aiMessages, isAiThinking]);

  const handleSend = () => {
    if (!inputVal.trim()) return;
    onAskAIPrompt(inputVal.trim());
    setInputVal('');
  };

  return (
    <div>
      {/* Kompaktowy nagłówek z Rysiem bez kółka */}
      <div
        className="card"
        style={{
          background:
            'radial-gradient(circle at 85% 20%, rgba(217,138,78,0.16), transparent 55%), linear-gradient(145deg, var(--bg-surface), var(--bg-elevated))',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '12px 14px',
          marginBottom: 10,
        }}
      >
        <div
          onClick={onToggleMascotVariant}
          style={{ cursor: 'pointer' }}
          title="Kliknij Rysia!"
        >
          <GlobalMascot size={66} mood="happy" floating />
        </div>
        <div style={{ flex: 1 }}>
          <h1
            style={{
              fontSize: 16.5,
              fontWeight: 800,
              letterSpacing: '-0.4px',
              marginBottom: 2,
            }}
          >
            Trener AI
          </h1>
          <p style={{ fontSize: 11.5, color: 'var(--text-secondary)', lineHeight: 1.35 }}>
            Technika ćwiczeń, dobór obciążenia, dieta i trasy w Łodzi.
          </p>
        </div>
      </div>

      {/* Sugestia progresji ciężaru */}
      <div
        className="card"
        style={{
          borderColor: 'rgba(62, 214, 163, 0.35)',
          padding: '11px 14px',
          marginBottom: 10,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <div>
            <div style={{ fontSize: 10.5, color: 'var(--text-secondary)', fontWeight: 700 }}>
              Wyciskanie hantli na skosie
            </div>
            <div style={{ fontWeight: 800, fontSize: 13, marginTop: 2 }}>
              {aiProgressionApplied ? 'Zwiększono do 30,0 kg' : 'Sugestia: +2,0 kg (na 30,0 kg)'}
            </div>
          </div>
          <button
            type="button"
            className={`btn ${aiProgressionApplied ? 'btn-secondary' : 'btn-primary'} btn-sm`}
            style={{ width: 'auto', padding: '6px 11px', fontSize: 11.5, flexShrink: 0 }}
            onClick={onApplyAIProgression}
          >
            {aiProgressionApplied ? <Check size={13} /> : <Zap size={13} />}
            {aiProgressionApplied
              ? `${formatDecimalPL(currentBenchWeight)} kg`
              : 'Zastosuj'}
          </button>
        </div>
      </div>

      <div className="filter-pills">
        <button
          type="button"
          className="filter-pill"
          onClick={() => onAskAIPrompt('Jak poprawić technikę przysiadu ze sztangą i chronić kolana?')}
        >
          Technika przysiadu
        </button>
        <button
          type="button"
          className="filter-pill"
          onClick={() => onAskAIPrompt('Co zjeść po dzisiejszym treningu siłowym, żeby dobić białko?')}
        >
          Posiłek po treningu
        </button>
        <button
          type="button"
          className="filter-pill"
          onClick={() => onAskAIPrompt('Poleć trasę biegową 5 km w Łodzi na tempo 4:50/km')}
        >
          Trasa 5 km w Łodzi
        </button>
        <button
          type="button"
          className="filter-pill"
          onClick={() => onAskAIPrompt('Jak ułożyć plan FBW 3 razy w tygodniu pod siłę i hipertrofię?')}
        >
          Plan FBW 3×
        </button>
      </div>

      <div className="card">
        <div className="chat-box" ref={chatBoxRef}>
          {aiMessages.length === 0 && !isAiThinking && (
            <div className="ai-chat-empty-state" data-testid="ai-empty-state">
              <div className="ai-chat-empty-icon">
                <GlobalMascot size={74} mood="happy" floating={false} />
              </div>
              <div className="ai-chat-empty-title">Jak mogę pomóc Ci dzisiaj?</div>
              <div className="ai-chat-empty-sub">
                Zadaj pytanie o plan siłowy, technikę, makroskładniki lub trasy w Łodzi.
              </div>
            </div>
          )}

          {aiMessages.map((m, idx) => (
            <div key={idx} className={`msg-row ${m.incoming ? 'incoming' : 'outgoing'}`}>
              {m.incoming && (
                <GlobalMascot size={42} mood="happy" floating={false} />
              )}
              <div className={`msg-bubble ${m.incoming ? 'msg-incoming' : 'msg-outgoing'}`}>
                <div className="msg-meta">
                  {m.sender} · {m.time}
                </div>
                <div style={{ whiteSpace: 'pre-line' }}>{m.text}</div>
              </div>
              {!m.incoming && <HumanAvatar config={user.avatar} size={34} />}
            </div>
          ))}

          {isAiThinking && (
            <div className="msg-row incoming" data-testid="ai-typing-indicator">
              <GlobalMascot size={42} mood="focused" floating={false} />
              <div
                className="msg-bubble msg-incoming ai-typing-bubble"
                aria-label="Generowanie odpowiedzi AI"
              >
                <div className="ai-typing-dots">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <input
            className="form-input"
            aria-label="Zadaj pytanie Trenerowi AI"
            placeholder="Zadaj pytanie o trening lub dietę..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
          />
          <button
            type="button"
            className="btn btn-primary"
            style={{ width: 'auto' }}
            onClick={handleSend}
            disabled={isAiThinking}
            aria-label="Wyślij zapytanie"
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

interface ProfileScreenProps {
  subTab: ProfileSubTab;
  theme: ThemeMode;
  user: UserProfile;
  mascotVariant?: GlobalMascotVariant;
  integrations: IntegrationItem[];
  weeklyComparison: WeeklyComparisonDay[];
  liveSaturdayVolumeKg?: number;
  stravaAthlete?: StravaAthleteProfile;
  isStravaSyncing?: boolean;
  badges?: BadgeItem[];
  onTogglePinBadge?: (badgeId: string) => void;
  onUpdateUserProfile?: (patch: Partial<UserProfile>) => void;
  onSwitchSubTab: (sub: ProfileSubTab) => void;
  onNavigate: (screen: ScreenName) => void;
  onOpenTab?: (tab: ScreenName, sub?: ActivitySubTab | DiscoverSubTab) => void;
  onTriggerLevelUp?: () => void;
  onToggleIntegration: (id: string) => void;
  onToggleTheme: () => void;
  onToggleMascotVariant?: () => void;
  onConnectStravaOAuth?: () => void;
  onSyncStravaApi?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  subTab,
  theme,
  user,
  integrations,
  weeklyComparison,
  liveSaturdayVolumeKg,
  badges = INITIAL_BADGES,
  onTogglePinBadge,
  onUpdateUserProfile,
  onSwitchSubTab,
  onNavigate,
  onOpenTab,
  onToggleIntegration,
  onToggleTheme,
}) => {
  const [localBadges, setLocalBadges] = useState<BadgeItem[]>(badges);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [showPhotoMode, setShowPhotoMode] = useState<'avatar' | 'photo'>('avatar');
  const [draftBio, setDraftBio] = useState(
    user.bio ||
      'Trenuję siłowo 4× w tygodniu w Zatoce Sportu PŁ i jeżdżę szosą w Arturówku. Szukam partnera do asekuracji na wolnych ciężarach.'
  );
  const [draftMotto, setDraftMotto] = useState(
    user.motto || 'Konsekwencja buduje formę — krok po kroku.'
  );
  const [draftPhotoUrl, setDraftPhotoUrl] = useState(
    user.photoUrl ||
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=400&q=80'
  );

  useEffect(() => {
    setLocalBadges(badges);
  }, [badges]);

  useEffect(() => {
    if (user.bio !== undefined) setDraftBio(user.bio);
    if (user.motto !== undefined) setDraftMotto(user.motto);
    if (user.photoUrl !== undefined) setDraftPhotoUrl(user.photoUrl);
  }, [user.bio, user.motto, user.photoUrl]);

  const handleSaveBio = () => {
    if (onUpdateUserProfile) {
      onUpdateUserProfile({
        bio: draftBio.trim(),
        motto: draftMotto.trim(),
        photoUrl: draftPhotoUrl.trim(),
      });
    }
    setIsEditingBio(false);
  };

  const handleTogglePin = (badgeId: string) => {
    if (onTogglePinBadge) {
      onTogglePinBadge(badgeId);
      return;
    }
    setLocalBadges((prev) => {
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

  const expTargetVal = getExpTargetForLevel(user.level);
  const expPct = Math.min(100, Math.round((user.exp / expTargetVal) * 100));
  const userRank = getUserRankInfo(user.level);

  const pinnedBadges = localBadges.filter((b) => b.unlocked && b.pinned).slice(0, 3);
  const unlockedCount = localBadges.filter((b) => b.unlocked).length;

  return (
    <div>
      <div className="segmented-control" role="tablist">
        <button
          type="button"
          className={`segment-btn ${subTab === 'overview' ? 'active' : ''}`}
          onClick={() => onSwitchSubTab('overview')}
        >
          Profil
        </button>
        <button
          type="button"
          className={`segment-btn ${subTab === 'badges' ? 'active' : ''}`}
          onClick={() => onSwitchSubTab('badges')}
        >
          Odznaki ({unlockedCount}/{localBadges.length})
        </button>
        <button
          type="button"
          className={`segment-btn ${subTab === 'integrations' ? 'active' : ''}`}
          onClick={() => onSwitchSubTab('integrations')}
        >
          Urządzenia
        </button>
        <button
          type="button"
          className={`segment-btn ${subTab === 'settings' ? 'active' : ''}`}
          onClick={() => onSwitchSubTab('settings')}
        >
          Ustawienia
        </button>
      </div>

      {subTab === 'overview' && (
        <div>
          {/* KARTA 1: Tożsamość, Ranga, EXP i statystyki 30-dniowe */}
          <div className="card" style={{ padding: '13px 14px', marginBottom: 10 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 13,
                marginBottom: 11,
              }}
            >
              <div
                style={{
                  position: 'relative',
                  width: 74,
                  height: 74,
                  flexShrink: 0,
                  cursor: 'pointer',
                }}
                onClick={() =>
                  setShowPhotoMode((prev) => (prev === 'avatar' ? 'photo' : 'avatar'))
                }
                title="Kliknij, aby przełączyć widok Awatar 2D / Zdjęcie"
              >
                <svg
                  width="74"
                  height="74"
                  style={{ transform: 'rotate(-90deg)', position: 'absolute', inset: 0 }}
                >
                  <circle
                    cx="37"
                    cy="37"
                    r="33"
                    fill="none"
                    stroke="var(--bg-elevated)"
                    strokeWidth="4"
                  />
                  <circle
                    cx="37"
                    cy="37"
                    r="33"
                    fill="none"
                    stroke={userRank.color}
                    strokeWidth="4"
                    strokeDasharray="207.3"
                    strokeDashoffset={(207.3 - (expPct / 100) * 207.3).toFixed(1)}
                    strokeLinecap="round"
                  />
                </svg>
                <div style={{ position: 'absolute', top: 7, left: 7 }}>
                  {showPhotoMode === 'photo' && draftPhotoUrl ? (
                    <img
                      src={draftPhotoUrl}
                      alt={user.name}
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                  ) : (
                    <HumanAvatar config={user.avatar} size={60} />
                  )}
                </div>
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    marginBottom: 3,
                    flexWrap: 'wrap',
                  }}
                >
                  <span
                    className="badge"
                    style={{
                      background: userRank.bgTint,
                      color: userRank.color,
                      border: `1px solid ${userRank.borderColor}`,
                      fontWeight: 800,
                      fontSize: 10,
                    }}
                  >
                    Ranga {userRank.tier} · Poz. {user.level}
                  </span>
                  <span className="badge badge-mint" style={{ fontSize: 10 }}>
                    {user.age} l. · {user.heightCm} cm · {formatDecimalPL(user.weightKg)} kg
                  </span>
                </div>
                <h2 style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.4px' }}>
                  {user.name}
                </h2>
                <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 1 }}>
                  {user.city}
                </div>
              </div>
            </div>

            {/* Pasek poziomu EXP */}
            <div style={{ marginBottom: 11 }}>
              <div
                className="tabular-nums"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 11,
                  fontWeight: 700,
                  marginBottom: 4,
                }}
              >
                <span style={{ color: 'var(--text-secondary)' }}>
                  Poziom {user.level} → {user.level + 1}
                </span>
                <span>
                  {formatNumberPL(user.exp)} / {formatNumberPL(expTargetVal)} EXP
                </span>
              </div>
              <div className="progress-track" style={{ height: 6 }}>
                <div
                  className="progress-fill"
                  style={{ width: `${expPct}%`, background: userRank.color }}
                />
              </div>
            </div>

            <div className="grid-3" style={{ textAlign: 'center', gap: 7 }}>
              <div
                style={{
                  background: 'var(--bg-elevated)',
                  padding: '8px 6px',
                  borderRadius: 10,
                }}
              >
                <div className="tabular-nums" style={{ fontSize: 14.5, fontWeight: 800 }}>
                  318 km
                </div>
                <div
                  style={{
                    fontSize: 9.5,
                    color: 'var(--text-secondary)',
                    fontWeight: 600,
                    marginTop: 1,
                  }}
                >
                  Rower (30 d)
                </div>
              </div>
              <div
                style={{
                  background: 'var(--bg-elevated)',
                  padding: '8px 6px',
                  borderRadius: 10,
                }}
              >
                <div className="tabular-nums" style={{ fontSize: 14.5, fontWeight: 800 }}>
                  24 sesje
                </div>
                <div
                  style={{
                    fontSize: 9.5,
                    color: 'var(--text-secondary)',
                    fontWeight: 600,
                    marginTop: 1,
                  }}
                >
                  Treningi (30 d)
                </div>
              </div>
              <div
                style={{
                  background: 'var(--bg-elevated)',
                  padding: '8px 6px',
                  borderRadius: 10,
                  cursor: 'pointer',
                }}
                onClick={() => onOpenTab && onOpenTab('discover', 'rankings')}
              >
                <div
                  className="tabular-nums"
                  style={{ fontSize: 14.5, fontWeight: 800, color: 'var(--accent-strava)' }}
                >
                  #2
                </div>
                <div
                  style={{
                    fontSize: 9.5,
                    color: 'var(--text-secondary)',
                    fontWeight: 600,
                    marginTop: 1,
                  }}
                >
                  Ranking Łódź
                </div>
              </div>
            </div>
          </div>

          {/* KARTA 2: O mnie, opis, zdjęcie i dyscypliny */}
          <div className="card" style={{ padding: '12px 14px', marginBottom: 10 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 8,
                gap: 6,
                flexWrap: 'wrap',
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                }}
              >
                O mnie i dyscypliny
              </span>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ width: 'auto', padding: '4px 8px', fontSize: 10.5 }}
                  onClick={() =>
                    setShowPhotoMode((prev) => (prev === 'avatar' ? 'photo' : 'avatar'))
                  }
                >
                  <Camera size={11} />{' '}
                  {showPhotoMode === 'photo' ? 'Pokaż Awatar' : 'Pokaż Zdjęcie'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ width: 'auto', padding: '4px 8px', fontSize: 10.5 }}
                  onClick={() => onNavigate('avatar-creator')}
                >
                  <Sparkles size={11} style={{ color: 'var(--accent-mint-bright)' }} /> Awatar
                </button>
                <button
                  type="button"
                  data-testid="edit-user-bio-btn"
                  className="btn btn-secondary btn-sm"
                  style={{ width: 'auto', padding: '4px 9px', fontSize: 10.5 }}
                  onClick={() => setIsEditingBio((prev) => !prev)}
                >
                  <Edit3 size={11} /> {isEditingBio ? 'Anuluj' : 'Edytuj opis'}
                </button>
              </div>
            </div>

            {isEditingBio ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                <div>
                  <label className="form-label" htmlFor="user-motto-input">
                    Motto / Status treningowy
                  </label>
                  <input
                    id="user-motto-input"
                    className="form-input"
                    style={{ fontSize: 12, padding: '7px 10px' }}
                    value={draftMotto}
                    onChange={(e) => setDraftMotto(e.target.value)}
                    placeholder="np. Konsekwencja buduje formę"
                  />
                </div>
                <div>
                  <label className="form-label" htmlFor="user-bio-textarea">
                    Twój opis w profilu
                  </label>
                  <textarea
                    id="user-bio-textarea"
                    data-testid="user-bio-textarea"
                    className="form-textarea"
                    style={{ minHeight: 62, fontSize: 12, padding: '8px 10px' }}
                    value={draftBio}
                    onChange={(e) => setDraftBio(e.target.value)}
                    placeholder="Napisz gdzie trenujesz, jakich partnerów szukasz i jakie masz cele..."
                  />
                </div>
                <div>
                  <label className="form-label" htmlFor="user-photo-input">
                    Link do zdjęcia profilowego (opcjonalnie)
                  </label>
                  <input
                    id="user-photo-input"
                    className="form-input"
                    style={{ fontSize: 11.5, padding: '7px 10px' }}
                    value={draftPhotoUrl}
                    onChange={(e) => setDraftPhotoUrl(e.target.value)}
                    placeholder="https://..."
                  />
                </div>
                <button
                  type="button"
                  data-testid="save-user-bio-btn"
                  className="btn btn-primary btn-sm"
                  onClick={handleSaveBio}
                >
                  <Check size={13} /> Zapisz opis profilu
                </button>
              </div>
            ) : (
              <div>
                {(user.motto || draftMotto) && (
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: 'var(--accent-mint-bright)',
                      marginBottom: 4,
                    }}
                  >
                    „{user.motto ?? draftMotto}”
                  </div>
                )}
                <p
                  data-testid="user-bio-display"
                  style={{
                    fontSize: 12,
                    color: 'var(--text-secondary)',
                    lineHeight: 1.45,
                    marginBottom: 9,
                  }}
                >
                  {user.bio ?? draftBio}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {Object.entries(user.sports).map(([sport, level]) => (
                    <span
                      key={sport}
                      className="badge"
                      style={{
                        background: 'var(--bg-elevated)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-subtle)',
                        fontSize: 10.5,
                      }}
                    >
                      {sport} · <span style={{ color: 'var(--accent-mint-bright)' }}>{level}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* KARTA 3: Interaktywny wykres z wyborem okresu (7 / 14 / 30 / 90 dni) */}
          <WeeklyProgressChart
            days={weeklyComparison}
            liveSaturdayVolumeKg={liveSaturdayVolumeKg}
          />

          {/* KARTA 4: Wybrane odznaki w profilu */}
          <div className="card" style={{ padding: '12px 14px', marginBottom: 4 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 10,
              }}
            >
              <div style={{ fontWeight: 800, fontSize: 13.5 }}>
                Wyróżnione odznaki ({pinnedBadges.length}/3)
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ width: 'auto', padding: '4px 10px', fontSize: 11 }}
                onClick={() => onSwitchSubTab('badges')}
              >
                Wszystkie ({unlockedCount}/{localBadges.length})
              </button>
            </div>

            <div className="hex-badge-grid">
              {pinnedBadges.map((b) => (
                <div
                  key={b.id}
                  className="hex-badge-card"
                  style={{ cursor: 'pointer' }}
                  onClick={() => onSwitchSubTab('badges')}
                >
                  <HexBadge color={b.accentColor || '#FF6B35'} icon={b.iconType || 'trophy'} />
                  <div style={{ fontSize: 11.5, fontWeight: 800 }}>{b.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{b.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* POD-WIDOK 2: KOLEKCJA ODZNAK */}
      {subTab === 'badges' && (
        <div>
          <div style={{ marginBottom: 10 }}>
            <h1 className="page-title" style={{ marginBottom: 2 }}>
              Kolekcja Odznak
            </h1>
            <p style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>
              Kliknij zdobytą odznakę, aby przypiąć ją w swoim profilu (maks. 3).
            </p>
          </div>

          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              textTransform: 'uppercase',
              color: 'var(--text-secondary)',
              marginBottom: 8,
              letterSpacing: '0.4px',
            }}
          >
            Zdobyte ({localBadges.filter((b) => b.unlocked).length})
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 8,
              marginBottom: 16,
            }}
          >
            {localBadges
              .filter((b) => b.unlocked)
              .map((b) => (
                <div
                  key={b.id}
                  onClick={() => handleTogglePin(b.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') handleTogglePin(b.id);
                  }}
                  style={{
                    background: 'var(--bg-surface)',
                    borderRadius: 14,
                    padding: '12px 10px',
                    border: b.pinned
                      ? '1.5px solid var(--accent-mint)'
                      : '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    cursor: 'pointer',
                    position: 'relative',
                  }}
                >
                  {b.pinned && (
                    <span
                      className="badge badge-mint"
                      style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        fontSize: 8.5,
                        padding: '1px 6px',
                      }}
                    >
                      <Pin size={9} /> W profilu
                    </span>
                  )}
                  <HexBadge color={b.accentColor || '#FF6B35'} icon={b.iconType || 'trophy'} />
                  <div style={{ fontSize: 12.5, fontWeight: 800, marginTop: 6 }}>{b.name}</div>
                  <div style={{ fontSize: 10.5, color: 'var(--text-secondary)', marginTop: 2 }}>
                    {b.desc}
                  </div>
                </div>
              ))}
          </div>

          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              textTransform: 'uppercase',
              color: 'var(--text-secondary)',
              marginBottom: 8,
              letterSpacing: '0.4px',
            }}
          >
            Do zdobycia ({localBadges.filter((b) => !b.unlocked).length})
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 8,
            }}
          >
            {localBadges
              .filter((b) => !b.unlocked)
              .map((b) => {
                const pct = Math.min(
                  100,
                  Math.round((b.progressCurrent / Math.max(1, b.progressTarget)) * 100)
                );
                return (
                  <div
                    key={b.id}
                    style={{
                      background: 'var(--bg-surface)',
                      borderRadius: 14,
                      padding: '12px 10px',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      opacity: 0.62,
                      filter: 'grayscale(0.85)',
                      position: 'relative',
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        color: 'var(--text-secondary)',
                      }}
                    >
                      <Lock size={12} />
                    </span>
                    <HexBadge color="#64748B" icon={b.iconType || 'trophy'} />
                    <div style={{ fontSize: 12.5, fontWeight: 800, marginTop: 6 }}>{b.name}</div>
                    <div
                      style={{
                        fontSize: 10,
                        color: 'var(--text-secondary)',
                        marginTop: 2,
                        marginBottom: 6,
                      }}
                    >
                      {b.desc}
                    </div>
                    <div className="progress-track" style={{ width: '100%', height: 5 }}>
                      <div
                        className="progress-fill"
                        style={{ width: `${pct}%`, background: '#94A3B8' }}
                      />
                    </div>
                    <div
                      className="tabular-nums"
                      style={{
                        fontSize: 9.5,
                        fontWeight: 700,
                        color: 'var(--text-secondary)',
                        marginTop: 4,
                      }}
                    >
                      {formatNumberPL(b.progressCurrent)} / {formatNumberPL(b.progressTarget)}{' '}
                      {b.progressUnit}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {subTab === 'integrations' && (
        <div>
          <h1 className="page-title">Połączone usługi</h1>

          {integrations.map((intg) => (
            <div key={intg.id} className="card">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 6,
                }}
              >
                <strong style={{ fontSize: 14.5, fontWeight: 800 }}>{intg.name}</strong>
                <span className={`badge ${intg.connected ? 'badge-mint' : ''}`}>
                  {intg.connected ? 'Połączono' : 'Rozłączono'}
                </span>
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--text-secondary)',
                  marginBottom: 12,
                }}
              >
                {intg.desc} · Synchronizacja: {intg.lastSync}
              </div>
              <button
                type="button"
                className={`btn ${intg.connected ? 'btn-secondary' : 'btn-primary'} btn-sm`}
                onClick={() => onToggleIntegration(intg.id)}
              >
                {intg.connected ? 'Synchronizuj / Rozłącz' : 'Połącz konto'}
              </button>
            </div>
          ))}
        </div>
      )}

      {subTab === 'settings' && (
        <div>
          <h1 className="page-title">Ustawienia</h1>

          <div className="grouped-list">
            <div className="list-row">
              <div>
                <div style={{ fontWeight: 700, fontSize: 13.5 }}>Wygląd Twojego Awatara</div>
                <div style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>
                  Postać 2D (skóra, fryzura, strój)
                </div>
              </div>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => onNavigate('avatar-creator')}
              >
                Edytuj
              </button>
            </div>
            <div className="list-row">
              <div>
                <div style={{ fontWeight: 700, fontSize: 13.5 }}>Dane osobowe i rejestracja</div>
                <div style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>
                  {user.name} · {user.heightCm} cm · {formatDecimalPL(user.weightKg)} kg
                </div>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => onNavigate('onboarding-register')}
              >
                Edytuj
              </button>
            </div>
            <div className="list-row">
              <div>
                <div style={{ fontWeight: 700, fontSize: 13.5 }}>Motyw ekranu</div>
                <div style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>
                  {theme === 'dark' ? 'Ciemny OLED' : 'Jasny'}
                </div>
              </div>
              <button type="button" className="btn btn-secondary btn-sm" onClick={onToggleTheme}>
                Przełącz
              </button>
            </div>
            <div className="list-row">
              <div>
                <div style={{ fontWeight: 700, fontSize: 13.5 }}>Preferencje sportowe</div>
                <div style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>
                  Cele, dyscypliny i lokalizacja w Łodzi
                </div>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => onNavigate('onboarding-setup')}
              >
                Edytuj
              </button>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-danger"
            style={{ marginTop: 8 }}
            onClick={() => onNavigate('onboarding-splash')}
          >
            Wyloguj się
          </button>
        </div>
      )}
    </div>
  );
};

interface NotificationsScreenProps {
  firstPartner: PartnerProfile;
  notifications?: AppNotificationItem[];
  onDeleteNotification?: (id: string) => void;
  onClearAllNotifications?: () => void;
  onOpenChatThread: (id: string) => void;
  onOpenTab: (tab: ScreenName, sub?: ActivitySubTab | DiscoverSubTab) => void;
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({
  firstPartner,
  notifications = INITIAL_NOTIFICATIONS,
  onDeleteNotification,
  onClearAllNotifications,
  onOpenChatThread,
  onOpenTab,
}) => {
  const [localList, setLocalList] = useState<AppNotificationItem[]>(notifications);

  useEffect(() => {
    setLocalList(notifications);
  }, [notifications]);

  const handleRemoveItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLocalList((prev) => prev.filter((n) => n.id !== id));
    if (onDeleteNotification) {
      onDeleteNotification(id);
    }
  };

  const handleClearAll = () => {
    setLocalList([]);
    if (onClearAllNotifications) {
      onClearAllNotifications();
    }
  };

  const handleClickItem = (item: AppNotificationItem) => {
    if (item.category === 'chat') {
      onOpenChatThread(item.targetId || 'p1');
    } else if (item.category === 'ranking') {
      onOpenTab('discover', 'rankings');
    } else if (item.category === 'group') {
      onOpenTab('discover', 'groups');
    } else {
      onOpenTab('discover', 'events');
    }
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
          gap: 8,
        }}
      >
        <h1 className="page-title" style={{ marginBottom: 0, fontSize: 18 }}>
          Powiadomienia ({localList.length})
        </h1>
        {localList.length > 0 && (
          <button
            type="button"
            data-testid="clear-all-notifications-btn"
            className="btn btn-secondary btn-sm"
            style={{ width: 'auto', padding: '5px 10px', fontSize: 11, flexShrink: 0 }}
            onClick={handleClearAll}
          >
            Wyczyść wszystkie
          </button>
        )}
      </div>

      {localList.length === 0 ? (
        <div
          className="card"
          data-testid="notifications-empty-state"
          style={{
            textAlign: 'center',
            padding: '28px 16px',
            color: 'var(--text-secondary)',
          }}
        >
          <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--text-primary)' }}>
            Brak powiadomień
          </div>
          <div style={{ fontSize: 12, marginTop: 4 }}>
            Wszystkie powiadomienia zostały odczytane lub usunięte.
          </div>
        </div>
      ) : (
        <div className="grouped-list">
          {localList.map((item) => (
            <div
              key={item.id}
              className="list-row interactive"
              onClick={() => handleClickItem(item)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleClickItem(item);
              }}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                {item.category === 'chat' ? (
                  <HumanAvatar config={firstPartner.avatar} size={38} showOnline />
                ) : item.category === 'ranking' ? (
                  <div className="icon-box" style={{ color: 'var(--accent-strava)' }}>
                    <Trophy size={17} />
                  </div>
                ) : item.category === 'group' ? (
                  <div className="icon-box" style={{ color: 'var(--accent-mint-bright)' }}>
                    <Users size={17} />
                  </div>
                ) : (
                  <div className="icon-box" style={{ color: 'var(--accent-strava)' }}>
                    <Calendar size={17} />
                  </div>
                )}

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{item.title}</div>
                  <div
                    style={{
                      fontSize: 11.5,
                      color: 'var(--text-secondary)',
                      marginTop: 2,
                    }}
                  >
                    {item.subtitle} · {item.time}
                  </div>
                </div>
              </div>

              <button
                type="button"
                data-testid={`delete-notif-${item.id}`}
                aria-label="Usuń powiadomienie"
                title="Usuń powiadomienie"
                onClick={(e) => handleRemoveItem(item.id, e)}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-elevated)',
                  color: 'var(--text-secondary)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
