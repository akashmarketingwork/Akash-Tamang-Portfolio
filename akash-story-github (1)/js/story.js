/*
 * AKASH TAMANG — scroll story (v4)
 *
 * Order: desk ("hello") → hills → Bengaluru → (tower close-up) → office → shelf → ID badge
 *
 * Every number is a scroll position in px (press "D" on the page to see it).
 * Image coordinates are in "image px": each illustration is 2000 px wide.
 * zoom 1 = the widest view of the picture that fills the screen. Most shots stay wide;
 * the camera only zooms in for details and for transitions.
 *
 * Seamless hand-offs:
 *   desk → hills     camera rises into the sky, a cloud bank sweeps past
 *   hills → city     the plane flies into clouds and out over Bengaluru
 *   city → office    dive into a tower, then into one lit window (same yellow as the office floor)
 *   office → shelf   dive into the Millet Amma screen, come out of the Bengaluru postcard, pull back
 *   shelf → badge    the camera tilts down the bookshelf to the ID card hanging below it
 */

window.STORY = {
  length: 20150,

  // highlight clip shown on the Millet Amma monitor while the camera holds on it
  video: {
    sources: ["media/pitch-clip.webm", "media/pitch-clip.mp4"], poster: "media/pitch-poster.jpg", elementId: "monitor-video",
    from: 11950, to: 14300,
    youtubeId: "KuwONqJHTl8", // "Watch the full pitch" link
  },
  stage: { width: 1800, height: 1000 },

  scenes: [
    // ------------------------------------------------------------- 1 · DESK
    {
      id: "desk",
      bounds: { w: 2000, h: 1120 },
      keys: { 0: { opacity: 1 }, 4300: { opacity: 1 }, 4301: { opacity: 0 } },
      camera: {
        0: { x: 1000, y: 560, zoom: 1, px: 1080 },
        1500: { x: 1000, y: 560, zoom: 1.04, px: 1080 },
        2000: { x: 1560, y: 650, zoom: 1.9 },
        2400: { x: 1560, y: 655, zoom: 1.9 },
        2750: { x: 1345, y: 868, zoom: 1.7 },
        3100: { x: 1345, y: 868, zoom: 1.7 },
        3550: { x: 1000, y: 560, zoom: 1, px: 1080 },
        4300: { x: 300, y: 200, zoom: 2.2 }, // rise into the sky
      },
      layers: [
        { src: "images/s2-bg.webp", left: 0, top: 0, width: 2000 },
        // "hello" writes itself on the screen
        {
          src: "images/s2-hello.webp", left: 901.5, top: 322, width: 364.5, z: 2,
          keys: { 60: { reveal: 0 }, 700: { reveal: 1, ease: "linear" } },
        },
        // desk items drop in one by one
        { src: "images/s2-keyboard.webp", left: 636, top: 754, width: 342.5, z: 3,
          keys: { 560: { opacity: 0, y: -70 }, 740: { opacity: 1, y: 0, ease: "out" } } },
        { src: "images/s2-mouse.webp", left: 914, top: 936, width: 88.5, z: 3,
          keys: { 660: { opacity: 0, y: -60 }, 820: { opacity: 1, y: 0, ease: "out" } } },
        { src: "images/s2-coffee.webp", left: 1174, top: 834, width: 162.5, z: 3,
          keys: { 760: { opacity: 0, y: -80 }, 940: { opacity: 1, y: 0, ease: "out" } } },
        { src: "images/s2-notebook.webp", left: 1192, top: 920, width: 316.5, z: 3,
          keys: { 860: { opacity: 0, y: -70, rotate: -4 }, 1060: { opacity: 1, y: 0, rotate: 0, ease: "out" } } },
      ],
    },

    // ------------------------------------------------------------ 2 · HILLS
    {
      id: "hills",
      bounds: { w: 2000, h: 1014 },
      keys: { 4280: { opacity: 0 }, 4300: { opacity: 1 }, 6900: { opacity: 1 }, 6901: { opacity: 0 } },
      camera: {
        4300: { x: 1000, y: 330, zoom: 1.4, px: 300 },
        5200: { x: 1000, y: 507, zoom: 1, px: 560 },
        5800: { x: 1030, y: 500, zoom: 1.04, px: 720 },
        6600: { x: 1180, y: 470, zoom: 1.8 },
        6900: { x: 1430, y: 426, zoom: 2.1, ease: "linear" },
      },
      layers: [
        { src: "images/s3-hills.webp", left: 0, top: 0, width: 2000 },
        // the plane takes off across the valley
        { src: "images/plane.webp", left: 800, top: 405, width: 515.5, z: 2,
          keys: { 4300: { x: -900, y: 155 }, 6600: { x: 0, y: 0, ease: "linear" }, 6900: { x: 250, y: -44, ease: "linear" } } },
      ],
    },

    // ------------------------------------------------------------- 3 · CITY
    {
      id: "city",
      bounds: { w: 2000, h: 1014 },
      keys: { 6880: { opacity: 0 }, 6900: { opacity: 1 }, 9160: { opacity: 1 }, 9161: { opacity: 0 } },
      camera: {
        6900: { x: 1000, y: 420, zoom: 1.6 },
        7800: { x: 1000, y: 507, zoom: 1 },
        8300: { x: 1040, y: 507, zoom: 1.03 },
        9100: { x: 1657, y: 700, zoom: 6 },
        9850: { x: 1657, y: 700, zoom: 130 },
      },
      layers: [
        { src: "images/s4-city.webp", left: 0, top: 0, width: 2000 },
        { src: "images/plane.webp", left: 605, top: 341.5, width: 515.5, z: 2,
          keys: { 6900: { x: -250, y: 45 }, 8600: { x: 1150, y: -200, ease: "linear" } } },
      ],
    },

    // ----------------------------------- bridge · TOWER CLOSE-UP (drawn art)
    {
      id: "tower",
      bounds: { w: 2000, h: 1014 },
      keys: { 8900: { opacity: 0 }, 9150: { opacity: 1 }, 9850: { opacity: 1 }, 9851: { opacity: 0 } },
      camera: {
        8300: { x: 1040, y: 507, zoom: 1.03 },
        9100: { x: 1657, y: 700, zoom: 6 },
        9850: { x: 1657, y: 700, zoom: 130 },
      },
      layers: [{ src: "images/tower-closeup.svg", left: 1420, top: 540, width: 480, height: 280 }],
    },

    // ----------------------------------------------------------- 4 · OFFICE
    {
      id: "office",
      bounds: { w: 2240, h: 1006 },
      keys: { 9560: { opacity: 0 }, 9850: { opacity: 1 }, 14700: { opacity: 1 }, 14701: { opacity: 0 } },
      camera: {
        9560: { x: 980, y: 275, zoom: 9 },
        10700: { x: 1120, y: 503, zoom: 1, px: 1190, ease: "out" },
        11400: { x: 1120, y: 503, zoom: 1, px: 1190 },
        12000: { x: 1192, y: 695, zoom: 5 },          // close on the Millet Amma monitor
        13700: { x: 1192, y: 695, zoom: 5.3 },        // hold here while the video plays
        14700: { x: 1240, y: 722, zoom: 9 },          // dive into the screen
      },
      layers: [
        { src: "images/s5-office.webp", left: 0, top: 0, width: 2240 },
        // the video, fitted onto the monitor's screen (a parallelogram)
        {
          left: 1114.4, top: 629, width: 162.3, height: 82.5, z: 3, className: "screen",
          html: '<div class="screen-skew"><div class="screen-video"><div id="monitor-video"></div></div></div>',
        },
        // crisp vector monitor frame on top
        {
          left: 1100, top: 610, width: 190, height: 170, z: 4, className: "bezel",
          html:
            '<svg viewBox="1100 610 190 170" width="190" height="170" aria-hidden="true">' +
            '<path fill="#8e6574" fill-rule="evenodd" d="M1110.9 619.5 L1273.5 673.8 L1273.5 764.6 L1110.9 714.7 Z ' +
            'M1114.4 629 L1269.1 678.2 L1269.1 760.7 L1114.4 711.5 Z"/>' +
            '<path fill="#6f4c5c" d="M1273.5 673.8 L1276.6 672.6 L1276.6 763.2 L1273.5 764.6 Z"/>' +
            "</svg>",
        },
      ],
    },

    // ------------------------------------------------- 5 · SHELF → 6 · BADGE
    // one picture: the bookshelf, with the ID badge hanging below the shelf
    {
      id: "shelf",
      bounds: { w: 2000, h: 1904 },
      ref: { w: 2000, h: 1014 }, // "wide" = one shelf tall
      keys: { 14200: { opacity: 0 }, 14700: { opacity: 1 } },
      camera: {
        14200: { x: 1678, y: 136, zoom: 4.8 },       // the Bengaluru postcard
        14750: { x: 1678, y: 136, zoom: 4.3 },
        15450: { x: 1000, y: 507, zoom: 1, ease: "inOut" }, // the whole shelf
        16850: { x: 1000, y: 507, zoom: 1.03 },
        17650: { x: 1000, y: 1397, zoom: 1, px: 600 },      // tilt down to the badge
        18250: { x: 600, y: 1730, zoom: 1.9 },
        18850: { x: 600, y: 1730, zoom: 1.9 },
        19450: { x: 1200, y: 1397, zoom: 1, px: 600 },
      },
      layers: [
        { src: "images/s6-shelf.webp", left: 0, top: 0, width: 2000 },
        {
          src: "images/s1-lanyard.webp", left: 501.4, top: 992.9, width: 197.5, origin: "50% 0", z: 2, className: "lanyard", // hangs from the little tower
          keys: { 17250: { rotate: 0 }, 17650: { rotate: 2.2 }, 18050: { rotate: -1.5 }, 18450: { rotate: 0.9 }, 18850: { rotate: -0.4 }, 19250: { rotate: 0 } },
        },
      ],
    },
  ],

  // fixed on screen, above every scene
  overlay: [
    // cloud wipe 1 · desk → hills
    { src: "images/cloud-a.svg", className: "drift", z: 1,
      keys: { 3500: { p: 0 }, 5100: { p: 1, ease: "linear" } } },
    { src: "images/cloud-back.svg", className: "cloud back", z: 2,
      keys: { 3650: { p: 0 }, 4950: { p: 1, ease: "inOut" } } },
    { src: "images/cloud-front.svg", className: "cloud", z: 3,
      keys: { 3800: { p: 0 }, 4800: { p: 1, ease: "inOut" } } },
    { src: "images/cloud-b.svg", className: "drift low", z: 4,
      keys: { 4100: { p: 0 }, 5400: { p: 1, ease: "linear" } } },

    // cloud wipe 2 · hills → Bengaluru (the plane flies through)
    { src: "images/cloud-a.svg", className: "drift low", z: 1,
      keys: { 5900: { p: 0 }, 7300: { p: 1, ease: "linear" } } },
    { src: "images/cloud-back.svg", className: "cloud back", z: 2,
      keys: { 6250: { p: 0 }, 7550: { p: 1, ease: "inOut" } } },
    { src: "images/cloud-front.svg", className: "cloud", z: 3,
      keys: { 6400: { p: 0 }, 7400: { p: 1, ease: "inOut" } } },
    { src: "images/cloud-b.svg", className: "drift", z: 4,
      keys: { 6800: { p: 0 }, 8200: { p: 1, ease: "linear" } } },

    {
      className: "contact-card", z: 10,
      html:
        "<h2>Let's grow something together.</h2>" +
        "<p>Growth, strategy and ads that people actually click.</p>" +
        '<div class="links">' +
        '<a href="mailto:you@example.com">Email</a>' +
        '<a href="https://www.linkedin.com/" target="_blank" rel="noopener">LinkedIn</a>' +
        '<a href="#" target="_blank" rel="noopener">Résumé</a>' +
        "</div>",
      keys: { 19450: { opacity: 0, y: 30 }, 19950: { opacity: 1, y: 0, ease: "out" } },
    },
  ],

  // position: "top" moves a line to the top of the screen
  subtitles: [
    { start: 1150, end: 1700, text: "Hi, I'm Akash Tamang 👋" },
    { start: 1750, end: 1990, text: "I help brands grow." },
    { start: 2000, end: 2450, text: "By day, I figure out why people click," },
    { start: 2700, end: 3150, text: "hook → offer → CTA. Test. Repeat." },
    { start: 3300, end: 3800, text: "But my story didn't start at a desk." },
    { start: 5000, end: 5600, text: "It started in the hills I call home." },
    { start: 5700, end: 6300, text: "Then one day, I packed my bags…" },
    { start: 7450, end: 8000, text: "…and flew to Bengaluru." },
    { start: 8050, end: 8650, text: "New city. New people. Everything to learn." },
    { start: 10700, end: 11300, text: "I joined my first marketing team," },
    { start: 11450, end: 11950, text: "growing brands like Millet Amma," },
    { start: 12150, end: 12900, text: "Millet Amma on Shark Tank India 🦈", position: "top" },
    { start: 13300, end: 13950, text: "learning growth the only way that works: by doing it.", position: "top" },
    { start: 14750, end: 15350, text: "I still keep a postcard from the city that changed everything," },
    { start: 15550, end: 16150, text: "the ads that made me click," },
    { start: 16250, end: 16850, text: "and the books that changed how I think." },
    { start: 18250, end: 18900, text: "Today: Sr. Manager, Growth & Strategy at Walnut Folks Group.", position: "top" },
    { start: 18950, end: 19400, text: "Still learning. Still testing. Always curious." },
  ],
};
