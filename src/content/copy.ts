/**
 * Every string on the site. English is the launch language and Russian is available.
 * Nothing here may assert a claim the research
 * package has not cleared (no history, no certification, no superlatives, no
 * "signature dish", no service promises).
 */

export type Lang = 'en' | 'ru';

export const COPY = {
  en: {

    meta: {
      title: 'Padishah Restaurant — 1920 Avenue U, Brooklyn',
      description: 'Padishah Restaurant at 1920 Avenue U, Brooklyn, NY 11229. Call (718) 743-9656 or open directions.',
    },

    nav: {
      menu: 'Menu',
      fire: 'The fire',
      room: 'The room',
      banquets: 'Banquets',
      visit: 'Visit',
      call: 'Call',
      directions: 'Directions',
      skip: 'Skip to content',
      mainLabel: 'Main navigation',
      footerLabel: 'Footer navigation',
    },
    hero: {
      eyebrow: '1920 Avenue U · Brooklyn',
      title: 'Off the fire,\nonto the table.',
      sub: 'Skewers over coals, then straight to a wooden board — at 1920 Avenue U in Brooklyn.',
      ctaMenu: 'View the menu',
      ctaCall: 'Call (718) 743-9656',
      scroll: 'Scroll',
      pause: 'Pause background video',
      play: 'Play background video',
      optionBTitle: 'The table is ready at Padishah.',
      optionBBody:
        'Come for smoke-kissed kebabs, samsa, manti, fresh salads, and generous plates made for sharing.',
    },
    fire: {
      eyebrow: 'From the grill',
      title: 'It starts at the coals.',
      body: 'Lamb ribs, lulya, liver and chicken go over the fire on long skewers, then straight to a wooden board with red onion, lemon and herbs. That short walk from the grill to your table is the whole idea.',
      deckTitle: 'From the grill to the table',
      deckBody:
        'The Padishah experience begins with heat, smoke, and food meant to be shared. Discover lamb ribs, lulya kebab, samsa, manti, achichuk, soups, fish, and comforting sides.',
    },
    dishes: {
      eyebrow: 'On the table',
      title: 'What people come back for.',
      body: 'Drawn from the restaurant’s public menu.',
      cta: 'See the full menu',
    },
    room: {
      eyebrow: 'The room',
      title: 'A table long enough for everyone.',
      body: 'The restaurant announced a renewed dining room in June 2026. It is a room for a Tuesday dinner and for the kind of evening where the table keeps growing.',
      note: 'Call the restaurant for room and event details.',
      deckTitle: 'A renewed room for everyday dinners and big tables',
      deckBody: 'Join us on Avenue U for a relaxed meal with family and friends.',
      deckEventsDraft: 'For group dining or celebrations, call and let our team help plan the table.',
    },
    menuPreview: {
      eyebrow: 'The menu',
      title: 'Eight sections, one hundred forty-three dishes.',
      body: 'Specials, soups and salads, cold and hot appetizers, shish kebabs, fish, sides, desserts and drinks — with the restaurant’s own prices.',
    },
    ratings: {
      eyebrow: 'In public',
      title: 'What the listings say.',
      note: 'Public platform ratings, observed {date}. They move; check the source.',
    },
    visit: {
      eyebrow: 'Visit',
      title: 'Find us on Avenue U.',
      hoursLabel: 'Hours',
      hoursNote: 'Public listing hours — please call to confirm.',
      addressLabel: 'Address',
      phoneLabel: 'Phone',
      directions: 'Open in Google Maps',
      instagram: 'Instagram',
      order: 'Order online',

      // Calendar labels for the day keys in the hours data — labels, not facts.
      days: {
        monday: 'Monday',
        tuesday: 'Tuesday',
        wednesday: 'Wednesday',
        thursday: 'Thursday',
        friday: 'Friday',
        saturday: 'Saturday',
        sunday: 'Sunday',
      },
    },
    menuPage: {
      title: 'Menu',
      lead: 'The restaurant’s own menu and prices, from its Clover register — August 17, 2026.',

      observed: 'Snapshot observed {date} · source: {source}',
      search: 'Search dishes',
      searchPlaceholder: 'kebab, samsa, salad…',
      empty: 'Nothing matched. Try a shorter word, or call the restaurant.',
      priceUnavailable: 'Call for price',
      all: 'All',
      noteNameSuggested: 'Alternate spelling',
      noteDescriptionPending: 'Description not listed',
      notePossibleDuplicate: 'Appears twice in the public listing',
      notePriceUnavailable: 'Price not published',
      notePendingOwner: 'Details available by phone',
      countLabel: '{n} dishes',
      showResearchPrices: 'Show the prices we found ({date})',
      hideResearchPrices: 'Hide the researched prices',
      researchPriceNote: 'Prices published on a delivery listing on {date}.',
      researchPriceTag: 'Researched',

    },
    concierge: {
      open: 'Help me choose',
      title: 'What are you in the mood for?',
      lead: 'This picks from the dishes on this page. It knows nothing the menu does not say.',
      placeholder: 'grilled lamb for four…',
      submit: 'Show me',
      refusal:
        'The menu data does not answer that. Halal, allergens, spice level and dietary questions have to come from the restaurant — please call (718) 743-9656.',
      empty: 'Nothing on the published menu matches that. Try another word.',
      resultsLabel: 'Suggested from the menu',
    },
    footer: {
      langLabel: 'Language',
      factsChecked: 'Facts checked {date}.',
    },
    menuCategories: {
      specials: 'Specials',
      'soup-salads': 'Soups & Salads',
      'cold-appetizers': 'Cold Appetizers',
      'hot-appetizers': 'Hot Appetizers',
      'shish-kebabs': 'Shish Kebabs',
      'fish-entrees': 'Fish Entrées',
      'sides-misc': 'Sides',
      'dessert-drink': 'Desserts & Drinks',
    },
  },

  ru: {

    meta: {
      title: 'Ресторан «Падишах» — 1920 Avenue U, Бруклин',
      description: 'Ресторан «Падишах» по адресу 1920 Avenue U, Brooklyn, NY 11229. Телефон (718) 743-9656.',
    },

    nav: {
      menu: 'Меню',
      fire: 'Огонь',
      room: 'Зал',
      banquets: 'Банкеты',
      visit: 'Как найти',
      call: 'Позвонить',
      directions: 'Маршрут',
      skip: 'К содержимому',
      mainLabel: 'Основная навигация',
      footerLabel: 'Навигация в подвале',
    },
    hero: {
      eyebrow: '1920 Avenue U · Бруклин',
      title: 'С огня —\nсразу на стол.',
      sub: 'Шашлык над углями, а потом сразу на деревянную доску — 1920 Avenue U, Бруклин.',
      ctaMenu: 'Посмотреть меню',
      ctaCall: 'Позвонить (718) 743-9656',
      scroll: 'Вниз',
      pause: 'Остановить видео',
      play: 'Включить видео',
      optionBTitle: 'Стол накрыт — добро пожаловать в Падишах.',
      optionBBody: 'Шашлык, самса, манты, свежие салаты и щедрые блюда, которыми хочется делиться.',
    },
    fire: {
      eyebrow: 'С мангала',
      title: 'Всё начинается с углей.',
      body: 'Рёбрышки ягнёнка, люля, печень и курица уходят на огонь, а потом сразу на деревянную доску — с красным луком, лимоном и зеленью. Этот короткий путь от мангала до стола и есть вся идея.',
      deckTitle: 'С огня — прямо к столу',
      deckBody:
        'Вкус Падишаха начинается с жара мангала, аромата дыма и блюд для общего стола. В меню — шашлык, рёбрышки ягнёнка, люля-кебаб, самса, манты, ачичук, супы, рыба и домашние гарниры.',
    },
    dishes: {
      eyebrow: 'На столе',
      title: 'За чем возвращаются.',
      body: 'Составлено по публичному меню ресторана.',
      cta: 'Открыть меню',
    },
    room: {
      eyebrow: 'Зал',
      title: 'Стол, за который поместятся все.',
      body: 'В июне 2026 года ресторан объявил об обновлении зала. Это зал и для ужина во вторник, и для вечера, когда стол всё растёт.',
      note: 'По вопросам зала и праздников позвоните в ресторан.',
      deckTitle: 'Обновлённый зал для семейных ужинов и больших компаний',
      deckBody: 'Ждём вас на Avenue U.',
      deckEventsDraft: 'Чтобы обсудить большой стол или праздник, позвоните нам.',
    },
    menuPreview: {
      eyebrow: 'Меню',
      title: 'Восемь разделов, сто сорок три блюда.',
      body: 'Спешелы, супы и салаты, холодные и горячие закуски, шашлык, рыба, гарниры, десерты и напитки — с ценами самого ресторана.',
    },
    ratings: {
      eyebrow: 'Публично',
      title: 'Что показывают площадки.',
      note: 'Публичные оценки на {date}. Они меняются — смотрите источник.',
    },
    visit: {
      eyebrow: 'Визит',
      title: 'Мы на Avenue U.',
      hoursLabel: 'Часы',
      hoursNote: 'Часы из публичного справочника — уточните по телефону.',
      addressLabel: 'Адрес',
      phoneLabel: 'Телефон',
      directions: 'Открыть в Google Maps',
      instagram: 'Instagram',
      order: 'Заказать онлайн',

      // Названия дней недели для ключей в данных о часах — подписи, не факты.
      days: {
        monday: 'Понедельник',
        tuesday: 'Вторник',
        wednesday: 'Среда',
        thursday: 'Четверг',
        friday: 'Пятница',
        saturday: 'Суббота',
        sunday: 'Воскресенье',
      },
    },
    menuPage: {
      title: 'Меню',
      lead: 'Собственное меню и цены ресторана — из его кассы Clover, 17 августа 2026.',

      observed: 'Снимок от {date} · источник: {source}',
      search: 'Поиск по блюдам',
      searchPlaceholder: 'шашлык, самса, салат…',
      empty: 'Ничего не нашлось. Попробуйте короче или позвоните в ресторан.',
      priceUnavailable: 'Цену уточняйте',
      all: 'Все',
      noteNameSuggested: 'Вариант написания',
      noteDescriptionPending: 'Описание не указано',
      notePossibleDuplicate: 'Встречается в листинге дважды',
      notePriceUnavailable: 'Цена не опубликована',
      notePendingOwner: 'Подробности по телефону',
      countLabel: 'блюд: {n}',
      showResearchPrices: 'Показать найденные цены ({date})',
      hideResearchPrices: 'Скрыть найденные цены',
      researchPriceNote: 'Цены с публичной страницы доставки на {date}.',
      researchPriceTag: 'Из исследования',

    },
    concierge: {
      open: 'Помочь выбрать',
      title: 'Чего хочется?',
      lead: 'Подбор идёт только по блюдам с этой страницы. Ничего сверх меню он не знает.',
      placeholder: 'баранина на четверых…',
      submit: 'Показать',
      refusal:
        'В данных меню нет такого ответа. Про халяль, аллергены, остроту и диеты может сказать только ресторан — позвоните: (718) 743-9656.',
      empty: 'В опубликованном меню совпадений нет. Попробуйте другое слово.',
      resultsLabel: 'Подобрано из меню',
    },
    footer: {
      langLabel: 'Язык',
      factsChecked: 'Данные проверены {date}.',
    },
    menuCategories: {
      specials: 'Специальные блюда',
      'soup-salads': 'Супы и салаты',
      'cold-appetizers': 'Холодные закуски',
      'hot-appetizers': 'Горячие закуски',
      'shish-kebabs': 'Шашлык',
      'fish-entrees': 'Рыбные блюда',
      'sides-misc': 'Гарниры',
      'dessert-drink': 'Десерты и напитки',
    },
  },
} as const;

export type CopyBundle = (typeof COPY)['en'];

export const fill = (s: string, vars: Record<string, string | number>) =>
  s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
