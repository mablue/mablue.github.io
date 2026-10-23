export const chapters = [
  {
    n: 1, title: 'The Sun', duration: 18, built: true, isSun: true,
    audioEn: './assets/audio/narration/sun-en.mp3?v=20261023-1904',
    audioFa: './assets/audio/narration/sun-fa.mp3?v=20261023-1904',
    planet: { color: 0xffcc44, radius: 3.0 },
    cameraPath: [{ p: 0, r: 15, y: 3 }, { p: 1, r: 8, y: 1.5 }],
    drift: 0.1,
    chunksEn: [
      'The Sun.',
      '99% of the mass of the Solar System.',
      'A million Earths could fit inside.',
      'Eight minutes from its light to your eyes.'
    ],
    chunksFa: [
      'خورشید.',
      '۹۹ درصد جرم منظومه‌ی شمسی.',
      'یک میلیون زمین توش جا می‌شه.',
      'هشت دقیقه از نورش تا چشم‌های تو.'
    ]
  },
  {
    n: 2, title: 'Mercury', duration: 12, built: true,
    audioEn: './assets/audio/narration/mercury-en.mp3?v=20261023-1904',
    audioFa: './assets/audio/narration/mercury-fa.mp3?v=20261023-1904',
    planet: { color: 0x8c8c8c, radius: 0.5 },
    sunPos: [-25, 8, -15],
    cameraPath: [{ p: 0, r: 10, y: 4 }, { p: 1, r: 4.5, y: 1.5 }],
    drift: 0.15,
    chunksEn: [
      'Mercury.',
      'Smallest planet, closest to the Sun.',
      'A day here lasts 176 Earth days.',
      'No atmosphere, no moons, just rock and silence.'
    ],
    chunksFa: [
      'عطارد.',
      'کوچکترین سیاره، نزدیک‌ترین به خورشید.',
      'یک روز اینجا ۱۷۶ روز زمینی طول می‌کشه.',
      'بدون جو، بدون قمر، فقط سنگ و سکوت.'
    ]
  },
  {
    n: 3, title: 'Venus', duration: 14, built: true,
    audioEn: './assets/audio/narration/venus-en.mp3?v=20261023-1904',
    audioFa: './assets/audio/narration/venus-fa.mp3?v=20261023-1904',
    planet: { color: 0xe6c28b, radius: 0.7 },
    sunPos: [-25, 8, -15],
    cameraPath: [{ p: 0, r: 7, y: 2 }, { p: 1, r: 7, y: 2 }],
    drift: 0.25,
    chunksEn: [
      'Venus.',
      "Earth's sister, gone wrong.",
      '96% carbon dioxide. Hot enough to melt lead.',
      'The brightest object in our sky after the Sun and Moon.'
    ],
    chunksFa: [
      'زهره.',
      'خواهر زمین، که خراب شد.',
      '۹۶ درصد دی‌اکسید کربن. به‌قدری داغ که سرب رو ذوب می‌کنه.',
      'درخشان‌ترین چیز آسمون ما بعد از خورشید و ماه.'
    ]
  },
  {
    n: 4, title: 'Earth', duration: 15, built: true,
    audioEn: './assets/audio/narration/earth-en.mp3?v=20261023-1904',
    audioFa: './assets/audio/narration/earth-fa.mp3?v=20261023-1904',
    planet: { color: 0x4a90d9, radius: 0.75 },
    sunPos: [-25, 8, -15],
    cameraPath: [{ p: 0, r: 12, y: 4 }, { p: 0.5, r: 6, y: 2 }, { p: 1, r: 5, y: 1.5 }],
    drift: 0.12,
    chunksEn: [
      'Earth.',
      'The only world we know with life.',
      'Liquid water. An atmosphere we can breathe.',
      'Every human who ever lived, lived here.'
    ],
    chunksFa: [
      'زمین.',
      'تنها جهانی که می‌شناسیم و حیات داره.',
      'آب مایع. جوی که می‌تونیم تنفس کنیم.',
      'هر انسانی که تا حالا زندگی کرده، اینجا زندگی کرده.'
    ]
  },
  {
    n: 5, title: 'Mars', duration: 12, built: true,
    audioEn: './assets/audio/narration/mars-en.mp3?v=20261023-1904',
    audioFa: './assets/audio/narration/mars-fa.mp3?v=20261023-1904',
    planet: { color: 0xd95c3d, radius: 0.6 },
    sunPos: [-25, 8, -15],
    cameraPath: [{ p: 0, r: 9, y: 3 }, { p: 1, r: 4.5, y: 1.5 }],
    drift: 0.15,
    chunksEn: [
      'Mars.',
      'The red planet. Iron oxide dust.',
      'Once had rivers, maybe oceans.',
      'Now a desert with a thin atmosphere, waiting for us.'
    ],
    chunksFa: [
      'مریخ.',
      'سیاره‌ی سرخ. غبار اکسید آهن.',
      'زمانی رودخونه داشت، شاید اقیانوس.',
      'الان یک بیابونه با جوی نازک، منتظر ما.'
    ]
  },
  {
    n: 6, title: 'Jupiter', duration: 16, built: true,
    audioEn: './assets/audio/narration/jupiter-en.mp3?v=20261023-1904',
    audioFa: './assets/audio/narration/jupiter-fa.mp3?v=20261023-1904',
    planet: { color: 0xd9b38c, radius: 1.8 },
    sunPos: [-25, 8, -15],
    cameraPath: [{ p: 0, r: 18, y: 5 }, { p: 0.6, r: 6, y: 2 }, { p: 1, r: 5.5, y: 2 }],
    drift: 0.1,
    chunksEn: [
      'Jupiter. The giant.',
      "318 times Earth's mass.",
      'A storm called the Great Red Spot has raged for 350 years.',
      'Big enough to swallow our whole planet.'
    ],
    chunksFa: [
      'مشتری. غول.',
      '۳۱۸ برابر جرم زمین.',
      'طوفانی به اسم لکه‌ی سرخ بزرگ ۳۵۰ ساله که در جریانه.',
      'به‌قدری بزرگ که کل سیاره‌ی ما رو ببلعه.'
    ]
  },
  {
    n: 7, title: 'Saturn', duration: 13, built: true,
    audioEn: './assets/audio/narration/saturn-en.mp3?v=20261023-1904',
    audioFa: './assets/audio/narration/saturn-fa.mp3?v=20261023-1904',
    planet: { color: 0xe0c97a, radius: 1.5, ring: true, tilt: 26.7 },
    sunPos: [-25, 8, -15],
    cameraPath: [{ p: 0, r: 14, y: 3 }, { p: 1, r: 9, y: 1.5 }],
    drift: 0.2,
    chunksEn: [
      'Saturn. The jewel.',
      'Its rings are 280,000 kilometers wide.',
      'But only ten meters thick.',
      'Ice and rock, dancing in gravity.'
    ],
    chunksFa: [
      'زحل. جواهر.',
      'حلقه‌هاش ۲۸۰ هزار کیلومتر پهنا دارن.',
      'اما فقط ده متر ضخامت.',
      'یخ و سنگ، در حال رقص در گرانش.'
    ]
  },
  {
    n: 8, title: 'Uranus', duration: 14, built: true,
    audioEn: './assets/audio/narration/uranus-en.mp3?v=20261023-1918',
    audioFa: './assets/audio/narration/uranus-fa.mp3?v=20261023-1918',
    planet: { color: 0x7ad9d9, radius: 1.1, tilt: 98 },
    sunPos: [-25, 8, -15],
    cameraPath: [{ p: 0, r: 11, y: 3 }, { p: 1, r: 6, y: 2 }],
    drift: 0.18,
    chunksEn: [
      'Uranus.',
      'The tilted world.',
      'It rolls on its side, 98 degrees off.',
      'A methane sky, the coldest atmosphere in the Solar System.'
    ],
    chunksFa: [
      'اورانوس.',
      'جهانِ کج.',
      'روی پهلوش می‌غلته، ۹۸ درجه کج.',
      'آسمونی از متان، سردترین جو منظومه‌ی شمسی.'
    ]
  },
  {
    n: 9, title: 'Neptune', duration: 13, built: true,
    audioEn: './assets/audio/narration/neptune-en.mp3?v=20261023-1904',
    audioFa: './assets/audio/narration/neptune-fa.mp3?v=20261023-1904',
    planet: { color: 0x3d5cd9, radius: 1.3 },
    sunPos: [-25, 8, -15],
    cameraPath: [{ p: 0, r: 12, y: 4 }, { p: 1, r: 6, y: 2 }],
    drift: 0.12,
    chunksEn: [
      'Neptune. The farthest planet.',
      'Winds of 2,100 kilometers per hour.',
      'A world of deep blue and raging storms.'
    ],
    chunksFa: [
      'نپتون. دورترین سیاره.',
      'بادهایی با سرعت ۲۱۰۰ کیلومتر بر ساعت.',
      'جهانی از آبی عمیق و طوفان‌های خروشان.'
    ]
  },
  {
    n: 10, title: 'Pluto', duration: 15, built: true,
    audioEn: './assets/audio/narration/pluto-en.mp3?v=20261023-1918',
    audioFa: './assets/audio/narration/pluto-fa.mp3?v=20261023-1918',
    planet: { color: 0xc8b8a8, radius: 0.35 },
    sunPos: [-25, 8, -15],
    cameraPath: [{ p: 0, r: 7, y: 2 }, { p: 1, r: 3.5, y: 1 }],
    drift: 0.15,
    chunksEn: [
      'Pluto.',
      'The dwarf planet.',
      'Demoted in 2006, but still here.',
      'A heart-shaped glacier, five moons, and 248 years per orbit.',
      'Smaller than our own Moon.'
    ],
    chunksFa: [
      'پلوتو.',
      'سیاره‌ی کوتوله.',
      'در سال ۲۰۰۶ از سیاره‌ها حذف شد، اما هنوز اینجاست.',
      'یخچالی به شکل قلب، پنج قمر، و ۲۴۸ سال برای یک دور مدار.',
      'از ماه خودمون کوچیک‌تره.'
    ]
  }
];
