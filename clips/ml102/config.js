export const clip = {
  name: 'ML 102',
  backUrl: 'index.html',
  backText: '← back',
  nextClip: 'ml103.html',
  nextClipLabel: 'Continue to ML 103 →',
  defaultLang: 'az',
  ui: [
    { id: 'ml-loss-hud', html: '<div class="ml-label">LOSS (MSE)</div><div class="ml-val">0.00</div><div class="ml-sub" id="ml-loss-sub">kiçik = yaxşı</div>' },
    { id: 'ml-params-hud', html: '<div class="row"><span class="k">w₁</span><span class="v" data-k="w1">—</span></div><div class="row"><span class="k">w₂</span><span class="v" data-k="w2">—</span></div><div class="row"><span class="k">b</span><span class="v" data-k="b">—</span></div>' },
    { id: 'ml-progress', html: '<div class="bar"><div></div></div><span class="t">step 0 / 400</span>' },
    { id: 'ml-loss-chart', html: '<canvas></canvas>' },
    { id: 'ml-code', html: '<pre style="margin:0; white-space:pre;"></pre>' }
  ]
};

export const chapters = [
  { n: 1, title: 'Curve', duration: 14, built: true,
    audio: {
      az: './clips/ml102/audio/az/1-curve.mp3?v=20261028-183005',
      fa: './clips/ml102/audio/fa/1-curve.mp3?v=20261028-183005',
      en: './clips/ml102/audio/en/1-curve.mp3?v=20261028-183005',
    },
    chunks: {
      az: ['Bu nöqtələr düz xətt deyil.', 'Bir əyridir.', 'Düz xətt heç vaxt uyğun gəlməyəcək.'],
      fa: ['این نقطه‌ها روی خط راست نیستن.', 'یه منحنی‌ان.', 'خط راست هیچ‌وقت جور نمی‌شه.'],
      en: ['These points are not on a straight line.', 'They form a curve.', 'A straight line will never fit.'],
    }
  },
  { n: 2, title: 'Add x²', duration: 16, built: true,
    audio: {
      az: './clips/ml102/audio/az/2-add-x2.mp3?v=20261028-183005',
      fa: './clips/ml102/audio/fa/2-add-x2.mp3?v=20261028-183005',
      en: './clips/ml102/audio/en/2-add-x2.mp3?v=20261028-183005',
    },
    chunks: {
      az: ['Modelə ikinci bir giriş verək: x kvadratı.', 'İndi iki giriş var — x və x².', 'İki çəki. İki yamac.', 'Və düz xətt əyriyə çevrilir.'],
      fa: ['یه ورودی دوم به مدل بدیم: مربع x.', 'حالا دو ورودی داریم — x و x².', 'دو وزن. دو شیب.', 'و خط راست تبدیل به منحنی می‌شه.'],
      en: ['Give the model a second input: x squared.', 'Now two inputs — x and x².', 'Two weights. Two slopes.', 'And the straight line bends into a curve.'],
    }
  },
  { n: 3, title: 'Model', duration: 12, built: true,
    audio: {
      az: './clips/ml102/audio/az/3-model.mp3?v=20261028-183005',
      fa: './clips/ml102/audio/fa/3-model.mp3?v=20261028-183005',
      en: './clips/ml102/audio/en/3-model.mp3?v=20261028-183005',
    },
    chunks: {
      az: ['Y bərabərdir W₁ vur X, üstəgəl W₂ vur X kvadrat, üstəgəl B.', 'Üç ədəd. Hamısı budur.'],
      fa: ['Y برابر W₁ ضربدر X، به‌لاوه W₂ ضربدر X²، به‌لاوه B.', 'سه عدد. همین.'],
      en: ['Y equals W₁ times X, plus W₂ times X², plus B.', 'Three numbers. That is all.'],
    }
  },
  { n: 4, title: 'Training', duration: 18, built: true,
    audio: {
      az: './clips/ml102/audio/az/4-training.mp3?v=20261028-183005',
      fa: './clips/ml102/audio/fa/4-training.mp3?v=20261028-183005',
      en: './clips/ml102/audio/en/4-training.mp3?v=20261028-183005',
    },
    chunks: {
      az: ['Eyni dövrə.', 'Xəta geriyə axır.', 'Hər üç çəki yenilənir.', 'Əyri yerinə oturur.', 'Dörd yüz addım.'],
      fa: ['همون حلقه.', 'خطا به عقب جریان داره.', 'هر سه وزن آپدیت می‌شن.', 'منحنی سر جاش می‌شینه.', 'چهارصد قدم.'],
      en: ['Same loop.', 'Error flows backward.', 'All three weights update.', 'The curve settles into place.', 'Four hundred steps.'],
    }
  },
  { n: 5, title: 'Code', duration: 42, built: true,
    audio: {
      az: './clips/ml102/audio/az/5-walkthrough.mp3?v=20261028-183005',
      fa: './clips/ml102/audio/fa/5-walkthrough.mp3?v=20261028-183005',
      en: './clips/ml102/audio/en/5-walkthrough.mp3?v=20261028-183005',
    },
    chunks: {
      az: [
        'Bu dəfə data əyridir. X və Y. Otuz nöqtə.',
        'Bu əsas hiylədir: X-in kvadratını ikinci giriş kimi əlavə edirik.',
        'Model iki giriş alır, bir çıxış verir. Linear ilə.',
        'Eyni SGD, dörd yüz dövrə.',
        'Hər dəfə: model X-i alır. Artıq iki sütun — X və X kvadratı.',
        'Loss, qradient, yeniləmə. Hər üç çəki dəyişir.',
        'Öyrədilmiş çəkilərə baxaq: W1 sıfıra, W2 yarım, B mənfi ikiyə yaxın.',
        'Yeni nöqtələrdə proqnoz verək.'
      ],
      fa: [
        'این بار داده، منحنيه. X و Y. سی نقطه.',
        'کلید ماجرا اینجاست: مربع X رو به عنوان ورودی دوم اضافه می‌کنیم.',
        'مدل دو ورودی می‌گیره، یه خروجی می‌ده. با Linear.',
        'همون SGD، چهارصد دور.',
        'هر بار: مدل X رو می‌گیره. دیگه دو ستونه — X و مربع X.',
        'لاس، گرادیان، آپدیت. هر سه وزن تغییر می‌کنن.',
        'به وزن‌های آموزش‌دیده نگاه کنیم: W1 نزدیک صفر، W2 نزدیک نیم، B نزدیک منفی دو.',
        'روی نقطه‌های جدید پیش‌بینی می‌کنیم.'
      ],
      en: [
        'This time the data is a curve. X and Y. Thirty points.',
        'The key trick: add x squared as a second input.',
        'The model takes two inputs, gives one output. With Linear.',
        'Same SGD, four hundred steps.',
        'Each step: model takes X. Now two columns — X and x squared.',
        'Loss, gradient, update. All three weights change.',
        'Look at the trained weights: W1 close to zero, W2 close to half, B close to minus two.',
        'Predict on new points.'
      ]
    },
    code: {
      lines: [
        '<span class="com"># 1. Data</span>',
        '<span class="kw">import</span> torch, torch.nn <span class="kw">as</span> nn',
        'x = torch.linspace(<span class="num">-3</span>, <span class="num">3</span>, <span class="num">30</span>)',
        'y = <span class="num">0.5</span> * x**<span class="num">2</span> - <span class="num">2</span> + <span class="num">0.3</span> * torch.randn(<span class="num">30</span>)',
        '',
        '<span class="com"># 2. Two features: x and x squared</span>',
        'X = torch.stack([x, x**<span class="num">2</span>], dim=<span class="num">1</span>)',
        '',
        '<span class="com"># 3. Model: 2 inputs, 1 output</span>',
        'model = nn.Linear(<span class="num">2</span>, <span class="num">1</span>)',
        '',
        '<span class="com"># 4. Same training loop</span>',
        'opt = torch.optim.SGD(model.parameters(), lr=<span class="num">0.02</span>)',
        '<span class="kw">for</span> step <span class="kw">in</span> <span class="fn">range</span>(<span class="num">400</span>):',
        '    y_pred = model(X).squeeze()',
        '    loss = ((y_pred - y)**<span class="num">2</span>).mean()',
        '    opt.zero_grad()',
        '    loss.backward()',
        '    opt.step()',
        '',
        '<span class="com"># 5. Inspect the trained weights</span>',
        'w1, w2 = model.weight[<span class="num">0</span>].tolist()',
        'b = model.bias.item()',
        '<span class="fn">print</span>(<span class="str">f"w1={w1:.2f}, w2={w2:.2f}, b={b:.2f}"</span>)',
        '<span class="com"># → w1=0.00, w2=0.50, b=-2.00</span>',
        '',
        '<span class="com"># 6. Predict on new points</span>',
        'x_new = torch.linspace(<span class="num">-3</span>, <span class="num">3</span>, <span class="num">5</span>)',
        'X_new = torch.stack([x_new, x_new**<span class="num">2</span>], dim=<span class="num">1</span>)',
        '<span class="fn">print</span>(model(X_new).squeeze())',
        '<span class="com"># → tensor([ 2.50,  0.50, -2.00, -1.00, 2.50])</span>'
      ],
      highlights: [
        [0, 3],
        [5, 6],
        [8, 9],
        [11, 13],
        [14, 15],
        [16, 18],
        [20, 24],
        [26, 30]
      ]
    }
  }
];
