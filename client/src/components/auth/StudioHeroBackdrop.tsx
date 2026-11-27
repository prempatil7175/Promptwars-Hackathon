import { useReducedMotion } from 'framer-motion';

/* ─── Track path (matches the groove path in SVG) ─────────────────────────── */
const TRACK_PATH = 'M 28 492 C 130 456, 198 354, 298 329 C 362 313, 404 316, 446 296';

/* ─── Stagger offsets for 5 track spheres (negative = pre-populated) ───────── */
const TRACK_SPHERES = [
  { fill: 'violetToken', r: 16, begin: '0s',    dur: '4s' },
  { fill: 'holoToken',   r: 15, begin: '-0.8s', dur: '4s' },
  { fill: 'violetToken', r: 16, begin: '-1.6s', dur: '4s' },
  { fill: 'holoToken',   r: 15, begin: '-2.4s', dur: '4s' },
  { fill: 'violetToken', r: 16, begin: '-3.2s', dur: '4s' },
];

/* ─── Rising pipe spheres (5, staggered inside cylinder) ───────────────────── */
const PIPE_SPHERES = [
  { fill: 'violetToken', r: 18, begin: '0s',    dur: '3.6s' },
  { fill: 'holoToken',   r: 16, begin: '-0.72s', dur: '3.6s' },
  { fill: 'violetToken', r: 17, begin: '-1.44s', dur: '3.6s' },
  { fill: 'holoToken',   r: 15, begin: '-2.16s', dur: '3.6s' },
  { fill: 'violetToken', r: 16, begin: '-2.88s', dur: '3.6s' },
];

export function StudioHeroBackdrop() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none relative mx-auto h-[340px] w-full max-w-[580px] select-none sm:h-[420px] lg:h-[490px]"
    >
      {/* Ambient studio violet + soft cool glow */}
      <div className="absolute top-6 right-8 h-64 w-64 rounded-full bg-[#5A45F5]/14 blur-3xl" />
      <div className="absolute bottom-6 left-10 h-44 w-56 rounded-full bg-[#A78BFA]/20 blur-3xl" />

      <svg
        viewBox="0 0 640 520"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full drop-shadow-[0_24px_48px_rgba(19,20,32,0.09)]"
      >
        <defs>
          {/* Matte studio white track body */}
          <linearGradient id="trackBody" x1="60" y1="480" x2="470" y2="260" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="55%" stopColor="#F4F5FA" />
            <stop offset="100%" stopColor="#E6E8F0" />
          </linearGradient>

          {/* Recessed inner track groove */}
          <linearGradient id="trackGroove" x1="80" y1="470" x2="470" y2="275" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#D8DCE8" />
            <stop offset="60%" stopColor="#CFD4E4" />
            <stop offset="100%" stopColor="#C3C8DC" />
          </linearGradient>

          {/* Vault mechanical pedestal */}
          <linearGradient id="pedestalWall" x1="370" y1="240" x2="570" y2="380" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="50%" stopColor="#EEF0F7" />
            <stop offset="100%" stopColor="#D8DCE8" />
          </linearGradient>
          <linearGradient id="pedestalTop" x1="375" y1="220" x2="565" y2="275" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#E6E8F0" />
          </linearGradient>

          {/* Glass vault cylinder */}
          <linearGradient id="glassTube" x1="400" y1="40" x2="540" y2="255" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.65" />
            <stop offset="35%" stopColor="#EEF0F7" stopOpacity="0.24" />
            <stop offset="70%" stopColor="#5A45F5" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.52" />
          </linearGradient>
          <linearGradient id="glassHighlight" x1="418" y1="55" x2="435" y2="245" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.88" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.12" />
          </linearGradient>

          {/* Glossy Violet-Indigo Token */}
          <radialGradient id="violetToken" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#B8A2FF" />
            <stop offset="45%" stopColor="#5A45F5" />
            <stop offset="100%" stopColor="#3E2BC4" />
          </radialGradient>

          {/* Holographic / Iridescent Token */}
          <radialGradient id="holoToken" cx="32%" cy="28%" r="72%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="42%" stopColor="#DDD6FE" />
            <stop offset="76%" stopColor="#A5B4FC" />
            <stop offset="100%" stopColor="#5A45F5" />
          </radialGradient>

          <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#5A45F5" floodOpacity="0.32" />
          </filter>

          {/* ── Track path re-used by animateMotion ──────────────────────────── */}
          <path
            id="trackPath"
            d={TRACK_PATH}
          />

          {/* ── Clip path: interior of glass cylinder (no ellipse bottom needed) */}
          <clipPath id="pipeClip">
            {/* Full cylinder interior rectangle */}
            <rect x="406" y="66" width="128" height="186" />
            {/* Top cap ellipse */}
            <ellipse cx="470" cy="66" rx="64" ry="16" />
            {/* Bottom cap ellipse */}
            <ellipse cx="470" cy="252" rx="64" ry="16" />
          </clipPath>

          {/* Rising sphere glow (tighter, inside pipe) */}
          <filter id="pipeGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#5A45F5" floodOpacity="0.5" />
          </filter>
        </defs>

        {/* Ground soft contact shadow under vault pedestal */}
        <ellipse cx="470" cy="400" rx="122" ry="30" fill="#131420" fillOpacity="0.08" />
        <ellipse cx="470" cy="396" rx="95" ry="22" fill="#5A45F5" fillOpacity="0.08" />

        {/* Lower-left sweeping matte-white 3D sculpted track */}
        <path
          d="M 18 498 C 125 462, 195 360, 295 335 C 360 318, 405 322, 445 304 L 445 358 C 392 380, 345 376, 286 394 C 192 422, 130 502, 46 520 Z"
          fill="url(#trackBody)"
          stroke="#FFFFFF"
          strokeWidth="2"
        />
        {/* Track side shadow bevel */}
        <path
          d="M 46 520 C 130 502, 192 422, 286 394 C 345 376, 392 380, 445 358 L 445 344 C 392 365, 344 360, 284 378 C 188 406, 128 486, 40 508 Z"
          fill="#D4D8E6"
          fillOpacity="0.7"
        />
        {/* Sculpted top track rim + inner recessed channel */}
        <path
          d={TRACK_PATH}
          stroke="url(#trackGroove)"
          strokeWidth="22"
          strokeLinecap="round"
        />
        <path
          d={TRACK_PATH}
          stroke="#FFFFFF"
          strokeOpacity="0.65"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Mechanical Vault Pedestal (Cylinder base) */}
        <path
          d="M 372 252 L 372 362 C 372 384, 416 402, 470 402 C 524 402, 568 384, 568 362 L 568 252 Z"
          fill="url(#pedestalWall)"
          stroke="#FFFFFF"
          strokeWidth="1.5"
        />
        {/* Pedestal precision collar ring */}
        <ellipse cx="470" cy="346" rx="98" ry="26" fill="none" stroke="#CFD4E3" strokeWidth="2" />
        <ellipse cx="470" cy="252" rx="98" ry="28" fill="url(#pedestalTop)" stroke="#FFFFFF" strokeWidth="2" />
        {/* Recessed dark vault chamber slot */}
        <ellipse cx="470" cy="252" rx="68" ry="18" fill="#1F2233" fillOpacity="0.88" />

        {/* Pulsing violet base portal glow — synced with rising spheres */}
        <ellipse cx="470" cy="252" rx="60" ry="14" fill="#6C47FF" fillOpacity="0.26">
          {!prefersReducedMotion && (
            <animate
              attributeName="fill-opacity"
              values="0.22;0.58;0.22"
              dur="1.6s"
              repeatCount="indefinite"
            />
          )}
        </ellipse>

        {/* Back Glass Cylinder Rim */}
        <ellipse cx="470" cy="64" rx="68" ry="18" fill="#FFFFFF" fillOpacity="0.22" stroke="#FFFFFF" strokeOpacity="0.6" strokeWidth="1.5" />

        {/* ── STAGE B: Spheres rising inside glass pipe (clipped) ───────────── */}
        <g clipPath="url(#pipeClip)" filter="url(#pipeGlow)">
          {PIPE_SPHERES.map((s, i) => {
            if (prefersReducedMotion) {
              /* Static frame: show first sphere near centre of pipe */
              if (i !== 0) return null;
              return (
                <g key={i}>
                  <circle cx="470" cy="158" r={s.r} fill={`url(#${s.fill})`} />
                  <ellipse
                    cx={470 - s.r * 0.18}
                    cy={158 - s.r * 0.28}
                    rx={s.r * 0.35}
                    ry={s.r * 0.2}
                    transform={`rotate(-25 ${470 - s.r * 0.18} ${158 - s.r * 0.28})`}
                    fill="#FFFFFF"
                    fillOpacity="0.68"
                  />
                </g>
              );
            }
            return (
              <g key={i}>
                {/* Main sphere */}
                <circle r={s.r} fill={`url(#${s.fill})`}>
                  {/* Rise from base (cy=252) to top (cy=68) */}
                  <animateMotion
                    dur={s.dur}
                    begin={s.begin}
                    repeatCount="indefinite"
                    calcMode="linear"
                    path={`M 470 252 C ${470 + 4} 200, ${470 - 6} 155, 470 68`}
                  />
                  {/* Fade in at base, fade out at top */}
                  <animate
                    attributeName="opacity"
                    values="0;1;1;0"
                    keyTimes="0;0.12;0.82;1"
                    dur={s.dur}
                    begin={s.begin}
                    repeatCount="indefinite"
                  />
                </circle>
                {/* Specular highlight — same path, offset */}
                <ellipse rx={s.r * 0.35} ry={s.r * 0.2} fill="#FFFFFF" fillOpacity="0.65">
                  <animateMotion
                    dur={s.dur}
                    begin={s.begin}
                    repeatCount="indefinite"
                    calcMode="linear"
                    path={`M ${470 - s.r * 0.18} ${252 - s.r * 0.28} C ${470 + 4 - s.r * 0.18} ${200 - s.r * 0.28}, ${470 - 6 - s.r * 0.18} ${155 - s.r * 0.28}, ${470 - s.r * 0.18} ${68 - s.r * 0.28}`}
                  />
                  <animate
                    attributeName="opacity"
                    values="0;0.65;0.65;0"
                    keyTimes="0;0.12;0.82;1"
                    dur={s.dur}
                    begin={s.begin}
                    repeatCount="indefinite"
                  />
                </ellipse>
              </g>
            );
          })}
        </g>

        {/* Front Glass Cylinder Body — rendered ON TOP of rising spheres */}
        <path
          d="M 402 64 L 402 248 C 402 259, 432 268, 470 268 C 508 268, 538 259, 538 248 L 538 64"
          fill="url(#glassTube)"
          stroke="#FFFFFF"
          strokeOpacity="0.78"
          strokeWidth="1.5"
        />
        {/* Specular vertical glass streak */}
        <path
          d="M 418 74 L 418 244"
          stroke="url(#glassHighlight)"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <ellipse cx="470" cy="64" rx="68" ry="18" fill="none" stroke="#FFFFFF" strokeOpacity="0.9" strokeWidth="2" />

        {/* ── STAGE A: Tokens rolling along the sculpted track groove ──────── */}
        {TRACK_SPHERES.map((s, i) => {
          if (prefersReducedMotion) {
            /* Static frame: position spheres at fixed points on the track */
            const positions = [
              { cx: 120, cy: 445 },
              { cx: 200, cy: 388 },
              { cx: 290, cy: 340 },
              { cx: 370, cy: 320 },
              { cx: 430, cy: 304 },
            ];
            const pos = positions[i];
            return (
              <g key={i} filter="url(#softGlow)">
                <circle cx={pos.cx} cy={pos.cy} r={s.r} fill={`url(#${s.fill})`} />
                <ellipse
                  cx={pos.cx - s.r * 0.18}
                  cy={pos.cy - s.r * 0.28}
                  rx={s.r * 0.35}
                  ry={s.r * 0.2}
                  transform={`rotate(-25 ${pos.cx - s.r * 0.18} ${pos.cy - s.r * 0.28})`}
                  fill="#FFFFFF"
                  fillOpacity="0.6"
                />
              </g>
            );
          }

          return (
            <g key={i} filter="url(#softGlow)">
              {/* Main sphere on track */}
              <circle r={s.r} fill={`url(#${s.fill})`}>
                <animateMotion
                  dur={s.dur}
                  begin={s.begin}
                  repeatCount="indefinite"
                  rotate="auto"
                  calcMode="spline"
                  keyTimes="0;1"
                  keySplines="0.4 0 0.6 1"
                >
                  <mpath href="#trackPath" />
                </animateMotion>
                {/* Fade in at start, ride full track, fade out into pedestal */}
                <animate
                  attributeName="opacity"
                  values="0;1;1;0"
                  keyTimes="0;0.1;0.88;1"
                  dur={s.dur}
                  begin={s.begin}
                  repeatCount="indefinite"
                />
              </circle>

              {/* Specular highlight on track sphere */}
              <ellipse rx={s.r * 0.35} ry={s.r * 0.2} fill="#FFFFFF" fillOpacity="0.65">
                <animateMotion
                  dur={s.dur}
                  begin={s.begin}
                  repeatCount="indefinite"
                  rotate="auto"
                  calcMode="spline"
                  keyTimes="0;1"
                  keySplines="0.4 0 0.6 1"
                >
                  <mpath href="#trackPath" />
                </animateMotion>
                <animate
                  attributeName="opacity"
                  values="0;0.65;0.65;0"
                  keyTimes="0;0.1;0.88;1"
                  dur={s.dur}
                  begin={s.begin}
                  repeatCount="indefinite"
                />
              </ellipse>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
