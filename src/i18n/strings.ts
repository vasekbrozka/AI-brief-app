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
  gistLabel: string;
  todayEmptyTitle: string;
  todayEmptyBody: string;

  // Brief / items
  verified: string;
  topStory: string;
  sourcesLabel: string;
  shareLabel: string;
  threadLabel: string;
  allCategories: string;
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
  categoriesLabel: string;
  categoriesHint: string;
  categoriesShownLabel: string;
  categoriesShownHint: string;
  sectionInstall: string;
  sectionHowItWorks: string;
  sectionAbout: string;
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
    gistLabel: 'Zristrettováno',
    todayEmptyTitle: 'Zatím žádný brief',
    todayEmptyBody: 'Dnešní přehled se ještě připravuje. Zkus to prosím později.',

    verified: 'Ověřeno',
    topStory: 'Hlavní zpráva',
    sourcesLabel: 'Zdroje',
    shareLabel: 'Sdílet',
    threadLabel: 'Navazuje na',
    allCategories: 'Vše',
    sampleBadge: 'Ukázka',
    sampleNote:
      'Toto je ukázkový obsah pro fázi 1. Skutečný denní přehled bude automaticky sestavovat AI ve fázi 2.',

    archiveTitle: 'Archiv',
    archiveSubtitle: 'Poslední týden',
    archiveEmpty: 'Archiv je zatím prázdný.',

    settingsTitle: 'Nastavení',
    sectionLanguage: 'Jazyk',
    sectionAppearance: 'Vzhled',
    sectionCategories: 'Kategorie',
    categoriesLabel: 'Filtry kategorií',
    categoriesHint: 'Zobrazit v přehledu lištu s filtrováním podle kategorií.',
    categoriesShownLabel: 'Zobrazené kategorie',
    categoriesShownHint: 'Vypnuté kategorie se v přehledu nezobrazí. Hlavní zpráva zůstává vždy.',
    sectionInstall: 'Přidat na plochu',
    sectionHowItWorks: 'Jak to funguje',
    sectionAbout: 'O aplikaci',
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
      'Každé ráno, ještě než vstaneš, projde AIspresso dění ve světě AI za posledních 24 hodin. Čerpá přitom z pevného okruhu důvěryhodných zdrojů — oficiálních blogů AI firem a předních médií, přes jejich RSS kanály a cílené vyhledávání. Z desítek zpráv vybere jen těch pár, které opravdu stojí za tvůj čas. Každou porovná s více nezávislými zdroji. Co ověřit nejde, poctivě označí. Když se zrovna nic zajímavého neděje, uvidíš méně obsahu. Výsledek na tebe čeká u ranní kávy.',
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
      'Ťukni na odborný pojem v přehledu a hned se ukáže prosté vysvětlení',
      'Série čtení nově jako týdenní návyk — řetěz dnů, dnešek se plní, jak čteš',
      'Oslava při dočtení a barva, která houstne s délkou série',
    ],
    releaseImproved: [
      'Přečtené novinky se nově skrývají hned od začátku — víc prostoru pro sérii (kdykoli lze vypnout v Nastavení)',
      'Podpora projektu decentně v sekci O aplikaci',
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
    gistLabel: 'Ristrettified',
    todayEmptyTitle: 'No brief yet',
    todayEmptyBody: "Today's brief is still being prepared. Please check back later.",

    verified: 'Verified',
    topStory: 'Top story',
    sourcesLabel: 'Sources',
    shareLabel: 'Share',
    threadLabel: 'Follows up on',
    allCategories: 'All',
    sampleBadge: 'Sample',
    sampleNote:
      'This is sample content for Phase 1. The real daily brief will be assembled automatically by AI in Phase 2.',

    archiveTitle: 'Archive',
    archiveSubtitle: 'The past week',
    archiveEmpty: 'The archive is still empty.',

    settingsTitle: 'Settings',
    sectionLanguage: 'Language',
    sectionAppearance: 'Appearance',
    sectionCategories: 'Categories',
    categoriesLabel: 'Category filters',
    categoriesHint: 'Show the category filter bar in the brief.',
    categoriesShownLabel: 'Shown categories',
    categoriesShownHint: "Muted categories won't appear in the brief. The top story always stays.",
    sectionInstall: 'Add to Home Screen',
    sectionHowItWorks: 'How it works',
    sectionAbout: 'About',
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
      "Every morning, before you get up, AIspresso reviews the last 24 hours in the world of AI. It draws on a fixed circle of trusted sources — official AI company blogs and leading media outlets, via their RSS feeds and targeted search. Out of dozens of stories, it picks only the few that are truly worth your time. It cross-checks each one against multiple independent sources. Whatever can't be verified, it labels honestly. When nothing much is happening, you'll simply see less. The result is waiting for you with your morning coffee.",
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
      'Tap a technical term in the brief for a plain-language explanation',
      'Reading streak reimagined as a weekly habit — a chain of days that fills as you read',
      'A celebration when you finish, and a colour that deepens with your streak',
    ],
    releaseImproved: [
      'Read items are now hidden from the start — more room for the streak (can be turned off in Settings)',
      'A quiet way to support the project in the About section',
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
