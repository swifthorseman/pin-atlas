# ADR-0008: Curated alias languages — country official languages plus English

- Status: Accepted
- Date: 2026-06-13

## Context
Curated places carry `displayName` and `searchAliases` in several languages so
search can resolve a user's input whatever language they type. Spec §10 supports
the country's languages for the curated set (for Switzerland: English, German,
French, Italian, Romansh) and additionally permits "best-effort" exonyms in other
languages, naming Spanish "Ginebra" for Geneva as the example, declared
non-guaranteed. In practice that leaves the alias set unbounded: once Spanish
Ginebra is in, there is no principled reason to exclude Romanian, Portuguese, or
Mandarin forms, and curation has no stopping rule. A second, related question the
original wording left open is script: "official languages" taken literally would
require native non-Latin forms (Cyrillic, Han, Arabic, Thai) for the countries
that use them, which pulls in transliteration and input handling. The dataset
currently holds exactly one stray exonym (`Ginebra`), an artifact of Geneva being
the worked example during speccing.

## Decision
Curated `displayName` and `searchAliases` are restricted to Latin-script names:
the official languages of the place's country that are written in the Latin
script, plus English. For Switzerland that is German, French, Italian, Romansh,
and English. Accent- and punctuation-normalisation variants (for example "Murren"
for "Mürren", or "St Moritz" for "St. Moritz") remain allowed, as a matching aid
rather than a language.

Where an official language uses a non-Latin script (Cyrillic, Han, Arabic, Thai,
and so on), its native form is not carried; the English or romanised name is the
entry for that place. Exonyms in languages that are not official for the country
are not carried either (for example Spanish "Ginebra" for Geneva). Native
non-Latin scripts, and the transliteration they require, are a separate and
deliberate feature. This supersedes the best-effort-exonym allowance in spec §10.

## Alternatives considered
- **Keep the spec §10 best-effort-exonym allowance.** Lets the dataset carry any
  exonym a curator happens to add (for example Spanish "Ginebra"). Familiar and
  low-effort, but it has no stopping rule: if Spanish is in, Romanian,
  Portuguese, and Mandarin have equal claim, and curation becomes arbitrary and
  unbounded with no way to call coverage complete. Rejected.
- **Official languages of the country only, no English.** Cleanest in principle,
  but English is the product's lingua franca and the language many travellers
  will type regardless of the country; dropping it would make search noticeably
  worse for the most common non-local input. Rejected.
- **Carry official languages in any script, including non-Latin native forms.**
  The fully faithful option, but it requires native Cyrillic, Han, Arabic, and
  Thai input and matching, plus transliteration and the normalisation that goes
  with them. Disproportionate for the curated Latin-script set; deferred to a
  dedicated multi-script feature rather than rejected outright.
- **Full multilingual exonyms via an external source (e.g. Wikidata labels).**
  The genuinely general answer, but it pulls in an external data dependency,
  per-language quality variance, and disambiguation noise. Disproportionate for
  V1's curated set; deferred to the same future feature.

## Consequences
- Alias curation gets a clear stopping rule: a place's aliases are complete when
  the Latin-script official-language and English forms (plus accent and
  punctuation variants) are present. Coverage is now a decidable question.
- `docs/spec.md` §10 is amended to reference this ADR and drop the
  best-effort-exonym allowance, including the Spanish "Ginebra" example.
- The curated dataset is audited and stray exonyms removed. Currently this is a
  single entry, `Ginebra` from Geneva, so the cleanup is small.
- Places whose official language uses a non-Latin script (for example China,
  Russia, Thailand, the Arab states) carry only the English or romanised name
  until the multi-script feature exists. Their native-script names are
  deliberately absent, not defects.
- Search loses non-official-language and non-Latin-script matches by design. A
  user typing "Ginebra", or a place's native non-Latin name, will not resolve it
  until the separate feature exists. This is an accepted, documented limitation,
  not a defect.
- Wider multilingual and multi-script support remains possible later as an
  additive feature with its own data source; nothing here forecloses it.
