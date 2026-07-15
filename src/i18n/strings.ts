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
  categoriesLabel: string;
  categoriesHint: string;
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
  sourcesIntro: string;
  sourcesOfficialLabel: string;
  sourcesOfficialList: string;
  sourcesMediaLabel: string;
  sourcesMediaList: string;
  sourcesVerifiedNote: string;
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
  sectionReading: string;
  hideReadLabel: string;
  hideReadHint: string;
  clearReadLabel: string;
}

export const STRINGS: Record<Lang, UIStrings> = {
  cs: {
    appName: 'AIspresso',
    tagline: 'Novinky ze světa AI — stručně a ověřeně.',

    tabToday: 'Dnes',
    tabArchive: 'Archiv',
    tabSettings: 'Nastavení',

    brewMorning: 'Čerstvě uvařená',
    brewAfternoon: 'Ještě se dá',
    brewEvening: 'Dozrála k dokonalosti',
    gistLabel: 'Zristrettováno',
    todayEmptyTitle: 'Zatím žádný brief',
    todayEmptyBody: 'Dnešní přehled se ještě připravuje. Zkus to prosím později.',

    verified: 'Ověřeno',
    topStory: 'Hlavní zpráva',
    sourcesLabel: 'Zdroje',
    allCategories: 'Vše',
    sampleBadge: 'Ukázka',
    sampleNote:
      'Toto je ukázkový obsah pro fázi 1. Skutečný denní přehled bude automaticky sestavovat AI ve fázi 2.',

    archiveTitle: 'Archiv',
    archiveSubtitle: 'Všechny dosavadní briefy',
    archiveEmpty: 'Archiv je zatím prázdný.',

    settingsTitle: 'Nastavení',
    sectionLanguage: 'Jazyk',
    sectionAppearance: 'Vzhled',
    categoriesLabel: 'Filtry kategorií',
    categoriesHint: 'Zobrazit v přehledu lištu s filtrováním podle kategorií.',
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
    sourcesIntro:
      'Brief vzniká z pevného okruhu ověřených zdrojů. Agregátory a neznámé weby se jako zdroj nikdy necitují.',
    sourcesOfficialLabel: 'Oficiální',
    sourcesOfficialList:
      'Anthropic · OpenAI · Google & DeepMind · Microsoft · NVIDIA · Meta AI · Hugging Face · Mistral',
    sourcesMediaLabel: 'Média',
    sourcesMediaList:
      'Reuters · AP · Bloomberg · The Verge · Ars Technica · TechCrunch · Axios · Wired · The Register · MIT Technology Review · CNBC',
    sourcesVerifiedNote:
      'Zelené „Ověřeno“ znamená potvrzení nejméně dvěma nezávislými zdroji.',
    sectionReleaseNotes: 'Poznámky k aktualizaci',
    releaseAddedLabel: 'Přidáno',
    releaseImprovedLabel: 'Vylepšeno',
    releaseFixedLabel: 'Opraveno',
    releaseAdded: [
      'Rešerše čerpá z pevného okruhu důvěryhodných zdrojů (RSS kanály a cílené vyhledávání)',
      'Širší okruh zdrojů — AP, Bloomberg, NVIDIA, Meta AI, Hugging Face a Mistral',
      'Nadpis se mění podle denní doby — ráno čerstvě uvařeno, večer už káva chladne',
      'Sekce Zdroje a Poznámky k aktualizaci v Nastavení',
    ],
    releaseImproved: [
      'Vyváženější výběr — přednost mají novinky, které si můžeš vyzkoušet; v nabitý den až 10 zpráv',
      'Lišta při rolování ukazuje datum a čas poslední aktualizace',
      'Nový brief doputuje do appky do minuty po vydání',
      'Agregátory se už nikdy neobjeví mezi zdroji zpráv',
    ],
    releaseFixed: [
      'Čas „Aktualizováno“ ukazoval pořád 5:00',
      'Připnutá appka na iPhonu se sama neaktualizovala na novou verzi',
      'Ikona archivu byla vyšší než ostatní ikony v liště',
    ],
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
    sectionReading: 'Čtení',
    hideReadLabel: 'Skrýt přečtené',
    hideReadHint: 'Přečtené zprávy se nebudou zobrazovat v přehledu.',
    clearReadLabel: 'Označit vše jako nepřečtené',
  },
  en: {
    appName: 'AIspresso',
    tagline: 'The world of AI — brief and verified.',

    tabToday: 'Today',
    tabArchive: 'Archive',
    tabSettings: 'Settings',

    brewMorning: 'Freshly brewed',
    brewAfternoon: 'Still drinkable',
    brewEvening: 'Aged to perfection',
    gistLabel: 'Ristrettified',
    todayEmptyTitle: 'No brief yet',
    todayEmptyBody: "Today's brief is still being prepared. Please check back later.",

    verified: 'Verified',
    topStory: 'Top story',
    sourcesLabel: 'Sources',
    allCategories: 'All',
    sampleBadge: 'Sample',
    sampleNote:
      'This is sample content for Phase 1. The real daily brief will be assembled automatically by AI in Phase 2.',

    archiveTitle: 'Archive',
    archiveSubtitle: 'Every brief so far',
    archiveEmpty: 'The archive is still empty.',

    settingsTitle: 'Settings',
    sectionLanguage: 'Language',
    sectionAppearance: 'Appearance',
    categoriesLabel: 'Category filters',
    categoriesHint: 'Show the category filter bar in the brief.',
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
    sourcesIntro:
      'The brief is built from a fixed circle of vetted sources. Aggregators and unknown sites are never cited as sources.',
    sourcesOfficialLabel: 'Official',
    sourcesOfficialList:
      'Anthropic · OpenAI · Google & DeepMind · Microsoft · NVIDIA · Meta AI · Hugging Face · Mistral',
    sourcesMediaLabel: 'Media',
    sourcesMediaList:
      'Reuters · AP · Bloomberg · The Verge · Ars Technica · TechCrunch · Axios · Wired · The Register · MIT Technology Review · CNBC',
    sourcesVerifiedNote:
      'The green “Verified” badge means confirmation by at least two independent sources.',
    sectionReleaseNotes: 'Release notes',
    releaseAddedLabel: 'Added',
    releaseImprovedLabel: 'Improved',
    releaseFixedLabel: 'Fixed',
    releaseAdded: [
      'Research draws on a fixed circle of trusted sources (RSS feeds and targeted search)',
      'A wider circle of sources — AP, Bloomberg, NVIDIA, Meta AI, Hugging Face and Mistral',
      'The title changes with the time of day — freshly brewed at dawn, cooling by evening',
      'Sources and Release notes sections in Settings',
    ],
    releaseImproved: [
      'Better-balanced selection — hands-on news comes first, with up to 10 stories on busy days',
      'The bar shown while scrolling displays the date and last-update time',
      'A new brief reaches the app within a minute of publishing',
      'Aggregators can no longer appear among story sources',
    ],
    releaseFixed: [
      'The “Updated” time was stuck at 5:00',
      "The pinned iPhone app wasn't picking up new versions on its own",
      'The archive icon was taller than its tab-bar neighbours',
    ],
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
    sectionReading: 'Reading',
    hideReadLabel: 'Hide read items',
    hideReadHint: "Read stories won't appear in the brief.",
    clearReadLabel: 'Mark all as unread',
  },
};
