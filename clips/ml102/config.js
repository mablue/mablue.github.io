export const clip = {
  "name": "ML 102",
  "backUrl": "index.html",
  "backText": "← back",
  "nextClip": "ml103.html",
  "nextClipLabel": "Continue to ML 103 →",
  "defaultLang": "az",
  "ui": [
    {
      "id": "ml-loss-hud",
      "html": "<div class=\"ml-label\">LOSS (MSE)</div><div class=\"ml-val\">0.00</div><div class=\"ml-sub\" id=\"ml-loss-sub\">kiçik = yaxşı</div>"
    },
    {
      "id": "ml-params-hud",
      "html": "<div class=\"row\"><span class=\"k\">w₁</span><span class=\"v\" data-k=\"w1\">—</span></div><div class=\"row\"><span class=\"k\">w₂</span><span class=\"v\" data-k=\"w2\">—</span></div><div class=\"row\"><span class=\"k\">b</span><span class=\"v\" data-k=\"b\">—</span></div>"
    },
    {
      "id": "ml-progress",
      "html": "<div class=\"bar\"><div></div></div><span class=\"t\">step 0 / 400</span>"
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
    "title": "Curve",
    "duration": 8.6,
    "built": true,
    "audio": {
      "az": [
        "./clips/ml102/audio-chunks/az/ch1/00.mp3?v=20261028-195119",
        "./clips/ml102/audio-chunks/az/ch1/01.mp3?v=20261028-195119",
        "./clips/ml102/audio-chunks/az/ch1/02.mp3?v=20261028-195119"
      ],
      "fa": [
        "./clips/ml102/audio-chunks/fa/ch1/00.mp3?v=20261028-195119",
        "./clips/ml102/audio-chunks/fa/ch1/01.mp3?v=20261028-195119",
        "./clips/ml102/audio-chunks/fa/ch1/02.mp3?v=20261028-195119"
      ],
      "en": [
        "./clips/ml102/audio-chunks/en/ch1/00.mp3?v=20261028-195119",
        "./clips/ml102/audio-chunks/en/ch1/01.mp3?v=20261028-195119",
        "./clips/ml102/audio-chunks/en/ch1/02.mp3?v=20261028-195119"
      ]
    },
    "chunks": {
      "az": [
        "Bu nöqtələr düz xətt deyil.",
        "Bir əyridir.",
        "Düz xətt heç vaxt uyğun gəlməyəcək."
      ],
      "fa": [
        "این نقطه‌ها روی خط راست نیستن.",
        "یه منحنی‌ان.",
        "خط راست هیچ‌وقت جور نمی‌شه."
      ],
      "en": [
        "These points are not on a straight line.",
        "They form a curve.",
        "A straight line will never fit."
      ]
    },
    "chunkDurations": {
      "az": [
        2.88,
        2.136,
        3.576
      ],
      "fa": [
        3.264,
        2.088,
        3.0
      ],
      "en": [
        3.336,
        2.256,
        2.954
      ]
    }
  },
  {
    "n": 2,
    "title": "Add x²",
    "duration": 14.6,
    "built": true,
    "audio": {
      "az": [
        "./clips/ml102/audio-chunks/az/ch2/00.mp3?v=20261028-195119",
        "./clips/ml102/audio-chunks/az/ch2/01.mp3?v=20261028-195119",
        "./clips/ml102/audio-chunks/az/ch2/02.mp3?v=20261028-195119",
        "./clips/ml102/audio-chunks/az/ch2/03.mp3?v=20261028-195119"
      ],
      "fa": [
        "./clips/ml102/audio-chunks/fa/ch2/00.mp3?v=20261028-195119",
        "./clips/ml102/audio-chunks/fa/ch2/01.mp3?v=20261028-195119",
        "./clips/ml102/audio-chunks/fa/ch2/02.mp3?v=20261028-195119",
        "./clips/ml102/audio-chunks/fa/ch2/03.mp3?v=20261028-195119"
      ],
      "en": [
        "./clips/ml102/audio-chunks/en/ch2/00.mp3?v=20261028-195119",
        "./clips/ml102/audio-chunks/en/ch2/01.mp3?v=20261028-195119",
        "./clips/ml102/audio-chunks/en/ch2/02.mp3?v=20261028-195119",
        "./clips/ml102/audio-chunks/en/ch2/03.mp3?v=20261028-195119"
      ]
    },
    "chunks": {
      "az": [
        "Modelə ikinci bir giriş verək: x kvadratı.",
        "İndi iki giriş var — x və x².",
        "İki çəki. İki yamac.",
        "Və düz xətt əyriyə çevrilir."
      ],
      "fa": [
        "یه ورودی دوم به مدل بدیم: مربع x.",
        "حالا دو ورودی داریم — x و x².",
        "دو وزن. دو شیب.",
        "و خط راست تبدیل به منحنی می‌شه."
      ],
      "en": [
        "Give the model a second input: x squared.",
        "Now two inputs — x and x².",
        "Two weights. Two slopes.",
        "And the straight line bends into a curve."
      ]
    },
    "chunkDurations": {
      "az": [
        4.248,
        3.408,
        3.888,
        3.048
      ],
      "fa": [
        4.272,
        4.032,
        3.241,
        3.264
      ],
      "en": [
        3.72,
        4.344,
        3.864,
        3.432
      ]
    }
  },
  {
    "n": 3,
    "title": "Model",
    "duration": 9.4,
    "built": true,
    "audio": {
      "az": [
        "./clips/ml102/audio-chunks/az/ch3/00.mp3?v=20261028-195119",
        "./clips/ml102/audio-chunks/az/ch3/01.mp3?v=20261028-195119"
      ],
      "fa": [
        "./clips/ml102/audio-chunks/fa/ch3/00.mp3?v=20261028-195119",
        "./clips/ml102/audio-chunks/fa/ch3/01.mp3?v=20261028-195119"
      ],
      "en": [
        "./clips/ml102/audio-chunks/en/ch3/00.mp3?v=20261028-195119",
        "./clips/ml102/audio-chunks/en/ch3/01.mp3?v=20261028-195119"
      ]
    },
    "chunks": {
      "az": [
        "Y bərabərdir W₁ vur X, üstəgəl W₂ vur X kvadrat, üstəgəl B.",
        "Üç ədəd. Hamısı budur."
      ],
      "fa": [
        "Y برابر W₁ ضربدر X، به‌لاوه W₂ ضربدر X²، به‌لاوه B.",
        "سه عدد. همین."
      ],
      "en": [
        "Y equals W₁ times X, plus W₂ times X², plus B.",
        "Three numbers. That is all."
      ]
    },
    "chunkDurations": {
      "az": [
        5.328,
        4.032
      ],
      "fa": [
        7.488,
        3.288
      ],
      "en": [
        7.2,
        3.888
      ]
    }
  },
  {
    "n": 4,
    "title": "Training",
    "duration": 12.1,
    "built": true,
    "audio": {
      "az": [
        "./clips/ml102/audio-chunks/az/ch4/00.mp3?v=20261028-195119",
        "./clips/ml102/audio-chunks/az/ch4/01.mp3?v=20261028-195119",
        "./clips/ml102/audio-chunks/az/ch4/02.mp3?v=20261028-195119",
        "./clips/ml102/audio-chunks/az/ch4/03.mp3?v=20261028-195119",
        "./clips/ml102/audio-chunks/az/ch4/04.mp3?v=20261028-195119"
      ],
      "fa": [
        "./clips/ml102/audio-chunks/fa/ch4/00.mp3?v=20261028-195119",
        "./clips/ml102/audio-chunks/fa/ch4/01.mp3?v=20261028-195119",
        "./clips/ml102/audio-chunks/fa/ch4/02.mp3?v=20261028-195119",
        "./clips/ml102/audio-chunks/fa/ch4/03.mp3?v=20261028-195119",
        "./clips/ml102/audio-chunks/fa/ch4/04.mp3?v=20261028-195119"
      ],
      "en": [
        "./clips/ml102/audio-chunks/en/ch4/00.mp3?v=20261028-195119",
        "./clips/ml102/audio-chunks/en/ch4/01.mp3?v=20261028-195119",
        "./clips/ml102/audio-chunks/en/ch4/02.mp3?v=20261028-195119",
        "./clips/ml102/audio-chunks/en/ch4/03.mp3?v=20261028-195119",
        "./clips/ml102/audio-chunks/en/ch4/04.mp3?v=20261028-195119"
      ]
    },
    "chunks": {
      "az": [
        "Eyni dövrə.",
        "Xəta geriyə axır.",
        "Hər üç çəki yenilənir.",
        "Əyri yerinə oturur.",
        "Dörd yüz addım."
      ],
      "fa": [
        "همون حلقه.",
        "خطا به عقب جریان داره.",
        "هر سه وزن آپدیت می‌شن.",
        "منحنی سر جاش می‌شینه.",
        "چهارصد قدم."
      ],
      "en": [
        "Same loop.",
        "Error flows backward.",
        "All three weights update.",
        "The curve settles into place.",
        "Four hundred steps."
      ]
    },
    "chunkDurations": {
      "az": [
        2.136,
        2.376,
        2.736,
        2.496,
        2.328
      ],
      "fa": [
        1.944,
        2.832,
        2.808,
        2.76,
        2.136
      ],
      "en": [
        2.016,
        2.544,
        2.592,
        2.784,
        2.448
      ]
    }
  },
  {
    "n": 5,
    "title": "Code",
    "duration": 41.1,
    "built": true,
    "audio": {
      "az": [
        "./clips/ml102/audio-chunks/az/ch5/00.mp3?v=20261028-195119",
        "./clips/ml102/audio-chunks/az/ch5/01.mp3?v=20261028-195119",
        "./clips/ml102/audio-chunks/az/ch5/02.mp3?v=20261028-195119",
        "./clips/ml102/audio-chunks/az/ch5/03.mp3?v=20261028-195119",
        "./clips/ml102/audio-chunks/az/ch5/04.mp3?v=20261028-195119",
        "./clips/ml102/audio-chunks/az/ch5/05.mp3?v=20261028-195119",
        "./clips/ml102/audio-chunks/az/ch5/06.mp3?v=20261028-195119",
        "./clips/ml102/audio-chunks/az/ch5/07.mp3?v=20261028-195119"
      ],
      "fa": [
        "./clips/ml102/audio-chunks/fa/ch5/00.mp3?v=20261028-195119",
        "./clips/ml102/audio-chunks/fa/ch5/01.mp3?v=20261028-195119",
        "./clips/ml102/audio-chunks/fa/ch5/02.mp3?v=20261028-195119",
        "./clips/ml102/audio-chunks/fa/ch5/03.mp3?v=20261028-195119",
        "./clips/ml102/audio-chunks/fa/ch5/04.mp3?v=20261028-195119",
        "./clips/ml102/audio-chunks/fa/ch5/05.mp3?v=20261028-195119",
        "./clips/ml102/audio-chunks/fa/ch5/06.mp3?v=20261028-195119",
        "./clips/ml102/audio-chunks/fa/ch5/07.mp3?v=20261028-195119"
      ],
      "en": [
        "./clips/ml102/audio-chunks/en/ch5/00.mp3?v=20261028-195119",
        "./clips/ml102/audio-chunks/en/ch5/01.mp3?v=20261028-195119",
        "./clips/ml102/audio-chunks/en/ch5/02.mp3?v=20261028-195119",
        "./clips/ml102/audio-chunks/en/ch5/03.mp3?v=20261028-195119",
        "./clips/ml102/audio-chunks/en/ch5/04.mp3?v=20261028-195119",
        "./clips/ml102/audio-chunks/en/ch5/05.mp3?v=20261028-195119",
        "./clips/ml102/audio-chunks/en/ch5/06.mp3?v=20261028-195119",
        "./clips/ml102/audio-chunks/en/ch5/07.mp3?v=20261028-195119"
      ]
    },
    "chunks": {
      "az": [
        "Bu dəfə data əyridir. X və Y. Otuz nöqtə.",
        "Bu əsas hiylədir: X-in kvadratını ikinci giriş kimi əlavə edirik.",
        "Model iki giriş alır, bir çıxış verir. Linear ilə.",
        "Eyni SGD, dörd yüz dövrə.",
        "Hər dəfə: model X-i alır. Artıq iki sütun — X və X kvadratı.",
        "Loss, qradient, yeniləmə. Hər üç çəki dəyişir.",
        "Öyrədilmiş çəkilərə baxaq: W1 sıfıra, W2 yarım, B mənfi ikiyə yaxın.",
        "Yeni nöqtələrdə proqnoz verək."
      ],
      "fa": [
        "این بار داده، منحنيه. X و Y. سی نقطه.",
        "کلید ماجرا اینجاست: مربع X رو به عنوان ورودی دوم اضافه می‌کنیم.",
        "مدل دو ورودی می‌گیره، یه خروجی می‌ده. با Linear.",
        "همون SGD، چهارصد دور.",
        "هر بار: مدل X رو می‌گیره. دیگه دو ستونه — X و مربع X.",
        "لاس، گرادیان، آپدیت. هر سه وزن تغییر می‌کنن.",
        "به وزن‌های آموزش‌دیده نگاه کنیم: W1 نزدیک صفر، W2 نزدیک نیم، B نزدیک منفی دو.",
        "روی نقطه‌های جدید پیش‌بینی می‌کنیم."
      ],
      "en": [
        "This time the data is a curve. X and Y. Thirty points.",
        "The key trick: add x squared as a second input.",
        "The model takes two inputs, gives one output. With Linear.",
        "Same SGD, four hundred steps.",
        "Each step: model takes X. Now two columns — X and x squared.",
        "Loss, gradient, update. All three weights change.",
        "Look at the trained weights: W1 close to zero, W2 close to half, B close to minus two.",
        "Predict on new points."
      ]
    },
    "code": {
      "lines": [
        "<span class=\"com\"># 1. Data</span>",
        "<span class=\"kw\">import</span> torch, torch.nn <span class=\"kw\">as</span> nn",
        "x = torch.linspace(<span class=\"num\">-3</span>, <span class=\"num\">3</span>, <span class=\"num\">30</span>)",
        "y = <span class=\"num\">0.5</span> * x**<span class=\"num\">2</span> - <span class=\"num\">2</span> + <span class=\"num\">0.3</span> * torch.randn(<span class=\"num\">30</span>)",
        "",
        "<span class=\"com\"># 2. Two features: x and x squared</span>",
        "X = torch.stack([x, x**<span class=\"num\">2</span>], dim=<span class=\"num\">1</span>)",
        "",
        "<span class=\"com\"># 3. Model: 2 inputs, 1 output</span>",
        "model = nn.Linear(<span class=\"num\">2</span>, <span class=\"num\">1</span>)",
        "",
        "<span class=\"com\"># 4. Same training loop</span>",
        "opt = torch.optim.SGD(model.parameters(), lr=<span class=\"num\">0.02</span>)",
        "<span class=\"kw\">for</span> step <span class=\"kw\">in</span> <span class=\"fn\">range</span>(<span class=\"num\">400</span>):",
        "    y_pred = model(X).squeeze()",
        "    loss = ((y_pred - y)**<span class=\"num\">2</span>).mean()",
        "    opt.zero_grad()",
        "    loss.backward()",
        "    opt.step()",
        "",
        "<span class=\"com\"># 5. Inspect the trained weights</span>",
        "w1, w2 = model.weight[<span class=\"num\">0</span>].tolist()",
        "b = model.bias.item()",
        "<span class=\"fn\">print</span>(<span class=\"str\">f\"w1={w1:.2f}, w2={w2:.2f}, b={b:.2f}\"</span>)",
        "<span class=\"com\"># → w1=0.00, w2=0.50, b=-2.00</span>",
        "",
        "<span class=\"com\"># 6. Predict on new points</span>",
        "x_new = torch.linspace(<span class=\"num\">-3</span>, <span class=\"num\">3</span>, <span class=\"num\">5</span>)",
        "X_new = torch.stack([x_new, x_new**<span class=\"num\">2</span>], dim=<span class=\"num\">1</span>)",
        "<span class=\"fn\">print</span>(model(X_new).squeeze())",
        "<span class=\"com\"># → tensor([ 2.50,  0.50, -2.00, -1.00, 2.50])</span>"
      ],
      "highlights": [
        [
          0,
          3
        ],
        [
          5,
          6
        ],
        [
          8,
          9
        ],
        [
          11,
          13
        ],
        [
          14,
          15
        ],
        [
          16,
          18
        ],
        [
          20,
          24
        ],
        [
          26,
          30
        ]
      ]
    },
    "chunkDurations": {
      "az": [
        5.592,
        5.232,
        5.736,
        3.408,
        6.672,
        5.592,
        5.64,
        3.264
      ],
      "fa": [
        6.384,
        6.0,
        5.448,
        3.096,
        6.288,
        5.688,
        8.088,
        3.384
      ],
      "en": [
        5.76,
        4.44,
        5.976,
        3.648,
        6.816,
        5.688,
        7.824,
        2.544
      ]
    }
  }
];
