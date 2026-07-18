# ZeroPrep V3 — present and distribute

Created on 2026-07-18 as a delivery extension of the locked V2 release.

## What changes

- The live 16:9 canvas can enter native browser fullscreen mode. Voice-directed scene changes and motion continue while fullscreen.
- The app keeps a complete presentation deck in memory while retaining the five-scene recent strip from V2.
- Replace actions append a new exported slide; focus and card-merge actions update the current exported slide.
- When listening stops, the completed deck can be downloaded as a 16:9 multi-page PDF or PowerPoint file.
- Exports snapshot the same scene renderer at 1600 × 900, so typography, iconography, colors, and composition remain faithful.
- PDF and PowerPoint slides are static by design for predictable reference and distribution. The live app remains the animated presentation format.

## What stays inherited

V3 preserves the locked V2 Realtime configuration, blank start, VAD sensitivity, motion cadence, 119-icon vocabulary, and semantic icon behavior. The active configuration is [`config/v3.json`](config/v3.json).
