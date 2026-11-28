/**
 * Every animation timing for the public site in one place (seconds unless noted).
 * Change a number here and the matching animation speeds up or slows down.
 * Only transform / opacity are animated; prefers-reduced-motion shows the final state.
 */
export const EASE = [0.22, 1, 0.36, 1] as const;          // default easing: cubic-bezier(0.22, 1, 0.36, 1)
export const EASE_CSS = "cubic-bezier(0.22, 1, 0.36, 1)";
export const EASE_POP = [0.34, 1.56, 0.64, 1] as const;   // small overshoot for number badges

/** How much of a section must be visible before it plays (0–1). */
export const IN_VIEW_AMOUNT = 0.3;

/** Common details (headings, reveals, buttons). */
export const COMMON = {
  reveal: 0.55,         // generic fade-up
  revealRise: 16,       // px
  underline: 0.4,       // gold underline under headings
  countUp: 1.2,         // "At a glance" numbers
  buttonLift: 0.15,     // CSS hover lift
};

/** Pattern 3: numbered benefit cards ("cards developing like photos"). */
export const CARDS = {
  stagger: 0.14,        // between cards, left → right
  card: 0.5,            // card fade-up
  cardRise: 20,         // px
  numberAt: 0.12,       // serif number slides in
  number: 0.4,
  numberShift: 14,      // px it slides from
  deepen: 0.3,          // number shifts soft gold → deep gold
  lineAt: 0.3,          // gold line draws to the right edge
  line: 0.5,
  imageAt: 0.45,        // image wipes in bottom → top (clip-path)
  image: 0.7,
  textAt: 0.85,         // title + description fade up
  text: 0.45,
};

/** Section A: "Sun → Panels → Inverter → Home → Net meter → Grid" (home page). */
export const FLOW = {
  cardFade: 0.5,        // card fades up
  cardRise: 24,         // px
  firstStep: 0.35,      // first step starts this long after the card starts
  stagger: 0.4,         // between steps (brief: 0.35–0.45)
  circle: 0.45,         // image circle scale 0.85 → 1 + fade
  circleFrom: 0.85,
  badgeAt: 0.15,        // badge pops this long after its circle starts
  badge: 0.35,
  textAt: 0.22,         // title + description fade up after the circle starts
  text: 0.4,
  arrowAt: 0.3,         // arrow after a step starts drawing this long after the step
  arrow: 0.3,
  sunGlow: 3.2,         // sun glow pulse period (loop)
  sunRays: 20,          // ray ring: one full turn
  dotEvery: 8,          // gold dot travels Sun → Grid every N seconds (while on screen)
  dotTravel: 3.2,       // seconds the dot takes from Sun to Grid
  hoverLift: 4,         // px, image circle on hover (150 ms, CSS)
  mobileLine: 0.45,     // mobile: vertical connector draws downward
};

/** Section B: "Five simple steps to your own power". */
export const STEPS = {
  heading: 0.5,         // heading fades up
  underlineAt: 0.35,    // gold underline starts after the heading
  underline: 0.4,       // draws from the centre outwards
  firstCircle: 0.75,    // circle 1 appears after the section starts
  circle: 0.4,          // circle pop + gold ring pulse
  ringPulse: 0.9,
  line: 0.45,           // connector draws to the next circle
  lineAt: 0.2,          // connector starts this long after its circle
  cardAfterCircle: 0.15,// card rises 150 ms after its circle
  card: 0.45,
  cardRise: 32,         // px
  imageFrom: 1.04,      // card image scales 1.04 → 1
  hoverLift: 6,         // px (CSS)
};
/** Time between two circles = connector start + connector duration. */
export const STEP_GAP = STEPS.lineAt + STEPS.line;

/** Pattern 4: scheme steps ("a path being walked down"). Scroll-driven, no timers between steps. */
export const PATH = {
  start: "75%",         // connector starts growing when the list top reaches 75% of the viewport height
  end: "60%",           // …and is full when the list bottom reaches 60%
  lead: 0.15,           // a tile activates slightly before the connector tip reaches its centre (0–1 of a gap)
  tile: 0.45,           // tile pops in, scale 0.8 → 1
  tileFrom: 0.8,
  glow: 1,              // soft glow on the tile, once
  rowAt: 0.12,          // row slides in from the right after its tile
  row: 0.5,
  rowShift: 40,         // px
  sweepAt: 0.35,        // light sweep across the row, once
  sweep: 0.9,
  hoverTilt: 3,         // degrees (CSS, 200 ms)
};

/** Pattern 5: subsidy timeline ("progress tracker that fills as you read"). */
export const TRACK = {
  start: "65%",         // line starts filling when the list top reaches 65% of the viewport height
  end: "55%",           // …and is full when the list bottom reaches 55%
  dotPop: 0.5,          // dot pops (1 → 1.25 → 1) when the fill reaches it
  ringPulse: 0.8,
  card: 0.5,            // card slides in from the right, once
  cardShift: 32,        // px
  thumbFrom: 1.08,      // thumbnail scales 1.08 → 1
  active: 0.3,          // active-card highlight fade (CSS)
};

/**
 * Generic grids site-wide (<Develop>): each grid uses the closest signature pattern.
 * kind="card" → Pattern 3 look (card fades up, its photo develops bottom → top); kind="row" → Pattern 5 look
 * (row slides in from the right). Stagger is by column so a row of cards enters left → right.
 */
export const DEVELOP = {
  stagger: 0.08,        // between cards in the same row
  card: 0.5,            // card fade-up
  cardRise: 20,         // px
  photoAt: 0.2,         // photo wipe starts after the card starts
  photo: 0.7,           // bottom → top clip-path wipe
  row: 0.5,             // row slide-in
  rowShift: 32,         // px from the right
  amount: 0.2,          // how much of the card must be visible
};
