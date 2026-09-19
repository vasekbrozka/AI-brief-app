import type { Lang } from '../lib/types';

export interface UIStrings {
  appName: string;
  tagline: string;

  // Tab bar
  tabToday: string;
  tabArchive: string;
  tabSettings: string;

  // Today — time-of-day "brew freshness" title
  brewMorning: string;
  brewAfternoon: string;
  brewEvening: string;
  todayEmptyTitle: string;
  todayEmptyBody: string;

  // Brief / items
  verified: string;
  topStory: string;
  sourcesLabel: string;
  shareLabel: string;
  saveLabel: string;
  removeLabel: string;
  savedToast: string;
  unsavedToast: string;
  savedTitle: string;
  savedEmpty: string;
  savedEmptyBody: string;
  threadLabel: string;
  /** Label above the "why it matters" block on a story card. */
  whyLabel: string;
  /** Same block on a tip card — there it reads as a how-to. */
  howToTryLabel: string;
  /** Badge marking a tip (try-it-yourself feature) in the brief. */
  tipBadge: string;
  /** Section title for the upcoming-dates list. */
  radarTitle: string;
  /** Tag on a radar row whose date is reported but not confirmed. */
  radarTentative: string;
  /** Section title for the Sunday week-in-review list. */
  weekTitle: string;
  /** Button under the brief that shares the whole day as text. */
  shareBriefLabel: string;
  shareBriefArchiveLabel: string;
  /** Shown in Today when the newest brief is older than today (generation late or failed). */
  staleTitle: string;
  /** Followed by the brief's date, e.g. "… z 19. září". */
  staleBody: string;

  // After the reading: daily quiz, try-it checklist, term of the day
  quizTitle: string;
  quizNext: string;
  quizShowResult: string;
  quizRetry: string;
  quizCorrect: string;
  quizWrong: string;
  /** Result titles for 0, 1, 2 and 3 correct answers. */
  quizResultTitles: string[];
  tryTitle: string;
  tryHint: string;
  tryAll: string;
  tryDone: string;
  tryAllDone: string;
  tryEmpty: string;
  tryTriedSection: string;
  termTitle: string;
  termNext: string;
  /** Thumbs row under a story: "Useful?" → "Thanks". */
  voteLabel: string;
  voteThanks: string;
  voteUp: string;
  voteDown: string;
  /** Thumbs for the whole day at the end of the brief. */
  rateTodayLabel: string;
  rateBriefLabel: string;
  sampleBadge: string;
  sampleNote: string;

  // Archive
  archiveTitle: string;
  archiveSubtitle: string;
  archiveEmpty: string;

  // Settings
  settingsTitle: string;
  sectionLanguage: string;
  sectionAppearance: string;
  sectionCategories: string;
  categoriesShownHint: string;
  sectionInstall: string;
  sectionHowItWorks: string;
  sectionAbout: string;
  aboutRowHint: string;
  themeAuto: string;
  themeLight: string;
  themeDark: string;
  installIntro: string;
  installSteps: string[];
  installShareHint: string;
  howItWorksParagraphs: string[];
  sectionSources: string;
  sourcesOfficialLabel: string;
  sourcesOfficialList: string;
  sourcesMediaLabel: string;
  sourcesMediaList: string;
  sectionReleaseNotes: string;
  releaseAddedLabel: string;
  releaseImprovedLabel: string;
  releaseFixedLabel: string;
  releaseAdded: string[];
  releaseImproved: string[];
  releaseFixed: string[];
  aboutTagline: string;
  versionLabel: string;
  modelLabel: string;
  modelName: string;
  signature: string;
  supportText: string;
  supportCta: string;

  // Common
  loading: string;
  errorTitle: string;
  errorBody: string;
  retry: string;
  updatedLabel: string;
  back: string;

  // Reading
  read: string;
  markRead: string;
  markUnread: string;
  allCaughtUp: string;
  /** Section label shown above the reading-streak card in the brief. */
  streakSectionLabel: string;
  /** Streak-tier titles for the finished-brief ritual, mildest first. */
  streakLevels: string[];
  streakStart: string;
  streakTodayLeft: string;
  sectionReading: string;
  hideReadLabel: string;
  hideReadHint: string;
  clearReadLabel: string;
  gamifyLabel: string;
  gamifyHint: string;
  gamifyCurrentLabel: string;
  glossaryLabel: string;
  glossaryHint: string;

  // Notifications
  sectionNotifications: string;
  notifyLabel: string;
  notifyHint: string;
  notifyUnsupported: string;
}

export const STRINGS: Record<Lang, UIStrings> = {
  cs: {
    appName: 'AIspresso',
    tagline: 'Novinky ze světa AI — stručně a ověřeně.',

    tabToday: 'Dnes',
    tabArchive: 'Archiv',
    tabSettings: 'Nastavení',

    brewMorning: 'Ranní shot',
    brewAfternoon: 'Odpolední sedlina',
    brewEvening: 'Večerní výplach',
    todayEmptyTitle: 'Zatím žádný brief',
    todayEmptyBody: 'Dnešní přehled se ještě připravuje. Zkus to prosím později.',

    verified: 'Ověřeno',
    topStory: 'Hlavní zpráva',
    sourcesLabel: 'Zdroje',
    shareLabel: 'Sdílet',
    saveLabel: 'Uložit',
    removeLabel: 'Odebrat',
    savedToast: 'Uloženo ☕️',
    unsavedToast: 'Odebráno',
    savedTitle: 'Uložené',
    savedEmpty: 'Zatím nic uloženého',
    savedEmptyBody: 'Táhni novinku doprava a nech si ji na později.',
    threadLabel: 'Navazuje na',
    whyLabel: 'Proč na tom záleží',
    howToTryLabel: 'Jak to vyzkoušet',
    tipBadge: 'Vyzkoušej',
    radarTitle: 'Na obzoru',
    radarTentative: 'podle zpráv',
    weekTitle: 'Týden v AI',
    shareBriefLabel: 'Sdílet dnešní přehled',
    shareBriefArchiveLabel: 'Sdílet přehled',
    staleTitle: 'Dnešní přehled se ještě připravuje.',
    staleBody: 'Zobrazujeme poslední dostupný přehled z',

    quizTitle: 'Kvíz dne',
    quizNext: 'Další otázka',
    quizShowResult: 'Vyhodnotit',
    quizRetry: 'Zkusit znovu',
    quizCorrect: 'Správně!',
    quizWrong: 'Vedle.',
    quizResultTitles: ['Zítra to půjde líp', 'Slabší odvar', 'Dobré espresso', 'Dokonalý shot'],
    tryTitle: 'Vyzkoušej si',
    tryHint: 'Funkce z posledních týdnů, které stojí za zkoušku. Odškrtni, co máš za sebou.',
    tryAll: 'Všechny tipy',
    tryDone: 'Vyzkoušeno',
    tryAllDone: 'Všechno vyzkoušeno ☕️',
    tryEmpty: 'Zatím žádné tipy z posledních týdnů.',
    tryTriedSection: 'Máš za sebou',
    termTitle: 'Pojem dne',
    termNext: 'Další pojem',
    voteLabel: 'Bylo to přínosné?',
    voteThanks: 'Díky, počítá se.',
    voteUp: 'Přínosné',
    voteDown: 'Nepřínosné',
    rateTodayLabel: 'Jak se ti dnešní přehled líbil?',
    rateBriefLabel: 'Jak se ti tento přehled líbil?',
    sampleBadge: 'Ukázka',
    sampleNote:
      'Toto je ukázkový obsah pro fázi 1. Skutečný denní přehled bude automaticky sestavovat AI ve fázi 2.',

    archiveTitle: 'Archiv',
    archiveSubtitle: 'Poslední dva týdny',
    archiveEmpty: 'Archiv je zatím prázdný.',

    settingsTitle: 'Nastavení',
    sectionLanguage: 'Jazyk',
    sectionAppearance: 'Vzhled',
    sectionCategories: 'Kategorie',
    categoriesShownHint: 'Vypnuté kategorie se v přehledu nezobrazí. Hlavní zpráva zůstává vždy.',
    sectionInstall: 'Přidat na plochu',
    sectionHowItWorks: 'Jak to funguje',
    sectionAbout: 'O aplikaci',
    aboutRowHint: 'Jak to funguje, zdroje, novinky a podpora',
    themeAuto: 'Automaticky',
    themeLight: 'Světlý',
    themeDark: 'Tmavý',
    installIntro:
      'Přidej si appku na plochu iPhonu, ať se otevírá na celou obrazovku jako běžná aplikace.',
    installSteps: [
      'V Safari klepni na ikonu Sdílet (čtvereček se šipkou nahoru).',
      'Vyber „Přidat na plochu“.',
      'Potvrď „Přidat“ — hotovo, ikona je na ploše.',
    ],
    installShareHint: 'Funguje pouze v Safari na iPhonu nebo iPadu.',
    howItWorksParagraphs: [
      'Každé ráno, ještě než vstaneš, projde AIspresso dění ve světě AI za poslední dny. Čerpá přitom z pevného okruhu důvěryhodných zdrojů — oficiálních blogů AI firem a předních médií. Z desítek zpráv vybere ty, které opravdu stojí za tvůj čas, u každé ověří datum i zdroj a napíše, proč se tě týká. Co ověřit nejde, poctivě označí. K tomu přidá funkce, které si můžeš hned vyzkoušet, a termíny, které se blíží. Palcem nahoru nebo dolů mu řekneš, co bylo přínosné — ukládá se jen počítadlo, nic o tobě. Výsledek na tebe čeká u ranní kávy.',
    ],
    sectionSources: 'Zdroje',
    sourcesOfficialLabel: 'Oficiální',
    sourcesOfficialList:
      'Anthropic · OpenAI · Google & DeepMind · Microsoft · NVIDIA · Meta AI · Hugging Face · Mistral',
    sourcesMediaLabel: 'Média',
    sourcesMediaList:
      'Reuters · AP · Bloomberg · The Verge · Ars Technica · TechCrunch · Axios · Wired · The Register · MIT Technology Review · CNBC',
    sectionReleaseNotes: 'Poznámky k aktualizaci',
    releaseAddedLabel: 'Přidáno',
    releaseImprovedLabel: 'Vylepšeno',
    releaseFixedLabel: 'Opraveno',
    releaseAdded: [
      '„Proč na tom záleží“ — u každé novinky věta dvě o tom, co z ní plyne pro tebe',
      '„Na obzoru“ — termíny, které se blíží: vydání, konference, lhůty a soudy',
      'Tipy k vyzkoušení mají štítek Vyzkoušej a návod, kde funkci najdeš',
      'Datum události u každé novinky, ať víš, jestli jde o včerejšek nebo minulý týden',
      '„Týden v AI“ — nedělní ohlédnutí za událostmi týdne s odkazy do archivu',
      '„Kvíz dne“ — tři otázky z dnešního přehledu, ať se čtení uloží',
      '„Vyzkoušej si“ — checklist funkcí z posledních týdnů, odškrtávej, co jsi zkusil',
      '„Pojem dne“ ze slovníčku',
      'Sdílení celého přehledu jedním ťuknutím',
      'Palec nahoru nebo dolů u každé novinky i u celého dne — anonymně, jen počítadlo, a vidíš, jak hlasují ostatní; generátor podle toho ladí výběr',
    ],
    releaseImproved: [
      'Archiv drží dva týdny místo jednoho a odkazy „Navazuje na“ tak fungují déle',
      'Přísnější ověřování: Ověřeno znamená oficiální zdroj, nebo dvě nezávislá média',
      'Úvodní odstavec pod nadpisem je pryč, přehled začíná rovnou kartami',
      'Sdílení novinky přibalí i větu, proč na ní záleží',
      'Ranní upozornění nese titulek dne a počet novinek',
      'Když ranní přehled ještě není hotový, appka to řekne místo tichého zobrazení včerejška',
    ],
    releaseFixed: [],
    aboutTagline: 'Novinky ze světa AI',
    versionLabel: 'Verze',
    modelLabel: 'Shrnutí připravuje',
    modelName: 'Claude (Anthropic)',
    signature: 'Autor: Václav Brožka',
    supportText:
      'AIspresso je a zůstane zdarma, bez reklam. Jestli ti ranní shot dělá dny hezčí, můžeš mi symbolicky koupit kafe.',
    supportCta: 'Buy me a coffee',

    loading: 'Načítám…',
    errorTitle: 'Něco se nepovedlo',
    errorBody: 'Brief se nepodařilo načíst. Zkontroluj připojení a zkus to znovu.',
    retry: 'Zkusit znovu',
    updatedLabel: 'Aktualizováno',
    back: 'Zpět',

    read: 'Přečteno',
    markRead: 'Označit jako přečtené',
    markUnread: 'Označit jako nepřečtené',
    allCaughtUp: 'Vše přečteno',
    streakSectionLabel: 'Série čtení',
    streakLevels: [
      'Jen na skok',
      'Lehká závislost',
      'Třese se, ale čte',
      'Bez dávky nefunguje',
      'Tlak 180. Přehled 100 %.',
    ],
    streakStart: 'Dočti dnešní brief a nastartuj sérii',
    streakTodayLeft: 'Ještě dnešek, ať série žije',
    sectionReading: 'Čtení',
    hideReadLabel: 'Skrýt přečtené',
    hideReadHint: 'Přečtené zprávy se nebudou zobrazovat v přehledu.',
    clearReadLabel: 'Označit vše jako nepřečtené',
    gamifyLabel: 'Série čtení',
    gamifyHint: 'Týdenní série — dnešek se plní, jak čteš, a dočtený den drží sérii.',
    gamifyCurrentLabel: 'Aktuální série',
    glossaryLabel: 'Vysvětlivky pojmů',
    glossaryHint: 'Odborné pojmy v přehledu podtrhneme — ťuknutím zobrazíš prosté vysvětlení.',

    sectionNotifications: 'Upozornění',
    notifyLabel: 'Ranní upozornění',
    notifyHint: 'Jedna notifikace denně, jakmile je čerstvý brief hotový.',
    notifyUnsupported: 'Dostupné po přidání aplikace na plochu iPhonu.',
  },
  en: {
    appName: 'AIspresso',
    tagline: 'The world of AI — brief and verified.',

    tabToday: 'Today',
    tabArchive: 'Archive',
    tabSettings: 'Settings',

    brewMorning: 'Morning Shot',
    brewAfternoon: 'Afternoon Grounds',
    brewEvening: 'Evening Rinse',
    todayEmptyTitle: 'No brief yet',
    todayEmptyBody: "Today's brief is still being prepared. Please check back later.",

    verified: 'Verified',
    topStory: 'Top story',
    sourcesLabel: 'Sources',
    shareLabel: 'Share',
    saveLabel: 'Save',
    removeLabel: 'Remove',
    savedToast: 'Saved ☕️',
    unsavedToast: 'Removed',
    savedTitle: 'Saved',
    savedEmpty: 'Nothing saved yet',
    savedEmptyBody: 'Swipe a story right to keep it for later.',
    threadLabel: 'Follows up on',
    whyLabel: 'Why it matters',
    howToTryLabel: 'How to try it',
    tipBadge: 'Try it',
    radarTitle: 'On the radar',
    radarTentative: 'reported',
    weekTitle: 'The week in AI',
    shareBriefLabel: "Share today's brief",
    shareBriefArchiveLabel: 'Share this brief',
    staleTitle: "Today's brief is still being prepared.",
    staleBody: 'Showing the latest available brief from',

    quizTitle: 'Daily quiz',
    quizNext: 'Next question',
    quizShowResult: 'See result',
    quizRetry: 'Try again',
    quizCorrect: 'Correct!',
    quizWrong: 'Not quite.',
    quizResultTitles: ['Better luck tomorrow', 'A weak brew', 'A solid espresso', 'A perfect shot'],
    tryTitle: 'Try it yourself',
    tryHint: 'Features from recent weeks worth a try. Tick off what you have done.',
    tryAll: 'All tips',
    tryDone: 'Tried',
    tryAllDone: 'All tried ☕️',
    tryEmpty: 'No tips from the last few weeks yet.',
    tryTriedSection: 'Already tried',
    termTitle: 'Term of the day',
    termNext: 'Another term',
    voteLabel: 'Was this useful?',
    voteThanks: 'Thanks, noted.',
    voteUp: 'Useful',
    voteDown: 'Not useful',
    rateTodayLabel: "How was today's brief?",
    rateBriefLabel: 'How was this brief?',
    sampleBadge: 'Sample',
    sampleNote:
      'This is sample content for Phase 1. The real daily brief will be assembled automatically by AI in Phase 2.',

    archiveTitle: 'Archive',
    archiveSubtitle: 'The past two weeks',
    archiveEmpty: 'The archive is still empty.',

    settingsTitle: 'Settings',
    sectionLanguage: 'Language',
    sectionAppearance: 'Appearance',
    sectionCategories: 'Categories',
    categoriesShownHint: "Muted categories won't appear in the brief. The top story always stays.",
    sectionInstall: 'Add to Home Screen',
    sectionHowItWorks: 'How it works',
    sectionAbout: 'About',
    aboutRowHint: 'How it works, sources, what\'s new and support',
    themeAuto: 'Automatic',
    themeLight: 'Light',
    themeDark: 'Dark',
    installIntro:
      'Add the app to your iPhone Home Screen so it opens full-screen, just like a native app.',
    installSteps: [
      'In Safari, tap the Share icon (the square with an up arrow).',
      'Choose "Add to Home Screen".',
      'Confirm "Add" — done, the icon is on your Home Screen.',
    ],
    installShareHint: 'Works only in Safari on iPhone or iPad.',
    howItWorksParagraphs: [
      "Every morning, before you get up, AIspresso reviews the past few days in the world of AI. It draws on a fixed circle of trusted sources — official AI company blogs and leading media outlets. Out of dozens of stories it picks the ones truly worth your time, checks the date and the source of each, and says why it matters to you. Whatever can't be verified, it labels honestly. On top it adds features you can try right away and the dates coming up. A thumbs up or down tells it what was useful — only a counter is stored, nothing about you. The result is waiting for you with your morning coffee.",
    ],
    sectionSources: 'Sources',
    sourcesOfficialLabel: 'Official',
    sourcesOfficialList:
      'Anthropic · OpenAI · Google & DeepMind · Microsoft · NVIDIA · Meta AI · Hugging Face · Mistral',
    sourcesMediaLabel: 'Media',
    sourcesMediaList:
      'Reuters · AP · Bloomberg · The Verge · Ars Technica · TechCrunch · Axios · Wired · The Register · MIT Technology Review · CNBC',
    sectionReleaseNotes: 'Release notes',
    releaseAddedLabel: 'Added',
    releaseImprovedLabel: 'Improved',
    releaseFixedLabel: 'Fixed',
    releaseAdded: [
      '"Why it matters" — a sentence or two under every story on what it means for you',
      '"On the radar" — dates coming up: launches, conferences, deadlines and hearings',
      'Tips you can try carry a Try it badge and a note on where to find the feature',
      'The event date on every story, so you know whether it happened yesterday or last week',
      '"The week in AI" — a Sunday look back at the week\'s key stories, linked into the archive',
      '"Daily quiz" — three questions on today\'s brief, so the reading sticks',
      '"Try it yourself" — a checklist of recent features; tick off what you have tried',
      '"Term of the day" from the glossary',
      'Share the whole brief with one tap',
      'Thumbs up or down on every story and on the whole day — anonymous, just a counter, and you see how others voted; the generator tunes its picks by it',
    ],
    releaseImproved: [
      'The archive keeps two weeks instead of one, so "Follows up on" links work longer',
      'Stricter verification: Verified means an official source, or two independent outlets',
      'The lead-in paragraph under the title is gone; the brief starts with the cards',
      'Sharing a story now includes the why-it-matters line',
      'The morning notification carries the headline of the day and the story count',
      "When the morning brief isn't ready yet, the app says so instead of quietly showing yesterday",
    ],
    releaseFixed: [],
    aboutTagline: 'The world of AI',
    versionLabel: 'Version',
    modelLabel: 'Summaries by',
    modelName: 'Claude (Anthropic)',
    signature: 'By Václav Brožka',
    supportText:
      'AIspresso is free and stays that way — no ads. If the morning shot makes your days a little better, you can buy me a coffee.',
    supportCta: 'Buy me a coffee',

    loading: 'Loading…',
    errorTitle: 'Something went wrong',
    errorBody: "Couldn't load the brief. Check your connection and try again.",
    retry: 'Try again',
    updatedLabel: 'Updated',
    back: 'Back',

    read: 'Read',
    markRead: 'Mark as read',
    markUnread: 'Mark as unread',
    allCaughtUp: 'All caught up',
    streakSectionLabel: 'Reading streak',
    streakLevels: [
      'Just One Quick Shot',
      'Mildly Addicted',
      'Shaking, Still Reading',
      'Can’t Function Without a Shot',
      'Blood Pressure: 180. Fully Briefed.',
    ],
    streakStart: "Finish today's brief to start a streak",
    streakTodayLeft: 'Finish today to keep the streak alive',
    sectionReading: 'Reading',
    hideReadLabel: 'Hide read items',
    hideReadHint: "Read stories won't appear in the brief.",
    clearReadLabel: 'Mark all as unread',
    gamifyLabel: 'Reading streak',
    gamifyHint: 'A weekly streak — today fills as you read, and finishing the day keeps it alive.',
    gamifyCurrentLabel: 'Current streak',
    glossaryLabel: 'Term explanations',
    glossaryHint: 'We underline technical terms in the brief — tap one for a plain explanation.',

    sectionNotifications: 'Notifications',
    notifyLabel: 'Morning alert',
    notifyHint: 'One notification a day, as soon as the fresh brief is ready.',
    notifyUnsupported: 'Available once the app is added to your iPhone Home Screen.',
  },
};
