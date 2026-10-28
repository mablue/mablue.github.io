export const clip = {
  name: 'ML 104',
  backUrl: 'index.html',
  backText: '← back',
  defaultLang: 'az',
  ui: [
    { id: 'ml-loss-hud', html: '<div class="ml-label">LOSS (BCE)</div><div class="ml-val">0.00</div><div class="ml-sub" id="ml-loss-sub">kiçik = yaxşı</div>' },
    { id: 'ml-params-hud', html: '<div class="row"><span class="k">R</span><span class="v" data-k="R">—</span></div><div class="row"><span class="k">acc</span><span class="v" data-k="acc">—</span></div>' },
    { id: 'ml-sigmoid-hud', html: '<div style="font-family:JetBrains Mono,monospace;font-size:0.6rem;color:#6b655c;letter-spacing:0.15em;margin-bottom:0.3rem;">SIGMOID</div><canvas></canvas>' },
    { id: 'ml-progress', html: '<div class="bar"><div></div></div><span class="t">step 0 / 500</span>' },
    { id: 'ml-loss-chart', html: '<canvas></canvas>' },
    { id: 'ml-code', html: '<pre style="margin:0; white-space:pre;"></pre>' }
  ]
};

export const chapters = [
  { n: 1, title: 'Two Tribes', duration: 14, built: true,
    audio: {
      az: './clips/ml104/audio/az/1-tribes.mp3?v=20261027-193652',
      fa: './clips/ml104/audio/fa/1-tribes.mp3?v=20261027-193652',
      en: './clips/ml104/audio/en/1-tribes.mp3?v=20261027-193652',
    },
    chunks: {
      az: ['Bu dəfə data iki dairədir.', 'İçdə amber nöqtələr. Xaricdə mavi nöqtələr.', 'Maşın bunları necə ayırd edəcək?'],
      fa: ['این بار داده دو دایره‌ست.', 'داخل، نقطه‌های کهربایی. بیرون، نقطه‌های آبی.', 'ماشین چطور اینا رو جدا می‌کنه؟'],
      en: ['This time the data is two circles.', 'Inside: amber points. Outside: blue points.', 'How will the machine separate them?'],
    }
  },
  { n: 2, title: 'The Circle', duration: 16, built: true,
    audio: {
      az: './clips/ml104/audio/az/2-circle.mp3?v=20261027-193652',
      fa: './clips/ml104/audio/fa/2-circle.mp3?v=20261027-193652',
      en: './clips/ml104/audio/en/2-circle.mp3?v=20261027-193652',
    },
    chunks: {
      az: ['Düz xətt işə yaramaz.', 'Çünki iç və xaric bir-birinə qarışıb.', 'Gizli qat əyri yaradır.', 'Sərhəd bir dairə olur.'],
      fa: ['خط راست جواب نمی‌ده.', 'چون داخل و بیرون قاطی‌ان.', 'لایه‌ی مخفی یه منحنی می‌سازه.', 'مرز یه دایره می‌شه.'],
      en: ['A straight line won\'t work.', 'Because inside and outside are mixed.', 'A hidden layer bends the shape.', 'The boundary becomes a circle.'],
    }
  },
  { n: 3, title: 'Sigmoid', duration: 14, built: true,
    audio: {
      az: './clips/ml104/audio/az/3-sigmoid.mp3?v=20261027-193652',
      fa: './clips/ml104/audio/fa/3-sigmoid.mp3?v=20261027-193652',
      en: './clips/ml104/audio/en/3-sigmoid.mp3?v=20261027-193652',
    },
    chunks: {
      az: ['Hər nöqtə üçün bir xal.', 'Sigmoid onu sıfırla bir arasına sıxır.', 'Artıq ehtimaldır.', 'Sərhədə yaxın nöqtələr qeyri-müəyyəndir.'],
      fa: ['برای هر نقطه یه امتیاز.', 'Sigmoid فشرده‌ش می‌کنه بین صفر و یک.', 'حالا احتماله.', 'نقطه‌های نزدیک مرز نامعینن.'],
      en: ['A score for each point.', 'Sigmoid squashes it to zero-to-one.', 'Now it\'s a probability.', 'Points near the boundary are uncertain.'],
    }
  },
  { n: 4, title: 'Training', duration: 20, built: true,
    audio: {
      az: './clips/ml104/audio/az/4-train.mp3?v=20261027-193652',
      fa: './clips/ml104/audio/fa/4-train.mp3?v=20261027-193652',
      en: './clips/ml104/audio/en/4-train.mp3?v=20261027-193652',
    },
    chunks: {
      az: ['Loss — BCE. Cross-entropy.', 'Sərhədi yerinə qoyur.', 'Nöqtələr tədricən düzgün tərəfə keçir.', 'Dəqiqlik artır.', 'Beş yüz addım.'],
      fa: ['Loss — BCE. کراس-آنتروپی.', 'مرز رو سر جاش می‌ذاره.', 'نقطه‌ها کم‌کم به سمت درست می‌رن.', 'دقت بیشتر می‌شه.', 'پونصد قدم.'],
      en: ['Loss — BCE. Cross-entropy.', 'It pushes the boundary into place.', 'Points gradually move to the right side.', 'Accuracy climbs.', 'Five hundred steps.'],
    }
  },
  { n: 5, title: 'Code', duration: 42, built: true,
    audio: {
      az: './clips/ml104/audio/az/5-code.mp3?v=20261027-193652',
      fa: './clips/ml104/audio/fa/5-code.mp3?v=20261027-193652',
      en: './clips/ml104/audio/en/5-code.mp3?v=20261027-193652',
    },
    chunks: {
      az: [
        'Datanı iki halqadır. İçdə sıfır, xaricdə bir.',
        'Şəbəkə: iki giriş, səkkiz neyron, bir çıxış. Sigmoid.',
        'Loss — BCE. Binary cross-entropy.',
        'Eyni dövrə. Beş yüz addım.',
        'Nəticə: loss təxminən sıfır nöqtə sıfır ikidir.',
        'Yeni nöqtələr üçün proqnoz.'
      ],
      fa: [
        'داده دو حلقه‌ست. داخل صفر، بیرون یک.',
        'شبکه: دو ورودی، هشت نورون، یک خروجی. سیگموئید.',
        'لاس — بی‌سی‌ای. باینری کراس-آنتروپی.',
        'همون حلقه. پونصد قدم.',
        'نتیجه: لاس نزدیک صفر نقطه صفر دو.',
        'پیش‌بینی روی نقطه‌های جدید.'
      ],
      en: [
        'Data is two rings. Inner is zero, outer is one.',
        'Network: two inputs, eight neurons, one output. Sigmoid.',
        'Loss — BCE. Binary cross-entropy.',
        'Same loop. Five hundred steps.',
        'Result: loss is about zero point zero two.',
        'Predict on new points.'
      ]
    },
    code: {
      lines: [
        '<span class="com"># 1. Data — two rings</span>',
        '<span class="kw">import</span> torch, torch.nn <span class="kw">as</span> nn',
        'n = <span class="num">100</span>',
        'inner = torch.randn(n, <span class="num">2</span>) * <span class="num">0.7</span>',
        'angle = torch.rand(n) * <span class="num">6.28</span>',
        'outer = torch.stack([torch.cos(angle), torch.sin(angle)], <span class="num">1</span>) * <span class="num">3.5</span> + torch.randn(n, <span class="num">2</span>) * <span class="num">0.3</span>',
        'X = torch.cat([inner, outer])',
        'y = torch.cat([torch.zeros(n, <span class="num">1</span>), torch.ones(n, <span class="num">1</span>)])',
        '',
        '<span class="com"># 2. Network with hidden layer</span>',
        'model = nn.Sequential(',
        '    nn.Linear(<span class="num">2</span>, <span class="num">8</span>),',
        '    nn.ReLU(),',
        '    nn.Linear(<span class="num">8</span>, <span class="num">1</span>),',
        '    nn.Sigmoid(),',
        ')',
        '',
        '<span class="com"># 3. BCE loss for classification</span>',
        'opt = torch.optim.Adam(model.parameters(), lr=<span class="num">0.02</span>)',
        'loss_fn = nn.BCELoss()',
        '',
        '<span class="com"># 4. Training</span>',
        '<span class="kw">for</span> step <span class="kw">in</span> <span class="fn">range</span>(<span class="num">500</span>):',
        '    y_pred = model(X)',
        '    loss = loss_fn(y_pred, y)',
        '    opt.zero_grad()',
        '    loss.backward()',
        '    opt.step()',
        '',
        '<span class="com"># 5. Result</span>',
        '<span class="fn">print</span>(<span class="str">f"final loss: {loss.item():.4f}"</span>)',
        '',
        '<span class="com"># 6. Predict on a grid</span>',
        'grid = torch.tensor([[<span class="num">0.</span>, <span class="num">0.</span>], [<span class="num">3.</span>, <span class="num">0.</span>], [<span class="num">5.</span>, <span class="num">5.</span>]])',
        '<span class="fn">print</span>(model(grid).squeeze())'
      ],
      highlights: [
        [0, 7],
        [9, 15],
        [17, 19],
        [21, 27],
        [29, 30],
        [32, 34]
      ]
    }
  }
];
