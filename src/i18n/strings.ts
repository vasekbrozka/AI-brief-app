import type { Lang } from '../lib/types';

export interface UIStrings {
  appName: string;
  tagline: string;

  // Tab bar
  tabToday: string;
  tabArchive: string;
  tabSettings: string;

  // Today — time-of-day "brew freshness" title (Barista voice)
  brewFresh: string;
  brewWarm: string;
  brewCooling: string;
  brewCold: string;
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

    brewFresh: 'Čerstvě uvařeno',
    brewWarm: 'Pořád svěží',
    brewCooling: 'Zašla by dolívka',
    brewCold: 'Radši uvař novou',
    gistLabel: 'Ve zkratce',
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
      'Každé ráno, ještě než vstaneš, projde AIspresso dění ve světě AI za posledních 24 hodin. Z desítek zpráv vybere jen těch pár, které opravdu stojí za tvůj čas. Každou porovná s více nezávislými zdroji. Co ověřit nejde, poctivě označí. Když se zrovna nic zajímavého neděje, uvidíš méně obsahu. Výsledek na tebe čeká u ranní kávy.',
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

    brewFresh: 'Fresh from the pot',
    brewWarm: 'Still going strong',
    brewCooling: 'Could use a refill',
    brewCold: 'Better brew a fresh one',
    gistLabel: 'The gist',
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
      "Every morning, before you get up, AIspresso reviews the last 24 hours in the world of AI. Out of dozens of stories, it picks only the few that are truly worth your time. It cross-checks each one against multiple independent sources. Whatever can't be verified, it labels honestly. When nothing much is happening, you'll simply see less. The result is waiting for you with your morning coffee.",
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
