import React, { useState } from 'react';
import { Shuffle, Sparkles, Check, Award } from 'lucide-react';
import {
  HumanAccessory,
  HumanAvatarConfig,
  HumanExpression,
  HumanEyeColor,
  HumanFacialHair,
  HumanHairColor,
  HumanHairStyle,
  HumanOutfitStyle,
  HumanSkinTone,
  HumanSportProp,
  ScreenName,
} from '../../types/sportmate';
import { HumanAvatar } from './HumanAvatar';

interface AvatarCreatorScreenProps {
  avatar: HumanAvatarConfig;
  userName: string;
  onUpdateAvatar: (next: HumanAvatarConfig) => void;
  onNavigate: (screen: ScreenName) => void;
  onOpenTab: (tab: ScreenName) => void;
  onShowToast: (msg: string) => void;
}

const SKIN_TONES: { hex: HumanSkinTone; label: string }[] = [
  { hex: '#FFE6D4', label: 'Porcelanowy' },
  { hex: '#FCD7B6', label: 'Jasny' },
  { hex: '#F3B991', label: 'Ciepły beż' },
  { hex: '#E09869', label: 'Oliwkowy' },
  { hex: '#BA7448', label: 'Złocisty brąz' },
  { hex: '#7D492A', label: 'Głęboki brąz' },
];

const EYE_COLORS: { hex: HumanEyeColor; label: string }[] = [
  { hex: '#2E6F95', label: 'Błękit oceanu' },
  { hex: '#3D8C5A', label: 'Szmaragdowy' },
  { hex: '#5C3A21', label: 'Orzechowy brąz' },
  { hex: '#232733', label: 'Głęboki onyks' },
  { hex: '#8A6236', label: 'Bursztynowy' },
  { hex: '#7C4DFF', label: 'Fiolet indygo' },
];

const HAIR_STYLES: { id: HumanHairStyle; label: string }[] = [
  { id: 'short-fade', label: 'Krótki Fade' },
  { id: 'undercut', label: 'Nowoczesny Undercut' },
  { id: 'curly-top', label: 'Lokowany Top' },
  { id: 'spiky', label: 'Dynamiczny' },
  { id: 'ponytail', label: 'Kucyk Sport' },
  { id: 'wavy-bob', label: 'Falowany Bob' },
  { id: 'bun', label: 'Wysoki Kok' },
  { id: 'braids', label: 'Warkocze Biegowe' },
  { id: 'afro-puff', label: 'Podwójny Puff' },
  { id: 'buzz', label: 'Buzz Cut' },
];

const HAIR_COLORS: { hex: HumanHairColor; label: string }[] = [
  { hex: '#181B26', label: 'Kruczoczarny' },
  { hex: '#4A2F20', label: 'Ciemny brąz' },
  { hex: '#8C4427', label: 'Kasztanowy' },
  { hex: '#E6B84D', label: 'Złoty blond' },
  { hex: '#D95338', label: 'Ognisty rudy' },
  { hex: '#E2E8F0', label: 'Platynowy' },
  { hex: '#2563EB', label: 'Kobaltowy akcent' },
];

const EXPRESSIONS: { id: HumanExpression; label: string }[] = [
  { id: 'smile', label: 'Pewny uśmiech' },
  { id: 'determined', label: 'Bojowe skupienie' },
  { id: 'hyped', label: 'Euforia po PR!' },
  { id: 'wink', label: 'Mrugnięcie' },
  { id: 'focused', label: 'Strefa Tempo' },
  { id: 'proud', label: 'Duma Zwycięzcy' },
];

const FACIAL_HAIRS: { id: HumanFacialHair; label: string }[] = [
  { id: 'none', label: 'Brak' },
  { id: 'stubble', label: 'Lekki zarost' },
  { id: 'beard', label: 'Pełna broda' },
  { id: 'mustache', label: 'Wąsy' },
  { id: 'goatee', label: 'Bródka Goatee' },
];

const OUTFIT_STYLES: { id: HumanOutfitStyle; label: string }[] = [
  { id: 'jersey', label: 'Koszulka SportMate' },
  { id: 'compression', label: 'Zbroja Kompresyjna' },
  { id: 'hoodie', label: 'Bluza Rozgrzewkowa' },
  { id: 'tank-top', label: 'Tank Top Siłowy' },
  { id: 'cycling-aero', label: 'Trykot Kolarski Aero' },
];

const ACCESSORIES: { id: HumanAccessory; label: string }[] = [
  { id: 'headband', label: 'Opaska Pomarańcz' },
  { id: 'sweatband-mint', label: 'Opaska Mint Pro' },
  { id: 'cycling-glasses', label: 'Okulary Szosowe' },
  { id: 'glasses', label: 'Okulary Smart' },
  { id: 'headphones', label: 'Słuchawki Bezprzewodowe' },
  { id: 'cap', label: 'Czapka Biegowa' },
  { id: 'visor', label: 'Daszek Tenisowy' },
  { id: 'none', label: 'Brak' },
];

const SPORT_PROPS: { id: HumanSportProp; label: string }[] = [
  { id: 'watch', label: 'Zegarek Garmin GPS' },
  { id: 'dumbbell', label: 'Hantel Siłowy' },
  { id: 'bottle', label: 'Bidon Izotonik' },
  { id: 'racket', label: 'Rakieta Tenisowa' },
  { id: 'medal', label: 'Złoty Medal KOM' },
  { id: 'none', label: 'Brak atrybutu' },
];

const OUTFIT_COLORS: { hex: string; label: string }[] = [
  { hex: '#3ED6A3', label: 'Mint (Gotowość)' },
  { hex: '#FF6B35', label: 'Strava (Wysiłek)' },
  { hex: '#6366F1', label: 'Indigo (AI)' },
  { hex: '#38BDF8', label: 'Water (Tlen)' },
  { hex: '#F59E0B', label: 'Gold (Rekordy)' },
  { hex: '#EC4899', label: 'Energia (Róż)' },
];

const BG_COLORS: { hex: string; label: string }[] = [
  { hex: '#1E2130', label: 'Grafit OLED' },
  { hex: '#142924', label: 'Szmaragd' },
  { hex: '#2B1B17', label: 'Wulkan' },
  { hex: '#191D38', label: 'Nocny Indygo' },
  { hex: '#132636', label: 'Głębia Wody' },
  { hex: '#2A1B2E', label: 'Ametyst' },
];

const ATHLETE_PRESETS: { name: string; badge: string; config: HumanAvatarConfig }[] = [
  {
    name: 'Dzik z Zatoki PŁ',
    badge: 'Siłownia',
    config: {
      skinTone: '#F3B991',
      hairStyle: 'undercut',
      hairColor: '#181B26',
      eyeColor: '#2E6F95',
      expression: 'determined',
      facialHair: 'stubble',
      accessory: 'headphones',
      outfitStyle: 'compression',
      outfitColor: '#3ED6A3',
      sportProp: 'dumbbell',
      bgColor: '#142924',
    },
  },
  {
    name: 'Szosowiec KOM',
    badge: 'Kolarstwo',
    config: {
      skinTone: '#FCD7B6',
      hairStyle: 'spiky',
      hairColor: '#4A2F20',
      eyeColor: '#3D8C5A',
      expression: 'focused',
      facialHair: 'none',
      accessory: 'cycling-glasses',
      outfitStyle: 'cycling-aero',
      outfitColor: '#FF6B35',
      sportProp: 'bottle',
      bgColor: '#2B1B17',
    },
  },
  {
    name: 'Biegaczka Poniatowski',
    badge: 'Bieganie',
    config: {
      skinTone: '#FFE6D4',
      hairStyle: 'ponytail',
      hairColor: '#E6B84D',
      eyeColor: '#2E6F95',
      expression: 'hyped',
      facialHair: 'none',
      accessory: 'visor',
      outfitStyle: 'tank-top',
      outfitColor: '#38BDF8',
      sportProp: 'watch',
      bgColor: '#132636',
    },
  },
  {
    name: 'Mistrz Strava Łódź',
    badge: 'Rekordzista',
    config: {
      skinTone: '#E09869',
      hairStyle: 'curly-top',
      hairColor: '#8C4427',
      eyeColor: '#8A6236',
      expression: 'proud',
      facialHair: 'goatee',
      accessory: 'sweatband-mint',
      outfitStyle: 'hoodie',
      outfitColor: '#F59E0B',
      sportProp: 'medal',
      bgColor: '#191D38',
    },
  },
];

export const AvatarCreatorScreen: React.FC<AvatarCreatorScreenProps> = ({
  avatar,
  userName,
  onUpdateAvatar,
  onNavigate,
  onOpenTab,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'face' | 'hair' | 'outfit' | 'gear'>('face');

  const updateProp = <K extends keyof HumanAvatarConfig>(key: K, val: HumanAvatarConfig[K]) => {
    onUpdateAvatar({
      ...avatar,
      [key]: val,
    });
  };

  const randomizeAvatar = () => {
    const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
    onUpdateAvatar({
      skinTone: pick(SKIN_TONES).hex,
      hairStyle: pick(HAIR_STYLES).id,
      hairColor: pick(HAIR_COLORS).hex,
      eyeColor: pick(EYE_COLORS).hex,
      expression: pick(EXPRESSIONS).id,
      facialHair: pick(FACIAL_HAIRS).id,
      accessory: pick(ACCESSORIES).id,
      outfitStyle: pick(OUTFIT_STYLES).id,
      outfitColor: pick(OUTFIT_COLORS).hex,
      sportProp: pick(SPORT_PROPS).id,
      bgColor: pick(BG_COLORS).hex,
    });
    onShowToast('Wylosowano nową stylizację ludzkiego awatara!');
  };

  const currentOutfitLabel =
    OUTFIT_STYLES.find((o) => o.id === (avatar.outfitStyle || 'jersey'))?.label || 'Koszulka SportMate';
  const currentPropLabel =
    SPORT_PROPS.find((p) => p.id === (avatar.sportProp || 'none'))?.label || 'Brak atrybutu';

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span className="badge badge-mint">Kreator Postaci 2D</span>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={randomizeAvatar}
          style={{ padding: '5px 10px', fontSize: 11 }}
        >
          <Shuffle size={13} /> Losuj wygląd
        </button>
      </div>
      <h1 className="page-title" style={{ marginBottom: 10 }}>
        Twój Awatar
      </h1>

      {/* Scena podglądu na żywo */}
      <div className="mascot-stage" style={{ padding: '16px 14px' }}>
        <div className="mascot-floating">
          <HumanAvatar config={avatar} size={124} showOnline />
        </div>
        <div style={{ marginTop: 10, fontWeight: 800, fontSize: 16 }}>{userName}</div>
        <div
          style={{
            display: 'flex',
            gap: 6,
            flexWrap: 'wrap',
            justifyContent: 'center',
            marginTop: 6,
          }}
        >
          <span className="badge badge-indigo" style={{ fontSize: 10 }}>
            {currentOutfitLabel}
          </span>
          <span className="badge badge-strava" style={{ fontSize: 10 }}>
            {currentPropLabel}
          </span>
        </div>
      </div>

      {/* Szybkie style sportowców (1-klik) */}
      <div className="card" style={{ padding: 12, marginBottom: 12 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 8,
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Gotowe style sportowców (1-klik)
          </span>
          <Award size={14} color="#3ED6A3" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8 }}>
          {ATHLETE_PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => {
                onUpdateAvatar(preset.config);
                onShowToast(`Załadowano styl: ${preset.name}`);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '7px 8px',
                borderRadius: 12,
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                cursor: 'pointer',
                textAlign: 'left',
                color: 'var(--text-primary)',
                minWidth: 0,
                width: '100%',
                overflow: 'hidden',
              }}
            >
              <HumanAvatar config={preset.config} size={34} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {preset.name}
                </div>
                <div style={{ fontSize: 10, color: '#3ED6A3', fontWeight: 700 }}>{preset.badge}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 4 Zakładki kategorii kastomizacji */}
      <div className="segmented-control" role="tablist" aria-label="Kategorie personalizacji awatara">
        <button
          type="button"
          className={`segment-btn ${activeTab === 'face' ? 'active' : ''}`}
          onClick={() => setActiveTab('face')}
        >
          Twarz i Oczy
        </button>
        <button
          type="button"
          className={`segment-btn ${activeTab === 'hair' ? 'active' : ''}`}
          onClick={() => setActiveTab('hair')}
        >
          Włosy
        </button>
        <button
          type="button"
          className={`segment-btn ${activeTab === 'outfit' ? 'active' : ''}`}
          onClick={() => setActiveTab('outfit')}
        >
          Strój
        </button>
        <button
          type="button"
          className={`segment-btn ${activeTab === 'gear' ? 'active' : ''}`}
          onClick={() => setActiveTab('gear')}
        >
          Sprzęt
        </button>
      </div>

      <div className="card">
        {activeTab === 'face' && (
          <>
            <div className="form-group">
              <div className="form-label">1. Odcień skóry (Z miękkim cieniowaniem)</div>
              <div className="color-swatch-row">
                {SKIN_TONES.map((s) => (
                  <button
                    key={s.hex}
                    type="button"
                    className={`color-swatch ${avatar.skinTone === s.hex ? 'active' : ''}`}
                    style={{ background: s.hex }}
                    onClick={() => updateProp('skinTone', s.hex)}
                    title={s.label}
                    aria-label={`Odcień skóry ${s.label}`}
                  />
                ))}
              </div>
            </div>

            <div className="form-group">
              <div className="form-label">2. Kolor tęczówek oczu</div>
              <div className="color-swatch-row">
                {EYE_COLORS.map((ec) => (
                  <button
                    key={ec.hex}
                    type="button"
                    className={`color-swatch ${(avatar.eyeColor || '#2E6F95') === ec.hex ? 'active' : ''}`}
                    style={{ background: ec.hex }}
                    onClick={() => updateProp('eyeColor', ec.hex)}
                    title={ec.label}
                    aria-label={`Kolor oczu ${ec.label}`}
                  />
                ))}
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <div className="form-label">3. Wyraz twarzy i emocje treningowe</div>
              <div className="chips-grid">
                {EXPRESSIONS.map((exp) => (
                  <button
                    key={exp.id}
                    type="button"
                    className={`choice-chip ${avatar.expression === exp.id ? 'selected' : ''}`}
                    onClick={() => updateProp('expression', exp.id)}
                  >
                    {exp.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'hair' && (
          <>
            <div className="form-group">
              <div className="form-label">1. Styl fryzury</div>
              <div className="chips-grid">
                {HAIR_STYLES.map((hs) => (
                  <button
                    key={hs.id}
                    type="button"
                    className={`choice-chip ${avatar.hairStyle === hs.id ? 'selected' : ''}`}
                    onClick={() => updateProp('hairStyle', hs.id)}
                  >
                    {hs.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <div className="form-label">2. Kolor włosów</div>
              <div className="color-swatch-row">
                {HAIR_COLORS.map((hc) => (
                  <button
                    key={hc.hex}
                    type="button"
                    className={`color-swatch ${avatar.hairColor === hc.hex ? 'active' : ''}`}
                    style={{ background: hc.hex }}
                    onClick={() => updateProp('hairColor', hc.hex)}
                    title={hc.label}
                    aria-label={`Kolor włosów ${hc.label}`}
                  />
                ))}
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <div className="form-label">3. Zarost</div>
              <div className="chips-grid">
                {FACIAL_HAIRS.map((fh) => (
                  <button
                    key={fh.id}
                    type="button"
                    className={`choice-chip ${avatar.facialHair === fh.id ? 'selected' : ''}`}
                    onClick={() => updateProp('facialHair', fh.id)}
                  >
                    {fh.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'outfit' && (
          <>
            <div className="form-group">
              <div className="form-label">1. Krój stroju sportowego</div>
              <div className="chips-grid">
                {OUTFIT_STYLES.map((os) => (
                  <button
                    key={os.id}
                    type="button"
                    className={`choice-chip ${(avatar.outfitStyle || 'jersey') === os.id ? 'selected' : ''}`}
                    onClick={() => updateProp('outfitStyle', os.id)}
                  >
                    {os.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <div className="form-label">2. Kolor stroju treningowego (Tokeny SportMate)</div>
              <div className="color-swatch-row">
                {OUTFIT_COLORS.map((col) => (
                  <button
                    key={col.hex}
                    type="button"
                    className={`color-swatch ${avatar.outfitColor === col.hex ? 'active' : ''}`}
                    style={{ background: col.hex }}
                    onClick={() => updateProp('outfitColor', col.hex)}
                    title={col.label}
                    aria-label={`Kolor koszulki ${col.label}`}
                  />
                ))}
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <div className="form-label">3. Tło pierścienia awatara</div>
              <div className="color-swatch-row">
                {BG_COLORS.map((bg) => (
                  <button
                    key={bg.hex}
                    type="button"
                    className={`color-swatch ${avatar.bgColor === bg.hex ? 'active' : ''}`}
                    style={{ background: bg.hex }}
                    onClick={() => updateProp('bgColor', bg.hex)}
                    title={bg.label}
                    aria-label={`Tło awatara ${bg.label}`}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'gear' && (
          <>
            <div className="form-group">
              <div className="form-label">1. Akcesoria na głowę i oczy</div>
              <div className="chips-grid">
                {ACCESSORIES.map((acc) => (
                  <button
                    key={acc.id}
                    type="button"
                    className={`choice-chip ${avatar.accessory === acc.id ? 'selected' : ''}`}
                    onClick={() => updateProp('accessory', acc.id)}
                  >
                    {acc.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <div className="form-label">2. Atrybut sportowy na pierwszym planie</div>
              <div className="chips-grid">
                {SPORT_PROPS.map((prop) => (
                  <button
                    key={prop.id}
                    type="button"
                    className={`choice-chip ${(avatar.sportProp || 'none') === prop.id ? 'selected' : ''}`}
                    onClick={() => updateProp('sportProp', prop.id)}
                  >
                    {prop.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          type="button"
          className="btn btn-secondary"
          style={{ flex: 1 }}
          onClick={() => onNavigate('onboarding-setup')}
        >
          <Sparkles size={15} /> Cele sportowe
        </button>
        <button
          type="button"
          className="btn btn-primary"
          style={{ flex: 1 }}
          onClick={() => {
            onShowToast('Zapisano wygląd Twojego ludzkiego awatara!');
            onOpenTab('profile');
          }}
        >
          <Check size={15} /> Zapisz Awatar
        </button>
      </div>
    </div>
  );
};
