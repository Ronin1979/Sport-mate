import React, { useState } from 'react';
import {
  ArrowRight,
  Bot,
  Check,
  Flame,
  LogIn,
  Plus,
  ShieldCheck,
  UserPlus,
  Users,
} from 'lucide-react';
import {
  GlobalMascotVariant,
  RegistrationFormData,
  ScreenName,
  UserProfile,
} from '../../types/sportmate';
import { validateRegistrationForm } from '../../utils/formatters';
import { GlobalMascot } from '../mascot/GlobalMascot';

interface SplashScreenProps {
  mascotVariant: GlobalMascotVariant;
  onToggleMascotVariant: () => void;
  onNavigate: (screen: ScreenName) => void;
  onOpenTab: (tab: ScreenName) => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  mascotVariant,
  onToggleMascotVariant,
  onNavigate,
  onOpenTab,
}) => {
  return (
    <div
      style={{
        minHeight: 740,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '18px 4px 10px 4px',
      }}
    >
      <div style={{ textAlign: 'center', marginTop: 8 }}>
        <div
          style={{ marginBottom: 4, cursor: 'pointer', display: 'inline-block' }}
          onClick={onToggleMascotVariant}
          title="Kliknij Rysia, aby zobaczyć animację!"
        >
          <GlobalMascot size={162} mood="happy" variant={mascotVariant} floating />
        </div>
        <h1
          style={{
            fontSize: 32,
            fontWeight: 800,
            letterSpacing: '-1px',
            color: 'var(--text-primary)',
            lineHeight: 1.05,
          }}
        >
          Sport<span style={{ color: 'var(--accent-mint-bright)' }}>Mate</span>
        </h1>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '3.5px',
            color: 'var(--accent-strava)',
            margin: '7px 0 10px 0',
            textTransform: 'uppercase',
          }}
        >
          Move Together · Łódź
        </div>
        <p
          style={{
            fontSize: 12.5,
            color: 'var(--text-secondary)',
            maxWidth: 310,
            margin: '0 auto',
            lineHeight: 1.45,
          }}
        >
          Plany treningowe, mapa mięśni, licznik makro i społeczność sportowa w jednym miejscu.
        </p>
      </div>

      <div className="grouped-list" style={{ margin: '12px 0' }}>
        <div className="list-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="icon-box" style={{ color: 'var(--accent-strava)' }}>
              <Flame size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13.5 }}>Trening siłowy i mapa sylwetki</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Plany FBW/Split, historia sesji oraz rangi mięśniowe
              </div>
            </div>
          </div>
        </div>
        <div className="list-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="icon-box" style={{ color: 'var(--accent-mint-bright)' }}>
              <Users size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13.5 }}>Społeczność, trenerzy i rankingi</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Partnerzy treningowi, grupy oraz segmenty Strava w Łodzi
              </div>
            </div>
          </div>
        </div>
        <div className="list-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="icon-box" style={{ color: 'var(--accent-water)' }}>
              <Bot size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13.5 }}>Trener AI i dziennik diety</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Szybkie wskazówki techniczne oraz baza produktów FatSecret
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dwa wyraźne przyciski zgodne ze specyfikacją: Załóż nowe konto oraz Zaloguj się */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => onNavigate('onboarding-register')}
        >
          <UserPlus size={16} />
          Załóż nowe konto
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => onNavigate('onboarding-login')}
        >
          <LogIn size={16} />
          Zaloguj się
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          style={{ margin: '2px auto' }}
          onClick={() => onOpenTab('today')}
        >
          Przejdź bezpośrednio do aplikacji
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};

interface LoginScreenProps {
  defaultEmail: string;
  onLoginSuccess: (email: string) => void;
  onNavigate: (screen: ScreenName) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  defaultEmail,
  onLoginSuccess,
  onNavigate,
}) => {
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState('••••••••••••');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
      setError('Podaj prawidłowy adres e-mail.');
      return;
    }
    if (password.length < 4) {
      setError('Podaj hasło do konta.');
      return;
    }
    setError('');
    onLoginSuccess(email);
  };

  return (
    <div>
      <span className="badge badge-mint" style={{ marginBottom: 8 }}>
        Autoryzacja SportMate
      </span>
      <h1 className="page-title">Zaloguj się</h1>

      <form className="card" onSubmit={handleLogin}>
        <div className="form-group">
          <label className="form-label" htmlFor="login-email">
            Adres e-mail
          </label>
          <input
            id="login-email"
            type="email"
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="login-password">
            Hasło
          </label>
          <input
            id="login-password"
            type="password"
            className="form-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && (
          <div
            role="alert"
            style={{
              fontSize: 12,
              color: 'var(--accent-error)',
              fontWeight: 600,
              marginBottom: 10,
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
          <button type="submit" className="btn btn-primary">
            <LogIn size={16} />
            Zaloguj się do konta
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => onLoginSuccess(email)}
          >
            <ShieldCheck size={16} />
            Kontynuuj przez Apple / Google
          </button>
        </div>
      </form>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 12,
          padding: '0 4px',
        }}
      >
        <button
          type="button"
          className="section-link"
          onClick={() => onNavigate('onboarding-recover')}
        >
          Nie pamiętasz hasła?
        </button>
        <button
          type="button"
          className="section-link"
          onClick={() => onNavigate('onboarding-register')}
        >
          Załóż nowe konto
        </button>
      </div>
    </div>
  );
};

interface RegisterScreenProps {
  initialUser: UserProfile;
  onCompleteRegistration: (data: RegistrationFormData) => void;
  onNavigate: (screen: ScreenName) => void;
}

const LODZ_DISTRICTS = [
  'Łódź, Śródmieście / Polesie',
  'Łódź, Bałuty / Manufaktura',
  'Łódź, Widzew',
  'Łódź, Górna',
  'Łódź, Retkinia / Zdrowie',
  'Łódź, Łagiewniki / Arturówek',
];

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  initialUser,
  onCompleteRegistration,
  onNavigate,
}) => {
  const [formData, setFormData] = useState<RegistrationFormData>({
    fullName: initialUser.name,
    email: initialUser.email,
    password: 'SportMate2026!',
    age: initialUser.age,
    gender: initialUser.gender,
    heightCm: initialUser.heightCm,
    weightKg: initialUser.weightKg,
    district: initialUser.city,
    primaryGoal: initialUser.goals[0] || 'Siła',
    acceptTerms: true,
  });
  const [error, setError] = useState('');

  const updateField = <K extends keyof RegistrationFormData>(
    key: K,
    value: RegistrationFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateRegistrationForm(formData);
    if (!validation.valid) {
      setError(validation.error || 'Sprawdź poprawność pól formularza.');
      return;
    }
    setError('');
    onCompleteRegistration(formData);
  };

  return (
    <div>
      <span className="badge badge-mint" style={{ marginBottom: 8 }}>
        Krok 1 z 3 · Nowy profil sportowca
      </span>
      <h1 className="page-title" style={{ marginBottom: 6 }}>
        Załóż nowe konto
      </h1>
      <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.45 }}>
        Wprowadź podstawowe dane profilowe i antropometryczne, aby kalibrować bilans makro i dopasowanie partnerów w Łodzi.
      </p>

      <form className="card" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="reg-fullname">
            Imię i nazwisko
          </label>
          <input
            id="reg-fullname"
            type="text"
            className="form-input"
            placeholder="Np. Mikołaj Kowalski"
            value={formData.fullName}
            onChange={(e) => updateField('fullName', e.target.value)}
          />
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">
              Adres e-mail
            </label>
            <input
              id="reg-email"
              type="email"
              className="form-input"
              placeholder="twoj@email.pl"
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">
              Hasło (min. 6 znaków)
            </label>
            <input
              id="reg-password"
              type="password"
              className="form-input"
              value={formData.password}
              onChange={(e) => updateField('password', e.target.value)}
            />
          </div>
        </div>

        <div className="grid-3">
          <div className="form-group">
            <label className="form-label" htmlFor="reg-age">
              Wiek (lat)
            </label>
            <input
              id="reg-age"
              type="number"
              min={13}
              max={105}
              className="form-input tabular-nums"
              value={formData.age}
              onChange={(e) => updateField('age', Number(e.target.value))}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-height">
              Wzrost (cm)
            </label>
            <input
              id="reg-height"
              type="number"
              min={120}
              max={240}
              className="form-input tabular-nums"
              value={formData.heightCm}
              onChange={(e) => updateField('heightCm', Number(e.target.value))}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-weight">
              Masa ciała (kg)
            </label>
            <input
              id="reg-weight"
              type="number"
              min={35}
              max={220}
              step="0.5"
              className="form-input tabular-nums"
              value={formData.weightKg}
              onChange={(e) => updateField('weightKg', Number(e.target.value))}
            />
          </div>
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label className="form-label" htmlFor="reg-gender">
              Płeć
            </label>
            <select
              id="reg-gender"
              className="form-select"
              value={formData.gender}
              onChange={(e) =>
                updateField('gender', e.target.value as RegistrationFormData['gender'])
              }
            >
              <option value="Mężczyzna">Mężczyzna</option>
              <option value="Kobieta">Kobieta</option>
              <option value="Inna">Inna / Nie podaję</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-goal">
              Priorytet treningowy
            </label>
            <select
              id="reg-goal"
              className="form-select"
              value={formData.primaryGoal}
              onChange={(e) => updateField('primaryGoal', e.target.value)}
            >
              <option value="Siła">Siła i hipertrofia</option>
              <option value="Regularność">Regularność ruchu</option>
              <option value="Kondycja">Kondycja i VO2max</option>
              <option value="Redukcja masy">Redukcja masy ciała</option>
              <option value="Zdrowe nawyki">Zdrowe nawyki</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="reg-district">
            Dzielnica bazowa w Łodzi (Smart Matching)
          </label>
          <select
            id="reg-district"
            className="form-select"
            value={formData.district}
            onChange={(e) => updateField('district', e.target.value)}
          >
            {LODZ_DISTRICTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <label
          htmlFor="reg-terms"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 12,
            color: 'var(--text-secondary)',
            margin: '10px 0',
            cursor: 'pointer',
          }}
        >
          <input
            id="reg-terms"
            type="checkbox"
            checked={formData.acceptTerms}
            onChange={(e) => updateField('acceptTerms', e.target.checked)}
            style={{ accentColor: 'var(--accent-mint-bright)' }}
          />
          Akceptuję regulamin oraz Strefy Prywatności GPS (500 m).
        </label>

        {error && (
          <div
            role="alert"
            style={{
              fontSize: 12,
              color: 'var(--accent-error)',
              fontWeight: 600,
              marginBottom: 10,
            }}
          >
            {error}
          </div>
        )}

        <button type="submit" className="btn btn-primary" style={{ marginTop: 4 }}>
          Utwórz konto i spersonalizuj Awatar
          <ArrowRight size={15} />
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: 10 }}>
        <button
          type="button"
          className="section-link"
          onClick={() => onNavigate('onboarding-login')}
        >
          Masz już konto? Zaloguj się
        </button>
      </div>
    </div>
  );
};

interface RecoverScreenProps {
  defaultEmail: string;
  onShowToast: (msg: string) => void;
  onGoBack: () => void;
}

export const RecoverScreen: React.FC<RecoverScreenProps> = ({
  defaultEmail,
  onShowToast,
  onGoBack,
}) => {
  const [email, setEmail] = useState(defaultEmail);
  return (
    <div>
      <h1 className="page-title">Resetowanie hasła</h1>
      <div className="card">
        <div className="form-group">
          <label className="form-label" htmlFor="recover-email">
            Adres e-mail powiązany z kontem
          </label>
          <input
            id="recover-email"
            type="email"
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            onShowToast('Wysłano link resetujący na adres e-mail');
            onGoBack();
          }}
        >
          Wyślij link resetujący
        </button>
      </div>
    </div>
  );
};

interface SetupScreenProps {
  user: UserProfile;
  onToggleGoal: (goal: string) => void;
  onToggleSport: (sport: string) => void;
  onSetSportLevel: (sport: string, level: string) => void;
  onUpdateCity: (city: string) => void;
  onFinishSetup: () => void;
}

const ALL_GOALS = ['Regularność', 'Kondycja', 'Siła', 'Technika', 'Zdrowe nawyki', 'Redukcja masy'];
const ALL_SPORTS = ['Siłownia', 'Kolarstwo', 'Bieganie', 'Tenis', 'Pływanie', 'Badminton', 'Piłka nożna'];
const LEVELS = ['Początkujący', 'Średni', 'Zaawansowany'];

export const SetupScreen: React.FC<SetupScreenProps> = ({
  user,
  onToggleGoal,
  onToggleSport,
  onSetSportLevel,
  onUpdateCity,
  onFinishSetup,
}) => {
  return (
    <div>
      <span className="badge badge-mint" style={{ marginBottom: 8 }}>
        Krok 3 z 3 · Personalizacja sportowa
      </span>
      <h1 className="page-title">Profil sportowy</h1>

      <div className="card">
        <div className="form-label">1. Cele treningowe</div>
        <div className="chips-grid" style={{ marginTop: 8 }}>
          {ALL_GOALS.map((g) => {
            const active = user.goals.includes(g);
            return (
              <button
                key={g}
                type="button"
                className={`choice-chip ${active ? 'selected' : ''}`}
                onClick={() => onToggleGoal(g)}
              >
                {active ? <Check size={13} /> : <Plus size={13} />}
                {g}
              </button>
            );
          })}
        </div>
      </div>

      <div className="card">
        <div className="form-label">2. Wybrane dyscypliny</div>
        <div className="chips-grid" style={{ marginTop: 8 }}>
          {ALL_SPORTS.map((s) => {
            const active = s in user.sports;
            return (
              <button
                key={s}
                type="button"
                className={`choice-chip ${active ? 'selected' : ''}`}
                onClick={() => onToggleSport(s)}
              >
                {active ? <Check size={13} /> : <Plus size={13} />}
                {s}
              </button>
            );
          })}
        </div>
      </div>

      <div className="card">
        <div className="form-label">3. Poziom zaawansowania</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
          {Object.entries(user.sports).map(([sport, lvl]) => (
            <div
              key={sport}
              style={{ background: 'var(--bg-elevated)', padding: '10px 12px', borderRadius: 14 }}
            >
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>{sport}</div>
              <div className="segmented-control" style={{ marginBottom: 0 }}>
                {LEVELS.map((l) => (
                  <button
                    key={l}
                    type="button"
                    className={`segment-btn ${lvl === l ? 'active' : ''}`}
                    onClick={() => onSetSportLevel(sport, l)}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <label className="form-label" htmlFor="setup-city">
          4. Lokalizacja bazowa
        </label>
        <div className="form-group" style={{ marginTop: 6, marginBottom: 8 }}>
          <input
            id="setup-city"
            className="form-input"
            value={user.city}
            onChange={(e) => onUpdateCity(e.target.value)}
          />
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 12,
            color: 'var(--text-secondary)',
          }}
        >
          <span>Promień wyszukiwania partnerów</span>
          <strong style={{ color: 'var(--text-primary)' }}>{user.radiusKm} km</strong>
        </div>
      </div>

      <button type="button" className="btn btn-primary" onClick={onFinishSetup}>
        Zapisz i przejdź do aplikacji
      </button>
    </div>
  );
};
