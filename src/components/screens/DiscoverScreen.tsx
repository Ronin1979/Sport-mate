import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { APIProvider, AdvancedMarker, InfoWindow, Map as GoogleMap } from '@vis.gl/react-google-maps';
import {
  Award,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Crown,
  ExternalLink,
  Flame,
  Flag,
  LayoutList,
  MapPin,
  MessageCircle,
  MessageSquare,
  MessagesSquare,
  Navigation,
  Plus,
  RefreshCw,
  Send,
  ShieldCheck,
  Timer,
  Trophy,
  UserPlus,
  Users,
} from 'lucide-react';
import {
  ChatThread,
  DiscoverSubTab,
  LodzVenue,
  PartnerProfile,
  PlayerRankingEntry,
  ScreenName,
  SocialGroup,
  SportEvent,
  StravaActivityItem,
  StravaAthleteProfile,
  StravaChallenge,
  StravaSegment,
  ThemeMode,
  TrainerListing,
  TrainerSessionFormat,
  UserProfile,
  VenueCategory,
  WeeklyChallenge,
} from '../../types/sportmate';
import { INITIAL_TRAINER_LISTINGS } from '../../data/initialData';
import {
  INITIAL_STRAVA_ACTIVITIES,
  INITIAL_STRAVA_ATHLETE,
} from '../../data/apiCatalogs';
import {
  formatDecimalPL,
  formatNumberPL,
  getVenueLiveDetails,
} from '../../utils/formatters';
import { HumanAvatar } from '../avatar/HumanAvatar';

interface DiscoverScreenProps {
  subTab: DiscoverSubTab;
  theme: ThemeMode;
  user: UserProfile;
  partners: PartnerProfile[];
  partnerSportFilter: string;
  groups: SocialGroup[];
  activeGroupId: string | null;
  events: SportEvent[];
  eventSportFilter: string;
  lodzVenues: LodzVenue[];
  activeVenueId: string;
  chatThreads: Record<string, ChatThread>;
  activeChatThreadId: string | null;
  isPartnerTyping?: boolean;
  stravaSegments: StravaSegment[];
  stravaChallenges: StravaChallenge[];
  weeklyChallenges: WeeklyChallenge[];
  playerRankings: PlayerRankingEntry[];
  stravaAthlete?: StravaAthleteProfile;
  stravaActivities?: StravaActivityItem[];
  isStravaSyncing?: boolean;
  onSwitchSubTab: (sub: DiscoverSubTab) => void;
  onSetPartnerSportFilter: (f: string) => void;
  onInvitePartner: (id: string) => void;
  onOpenChatThread: (threadId: string) => void;
  onCloseChatThread: () => void;
  onSendPartnerMessage: (text: string) => void;
  onOpenGroupFeed: (groupId: string) => void;
  onCloseGroupFeed: () => void;
  onToggleJoinGroup: (groupId: string) => void;
  onPublishGroupPost: (groupId: string, tag: string, text: string, metric: string) => void;
  onToggleLikeGroupPost: (groupId: string, postId: string) => void;
  onAddGroupComment: (groupId: string, postId: string, text: string) => void;
  onSetEventSportFilter: (f: string) => void;
  onToggleJoinEvent: (eventId: string) => void;
  onSetActiveVenueId: (id: string, name: string) => void;
  onRecordSegmentAttempt: (segmentId: string, timeSeconds: number) => void;
  onToggleJoinChallenge: (challengeId: string) => void;
  onProgressChallenge: (challengeId: string, delta: number) => void;
  onUpdateWeeklyChallengeScore: (challengeId: string, deltaOrTimeValue: number) => void;
  onNavigate: (screen: ScreenName) => void;
  onConnectStravaOAuth?: () => void;
  onSyncStravaApi?: () => void;
  onQuickCreateVenueEvent?: (data: {
    venueId: string;
    title: string;
    sport: string;
    level: string;
    date: string;
    location: string;
    spotsLimit: number;
  }) => void;
  onReserveVenueSlot?: (
    venueName: string,
    unitName: string,
    time: string,
    action: 'booked' | 'cancelled'
  ) => void;
  trainerListings?: TrainerListing[];
  onBookTrainer?: (trainerId: string) => void;
  onCreateTrainerListing?: (data: {
    specialty: string;
    sessionFormat: TrainerSessionFormat;
    title: string;
    pricePln: number;
    durationMin: number;
    location: string;
    district: string;
    bio: string;
    nextAvailableSlot: string;
    spotsLeft?: number;
    spotsTotal?: number;
  }) => void;
}

const PARTNER_FILTERS = ['Wszystkie', 'Kolarstwo', 'Siłownia', 'Tenis', 'Bieganie'];
const EVENT_FILTERS = ['Wszystkie', 'Kolarstwo', 'Tenis', 'Bieganie', 'Badminton', 'Siłownia'];
const VENUE_CATEGORIES: VenueCategory[] = [
  'Wszystkie',
  'Siłownia',
  'Trasa biegowa',
  'Basen i Wielofunkcyjny',
  'Kolarstwo i Trail',
  'Street Workout',
];

type RankingSortKey = 'runsKmMonth' | 'workoutsMonth' | 'volumeKgMonth' | 'streakDays';
type RankingMainMode = 'players' | 'weekly' | 'segments';

export const DiscoverScreen: React.FC<DiscoverScreenProps> = ({
  subTab,
  theme,
  user,
  partners,
  partnerSportFilter,
  groups,
  activeGroupId,
  events,
  eventSportFilter,
  lodzVenues,
  activeVenueId,
  chatThreads,
  activeChatThreadId,
  isPartnerTyping = false,
  stravaSegments,
  stravaChallenges,
  weeklyChallenges,
  playerRankings,
  stravaAthlete = INITIAL_STRAVA_ATHLETE,
  stravaActivities = INITIAL_STRAVA_ACTIVITIES,
  isStravaSyncing = false,
  onSwitchSubTab,
  onSetPartnerSportFilter,
  onInvitePartner,
  onOpenChatThread,
  onCloseChatThread,
  onSendPartnerMessage,
  onOpenGroupFeed,
  onCloseGroupFeed,
  onToggleJoinGroup,
  onPublishGroupPost,
  onToggleLikeGroupPost,
  onAddGroupComment,
  onSetEventSportFilter,
  onToggleJoinEvent,
  onSetActiveVenueId,
  onRecordSegmentAttempt,
  onToggleJoinChallenge,
  onProgressChallenge,
  onUpdateWeeklyChallengeScore,
  onNavigate,
  onConnectStravaOAuth,
  onSyncStravaApi,
  onQuickCreateVenueEvent,
  trainerListings = INITIAL_TRAINER_LISTINGS,
  onBookTrainer,
  onCreateTrainerListing,
}) => {
  const [postTag, setPostTag] = useState('Osiągnięcie / Rekord (PR)');
  const [postText, setPostText] = useState('');
  const [postMetric, setPostMetric] = useState('');
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [chatInput, setChatInput] = useState('');
  const [selectedWeeklyChallengeId, setSelectedWeeklyChallengeId] = useState<string>(
    weeklyChallenges[0]?.id || 'wchal1'
  );

  // Stan dla przeprojektowanej zakładki Rankingi
  const [rankingMainMode, setRankingMainMode] = useState<RankingMainMode>('players');
  const [selectedSegmentId, setSelectedSegmentId] = useState<string>(
    stravaSegments[0]?.id || 'seg1'
  );
  const [rankingSortBy, setRankingSortBy] = useState<RankingSortKey>('runsKmMonth');
  const [customMin, setCustomMin] = useState<string>('16');
  const [customSec, setCustomSec] = useState<string>('35');

  // Stan dla zakładki Trenerzy Personalni i Grupowi
  const [localTrainerListings, setLocalTrainerListings] = useState<TrainerListing[]>(trainerListings);
  const [trainerFormatFilter, setTrainerFormatFilter] = useState<'all' | '1:1' | 'group'>('all');
  const [selectedTrainerId, setSelectedTrainerId] = useState<string | null>(null);
  const [showTrainerForm, setShowTrainerForm] = useState<boolean>(false);
  const [newTrainerTitle, setNewTrainerTitle] = useState<string>('');
  const [newTrainerSpecialty, setNewTrainerSpecialty] = useState<string>('Siłownia & Hipertrofia');
  const [newTrainerFormat, setNewTrainerFormat] = useState<TrainerSessionFormat>('1:1');
  const [newTrainerPrice, setNewTrainerPrice] = useState<string>('140');
  const [newTrainerLocation, setNewTrainerLocation] = useState<string>('McFIT Łódź Centrum');
  const [newTrainerSlot, setNewTrainerSlot] = useState<string>('Jutro · 18:00');
  const [newTrainerBio, setNewTrainerBio] = useState<string>('');

  useEffect(() => {
    setLocalTrainerListings(trainerListings);
  }, [trainerListings]);

  // Stan dla zakładki Mapa + Szczegóły Obiektu Sportowego
  const [venueCategoryFilter, setVenueCategoryFilter] = useState<VenueCategory>('Wszystkie');
  const [venueSectionTab, setVenueSectionTab] = useState<'zones' | 'events'>('zones');
  const [showAllVenues, setShowAllVenues] = useState<boolean>(false);
  const [bookedVenueSlotIds] = useState<string[]>([]);
  const [showQuickVenueEventForm, setShowQuickVenueEventForm] = useState<boolean>(false);
  const [quickVenueEventTitle, setQuickVenueEventTitle] = useState<string>(
    'Wspólny trening / sparing na obiekcie'
  );
  const [quickVenueEventSport, setQuickVenueEventSport] = useState<string>('Siłownia');
  const [quickVenueEventDate, setQuickVenueEventDate] = useState<string>(
    'Dzisiaj · 19:00'
  );
  const venueDetailsRef = useRef<HTMLDivElement | null>(null);
  const googleMapsApiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || '';
  const mapEngine: 'google' | 'leaflet' = googleMapsApiKey ? 'google' : 'leaflet';
  const [openInfoWindowVenueId, setOpenInfoWindowVenueId] = useState<string | null>('v1');

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersRef = useRef<Record<string, L.CircleMarker>>({});

  // Inicjalizacja zapasowej/alternatywnej mapy Leaflet (gdy wybrany tryb Trasy OSM lub brak WebGL)
  useEffect(() => {
    if (subTab !== 'map' || mapEngine !== 'leaflet') return;
    if (!mapContainerRef.current) return;

    if (!leafletMapRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: false,
      }).setView([51.765, 19.456], 12);

      const tileUrl =
        theme === 'light'
          ? 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
          : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

      tileLayerRef.current = L.tileLayer(tileUrl, { maxZoom: 19 }).addTo(map);

      lodzVenues.forEach((v) => {
        const marker = L.circleMarker(v.coords, {
          radius: 9,
          fillColor: v.color,
          color: '#0E0F14',
          weight: 2.5,
          opacity: 1,
          fillOpacity: 0.95,
        }).addTo(map);

        marker.bindPopup(
          `<div style="font-family:Inter,sans-serif;color:#141724;padding:2px;">
            <strong style="font-size:13px;">${v.name}</strong><br/>
            <span style="font-size:11px;color:#525870;">${v.sub}</span><br/>
            <span style="font-size:10px;color:#059669;font-weight:700;">${v.address}</span>
          </div>`
        );

        marker.on('click', () => {
          onSetActiveVenueId(v.id, v.name);
        });

        markersRef.current[v.id] = marker;
      });

      leafletMapRef.current = map;
    }

    const timer = setTimeout(() => {
      leafletMapRef.current?.invalidateSize();
    }, 100);

    return () => clearTimeout(timer);
  }, [subTab, mapEngine, lodzVenues, onSetActiveVenueId, theme]);

  useEffect(() => {
    return () => {
      if (leafletMapRef.current && mapEngine !== 'leaflet') {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
        markersRef.current = {};
      }
    };
  }, [mapEngine]);

  const handleSelectVenue = (v: LodzVenue, scrollToDetails = false) => {
    onSetActiveVenueId(v.id, v.name);
    setOpenInfoWindowVenueId(v.id);
    setShowQuickVenueEventForm(false);
    if (leafletMapRef.current && markersRef.current[v.id]) {
      leafletMapRef.current.flyTo(v.coords, 14, { duration: 0.6 });
      markersRef.current[v.id].openPopup();
    }
    if (scrollToDetails && venueDetailsRef.current) {
      venueDetailsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const filteredPartners = partners.filter(
    (p) => partnerSportFilter === 'Wszystkie' || p.sport === partnerSportFilter
  );

  const filteredTrainers = localTrainerListings.filter((tr) => {
    if (trainerFormatFilter === 'all') return true;
    const isPersonal = tr.trainingType === 'personal' || tr.sessionFormat === '1:1';
    return trainerFormatFilter === '1:1' ? isPersonal : !isPersonal;
  });

  const handleToggleBookTrainer = (trainerId: string) => {
    setLocalTrainerListings((prev) =>
      prev.map((tr) => {
        if (tr.id !== trainerId) return tr;
        return {
          ...tr,
          booked: !tr.booked,
        };
      })
    );
    if (onBookTrainer) {
      onBookTrainer(trainerId);
    }
  };

  const handlePublishTrainerListing = () => {
    const cleanTitle = newTrainerTitle.trim() || `${newTrainerSpecialty} — trening z trenerem`;
    const priceNum = Math.max(40, parseInt(newTrainerPrice, 10) || 140);
    const created: TrainerListing = {
      id: 'tr-' + Date.now(),
      trainerName: `Trener ${user.name}`,
      avatar: user.avatar,
      verified: true,
      certifications: ['Trener Personalny', newTrainerSpecialty],
      sportCategory: newTrainerSpecialty,
      trainingType: newTrainerFormat === '1:1' ? 'personal' : 'group',
      title: cleanTitle,
      pricePln: priceNum,
      durationMin: 60,
      locationName: newTrainerLocation.trim() || 'Zatoka Sportu PŁ — Łódź',
      district: user.city || 'Śródmieście',
      rating: 5.0,
      reviewsCount: 1,
      spotsLabel: newTrainerFormat === '1:1' ? 'Trening 1 na 1' : 'Wolne 8 z 10 miejsc',
      nextAvailableLabel: newTrainerSlot.trim() || 'Jutro · 18:00',
      description:
        newTrainerBio.trim() ||
        'Indywidualny lub grupowy trening dopasowany do Twojego celu i techniki.',
      booked: false,
    };
    setLocalTrainerListings((prev) => [created, ...prev]);
    setNewTrainerTitle('');
    setNewTrainerBio('');
    setShowTrainerForm(false);
  };

  const filteredEvents = events.filter(
    (ev) => eventSportFilter === 'Wszystkie' || ev.sport === eventSportFilter
  );

  const filteredVenues = lodzVenues.filter(
    (v) => venueCategoryFilter === 'Wszystkie' || v.category === venueCategoryFilter
  );

  const activeGroup = activeGroupId ? groups.find((g) => g.id === activeGroupId) || null : null;
  const activeThread = activeChatThreadId ? chatThreads[activeChatThreadId] || null : null;
  const activeSegment =
    stravaSegments.find((s) => s.id === selectedSegmentId) || stravaSegments[0];
  const activeVenueObj =
    lodzVenues.find((v) => v.id === activeVenueId) || lodzVenues[0];
  const activeVenueDetails = getVenueLiveDetails(
    activeVenueObj,
    events,
    bookedVenueSlotIds
  );

  const sortedRankings = [...playerRankings].sort(
    (a, b) => Number(b[rankingSortBy]) - Number(a[rankingSortBy])
  );

  const handleBeatSegmentRecord = () => {
    if (!activeSegment) return;
    const currentBest = activeSegment.leaderboard[0]?.timeSeconds || 600;
    const newBest = Math.max(45, currentBest - 6);
    onRecordSegmentAttempt(activeSegment.id, newBest);
  };

  const handleCustomSegmentSubmit = () => {
    if (!activeSegment) return;
    const m = Math.max(0, parseInt(customMin, 10) || 0);
    const s = Math.max(0, Math.min(59, parseInt(customSec, 10) || 0));
    const totalSec = m * 60 + s;
    if (totalSec < 30) return;
    onRecordSegmentAttempt(activeSegment.id, totalSec);
  };

  return (
    <div>
      {/* Segmented Control (7 pod-widoków w tym Trenerzy, Rankingi i Mapa) */}
      <div className="segmented-tabs" role="tablist" aria-label="Moduły społecznościowe">
        <button
          type="button"
          className={`seg-btn ${subTab === 'partners' ? 'active' : ''}`}
          onClick={() => onSwitchSubTab('partners')}
        >
          Partnerzy
        </button>
        <button
          type="button"
          className={`seg-btn ${subTab === 'trainers' ? 'active' : ''}`}
          onClick={() => onSwitchSubTab('trainers')}
        >
          Trenerzy
        </button>
        <button
          type="button"
          className={`seg-btn ${subTab === 'rankings' ? 'active' : ''}`}
          onClick={() => onSwitchSubTab('rankings')}
        >
          Rankingi
        </button>
        <button
          type="button"
          className={`seg-btn ${subTab === 'groups' ? 'active' : ''}`}
          onClick={() => onSwitchSubTab('groups')}
        >
          Grupy
        </button>
        <button
          type="button"
          className={`seg-btn ${subTab === 'events' ? 'active' : ''}`}
          onClick={() => onSwitchSubTab('events')}
        >
          Wydarzenia
        </button>
        <button
          type="button"
          className={`seg-btn ${subTab === 'map' ? 'active' : ''}`}
          onClick={() => onSwitchSubTab('map')}
        >
          Mapa ({lodzVenues.length})
        </button>
        <button
          type="button"
          className={`seg-btn ${subTab === 'messages' ? 'active' : ''}`}
          onClick={() => onSwitchSubTab('messages')}
        >
          Czaty
        </button>
      </div>

      {/* POD-WIDOK 1: PARTNERZY TRENINGOWI */}
      {subTab === 'partners' && (
        <div>
          <div style={{ marginBottom: 10 }}>
            <h1 className="page-title" style={{ marginBottom: 0 }}>
              Partnerzy w Łodzi
            </h1>
          </div>

          <div className="filter-pills">
            {PARTNER_FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                className={`filter-pill ${partnerSportFilter === f ? 'active' : ''}`}
                onClick={() => onSetPartnerSportFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>

          {filteredPartners.map((p) => (
            <div key={p.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <HumanAvatar
                    config={p.avatar}
                    size={54}
                    ringColor={p.matchPct >= 90 ? '#3ED6A3' : '#FF6B35'}
                    showOnline
                  />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 15 }}>
                      {p.name}, {p.age}
                    </div>
                    <div
                      style={{
                        fontSize: 11.5,
                        color: 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        marginTop: 2,
                      }}
                    >
                      <MapPin size={12} className="mono-icon" />
                      {p.district} ({p.distance})
                    </div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                      <span className="badge badge-strava">{p.sport}</span>
                      <span
                        className="badge"
                        style={{
                          background: 'var(--bg-elevated)',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        {p.level}
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div
                    className="tabular-nums"
                    style={{
                      fontSize: 20,
                      fontWeight: 800,
                      color: 'var(--accent-mint-bright)',
                    }}
                  >
                    {p.matchPct}%
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: 'var(--text-secondary)',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                    }}
                  >
                    Zgodność
                  </div>
                </div>
              </div>
              <p
                style={{
                  fontSize: 12.5,
                  color: 'var(--text-secondary)',
                  margin: '12px 0 10px 0',
                  lineHeight: 1.45,
                }}
              >
                {p.bio}
              </p>
              <div
                style={{
                  fontSize: 11.5,
                  color: 'var(--text-secondary)',
                  marginBottom: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Clock size={13} className="mono-icon" />
                Dostępność: <strong style={{ color: 'var(--text-primary)' }}>{p.avail}</strong>
              </div>
              <div className="card-actions-row">
                <button
                  type="button"
                  className={`btn ${p.invited ? 'btn-secondary' : 'btn-primary'} btn-sm`}
                  onClick={() => onInvitePartner(p.id)}
                >
                  {p.invited ? <Check size={13} /> : <UserPlus size={13} />}
                  {p.invited ? 'Zaproszono' : 'Zaproś do treningu'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => onOpenChatThread(p.id)}
                >
                  <MessageCircle size={13} />
                  Napisz wiadomość
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* POD-WIDOK 2: GRUPY SPOŁECZNOŚCIOWE */}
      {subTab === 'groups' && (
        <div>
          {activeGroup ? (
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 10,
                }}
              >
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ width: 'auto', padding: '6px 12px' }}
                  onClick={onCloseGroupFeed}
                >
                  ← Wszystkie grupy
                </button>
                <span className={`badge ${activeGroup.badgeColor}`}>
                  {activeGroup.sport} · {activeGroup.membersCount} członków
                </span>
              </div>

              <div
                className="card"
                style={{
                  background: 'linear-gradient(145deg, var(--bg-surface), var(--bg-elevated))',
                  borderColor: 'rgba(62,214,163,0.3)',
                }}
              >
                <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>
                  {activeGroup.name}
                </h2>
                <p
                  style={{
                    fontSize: 12,
                    color: 'var(--text-secondary)',
                    lineHeight: 1.45,
                    marginBottom: 12,
                  }}
                >
                  {activeGroup.desc}
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    className={`btn ${activeGroup.joined ? 'btn-secondary' : 'btn-primary'} btn-sm`}
                    style={{ flex: 1 }}
                    onClick={() => onToggleJoinGroup(activeGroup.id)}
                  >
                    {activeGroup.joined ? '✓ Jesteś członkiem grupy' : '+ Dołącz do grupy'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-strava btn-sm"
                    style={{ flex: 1 }}
                    onClick={() => onNavigate('create-event')}
                  >
                    <Calendar size={14} /> Utwórz trening grupowy
                  </button>
                </div>
              </div>

              {/* Kompozytor nowego posta */}
              <div className="card">
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    marginBottom: 10,
                  }}
                >
                  <HumanAvatar config={user.avatar} size={38} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 800 }}>
                      Podziel się osiągnięciem lub zaproś na trening
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                      Publikujesz jako: {user.name} (Poziom {user.level})
                    </div>
                  </div>
                </div>

                <div className="grid-2" style={{ marginBottom: 8 }}>
                  <div>
                    <label className="form-label" htmlFor="post-tag-select">
                      Kategoria wpisu
                    </label>
                    <select
                      id="post-tag-select"
                      className="form-select"
                      style={{ padding: '8px 10px', fontSize: 12 }}
                      value={postTag}
                      onChange={(e) => setPostTag(e.target.value)}
                    >
                      <option value="Osiągnięcie / Rekord (PR)">Osiągnięcie / Rekord (PR)</option>
                      <option value="Szukam na wspólny trening">Szukam na wspólny trening</option>
                      <option value="Relacja z trasy / siłowni">Relacja z trasy / siłowni</option>
                      <option value="Pytanie do grupy">Pytanie do grupy</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label" htmlFor="post-metric-input">
                      Wynik / Metryka (opcjonalnie)
                    </label>
                    <input
                      id="post-metric-input"
                      type="text"
                      className="form-input"
                      style={{ padding: '8px 10px', fontSize: 12 }}
                      placeholder="np. Ławka 100 kg × 5 / 10 km"
                      value={postMetric}
                      onChange={(e) => setPostMetric(e.target.value)}
                    />
                  </div>
                </div>

                <textarea
                  className="form-textarea"
                  style={{ minHeight: 64, marginBottom: 10, fontSize: 12.5 }}
                  placeholder="Napisz czym chcesz się pochwalić lub gdzie i o której trenujesz..."
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                />

                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    onPublishGroupPost(activeGroup.id, postTag, postText, postMetric);
                    setPostText('');
                    setPostMetric('');
                  }}
                >
                  <Send size={14} /> Opublikuj na tablicy grupy
                </button>
              </div>

              <div className="section-header">
                <span className="section-title">Tablica grupy ({activeGroup.posts.length})</span>
              </div>

              {activeGroup.posts.map((post) => {
                const postAvatar = post.isCurrentUser
                  ? user.avatar
                  : post.authorAvatar || user.avatar;
                const cVal = commentInputs[post.id] || '';
                return (
                  <div key={post.id} className="card">
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: 10,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <HumanAvatar config={postAvatar} size={40} />
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 14 }}>{post.author}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                            {post.time}
                          </div>
                        </div>
                      </div>
                      <span className={`badge ${post.tagClass}`}>{post.tag}</span>
                    </div>

                    <p style={{ fontSize: 13, lineHeight: 1.5, marginBottom: 10 }}>{post.text}</p>

                    {post.metricHighlight && (
                      <div
                        style={{
                          background: 'var(--bg-elevated)',
                          borderLeft: '3px solid var(--accent-mint-bright)',
                          padding: '9px 12px',
                          borderRadius: 10,
                          marginBottom: 10,
                          fontSize: 12,
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        <Award
                          size={16}
                          style={{ color: 'var(--accent-mint-bright)', flexShrink: 0 }}
                        />
                        <span>{post.metricHighlight}</span>
                      </div>
                    )}

                    <div className="post-action-bar">
                      <button
                        type="button"
                        className={`post-action-btn ${post.liked ? 'liked' : ''}`}
                        onClick={() => onToggleLikeGroupPost(activeGroup.id, post.id)}
                      >
                        <Flame size={14} /> Gratulacje ({post.likes})
                      </button>
                      <button
                        type="button"
                        className="post-action-btn"
                        onClick={() => {
                          const el = document.getElementById(`comment-input-${post.id}`);
                          if (el) el.focus();
                        }}
                      >
                        <MessageSquare size={14} /> Komentarze ({post.comments.length})
                      </button>
                    </div>

                    {post.comments.length > 0 && (
                      <div
                        style={{
                          marginTop: 10,
                          paddingTop: 8,
                          borderTop: '1px solid var(--border-divider)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 6,
                        }}
                      >
                        {post.comments.map((c, idx) => (
                          <div
                            key={idx}
                            style={{
                              background: 'var(--bg-elevated)',
                              padding: '7px 10px',
                              borderRadius: 10,
                              fontSize: 11.5,
                            }}
                          >
                            <strong style={{ color: 'var(--accent-mint-bright)' }}>
                              {c.author}:
                            </strong>{' '}
                            <span>{c.text}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                      <input
                        id={`comment-input-${post.id}`}
                        type="text"
                        className="form-input"
                        style={{ padding: '7px 10px', fontSize: 12 }}
                        placeholder="Dodaj komentarz lub umów się na wspólny trening..."
                        value={cVal}
                        onChange={(e) =>
                          setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && cVal.trim()) {
                            onAddGroupComment(activeGroup.id, post.id, cVal);
                            setCommentInputs((prev) => ({ ...prev, [post.id]: '' }));
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ width: 'auto', padding: '0 12px' }}
                        onClick={() => {
                          if (!cVal.trim()) return;
                          onAddGroupComment(activeGroup.id, post.id, cVal);
                          setCommentInputs((prev) => ({ ...prev, [post.id]: '' }));
                        }}
                      >
                        Wyślij
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 12,
                }}
              >
                <div>
                  <h1 className="page-title" style={{ marginBottom: 2 }}>
                    Grupy w Łodzi
                  </h1>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    Dołącz do lokalnych grup tematycznych, chwal się rekordami i umawiaj na wspólne
                    treningi.
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  style={{ width: 'auto', padding: '8px 12px', flexShrink: 0 }}
                  onClick={() => onNavigate('create-group')}
                >
                  <Plus size={14} /> Utwórz grupę
                </button>
              </div>

              {groups.map((g) => (
                <div key={g.id} className="card">
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: 8,
                    }}
                  >
                    <span className={`badge ${g.badgeColor}`}>{g.sport}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {g.joined && <span className="badge badge-mint">Należysz</span>}
                      <span
                        className="tabular-nums"
                        style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 700 }}
                      >
                        {g.membersCount} os.
                      </span>
                    </div>
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>{g.name}</h3>
                  <p
                    style={{
                      fontSize: 12,
                      color: 'var(--text-secondary)',
                      lineHeight: 1.45,
                      marginBottom: 12,
                    }}
                  >
                    {g.desc}
                  </p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      style={{ flex: 2 }}
                      onClick={() => onOpenGroupFeed(g.id)}
                    >
                      <LayoutList size={14} /> Otwórz tablicę ({g.posts.length})
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1 }}
                      onClick={() => onToggleJoinGroup(g.id)}
                    >
                      {g.joined ? 'Opuść' : 'Dołącz'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* POD-WIDOK 2B: TRENERZY PROFESJONALNI (LISTA + PROFIL TRENERA ZE ZDJĘCIEM I OPISEM) */}
      {subTab === 'trainers' &&
        (() => {
          const activeTrainer = selectedTrainerId
            ? localTrainerListings.find((t) => t.id === selectedTrainerId) || null
            : null;

          if (activeTrainer) {
            const isPersonal =
              activeTrainer.trainingType === 'personal' ||
              activeTrainer.sessionFormat === '1:1';
            const specLabel =
              activeTrainer.sportCategory || activeTrainer.specialty || 'Trening';
            const locLabel =
              activeTrainer.locationName || activeTrainer.location || 'Łódź';
            const descLabel = activeTrainer.description || activeTrainer.bio || '';
            const slots = activeTrainer.scheduleSlots || [
              activeTrainer.nextAvailableLabel || 'Wtorek · 18:00',
              'Czwartek · 19:00',
              'Sobota · 11:00',
            ];

            return (
              <div data-testid="trainer-profile-view">
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 10,
                  }}
                >
                  <button
                    type="button"
                    data-testid="back-to-trainers-btn"
                    className="btn btn-secondary btn-sm"
                    style={{ width: 'auto', padding: '6px 12px' }}
                    onClick={() => setSelectedTrainerId(null)}
                  >
                    <ChevronLeft size={14} /> Wszyscy trenerzy
                  </button>
                  <span
                    className={`badge ${isPersonal ? 'badge-mint' : 'badge-strava'}`}
                  >
                    {isPersonal ? 'Trening 1:1' : 'Trening grupowy'}
                  </span>
                </div>

                {/* Główna karta profilu trenera ze zdjęciem */}
                <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
                  {activeTrainer.photoUrl && (
                    <div
                      style={{
                        position: 'relative',
                        height: 170,
                        width: '100%',
                        overflow: 'hidden',
                        background: 'var(--bg-elevated)',
                      }}
                    >
                      <img
                        src={activeTrainer.photoUrl}
                        alt={activeTrainer.trainerName}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                        }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background:
                            'linear-gradient(180deg, rgba(9,10,15,0.08) 0%, rgba(9,10,15,0.85) 100%)',
                        }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          bottom: 12,
                          left: 14,
                          right: 14,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-end',
                          gap: 10,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <HumanAvatar
                            config={activeTrainer.avatar}
                            size={52}
                            ringColor="#3ED6A3"
                            showOnline
                          />
                          <div>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 5,
                                color: '#FFFFFF',
                                fontWeight: 800,
                                fontSize: 16.5,
                              }}
                            >
                              <span>{activeTrainer.trainerName}</span>
                              <ShieldCheck size={15} style={{ color: '#3ED6A3' }} />
                            </div>
                            <div style={{ fontSize: 11.5, color: '#CBD5E1' }}>
                              {specLabel} · Ocena {formatDecimalPL(activeTrainer.rating, 1)}/5,0 (
                              {activeTrainer.reviewsCount} opinii)
                            </div>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div
                            className="tabular-nums"
                            style={{
                              fontSize: 18,
                              fontWeight: 900,
                              color: '#3ED6A3',
                            }}
                          >
                            {activeTrainer.pricePln} zł
                          </div>
                          <div style={{ fontSize: 10, color: '#CBD5E1' }}>
                            / {activeTrainer.durationMin} min
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div style={{ padding: 14 }}>
                    <h2 style={{ fontSize: 15, fontWeight: 800, marginBottom: 6 }}>
                      {activeTrainer.title}
                    </h2>
                    <p
                      style={{
                        fontSize: 12.5,
                        color: 'var(--text-secondary)',
                        lineHeight: 1.48,
                        marginBottom: 14,
                      }}
                    >
                      {descLabel}
                    </p>

                    {/* Statystyki trenera */}
                    <div className="grid-3" style={{ textAlign: 'center', marginBottom: 14 }}>
                      <div
                        style={{
                          background: 'var(--bg-elevated)',
                          padding: '8px 6px',
                          borderRadius: 10,
                        }}
                      >
                        <div className="tabular-nums" style={{ fontSize: 14.5, fontWeight: 800 }}>
                          {activeTrainer.experienceYears || 7} lat
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>
                          Staż
                        </div>
                      </div>
                      <div
                        style={{
                          background: 'var(--bg-elevated)',
                          padding: '8px 6px',
                          borderRadius: 10,
                        }}
                      >
                        <div
                          className="tabular-nums"
                          style={{
                            fontSize: 14.5,
                            fontWeight: 800,
                            color: 'var(--accent-mint-bright)',
                          }}
                        >
                          {formatDecimalPL(activeTrainer.rating, 1)} / 5,0
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>
                          Ocena ({activeTrainer.reviewsCount})
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
                          {activeTrainer.spotsLabel}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>
                          Format
                        </div>
                      </div>
                    </div>

                    {/* Certyfikaty i osiągnięcia */}
                    <div
                      style={{
                        borderTop: '1px solid var(--border-subtle)',
                        paddingTop: 10,
                        marginBottom: 12,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          color: 'var(--text-secondary)',
                          marginBottom: 6,
                        }}
                      >
                        Kwalifikacje i osiągnięcia
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                        {activeTrainer.certifications.map((cert) => (
                          <span key={cert} className="badge badge-mint">
                            {cert}
                          </span>
                        ))}
                      </div>
                      {activeTrainer.achievements && activeTrainer.achievements.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {activeTrainer.achievements.map((ach) => (
                            <div
                              key={ach}
                              style={{
                                fontSize: 11.5,
                                color: 'var(--text-secondary)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                              }}
                            >
                              <Award size={12} style={{ color: '#F59E0B', flexShrink: 0 }} />
                              <span>{ach}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Lokalizacja i wolne terminy */}
                    <div
                      style={{
                        borderTop: '1px solid var(--border-subtle)',
                        paddingTop: 10,
                        marginBottom: 14,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          color: 'var(--text-secondary)',
                          marginBottom: 6,
                        }}
                      >
                        Miejsce i wolne terminy
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          marginBottom: 8,
                        }}
                      >
                        <MapPin size={13} className="mono-icon" />
                        <span>{locLabel}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {slots.map((sl) => (
                          <span
                            key={sl}
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              padding: '4px 9px',
                              borderRadius: 8,
                              background: 'var(--bg-elevated)',
                              border: '1px solid var(--border-subtle)',
                            }}
                          >
                            {sl}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="card-actions-row">
                      <button
                        type="button"
                        className={`btn ${
                          activeTrainer.booked ? 'btn-secondary' : 'btn-primary'
                        } btn-sm`}
                        onClick={() => handleToggleBookTrainer(activeTrainer.id)}
                      >
                        {activeTrainer.booked ? <Check size={13} /> : <Calendar size={13} />}
                        {activeTrainer.booked ? 'Zapisano na trening' : 'Zapisz się na trening'}
                      </button>
                      <button
                        type="button"
                        data-testid="trainer-profile-chat-btn"
                        className="btn btn-secondary btn-sm"
                        onClick={() => onOpenChatThread('p1')}
                      >
                        <MessageCircle size={13} /> Napisz wiadomość
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 10,
                  gap: 8,
                }}
              >
                <h1 className="page-title" style={{ marginBottom: 0 }}>
                  Trenerzy w Łodzi
                </h1>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  style={{ width: 'auto', padding: '7px 12px' }}
                  onClick={() => setShowTrainerForm((prev) => !prev)}
                >
                  <Plus size={14} /> {showTrainerForm ? 'Zamknij' : 'Dodaj ogłoszenie'}
                </button>
              </div>

              {/* Przełącznik typu treningu */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 6,
                  background: 'var(--bg-elevated)',
                  padding: 4,
                  borderRadius: 12,
                  marginBottom: 12,
                  border: '1px solid var(--border-subtle)',
                }}
              >
                {(
                  [
                    { id: 'all', label: 'Wszystkie' },
                    { id: '1:1', label: 'Personalny 1:1' },
                    { id: 'group', label: 'Grupowy' },
                  ] as const
                ).map((opt) => {
                  const active = trainerFormatFilter === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setTrainerFormatFilter(opt.id)}
                      style={{
                        padding: '7px 8px',
                        borderRadius: 9,
                        fontSize: 11.5,
                        fontWeight: 800,
                        border: 'none',
                        cursor: 'pointer',
                        background: active ? 'var(--bg-surface)' : 'transparent',
                        color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                        boxShadow: active ? '0 2px 8px rgba(0,0,0,0.18)' : 'none',
                      }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>

              {/* Formularz dodawania ogłoszenia przez trenera */}
              {showTrainerForm && (
                <div
                  className="card"
                  style={{
                    borderColor: 'rgba(62, 214, 163, 0.45)',
                    marginBottom: 12,
                  }}
                >
                  <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 10 }}>
                    Wystaw ogłoszenie trenerskie
                  </div>
                  <div className="form-group" style={{ marginBottom: 8 }}>
                    <label className="form-label" htmlFor="trainer-title-input">
                      Tytuł treningu
                    </label>
                    <input
                      id="trainer-title-input"
                      className="form-input"
                      placeholder="np. Trening personalny 1:1 — Technika i Hipertrofia"
                      value={newTrainerTitle}
                      onChange={(e) => setNewTrainerTitle(e.target.value)}
                    />
                  </div>
                  <div className="grid-2" style={{ gap: 8, marginBottom: 8 }}>
                    <div>
                      <label className="form-label" htmlFor="trainer-format-select">
                        Rodzaj zajęć
                      </label>
                      <select
                        id="trainer-format-select"
                        className="form-select"
                        value={newTrainerFormat}
                        onChange={(e) =>
                          setNewTrainerFormat(e.target.value as TrainerSessionFormat)
                        }
                      >
                        <option value="1:1">Personalny (1:1)</option>
                        <option value="group">Grupowy</option>
                      </select>
                    </div>
                    <div>
                      <label className="form-label" htmlFor="trainer-price-input">
                        Cena (PLN)
                      </label>
                      <input
                        id="trainer-price-input"
                        type="number"
                        className="form-input tabular-nums"
                        value={newTrainerPrice}
                        onChange={(e) => setNewTrainerPrice(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid-2" style={{ gap: 8, marginBottom: 8 }}>
                    <div>
                      <label className="form-label" htmlFor="trainer-spec-select">
                        Specjalizacja
                      </label>
                      <select
                        id="trainer-spec-select"
                        className="form-select"
                        value={newTrainerSpecialty}
                        onChange={(e) => setNewTrainerSpecialty(e.target.value)}
                      >
                        <option>Siłownia & Hipertrofia</option>
                        <option>Trójbój & Siła</option>
                        <option>Tenis Ziemny</option>
                        <option>Bieganie & Maraton</option>
                        <option>Kalistenika</option>
                      </select>
                    </div>
                    <div>
                      <label className="form-label" htmlFor="trainer-slot-input">
                        Wolny termin
                      </label>
                      <input
                        id="trainer-slot-input"
                        className="form-input"
                        value={newTrainerSlot}
                        onChange={(e) => setNewTrainerSlot(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="form-group" style={{ marginBottom: 8 }}>
                    <label className="form-label" htmlFor="trainer-loc-input">
                      Obiekt w Łodzi
                    </label>
                    <input
                      id="trainer-loc-input"
                      className="form-input"
                      value={newTrainerLocation}
                      onChange={(e) => setNewTrainerLocation(e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 10 }}>
                    <label className="form-label" htmlFor="trainer-bio-input">
                      Opis zajęć
                    </label>
                    <textarea
                      id="trainer-bio-input"
                      className="form-textarea"
                      style={{ minHeight: 54 }}
                      placeholder="Krótki opis dla podopiecznych..."
                      value={newTrainerBio}
                      onChange={(e) => setNewTrainerBio(e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={handlePublishTrainerListing}
                  >
                    Opublikuj ogłoszenie
                  </button>
                </div>
              )}

              {/* Lista ogłoszeń trenerów — kliknięcie otwiera pełny profil trenera */}
              {filteredTrainers.map((tr) => {
                const isPersonal =
                  tr.trainingType === 'personal' || tr.sessionFormat === '1:1';
                const specLabel = tr.sportCategory || tr.specialty || 'Trening';
                const locLabel = tr.locationName || tr.location || 'Łódź';
                const descLabel = tr.description || tr.bio || '';
                const nextSlotLabel =
                  tr.nextAvailableLabel || tr.nextAvailableSlot || 'Dostępne terminy';

                return (
                  <div
                    key={tr.id}
                    className="card clickable"
                    data-testid={`trainer-card-${tr.id}`}
                    onClick={() => setSelectedTrainerId(tr.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') setSelectedTrainerId(tr.id);
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: 10,
                        marginBottom: 8,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                        {tr.photoUrl ? (
                          <img
                            src={tr.photoUrl}
                            alt={tr.trainerName}
                            style={{
                              width: 52,
                              height: 52,
                              borderRadius: '50%',
                              objectFit: 'cover',
                              border: `2px solid ${isPersonal ? '#3ED6A3' : '#FF6B35'}`,
                              flexShrink: 0,
                            }}
                          />
                        ) : (
                          <HumanAvatar
                            config={tr.avatar}
                            size={50}
                            ringColor={isPersonal ? '#3ED6A3' : '#FF6B35'}
                            showOnline
                          />
                        )}
                        <div>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 5,
                              flexWrap: 'wrap',
                            }}
                          >
                            <span style={{ fontWeight: 800, fontSize: 14.5 }}>
                              {tr.trainerName}
                            </span>
                            {(tr.verified || tr.verifiedPro) && (
                              <ShieldCheck
                                size={14}
                                style={{
                                  color: 'var(--accent-mint-bright)',
                                  flexShrink: 0,
                                }}
                              />
                            )}
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              color: 'var(--text-secondary)',
                              marginTop: 1,
                            }}
                          >
                            {specLabel} · Ocena {formatDecimalPL(tr.rating, 1)} ({tr.reviewsCount})
                          </div>
                          <div
                            style={{
                              display: 'flex',
                              gap: 5,
                              marginTop: 5,
                              flexWrap: 'wrap',
                            }}
                          >
                            <span
                              className={`badge ${isPersonal ? 'badge-mint' : 'badge-strava'}`}
                              style={{ fontSize: 9.5 }}
                            >
                              {isPersonal ? 'Personalny 1:1' : 'Grupowy'}
                            </span>
                            {tr.certifications.slice(0, 1).map((cert) => (
                              <span
                                key={cert}
                                style={{
                                  fontSize: 9.5,
                                  fontWeight: 700,
                                  padding: '2px 7px',
                                  borderRadius: 99,
                                  background: 'var(--bg-elevated)',
                                  color: 'var(--text-secondary)',
                                }}
                              >
                                {cert}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div
                          className="tabular-nums"
                          style={{
                            fontSize: 16.5,
                            fontWeight: 900,
                            color: 'var(--accent-mint-bright)',
                          }}
                        >
                          {tr.pricePln} zł
                        </div>
                        <div
                          style={{
                            fontSize: 10,
                            color: 'var(--text-secondary)',
                            fontWeight: 600,
                          }}
                        >
                          / {tr.durationMin} min
                        </div>
                      </div>
                    </div>

                    <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 4 }}>
                      {tr.title}
                    </div>
                    <p
                      style={{
                        fontSize: 11.5,
                        color: 'var(--text-secondary)',
                        lineHeight: 1.4,
                        marginBottom: 10,
                      }}
                    >
                      {descLabel}
                    </p>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: 11,
                        color: 'var(--text-secondary)',
                        paddingTop: 8,
                        borderTop: '1px solid var(--border-subtle)',
                        marginBottom: 10,
                        flexWrap: 'wrap',
                        gap: 6,
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MapPin size={12} className="mono-icon" /> {locLabel.split('—')[0].trim()}
                      </span>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                        {nextSlotLabel}
                      </span>
                    </div>

                    <div className="card-actions-row">
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTrainerId(tr.id);
                        }}
                      >
                        Zobacz profil
                      </button>
                      <button
                        type="button"
                        className={`btn ${tr.booked ? 'btn-secondary' : 'btn-primary'} btn-sm`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleBookTrainer(tr.id);
                        }}
                      >
                        {tr.booked ? <Check size={13} /> : <Calendar size={13} />}
                        {tr.booked ? 'Zapisano' : 'Zapisz się'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}

      {/* POD-WIDOK 3: PRZEPROJEKTOWANE RANKINGI (ZINTEGROWANY PRZEŁĄCZNIK, PODIUM TOP 3, BEZ ZIELONEGO KAFELKA I DYMKÓW) */}
      {subTab === 'rankings' && (
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 10,
              gap: 8,
            }}
          >
            <h1 className="page-title" style={{ marginBottom: 0 }}>
              Rankingi — Łódź
            </h1>
            {onSyncStravaApi && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                data-testid="strava-sync-btn"
                style={{ width: 'auto', padding: '6px 10px', fontSize: 11 }}
                disabled={isStravaSyncing}
                onClick={onSyncStravaApi}
              >
                <RefreshCw size={12} /> {isStravaSyncing ? 'Sync...' : 'Sync Strava'}
              </button>
            )}
          </div>

          {/* GŁÓWNY PRZEŁĄCZNIK TRYBU RANKINGU (ZAMIAST ROZRZUCONYCH DYMKÓW) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 6,
              background: 'var(--bg-elevated)',
              padding: 4,
              borderRadius: 12,
              marginBottom: 12,
              border: '1px solid var(--border-subtle)',
            }}
          >
            {(
              [
                { id: 'players', label: 'Ligi Graczy' },
                { id: 'weekly', label: 'Wyzwania' },
                { id: 'segments', label: 'Segmenty' },
              ] as const
            ).map((tab) => {
              const active = rankingMainMode === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setRankingMainMode(tab.id)}
                  style={{
                    padding: '8px 6px',
                    borderRadius: 9,
                    fontSize: 11.5,
                    fontWeight: 800,
                    border: 'none',
                    cursor: 'pointer',
                    background: active ? 'var(--bg-surface)' : 'transparent',
                    color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                    boxShadow: active ? '0 2px 8px rgba(0,0,0,0.18)' : 'none',
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* TRYB 1: LIGI GRACZY (PODIUM TOP 3 + ZINTEGROWANA SIATKA KRYTERIÓW WEWNĄTRZ KARTY) */}
          {rankingMainMode === 'players' && (
            <div className="card">
              {/* 4 kafelki wyboru metryki wewnątrz nagłówka tabeli */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: 6,
                  marginBottom: 14,
                }}
              >
                {(
                  [
                    { key: 'runsKmMonth', label: 'Biegi', unit: 'km' },
                    { key: 'volumeKgMonth', label: 'Siłownia', unit: 'kg' },
                    { key: 'workoutsMonth', label: 'Sesje', unit: 'msc' },
                    { key: 'streakDays', label: 'Streak', unit: 'dni' },
                  ] as const
                ).map((item) => {
                  const active = rankingSortBy === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setRankingSortBy(item.key)}
                      style={{
                        padding: '7px 4px',
                        borderRadius: 10,
                        border: active
                          ? '1.5px solid var(--accent-strava)'
                          : '1px solid var(--border-subtle)',
                        background: active
                          ? 'rgba(255, 107, 53, 0.14)'
                          : 'var(--bg-elevated)',
                        color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: 11, fontWeight: 800 }}>{item.label}</div>
                      <div style={{ fontSize: 9.5, opacity: 0.75 }}>{item.unit}</div>
                    </button>
                  );
                })}
              </div>

              {/* Wizualne Podium TOP 3 */}
              {sortedRankings.length >= 3 && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1.12fr 1fr',
                    gap: 8,
                    alignItems: 'end',
                    marginBottom: 14,
                    padding: '10px 8px',
                    borderRadius: 14,
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  {[sortedRankings[1], sortedRankings[0], sortedRankings[2]].map((p, podIdx) => {
                    const place = podIdx === 1 ? 1 : podIdx === 0 ? 2 : 3;
                    const medalColor =
                      place === 1 ? '#FBBF24' : place === 2 ? '#94A3B8' : '#FB923C';
                    const valStr =
                      rankingSortBy === 'runsKmMonth'
                        ? `${formatDecimalPL(p.runsKmMonth, 1)} km`
                        : rankingSortBy === 'volumeKgMonth'
                        ? `${formatDecimalPL(p.volumeKgMonth / 1000, 1)} t`
                        : rankingSortBy === 'workoutsMonth'
                        ? `${p.workoutsMonth} sesji`
                        : `${p.streakDays} dni`;
                    return (
                      <div
                        key={p.id}
                        style={{
                          textAlign: 'center',
                          padding: place === 1 ? '8px 4px 6px' : '4px 4px',
                          borderRadius: 12,
                          background:
                            place === 1 ? 'rgba(251, 191, 36, 0.08)' : 'transparent',
                        }}
                      >
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 900,
                            color: medalColor,
                            marginBottom: 4,
                          }}
                        >
                          #{place}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 5 }}>
                          <HumanAvatar
                            config={p.avatar}
                            size={place === 1 ? 48 : 40}
                            ringColor={medalColor}
                          />
                        </div>
                        <div
                          style={{
                            fontSize: 11.5,
                            fontWeight: 800,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {p.name.split(' ')[0]}
                        </div>
                        <div
                          className="tabular-nums"
                          style={{
                            fontSize: 11,
                            fontWeight: 800,
                            color: place === 1 ? '#FBBF24' : 'var(--accent-mint-bright)',
                            marginTop: 2,
                          }}
                        >
                          {valStr}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pełna lista miejsc */}
              <div className="grouped-list">
                {sortedRankings.map((player, idx) => {
                  const rankNum = idx + 1;
                  const metricDisplay =
                    rankingSortBy === 'runsKmMonth'
                      ? `${formatDecimalPL(player.runsKmMonth, 1)} km`
                      : rankingSortBy === 'workoutsMonth'
                      ? `${player.workoutsMonth} sesji`
                      : rankingSortBy === 'volumeKgMonth'
                      ? `${formatNumberPL(player.volumeKgMonth)} kg`
                      : `${player.streakDays} dni`;

                  return (
                    <div
                      key={player.id}
                      className="list-row"
                      style={{
                        padding: '9px 11px',
                        background: player.isCurrentUser
                          ? 'rgba(62, 214, 163, 0.12)'
                          : undefined,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          className="tabular-nums"
                          style={{
                            width: 24,
                            fontWeight: 900,
                            fontSize: 13,
                            color:
                              rankNum === 1
                                ? '#FBBF24'
                                : rankNum === 2
                                ? '#94A3B8'
                                : rankNum === 3
                                ? '#FB923C'
                                : 'var(--text-secondary)',
                          }}
                        >
                          #{rankNum}
                        </div>
                        <HumanAvatar
                          config={player.avatar}
                          size={34}
                          ringColor={player.isCurrentUser ? '#3ED6A3' : undefined}
                        />
                        <div>
                          <div
                            style={{
                              fontWeight: 800,
                              fontSize: 13,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 5,
                            }}
                          >
                            <span>{player.name}</span>
                            {player.isCurrentUser && (
                              <span
                                className="badge badge-mint"
                                style={{ fontSize: 9, padding: '1px 5px' }}
                              >
                                Ty
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: 10.5, color: 'var(--text-secondary)' }}>
                            {player.district}
                          </div>
                        </div>
                      </div>
                      <div
                        className="tabular-nums"
                        style={{
                          fontWeight: 800,
                          fontSize: 13,
                          color: player.isCurrentUser
                            ? 'var(--accent-mint-bright)'
                            : 'var(--text-primary)',
                        }}
                      >
                        {metricDisplay}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TRYB 2: WYZWANIA TYGODNIOWE (ZINTEGROWANY PRZEŁĄCZNIK < / > W NAGŁÓWKU KARTY, BEZ ZIELONEGO TŁA) */}
          {rankingMainMode === 'weekly' &&
            (() => {
              const currentIdx = Math.max(
                0,
                weeklyChallenges.findIndex((w) => w.id === selectedWeeklyChallengeId)
              );
              const activeWc = weeklyChallenges[currentIdx] || weeklyChallenges[0];
              if (!activeWc) return null;

              const handlePrevWc = () => {
                const nextIdx =
                  (currentIdx - 1 + weeklyChallenges.length) % weeklyChallenges.length;
                setSelectedWeeklyChallengeId(weeklyChallenges[nextIdx].id);
              };
              const handleNextWc = () => {
                const nextIdx = (currentIdx + 1) % weeklyChallenges.length;
                setSelectedWeeklyChallengeId(weeklyChallenges[nextIdx].id);
              };

              return (
                <div className="card">
                  {/* Zintegrowany przełącznik wyzwań wewnątrz nagłówka */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                      paddingBottom: 10,
                      marginBottom: 10,
                      borderBottom: '1px solid var(--border-subtle)',
                    }}
                  >
                    <button
                      type="button"
                      className="icon-btn"
                      onClick={handlePrevWc}
                      aria-label="Poprzednie wyzwanie"
                      style={{ width: 32, height: 32 }}
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <div style={{ textAlign: 'center', flex: 1 }}>
                      <div style={{ fontSize: 14.5, fontWeight: 800 }}>{activeWc.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 1 }}>
                        {activeWc.endsInLabel} · +{activeWc.rewardExp} EXP ({currentIdx + 1}/
                        {weeklyChallenges.length})
                      </div>
                    </div>
                    <button
                      type="button"
                      className="icon-btn"
                      onClick={handleNextWc}
                      aria-label="Następne wyzwanie"
                      style={{ width: 32, height: 32 }}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>

                  <div className="grouped-list" style={{ marginBottom: 12 }}>
                    {activeWc.leaderboard.map((entry) => (
                      <div
                        key={entry.id}
                        className="list-row"
                        style={{
                          padding: '9px 11px',
                          background: entry.isCurrentUser
                            ? 'rgba(62, 214, 163, 0.12)'
                            : undefined,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                          <div
                            className="tabular-nums"
                            style={{
                              width: 24,
                              fontWeight: 900,
                              fontSize: 13,
                              color:
                                entry.rank === 1
                                  ? '#FBBF24'
                                  : entry.isCurrentUser
                                  ? 'var(--accent-mint)'
                                  : 'var(--text-secondary)',
                            }}
                          >
                            #{entry.rank}
                          </div>
                          <HumanAvatar
                            config={entry.avatar}
                            size={34}
                            ringColor={entry.rank === 1 ? '#FBBF24' : undefined}
                          />
                          <div>
                            <div
                              style={{
                                fontWeight: 800,
                                fontSize: 13,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 5,
                              }}
                            >
                              <span>{entry.name}</span>
                              {entry.isCurrentUser && (
                                <span
                                  className="badge badge-mint"
                                  style={{ fontSize: 9, padding: '1px 5px' }}
                                >
                                  Ty
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: 10.5, color: 'var(--text-secondary)' }}>
                              {entry.secondaryLabel}
                            </div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div
                            className="tabular-nums"
                            style={{
                              fontWeight: 800,
                              fontSize: 13.5,
                              color: entry.rank === 1 ? '#FBBF24' : 'var(--text-main)',
                            }}
                          >
                            {entry.scoreFormatted}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="card-actions-row">
                    {activeWc.metricType === 'distance_km' && (
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => onUpdateWeeklyChallengeScore(activeWc.id, 5.4)}
                      >
                        <Plus size={13} /> Dodaj bieg (+5,4 km)
                      </button>
                    )}
                    {activeWc.metricType === 'segment_time_sec' && (
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => {
                          const topSec = activeWc.leaderboard[0]?.scoreValue || 1002;
                          onUpdateWeeklyChallengeScore(activeWc.id, Math.max(840, topSec - 5));
                        }}
                      >
                        <Timer size={13} /> Popraw czas (-5 s)
                      </button>
                    )}
                    {activeWc.metricType === 'volume_kg' && (
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => onUpdateWeeklyChallengeScore(activeWc.id, 2450)}
                      >
                        <Plus size={13} /> Dodaj objętość (+2 450 kg)
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}

          {/* TRYB 3: SEGMENTY TRAS STRAVA (ZINTEGROWANY PRZEŁĄCZNIK < / > W KARCIE) */}
          {rankingMainMode === 'segments' &&
            activeSegment &&
            (() => {
              const segIdx = Math.max(
                0,
                stravaSegments.findIndex((s) => s.id === activeSegment.id)
              );
              const handlePrevSeg = () => {
                const nextIdx =
                  (segIdx - 1 + stravaSegments.length) % stravaSegments.length;
                setSelectedSegmentId(stravaSegments[nextIdx].id);
              };
              const handleNextSeg = () => {
                const nextIdx = (segIdx + 1) % stravaSegments.length;
                setSelectedSegmentId(stravaSegments[nextIdx].id);
              };

              return (
                <div className="card">
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                      paddingBottom: 10,
                      marginBottom: 10,
                      borderBottom: '1px solid var(--border-subtle)',
                    }}
                  >
                    <button
                      type="button"
                      className="icon-btn"
                      onClick={handlePrevSeg}
                      aria-label="Poprzedni segment"
                      style={{ width: 32, height: 32 }}
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <div style={{ textAlign: 'center', flex: 1 }}>
                      <div style={{ fontSize: 14.5, fontWeight: 800 }}>{activeSegment.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 1 }}>
                        {activeSegment.location} · {formatDecimalPL(activeSegment.distanceKm, 1)} km
                      </div>
                    </div>
                    <button
                      type="button"
                      className="icon-btn"
                      onClick={handleNextSeg}
                      aria-label="Następny segment"
                      style={{ width: 32, height: 32 }}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>

                  <div className="grid-3" style={{ marginBottom: 12 }}>
                    <div className="metric-box" style={{ padding: '7px 8px' }}>
                      <div className="metric-box-label">Dystans</div>
                      <div className="metric-box-val">
                        {formatDecimalPL(activeSegment.distanceKm, 1)} km
                      </div>
                    </div>
                    <div className="metric-box" style={{ padding: '7px 8px' }}>
                      <div className="metric-box-label">Przewyższenie</div>
                      <div className="metric-box-val" style={{ color: 'var(--accent-mint-bright)' }}>
                        +{activeSegment.elevationGainM} m
                      </div>
                    </div>
                    <div className="metric-box" style={{ padding: '7px 8px' }}>
                      <div className="metric-box-label">KOM</div>
                      <div className="metric-box-val" style={{ color: 'var(--accent-strava)' }}>
                        {activeSegment.leaderboard[0]?.timeFormatted || activeSegment.recordTime}
                      </div>
                    </div>
                  </div>

                  <div className="grouped-list" style={{ marginBottom: 12 }}>
                    {activeSegment.leaderboard.map((entry) => (
                      <div
                        key={entry.name}
                        className="list-row"
                        style={{
                          padding: '9px 11px',
                          background: entry.isCurrentUser
                            ? 'rgba(62, 214, 163, 0.12)'
                            : undefined,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div
                            className="tabular-nums"
                            style={{
                              width: 24,
                              fontWeight: 800,
                              fontSize: 13,
                              color:
                                entry.rank === 1
                                  ? '#FBBF24'
                                  : entry.isCurrentUser
                                  ? 'var(--accent-mint-bright)'
                                  : 'var(--text-secondary)',
                            }}
                          >
                            #{entry.rank}
                          </div>
                          <HumanAvatar
                            config={entry.avatar}
                            size={34}
                            ringColor={entry.rank === 1 ? '#FBBF24' : undefined}
                          />
                          <div>
                            <div
                              style={{
                                fontWeight: 800,
                                fontSize: 13,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 5,
                              }}
                            >
                              <span>{entry.name}</span>
                              {entry.isCurrentUser && (
                                <span
                                  className="badge badge-mint"
                                  style={{ fontSize: 9, padding: '1px 5px' }}
                                >
                                  Ty
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: 10.5, color: 'var(--text-secondary)' }}>
                              {entry.paceOrSpeed} · {entry.date}
                            </div>
                          </div>
                        </div>
                        <div
                          className="tabular-nums"
                          style={{
                            fontWeight: 800,
                            fontSize: 14,
                            color: entry.rank === 1 ? '#FBBF24' : 'var(--text-primary)',
                          }}
                        >
                          {entry.timeFormatted}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: 6 }}>
                    <input
                      id="seg-min"
                      type="number"
                      min="0"
                      max="120"
                      className="input-field tabular-nums"
                      style={{ padding: '7px 10px', fontSize: 12.5, width: 70 }}
                      value={customMin}
                      onChange={(e) => setCustomMin(e.target.value)}
                      aria-label="Minuty"
                    />
                    <input
                      id="seg-sec"
                      type="number"
                      min="0"
                      max="59"
                      className="input-field tabular-nums"
                      style={{ padding: '7px 10px', fontSize: 12.5, width: 70 }}
                      value={customSec}
                      onChange={(e) => setCustomSec(e.target.value)}
                      aria-label="Sekundy"
                    />
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1 }}
                      onClick={handleCustomSegmentSubmit}
                    >
                      Zapisz czas
                    </button>
                    <button
                      type="button"
                      className="btn btn-strava btn-sm"
                      style={{ flex: 1 }}
                      onClick={handleBeatSegmentRecord}
                    >
                      <Trophy size={13} /> Rekord KOM
                    </button>
                  </div>
                </div>
              );
            })()}
        </div>
      )}

      {/* POD-WIDOK 4: WYDARZENIA LOKALNE */}
      {subTab === 'events' && (
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <div>
              <h1 className="page-title" style={{ marginBottom: 2 }}>
                Wydarzenia
              </h1>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Otwarte treningi i sparingi organizowane w Łodzi
              </p>
            </div>
            <button
              type="button"
              className="btn btn-strava btn-sm"
              style={{ width: 'auto', padding: '8px 12px' }}
              onClick={() => onNavigate('create-event')}
            >
              <Plus size={14} /> Utwórz
            </button>
          </div>

          <div className="filter-pills">
            {EVENT_FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                className={`filter-pill ${eventSportFilter === f ? 'active' : ''}`}
                onClick={() => onSetEventSportFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>

          {filteredEvents.map((ev) => (
            <div key={ev.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span className="badge badge-strava">
                  {ev.sport} · {ev.level}
                </span>
                <span
                  className="tabular-nums"
                  style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-secondary)' }}
                >
                  {ev.spotsTaken}/{ev.spotsLimit} miejsc
                </span>
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 6 }}>{ev.title}</h3>
              <p
                style={{
                  fontSize: 12,
                  color: 'var(--text-secondary)',
                  marginBottom: 10,
                  lineHeight: 1.4,
                }}
              >
                {ev.desc}
              </p>
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  marginBottom: 12,
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Calendar size={13} className="mono-icon" /> {ev.date}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MapPin size={13} className="mono-icon" /> {ev.location}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  className={`btn ${ev.joined ? 'btn-secondary' : 'btn-primary'} btn-sm`}
                  style={{ flex: 2 }}
                  onClick={() => onToggleJoinEvent(ev.id)}
                >
                  {ev.joined ? '✓ Bierzesz udział (Wypisz się)' : 'Dołącz do wydarzenia'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1 }}
                  onClick={() => onOpenChatThread(ev.id)}
                >
                  <MessagesSquare size={14} /> Czat
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* POD-WIDOK 5: INTERAKTYWNA MAPA ŁODZI (SZCZEGÓŁY OBIEKTU, GODZINY, DOSTĘPNOŚĆ KORTÓW/SAL I WYDARZENIA — BEZ REZERWACJI) */}
      {subTab === 'map' && (
        <div>
          <div style={{ marginBottom: 10 }}>
            <h1 className="page-title" style={{ marginBottom: 0 }}>
              Mapa aktywności — Łódź
            </h1>
          </div>

          {/* Kategoria obiektów na mapie */}
          <div className="filter-pills" style={{ marginBottom: 10 }}>
            {VENUE_CATEGORIES.map((vCat) => (
              <button
                key={vCat}
                type="button"
                className={`filter-pill ${venueCategoryFilter === vCat ? 'active' : ''}`}
                onClick={() => setVenueCategoryFilter(vCat)}
              >
                {vCat}
              </button>
            ))}
          </div>

          {/* Kontener Mapy: Google Maps Platform (z kluczem API) lub Mapa Trasy Leaflet */}
          {mapEngine === 'google' && googleMapsApiKey ? (
            <div
              className="map-wrapper"
              style={{ height: 280, position: 'relative' }}
              aria-label="Interaktywna mapa Google Maps obiektów sportowych w Łodzi"
            >
              <APIProvider apiKey={googleMapsApiKey} language="pl" region="PL">
                <GoogleMap
                  mapId="DEMO_MAP_ID"
                  defaultCenter={{
                    lat: activeVenueObj.coords[0],
                    lng: activeVenueObj.coords[1],
                  }}
                  defaultZoom={12}
                  gestureHandling="greedy"
                  disableDefaultUI={true}
                  zoomControl={true}
                  internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                  style={{ width: '100%', height: '100%' }}
                >
                  {filteredVenues.map((v) => (
                    <AdvancedMarker
                      key={v.id}
                      position={{ lat: v.coords[0], lng: v.coords[1] }}
                      title={v.name}
                      onClick={() => handleSelectVenue(v)}
                    >
                      <div
                        style={{
                          padding: '4px 8px',
                          borderRadius: 99,
                          background: v.id === activeVenueId ? '#111827' : v.color,
                          color: v.id === activeVenueId ? '#3ED6A3' : '#0E0F14',
                          border:
                            v.id === activeVenueId
                              ? '2px solid #3ED6A3'
                              : '2px solid #FFFFFF',
                          fontWeight: 800,
                          fontSize: 10.5,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.45)',
                          whiteSpace: 'nowrap',
                          cursor: 'pointer',
                        }}
                      >
                        {v.name.split('—')[0].trim()}
                      </div>
                    </AdvancedMarker>
                  ))}

                  {openInfoWindowVenueId &&
                    (() => {
                      const sel = lodzVenues.find((item) => item.id === openInfoWindowVenueId);
                      if (!sel) return null;
                      const selDetails = getVenueLiveDetails(sel, events, bookedVenueSlotIds);
                      return (
                        <InfoWindow
                          position={{ lat: sel.coords[0], lng: sel.coords[1] }}
                          onCloseClick={() => setOpenInfoWindowVenueId(null)}
                          maxWidth={240}
                        >
                          <div style={{ color: '#111827', fontFamily: 'Inter, sans-serif' }}>
                            <div style={{ fontWeight: 800, fontSize: 12.5 }}>{sel.name}</div>
                            <div
                              style={{
                                fontSize: 10.5,
                                fontWeight: 800,
                                color: '#059669',
                                marginTop: 2,
                              }}
                            >
                              ● {selDetails.openStatusLabel}
                            </div>
                            <div style={{ fontSize: 10.5, color: '#4B5563', marginTop: 2 }}>
                              {selDetails.hoursWeekday}
                            </div>
                            <div
                              style={{
                                fontSize: 10.5,
                                fontWeight: 700,
                                color: '#1D4ED8',
                                marginTop: 3,
                              }}
                            >
                              Wolne strefy/korty: {selDetails.freeUnitsCount}/{selDetails.totalUnitsCount} · Wydarzenia: {selDetails.events.length}
                            </div>
                          </div>
                        </InfoWindow>
                      );
                    })()}
                </GoogleMap>
              </APIProvider>
            </div>
          ) : (
            <div
              className="map-wrapper"
              ref={mapContainerRef}
              aria-label="Interaktywna mapa obiektów sportowych w Łodzi"
              style={{ height: 280 }}
            />
          )}

          {/* KARTA SZCZEGÓŁÓW WYBRANEGO OBIEKTU SPORTOWEGO (Z PRZEŁĄCZNIKIEM STREFY / WYDARZENIA) */}
          <div
            ref={venueDetailsRef}
            className="card"
            data-testid="venue-live-details-card"
            style={{
              marginTop: 10,
              marginBottom: 12,
              padding: '13px 14px',
              borderColor: activeVenueObj.color || 'rgba(62, 214, 163, 0.5)',
              background:
                'radial-gradient(circle at 92% 10%, rgba(62, 214, 163, 0.12), transparent 55%), linear-gradient(155deg, var(--bg-surface), var(--bg-elevated))',
            }}
          >
            {/* Pasek statusu otwarcia i kategorii */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 6,
                flexWrap: 'wrap',
                marginBottom: 6,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
                <span className="badge badge-mint" data-testid="venue-open-status-badge">
                  ● {activeVenueDetails.openStatusLabel}
                </span>
                {activeVenueObj.category && (
                  <span
                    className="badge"
                    style={{
                      background: 'var(--bg-elevated)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {activeVenueObj.category}
                  </span>
                )}
                {activeVenueObj.rating && (
                  <span className="badge badge-amber">{activeVenueObj.rating}</span>
                )}
              </div>
              <span
                className="tabular-nums"
                style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--accent-mint-bright)' }}
              >
                {activeVenueObj.activeUsersCount || 18} osób trenuje
              </span>
            </div>

            {/* Tytuł i adres obiektu */}
            <h2 style={{ fontSize: 16, fontWeight: 900, marginBottom: 2 }}>
              {activeVenueObj.name}
            </h2>
            <div
              style={{
                fontSize: 11.5,
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                marginBottom: 10,
              }}
            >
              <MapPin size={12} className="mono-icon" />
              <span>{activeVenueObj.address}</span>
            </div>

            {/* Kompaktowy pasek godzin otwarcia i obłożenia */}
            <div
              style={{
                background: 'var(--bg-elevated)',
                borderRadius: 10,
                padding: '9px 11px',
                marginBottom: 10,
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 6,
                  fontSize: 11,
                  gap: 6,
                  flexWrap: 'wrap',
                }}
              >
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                  🕒 Pn–Pt: {activeVenueDetails.hoursWeekday.replace('Pon–Pt: ', '')} · Weekend:{' '}
                  {activeVenueDetails.hoursWeekend.replace('Sob–Ndz: ', '')}
                </span>
                <span
                  className="tabular-nums"
                  style={{
                    fontSize: 10.5,
                    fontWeight: 800,
                    color:
                      activeVenueDetails.occupancyPct < 65
                        ? 'var(--accent-mint-bright)'
                        : 'var(--accent-amber)',
                  }}
                >
                  {activeVenueDetails.occupancyLabel}
                </span>
              </div>

              <div className="progress-track" style={{ height: 5, marginBottom: 7 }}>
                <div
                  className="progress-fill"
                  style={{
                    width: `${activeVenueDetails.occupancyPct}%`,
                    background:
                      activeVenueDetails.occupancyPct < 65
                        ? 'var(--accent-mint)'
                        : 'var(--accent-strava)',
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {activeVenueDetails.passesAccepted.map((pass) => (
                  <span
                    key={pass}
                    style={{
                      fontSize: 9.5,
                      fontWeight: 700,
                      padding: '2px 7px',
                      borderRadius: 99,
                      background: 'var(--bg-surface)',
                      color: 'var(--text-secondary)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    ✓ {pass}
                  </span>
                ))}
              </div>
            </div>

            {/* Przełącznik sekcji wewnątrz karty obiektu: Strefy vs Wydarzenia */}
            <div className="segmented-tabs" style={{ marginBottom: 10 }}>
              <button
                type="button"
                className={`seg-btn ${venueSectionTab === 'zones' ? 'active' : ''}`}
                onClick={() => setVenueSectionTab('zones')}
              >
                Dostępność stref ({activeVenueDetails.freeUnitsCount}/
                {activeVenueDetails.totalUnitsCount})
              </button>
              <button
                type="button"
                className={`seg-btn ${venueSectionTab === 'events' ? 'active' : ''}`}
                onClick={() => setVenueSectionTab('events')}
              >
                Wydarzenia ({activeVenueDetails.events.length})
              </button>
            </div>

            {venueSectionTab === 'zones' ? (
              <div className="grouped-list" style={{ marginBottom: 0 }}>
                {activeVenueDetails.facilities.map((unit) => {
                  const isFree = unit.status === 'free' || unit.status === 'reserved_by_user';
                  const isBusy = unit.status === 'busy';

                  return (
                    <div
                      key={unit.id}
                      className="list-row"
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 8,
                        padding: '9px 11px',
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 800, fontSize: 12.5 }}>{unit.name}</div>
                        <div style={{ fontSize: 10.5, color: 'var(--text-secondary)', marginTop: 1 }}>
                          {unit.statusLabel}
                        </div>
                      </div>
                      <span
                        className={`badge ${
                          isFree ? 'badge-mint' : isBusy ? 'badge-strava' : 'badge-amber'
                        }`}
                        style={{ fontSize: 9.5, flexShrink: 0 }}
                      >
                        {isFree ? '● Wolny' : isBusy ? '● Zajęty' : '● Ostatnie miejsca'}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 8,
                  }}
                >
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-secondary)' }}>
                    Spotkania grupowe na obiekcie
                  </span>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ width: 'auto', padding: '4px 9px', fontSize: 10.5 }}
                    onClick={() => setShowQuickVenueEventForm((prev) => !prev)}
                  >
                    <Plus size={12} />{' '}
                    {showQuickVenueEventForm ? 'Ukryj formularz' : 'Dodaj wydarzenie'}
                  </button>
                </div>

                {showQuickVenueEventForm && (
                  <div
                    style={{
                      background: 'var(--bg-elevated)',
                      borderRadius: 10,
                      padding: 10,
                      marginBottom: 8,
                      border: '1px solid rgba(62, 214, 163, 0.45)',
                    }}
                  >
                    <div className="form-group" style={{ marginBottom: 7 }}>
                      <label className="form-label" htmlFor="quick-venue-ev-title">
                        Nazwa wydarzenia / sparingu
                      </label>
                      <input
                        id="quick-venue-ev-title"
                        className="form-input"
                        value={quickVenueEventTitle}
                        onChange={(e) => setQuickVenueEventTitle(e.target.value)}
                      />
                    </div>
                    <div className="grid-2" style={{ gap: 8, marginBottom: 8 }}>
                      <div>
                        <label className="form-label" htmlFor="quick-venue-ev-sport">
                          Dyscyplina
                        </label>
                        <select
                          id="quick-venue-ev-sport"
                          className="form-select"
                          value={quickVenueEventSport}
                          onChange={(e) => setQuickVenueEventSport(e.target.value)}
                        >
                          <option>Siłownia</option>
                          <option>Tenis</option>
                          <option>Badminton</option>
                          <option>Bieganie</option>
                          <option>Kolarstwo</option>
                          <option>Pływanie</option>
                        </select>
                      </div>
                      <div>
                        <label className="form-label" htmlFor="quick-venue-ev-date">
                          Termin i godzina
                        </label>
                        <input
                          id="quick-venue-ev-date"
                          className="form-input"
                          value={quickVenueEventDate}
                          onChange={(e) => setQuickVenueEventDate(e.target.value)}
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        if (onQuickCreateVenueEvent) {
                          onQuickCreateVenueEvent({
                            venueId: activeVenueObj.id,
                            title:
                              quickVenueEventTitle.trim() ||
                              `Wspólny trening — ${activeVenueObj.name.split('—')[0].trim()}`,
                            sport: quickVenueEventSport,
                            level: 'Średni',
                            date: quickVenueEventDate.trim() || 'Dzisiaj · 19:00',
                            location: `${activeVenueObj.name} (${activeVenueObj.address})`,
                            spotsLimit: 8,
                          });
                        }
                        setShowQuickVenueEventForm(false);
                      }}
                    >
                      <Check size={13} /> Opublikuj wydarzenie
                    </button>
                  </div>
                )}

                {activeVenueDetails.events.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {activeVenueDetails.events.map((ev) => (
                      <div
                        key={ev.id}
                        style={{
                          background: 'var(--bg-elevated)',
                          borderRadius: 10,
                          padding: '9px 11px',
                          border: '1px solid var(--border-subtle)',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 3,
                            gap: 6,
                          }}
                        >
                          <span className="badge badge-strava" style={{ fontSize: 9.5 }}>
                            {ev.sport} · {ev.level}
                          </span>
                          <span
                            className="tabular-nums"
                            style={{
                              fontSize: 10.5,
                              fontWeight: 800,
                              color: 'var(--accent-mint-bright)',
                            }}
                          >
                            Wolne: {Math.max(0, ev.spotsLimit - ev.spotsTaken)}/{ev.spotsLimit}
                          </span>
                        </div>
                        <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 2 }}>
                          {ev.title}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: 'var(--text-secondary)',
                            marginBottom: 7,
                          }}
                        >
                          {ev.date} · Org.: {ev.organizer}
                        </div>
                        <div className="card-actions-row">
                          <button
                            type="button"
                            className={`btn ${
                              ev.joined ? 'btn-secondary' : 'btn-primary'
                            } btn-sm`}
                            onClick={() => onToggleJoinEvent(ev.id)}
                          >
                            {ev.joined ? '✓ Zapisano' : 'Dołącz'}
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => onOpenChatThread(ev.id)}
                          >
                            <MessagesSquare size={12} /> Czat
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    style={{
                      background: 'var(--bg-elevated)',
                      borderRadius: 10,
                      padding: '10px 12px',
                      fontSize: 11.5,
                      color: 'var(--text-secondary)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <span>Brak spotkań grupowych dzisiaj.</span>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      style={{ width: 'auto', padding: '5px 10px', fontSize: 11 }}
                      onClick={() => setShowQuickVenueEventForm(true)}
                    >
                      <Plus size={12} /> Utwórz
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 8,
              padding: '0 2px',
            }}
          >
            <span style={{ fontSize: 12.5, fontWeight: 800 }}>
              Obiekty w Łodzi ({filteredVenues.length})
            </span>
            {filteredVenues.length > 5 && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ width: 'auto', padding: '4px 10px', fontSize: 10.5 }}
                onClick={() => setShowAllVenues((prev) => !prev)}
              >
                {showAllVenues
                  ? 'Pokaż mniej (5)'
                  : `Pokaż wszystkie (${filteredVenues.length})`}
              </button>
            )}
          </div>

          <div className="grouped-list">
            {(showAllVenues ? filteredVenues : filteredVenues.slice(0, 5)).map((v) => {
              const vDetails = getVenueLiveDetails(v, events, bookedVenueSlotIds);
              const isSelected = v.id === activeVenueId;
              return (
                <div
                  key={v.id}
                  className="list-row"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 12px',
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(62, 214, 163, 0.08)' : undefined,
                  }}
                  onClick={() => handleSelectVenue(v, true)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSelectVenue(v, true);
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9, flex: 1, minWidth: 0 }}>
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        background: v.color,
                        display: 'inline-block',
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          flexWrap: 'wrap',
                        }}
                      >
                        <span style={{ fontWeight: 800, fontSize: 13 }}>{v.name}</span>
                        <span
                          className="badge badge-mint"
                          style={{ fontSize: 9, padding: '1px 6px' }}
                        >
                          Wolne: {vDetails.freeUnitsCount}/{vDetails.totalUnitsCount}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: 'var(--text-secondary)',
                          marginTop: 2,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {v.sub} · {vDetails.hoursWeekday}
                      </div>
                    </div>
                  </div>
                  <Navigation size={14} className="mono-icon" style={{ flexShrink: 0 }} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* POD-WIDOK 6: CZATY INDYWIDUALNE I GRUPOWE */}
      {subTab === 'messages' && (
        <div>
          {activeThread ? (
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingBottom: 10,
                  marginBottom: 12,
                  borderBottom: '1px solid var(--border-divider)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <HumanAvatar config={activeThread.avatar} size={40} showOnline />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14.5 }}>{activeThread.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--accent-mint-bright)' }}>
                      {activeThread.subtitle}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ width: 'auto', padding: '6px 10px' }}
                  onClick={onCloseChatThread}
                >
                  Lista czatów
                </button>
              </div>

              <div className="chat-container">
                {activeThread.messages.map((m, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-end',
                      justifyContent: m.incoming ? 'flex-start' : 'flex-end',
                      gap: 8,
                    }}
                  >
                    {m.incoming && (
                      <HumanAvatar config={activeThread.avatar} size={28} />
                    )}
                    <div className={`chat-bubble ${m.incoming ? 'incoming' : 'outgoing'}`}>
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          opacity: 0.78,
                          marginBottom: 3,
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: 8,
                        }}
                      >
                        <span>{m.sender}</span>
                        <span>{m.time}</span>
                      </div>
                      <div style={{ lineHeight: 1.4 }}>{m.text}</div>
                    </div>
                  </div>
                ))}

                {isPartnerTyping && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <HumanAvatar config={activeThread.avatar} size={28} />
                    <div
                      className="chat-bubble incoming"
                      style={{
                        padding: '10px 14px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <span className="ai-typing-dots" aria-label="Partner pisze odpowiedź">
                        <span className="ai-typing-dot" />
                        <span className="ai-typing-dot" />
                        <span className="ai-typing-dot" />
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Napisz wiadomość (np. O której jutro startujemy w Arturówku?)..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && chatInput.trim()) {
                      onSendPartnerMessage(chatInput.trim());
                      setChatInput('');
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ width: 'auto', padding: '0 16px' }}
                  onClick={() => {
                    if (!chatInput.trim()) return;
                    onSendPartnerMessage(chatInput.trim());
                    setChatInput('');
                  }}
                  aria-label="Wyślij wiadomość"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div>
              <h1 className="page-title" style={{ marginBottom: 4 }}>
                Wiadomości i czaty
              </h1>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 14 }}>
                Konwersacje z partnerami treningowymi oraz czaty grupowe wydarzeń
              </p>
              <div className="grouped-list">
                {Object.values(chatThreads).map((t) => {
                  const lastMsg = t.messages[t.messages.length - 1];
                  return (
                    <div
                      key={t.id}
                      className="list-row"
                      style={{ cursor: 'pointer' }}
                      onClick={() => onOpenChatThread(t.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') onOpenChatThread(t.id);
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                        <HumanAvatar config={t.avatar} size={44} showOnline={t.online} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <strong style={{ fontSize: 13.5 }}>{t.title}</strong>
                            <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                              {lastMsg.time}
                            </span>
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              color: 'var(--text-secondary)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              marginTop: 2,
                            }}
                          >
                            {lastMsg.sender}: {lastMsg.text}
                          </div>
                        </div>
                      </div>
                      <ChevronRight size={16} className="mono-icon" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface CreateEventScreenProps {
  onCreateEvent: (data: {
    title: string;
    sport: string;
    level: string;
    date: string;
    location: string;
    spotsLimit: number;
  }) => void;
}

export const CreateEventScreen: React.FC<CreateEventScreenProps> = ({ onCreateEvent }) => {
  const [title, setTitle] = useState('Gra w badmintona — szukam partnera');
  const [sport, setSport] = useState('Badminton');
  const [level, setLevel] = useState('Średni');
  const [date, setDate] = useState('Czwartek, 29 października · 19:00');
  const [location, setLocation] = useState('VeraSport Łódź, ul. Siewna 15');
  const [spotsLimit, setSpotsLimit] = useState(4);

  return (
    <div>
      <h1 className="page-title">Nowe wydarzenie</h1>

      <div className="card">
        <div className="form-group">
          <label className="form-label" htmlFor="ev-title">
            Nazwa spotkania
          </label>
          <input
            id="ev-title"
            className="form-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label" htmlFor="ev-sport">
              Dyscyplina
            </label>
            <select
              id="ev-sport"
              className="form-select"
              value={sport}
              onChange={(e) => setSport(e.target.value)}
            >
              <option>Badminton</option>
              <option>Tenis</option>
              <option>Siłownia</option>
              <option>Kolarstwo</option>
              <option>Bieganie</option>
              <option>Piłka nożna</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="ev-level">
              Poziom
            </label>
            <select
              id="ev-level"
              className="form-select"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
            >
              <option>Początkujący</option>
              <option>Średni</option>
              <option>Zaawansowany</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="ev-date">
            Data i godzina
          </label>
          <input
            id="ev-date"
            className="form-input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="ev-loc">
            Obiekt sportowy w Łodzi
          </label>
          <input
            id="ev-loc"
            className="form-input"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="ev-limit">
            Limit uczestników
          </label>
          <input
            id="ev-limit"
            type="number"
            className="form-input tabular-nums"
            value={spotsLimit}
            onChange={(e) => setSpotsLimit(Number(e.target.value) || 4)}
          />
        </div>
        <button
          type="button"
          className="btn btn-strava"
          onClick={() =>
            onCreateEvent({
              title: title.trim() || 'Wspólny trening',
              sport,
              level,
              date,
              location,
              spotsLimit,
            })
          }
        >
          Opublikuj wydarzenie
        </button>
      </div>
    </div>
  );
};

interface CreateGroupScreenProps {
  onCreateGroup: (data: { name: string; sport: string; desc: string }) => void;
}

export const CreateGroupScreen: React.FC<CreateGroupScreenProps> = ({ onCreateGroup }) => {
  const [name, setName] = useState('Kalistenika i Street Workout — Łódź');
  const [sport, setSport] = useState('Siłownia / Kalistenika');
  const [desc, setDesc] = useState(
    'Wspólne treningi na drążkach w Parku na Zdrowiu i Parku Poniatowskiego. Dzielimy się progresją w podciąganiu z ciężarem i umawiamy na treningi.'
  );

  return (
    <div>
      <span className="badge badge-mint" style={{ marginBottom: 6 }}>
        Społeczność SportMate
      </span>
      <h1 className="page-title">Nowa grupa</h1>

      <div className="card">
        <div className="form-group">
          <label className="form-label" htmlFor="grp-name">
            Nazwa grupy
          </label>
          <input
            id="grp-name"
            className="form-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="grp-sport">
            Główna dyscyplina
          </label>
          <select
            id="grp-sport"
            className="form-select"
            value={sport}
            onChange={(e) => setSport(e.target.value)}
          >
            <option>Siłownia / Kalistenika</option>
            <option>Kolarstwo</option>
            <option>Bieganie</option>
            <option>Tenis ziemny</option>
            <option>Pływanie — Zatoka Sportu</option>
            <option>Badminton / Squash</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="grp-desc">
            Opis grupy (cel i miejsca spotkań)
          </label>
          <textarea
            id="grp-desc"
            className="form-textarea"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() =>
            onCreateGroup({
              name: name.trim() || 'Grupa Sportowa Łódź',
              sport,
              desc: desc.trim() || 'Grupa społeczności SportMate w Łodzi.',
            })
          }
        >
          <Users size={16} />
          Utwórz grupę i otwórz tablicę
        </button>
      </div>
    </div>
  );
};
