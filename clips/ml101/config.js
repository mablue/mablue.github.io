export const languages = ['az', 'fa', 'en'];
export const defaultLang = 'az';

export const chapters = [
  { n: 1, title: 'Data', duration: 12, built: true,
    audio: {
      az: './clips/ml101/audio/az/data.mp3?v=20261026-2038',
      fa: './clips/ml101/audio/fa/data.mp3?v=20261026-2038',
      en: './clips/ml101/audio/en/data.mp3?v=20261026-2038',
    },
    chunks: {
      az: ['Tutaq ki, əlimizdə data var.','Sadəcə nöqtələr.','X və Y.','Maşın bu nöqtələr arasındakı qaydayı tapa bilərmi?'],
      fa: ['فرض کن داده داریم.','فقط نقطه‌ها.','X و Y.','آیا ماشین می‌تونه قاعده‌ی بین این نقطه‌ها رو پیدا کنه؟'],
      en: ['Suppose we have data.','Just points.','X and Y.','Can a machine find the rule between these points?'],
    }
  },
  { n: 2, title: 'Model', duration: 14, built: true,
    audio: {
      az: './clips/ml101/audio/az/model.mp3?v=20261026-2038',
      fa: './clips/ml101/audio/fa/model.mp3?v=20261026-2038',
      en: './clips/ml101/audio/en/model.mp3?v=20261026-2038',
    },
    chunks: {
      az: ['Model nədir?','Sadəcə bir xətt.','Y bərabərdir W vur X, üstəgəl B.','İki ədəd. W və B.','Hər şey bu ikisindən asılıdır.'],
      fa: ['مدل چیه؟','فقط یک خط.','Y برابر W ضربدر X، به‌علاوه B.','دو عدد. W و B.','همه‌چیز به این دو بستگی داره.'],
      en: ['What is a model?','Just a line.','Y equals W times X, plus B.','Two numbers. W and B.','Everything depends on these two.'],
    }
  },
  { n: 3, title: 'Loss', duration: 14, built: true,
    audio: {
      az: './clips/ml101/audio/az/loss.mp3?v=20261026-2038',
      fa: './clips/ml101/audio/fa/loss.mp3?v=20261026-2038',
      en: './clips/ml101/audio/en/loss.mp3?v=20261026-2038',
    },
    chunks: {
      az: ['Yaxşı da, nə qədər səhv edirik?','Hər nöqtədən xəttə qədər məsafəni ölçürük.','Kvadrata yüksəldirik.','Hamısını toplayıb orta tapırıq.','Bu ədədə loss deyilir.'],
      fa: ['خب، چقدر خطا داریم؟','فاصله‌ی هر نقطه تا خط رو اندازه می‌گیریم.','به توان دو می‌رسونیم.','همه رو جمع می‌کنیم و میانگین می‌گیریم.','به این عدد لاس می‌گن.'],
      en: ['So how wrong are we?','We measure distance from each point to the line.','Square it.','Sum them up and take the average.','This number is called loss.'],
    }
  },
  { n: 4, title: 'Training', duration: 18, built: true,
    audio: {
      az: './clips/ml101/audio/az/train.mp3?v=20261026-2038',
      fa: './clips/ml101/audio/fa/train.mp3?v=20261026-2038',
      en: './clips/ml101/audio/en/train.mp3?v=20261026-2038',
    },
    chunks: {
      az: ['İndi W-ı necə dəyişək?','Loss-un yamacına baxırıq.','Bu ox bizi düzgün istiqamətə aparır — aşağıya.','Bir addım at. Yenə ölç. Yenə at.','Min dəfə.','Xətt yavaş-yavaş yerini dəyişir.'],
      fa: ['حالا W رو چطور تغییر بدیم؟','به شیب لاس نگاه می‌کنیم.','این بردار ما رو به جهت درست می‌بره — به سمت پایین.','یک قدم بردار. دوباره اندازه بگیر. دوباره قدم.','هزار بار.','خط کم‌کم جابه‌جا می‌شه.'],
      en: ['Now how do we change W?','We look at the slope of the loss.','This arrow takes us in the right direction — downward.','Take a step. Measure again. Step again.','A thousand times.','The line slowly moves into place.'],
    }
  },
  { n: 5, title: 'Done', duration: 14, built: true,
    audio: {
      az: './clips/ml101/audio/az/done.mp3?v=20261026-2038',
      fa: './clips/ml101/audio/fa/done.mp3?v=20261026-2038',
      en: './clips/ml101/audio/en/done.mp3?v=20261026-2038',
    },
    chunks: {
      az: ['Budur.','Xətt uyğunlaşdı.','Sən sadəcə ilk modelini öyrətdin.','Prinsip eynidir — minlərlə parametr olsa da, riyaziyyat dəyişmir.'],
      fa: ['تمام.','خط جور شد.','تو فقط اولین مدلت رو آموزش دادی.','اصل همینه — حتی با هزاران پارامتر، ریاضی عوض نمی‌شه.'],
      en: ['There it is.','The line fits.','You just trained your first model.','The principle is the same — even with thousands of parameters, the math does not change.'],
    }
  }
];
