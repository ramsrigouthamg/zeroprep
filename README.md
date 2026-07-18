# ZeroPrep

**Your talk is your presentation.**

ZeroPrep listens while you speak and composes a live visual presentation around your ideas. It can hold the current scene, evolve it with more detail, or introduce a new visual beat without requiring a prepared slide deck.

![ZeroPrep — live presentations, zero prep](public/og.png)

## Demo

[![Watch the ZeroPrep live presentation demo](https://img.youtube.com/vi/aQ153JIfz_8/maxresdefault.jpg)](https://youtu.be/aQ153JIfz_8?si=br4G-JD-QAoSfaKS)

[Watch the ZeroPrep demo on YouTube](https://youtu.be/aQ153JIfz_8?si=br4G-JD-QAoSfaKS)

## What it does

- Listens continuously until the presenter stops the session
- Uses GPT-Realtime 2.1 to understand live speech and direct visual changes
- Generates scene-aware background imagery asynchronously with Gemini 3.1 Flash Lite Image (Nano Banana 2 Lite)
- Renders animated presentation scenes with React, HTML, and CSS
- Builds heroes, cards, metrics, quotes, icons, and diagrams dynamically
- Exports the completed presentation as PDF or PowerPoint
- Publishes the PDF to Vercel Blob and creates a phone-scannable download QR
- Presents the live canvas in fullscreen

## Architecture

```text
Microphone
   └── WebRTC → ZeroPrep API → OpenAI Realtime
                                  └── visual tool calls
                                         └── React + HTML/CSS scenes

New scene → text and layout render immediately
          └── parallel Gemini image request
                    └── background fades in only if that scene is still current

Finished scenes → browser PDF renderer → Vercel Blob → public download URL → QR
```

OpenAI credentials and Blob write credentials remain server-side. Generated PDFs upload directly from the browser to Vercel Blob using a short-lived, PDF-only upload token, avoiding the Vercel Function request-body limit.

## Technology

- Next.js 16 and React 19
- OpenAI `gpt-realtime-2.1`
- OpenAI `gpt-realtime-whisper` for the displayed live transcript
- Google Gemini `gemini-3.1-flash-lite-image` for non-blocking generated backgrounds
- Vercel Blob for public, unlisted PDF delivery
- jsPDF and html-to-image for PDF generation
- PptxGenJS for PowerPoint export
- Lucide for semantic iconography

## Run locally

Requirements: Node.js 22.13 or later.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Add these values to `.env.local`:

```bash
OPENAI_API_KEY=your_openai_api_key
GEMINI_API_KEY=your_google_ai_studio_api_key
BLOB_READ_WRITE_TOKEN=your_vercel_blob_read_write_token
```

The voice experience needs `OPENAI_API_KEY`. Generated backgrounds need a Gemini API key from Google AI Studio in `GEMINI_API_KEY`. If that key is absent or an image fails, ZeroPrep stays fully functional with its original text, icons, motion, and layout. QR sharing needs a connected **public** Vercel Blob store.

## Deploy to Vercel

1. Import `https://github.com/ramsrigouthamg/zeroprep` into Vercel.
2. Keep the detected framework as **Next.js** and the project root as `./`.
3. Add `OPENAI_API_KEY` under **Project Settings → Environment Variables** for Production and Preview.
4. Add `GEMINI_API_KEY` from Google AI Studio for generated scene backgrounds.
5. Open **Storage**, create a **Blob** store, choose **Public**, and connect it to the project. Vercel adds `BLOB_READ_WRITE_TOKEN` automatically.
6. Redeploy after the environment variables are available.
7. Open the production URL, create a presentation, stop listening, then select **Share QR**.

For local Blob testing after connecting the Vercel project:

```bash
npx vercel link
npx vercel env pull .env.local
```

## Public-deployment safety

ZeroPrep applies same-origin checks, short-lived upload tokens, PDF-only validation, a 25 MB upload limit, and lightweight per-instance rate limits. For a public event or sustained traffic, also add Vercel Firewall rate-limit rules for:

- `POST /api/realtime`
- `POST /api/imagery`
- `POST /api/share`

This prevents anonymous visitors from creating excessive OpenAI sessions or Blob uploads.

## Commands

```bash
npm run dev
npm run lint
npm run build
npm test
```

## License

MIT — see [LICENSE](LICENSE).
