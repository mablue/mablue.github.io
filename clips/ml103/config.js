export const clip = {
  name: 'ML 103',
  backUrl: 'index.html',
  backText: '← back',
  defaultLang: 'az',
  ui: [
    { id: 'ml-loss-hud', html: '<div class="ml-label">LOSS (MSE)</div><div class="ml-val">0.00</div><div class="ml-sub" id="ml-loss-sub">kiçik = yaxşı</div>' },
    { id: 'ml-params-hud', html: '<div class="row"><span class="k">params</span><span class="v">25</span></div><div class="row"><span class="k">layers</span><span class="v">1 → 8 → 1</span></div>' },
    { id: 'ml-progress', html: '<div class="bar"><div></div></div><span class="t">step 0 / 1000</span>' },
    { id: 'ml-loss-chart', html: '<canvas></canvas>' },
    { id: 'ml-code', html: '<pre style="margin:0; white-space:pre;"></pre>' }
  ]
};

export const chapters = [
  { n: 1, title: 'Too Hard', duration: 14, built: true,
    audio: {
      az: './clips/ml103/audio/az/1-hard.mp3?v=20261026-222850',
      fa: './clips/ml103/audio/fa/1-hard.mp3?v=20261026-222850',
      en: './clips/ml103/audio/en/1-hard.mp3?v=20261026-222850',
    },
    chunks: {
      az: ['Bu nöqtələr sinus dalğasıdır.', 'Nə düz xətt, nə də əyri — heç biri uyğun gəlmir.', 'Daha çox giriş lazımdır. Amma hansı?'],
      fa: ['این نقطه‌ها یه موج سینوسیان.', 'نه خط راست، نه سهمی — هیچ‌کدوم جور نمی‌شه.', 'ورودی بیشتری لازمه. اما کدوم؟'],
      en: ['These points form a sine wave.', 'Not a straight line, not a parabola — nothing fits.', 'We need more inputs. But which?'],
    }
  },
  { n: 2, title: 'Hidden Layer', duration: 16, built: true,
    audio: {
      az: './clips/ml103/audio/az/2-hidden.mp3?v=20261026-222850',
      fa: './clips/ml103/audio/fa/2-hidden.mp3?v=20261026-222850',
      en: './clips/ml103/audio/en/2-hidden.mp3?v=20261026-222850',
    },
    chunks: {
      az: ['Gizli qat əlavə edək.', 'Səkkiz neyron. Hər biri öz xüsusiyyətini kəşf edir.', 'Biri yamac, biri zirvə, biri çuxur.', 'Xüsusiyyətləri əl ilə yazmırıq — şəbəkə özü tapır.'],
      fa: ['یه لایه‌ی مخفی اضافه کنیم.', 'هشت نورون. هر کدوم یه فیچر کشف می‌کنه.', 'یکی شیب، یکی قله، یکی دره.', 'فیچرها رو دستی نمی‌نویسیم — شبکه خودش پیدا می‌کنه.'],
      en: ['Add a hidden layer.', 'Eight neurons. Each discovers its own feature.', 'One slope, one peak, one valley.', 'We do not write features by hand — the network finds them.'],
    }
  },
  { n: 3, title: 'ReLU', duration: 14, built: true,
    audio: {
      az: './clips/ml103/audio/az/3-relu.mp3?v=20261026-222850',
      fa: './clips/ml103/audio/fa/3-relu.mp3?v=20261026-222850',
      en: './clips/ml103/audio/en/3-relu.mp3?v=20261026-222850',
    },
    chunks: {
      az: ['Amma bir şey çatışmır.', 'İki xətti qat qatsaq, yenə xəttdir.', 'ReLU lazımdır. Mənfi sıfır olur, müsbət olduğu kimi qalır.', 'Bu kiçik qırılma şəbəkəyə əyri yaratmaq gücü verir.'],
      fa: ['ولی یه چیزی جا افتاده.', 'اگه دو تا لایه‌ی خطی رو روی هم بذاریم، بازم خطیه.', 'رلو لازمه. منفی صفر می‌شه، مثبت همون‌طور می‌مونه.', 'این شکستگی کوچیک به شبکه قدرت ساختن منحنی می‌ده.'],
      en: ['But something is missing.', 'Stack two linear layers, you still get a line.', 'We need ReLU. Negative becomes zero, positive stays.', 'This small break gives the network the power to bend.'],
    }
  },
  { n: 4, title: 'Training', duration: 18, built: true,
    audio: {
      az: './clips/ml103/audio/az/4-training.mp3?v=20261026-222850',
      fa: './clips/ml103/audio/fa/4-training.mp3?v=20261026-222850',
      en: './clips/ml103/audio/en/4-training.mp3?v=20261026-222850',
    },
    chunks: {
      az: ['Eyni dövrə.', 'Xəta geriyə axır.', 'Səkkiz neyron birlikdə işləyir.', 'Dalğa tədricən formalaşır.', 'Min addım.'],
      fa: ['همون حلقه.', 'خطا به عقب جریان داره.', 'هشت نورون با هم کار می‌کنن.', 'موج کم‌کم شکل می‌گیره.', 'هزار قدم.'],
      en: ['Same loop.', 'Error flows backward.', 'Eight neurons working together.', 'The wave slowly takes shape.', 'A thousand steps.'],
    }
  },
  { n: 5, title: 'Code', duration: 42, built: true,
    audio: {
      az: './clips/ml103/audio/az/5-walkthrough.mp3?v=20261026-222850',
      fa: './clips/ml103/audio/fa/5-walkthrough.mp3?v=20261026-222850',
      en: './clips/ml103/audio/en/5-walkthrough.mp3?v=20261026-222850',
    },
    chunks: {
      az: [
        'Bu dəfə data sinus dalğasıdır. X və Y. Qırx nöqtə.',
        'Şəbəkə üç qatdan ibarətdir: giriş, gizli, çıxış. Səkkiz neyron.',
        'Ən əsas iki sətir: Linear və ReLU. Biri xətti, digəri qırıq. Bu qırıq şəbəkəyə əyilmə gücü verir.',
        'Adam — SGD-dən daha ağıllı optimizator.',
        'Min dövrə. Hər dəfə irəli keçid: model X-i alır.',
        'Geri: xəta, gradient, yeniləmə.',
        'Son nəticə — loss.',
        'Yeni nöqtələrdə proqnoz.'
      ],
      fa: [
        'این بار داده، موج سینوسیه. ایکس و وای. چهل نقطه.',
        'شبکه از سه لایه ساخته شده: ورودی، مخفی، خروجی. هشت نورون.',
        'دو خط کلیدی: لینیر و رلو. یکی خطی، یکی شکسته. این شکستگی به شبکه قدرت خم شدن می‌ده.',
        'آدام — یه بهینه‌ساز هوشمندتر از اس‌جی‌دی.',
        'هزار دور. هر بار پاس رو به جلو: مدل ایکس رو می‌گیره.',
        'به عقب: خطا، گرادیان، آپدیت.',
        'نتیجه‌ی نهایی — لاس.',
        'پیش‌بینی روی نقطه‌های جدید.'
      ],
      en: [
        'This time the data is a sine wave. X and Y. Forty points.',
        'The network has three layers: input, hidden, output. Eight neurons.',
        'The two key lines: Linear and ReLU. One linear, one broken. This break gives the network the power to bend.',
        'Adam — a smarter optimizer than SGD.',
        'A thousand steps. Each time forward: model takes X.',
        'Backward: error, gradient, update.',
        'The final result — the loss.',
        'Predict on new points.'
      ],
    },
    code: {
      lines: [
        '<span class="com"># 1. Data</span>',
        '<span class="kw">import</span> torch, torch.nn <span class="kw">as</span> nn',
        'x = torch.linspace(<span class="num">-3</span>, <span class="num">3</span>, <span class="num">40</span>).unsqueeze(<span class="num">1</span>)',
        'y = <span class="num">2</span> * torch.sin(<span class="num">1.5</span> * x) + <span class="num">0.1</span> * torch.randn(<span class="num">40</span>, <span class="num">1</span>)',
        '',
        '<span class="com"># 2. Network — 1 → 8 → 1</span>',
        'model = nn.Sequential(',
        '    nn.Linear(<span class="num">1</span>, <span class="num">8</span>),    <span class="com"># hidden layer</span>',
        '    nn.ReLU(),           <span class="com"># non-linearity</span>',
        '    nn.Linear(<span class="num">8</span>, <span class="num">1</span>),    <span class="com"># output</span>',
        ')',
        '',
        '<span class="com"># 3. Optimizer</span>',
        'opt = torch.optim.Adam(model.parameters(), lr=<span class="num">0.02</span>)',
        '',
        '<span class="com"># 4. Same loop</span>',
        '<span class="kw">for</span> step <span class="kw">in</span> <span class="fn">range</span>(<span class="num">1000</span>):',
        '    y_pred = model(x)',
        '    loss = ((y_pred - y) ** <span class="num">2</span>).mean()',
        '    opt.zero_grad()',
        '    loss.backward()',
        '    opt.step()',
        '',
        '<span class="com"># 5. Result</span>',
        '<span class="fn">print</span>(<span class="str">f"final loss: {loss.item():.4f}"</span>)',
        '',
        '<span class="com"># 6. Predict on new points</span>',
        'x_new = torch.linspace(<span class="num">-3</span>, <span class="num">3</span>, <span class="num">10</span>).unsqueeze(<span class="num">1</span>)',
        '<span class="fn">print</span>(model(x_new).squeeze())'
      ],
      highlights: [
        [0, 3],
        [5, 10],
        [7, 8],
        [12, 13],
        [15, 17],
        [18, 21],
        [23, 24],
        [26, 28]
      ]
    }
  }
];
