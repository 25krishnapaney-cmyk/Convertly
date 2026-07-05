# File Grave — Master Build

**File Grave** is a zero-login, privacy-first, ultra-fast online file converter designed with a premium aesthetic inspired by Claude AI, Linear, Raycast, and Apple HIG.

## Architecture

This monorepo is divided into:
- `/frontend`: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Framer Motion.
- `/backend`: Python FastAPI, Redis async task queue (`arq`), and subprocess worker runners for conversion tools (FFmpeg, LibreOffice, ImageMagick, Ghostscript, Poppler, Pandoc).

## Design System (§3.1)

Styles are applied surgically per component:
- **Swiss Design**: Overall layout, spacing (8pt grid), alignment rhythm.
- **Minimalism**: Typography, navigation, iconography.
- **Glassmorphism**: Sticky navbar, modals/dialogs, upload panel background.
- **Claymorphism**: Primary buttons, file cards, tool category cards.
- **Neomorphism**: Search and input fields (with distinct WCAG AA focus rings).
- **Liquid Glass**: Conversion progress bar and processing animations.
- **Soft 3D**: Hero centerpiece icon and illustrations.

## Local Development

Start the full stack using Docker Compose:
```bash
docker-compose up --build
```
- Frontend: http://localhost:3000
- Backend API Docs: http://localhost:8000/docs
