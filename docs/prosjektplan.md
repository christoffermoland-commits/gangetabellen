# Gangetabellen – prosjektplan og handoff til Claude Code

## Bakgrunn

Egen PWA for at datteren din skal øve på den lille gangetabellen (1–5, multiplisert med 1–10), installerbar som ikon på iPhone, med innebygde motivasjonsfunksjoner. Kjernespillet (flervalgsspørsmål, streak, oppsummering) er allerede prototypet og testet i chat – bruk det som funksjonell referanse for øvingsskjermen.

## Mål for MVP

- Kan legges til på Hjem-skjerm på iPhone og åpnes som ikon, ikke som nettleserfane
- Lagrer fremgang lokalt på enheten – ingen innlogging
- Fungerer offline etter første åpning
- Inneholder motivasjonsfunksjonene under

## Motivasjonsfunksjoner

1. **Daglig streak** – antall dager i rad hun har øvd minst én runde, vises på hjem-skjermen (ikke bare sesjonsstreak)
2. **Sesjonsstreak + rekord** – løpende streak under en runde; beste streak noensinne lagres og vises
3. **Mikrobelønninger** – stjerne per riktig svar, badge når en tabell er "mestret" (f.eks. 90 %+ riktig over flere runder)
4. **Boss-tabell** – tabellen med flest feil får egen markering og dukker oftere opp til hun mestrer den
5. **Slå din egen rekord** – vis forrige resultat før runden starter, feire tydelig ved ny rekord
6. **Tilfeldige overraskelser** – liten animasjon/melding hver 10. riktige svar i rad
7. **Visuell fremgang** – enkel mestringsgrad (%) per tabell på egen oversiktsskjerm

## Skjermer

- **Hjem** – daglig streak, totalt antall stjerner, tabellvalg, start-knapp
- **Øving** – gjenbruk av prototypen: spørsmål, 4 svaralternativer, streak-indikator
- **Resultat** – poeng, evt. "ny rekord", badges opptjent denne runden, spill igjen
- **Mine rekorder** – mestringsgrad per tabell, beste streak, badge-samling

## Teknisk stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- PWA: manifest.json + service worker (next-pwa eller manuelt)
- Lagring: localStorage (IndexedDB hvis datamengden vokser) – ingen backend i MVP
- Hosting: Vercel

## PWA-krav for iPhone

- `manifest.json` med name, short_name, icons (192×192 og 512×512), `display: standalone`, theme_color, background_color, start_url
- `<link rel="apple-touch-icon" href="...">` (180×180) i `<head>`
- `<meta name="apple-mobile-web-app-capable" content="yes">`
- `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">`
- HTTPS via Vercel (automatisk)
- Be Code lage 2–3 enkle ikonforslag (f.eks. stilisert 5×5-rutenett eller tallmotiv)

## Datamodell (lokalt)

```
progress: { [tabell 1-5]: { spurt: number, riktig: number, sistØvd: string } }
dailyStreak: { sisteØvingsdato: string, antallDagerIRad: number }
bestSessionStreak: number
badges: string[]
```

## Ikke i MVP (v2-ideer)

- Foreldre-oversikt/dashboard
- Lyd/musikk
- Synk mellom flere enheter
- Utvidelse til store gangetabellen (6–10)

## Beslutningspunkt før oppstart

Frittstående app, eller modul i Mattehjelpen? Under forutsetter en frittstående app (eget ikon, egen daglig streak). Vil du heller samle det i Mattehjelpen, sier du det til Code i stedet for første linje i prompten under.

---

## Handoff-prompt til Claude Code

Lim inn dette som første prompt i et nytt Claude Code-prosjekt:

```
Bygg en PWA i Next.js (App Router, TypeScript, Tailwind CSS) kalt "Gangetabellen".

Formål: Et barn (8–9 år) skal øve på den lille gangetabellen (tabellene 1–5, multiplisert med 1–10) gjennom flervalgsspørsmål, og appen skal kunne installeres som ikon på iPhone-hjemskjerm (PWA).

Kjernefunksjonalitet:
- Hjem-skjerm: velg hvilke tabeller (1–5) å øve på, vis daglig streak og totalt antall stjerner, start-knapp
- Øvingsskjerm: tilfeldig spørsmål fra valgte tabeller (f.eks. "4 × 3 = ?"), 4 svaralternativer (1 riktig + 3 sannsynlige feilsvar), umiddelbar visuell tilbakemelding, løpende streak-teller
- Resultatskjerm etter 12 spørsmål: poeng (X av 12), beste streak denne runden, evt. ny rekord-feiring, badges opptjent, knapp for å spille igjen
- "Mine rekorder"-skjerm: mestringsgrad (%) per tabell, beste streak noensinne, badge-samling

Motivasjonsfunksjoner som må være med:
- Daglig øve-streak (kalenderbasert, ikke bare per sesjon)
- Stjerne per riktig svar + badge når en tabell mestres (90 %+ riktig over tid)
- Boss-tabell: tabellen med flest feil markeres spesielt og prioriteres i spørsmålsutvalget
- Sammenligning med eget forrige resultat, tydelig feiring ved ny rekord
- Tilfeldig liten overraskelse/animasjon hver 10. riktige svar i rad

PWA-krav:
- manifest.json med ikoner i 192×192 og 512×512, display: standalone
- apple-touch-icon (180×180) og nødvendige meta-tagger for iOS-installasjon
- Fungere offline etter første lasting (service worker / caching)

Lagring: all fremgang lagres lokalt i localStorage. Ingen innlogging, ingen backend i denne versjonen.

Design: lys, ryddig, barnevennlig design med store touch-vennlige knapper. Bruk Tailwind.

Lever klar til deploy på Vercel.
```

## Sjekkliste før du starter

- [ ] Bekreft appnavn (forslag: Gangetabellen)
- [ ] Avklar: frittstående app eller modul i Mattehjelpen
- [ ] Vercel-prosjekt/domene klart
- [ ] Lim inn handoff-prompten i Claude Code og kjør
