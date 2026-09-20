import type { Lang } from '../lib/types';

// UI copy, CS primary / EN secondary. Voice: the content is factual; the
// coffee metaphor gives the product its character in a few chosen places
// (the time-of-day title, the streak, a couple of endings) and stays out of
// navigation, settings, system states and accessibility labels.
export interface UIStrings {
  appName: string;
  tagline: string;

  // Tab bar
  tabToday: string;
  tabTodo: string;
  tabArchive: string;
  tabSettings: string;

  // Brief screen — time-of-day title (a deliberate running joke: the shot cools)
  brewMorning: string;
  brewAfternoon: string;
  brewEvening: string;
  todayEmptyTitle: string;
  todayEmptyBody: string;
  /** Segmented switch on the Brief screen: today's brief / the week's top shots. */
  viewToday: string;
  viewWeek: string;
  weekSubtitle: string;
  weekEmpty: string;

  // Story card
  verified: string;
  topStory: string;
  sourcesLabel: string;
  shareLabel: string;
  saveLabel: string;
  removeLabel: string;
  /** Accessibility labels for the icon buttons on a card. */
  shareStoryLabel: string;
  saveStoryLabel: string;
  removeSavedLabel: string;
  savedToast: string;
  unsavedToast: string;
  savedTitle: string;
  savedEmpty: string;
  savedEmptyBody: string;
  threadLabel: string;
  whyLabel: string;
  howToTryLabel: string;
  tipBadge: string;
  /** Desktop: the label over the day's tips in the right column. */
  tipsRailLabel: string;
  radarTitle: string;
  radarTentative: string;
  shareBriefLabel: string;
  shareBriefArchiveLabel: string;
  voteLabel: string;
  voteThanks: string;
  voteUp: string;
  voteDown: string;
  rateTodayLabel: string;
  rateBriefLabel: string;
  /** The one-time rating sheet after the last story is read. */
  ratePromptBody: string;
  ratePromptLater: string;
  closeLabel: string;
  sampleBadge: string;
  sampleNote: string;

  // To do (optional tab): the reader's list, plus tips to add; and the glossary term
  todoTitle: string;
  todoSubtitle: string;
  todoEmptyTitle: string;
  todoEmptyBody: string;
  todoDoneSection: string;
  todoAddLabel: string;
  todoRemoveLabel: string;
  todoAddedToast: string;
  todoRemovedToast: string;
  todoMarkDone: string;
  todoMarkOpen: string;
  todoClearDone: string;
  todoSuggestTitle: string;
  todoSuggestHint: string;
  todoSuggestEmpty: string;
  termTitle: string;
  termNext: string;
  showAnotherTerm: string;

  // Archive
  archiveTitle: string;
  archiveSubtitle: string;
  /** Relative day labels in the archive list. */
  dayToday: string;
  dayYesterday: string;
  archiveEmpty: string;
  archiveEmptyBody: string;

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
  streakSectionLabel: string;
  /** Streak-tier titles, mildest first: 1–2 · 3–6 · 7–13 · 14–29 · 30+ days. */
  streakLevels: string[];
  streakStart: string;
  streakTodayLeft: string;
  streakDoneToday: string;
  sectionReading: string;
  hideReadLabel: string;
  hideReadHint: string;
  clearReadLabel: string;
  gamifyLabel: string;
  gamifyHint: string;
  gamifyCurrentLabel: string;
  glossaryLabel: string;
  glossaryHint: string;
  todoLabel: string;
  todoHint: string;

  // Notifications
  sectionNotifications: string;
  notifyLabel: string;
  notifyHint: string;
  notifyUnsupported: string;
}

export const STRINGS: Record<Lang, UIStrings> = {
  cs: {
    appName: 'AIspresso',
    tagline: 'Novinky ze světa AI, stručně a ověřeně.',

    tabToday: 'Brief',
    tabTodo: 'To do',
    tabArchive: 'Archiv',
    tabSettings: 'Nastavení',

    brewMorning: 'Ranní shot',
    brewAfternoon: 'Odpolední sedlina',
    brewEvening: 'Večerní výplach',
    todayEmptyTitle: 'Dnešní brief se připravuje',
    todayEmptyBody: 'Ještě není hotový. Zkus to za chvíli.',
    viewToday: 'Dnes',
    viewWeek: 'Top shots',
    weekSubtitle: 'To nejdůležitější z uplynulého týdne',
    weekEmpty: 'Zatím tu nic není. Top shots se objeví, jakmile bude z čeho vybírat.',

    verified: 'Ověřeno',
    topStory: 'Hlavní zpráva',
    sourcesLabel: 'Zdroje',
    shareLabel: 'Sdílet',
    saveLabel: 'Uložit',
    removeLabel: 'Odebrat',
    shareStoryLabel: 'Sdílet novinku',
    saveStoryLabel: 'Uložit novinku',
    removeSavedLabel: 'Odebrat z uložených',
    savedToast: 'Uloženo',
    unsavedToast: 'Odebráno z uložených',
    savedTitle: 'Uložené',
    savedEmpty: 'Zatím nic uloženého',
    savedEmptyBody: 'Ulož si novinky, ke kterým se chceš vrátit.',
    threadLabel: 'Navazuje na',
    whyLabel: 'Proč zbystřit',
    howToTryLabel: 'Jak na to',
    tipBadge: 'Vyzkoušej',
    tipsRailLabel: 'Na vyzkoušení',
    radarTitle: 'Co se chystá',
    radarTentative: 'podle zpráv',
    shareBriefLabel: 'Poslat dnešní shot',
    shareBriefArchiveLabel: 'Poslat dál',
    voteLabel: 'Pomohlo ti to?',
    voteThanks: 'Díky za hodnocení.',
    voteUp: 'Označit jako užitečné',
    voteDown: 'Označit jako neužitečné',
    rateTodayLabel: 'Jak ti chutnal dnešní shot?',
    rateBriefLabel: 'Jak ti chutnal tenhle shot?',
    ratePromptBody: 'Pomůže vybrat, co číst zítra.',
    ratePromptLater: 'Teď ne',
    closeLabel: 'Zavřít',
    sampleBadge: 'Ukázka',
    sampleNote: 'Toto je ukázkový obsah. Skutečný denní brief sestavuje AI každé ráno.',

    todoTitle: 'To do',
    todoSubtitle: 'Novinky a tipy na později',
    todoEmptyTitle: 'Zatím prázdné',
    todoEmptyBody:
      'U novinky klepni na ikonu seznamu a vrátíš se k ní tady. Dole jsou tipy, které stojí za vyzkoušení.',
    todoDoneSection: 'Hotové',
    todoAddLabel: 'Přidat do To do',
    todoRemoveLabel: 'Odebrat z To do',
    todoAddedToast: 'Přidáno do To do.',
    todoRemovedToast: 'Odebráno z To do.',
    todoMarkDone: 'Označit jako hotové',
    todoMarkOpen: 'Vrátit mezi otevřené',
    todoClearDone: 'Vymazat hotové',
    todoSuggestTitle: 'Tipy k vyzkoušení',
    todoSuggestHint: 'Funkce z posledních 30 dnů, které stojí za vyzkoušení. Plusem je přidáš do seznamu.',
    todoSuggestEmpty: 'Všechny tipy máš v seznamu nebo za sebou ☕️',
    termTitle: 'Zrnko dne',
    termNext: 'Další pojem',
    showAnotherTerm: 'Zobrazit další pojem',

    archiveTitle: 'Archiv',
    archiveSubtitle: 'Posledních 14 dní',
    dayToday: 'Dnes',
    dayYesterday: 'Včera',
    archiveEmpty: 'Archiv je zatím prázdný',
    archiveEmptyBody: 'Starší briefy se tu objeví postupně.',

    settingsTitle: 'Nastavení',
    sectionLanguage: 'Jazyk',
    sectionAppearance: 'Vzhled',
    sectionCategories: 'Kategorie',
    categoriesShownHint:
      'Vypnuté kategorie se v přehledu nezobrazí. Hlavní zpráva zůstane viditelná vždy.',
    sectionInstall: 'Přidat na plochu',
    sectionHowItWorks: 'Jak to funguje',
    sectionAbout: 'O aplikaci',
    aboutRowHint: 'Jak AIspresso funguje, odkud čerpá a co je nové',
    themeAuto: 'Automaticky',
    themeLight: 'Světlý',
    themeDark: 'Tmavý',
    installIntro:
      'Přidej si AIspresso na plochu iPhonu, ať se otevírá na celou obrazovku jako běžná aplikace.',
    installSteps: [
      'Otevři AIspresso v Safari.',
      'Klepni na Sdílet.',
      'Vyber Přidat na plochu.',
      'Potvrď tlačítkem Přidat.',
    ],
    installShareHint: 'Funguje v Safari na iPhonu nebo iPadu.',
    howItWorksParagraphs: [
      'AIspresso jednou denně vybírá podstatné novinky ze světa AI a shrnuje je do krátkého briefu. Každá novinka odkazuje na použité zdroje a uvádí datum události, pokud je známé. Shrnutí vznikají s pomocí AI a mohou obsahovat chyby. U informací, podle kterých se potřebuješ rozhodnout, vždy otevři původní zdroj.',
      'Palcem nahoru nebo dolů dáváš vědět, co bylo užitečné. Ukládá se jen počítadlo hlasů, nic o tobě.',
    ],
    sectionSources: 'Zdroje',
    sourcesOfficialLabel: 'Oficiální zdroje',
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
      'Proč zbystřit: u každé novinky věta dvě o tom, co z ní plyne pro tebe',
      'Top shots: přepínač na obrazovce Brief s hlavními zprávami posledních sedmi dnů',
      'Co se chystá: termíny, které se blíží, s datem a zdrojem',
      'To do: volitelná záložka (zapíná se v Nastavení) s novinkami a tipy na později; na kartě přibude tlačítko Přidat do To do',
      'Zrnko dne ze slovníčku',
      'Hodnocení novinek i celého dne palcem nahoru nebo dolů, s počty hlasů od všech čtenářů',
      'Datum události u každé novinky a štítek Vyzkoušej u praktických tipů',
      'Poslat dnešní shot jedním klepnutím',
    ],
    releaseImproved: [
      'Na počítači jsou tři sloupce: vlevo postup dne, série čtení a hodnocení, uprostřed novinky jako na telefonu, vpravo Top shots, tipy a Poslat dnešní shot; telefon beze změny',
      'Přečtené novinky hned mizí z přehledu (dá se vypnout v Nastavení) a vedle nadpisu je kruh s procenty přečteného',
      'Zrnko dne se objeví až po dočtení všech novinek',
      'Po dočtení se jednou nabídne hodnocení dne; zavřít jde jedním klepnutím',
      'Vypito je modrá fajfka vpravo nahoře na kartě, vidět hned; dole je řádek s palci, To do, Uložit a Sdílet. Nic není schované za gestem',
      'Při rolování vidíš v horní liště, kolik novinek máš vypito; pod datem je počet novinek a odhad času čtení',
      'Archiv je jeden seskupený seznam s Dnes a Včera místo karty pro každý den',
      'Karty jsou hustší a přečtené karty nižší',
      'Přečtená novinka se sbalí na titulek a zůstane na místě; fajfka ji vrátí mezi nepřečtené',
      'Den v sérii čtení se počítá po první přečtené novince, série je pod novinkami bez karty',
      'Archiv drží 14 dní a odkazy Navazuje na fungují déle',
      'Odznak Ověřeno z karet zmizel, pletl se s označením přečteno; do briefu jde jen zpráva s oficiálním zdrojem nebo dvěma nezávislými médii',
      'Tlačítka a odškrtávání reagují na klepnutí',
      'Ranní upozornění nese titulek dne a počet novinek',
    ],
    releaseFixed: [],
    aboutTagline: 'Novinky ze světa AI',
    versionLabel: 'Verze',
    modelLabel: 'Shrnutí připravuje',
    modelName: 'Claude od Anthropic',
    signature: 'Autor: Václav Brožka',
    supportText:
      'AIspresso je zdarma a bez reklam a chci, aby takové zůstalo. Pokud se stalo součástí tvého rána, můžeš mi symbolicky koupit kávu.',
    supportCta: 'Koupit mi kávu',

    loading: 'Načítám…',
    errorTitle: 'Brief se nenačetl',
    errorBody: 'Zkontroluj připojení a zkus to znovu.',
    retry: 'Zkusit znovu',
    updatedLabel: 'Aktualizováno v',
    back: 'Zpět',

    read: 'Vypito',
    markRead: 'Označit jako přečtené',
    markUnread: 'Označit jako nepřečtené',
    streakSectionLabel: 'Série čtení',
    streakLevels: ['Jen na skok', 'Pravidelný host', 'Barista tě zná', 'Vlastní hrnek', 'Stálé místo'],
    streakStart: 'Přečti první novinku a založ sérii.',
    streakTodayLeft: 'Přečti dnes aspoň jednu novinku, ať série pokračuje.',
    streakDoneToday: 'Dnešek přečtený',
    sectionReading: 'Čtení',
    hideReadLabel: 'Skrýt přečtené',
    hideReadHint:
      'Přečtené novinky z přehledu zmizí. Když je necháš zobrazené, sbalí se na titulek.',
    clearReadLabel: 'Označit vše jako nepřečtené',
    gamifyLabel: 'Série čtení',
    gamifyHint: 'Série se prodlouží, jakmile přečteš první novinku dne.',
    gamifyCurrentLabel: 'Aktuální série',
    glossaryLabel: 'Vysvětlit pojmy',
    glossaryHint: 'Odborné pojmy v přehledu podtrhneme. Klepnutím zobrazíš jednoduché vysvětlení.',
    todoLabel: 'To do',
    todoHint:
      'Záložka se seznamem novinek a tipů, ke kterým se chceš vrátit. Na kartě přibude tlačítko Přidat do To do.',

    sectionNotifications: 'Upozornění',
    notifyLabel: 'Ranní upozornění',
    notifyHint: 'Jedno upozornění denně, jakmile je nový brief připravený.',
    notifyUnsupported: 'Na iPhonu funguje po přidání AIspressa na plochu.',
  },
  en: {
    appName: 'AIspresso',
    tagline: 'The world of AI, brief and verified.',

    tabToday: 'Brief',
    tabTodo: 'To do',
    tabArchive: 'Archive',
    tabSettings: 'Settings',

    brewMorning: 'Morning Shot',
    brewAfternoon: 'Afternoon Grounds',
    brewEvening: 'Evening Rinse',
    todayEmptyTitle: 'Today’s brief is on the way',
    todayEmptyBody: 'It’s not ready yet. Check back soon.',
    viewToday: 'Today',
    viewWeek: 'Top shots',
    weekSubtitle: 'The week’s essential stories',
    weekEmpty: 'Nothing here yet. Top shots appear once there is a week to pick from.',

    verified: 'Verified',
    topStory: 'Top story',
    sourcesLabel: 'Sources',
    shareLabel: 'Share',
    saveLabel: 'Save',
    removeLabel: 'Remove',
    shareStoryLabel: 'Share story',
    saveStoryLabel: 'Save story',
    removeSavedLabel: 'Remove from Saved',
    savedToast: 'Saved',
    unsavedToast: 'Removed from Saved',
    savedTitle: 'Saved',
    savedEmpty: 'Nothing saved yet',
    savedEmptyBody: 'Save stories you want to come back to.',
    threadLabel: 'Follow-up to',
    whyLabel: 'Why it matters',
    howToTryLabel: 'How to try it',
    tipBadge: 'Try it',
    tipsRailLabel: 'Worth trying',
    radarTitle: 'Coming up',
    radarTentative: 'reported',
    shareBriefLabel: 'Share today’s shot',
    shareBriefArchiveLabel: 'Share',
    voteLabel: 'Was this useful?',
    voteThanks: 'Thanks for the feedback.',
    voteUp: 'Mark as useful',
    voteDown: 'Mark as not useful',
    rateTodayLabel: 'How was today’s shot?',
    rateBriefLabel: 'How was this shot?',
    ratePromptBody: 'It helps pick what to read tomorrow.',
    ratePromptLater: 'Not now',
    closeLabel: 'Close',
    sampleBadge: 'Sample',
    sampleNote: 'This is sample content. The real daily brief is assembled by AI every morning.',

    todoTitle: 'To do',
    todoSubtitle: 'Stories and tips for later',
    todoEmptyTitle: 'Nothing here yet',
    todoEmptyBody:
      'Tap the list icon on a story and it waits for you here. Below are tips worth trying.',
    todoDoneSection: 'Done',
    todoAddLabel: 'Add to To do',
    todoRemoveLabel: 'Remove from To do',
    todoAddedToast: 'Added to To do.',
    todoRemovedToast: 'Removed from To do.',
    todoMarkDone: 'Mark as done',
    todoMarkOpen: 'Mark as not done',
    todoClearDone: 'Clear done',
    todoSuggestTitle: 'Tips to try',
    todoSuggestHint: 'Features from the past 30 days worth trying. The plus adds one to your list.',
    todoSuggestEmpty: 'Every tip is on your list or behind you ☕️',
    termTitle: 'Bean of the day',
    termNext: 'Another term',
    showAnotherTerm: 'Show another term',

    archiveTitle: 'Archive',
    archiveSubtitle: 'Last 14 days',
    dayToday: 'Today',
    dayYesterday: 'Yesterday',
    archiveEmpty: 'The archive is empty for now',
    archiveEmptyBody: 'Past briefs will appear here over time.',

    settingsTitle: 'Settings',
    sectionLanguage: 'Language',
    sectionAppearance: 'Appearance',
    sectionCategories: 'Categories',
    categoriesShownHint:
      'Disabled categories won’t appear in the brief. The top story always stays visible.',
    sectionInstall: 'Add to Home Screen',
    sectionHowItWorks: 'How it works',
    sectionAbout: 'About',
    aboutRowHint: 'How AIspresso works, where its information comes from, and what’s new',
    themeAuto: 'System',
    themeLight: 'Light',
    themeDark: 'Dark',
    installIntro:
      'Add AIspresso to your iPhone Home Screen so it opens full-screen, just like a native app.',
    installSteps: [
      'Open AIspresso in Safari.',
      'Tap Share.',
      'Choose Add to Home Screen.',
      'Tap Add to confirm.',
    ],
    installShareHint: 'Works in Safari on iPhone or iPad.',
    howItWorksParagraphs: [
      'AIspresso selects the day’s essential AI stories and turns them into a short daily brief. Every story links to its sources and includes the event date when known. The summaries are created with AI and may contain errors. Always check the original source before relying on information for an important decision.',
      'A thumbs up or down tells us what was useful. Only a vote counter is stored, nothing about you.',
    ],
    sectionSources: 'Sources',
    sourcesOfficialLabel: 'Official sources',
    sourcesOfficialList:
      'Anthropic · OpenAI · Google & DeepMind · Microsoft · NVIDIA · Meta AI · Hugging Face · Mistral',
    sourcesMediaLabel: 'Media outlets',
    sourcesMediaList:
      'Reuters · AP · Bloomberg · The Verge · Ars Technica · TechCrunch · Axios · Wired · The Register · MIT Technology Review · CNBC',
    sectionReleaseNotes: 'Release notes',
    releaseAddedLabel: 'Added',
    releaseImprovedLabel: 'Improved',
    releaseFixedLabel: 'Fixed',
    releaseAdded: [
      'Why it matters: a sentence or two under every story on what it means for you',
      'This week’s top shots: a switch on the Brief screen with the top stories of the last seven days',
      'Coming up: the dates ahead, each with a date and a source',
      'To do: an optional tab (turn it on in Settings) with stories and tips for later; every card gains an Add to To do button',
      'Bean of the day from the glossary',
      'Thumbs up or down on stories and on the whole day, with everyone’s vote counts',
      'The event date on every story and a Try it badge on practical tips',
      'Share today’s shot with one tap',
    ],
    releaseImproved: [
      'On a computer the brief is three columns: your progress, streak and rating on the left, the stories in the middle as on the phone, top shots, tips and sharing on the right; the phone is unchanged',
      'Read stories leave the list right away (can be turned off in Settings) and a ring beside the title shows how much is read',
      'Bean of the day appears once every story is read',
      'After the last story, one gentle ask for the day’s rating; one tap closes it',
      'Read is the blue check at the top right of the card, in view right away; the row at the bottom has thumbs, To do, save and share. Nothing hides behind a gesture',
      'While scrolling, the floating bar shows how many stories you have read; under the date, the story count and a reading-time estimate',
      'The archive is one grouped list with Today and Yesterday instead of a card per day',
      'Denser cards, lower read cards',
      'A read story folds to its title and stays in place; the check un-reads it',
      'A day in the reading streak counts after the first story read; the streak sits under the stories without a card',
      'The archive keeps 14 days and Follow-up links work longer',
      'The Verified badge is gone from the cards, it read as “done”; a story only makes the brief with an official source or two independent outlets',
      'Buttons and ticks respond to touch',
      'The morning notification carries the headline of the day and the story count',
    ],
    releaseFixed: [],
    aboutTagline: 'The world of AI',
    versionLabel: 'Version',
    modelLabel: 'Summaries are prepared by',
    modelName: 'Claude from Anthropic',
    signature: 'By Václav Brožka',
    supportText:
      'AIspresso is free and ad-free, and I plan to keep it that way. If it has earned a place in your routine, you can buy me a coffee.',
    supportCta: 'Buy me a coffee',

    loading: 'Loading…',
    errorTitle: 'Couldn’t load the brief',
    errorBody: 'Check your connection and try again.',
    retry: 'Try again',
    updatedLabel: 'Updated at',
    back: 'Back',

    read: 'Read',
    markRead: 'Mark as read',
    markUnread: 'Mark as unread',
    streakSectionLabel: 'Reading streak',
    streakLevels: ['Just stopping by', 'A regular', 'The barista knows you', 'Your own mug', 'Your usual seat'],
    streakStart: 'Read a story to start a streak.',
    streakTodayLeft: 'Read a story today to keep your streak going.',
    streakDoneToday: 'Fully briefed today',
    sectionReading: 'Reading',
    hideReadLabel: 'Hide read stories',
    hideReadHint:
      'Read stories will disappear from the brief. If left visible, they’ll collapse to the headline.',
    clearReadLabel: 'Mark all as unread',
    gamifyLabel: 'Reading streak',
    gamifyHint: 'Your streak grows once you read the first story of the day.',
    gamifyCurrentLabel: 'Current streak',
    glossaryLabel: 'Explain terms',
    glossaryHint: 'Technical terms in the brief will be underlined. Tap one for a plain-language explanation.',
    todoLabel: 'To do',
    todoHint:
      'A tab with the stories and tips you want to come back to. Adds an Add to To do button to every card.',

    sectionNotifications: 'Notifications',
    notifyLabel: 'Morning notification',
    notifyHint: 'One notification a day, as soon as the new brief is ready.',
    notifyUnsupported: 'On iPhone, this works after you add AIspresso to your Home Screen.',
  },
};
