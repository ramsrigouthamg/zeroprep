# ZeroPrep V1 baseline

Locked on 2026-07-18. This file is the product contract for the first working live-presentations release.

## Experience

- The presentation starts as a completely blank 16:9 canvas labeled Scene 00 outside the canvas.
- Speech is the only source of presentation content. The first meaningful turn creates Scene 01.
- The director automatically chooses whether to replace a scene, update cards, focus the current scene, or hold noise/repetition.
- Long speech remains visually active through canvas sweeps, breathing geometry, pulsing typography, and card focus changes every 1.6 seconds.
- Continuous listening starts with one click and ends only when the presenter presses Stop presentation.

## Realtime configuration

The executable source of truth is [`config/v1.json`](config/v1.json).

- Model: `gpt-realtime-2.1`
- Transport: WebRTC through `/api/realtime`
- Transcription: `gpt-realtime-whisper`
- VAD: `server_vad`
- Activation threshold: `0.3`
- Prefix padding: `300 ms`
- Silence duration: `200 ms`
- Noise reduction: `far_field`
- Automatic response creation: enabled
- Speech interruption of director calls: disabled
- Tool choice: required
- Output modality: text/tool call

## Change policy

Treat V1 as immutable unless the user explicitly asks to revise V1. Experimental or behavior-changing work should use a new versioned configuration such as `config/v2.json`, keeping this file and `config/v1.json` intact.

Run `npm test` after changes. The V1 baseline test intentionally fails if the locked voice settings, blank-canvas start, or motion cadence drift.
