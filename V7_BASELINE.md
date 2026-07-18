# ZeroPrep V7 baseline

V7 is the native Next.js and Vercel deployment baseline.

- Presentation direction, motion, iconography, and exports are inherited from V6.
- Public PDF sharing uses direct browser uploads to Vercel Blob.
- QR codes use Blob `downloadUrl` links so scans download the PDF.
- Uploads are PDF-only, capped at 25 MB, and authorized with short-lived tokens.
- Realtime and share-token routes include lightweight rate limits.
- The project builds with the native Next.js toolchain used by Vercel.
