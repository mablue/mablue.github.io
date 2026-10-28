export const clip = {
  "name": "ML 101",
  "backUrl": "index.html",
  "backText": "← back",
  "defaultLang": "az",
  "nextClip": "ml102.html",
  "nextClipLabel": "Continue to ML 102 →",
  "ui": [
    {
      "id": "ml-loss-hud",
      "html": "<div class=\"ml-label\">LOSS (MSE)</div><div class=\"ml-val\">0.00</div><div class=\"ml-sub\" id=\"ml-loss-sub\">kiçik = yaxşı</div>"
    },
    {
      "id": "ml-params-hud",
      "html": "<div class=\"row\"><span class=\"k\">w</span><span class=\"v\" data-k=\"w\">—</span></div><div class=\"row\"><span class=\"k\">b</span><span class=\"v\" data-k=\"b\">—</span></div>"
    },
    {
      "id": "ml-progress",
      "html": "<div class=\"bar\"><div></div></div><span class=\"t\">step 0 / 200</span>"
    },
    {
      "id": "ml-loss-chart",
      "html": "<canvas></canvas>"
    },
    {
      "id": "ml-code",
      "html": "<pre style=\"margin:0; white-space:pre;\"></pre>"
    }
  ]
};

export const chapters = [
  {
    "n": 1,
    "title": "Dondurma",
    "duration": 44.3,
    "built": true,
    "audio": {
      "az": [
        "./clips/ml101/audio-chunks/az/ch1/00.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/az/ch1/01.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/az/ch1/02.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/az/ch1/03.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/az/ch1/04.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/az/ch1/05.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/az/ch1/06.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/az/ch1/07.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/az/ch1/08.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/az/ch1/09.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/az/ch1/10.mp3?v=20261028-192658"
      ],
      "fa": [
        "./clips/ml101/audio-chunks/fa/ch1/00.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/fa/ch1/01.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/fa/ch1/02.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/fa/ch1/03.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/fa/ch1/04.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/fa/ch1/05.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/fa/ch1/06.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/fa/ch1/07.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/fa/ch1/08.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/fa/ch1/09.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/fa/ch1/10.mp3?v=20261028-192658"
      ],
      "en": [
        "./clips/ml101/audio-chunks/en/ch1/00.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/en/ch1/01.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/en/ch1/02.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/en/ch1/03.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/en/ch1/04.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/en/ch1/05.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/en/ch1/06.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/en/ch1/07.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/en/ch1/08.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/en/ch1/09.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/en/ch1/10.mp3?v=20261028-192658"
      ]
    },
    "chunks": {
      "az": [
        "Yaxşı, gəl elə bir şeylə başlayaq ki, sən artıq bilirsən.",
        "Təsəvvür et ki, balaca dondurma mağazan var.",
        "Hər gün iki rəqəm yazırsan.",
        "Hava nə qədər isti idi — buna deyək X.",
        "Və nə qədər dondurma satdın — buna deyək Y.",
        "Bir aydan sonra otuz cüt rəqəmin olur.",
        "Hər cüt burada bir nöqtədir.",
        "Yəni bir nöqtə — mağazanın bir günü.",
        "Özün görürsən, elə deyil? Hava istiləşdikcə daha çox satırsan.",
        "Amma sual budur — maşın bu nümunəni tapa bilərmi?",
        "Və sonra sabahkı satışı proqnozlaşdıra?"
      ],
      "fa": [
        "خب، بذار با یه چیزی شروع کنیم که تو از قبل می‌شناسی.",
        "تصور کن یه بستنی‌فروشی کوچیک داری.",
        "هر روز دو تا عدد می‌نویسی.",
        "هوا چقدر گرم بود — اسمش رو بذاریم ایکس.",
        "و چند تا بستنی فروختی — اسمش رو بذاریم وای.",
        "بعد از یه ماه، سی جفت عدد داری.",
        "هر جفت، یه نقطه اینجاست.",
        "یعنی یه نقطه — یه روز از مغازه‌ات.",
        "خودت می‌بینی، نه؟ هرچی هوا گرم‌تر، بیشتر می‌فروشی.",
        "اما سؤال اینه — ماشین می‌تونه این الگو رو پیدا کنه؟",
        "و بعد فروش فردا رو پیش‌بینی کنه؟"
      ],
      "en": [
        "Alright, let us start with something you already know.",
        "Imagine you run a small ice cream shop.",
        "Every day you write down two numbers.",
        "How hot it was outside — call this X.",
        "And how many ice creams you sold — call this Y.",
        "After a month, you have thirty pairs of numbers.",
        "Each pair is one dot here.",
        "So a dot is one day of your shop.",
        "You can see the pattern yourself, right? Hotter it was, more you sold.",
        "But the question is — can a machine find this pattern?",
        "And then predict tomorrow?"
      ]
    },
    "chunkDurations": {
      "az": [
        4.8,
        4.008,
        2.976,
        3.744,
        4.032,
        3.624,
        2.976,
        3.552,
        6.36,
        4.368,
        3.816
      ],
      "fa": [
        4.32,
        3.552,
        2.904,
        3.984,
        4.08,
        3.312,
        3,
        3.384,
        5.88,
        4.296,
        3.241
      ],
      "en": [
        4.056,
        3.576,
        3.264,
        3.792,
        4.272,
        3.984,
        2.856,
        3.264,
        6.432,
        4.152,
        2.496
      ]
    }
  },
  {
    "n": 2,
    "title": "İki ədəd",
    "duration": 56.5,
    "built": true,
    "audio": {
      "az": [
        "./clips/ml101/audio-chunks/az/ch2/00.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/az/ch2/01.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/az/ch2/02.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/az/ch2/03.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/az/ch2/04.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/az/ch2/05.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/az/ch2/06.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/az/ch2/07.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/az/ch2/08.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/az/ch2/09.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/az/ch2/10.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/az/ch2/11.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/az/ch2/12.mp3?v=20261028-192658"
      ],
      "fa": [
        "./clips/ml101/audio-chunks/fa/ch2/00.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/fa/ch2/01.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/fa/ch2/02.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/fa/ch2/03.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/fa/ch2/04.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/fa/ch2/05.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/fa/ch2/06.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/fa/ch2/07.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/fa/ch2/08.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/fa/ch2/09.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/fa/ch2/10.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/fa/ch2/11.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/fa/ch2/12.mp3?v=20261028-192658"
      ],
      "en": [
        "./clips/ml101/audio-chunks/en/ch2/00.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/en/ch2/01.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/en/ch2/02.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/en/ch2/03.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/en/ch2/04.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/en/ch2/05.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/en/ch2/06.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/en/ch2/07.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/en/ch2/08.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/en/ch2/09.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/en/ch2/10.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/en/ch2/11.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/en/ch2/12.mp3?v=20261028-192658"
      ]
    },
    "chunks": {
      "az": [
        "İndi ən maraqlı hissə.",
        "Model sadəcə bir xəttdir.",
        "Amma hər hansı bir xətt deyil — ən yaxşı xətt.",
        "Bir xətti riyaziyyatla necə təsvir edirik?",
        "Y bərabərdir W vur X, üstəgəl B.",
        "Qoy bunu hissə-hissə izah edim.",
        "W — yamacdır. Xətt nə qədər dik qalxır.",
        "Dondurma mağazasında W — hər dərəcə üçün nə qədər dondurma.",
        "Məsələn, W bərabərdir iki — hər əlavə dərəcə üçün iki dondurma çox.",
        "B — xəttin başladığı yerdir. Başlanğıc nöqtəsi.",
        "Mağazamızda B — sıfır dərəcədə belə nə qədər dondurma satırsan.",
        "Yəni sadəcə iki rəqəm — W və B — bütün qayda buradadır.",
        "Amma hansı W, hansı B? Maşın bunu tapmalıdır."
      ],
      "fa": [
        "حالا بذار نکته‌ی جالب رو بگم.",
        "مدل فقط یه خطه.",
        "ولی نه هر خطی — بهترین خط.",
        "یه خط رو با ریاضی چطور توصیف می‌کنیم؟",
        "وای برابر دابلیو ضربدر ایکس، به‌علاوه بی.",
        "بذار تیکه‌تیکه توضیح بدم.",
        "دابلیو یعنی شیب. یعنی خط با چه تندی بالا می‌ره.",
        "توی بستنی‌فروشی، دابلیو یعنی — به ازای هر درجه، چند تا بستنی.",
        "مثلاً دابلیو برابر دو — یعنی هر درجه‌ی بیشتر، دو تا بستنی بیشتر.",
        "بی یعنی نقطه‌ی شروع خط.",
        "توی مغازه‌مون، بی یعنی — حتی وقتی صفر درجه‌ست، چند تا بستنی می‌فروشی.",
        "پس فقط دو عدد — دابلیو و بی — کل قانون همین.",
        "اما کدوم دابلیو، کدوم بی؟ این کاریه که ماشین باید انجام بده."
      ],
      "en": [
        "Now the fun part.",
        "A model is just a line.",
        "But not any line — the best line.",
        "How do we describe a line with math?",
        "Y equals W times X, plus B.",
        "Let me break this down.",
        "W is the slope. How steep the line goes up.",
        "In our ice cream shop, W means — how many ice creams per degree.",
        "For example, W equals two — two extra ice creams per extra degree.",
        "B is where the line starts. The starting point.",
        "In our shop, B means — how many ice creams you sell even at zero degrees.",
        "So just two numbers — W and B — and the entire rule is captured.",
        "But which W, which B? The machine has to figure that out."
      ]
    },
    "chunkDurations": {
      "az": [
        2.76,
        2.954,
        4.104,
        3.816,
        3.72,
        3.168,
        4.704,
        4.752,
        5.376,
        5.664,
        5.16,
        4.824,
        5.52
      ],
      "fa": [
        3,
        2.353,
        3.336,
        3.576,
        4.488,
        2.808,
        5.112,
        5.832,
        5.736,
        2.688,
        6.168,
        4.344,
        6.072
      ],
      "en": [
        2.304,
        2.616,
        3.336,
        3.072,
        4.152,
        2.472,
        5.184,
        5.64,
        6.336,
        5.018,
        5.832,
        5.64,
        5.952
      ]
    }
  },
  {
    "n": 3,
    "title": "Səhv",
    "duration": 54.9,
    "built": true,
    "audio": {
      "az": [
        "./clips/ml101/audio-chunks/az/ch3/00.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/az/ch3/01.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/az/ch3/02.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/az/ch3/03.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/az/ch3/04.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/az/ch3/05.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/az/ch3/06.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/az/ch3/07.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/az/ch3/08.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/az/ch3/09.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/az/ch3/10.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/az/ch3/11.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/az/ch3/12.mp3?v=20261028-192658"
      ],
      "fa": [
        "./clips/ml101/audio-chunks/fa/ch3/00.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/fa/ch3/01.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/fa/ch3/02.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/fa/ch3/03.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/fa/ch3/04.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/fa/ch3/05.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/fa/ch3/06.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/fa/ch3/07.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/fa/ch3/08.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/fa/ch3/09.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/fa/ch3/10.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/fa/ch3/11.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/fa/ch3/12.mp3?v=20261028-192658"
      ],
      "en": [
        "./clips/ml101/audio-chunks/en/ch3/00.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/en/ch3/01.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/en/ch3/02.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/en/ch3/03.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/en/ch3/04.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/en/ch3/05.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/en/ch3/06.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/en/ch3/07.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/en/ch3/08.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/en/ch3/09.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/en/ch3/10.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/en/ch3/11.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/en/ch3/12.mp3?v=20261028-192658"
      ]
    },
    "chunks": {
      "az": [
        "İndi maşın təsadüfi bir W və B təxmin etdi.",
        "Amma gözlə — maşın hələ düzgün cavabı bilmir.",
        "Ona görə təsadüfi bir W və təsadüfi B ilə başlayır.",
        "Təsadüfi xətt. Dəhşətli təxmin.",
        "İndi necə bilək ki, səhvdir?",
        "Hər nöqtə üçün yoxlayırıq: xəttdən nə qədər uzaqdır?",
        "O narıncı şaquli xətt — səhvdir.",
        "Bəziləri yaxındır, bəziləri uzaq.",
        "İndi bir rəqəm istəyirik ki, desin — bu xətt ümumiyyətlə nə qədər pisdir.",
        "Ona görə hər səhvi kvadrata yüksəldirik — hamısı müsbət olsun və böyüklər cəzalandırılsın.",
        "Sonra orta tapırıq.",
        "Bu rəqəmə LOSS deyilir. Az loss — yaxşı xətt.",
        "Bütün oyun budur: loss-u azaltmaq."
      ],
      "fa": [
        "حالا ماشین یه دابلیو و بی تصادفی حدس زده.",
        "ولی صبر کن — ماشین هنوز جواب درست رو نمی‌دونه.",
        "پس با یه دابلیو تصادفی و بی تصادفی شروع می‌کنه.",
        "خط تصادفی. حدس افتضاح.",
        "حالا چطور بفهمیم که غلطه؟",
        "برای هر نقطه چک می‌کنیم: از خط چقدر فاصله داره؟",
        "اون خط عمودی نارنجی — خطاست.",
        "بعضی نزدیک، بعضی دور.",
        "حالا یه عدد می‌خوایم که بگه — این خط کلاً چقدر بده.",
        "پس هر خطا رو به توان دو می‌رسونیم — همه مثبت بشن و بزرگ‌ترها بیشتر جریمه بشن.",
        "بعد میانگین می‌گیریم.",
        "این عدد اسمش لاسه. لاس کم — خط خوب.",
        "کل بازی اینه: کم کردن لاس."
      ],
      "en": [
        "Now the machine has guessed a random W and a random B.",
        "But wait — the machine doesn't know the answer yet.",
        "So it starts with a random W and a random B.",
        "Random line. Terrible guess.",
        "How do we know it's wrong?",
        "For each dot, we check: how far is it from the line?",
        "That orange vertical line — that's the error.",
        "Some are close, some are far.",
        "Now we want one number that says — how bad is this line overall.",
        "So we square each error — to make them all positive, and punish the big ones.",
        "Then we average them.",
        "This number is called LOSS. Small loss — good line.",
        "The whole game is: reduce loss."
      ]
    },
    "chunkDurations": {
      "az": [
        3.984,
        4.152,
        4.417,
        4.512,
        3.024,
        4.44,
        3.384,
        3.456,
        5.448,
        6.648,
        2.544,
        5.352,
        3.504
      ],
      "fa": [
        3.984,
        4.008,
        4.368,
        4.272,
        2.808,
        4.512,
        3.576,
        2.904,
        4.152,
        6.936,
        2.448,
        4.728,
        3.408
      ],
      "en": [
        4.608,
        4.056,
        4.296,
        4.129,
        2.4,
        4.272,
        3.72,
        3,
        5.04,
        5.906,
        2.328,
        5.448,
        3.216
      ]
    }
  },
  {
    "n": 4,
    "title": "Addım",
    "duration": 66.6,
    "built": true,
    "audio": {
      "az": [
        "./clips/ml101/audio-chunks/az/ch4/00.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/az/ch4/01.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/az/ch4/02.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/az/ch4/03.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/az/ch4/04.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/az/ch4/05.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/az/ch4/06.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/az/ch4/07.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/az/ch4/08.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/az/ch4/09.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/az/ch4/10.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/az/ch4/11.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/az/ch4/12.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/az/ch4/13.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/az/ch4/14.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/az/ch4/15.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/az/ch4/16.mp3?v=20261028-192658"
      ],
      "fa": [
        "./clips/ml101/audio-chunks/fa/ch4/00.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/fa/ch4/01.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/fa/ch4/02.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/fa/ch4/03.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/fa/ch4/04.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/fa/ch4/05.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/fa/ch4/06.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/fa/ch4/07.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/fa/ch4/08.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/fa/ch4/09.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/fa/ch4/10.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/fa/ch4/11.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/fa/ch4/12.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/fa/ch4/13.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/fa/ch4/14.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/fa/ch4/15.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/fa/ch4/16.mp3?v=20261028-192658"
      ],
      "en": [
        "./clips/ml101/audio-chunks/en/ch4/00.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/en/ch4/01.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/en/ch4/02.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/en/ch4/03.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/en/ch4/04.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/en/ch4/05.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/en/ch4/06.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/en/ch4/07.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/en/ch4/08.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/en/ch4/09.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/en/ch4/10.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/en/ch4/11.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/en/ch4/12.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/en/ch4/13.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/en/ch4/14.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/en/ch4/15.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/en/ch4/16.mp3?v=20261028-192658"
      ]
    },
    "chunks": {
      "az": [
        "Budur hiylə.",
        "Biz bilmirik W-ı hansı tərəfə dəyişək ki, loss azalsın.",
        "Amma riyaziyyat bizə istiqamət verir.",
        "Təsəvvür et ki, dumanlı havada bir təpədə durmusan.",
        "Dibi görmürsən, amma ayağının altındakı torpağı hiss edirsən.",
        "Hiss edirsən ki, sağa doğru əyilib.",
        "Ona görə bir addım sağa atırsan.",
        "İndi daha aşağıdasan. Yenə hiss et.",
        "Hələ də aşağı əyilir. Bir addım da at.",
        "Bu, tam maşının etdiyidir.",
        "Yoxlayır: W yuxarı getməlidir, yoxsa aşağı?",
        "Kiçik bir addım atır.",
        "Yenə yoxlayır. Yenə addım.",
        "Yüzlərlə dəfə.",
        "Nəhayət, W və B düzgün qiymətlərə çatır.",
        "Bu metodun adı: gradient descent — yəni yamacla enmə.",
        "Və onu işə salan alət — optimizer. Kodda \"opt\" budur."
      ],
      "fa": [
        "حالا بذار ترفند رو بگم.",
        "ما نمی‌دونیم دابلیو رو به کدوم طرف تغییر بدیم که لاس کم بشه.",
        "ولی ریاضی یه جهت بهمون می‌ده.",
        "تصور کن توی مه غلیظ روی یه تپه ایستادی.",
        "پایین رو نمی‌بینی، ولی زمین زیر پات رو حس می‌کنی.",
        "حس می‌کنی که به راست شیب داره.",
        "پس یه قدم به راست می‌ری.",
        "حالا پایین‌تری. دوباره حس کن.",
        "بازم شیب داره. یه قدم دیگه.",
        "این دقیقاً کاری‌ه که ماشین می‌کنه.",
        "چک می‌کنه: دابلیو باید بره بالا یا پایین؟",
        "یه قدم کوچیک می‌ره.",
        "بازم چک می‌کنه. بازم قدم.",
        "صدها بار.",
        "آخرش، دابلیو و بی به مقدار درست می‌رسن.",
        "اسم این روش: گرادیان دسنت — یعنی پایین رفتن از شیب.",
        "و ابزاری که اجراش می‌کنه — optimizer. توی کد بهش می‌گیم «opt»."
      ],
      "en": [
        "Here's the trick.",
        "We don't know which way to change W to make loss smaller.",
        "But math gives us a direction.",
        "Imagine you're on a hill in thick fog.",
        "You can't see the bottom, but you can feel the ground under your feet.",
        "You feel it slopes down to the right.",
        "So you take a step to the right.",
        "Now you're lower. Feel again.",
        "Still slopes down. Take another step.",
        "That's exactly what the machine does.",
        "It checks: should W go up or down?",
        "Takes a small step.",
        "Checks again. Steps again.",
        "Hundreds of times.",
        "Eventually, W and B land on the right values.",
        "This method has a name: gradient descent — going down the slope.",
        "And the tool that runs it — optimizer. That's \"opt\" in the code."
      ]
    },
    "chunkDurations": {
      "az": [
        2.088,
        4.392,
        3.624,
        4.32,
        4.848,
        3.384,
        3.288,
        4.752,
        5.018,
        2.928,
        4.032,
        2.616,
        4.129,
        2.256,
        3.816,
        4.944,
        6.144
      ],
      "fa": [
        2.64,
        5.018,
        3.144,
        4.08,
        4.152,
        2.88,
        2.568,
        3.912,
        3.936,
        3.072,
        3.84,
        2.304,
        3.984,
        1.968,
        3.984,
        4.824,
        6.072
      ],
      "en": [
        2.04,
        4.344,
        2.904,
        3.288,
        4.728,
        3.144,
        2.88,
        3.96,
        4.56,
        3.192,
        3.696,
        2.376,
        3.936,
        2.304,
        4.464,
        5.232,
        5.712
      ]
    }
  },
  {
    "n": 5,
    "title": "Kod",
    "duration": 118.3,
    "built": true,
    "audio": {
      "az": [
        "./clips/ml101/audio-chunks/az/ch5/00.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/az/ch5/01.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/az/ch5/02.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/az/ch5/03.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/az/ch5/04.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/az/ch5/05.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/az/ch5/06.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/az/ch5/07.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/az/ch5/08.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/az/ch5/09.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/az/ch5/10.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/az/ch5/11.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/az/ch5/12.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/az/ch5/13.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/az/ch5/14.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/az/ch5/15.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/az/ch5/16.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/az/ch5/17.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/az/ch5/18.mp3?v=20261028-192658"
      ],
      "fa": [
        "./clips/ml101/audio-chunks/fa/ch5/00.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/fa/ch5/01.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/fa/ch5/02.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/fa/ch5/03.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/fa/ch5/04.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/fa/ch5/05.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/fa/ch5/06.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/fa/ch5/07.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/fa/ch5/08.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/fa/ch5/09.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/fa/ch5/10.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/fa/ch5/11.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/fa/ch5/12.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/fa/ch5/13.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/fa/ch5/14.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/fa/ch5/15.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/fa/ch5/16.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/fa/ch5/17.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/fa/ch5/18.mp3?v=20261028-192658"
      ],
      "en": [
        "./clips/ml101/audio-chunks/en/ch5/00.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/en/ch5/01.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/en/ch5/02.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/en/ch5/03.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/en/ch5/04.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/en/ch5/05.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/en/ch5/06.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/en/ch5/07.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/en/ch5/08.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/en/ch5/09.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/en/ch5/10.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/en/ch5/11.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/en/ch5/12.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/en/ch5/13.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/en/ch5/14.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/en/ch5/15.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/en/ch5/16.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/en/ch5/17.mp3?v=20261028-192658",
        "./clips/ml101/audio-chunks/en/ch5/18.mp3?v=20261028-192658"
      ]
    },
    "chunks": {
      "az": [
        "Gəl kodu sətir-sətir, söz-söz keçək.",
        "import torch — bu, PyTorch kitabxanasını faylına gətirir. Alət qutusu kimidir, açmayana qədər içindəkiləri işlədə bilməzsən.",
        "torch.linspace — bərabər aralıqda nöqtələr yaradır. Mənfi dörddən dördə qədər, iyirmi beş ədəd.",
        "torch.randn — təsadüfi səs-küy. Sıfır nöqtə səkkiz vuru onu kiçildir.",
        "w və b — modelin iki rəqəmi. torch.randn birdən başlayır — təsadüfi.",
        "requires_grad bərabər True — bu çox vacibdir. Maşına deyir: bu rəqəm öyrəniləcək.",
        "opt — optimizer. Rəqəmləri yeniləyən alət.",
        "SGD — Stochastic Gradient Descent. Təpədən enmə metodunun adı.",
        "Mötərizədə w və b — hansı rəqəmləri yeniləyəcək. lr — addımın ölçüsü.",
        "Böyük addım — sürətli amma riskli. Kiçik addım — yavaş amma təhlükəsiz.",
        "for dövrə — iyüz dəfə təkrarlayır.",
        "y_pred bərabər w vur x üstəgəl b — model proqnoz verir.",
        "loss — səhvi kvadrata yüksəlt, orta tap.",
        "zero_grad — köhnə gradientləri sil.",
        "backward — geriyə. Gradient tap. W hansı tərəfə?",
        "step — bir addım at. W və B yenilə.",
        "Bütün bunlar iyüz dəfə təkrarlanır.",
        "print — sonda nəticəni göstər. item — rəqəmi çıxar. .2f — iki onluq göstər.",
        "Budur. İlk modelin. W təxminən iki. B təxminən bir."
      ],
      "fa": [
        "بذار کد رو خط‌به‌خط و کلمه‌به‌کلمه با هم ببینیم.",
        "import torch — این، کتابخانه‌ی PyTorch رو می‌آره داخل فایلت. مثل جعبه‌ابزاره؛ تا بازش نکنی، نمی‌تونی از ابزارهاش استفاده کنی.",
        "torch.linspace — نقاط با فاصله‌ی مساوی می‌سازه. از منفی چهار تا چهار، بیست و پنج تا.",
        "torch.randn — نویز تصادفی. صفر نقطه هشت ضربدرش، کوچیکش می‌کنه.",
        "w و b — دو عدد مدل. torch.randn از یک شروع می‌کنه — تصادفی.",
        "requires_grad برابر True — این خیلی مهمه. به ماشین می‌گه: این عدد یاد گرفته می‌شه.",
        "opt — optimizer. ابزاری که اعداد رو آپدیت می‌کنه.",
        "SGD — Stochastic Gradient Descent. اسم روش پایین رفتن از تپه.",
        "داخل پرانتز w و b — کدوم اعداد آپدیت بشن. lr — اندازه‌ی قدم.",
        "قدم بزرگ — سریع ولی پرخطر. قدم کوچیک — کند ولی امن.",
        "for یعنی حلقه — دویست بار تکرار.",
        "y_pred برابر w ضربدر x به‌علاوه b — مدل پیش‌بینی می‌کنه.",
        "loss — خطا رو به توان دو برسون، میانگین بگیر.",
        "zero_grad — گرادیان‌های قدیمی رو پاک کن.",
        "backward — به عقب. گرادیان رو پیدا کن. دابلیو به کدوم طرف؟",
        "step — یه قدم بردار. دابلیو و بی رو آپدیت کن.",
        "همه‌ی اینا دویست بار تکرار می‌شن.",
        "print — آخرش نتیجه رو نشون بده. item — عدد رو دربیار. نقطه دو اف — دو رقم اعشار.",
        "همینه. اولین مدلت. دابلیو حدود دو. بی حدود یک."
      ],
      "en": [
        "Let's go through the code line by line, word by word.",
        "import torch — this brings the PyTorch library into your file. Like a toolbox; until you open it, you can't use the tools inside.",
        "torch.linspace — creates evenly spaced points. From minus four to four, twenty-five of them.",
        "torch.randn — random noise. Zero point eight times it makes the noise smaller.",
        "w and b — the two numbers of the model. torch.randn starts from one — random.",
        "requires_grad equals True — this is really important. It tells the machine: this number will be learned.",
        "opt — optimizer. The tool that updates the numbers.",
        "SGD — Stochastic Gradient Descent. The name of the downhill method.",
        "Inside brackets w and b — which numbers to update. lr — the step size.",
        "Big step — fast but risky. Small step — slow but safe.",
        "for loop — repeats two hundred times.",
        "y_pred equals w times x plus b — the model predicts.",
        "loss — square the error, take the average.",
        "zero_grad — clear the old gradients.",
        "backward — go backward. Find the gradient. Which way should W go?",
        "step — take one step. Update W and B.",
        "All of this repeats two hundred times.",
        "print — show the result at the end. item — extract the number. dot two f — two decimals.",
        "That's it. Your first model. W is about two. B is about one."
      ]
    },
    "code": {
      "lines": [
        "<span class=\"com\"># 1. Data</span>",
        "<span class=\"kw\">import</span> <span class=\"tok\" data-tok=\"torch\">torch</span>",
        "x = <span class=\"tok\" data-tok=\"linspace\">torch.linspace</span>(<span class=\"num\">-4</span>, <span class=\"num\">4</span>, <span class=\"num\">25</span>)",
        "y = <span class=\"num\">2</span> * x + <span class=\"num\">1</span> + <span class=\"num\">0.8</span> * <span class=\"tok\" data-tok=\"randn\">torch.randn</span>(<span class=\"num\">25</span>)",
        "",
        "<span class=\"com\"># 2. Model — just two numbers</span>",
        "w = <span class=\"tok\" data-tok=\"randn\">torch.randn</span>(<span class=\"num\">1</span>, <span class=\"tok\" data-tok=\"grad\">requires_grad=<span class=\"kw\">True</span></span>)",
        "b = <span class=\"tok\" data-tok=\"randn\">torch.randn</span>(<span class=\"num\">1</span>, <span class=\"tok\" data-tok=\"grad\">requires_grad=<span class=\"kw\">True</span></span>)",
        "",
        "<span class=\"com\"># 3. Optimizer</span>",
        "<span class=\"tok\" data-tok=\"opt\">opt</span> = torch.optim.<span class=\"tok\" data-tok=\"sgd\">SGD</span>([<span class=\"tok\" data-tok=\"params\">w, b</span>], <span class=\"tok\" data-tok=\"lr\">lr=<span class=\"num\">0.05</span></span>)",
        "",
        "<span class=\"com\"># 4. Train</span>",
        "<span class=\"kw\">for</span> step <span class=\"kw\">in</span> <span class=\"tok\" data-tok=\"range\">range</span>(<span class=\"num\">200</span>):",
        "    y_pred = w * x + b",
        "    <span class=\"tok\" data-tok=\"loss\">loss</span> = ((y_pred - y) ** <span class=\"num\">2</span>).mean()",
        "    <span class=\"tok\" data-tok=\"zero\">opt.zero_grad()</span>",
        "    <span class=\"tok\" data-tok=\"backward\">loss.backward()</span>",
        "    <span class=\"tok\" data-tok=\"step\">opt.step()</span>",
        "",
        "<span class=\"com\"># 5. Result</span>",
        "<span class=\"tok\" data-tok=\"print\">print</span>(<span class=\"str\">f\"w={w.<span class=\"tok\" data-tok=\"item\">item</span>():.2f}, b={b.item():.2f}\"</span>)"
      ],
      "highlights": [
        null,
        {
          "line": 1,
          "tokens": [
            "torch"
          ]
        },
        {
          "line": 2,
          "tokens": [
            "linspace"
          ]
        },
        {
          "line": 3,
          "tokens": [
            "randn"
          ]
        },
        {
          "line": 6
        },
        {
          "line": 6,
          "tokens": [
            "grad"
          ]
        },
        {
          "line": 10,
          "tokens": [
            "opt"
          ]
        },
        {
          "line": 10,
          "tokens": [
            "sgd"
          ]
        },
        {
          "line": 10,
          "tokens": [
            "params"
          ]
        },
        {
          "line": 10,
          "tokens": [
            "lr"
          ]
        },
        {
          "line": 13,
          "tokens": [
            "range"
          ]
        },
        {
          "line": 14
        },
        {
          "line": 15,
          "tokens": [
            "loss"
          ]
        },
        {
          "line": 16,
          "tokens": [
            "zero"
          ]
        },
        {
          "line": 17,
          "tokens": [
            "backward"
          ]
        },
        {
          "line": 18,
          "tokens": [
            "step"
          ]
        },
        {
          "line": 13
        },
        {
          "line": 21,
          "tokens": [
            "print",
            "item"
          ]
        },
        {
          "line": 21
        }
      ]
    },
    "chunkDurations": {
      "az": [
        3.72,
        9.96,
        8.64,
        6.912,
        7.032,
        7.704,
        5.305,
        6.984,
        7.081,
        7.128,
        3.504,
        4.848,
        4.008,
        3.552,
        6.696,
        4.896,
        3.456,
        8.712,
        8.184
      ],
      "fa": [
        4.272,
        10.512,
        8.16,
        7.728,
        6.816,
        7.224,
        5.28,
        5.976,
        6.552,
        6.168,
        3.36,
        4.704,
        4.368,
        3.84,
        7.128,
        5.16,
        3.192,
        8.952,
        7.872
      ],
      "en": [
        4.272,
        10.488,
        8.424,
        7.32,
        7.392,
        8.952,
        5.376,
        6.504,
        7.44,
        6.193,
        3.529,
        6.048,
        3.864,
        4.392,
        7.512,
        5.448,
        3.408,
        9,
        8.472
      ]
    }
  }
];
