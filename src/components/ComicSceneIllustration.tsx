import React from 'react';

interface ComicSceneIllustrationProps {
  sceneId: string;
  accentHex?: string;
}

export const ComicSceneIllustration: React.FC<ComicSceneIllustrationProps> = ({
  sceneId,
  accentHex = '#0EA5E9',
}) => {
  const match = sceneId.match(/ch(\d+)-p(\d+)/);
  const chapter = match ? parseInt(match[1], 10) : 1;
  const panel = match ? parseInt(match[2], 10) : 1;

  return (
    <div className="relative w-full h-56 sm:h-64 overflow-hidden bg-[#071324] select-none">
      <svg
        viewBox="0 0 400 240"
        className="w-full h-full object-cover"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={`sky-${sceneId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#071120" />
            <stop offset="55%" stopColor="#0F294A" />
            <stop offset="100%" stopColor={accentHex} stopOpacity="0.55" />
          </linearGradient>

          <linearGradient id="goldGlow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>

          <pattern
            id={`dots-${sceneId}`}
            x="0"
            y="0"
            width="9"
            height="9"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="2" cy="2" r="1.15" fill="rgba(255,255,255,0.09)" />
          </pattern>
        </defs>

        {/* Base Comic Sky + Halftone Dots */}
        <rect width="400" height="240" fill={`url(#sky-${sceneId})`} />
        <rect width="400" height="240" fill={`url(#dots-${sceneId})`} />

        {/* Dynamic Comic Action Lines */}
        <g stroke="rgba(255,255,255,0.07)" strokeWidth="1.5">
          <line x1="0" y1="22" x2="400" y2="58" />
          <line x1="0" y1="95" x2="400" y2="38" />
          <line x1="0" y1="155" x2="400" y2="122" />
        </g>

        {/* =========================================================
            CHAPTER 1: THE HAND IN THE WATER (PANELS 1–4)
           ========================================================= */}
        {sceneId === 'ch1-p1' && (
          <g>
            {/* Monsoon Clouds & Rain */}
            <path d="M30 42 Q58 18 90 38 Q120 20 148 42 Z" fill="#1E293B" stroke="#050B14" strokeWidth="2.5" />
            <path d="M235 36 Q268 14 298 35 Q332 18 360 40 Z" fill="#1E293B" stroke="#050B14" strokeWidth="2.5" />
            <g stroke="#7DD3FC" strokeWidth="1.5" strokeDasharray="6 6" opacity="0.7">
              <line x1="60" y1="45" x2="45" y2="135" />
              <line x1="115" y1="45" x2="100" y2="135" />
              <line x1="265" y1="45" x2="250" y2="135" />
              <line x1="325" y1="45" x2="310" y2="135" />
            </g>
            {/* Village Green Path & River Crossing */}
            <path d="M0 155 Q130 140 240 165 L400 155 L400 240 L0 240 Z" fill="#14532D" stroke="#050B14" strokeWidth="3" />
            <path d="M180 155 Q230 185 210 240 L320 240 Q330 185 280 155 Z" fill="#0284C7" stroke="#050B14" strokeWidth="3" />
            {/* 4 KM Milestone Stone */}
            <g transform="translate(32, 124)">
              <path d="M0 22 L0 58 L50 58 L50 22 Q25 0 0 22 Z" fill="#E2E8F0" stroke="#050B14" strokeWidth="2.5" />
              <text x="25" y="36" textAnchor="middle" fill="#050B14" fontSize="11" fontWeight="900">4 KM</text>
              <text x="25" y="49" textAnchor="middle" fill="#050B14" fontSize="7" fontWeight="800">SCHOOL</text>
            </g>
            {/* +2 KM Detour Sign */}
            <g transform="translate(292, 106)">
              <rect x="0" y="0" width="86" height="26" rx="4" fill="#FDE047" stroke="#050B14" strokeWidth="2.5" />
              <text x="43" y="16" textAnchor="middle" fill="#050B14" fontSize="9" fontWeight="900">+2 KM DETOUR</text>
              <line x1="43" y1="26" x2="43" y2="52" stroke="#050B14" strokeWidth="3" />
            </g>
            {/* Little Boy Walking with School Uniform & Lunchbox */}
            <g transform="translate(132, 114)">
              <circle cx="20" cy="14" r="10" fill="#FDBA74" stroke="#050B14" strokeWidth="2.5" />
              <path d="M10 26 L30 26 L34 56 L6 56 Z" fill="#38BDF8" stroke="#050B14" strokeWidth="2.5" />
              <rect x="35" y="38" width="16" height="13" rx="2" fill="#E2E8F0" stroke="#050B14" strokeWidth="2" />
            </g>
          </g>
        )}

        {sceneId === 'ch1-p2' && (
          <g>
            {/* Raging Overflowing River Waves */}
            <path d="M0 108 Q90 82 190 112 T400 102 L400 240 L0 240 Z" fill="#0369A1" stroke="#050B14" strokeWidth="3" />
            <path d="M0 144 Q100 118 210 152 T400 138 L400 240 L0 240 Z" fill="#0284C7" stroke="#050B14" strokeWidth="3" />
            <path d="M0 184 Q120 162 240 192 T400 178 L400 240 L0 240 Z" fill="#0EA5E9" stroke="#050B14" strokeWidth="3" />
            <path d="M55 168 Q130 148 180 182 Q230 208 315 172" fill="none" stroke="#E0F2FE" strokeWidth="3" strokeDasharray="10 6" />
            {/* Boy swept off balance holding lunchbox */}
            <g transform="translate(172, 82) rotate(24)">
              <circle cx="25" cy="18" r="13" fill="#FDBA74" stroke="#050B14" strokeWidth="3" />
              <path d="M10 32 L42 32 L46 72 L6 72 Z" fill="#38BDF8" stroke="#050B14" strokeWidth="3" />
              <line x1="40" y1="38" x2="68" y2="16" stroke="#FDBA74" strokeWidth="6" strokeLinecap="round" />
              <rect x="62" y="2" width="26" height="18" rx="3" fill="#E2E8F0" stroke="#050B14" strokeWidth="2.5" />
              <text x="75" y="14" textAnchor="middle" fill="#050B14" fontSize="6" fontWeight="900">LUNCH</text>
            </g>
          </g>
        )}

        {sceneId === 'ch1-p3' && (
          <g>
            {/* Muddy Bank + Tearing Grass Roots + Lunchbox in Other Hand */}
            <path d="M0 58 L128 88 L95 240 L0 240 Z" fill="#78350F" stroke="#050B14" strokeWidth="3.5" />
            <path d="M98 105 Q220 80 400 115 L400 240 L85 240 Z" fill="#0369A1" stroke="#050B14" strokeWidth="3" />
            <g transform="translate(82, 52)">
              <path d="M10 35 L2 5 M16 35 L18 2 M22 35 L34 8" stroke="#22C55E" strokeWidth="5" strokeLinecap="round" />
              <path d="M8 38 L2 54 M16 40 L15 58 M24 38 L30 54" stroke="#FDE047" strokeWidth="2.2" strokeDasharray="3 2" />
            </g>
            <g transform="translate(102, 76)">
              <path d="M0 10 L48 42" stroke="#FDBA74" strokeWidth="10" strokeLinecap="round" />
              <circle cx="2" cy="10" r="8" fill="#FDBA74" stroke="#050B14" strokeWidth="2.5" />
              <circle cx="65" cy="52" r="16" fill="#FDBA74" stroke="#050B14" strokeWidth="3" />
              <path d="M80 58 L138 26" stroke="#FDBA74" strokeWidth="9" strokeLinecap="round" />
              <rect x="130" y="6" width="38" height="24" rx="4" fill="#E2E8F0" stroke="#050B14" strokeWidth="3" />
              <text x="149" y="21" textAnchor="middle" fill="#050B14" fontSize="7" fontWeight="900">LUNCHBOX</text>
            </g>
          </g>
        )}

        {sceneId === 'ch1-p4' && (
          <g>
            <circle cx="285" cy="52" r="75" fill="url(#goldGlow)" opacity="0.35" />
            <path d="M0 142 Q180 130 400 165 L400 240 L0 240 Z" fill="#78350F" stroke="#050B14" strokeWidth="3" />
            {/* Passing Man's Hand Reaching Down */}
            <g transform="translate(210, 10)">
              <path d="M120 0 L55 78" stroke="#F59E0B" strokeWidth="18" strokeLinecap="round" />
              <circle cx="50" cy="84" r="12" fill="#F59E0B" stroke="#050B14" strokeWidth="3" />
            </g>
            <path d="M185 148 L255 92" stroke="#FDBA74" strokeWidth="12" strokeLinecap="round" />
            <circle cx="175" cy="152" r="15" fill="#FDBA74" stroke="#050B14" strokeWidth="3" />
            <g transform="translate(72, 158)">
              <rect x="0" y="0" width="42" height="26" rx="4" fill="#E2E8F0" stroke="#050B14" strokeWidth="3" />
              <text x="21" y="16" textAnchor="middle" fill="#050B14" fontSize="7" fontWeight="900">LUNCHBOX</text>
            </g>
            <g transform="translate(38, 36)">
              <circle cx="36" cy="36" r="32" fill="#0EA5E9" stroke="#050B14" strokeWidth="3" />
              <text x="36" y="34" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="900">HOW TO</text>
              <text x="36" y="48" textAnchor="middle" fill="#FDE047" fontSize="11" fontWeight="900">SWIM?</text>
            </g>
          </g>
        )}

        {/* =========================================================
            CHAPTER 2: THE BOY WHO FOLLOWED WATER (PANELS 1–4)
           ========================================================= */}
        {sceneId === 'ch2-p1' && (
          <g>
            {[
              { title: '1. CANAL', x: 14, c: '#0284C7' },
              { title: '2. WELL', x: 108, c: '#0369A1' },
              { title: '3. LAKE', x: 202, c: '#0EA5E9' },
              { title: '4. QUARRY', x: 296, c: '#10B981' },
            ].map((item) => (
              <g key={item.title} transform={`translate(${item.x}, 24)`}>
                <rect x="0" y="0" width="86" height="156" rx="6" fill="#0F172A" stroke="#050B14" strokeWidth="3" />
                <path d="M0 88 Q43 76 86 88 L86 156 L0 156 Z" fill={item.c} stroke="#050B14" strokeWidth="2.5" />
                <text x="43" y="28" textAnchor="middle" fill="#FDE047" fontSize="10" fontWeight="900">{item.title}</text>
                <circle cx="43" cy="96" r="8" fill="#FDBA74" stroke="#050B14" strokeWidth="2" />
              </g>
            ))}
          </g>
        )}

        {sceneId === 'ch2-p2' && (
          <g>
            <path d="M0 135 Q180 120 400 140 L400 240 L0 240 Z" fill="#0EA5E9" stroke="#050B14" strokeWidth="3" />
            <path d="M0 125 L165 145 L140 240 L0 240 Z" fill="#15803D" stroke="#050B14" strokeWidth="3" />
            <g transform="translate(55, 52)">
              <circle cx="24" cy="16" r="12" fill="#FDBA74" stroke="#050B14" strokeWidth="3" />
              <path d="M8 30 L40 30 L46 82 L2 82 Z" fill="#F43F5E" stroke="#050B14" strokeWidth="3" />
              <line x1="40" y1="40" x2="70" y2="26" stroke="#FDBA74" strokeWidth="6" strokeLinecap="round" />
            </g>
            <circle cx="235" cy="150" r="12" fill="#FDBA74" stroke="#050B14" strokeWidth="2.5" />
            <circle cx="290" cy="158" r="12" fill="#FDBA74" stroke="#050B14" strokeWidth="2.5" />
            <g transform="translate(205, 30)">
              <rect x="0" y="0" width="168" height="36" rx="6" fill="#FDE047" stroke="#050B14" strokeWidth="3" />
              <text x="84" y="22" textAnchor="middle" fill="#050B14" fontSize="11" fontWeight="900">NEXT DAY: BACK AGAIN!</text>
            </g>
          </g>
        )}

        {sceneId === 'ch2-p3' && (
          <g>
            <polygon points="0,18 98,38 132,178 0,240" fill="#334155" stroke="#050B14" strokeWidth="3.5" />
            <polygon points="400,15 298,38 268,178 400,240" fill="#334155" stroke="#050B14" strokeWidth="3.5" />
            <rect x="115" y="142" width="170" height="98" fill="#047857" stroke="#050B14" strokeWidth="3" />
            <text x="200" y="188" textAnchor="middle" fill="#A7F3D0" fontSize="11" fontWeight="900">DEEP ROCKY QUARRY</text>
            <circle cx="75" cy="24" r="9" fill="#FBBF24" stroke="#050B14" strokeWidth="2.5" />
            <circle cx="52" cy="28" r="8" fill="#38BDF8" stroke="#050B14" strokeWidth="2.5" />
          </g>
        )}

        {sceneId === 'ch2-p4' && (
          <g>
            <circle cx="200" cy="68" r="46" fill="#FDE047" stroke="#050B14" strokeWidth="3" />
            <path d="M0 140 Q200 115 400 140 L400 240 L0 240 Z" fill="#0EA5E9" stroke="#050B14" strokeWidth="3" />
            <circle cx="130" cy="95" r="11" fill="#FDBA74" stroke="#050B14" strokeWidth="2.5" />
            <circle cx="200" cy="75" r="13" fill="#FDBA74" stroke="#050B14" strokeWidth="2.5" />
            <circle cx="270" cy="95" r="11" fill="#FDBA74" stroke="#050B14" strokeWidth="2.5" />
            <text x="200" y="182" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="900">
              NO COACH • NO POOL • JUST CHILDHOOD &amp; WATER
            </text>
          </g>
        )}

        {/* =========================================================
            CHAPTER 3: THE WELL THAT CHANGED EVERYTHING (PANELS 1–4)
           ========================================================= */}
        {sceneId === 'ch3-p1' && (
          <g>
            <ellipse cx="235" cy="155" rx="95" ry="38" fill="#64748B" stroke="#050B14" strokeWidth="3.5" />
            <ellipse cx="235" cy="150" rx="75" ry="26" fill="#0EA5E9" stroke="#050B14" strokeWidth="3" />
            <circle cx="205" cy="145" r="10" fill="#FDBA74" stroke="#050B14" strokeWidth="2.5" />
            <circle cx="242" cy="152" r="10" fill="#FDBA74" stroke="#050B14" strokeWidth="2.5" />
            <circle cx="272" cy="144" r="10" fill="#FDBA74" stroke="#050B14" strokeWidth="2.5" />
            <g transform="translate(20, 26)">
              <rect x="0" y="0" width="142" height="46" rx="6" fill="#FEF08A" stroke="#050B14" strokeWidth="3" />
              <text x="71" y="20" textAnchor="middle" fill="#050B14" fontSize="9" fontWeight="900">“DON’T TALK ABOUT</text>
              <text x="71" y="36" textAnchor="middle" fill="#050B14" fontSize="10" fontWeight="900">STUDIES!” 😂</text>
            </g>
          </g>
        )}

        {sceneId === 'ch3-p2' && (
          <g>
            <path d="M0 130 Q200 115 400 135 L400 240 L0 240 Z" fill="#15803D" stroke="#050B14" strokeWidth="3" />
            <circle cx="145" cy="100" r="12" fill="#FDBA74" stroke="#050B14" strokeWidth="3" />
            <path d="M132 114 L158 114 L164 160 L126 160 Z" fill="#E11D48" stroke="#050B14" strokeWidth="3" />
            <circle cx="220" cy="108" r="11" fill="#FDBA74" stroke="#050B14" strokeWidth="3" />
            <path d="M208 120 L232 120 L236 160 L204 160 Z" fill="#38BDF8" stroke="#050B14" strokeWidth="3" />
            <rect x="110" y="26" width="180" height="30" rx="5" fill="#FDE047" stroke="#050B14" strokeWidth="2.5" />
            <text x="200" y="45" textAnchor="middle" fill="#050B14" fontSize="10" fontWeight="900">9TH GRADE • AT THE VILLAGE FARMS</text>
          </g>
        )}

        {sceneId === 'ch3-p3' && (
          <g>
            <ellipse cx="200" cy="150" rx="110" ry="44" fill="#334155" stroke="#050B14" strokeWidth="4" />
            <ellipse cx="200" cy="146" rx="86" ry="30" fill="#090D16" stroke="#050B14" strokeWidth="3" />
            <ellipse cx="200" cy="146" rx="46" ry="14" fill="none" stroke="#64748B" strokeWidth="2" />
            <ellipse cx="200" cy="146" rx="18" ry="6" fill="none" stroke="#94A3B8" strokeWidth="2" />
            <rect x="75" y="28" width="250" height="34" rx="6" fill="#1E1B4B" stroke="#EF4444" strokeWidth="2.5" />
            <text x="200" y="49" textAnchor="middle" fill="#FCA5A5" fontSize="11" fontWeight="900">
              TRAGEDY AT THE VILLAGE WELL
            </text>
          </g>
        )}

        {sceneId === 'ch3-p4' && (
          <g>
            <ellipse cx="200" cy="156" rx="100" ry="38" fill="#475569" stroke="#050B14" strokeWidth="3.5" />
            <ellipse cx="200" cy="152" rx="78" ry="26" fill="#1E293B" stroke="#050B14" strokeWidth="3" />
            <rect x="80" y="32" width="240" height="38" rx="6" fill="#0F172A" stroke="#94A3B8" strokeWidth="2.5" />
            <text x="200" y="55" textAnchor="middle" fill="#E2E8F0" fontSize="11" fontWeight="900">
              10TH GRADE • 1 FULL YEAR OF SILENCE
            </text>
          </g>
        )}

        {/* =========================================================
            CHAPTER 4: ESCAPING TUITION TO NATIONAL GAMES (PANELS 1–4)
           ========================================================= */}
        {sceneId === 'ch4-p1' && (
          <g>
            <rect x="12" y="24" width="175" height="165" rx="6" fill="#334155" stroke="#050B14" strokeWidth="3" />
            <text x="100" y="48" textAnchor="middle" fill="#FCA5A5" fontSize="10" fontWeight="900">WHOLESALE SHOP (15 DAYS)</text>
            <rect x="45" y="95" width="50" height="42" fill="#92400E" stroke="#050B14" strokeWidth="2.5" />
            <rect x="102" y="85" width="50" height="52" fill="#B45309" stroke="#050B14" strokeWidth="2.5" />

            <rect x="205" y="24" width="183" height="165" rx="6" fill="#0284C7" stroke="#050B14" strokeWidth="3" />
            <text x="296" y="46" textAnchor="middle" fill="#FDE047" fontSize="10" fontWeight="900">SSN COLLEGE NARASARAOPET</text>
            <rect x="222" y="72" width="150" height="98" fill="#38BDF8" stroke="#050B14" strokeWidth="2.5" />
            <line x1="222" y1="104" x2="372" y2="104" stroke="#FDE047" strokeWidth="2.5" strokeDasharray="6 4" />
            <line x1="222" y1="138" x2="372" y2="138" stroke="#EF4444" strokeWidth="2.5" strokeDasharray="6 4" />
          </g>
        )}

        {sceneId === 'ch4-p2' && (
          <g>
            <g transform="translate(20, 28)">
              <rect x="0" y="0" width="164" height="54" rx="6" fill="#FEF08A" stroke="#050B14" strokeWidth="3" />
              <text x="82" y="22" textAnchor="middle" fill="#050B14" fontSize="10" fontWeight="900">TUITION: 5:30–8:00 AM</text>
              <text x="82" y="40" textAnchor="middle" fill="#050B14" fontSize="10" fontWeight="900">&amp; 8:00–10:00 PM</text>
            </g>
            <g transform="translate(20, 96)">
              <rect x="0" y="0" width="164" height="44" rx="6" fill="#E2E8F0" stroke="#050B14" strokeWidth="3" />
              <text x="82" y="26" textAnchor="middle" fill="#050B14" fontSize="10" fontWeight="900">TELUGU → ENGLISH MEDIUM</text>
            </g>
            <g transform="translate(202, 28)">
              <rect x="0" y="0" width="178" height="148" rx="8" fill="#0EA5E9" stroke="#050B14" strokeWidth="3.5" />
              <text x="89" y="32" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="900">RIGHT BESIDE CLASSROOM:</text>
              <text x="89" y="52" textAnchor="middle" fill="#FDE047" fontSize="13" fontWeight="900">THE OLYMPIC POOL</text>
              <line x1="16" y1="95" x2="162" y2="95" stroke="#FFFFFF" strokeWidth="3" strokeDasharray="8 5" />
              <line x1="16" y1="122" x2="162" y2="122" stroke="#FDE047" strokeWidth="3" strokeDasharray="8 5" />
            </g>
          </g>
        )}

        {sceneId === 'ch4-p3' && (
          <g>
            <rect x="0" y="115" width="400" height="125" fill="#0284C7" stroke="#050B14" strokeWidth="3" />
            <line x1="0" y1="158" x2="400" y2="158" stroke="#FDE047" strokeWidth="3" strokeDasharray="10 6" />
            <g transform="translate(55, 24)">
              <circle cx="45" cy="45" r="36" fill="#E2E8F0" stroke="#050B14" strokeWidth="3.5" />
              <text x="45" y="42" textAnchor="middle" fill="#050B14" fontSize="14" fontWeight="900">2ND</text>
              <text x="45" y="58" textAnchor="middle" fill="#050B14" fontSize="9" fontWeight="800">PLACE</text>
            </g>
            <g transform="translate(245, 24)">
              <circle cx="45" cy="45" r="36" fill="#F59E0B" stroke="#050B14" strokeWidth="3.5" />
              <text x="45" y="42" textAnchor="middle" fill="#050B14" fontSize="14" fontWeight="900">3RD</text>
              <text x="45" y="58" textAnchor="middle" fill="#050B14" fontSize="9" fontWeight="800">STATE COMP</text>
            </g>
          </g>
        )}

        {sceneId === 'ch4-p4' && (
          <g>
            <rect x="18" y="16" width="364" height="72" rx="8" fill="#FDE047" stroke="#050B14" strokeWidth="3.5" />
            <text x="200" y="38" textAnchor="middle" fill="#050B14" fontSize="12" fontWeight="900">
              65TH NATIONAL SCHOOL GAMES 2019–20
            </text>
            <text x="200" y="56" textAnchor="middle" fill="#B91C1C" fontSize="11" fontWeight="900">
              NEW DELHI • NOV 17–22, 2019 • BOYS U-17
            </text>
            <text x="200" y="74" textAnchor="middle" fill="#050B14" fontSize="9" fontWeight="900">
              TEAM ANDHRA PRADESH • &lt; 1 MONTH OF PRACTICE!
            </text>
            <rect x="165" y="132" width="70" height="48" fill="#E2E8F0" stroke="#050B14" strokeWidth="3" />
            <circle cx="200" cy="106" r="12" fill="#FDBA74" stroke="#050B14" strokeWidth="3" />
            <rect x="0" y="180" width="400" height="60" fill="#0EA5E9" stroke="#050B14" strokeWidth="3" />
          </g>
        )}

        {/* =========================================================
            CHAPTER 5: WHEN THE WORLD STOPPED (PANELS 1–4)
           ========================================================= */}
        {sceneId === 'ch5-p1' && (
          <g>
            <circle cx="200" cy="100" r="68" fill="#0EA5E9" opacity="0.25" />
            <rect x="45" y="36" width="310" height="90" rx="10" fill="#0F172A" stroke="#38BDF8" strokeWidth="3" />
            <text x="200" y="72" textAnchor="middle" fill="#FDE047" fontSize="14" fontWeight="900">
              1 MONTH → NATIONAL GAMES
            </text>
            <text x="200" y="100" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="800">
              “WHAT IF I TRAINED FOR 1 FULL YEAR?!”
            </text>
          </g>
        )}

        {sceneId === 'ch5-p2' && (
          <g>
            <g stroke="#475569" strokeWidth="6">
              <line x1="60" y1="15" x2="60" y2="225" />
              <line x1="130" y1="15" x2="130" y2="225" />
              <line x1="200" y1="15" x2="200" y2="225" />
              <line x1="270" y1="15" x2="270" y2="225" />
              <line x1="340" y1="15" x2="340" y2="225" />
            </g>
            <rect x="125" y="65" width="150" height="90" rx="10" fill="#EF4444" stroke="#050B14" strokeWidth="4" />
            <text x="200" y="106" textAnchor="middle" fill="#FFFFFF" fontSize="14" fontWeight="900">COVID LOCKDOWN</text>
            <text x="200" y="130" textAnchor="middle" fill="#FEF08A" fontSize="11" fontWeight="900">POOLS CLOSED</text>
          </g>
        )}

        {sceneId === 'ch5-p3' && (
          <g>
            <rect x="65" y="42" width="270" height="112" rx="10" fill="#1E293B" stroke="#050B14" strokeWidth="3.5" />
            <text x="200" y="88" textAnchor="middle" fill="#F8FAFC" fontSize="15" fontWeight="900">
              ALMOST 2 YEARS AT HOME
            </text>
            <text x="200" y="116" textAnchor="middle" fill="#94A3B8" fontSize="11" fontWeight="800">
              NO PRACTICE • NO MEETS • NO COACH
            </text>
          </g>
        )}

        {sceneId === 'ch5-p4' && (
          <g>
            <circle cx="200" cy="102" r="58" fill="#1E1B4B" stroke="#A855F7" strokeWidth="4" />
            <text x="200" y="96" textAnchor="middle" fill="#FDE047" fontSize="13" fontWeight="900">
              THE WORLD STOPPED
            </text>
            <text x="200" y="118" textAnchor="middle" fill="#38BDF8" fontSize="10" fontWeight="800">
              PLANS STILL ALIVE IN HIS MIND
            </text>
          </g>
        )}

        {/* =========================================================
            CHAPTER 6: SWIMMER TO LIFEGUARD & JUNIOR COACH (PANELS 1–4)
           ========================================================= */}
        {sceneId === 'ch6-p1' && (
          <g>
            <rect x="0" y="140" width="400" height="100" fill="#0284C7" stroke="#050B14" strokeWidth="3" />
            <rect x="55" y="28" width="290" height="84" rx="10" fill="#F59E0B" stroke="#050B14" strokeWidth="3.5" />
            <text x="200" y="64" textAnchor="middle" fill="#050B14" fontSize="14" fontWeight="900">
              LIFEGUARD &amp; JUNIOR COACH
            </text>
            <text x="200" y="88" textAnchor="middle" fill="#050B14" fontSize="10" fontWeight="800">
              COLLEGE POOL REOPENS AFTER COVID
            </text>
          </g>
        )}

        {sceneId === 'ch6-p2' && (
          <g>
            {[
              { label: 'MORNING & EVENING', x: 18, c: '#F59E0B' },
              { label: 'COLLEGE CLASSES', x: 112, c: '#38BDF8' },
              { label: 'EARNING MONEY', x: 206, c: '#10B981' },
              { label: 'OWN PRACTICE', x: 300, c: '#6366F1' },
            ].map((b) => (
              <g key={b.label} transform={`translate(${b.x}, 45)`}>
                <rect x="0" y="0" width="84" height="110" rx="8" fill={b.c} stroke="#050B14" strokeWidth="3" />
                <text x="42" y="58" textAnchor="middle" fill="#050B14" fontSize="8" fontWeight="900">{b.label}</text>
              </g>
            ))}
          </g>
        )}

        {sceneId === 'ch6-p3' && (
          <g>
            <rect x="0" y="115" width="400" height="125" fill="#0EA5E9" stroke="#050B14" strokeWidth="3" />
            <line x1="0" y1="160" x2="400" y2="160" stroke="#FDE047" strokeWidth="3" strokeDasharray="10 6" />
            <circle cx="140" cy="140" r="10" fill="#FDBA74" stroke="#050B14" strokeWidth="2.5" />
            <circle cx="260" cy="180" r="10" fill="#FDBA74" stroke="#050B14" strokeWidth="2.5" />
            <rect x="85" y="28" width="230" height="52" rx="8" fill="#0F172A" stroke="#38BDF8" strokeWidth="3" />
            <text x="200" y="58" textAnchor="middle" fill="#E2E8F0" fontSize="11" fontWeight="900">
              QUIET SESSIONS • LOW PRESSURE
            </text>
          </g>
        )}

        {sceneId === 'ch6-p4' && (
          <g>
            <rect x="35" y="30" width="330" height="130" rx="10" fill="#0F172A" stroke="#F59E0B" strokeWidth="3.5" />
            <text x="200" y="75" textAnchor="middle" fill="#FDE047" fontSize="13" fontWeight="900">
              SEEING THE POOL FROM THE OTHER SIDE
            </text>
            <text x="200" y="105" textAnchor="middle" fill="#38BDF8" fontSize="10" fontWeight="800">
              OPERATIONS • SESSIONS • RESPONSIBILITIES
            </text>
          </g>
        )}

        {/* =========================================================
            CHAPTER 7: LEARNING THE WORLD BEHIND THE POOL (PANELS 1–4)
           ========================================================= */}
        {sceneId === 'ch7-p1' && (
          <g>
            <rect x="55" y="36" width="290" height="105" rx="10" fill="#0F766E" stroke="#050B14" strokeWidth="3.5" />
            <text x="200" y="78" textAnchor="middle" fill="#FDE047" fontSize="15" fontWeight="900">
              NEXT STOP: HYDERABAD
            </text>
            <text x="200" y="106" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="800">
              MISSION: POOL MAINTENANCE &amp; OPERATIONS
            </text>
          </g>
        )}

        {sceneId === 'ch7-p2' && (
          <g>
            {/* Filtration Tanks & Pipes */}
            <rect x="55" y="45" width="75" height="125" rx="14" fill="#0284C7" stroke="#050B14" strokeWidth="3.5" />
            <rect x="160" y="45" width="75" height="125" rx="14" fill="#0369A1" stroke="#050B14" strokeWidth="3.5" />
            <rect x="265" y="45" width="80" height="125" rx="10" fill="#1E293B" stroke="#050B14" strokeWidth="3.5" />
            <text x="92" y="112" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="900">FILTER 01</text>
            <text x="197" y="112" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="900">FILTER 02</text>
            <text x="305" y="102" textAnchor="middle" fill="#FDE047" fontSize="10" fontWeight="900">3 MONTHS</text>
            <text x="305" y="120" textAnchor="middle" fill="#38BDF8" fontSize="8" fontWeight="800">SYSTEM TRAINING</text>
          </g>
        )}

        {sceneId === 'ch7-p3' && (
          <g>
            <rect x="35" y="38" width="155" height="115" rx="8" fill="#14B8A6" stroke="#050B14" strokeWidth="3" />
            <text x="112" y="92" textAnchor="middle" fill="#050B14" fontSize="12" fontWeight="900">POOL OPERATOR</text>
            <rect x="210" y="38" width="155" height="115" rx="8" fill="#0EA5E9" stroke="#050B14" strokeWidth="3" />
            <text x="287" y="92" textAnchor="middle" fill="#050B14" fontSize="12" fontWeight="900">SWIM COACH</text>
          </g>
        )}

        {sceneId === 'ch7-p4' && (
          <g>
            <rect x="40" y="30" width="320" height="130" rx="10" fill="#0F172A" stroke="#14B8A6" strokeWidth="3.5" />
            <text x="200" y="80" textAnchor="middle" fill="#FDE047" fontSize="13" fontWeight="900">
              THE ENTIRE SWIMMING ENVIRONMENT
            </text>
            <text x="200" y="108" textAnchor="middle" fill="#2DD4BF" fontSize="10" fontWeight="800">
              MAINTENANCE • OPERATIONS • COACHING
            </text>
          </g>
        )}

        {/* =========================================================
            CHAPTER 8: BACK TO HIS HOMETOWN (PANELS 1–4)
           ========================================================= */}
        {sceneId === 'ch8-p1' && (
          <g>
            <rect x="50" y="36" width="300" height="110" rx="10" fill="#1E3A8A" stroke="#050B14" strokeWidth="3.5" />
            <text x="200" y="82" textAnchor="middle" fill="#FDE047" fontSize="14" fontWeight="900">
              HOMETOWN SWIMMING COACH
            </text>
            <text x="200" y="108" textAnchor="middle" fill="#93C5FD" fontSize="11" fontWeight="800">
              HIRED! • WORKED FOR ALMOST 1 YEAR
            </text>
          </g>
        )}

        {sceneId === 'ch8-p2' && (
          <g>
            <rect x="65" y="36" width="270" height="110" rx="10" fill="#FDE047" stroke="#050B14" strokeWidth="3.5" />
            <text x="200" y="82" textAnchor="middle" fill="#050B14" fontSize="13" fontWeight="900">
              DEGREE EXAMS IN 2–3 MONTHS
            </text>
            <text x="200" y="108" textAnchor="middle" fill="#B91C1C" fontSize="10" fontWeight="900">
              FULL FOCUS ON GRADUATION
            </text>
          </g>
        )}

        {sceneId === 'ch8-p3' && (
          <g>
            <rect x="55" y="36" width="290" height="110" rx="10" fill="#10B981" stroke="#050B14" strokeWidth="3.5" />
            <text x="200" y="82" textAnchor="middle" fill="#050B14" fontSize="15" fontWeight="900">
              DEGREE COMPLETED! 🎓
            </text>
            <text x="200" y="108" textAnchor="middle" fill="#050B14" fontSize="11" fontWeight="900">
              RETURNING TO HYDERABAD
            </text>
          </g>
        )}

        {sceneId === 'ch8-p4' && (
          <g>
            {[
              { r: '1. SWIMMER', x: 12 },
              { r: '2. LIFEGUARD', x: 88 },
              { r: '3. JR COACH', x: 164 },
              { r: '4. OPERATOR', x: 240 },
              { r: '5. COACH', x: 316 },
            ].map((item) => (
              <g key={item.r} transform={`translate(${item.x}, 55)`}>
                <rect x="0" y="0" width="70" height="85" rx="6" fill="#38BDF8" stroke="#050B14" strokeWidth="2.5" />
                <text x="35" y="46" textAnchor="middle" fill="#050B14" fontSize="8" fontWeight="900">{item.r}</text>
              </g>
            ))}
          </g>
        )}

        {/* =========================================================
            CHAPTER 9: THE BEGINNING OF AQUA SLASH (PANELS 1–4)
           ========================================================= */}
        {sceneId === 'ch9-p1' && (
          <g>
            <rect x="30" y="30" width="55" height="115" fill="#1E293B" stroke="#050B14" strokeWidth="3" />
            <rect x="315" y="30" width="55" height="115" fill="#1E293B" stroke="#050B14" strokeWidth="3" />
            <rect x="0" y="140" width="400" height="100" fill="#0EA5E9" stroke="#050B14" strokeWidth="3" />
            <rect x="100" y="42" width="200" height="72" rx="8" fill="#0F172A" stroke="#38BDF8" strokeWidth="3" />
            <text x="200" y="74" textAnchor="middle" fill="#FDE047" fontSize="11" fontWeight="900">
              COMMUNITY SWIMMING COACHING
            </text>
            <text x="200" y="94" textAnchor="middle" fill="#38BDF8" fontSize="9" fontWeight="800">
              BEYOND TRADITIONAL ACADEMIES
            </text>
          </g>
        )}

        {sceneId === 'ch9-p2' && (
          <g>
            <circle cx="200" cy="96" r="64" fill="#F59E0B" stroke="#050B14" strokeWidth="4" />
            <text x="200" y="90" textAnchor="middle" fill="#050B14" fontSize="15" fontWeight="900">
              NSNIS
            </text>
            <text x="200" y="110" textAnchor="middle" fill="#050B14" fontSize="11" fontWeight="900">
              CERTIFIED
            </text>
          </g>
        )}

        {sceneId === 'ch9-p3' && (
          <g>
            <rect x="45" y="32" width="310" height="115" rx="12" fill="#050B14" stroke="#0EA5E9" strokeWidth="4" />
            <text x="200" y="78" textAnchor="middle" fill="#38BDF8" fontSize="22" fontWeight="900">
              AQUA SLASH (2024)
            </text>
            <text x="200" y="108" textAnchor="middle" fill="#FDE047" fontSize="11" fontWeight="900">
              HIS OWN STARTUP • HIS OWN IDEA • HIS OWN RESPONSIBILITY
            </text>
          </g>
        )}

        {sceneId === 'ch9-p4' && (
          <g>
            <rect x="55" y="38" width="290" height="105" rx="10" fill="#0F172A" stroke="#38BDF8" strokeWidth="3" />
            <text x="200" y="82" textAnchor="middle" fill="#FFFFFF" fontSize="14" fontWeight="900">
              BUILDING THROUGH 2024 &amp; 2025
            </text>
            <text x="200" y="108" textAnchor="middle" fill="#FDE047" fontSize="11" fontWeight="800">
              UNDERSTANDING THE DEEPER “WHY”
            </text>
          </g>
        )}

        {/* =========================================================
            CHAPTER 10: WHY AQUA SLASH? (PANELS 1–4)
           ========================================================= */}
        {sceneId === 'ch10-p1' && (
          <g>
            <rect x="25" y="36" width="165" height="110" rx="8" fill="#0369A1" stroke="#050B14" strokeWidth="3" />
            <text x="107" y="92" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="900">THE CHILDHOOD RIVER</text>
            <rect x="210" y="36" width="165" height="110" rx="8" fill="#1E293B" stroke="#050B14" strokeWidth="3" />
            <text x="292" y="92" textAnchor="middle" fill="#FCA5A5" fontSize="10" fontWeight="900">THE VILLAGE WELL</text>
          </g>
        )}

        {sceneId === 'ch10-p2' && (
          <g>
            <rect x="40" y="36" width="320" height="110" rx="10" fill="#0284C7" stroke="#050B14" strokeWidth="3.5" />
            <text x="200" y="78" textAnchor="middle" fill="#FDE047" fontSize="13" fontWeight="900">
              TAKE SWIMMING TO THE PEOPLE!
            </text>
            <text x="200" y="106" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="800">
              STRUCTURED COACHING IN RESIDENTIAL COMMUNITIES
            </text>
          </g>
        )}

        {sceneId === 'ch10-p3' && (
          <g>
            {[
              { t: 'COMMUNITIES', x: 18 },
              { t: 'SCHOOLS', x: 112 },
              { t: 'COMICS', x: 206 },
              { t: 'WATER SAFETY', x: 300 },
            ].map((p) => (
              <g key={p.t} transform={`translate(${p.x}, 48)`}>
                <rect x="0" y="0" width="84" height="95" rx="8" fill="#10B981" stroke="#050B14" strokeWidth="3" />
                <text x="42" y="52" textAnchor="middle" fill="#050B14" fontSize="9" fontWeight="900">{p.t}</text>
              </g>
            ))}
          </g>
        )}

        {sceneId === 'ch10-p4' && (
          <g>
            <rect x="30" y="32" width="340" height="115" rx="12" fill="#050B14" stroke="#F59E0B" strokeWidth="4" />
            <text x="200" y="78" textAnchor="middle" fill="#38BDF8" fontSize="15" fontWeight="900">
              CUT THROUGH FEAR OF WATER.
            </text>
            <text x="200" y="108" textAnchor="middle" fill="#FDE047" fontSize="14" fontWeight="900">
              ONE DROP AT A TIME.
            </text>
          </g>
        )}

        {/* =========================================================
            CHAPTER 11: THE FIRST COMMUNITIES — REALITY BEGINS (1–4)
           ========================================================= */}
        {sceneId === 'ch11-p1' && (
          <g>
            <rect x="45" y="38" width="135" height="110" rx="8" fill="#0EA5E9" stroke="#050B14" strokeWidth="3" />
            <text x="112" y="95" textAnchor="middle" fill="#050B14" fontSize="11" fontWeight="900">COMMUNITY 01</text>
            <rect x="220" y="38" width="135" height="110" rx="8" fill="#0EA5E9" stroke="#050B14" strokeWidth="3" />
            <text x="287" y="95" textAnchor="middle" fill="#050B14" fontSize="11" fontWeight="900">COMMUNITY 02</text>
          </g>
        )}

        {sceneId === 'ch11-p2' && (
          <g>
            <rect x="55" y="36" width="290" height="110" rx="10" fill="#991B1B" stroke="#050B14" strokeWidth="3.5" />
            <text x="200" y="80" textAnchor="middle" fill="#FEF08A" fontSize="14" fontWeight="900">
              INTERRUPTED BY AN ACCIDENT
            </text>
            <text x="200" y="108" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="800">
              “THE STUDENTS WERE STILL WAITING FOR HIM”
            </text>
          </g>
        )}

        {sceneId === 'ch11-p3' && (
          <g>
            <rect x="55" y="36" width="290" height="110" rx="10" fill="#10B981" stroke="#050B14" strokeWidth="3.5" />
            <text x="200" y="82" textAnchor="middle" fill="#050B14" fontSize="16" fontWeight="900">
              RECOVERED &amp; RETURNED!
            </text>
            <text x="200" y="108" textAnchor="middle" fill="#050B14" fontSize="12" fontWeight="900">
              HE DID NOT QUIT.
            </text>
          </g>
        )}

        {sceneId === 'ch11-p4' && (
          <g>
            <rect x="45" y="38" width="310" height="108" rx="10" fill="#0F172A" stroke="#F43F5E" strokeWidth="3.5" />
            <text x="200" y="82" textAnchor="middle" fill="#FDE047" fontSize="13" fontWeight="900">
              MORE THAN ENTHUSIASM
            </text>
            <text x="200" y="108" textAnchor="middle" fill="#F8FAFC" fontSize="10" fontWeight="800">
              LEARNING WHAT IT TRULY MEANS TO RUN AQUA SLASH
            </text>
          </g>
        )}

        {/* =========================================================
            CHAPTER 12: THE IDEAS THAT WAITED (PANELS 1–4)
           ========================================================= */}
        {sceneId === 'ch12-p1' && (
          <g>
            <rect x="45" y="32" width="310" height="120" rx="10" fill="#FEF9C3" stroke="#050B14" strokeWidth="3.5" />
            <text x="200" y="75" textAnchor="middle" fill="#050B14" fontSize="14" fontWeight="900">
              EDUCATIONAL SWIMMING COMICS
            </text>
            <text x="200" y="102" textAnchor="middle" fill="#0369A1" fontSize="10" fontWeight="900">
              VISUAL STORYTELLING FOR CHILDREN
            </text>
          </g>
        )}

        {sceneId === 'ch12-p2' && (
          <g>
            <rect x="45" y="38" width="310" height="108" rx="10" fill="#1E293B" stroke="#F59E0B" strokeWidth="3" />
            <text x="200" y="82" textAnchor="middle" fill="#FDE047" fontSize="12" fontWeight="900">
              EXPLORING INDEPENDENT POOL OPERATIONS
            </text>
            <text x="200" y="108" textAnchor="middle" fill="#94A3B8" fontSize="10" fontWeight="800">
              HOMETOWN WORK &amp; NEW POSSIBILITIES
            </text>
          </g>
        )}

        {sceneId === 'ch12-p3' && (
          <g>
            <rect x="45" y="38" width="310" height="108" rx="10" fill="#0F172A" stroke="#94A3B8" strokeWidth="3" />
            <text x="200" y="82" textAnchor="middle" fill="#E2E8F0" fontSize="12" fontWeight="900">
              SOME IDEAS MOVED FORWARD
            </text>
            <text x="200" y="108" textAnchor="middle" fill="#94A3B8" fontSize="10" fontWeight="800">
              OTHERS REMAINED UNFINISHED
            </text>
          </g>
        )}

        {sceneId === 'ch12-p4' && (
          <g>
            <rect x="45" y="38" width="310" height="108" rx="10" fill="#1E1B4B" stroke="#818CF8" strokeWidth="3.5" />
            <text x="200" y="82" textAnchor="middle" fill="#FDE047" fontSize="13" fontWeight="900">
              MORE THAN A COACHING SERVICE
            </text>
            <text x="200" y="108" textAnchor="middle" fill="#C7D2FE" fontSize="10" fontWeight="800">
              IDENTITY • CONTENT • ORGANIZED SYSTEM
            </text>
          </g>
        )}

        {/* =========================================================
            CHAPTER 13: TWO YEARS OF BUILDING — 2 TO 7 COMMUNITIES
           ========================================================= */}
        {sceneId === 'ch13-p1' && (
          <g>
            <rect x="45" y="36" width="310" height="110" rx="10" fill="#0284C7" stroke="#050B14" strokeWidth="3.5" />
            <text x="200" y="80" textAnchor="middle" fill="#FDE047" fontSize="15" fontWeight="900">
              2024 — THE FOUNDATION
            </text>
            <text x="200" y="108" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="800">
              2 INITIAL RESIDENTIAL COMMUNITIES
            </text>
          </g>
        )}

        {sceneId === 'ch13-p2' && (
          <g>
            <rect x="45" y="36" width="310" height="110" rx="10" fill="#0F766E" stroke="#050B14" strokeWidth="3.5" />
            <text x="200" y="78" textAnchor="middle" fill="#FDE047" fontSize="14" fontWeight="900">
              2025 — THE EXPANSION
            </text>
            <text x="200" y="106" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="800">
              “WHY AM I DOING THIS? HOW CAN I MAKE IT BETTER?”
            </text>
          </g>
        )}

        {sceneId === 'ch13-p3' && (
          <g>
            {/* 7 Glowing Community Badges */}
            {[0, 1, 2, 3, 4, 5, 6].map((idx) => (
              <g key={idx} transform={`translate(${18 + idx * 52}, 58)`}>
                <circle cx="22" cy="22" r="20" fill="#10B981" stroke="#050B14" strokeWidth="3" />
                <text x="22" y="26" textAnchor="middle" fill="#050B14" fontSize="11" fontWeight="900">C{idx + 1}</text>
              </g>
            ))}
            <rect x="70" y="122" width="260" height="36" rx="6" fill="#FDE047" stroke="#050B14" strokeWidth="3" />
            <text x="200" y="145" textAnchor="middle" fill="#050B14" fontSize="12" fontWeight="900">
              GROWN FROM 2 TO 7 COMMUNITIES!
            </text>
          </g>
        )}

        {sceneId === 'ch13-p4' && (
          <g>
            <rect x="45" y="38" width="310" height="108" rx="10" fill="#0F172A" stroke="#38BDF8" strokeWidth="3.5" />
            <text x="200" y="80" textAnchor="middle" fill="#FDE047" fontSize="13" fontWeight="900">
              SOMETHING DEEPER WAS MISSING
            </text>
            <text x="200" y="108" textAnchor="middle" fill="#38BDF8" fontSize="10" fontWeight="800">
              DESIGNING A STRUCTURED STAGE-BY-STAGE SYSTEM
            </text>
          </g>
        )}

        {/* =========================================================
            CHAPTER 14 & 15: THE SIX STAGES & FINAL CHAPTER
           ========================================================= */}
        {(chapter === 14 || chapter === 15) && (
          <g>
            {[
              { label: 'GLASS', x: 22, h: 56, c: '#38BDF8', idx: 1 },
              { label: 'POOL', x: 84, h: 74, c: '#06B6D4', idx: 2 },
              { label: 'POND', x: 146, h: 92, c: '#14B8A6', idx: 3 },
              { label: 'LAKE', x: 208, h: 110, c: '#3B82F6', idx: 4 },
              { label: 'RIVER', x: 270, h: 128, c: '#6366F1', idx: 5 },
              { label: 'OCEAN', x: 332, h: 148, c: '#F59E0B', idx: 6 },
            ].map((st) => (
              <g key={st.label}>
                <rect
                  x={st.x}
                  y={196 - st.h}
                  width="50"
                  height={st.h}
                  rx="6"
                  fill={st.c}
                  stroke={st.idx === panel ? '#FDE047' : '#050B14'}
                  strokeWidth={st.idx === panel ? '4' : '3'}
                />
                <text
                  x={st.x + 25}
                  y={186}
                  textAnchor="middle"
                  fill="#050B14"
                  fontSize="9"
                  fontWeight="900"
                >
                  {st.label}
                </text>
              </g>
            ))}
            <rect x="35" y="14" width="330" height="32" rx="6" fill="#FEF08A" stroke="#050B14" strokeWidth="3" />
            <text x="200" y="34" textAnchor="middle" fill="#050B14" fontSize="10.5" fontWeight="900">
              {chapter === 14
                ? `PANEL 0${panel} • JULY 1, 2026 • 6 STAGES × 3 LEVELS × 6 DROPS = 108 DROPS`
                : `PANEL 0${panel} • AQUA SLASH • CUT THROUGH FEAR OF WATER`}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};
