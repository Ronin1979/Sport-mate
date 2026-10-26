import React, { useId } from 'react';
import { HumanAvatarConfig } from '../../types/sportmate';

interface HumanAvatarProps {
  config: HumanAvatarConfig;
  size?: number;
  ringColor?: string;
  showOnline?: boolean;
}

/**
 * Dopracowany wektorowy awatar ludzki w stylu postaci z Duolingo (Duolingo World Characters),
 * z miękkim cieniowaniem cel-shading, tęczówkami oczu, strojami treningowymi i atrybutami sportowymi.
 */
export const HumanAvatar: React.FC<HumanAvatarProps> = ({
  config,
  size = 48,
  ringColor,
  showOnline = false,
}) => {
  const uid = useId().replace(/:/g, '');
  const {
    skinTone = '#F3B991',
    hairStyle = 'short-fade',
    hairColor = '#181B26',
    eyeColor = '#2E6F95',
    expression = 'smile',
    facialHair = 'none',
    accessory = 'headband',
    outfitStyle = 'jersey',
    outfitColor = '#3ED6A3',
    sportProp = 'none',
    bgColor = '#1E2130',
  } = config;

  const borderStroke = ringColor || outfitColor || '#3ED6A3';

  return (
    <div
      className="avatar-wrap"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          borderRadius: '50%',
          overflow: 'hidden',
          border: `2.2px solid ${borderStroke}`,
          background: bgColor,
          boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.35)',
        }}
      >
        <defs>
          <clipPath id={`clip-${uid}`}>
            <circle cx="50" cy="50" r="49" />
          </clipPath>
          <radialGradient id={`bgGlow-${uid}`} cx="50%" cy="35%" r="60%">
            <stop offset="0%" stopColor={outfitColor} stopOpacity="0.28" />
            <stop offset="100%" stopColor={bgColor} stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`skinShade-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.08" />
            <stop offset="70%" stopColor="#000000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.16" />
          </linearGradient>
          <linearGradient id={`outfitGrad-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.18" />
            <stop offset="50%" stopColor="#000000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.25" />
          </linearGradient>
        </defs>

        <g clipPath={`url(#clip-${uid})`}>
          {/* Tło koła + subtelny glow za postacią */}
          <circle cx="50" cy="50" r="50" fill={bgColor} />
          <circle cx="50" cy="42" r="44" fill={`url(#bgGlow-${uid})`} />
          <circle cx="50" cy="50" r="47" stroke="#FFFFFF" strokeOpacity="0.05" strokeWidth="1" />

          {/* Tylna warstwa włosów dla rozbudowanych fryzur */}
          {hairStyle === 'ponytail' && (
            <g>
              <path
                d="M 67 34 C 84 31 91 46 84 62 C 77 59 73 50 67 42 Z"
                fill={hairColor}
              />
              <path
                d="M 70 36 C 80 36 84 45 81 55"
                stroke="#FFFFFF"
                strokeOpacity="0.18"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <rect x="65" y="34" width="5" height="8" rx="2.5" fill={outfitColor} />
            </g>
          )}
          {hairStyle === 'bun' && (
            <g>
              <circle cx="50" cy="12" r="11.5" fill={hairColor} />
              <path
                d="M 43 9 Q 50 5 57 9"
                stroke="#FFFFFF"
                strokeOpacity="0.22"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <path d="M 41 19 Q 50 22 59 19" stroke={outfitColor} strokeWidth="3" strokeLinecap="round" />
            </g>
          )}
          {hairStyle === 'afro-puff' && (
            <g fill={hairColor}>
              <circle cx="30" cy="18" r="10.5" />
              <circle cx="70" cy="18" r="10.5" />
              <circle cx="28" cy="16" r="3" fill="#FFFFFF" fillOpacity="0.14" />
              <circle cx="68" cy="16" r="3" fill="#FFFFFF" fillOpacity="0.14" />
            </g>
          )}
          {hairStyle === 'wavy-bob' && (
            <path
              d="M 21 35 C 15 50 17 67 25 72 L 75 72 C 83 67 85 50 79 35 Z"
              fill={hairColor}
            />
          )}
          {hairStyle === 'braids' && (
            <g fill={hairColor}>
              <rect x="21" y="38" width="7" height="33" rx="3.5" />
              <rect x="72" y="38" width="7" height="33" rx="3.5" />
              <circle cx="24.5" cy="70" r="2.6" fill={outfitColor} />
              <circle cx="75.5" cy="70" r="2.6" fill={outfitColor} />
            </g>
          )}

          {/* Szyja i miękki cień pod brodą (Duolingo Cel-Shading) */}
          <rect x="41" y="60" width="18" height="17" rx="7.5" fill={skinTone} />
          <rect x="41" y="60" width="18" height="17" rx="7.5" fill={`url(#skinShade-${uid})`} />
          <path d="M 41 63 Q 50 70 59 63 L 59 68 Q 50 74 41 68 Z" fill="#000000" fillOpacity="0.18" />

          {/* STRÓJ SPORTOWY (5 wariantów: jersey, hoodie, tank-top, cycling-aero, compression) */}
          {outfitStyle === 'tank-top' ? (
            <g>
              {/*Odkryte ramiona atlety*/}
              <path d="M 15 100 C 16 77 30 71 50 71 C 70 71 84 77 85 100 Z" fill={skinTone} />
              {/* Tank top bokserski */}
              <path
                d="M 30 100 L 33 72 L 40 72 Q 50 85 60 72 L 67 72 L 70 100 Z"
                fill={outfitColor}
              />
              <path
                d="M 30 100 L 33 72 L 40 72 Q 50 85 60 72 L 67 72 L 70 100 Z"
                fill={`url(#outfitGrad-${uid})`}
              />
              <path d="M 40 72 Q 50 85 60 72" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
            </g>
          ) : outfitStyle === 'hoodie' ? (
            <g>
              <path d="M 14 100 C 15 76 29 70 50 70 C 71 70 85 76 86 100 Z" fill={outfitColor} />
              <path d="M 14 100 C 15 76 29 70 50 70 C 71 70 85 76 86 100 Z" fill={`url(#outfitGrad-${uid})`} />
              {/* Kaptur wokół szyi */}
              <path
                d="M 31 72 Q 50 84 69 72 C 66 67 61 66 59 66 Q 50 77 41 66 C 39 66 34 67 31 72 Z"
                fill="#0F131F"
                fillOpacity="0.32"
              />
              {/* Troczki bluzy */}
              <line x1="44" y1="76" x2="43" y2="91" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />
              <line x1="56" y1="76" x2="57" y2="91" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />
              <circle cx="43" cy="91" r="1.6" fill="#FFFFFF" />
              <circle cx="57" cy="91" r="1.6" fill="#FFFFFF" />
            </g>
          ) : outfitStyle === 'cycling-aero' ? (
            <g>
              <path d="M 15 100 C 16 77 30 71 50 71 C 70 71 84 77 85 100 Z" fill={outfitColor} />
              <path d="M 15 100 C 16 77 30 71 50 71 C 70 71 84 77 85 100 Z" fill={`url(#outfitGrad-${uid})`} />
              {/* Aero stójka kolarska + suwak */}
              <path d="M 40 69 L 40 75 Q 50 79 60 75 L 60 69" fill="#121521" />
              <line x1="50" y1="74" x2="50" y2="100" stroke="#121521" strokeWidth="2.4" />
              {/* Pasy wyścigowe na piersi */}
              <path d="M 22 86 L 78 86" stroke="#FFFFFF" strokeWidth="4" strokeOpacity="0.85" />
              <path d="M 20 91 L 80 91" stroke="#121521" strokeWidth="2.5" strokeOpacity="0.6" />
            </g>
          ) : outfitStyle === 'compression' ? (
            <g>
              <path d="M 15 100 C 16 77 30 71 50 71 C 70 71 84 77 85 100 Z" fill="#181C2B" />
              {/* Akcentowe panele kompresyjne */}
              <path d="M 15 100 C 17 82 26 75 35 72 L 39 100 Z" fill={outfitColor} />
              <path d="M 85 100 C 83 82 74 75 65 72 L 61 100 Z" fill={outfitColor} />
              <path d="M 39 71 Q 50 78 61 71" stroke={outfitColor} strokeWidth="2.8" strokeLinecap="round" />
              <path d="M 44 83 L 50 79 L 56 83" stroke={outfitColor} strokeWidth="2" strokeLinecap="round" />
            </g>
          ) : (
            <g>
              {/* Domyślna koszulka SportMate Jersey */}
              <path d="M 15 100 C 16 77 30 71 50 71 C 70 71 84 77 85 100 Z" fill={outfitColor} />
              <path d="M 15 100 C 16 77 30 71 50 71 C 70 71 84 77 85 100 Z" fill={`url(#outfitGrad-${uid})`} />
              <path d="M 38 71 Q 50 81 62 71" stroke="#FFFFFF" strokeWidth="3.2" strokeLinecap="round" fill="none" />
              <line x1="27" y1="81" x2="23" y2="100" stroke="#090A0F" strokeWidth="2.5" strokeOpacity="0.28" />
              <line x1="73" y1="81" x2="77" y2="100" stroke="#090A0F" strokeWidth="2.5" strokeOpacity="0.28" />
              {/* Emblemat na piersi */}
              <circle cx="60" cy="84" r="3" fill="#FFFFFF" fillOpacity="0.9" />
            </g>
          )}

          {/* Uszy z wyprofilowanym wnętrzem małżowiny */}
          <circle cx="25.5" cy="47" r="6" fill={skinTone} />
          <path d="M 24 44.5 Q 27 47 24.5 49.5" stroke="#000000" strokeOpacity="0.22" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="74.5" cy="47" r="6" fill={skinTone} />
          <path d="M 76 44.5 Q 73 47 75.5 49.5" stroke="#000000" strokeOpacity="0.22" strokeWidth="1.8" strokeLinecap="round" />

          {/* Głowa (proporcje Duolingo — miękki zaokrąglony kształt z cel-shadingiem) */}
          <rect x="26.5" y="21.5" width="47" height="44.5" rx="22.5" fill={skinTone} />
          <rect x="26.5" y="21.5" width="47" height="44.5" rx="22.5" fill={`url(#skinShade-${uid})`} />
          {/* Subtelny blik światła na czole/policzku */}
          <ellipse cx="38" cy="29" rx="8" ry="3.5" fill="#FFFFFF" fillOpacity="0.14" />

          {/* Rumieńce policzków w stylu Duolingo */}
          <ellipse cx="33.5" cy="50.5" rx="4.5" ry="2.4" fill="#FF6B35" fillOpacity="0.28" />
          <ellipse cx="66.5" cy="50.5" rx="4.5" ry="2.4" fill="#FF6B35" fillOpacity="0.28" />

          {/* OCZY Z TĘCZÓWKAMI + BRWI (6 ekspresji) */}
          {expression === 'wink' ? (
            <>
              {/* Lewe oko mrugające */}
              <path d="M 33.5 43 Q 39 38.5 44.5 43" stroke="#181B26" strokeWidth="2.9" strokeLinecap="round" fill="none" />
              {/* Prawe oko otwarte z tęczówką */}
              <ellipse cx="61" cy="43" rx="4.6" ry="4.8" fill="#FFFFFF" />
              <circle cx="61" cy="43.2" r="3.2" fill={eyeColor} />
              <circle cx="61" cy="43.2" r="1.8" fill="#12141D" />
              <circle cx="62.3" cy="41.8" r="1.2" fill="#FFFFFF" />
              <circle cx="59.8" cy="44.4" r="0.6" fill="#FFFFFF" fillOpacity="0.8" />
              {/* Brwi */}
              <path d="M 33 35.8 Q 39 33.5 44.5 35.8" stroke={hairColor} strokeWidth="2.8" strokeLinecap="round" fill="none" />
              <path d="M 55.5 34.8 Q 61 32.5 67 35.5" stroke={hairColor} strokeWidth="2.8" strokeLinecap="round" fill="none" />
            </>
          ) : expression === 'proud' ? (
            <>
              {/* Dumnie przymknięte oczy zwycięzcy */}
              <path d="M 33.5 43.5 Q 39 39 44.5 43.5" stroke="#181B26" strokeWidth="2.9" strokeLinecap="round" fill="none" />
              <path d="M 55.5 43.5 Q 61 39 66.5 43.5" stroke="#181B26" strokeWidth="2.9" strokeLinecap="round" fill="none" />
              <path d="M 33 35 Q 39 32.5 44.5 35" stroke={hairColor} strokeWidth="2.8" strokeLinecap="round" fill="none" />
              <path d="M 55.5 35 Q 61 32.5 67 35" stroke={hairColor} strokeWidth="2.8" strokeLinecap="round" fill="none" />
            </>
          ) : (
            <>
              {/* Lewe oko z białkiem, tęczówką i podwójnym blikiem */}
              <ellipse cx="39" cy="43" rx="4.6" ry="4.8" fill="#FFFFFF" />
              <circle cx="39" cy="43.2" r="3.2" fill={eyeColor} />
              <circle cx="39" cy="43.2" r="1.8" fill="#12141D" />
              <circle cx="40.3" cy="41.8" r="1.2" fill="#FFFFFF" />
              <circle cx="37.8" cy="44.4" r="0.6" fill="#FFFFFF" fillOpacity="0.8" />

              {/* Prawe oko z białkiem, tęczówką i podwójnym blikiem */}
              <ellipse cx="61" cy="43" rx="4.6" ry="4.8" fill="#FFFFFF" />
              <circle cx="61" cy="43.2" r="3.2" fill={eyeColor} />
              <circle cx="61" cy="43.2" r="1.8" fill="#12141D" />
              <circle cx="62.3" cy="41.8" r="1.2" fill="#FFFFFF" />
              <circle cx="59.8" cy="44.4" r="0.6" fill="#FFFFFF" fillOpacity="0.8" />

              {/* Brwi dopasowane do emocji */}
              {expression === 'determined' || expression === 'focused' ? (
                <>
                  <path d="M 33 35.2 L 45 38.2" stroke={hairColor} strokeWidth="3" strokeLinecap="round" />
                  <path d="M 67 35.2 L 55 38.2" stroke={hairColor} strokeWidth="3" strokeLinecap="round" />
                </>
              ) : (
                <>
                  <path d="M 33.5 35.8 Q 39 33.4 44.5 35.8" stroke={hairColor} strokeWidth="2.8" strokeLinecap="round" fill="none" />
                  <path d="M 55.5 35.8 Q 61 33.4 66.5 35.8" stroke={hairColor} strokeWidth="2.8" strokeLinecap="round" fill="none" />
                </>
              )}
            </>
          )}

          {/* Wyprofilowany nosek w stylu Duolingo */}
          <path
            d="M 50 41.5 L 47.8 48.5 C 49.2 49.6 51.2 49.6 52.4 48.5"
            stroke="#000000"
            strokeOpacity="0.24"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />

          {/* ZAROST (5 wariantów: none, stubble, beard, mustache, goatee) */}
          {facialHair === 'stubble' && (
            <path
              d="M 29.5 51 C 29.5 62.5 39.5 66.5 50 66.5 C 60.5 66.5 70.5 62.5 70.5 51 L 66 51 C 65 59 58 62 50 62 C 42 62 35 59 34 51 Z"
              fill={hairColor}
              fillOpacity="0.3"
            />
          )}
          {facialHair === 'beard' && (
            <path
              d="M 27.5 48.5 C 27.5 63.5 37.5 68.5 50 68.5 C 62.5 68.5 72.5 63.5 72.5 48.5 L 64 48.5 C 62 56 56 58 50 58 C 44 58 38 56 36 48.5 Z"
              fill={hairColor}
            />
          )}
          {facialHair === 'mustache' && (
            <path
              d="M 40.5 53.2 Q 50 49.5 59.5 53.2 Q 55 56.5 50 54.2 Q 45 56.5 40.5 53.2 Z"
              fill={hairColor}
            />
          )}
          {facialHair === 'goatee' && (
            <g fill={hairColor}>
              <path d="M 41.5 53 Q 50 50 58.5 53 Q 54.5 55.5 50 54 Q 45.5 55.5 41.5 53 Z" />
              <path d="M 42 60 Q 50 67.5 58 60 Q 55 66 50 66.5 Q 45 66 42 60 Z" />
            </g>
          )}

          {/* USTA (dopasowane do emocji, z zębami i językiem dla szerokiego uśmiechu) */}
          {expression === 'hyped' ? (
            <g>
              <path d="M 41.5 53.5 Q 50 64 58.5 53.5 Z" fill="#181B26" />
              <path d="M 43 53.5 L 57 53.5 L 56 56.2 L 44 56.2 Z" fill="#FFFFFF" />
              <path d="M 46 59.5 Q 50 57.5 54 59.5 Q 50 62.5 46 59.5 Z" fill="#FF6B6B" />
            </g>
          ) : expression === 'determined' ? (
            <path d="M 43.5 56.2 Q 50 54 56.5 56.2" stroke="#181B26" strokeWidth="2.7" strokeLinecap="round" fill="none" />
          ) : expression === 'focused' ? (
            <g>
              <path d="M 43 55.5 L 57 54.5" stroke="#181B26" strokeWidth="2.7" strokeLinecap="round" />
              <path d="M 54 54.8 L 56.5 56.8" stroke="#181B26" strokeWidth="2" strokeLinecap="round" />
            </g>
          ) : expression === 'proud' ? (
            <g>
              <path d="M 42 54 Q 50 61 58 54 Z" fill="#FFFFFF" stroke="#181B26" strokeWidth="2.2" strokeLinejoin="round" />
            </g>
          ) : (
            <path d="M 42.5 54 Q 50 60.5 57.5 54" stroke="#181B26" strokeWidth="2.8" strokeLinecap="round" fill="none" />
          )}

          {/* PRZEDNIA WARSTWA FRYZURY (10 stylów z połyskiem) */}
          {hairStyle === 'short-fade' && (
            <g>
              <path
                d="M 26 35 C 26 19.5 37 15.5 50 15.5 C 63 15.5 74 19.5 74 35 C 68 27.5 58 25.5 50 25.5 C 42 25.5 32 27.5 26 35 Z"
                fill={hairColor}
              />
              <path d="M 36 21 Q 50 18 63 21" stroke="#FFFFFF" strokeOpacity="0.18" strokeWidth="2.5" strokeLinecap="round" />
            </g>
          )}
          {hairStyle === 'undercut' && (
            <g>
              <path
                d="M 27 33 C 28 24 34 21 72 24 C 70 15 56 12 42 15 C 32 17 27 24 27 33 Z"
                fill={hairColor}
              />
              <path d="M 36 18 Q 52 15 65 20" stroke="#FFFFFF" strokeOpacity="0.22" strokeWidth="2.6" strokeLinecap="round" />
            </g>
          )}
          {hairStyle === 'curly-top' && (
            <g fill={hairColor}>
              <circle cx="35" cy="23.5" r="8.2" />
              <circle cx="45" cy="19.5" r="9.2" />
              <circle cx="56" cy="19.5" r="9.2" />
              <circle cx="65" cy="23.5" r="8.2" />
              <circle cx="30" cy="29.5" r="6.2" />
              <circle cx="70" cy="29.5" r="6.2" />
              <path d="M 41 17 Q 45 14 49 17" stroke="#FFFFFF" strokeOpacity="0.2" strokeWidth="2" strokeLinecap="round" />
              <path d="M 53 17 Q 57 14 61 17" stroke="#FFFFFF" strokeOpacity="0.2" strokeWidth="2" strokeLinecap="round" />
            </g>
          )}
          {(hairStyle === 'ponytail' || hairStyle === 'bun' || hairStyle === 'afro-puff') && (
            <g>
              <path
                d="M 26 36 C 26 20 38 17 50 17 C 62 17 74 20 74 36 C 66 27 56 25.5 50 25.5 C 40 25.5 32 28.5 26 36 Z"
                fill={hairColor}
              />
              <path d="M 37 21.5 Q 50 19 63 21.5" stroke="#FFFFFF" strokeOpacity="0.18" strokeWidth="2.3" strokeLinecap="round" />
            </g>
          )}
          {hairStyle === 'wavy-bob' && (
            <g>
              <path
                d="M 24 38 C 24 18.5 37 15.5 50 15.5 C 63 15.5 76 18.5 76 38 C 66 25.5 54 24.5 42 27.5 C 33 29.5 28 33.5 24 38 Z"
                fill={hairColor}
              />
              <path d="M 35 21 Q 49 18 64 22" stroke="#FFFFFF" strokeOpacity="0.18" strokeWidth="2.4" strokeLinecap="round" />
            </g>
          )}
          {hairStyle === 'braids' && (
            <g>
              <path
                d="M 25 36 C 26 19.5 37 16 50 16 C 63 16 74 19.5 75 36 C 67 27 58 25 50 25 C 42 25 33 27 25 36 Z"
                fill={hairColor}
              />
              <line x1="38" y1="17" x2="36" y2="27" stroke="#FFFFFF" strokeOpacity="0.2" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="50" y1="16" x2="50" y2="25" stroke="#FFFFFF" strokeOpacity="0.2" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="62" y1="17" x2="64" y2="27" stroke="#FFFFFF" strokeOpacity="0.2" strokeWidth="1.8" strokeLinecap="round" />
            </g>
          )}
          {hairStyle === 'buzz' && (
            <path
              d="M 27 33 C 28 21 38 18 50 18 C 62 18 72 21 73 33 C 66 27 58 25 50 25 C 42 25 34 27 27 33 Z"
              fill={hairColor}
              fillOpacity="0.88"
            />
          )}
          {hairStyle === 'spiky' && (
            <g>
              <path
                d="M 26 34 L 31 17.5 L 39 23.5 L 46 13.5 L 53 22.5 L 61 14.5 L 67 23.5 L 74 18.5 L 74 34 C 66 28 58 26 50 26 C 42 26 34 28 26 34 Z"
                fill={hairColor}
              />
              <path d="M 45 17 L 51 23" stroke="#FFFFFF" strokeOpacity="0.2" strokeWidth="2" strokeLinecap="round" />
            </g>
          )}

          {/* AKCESORIA SPORTOWE (8 wariantów) */}
          {accessory === 'headband' && (
            <g>
              <path d="M 26 30.5 Q 50 34.5 74 30.5" stroke="#FF6B35" strokeWidth="5.8" strokeLinecap="round" />
              <path d="M 38 32 Q 50 34 62 32" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" strokeOpacity="0.85" />
            </g>
          )}
          {accessory === 'sweatband-mint' && (
            <g>
              <path d="M 26 30.5 Q 50 34.5 74 30.5" stroke="#3ED6A3" strokeWidth="5.8" strokeLinecap="round" />
              <path d="M 42 32.2 L 58 32.2" stroke="#090A0F" strokeWidth="1.8" strokeLinecap="round" strokeOpacity="0.6" />
            </g>
          )}
          {accessory === 'cycling-glasses' && (
            <g>
              <path
                d="M 27.5 37.5 L 72.5 37.5 L 69.5 48.5 L 53.5 48.5 L 50 43.5 L 46.5 48.5 L 30.5 48.5 Z"
                fill="#FF6B35"
                fillOpacity="0.92"
                stroke="#FFFFFF"
                strokeWidth="1.6"
              />
              <line x1="33" y1="39.5" x2="43" y2="46.5" stroke="#FFFFFF" strokeWidth="1.8" strokeOpacity="0.75" strokeLinecap="round" />
              <line x1="56" y1="39.5" x2="64" y2="45.5" stroke="#FBBF24" strokeWidth="1.6" strokeOpacity="0.7" strokeLinecap="round" />
            </g>
          )}
          {accessory === 'glasses' && (
            <g stroke="#181B26" strokeWidth="2.3" fill="#38BDF8" fillOpacity="0.16">
              <rect x="29.5" y="37.5" width="17" height="11" rx="3.5" />
              <rect x="53.5" y="37.5" width="17" height="11" rx="3.5" />
              <line x1="46.5" y1="42" x2="53.5" y2="42" fill="none" />
            </g>
          )}
          {accessory === 'headphones' && (
            <g>
              <path d="M 22 46 C 20 19 80 19 78 46" stroke="#3ED6A3" strokeWidth="4" fill="none" />
              <rect x="17.5" y="38.5" width="7.5" height="16" rx="3.8" fill="#151722" stroke="#3ED6A3" strokeWidth="2" />
              <rect x="75" y="38.5" width="7.5" height="16" rx="3.8" fill="#151722" stroke="#3ED6A3" strokeWidth="2" />
            </g>
          )}
          {accessory === 'cap' && (
            <g>
              <path d="M 25 32 C 25 16.5 37 13.5 50 13.5 C 63 13.5 75 16.5 75 32 Z" fill="#6366F1" />
              <path d="M 24 31 Q 52 26.5 84 33 Q 68 36.5 24 32 Z" fill="#4F46E5" />
              <circle cx="50" cy="22" r="2.8" fill="#FFFFFF" fillOpacity="0.9" />
            </g>
          )}
          {accessory === 'visor' && (
            <g>
              <path d="M 25 29.5 Q 50 26.5 75 29.5 L 75 33.5 Q 50 30.5 25 33.5 Z" fill="#38BDF8" />
              <path d="M 23 31.5 Q 53 27.5 84 34.5 Q 66 37.5 23 32.5 Z" fill="#0284C7" />
            </g>
          )}

          {/* ATRYBUT SPORTOWY W RĘKU / NA PIERWSZYM PLANIE (6 wariantów) */}
          {sportProp === 'dumbbell' && (
            <g transform="translate(62, 74) rotate(-14)">
              <rect x="6" y="7" width="16" height="4" rx="1.5" fill="#94A3B8" />
              <rect x="2" y="2" width="5" height="14" rx="2" fill="#1E293B" stroke="#3ED6A3" strokeWidth="1.2" />
              <rect x="21" y="2" width="5" height="14" rx="2" fill="#1E293B" stroke="#3ED6A3" strokeWidth="1.2" />
            </g>
          )}
          {sportProp === 'bottle' && (
            <g transform="translate(68, 72) rotate(8)">
              <rect x="2" y="5" width="12" height="20" rx="4" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="1.2" />
              <rect x="4" y="2" width="8" height="4" rx="1.5" fill="#1E293B" />
              <circle cx="8" cy="1" r="1.5" fill="#FF6B35" />
              <line x1="4" y1="12" x2="12" y2="12" stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.8" />
            </g>
          )}
          {sportProp === 'watch' && (
            <g transform="translate(16, 75)">
              <rect x="2" y="6" width="14" height="5" rx="2" fill="#0F172A" />
              <circle cx="9" cy="8.5" r="5.5" fill="#0F172A" stroke="#3ED6A3" strokeWidth="1.8" />
              <path d="M 7 8.5 L 8.5 10 L 11.5 7" stroke="#3ED6A3" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          )}
          {sportProp === 'racket' && (
            <g transform="translate(65, 66) rotate(18)">
              <ellipse cx="10" cy="10" rx="7.5" ry="9.5" stroke="#FBBF24" strokeWidth="2.2" fill="#FFFFFF" fillOpacity="0.18" />
              <line x1="6" y1="6" x2="14" y2="14" stroke="#FFFFFF" strokeWidth="0.9" strokeOpacity="0.7" />
              <line x1="14" y1="6" x2="6" y2="14" stroke="#FFFFFF" strokeWidth="0.9" strokeOpacity="0.7" />
              <line x1="10" y1="19.5" x2="10" y2="28" stroke="#94A3B8" strokeWidth="2.6" strokeLinecap="round" />
            </g>
          )}
          {sportProp === 'medal' && (
            <g transform="translate(41, 72)">
              <path d="M 4 0 L 9 10 L 14 0" stroke="#FF6B35" strokeWidth="2.6" strokeLinecap="round" fill="none" />
              <circle cx="9" cy="14" r="5.5" fill="#FBBF24" stroke="#FEF08A" strokeWidth="1.4" />
              <circle cx="9" cy="14" r="2.2" fill="#F59E0B" />
            </g>
          )}
        </g>
      </svg>
      {showOnline && <span className="online-dot" title="Dostępny teraz" />}
    </div>
  );
};
