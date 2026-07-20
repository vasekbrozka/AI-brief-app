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
  ritualDone: string;
  sectionReading: string;
  hideReadLabel: string;
  hideReadHint: string;
  clearReadLabel: string;
  gamifyLabel: string;
  gamifyHint: string;
  gamifyCurrentLabel: string;

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
      'Sdílení novinky — přejeď kartu do strany a klepni na Sdílet',
      'Novinky na sebe navazují — u pokračování uvidíš „Navazuje na…“',
      'Série čtení s malou odměnou, když dočteš celý brief (jde vypnout)',
      'Skrytí kategorií, které tě nezajímají — v Nastavení',
      'Archiv teď drží celý poslední týden',
    ],
    releaseImproved: [
      'Značka „ověřeno“ je teď decentní ikonka na řádku se zdroji',
    ],
    releaseFixed: [],
    aboutTagline: 'Novinky ze světa AI',
    versionLabel: 'Verze',
    modelLabel: 'Shrnutí připravuje',
    modelName: 'Claude (Anthropic)',
    signature: 'Autor: Václav Brožka',

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
    ritualDone: 'Došlo ti to ☕️',
    sectionReading: 'Čtení',
    hideReadLabel: 'Skrýt přečtené',
    hideReadHint: 'Přečtené zprávy se nebudou zobrazovat v přehledu.',
    clearReadLabel: 'Označit vše jako nepřečtené',
    gamifyLabel: 'Série čtení',
    gamifyHint: 'Malá odměna na konci, když dočteš celý dnešní brief.',
    gamifyCurrentLabel: 'Aktuální série',

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
      'Share a story — swipe the card aside and tap Share',
      'Stories now link to their earlier updates — “Follows up on …”',
      'A reading streak with a small reward when you finish the brief (optional)',
      "Hide categories you don't care about — in Settings",
      'The archive now keeps the whole past week',
    ],
    releaseImproved: [
      'The “verified” mark is now a subtle icon on the sources line',
    ],
    releaseFixed: [],
    aboutTagline: 'The world of AI',
    versionLabel: 'Version',
    modelLabel: 'Summaries by',
    modelName: 'Claude (Anthropic)',
    signature: 'By Václav Brožka',

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
    ritualDone: 'Sipped to the last drop ☕️',
    sectionReading: 'Reading',
    hideReadLabel: 'Hide read items',
    hideReadHint: "Read stories won't appear in the brief.",
    clearReadLabel: 'Mark all as unread',
    gamifyLabel: 'Reading streak',
    gamifyHint: "A small reward at the end when you finish today's brief.",
    gamifyCurrentLabel: 'Current streak',

    sectionNotifications: 'Notifications',
    notifyLabel: 'Morning alert',
    notifyHint: 'One notification a day, as soon as the fresh brief is ready.',
    notifyUnsupported: 'Available once the app is added to your iPhone Home Screen.',
  },
};
