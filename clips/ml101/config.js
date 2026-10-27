export const clip = {
  name: 'ML 101',
  backUrl: 'index.html',
  backText: '← back',
  nextClip: 'ml102.html',
  nextClipLabel: 'Continue to ML 102 →',
  defaultLang: 'az',
  ui: [
    { id: 'ml-loss-hud', html: '<div class="ml-label">LOSS (MSE)</div><div class="ml-val">0.00</div><div class="ml-sub" id="ml-loss-sub">kiçik = yaxşı</div>' },
    { id: 'ml-params-hud', html: '<div class="row"><span class="k">w</span><span class="v" data-k="w">—</span></div><div class="row"><span class="k">b</span><span class="v" data-k="b">—</span></div>' },
    { id: 'ml-progress', html: '<div class="bar"><div></div></div><span class="t">step 0 / 200</span>' },
    { id: 'ml-loss-chart', html: '<canvas></canvas>' },
    { id: 'ml-code', html: '<pre style="margin:0; white-space:pre;"></pre>' }
  ]
};

export const chapters = [
  { n: 1, title: 'Data', duration: 12, built: true,
    audio: {
      az: './clips/ml101/audio/az/data.mp3?v=20261026-223720',
      fa: './clips/ml101/audio/fa/data.mp3?v=20261026-223720',
      en: './clips/ml101/audio/en/data.mp3?v=20261026-223720',
    },
    chunks: {
      az: ['Tutaq ki, əlimizdə data var.', 'Sadəcə nöqtələr.', 'X və Y.', 'Maşın bu nöqtələr arasındakı qaydayı tapa bilərmi?'],
      fa: ['فرض کن داده داریم.', 'فقط نقطه‌ها.', 'X و Y.', 'آیا ماشین می‌تونه قاعده‌ی بین این نقطه‌ها رو پیدا کنه؟'],
      en: ['Suppose we have data.', 'Just points.', 'X and Y.', 'Can a machine find the rule between these points?'],
    }
  },
  { n: 2, title: 'Model', duration: 14, built: true,
    audio: {
      az: './clips/ml101/audio/az/model.mp3?v=20261026-223720',
      fa: './clips/ml101/audio/fa/model.mp3?v=20261026-223720',
      en: './clips/ml101/audio/en/model.mp3?v=20261026-223720',
    },
    chunks: {
      az: ['Model nədir?', 'Sadəcə bir xətt.', 'Y bərabərdir W vur X, üstəgəl B.', 'İki ədəd. W və B.', 'Hər şey bu ikisindən asılıdır.'],
      fa: ['مدل چیه؟', 'فقط یک خط.', 'Y برابر W ضربدر X، به‌لاوه B.', 'دو عدد. W و B.', 'همه‌چیز به این دو بستگی داره.'],
      en: ['What is a model?', 'Just a line.', 'Y equals W times X, plus B.', 'Two numbers. W and B.', 'Everything depends on these two.'],
    }
  },
  { n: 3, title: 'Loss', duration: 14, built: true,
    audio: {
      az: './clips/ml101/audio/az/loss.mp3?v=20261026-223720',
      fa: './clips/ml101/audio/fa/loss.mp3?v=20261026-223720',
      en: './clips/ml101/audio/en/loss.mp3?v=20261026-223720',
    },
    chunks: {
      az: ['Yaxşı da, nə qədər səhv edirik?', 'Hər nöqtədən xəttə qədər məsafəni ölçürük.', 'Kvadrata yüksəldirik.', 'Hamısını toplayıb orta tapırıq.', 'Bu ədədə loss deyilir.'],
      fa: ['خب، چقدر خطا داریم؟', 'فاصله‌ی هر نقطه تا خط رو اندازه می‌گیریم.', 'به توان دو می‌رسونیم.', 'همه رو جمع می‌کنیم و میانگین می‌گیریم.', 'به این عدد لاس می‌گن.'],
      en: ['So how wrong are we?', 'We measure distance from each point to the line.', 'Square it.', 'Sum them up and take the average.', 'This number is called loss.'],
    }
  },
  { n: 4, title: 'Training', duration: 18, built: true,
    audio: {
      az: './clips/ml101/audio/az/train.mp3?v=20261026-223720',
      fa: './clips/ml101/audio/fa/train.mp3?v=20261026-223720',
      en: './clips/ml101/audio/en/train.mp3?v=20261026-223720',
    },
    chunks: {
      az: ['İndi W-ı necə dəyişək?', 'Loss-un yamacına baxırıq.', 'Bu ox bizi düzgün istiqamətə aparır — aşağıya.', 'Bir addım at. Yenə ölç. Yenə at.', 'Min dəfə.', 'Xətt yavaş-yavaş yerini dəyişir.'],
      fa: ['حالا W رو چطور تغییر بدیم؟', 'به شیب لاس نگاه می‌کنیم.', 'این بردار ما رو به جهت درست می‌بره — به سمت پایین.', 'یک قدم بردار. دوباره اندازه بگیر. دوباره قدم.', 'هزار بار.', 'خط کم‌کم جابه‌جا می‌شه.'],
      en: ['Now how do we change W?', 'We look at the slope of the loss.', 'This arrow takes us in the right direction — downward.', 'Take a step. Measure again. Step again.', 'A thousand times.', 'The line slowly moves into place.'],
    }
  },
  { n: 5, title: 'Code', duration: 40, built: true,
    audio: {
      az: './clips/ml101/audio/az/5-walkthrough.mp3?v=20261026-223720',
      fa: './clips/ml101/audio/fa/5-walkthrough.mp3?v=20261026-223720',
      en: './clips/ml101/audio/en/5-walkthrough.mp3?v=20261026-223720',
    },
    chunks: {
      az: [
        'Bu dəfə data düz xəttdir. X və Y. İyirmi beş nöqtə.',
        'Modelimiz cəmi iki ədəddir: W və B. Hamısı budur.',
        'SGD — sadə optimizator. W və B-ni necə dəyişməyi öyrənir.',
        'İki yüz dövrə.',
        'Hər dəfə: model X-i alır, proqnoz verir. Loss hesablanır.',
        'Qradient alırıq, W və B-ni yeniləyirik.',
        'İki yüz dövrdən sonra: W təxminən iki, B təxminən bir.'
      ],
      fa: [
        'این بار داده، خط راسته. X و Y. بیست و پنج نقطه.',
        'مدل ما فقط دو عدده: W و B. همین.',
        'SGD — یه بهینه‌ساز ساده. یاد می‌گیره چطور W و B رو تغییر بده.',
        'دویست دور.',
        'هر بار: مدل X رو می‌گیره، پیش‌بینی می‌کنه. لاس محاسبه می‌شه.',
        'گرادیان می‌گیریم، W و B رو آپدیت می‌کنیم.',
        'بعد از دویست دور: W نزدیک دو، B نزدیک یک.'
      ],
      en: [
        'This time the data is a straight line. X and Y. Twenty-five points.',
        'Our model is just two numbers: W and B. That is all.',
        'SGD — a simple optimizer. It learns how to change W and B.',
        'Two hundred steps.',
        'Each step: model takes X, predicts. Loss is computed.',
        'We take gradients, update W and B.',
        'After two hundred steps: W is close to two, B is close to one.'
      ]
    },
    code: {
      lines: [
        '<span class="com"># 1. Data</span>',
        '<span class="kw">import</span> torch',
        'x = torch.linspace(<span class="num">-4</span>, <span class="num">4</span>, <span class="num">25</span>)',
        'y = <span class="num">2</span> * x + <span class="num">1</span> + <span class="num">0.8</span> * torch.randn(<span class="num">25</span>)',
        '',
        '<span class="com"># 2. Model — just two numbers</span>',
        'w = torch.randn(<span class="num">1</span>, requires_grad=<span class="kw">True</span>)',
        'b = torch.randn(<span class="num">1</span>, requires_grad=<span class="kw">True</span>)',
        '',
        '<span class="com"># 3. Optimizer</span>',
        'opt = torch.optim.SGD([w, b], lr=<span class="num">0.05</span>)',
        '',
        '<span class="com"># 4. Train</span>',
        '<span class="kw">for</span> step <span class="kw">in</span> <span class="fn">range</span>(<span class="num">200</span>):',
        '    y_pred = w * x + b',
        '    loss = ((y_pred - y) ** <span class="num">2</span>).mean()',
        '    opt.zero_grad()',
        '    loss.backward()',
        '    opt.step()',
        '',
        '<span class="com"># 5. Result</span>',
        '<span class="fn">print</span>(<span class="str">f"w={w.item():.2f}, b={b.item():.2f}"</span>)',
        '<span class="com"># → w=2.00, b=1.00</span>'
      ],
      highlights: [
        [0, 3],
        [5, 7],
        [9, 10],
        [12, 13],
        [14, 15],
        [16, 18],
        [20, 22]
      ]
    }
  }
];
