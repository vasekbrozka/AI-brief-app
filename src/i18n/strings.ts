import type { Lang } from '../lib/types';

export interface UIStrings {
  appName: string;
  tagline: string;

  // Tab bar
  tabToday: string;
  tabArchive: string;
  tabSettings: string;

  // Today
  todayTitle: string;
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
  sectionInstall: string;
  sectionHowItWorks: string;
  sectionAbout: string;
  themeAuto: string;
  themeLight: string;
  themeDark: string;
  installIntro: string;
  installSteps: string[];
  installShareHint: string;
  howItWorksBody: string;
  aboutBody: string;
  versionLabel: string;
  phaseLabel: string;

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

    todayTitle: 'Čerstvě uvařeno',
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
    howItWorksBody:
      'Každý den AI projde nejdůležitější zdroje o umělé inteligenci, ověří je napříč více zdroji a sestaví z nich krátký, přehledný brief. Ty ho najdeš na jednom místě — bez šumu a bez scrollování.',
    aboutBody:
      'Osobní čtečka denního AI přehledu. Postaveno jako PWA — funguje offline a tváří se jako nativní appka.',
    versionLabel: 'Verze',
    phaseLabel: 'Fáze 1 — základ appky',

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

    todayTitle: 'Freshly brewed',
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
    howItWorksBody:
      'Every day, AI scans the most important sources on artificial intelligence, cross-checks them across multiple outlets, and distills them into a short, clear brief. You get it all in one place — no noise, no endless scrolling.',
    aboutBody:
      'A personal reader for your daily AI brief. Built as a PWA — it works offline and behaves like a native app.',
    versionLabel: 'Version',
    phaseLabel: 'Phase 1 — the foundation',

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
