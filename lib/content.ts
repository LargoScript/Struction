// Content Configuration
// Тут ми зберігаємо всі тексти та посилання на медіа.
// Щоб використати власні фото/відео:
// 1. Покладіть файл у папку 'public' вашого проекту (наприклад, public/hero-video.mp4)
// 2. Замініть посилання тут на '/hero-video.mp4'

export const heroContent = {
  videoSrc: "/videos/hero.mp4",
  poster: "/images/hero-poster.jpg",
  badge: "Web Development for Small Business",
  title: {
    line1: "Ми створюємо сайти, які",
    highlight: "приносять прибуток"
  },
  description: "FluxForge допомагає локальному бізнесу вийти в онлайн. Сучасний дизайн, SEO-оптимізація та зручне управління — все, що потрібно для вашого успіху.",
  buttons: {
    primary: "Замовити консультацію",
    secondary: "Дивитись портфоліо"
  }
};

/** Portfolio entries with live project URLs only (matches default CMS data). */
export const portfolioItems = [
  {
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=2070',
    title: 'Lumière Dining',
    category: 'Restaurant • Fine Dining',
    year: '2025',
    url: 'https://lumiere-dining.vercel.app',
  },
  {
    image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=2070',
    title: 'NovaDent',
    category: 'Dental Clinic • Landing Page',
    year: '2025',
    url: 'https://novadent-nine.vercel.app',
  },
];

export const featuresContent = [
  { 
    title: "Локальне SEO", 
    desc: "Ми налаштуємо ваш сайт так, щоб клієнти з вашого міста знаходили вас першими в Google.",
  },
];

export const faqItems = [
  {
    question: "Скільки часу займає розробка сайту?",
    answer: "Зазвичай розробка лендінгу займає від 5 до 10 робочих днів. Багатосторінкові сайти та інтернет-магазини потребують 3-5 тижнів залежно від складності функціоналу."
  },
  {
    question: "Чи надаєте ви підтримку після запуску?",
    answer: "Так, ми надаємо 1 місяць безкоштовної технічної підтримки (виправлення помилок, консультації). Також ви можете замовити пакети постійного супроводу."
  },
  {
    question: "Яка вартість розробки?",
    answer: "Вартість розраховується індивідуально. Лендінги стартують від $500, корпоративні сайти від $1200. Залиште заявку, і ми підготуємо детальний кошторис."
  },
  {
    question: "Чи можу я самостійно редагувати сайт?",
    answer: "Так, ми підключаємо зручну адміністративну панель (CMS), де ви зможете легко змінювати тексти, фото та додавати новини без знання коду."
  },
  {
    question: "Що потрібно для початку роботи?",
    answer: "Ваше бажання та короткий опис ідеї. Ми допоможемо сформулювати технічне завдання, підберемо референси та запропонуємо найкраще рішення."
  }
];