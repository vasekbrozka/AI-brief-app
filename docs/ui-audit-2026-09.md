# Audit layoutu appky (září 2026)

Srovnání s Apple Human Interface Guidelines a s profesionálními čtečkami
(Apple News, Axios „Smart Brevity“, Artifact, Readwise Reader, Morning Brew).
Zjištění a to, co se s nimi udělalo.

## Co bylo špatně

| # | Nález | Proč to vadí | Řešení |
|---|-------|--------------|--------|
| 1 | Uložit a Sdílet byly na mobilu jen za swipem (tlačítka se ukazovala jen myši). | HIG: gesto nikdy nesmí být jediná cesta k akci, není objevitelné. | Obě akce jsou viditelná tlačítka v akčním řádku dole na kartě; swipe zůstal jako zkratka. |
| 2 | Přepínač „přečteno“ byl nenápadný prázdný kroužek vpravo nahoře; po přesunu na konec karty nebyl u delších novinek vidět. | Hlavní akce karty musí být vidět hned a být čitelná jako tlačítko. | Modrá tónovaná fajfka (36 px) vpravo nahoře v hlavičce, stejné místo pro oba stavy: nepřečtená tónovaná, přečtená vyplněná (slouží jako zpětvzetí). |
| 3 | „Pomohlo ti to?“ + dva pilulkové palce pod každou kartou, sedmkrát za den. | Opakovaný popisek je šum; palec nahoru/dolů se čte i bez něj. | Palce (s počty) jsou vlevo v akčním řádku, popisek zůstal jen pro čtečky obrazovky. |
| 4 | Jedna nepřečtená karta = víc než celá obrazovka; 7 novinek = 8 obrazovek. | Nízká hustota, dlouhé rolování. | Menší vnitřní okraje (15/16 px), těsnější mezery, jeden řádek akcí místo dvou bloků, přečtené karty nižší. |
| 5 | Archiv: plovoucí karta se stínem pro každý den. | iOS pro seznamy stejnorodých řádků používá seskupený seznam (inset grouped). | Jeden kontejner s hairline oddělovači; „Dnes · 20. září“, „Včera · 19. září“, dál den v týdnu. Uložené jako vlastní skupina nad ním. |
| 6 | Hlavička neříkala, kolik toho je a jak daleko jsi. | Ranní čtečky (Morning Brew, Apple News Today) ukazují rozsah; postup je základní orientace. | Pod datem: „7 novinek · 6 min čtení · Aktualizováno v 3:10“. Při rolování plovoucí lišta ukazuje „20. září · Vypito 3 z 7“ a tenkou linku postupu. |
| 6b | Hlavička měla tři textové řádky (titulek, datum, meta) a vedle nich kroužek s procenty, který působil přilepeně. | Čtyři prvky nad sebou stály přes 130 px, než čtenář viděl první novinku; procento navíc nic neříká o tom, kolik zbývá. | Dva řádky: titulek a pod ním jeden řádek „Vypito 2 z 6 · 3 min čtení“ s pruhem dílků, jeden dílek = jedna novinka. Datum je jen v plovoucí liště, tedy přesně tehdy, když velký titulek není vidět. |
| 9 | Na počítači byl brief pořád jen dlouhý seznam karet vedle sebe ve sloupcích — stejný model čtení jako na telefonu, včetně přepínače Dnes / Top shots. | Na šířce se vedle novinek vejde i to, jak čtení jde, a celý týden; přepínat mezi dneškem a týdnem je tam zbytečné a prázdné pásy po stranách nic nenesou. | Od 1400 px je Brief aplikační rám na jednu obrazovku: stránka se neroluje, roluje jen prostřední sloupec s novinkami (stejné karty jako na telefonu). Vlevo stojí série čtení ve stejné podobě jako na telefonu (řada dní), vycentrovaná na sloupec; vpravo jemně podbarvená sekce s Top shots a tipy, která roluje uvnitř sebe, a dole v ní zafixovaný řádek Sdílet + palce. Oba krajní sloupce začínají nahoře u data, hlavička zůstává nad novinkami a postup dne je čárkovaný pruh na jejím metařádku. Plovoucí lišta je v tomhle rámu vypnutá, nemá co zobrazovat. Pod 1400 px dva sloupce, na telefonu seznam s přepínačem. |
| 7 | Na desktopu se přepínač Dnes / Top shots roztahoval na 750 px. | Segmented control má šířku ovládacího prvku, ne sloupce. | Max. 400 px na širokém layoutu. |
| 8 | „Aktuální série: 4 dny v řadě“ v Nastavení bylo modré jako odkaz. | Vypadá klikatelně, není. | Sekundární barva textu. |

## Co zůstalo záměrně

- Karty (ne feed s oddělovači): nesou zvýraznění hlavní zprávy, swipe a skládání
  přečtených; na stránce bez obrázků fungují jako jednotky čtení.
- Série čtení zůstává pod novinkami bez vlastní plochy (přání uživatele).
- Pořadí sekcí: novinky → série → Zrnko dne → hodnocení dne → Poslat dnešní shot.
- Typografická škála: titulek 18/600, souhrn 15/1.5, meta 13, štítky 11–12.

## Kontrolní seznam pro další změny

- Každá akce má viditelné tlačítko (gesto jen jako zkratka).
- Primární akce karty je tam, kde končí čtení.
- Popisky se v seznamu neopakují; význam nese ikona + stav, text jen pro a11y.
- Cíle dotyku ≥ 36 px, mezery ≥ 6 px.
- Seznamy stejnorodých řádků = seskupený seznam, ne karta na řádek.
