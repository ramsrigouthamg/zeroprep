# ZeroPrep V2 baseline — semantic iconography

Locked on 2026-07-18 as a visual extension of the locked V1 release.

## What changes

- Every nonblank scene can carry one model-selected semantic icon from a 119-icon director vocabulary, curated from the locally installed 1,748-icon catalog.
- Cards can carry distinct icons, turning a list into a lightweight visual system.
- Card connectors, icon halos, and live icon motion make scenes feel diagrammatic without distracting from the speaker.
- Typed-line fallback mode infers icons locally from the speaker’s words.
- The vocabulary covers business, technology, healthcare, education, science, finance, climate, travel, media, community, retail, operations, and general storytelling.

## What stays locked from V1

- Blank-canvas start and speech-only presentation content.
- Realtime model, transcription, VAD sensitivity, noise reduction, tool policy, and continuous-listening behavior.
- The 1.6 second ambient motion cadence.

The V1 contract remains intact in [`V1_BASELINE.md`](V1_BASELINE.md) and [`config/v1.json`](config/v1.json). The active V2 configuration is [`config/v2.json`](config/v2.json).

## Locked visual contract

- The director vocabulary contains exactly 119 unique semantic icons from the locally bundled Lucide 1.25.0 package.
- Every nonblank scene may select an icon; every card may select its own distinct icon.
- Hero icon halos, metric icons, quote icons, animated card focus, and card connector lines are enabled.
- Icon selection is semantic. A specific relevant icon is preferred over a generic decorative icon.
- The icon vocabulary source is [`lib/iconography.ts`](lib/iconography.ts), protected by the SHA-256 fingerprint stored in [`config/v2.json`](config/v2.json).

## Change policy

Treat V2 as immutable unless the user explicitly asks to revise V2. New presentation grammars, expanded icon vocabularies, or behavior-changing experiments must use a new version such as `config/v3.json`, preserving the V2 configuration, vocabulary, and this baseline.

Run `npm test` after changes. The V2 baseline test intentionally fails if the locked voice configuration, blank-canvas start, icon vocabulary, or visual contract drifts.
