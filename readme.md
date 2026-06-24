# MediTriage

An AI-assisted medical triage system for community health workers. Patients are registered, their voice notes / scanned documents / vitals are processed, and a triage recommendation (Red / Yellow / Green / Black) is produced with first-aid steps and a referral suggestion.

The app is an Express server (`server/server.js`) that exposes both a JSON API and a static frontend under `server/public/`.

---

## Prerequisites

- **Node.js 18+** and **npm**
- **MongoDB** running locally on `mongodb://localhost:27017` (or any URI you point `MONGODB_URI` to)
- **ffmpeg** is bundled via `ffmpeg-static`, so no system install is required for audio
- For Docker: **Docker** + **Docker Compose**

---

## 1. Get your API keys

Two external services are used. Both have free tiers.

| Env var | Provider | Where to get it |
| --- | --- | --- |
| `OCR_SPACE_API_KEY` | [OCR.space](https://ocr.space/) | Sign up at **ocr.space/** → account dashboard → copy the API key |
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/) | Sign in at **aistudio.google.com** → "Get API key" → create a key |

Keep both keys private. Never commit a real `.env`.

---

## 2. Configure your environment

Copy the example file and fill in the two keys:

```bash
cp .env.example .env
```

Then edit `.env`:

```env
OCR_SPACE_API_KEY=your_ocr_space_key_here
GEMINI_API_KEY=your_google_ai_studio_key_here
OCR_SPACE_LANGUAGE=eng
OCR_SPACE_OCR_ENGINE=3
OCR_SPACE_API=https://api.ocr.space/parse/image
GEMINI_MODEL=gemini-3.1-flash-lite
MONGODB_URI=mongodb://localhost:27017/patient
```

Only `OCR_SPACE_API_KEY` and `GEMINI_API_KEY` are required — the rest have sensible defaults.

---

## 3. Run locally (without Docker)

Install deps and start the dev server:

```bash
npm install
npm run dev
```

`npm run dev` runs `nodemon ./server/server.js`, which:

- Loads `.env` automatically
- Connects to MongoDB
- Loads the Whisper model on first `/voice` request (one-time cost)
- Serves the API on **http://localhost:3000**

Open the app:

- Dashboard: <http://localhost:3000/>
- All patients: <http://localhost:3000/all-patients.html>

### Useful endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/patients/create` | Register a new patient |
| `GET`  | `/patients/open` | List open (non-closed) patients |
| `GET`  | `/patients/all` | List every patient |
| `GET`  | `/patients/search?q=&status=&triage=` | Search patients |
| `GET`  | `/patients/:id` | Get one patient |
| `PATCH`| `/patients/:id/close` | Close a patient case |
| `POST` | `/voice` | Transcribe an audio file (Whisper) |
| `POST` | `/ocr` | Extract text from a document image (OCR.space) |
| `POST` | `/vitals` | Save vitals + anomaly detection |
| `POST` | `/triage` | Run AI triage (Gemini) |

---

## 4. Run via Docker

- `DOCKER/docker-compose.prod.yml` — **production-style** (empty env vars, set them yourself)

The compose file builds the image from `DOCKER/Dockerfile`, starts MongoDB + the app, and exposes the app on **http://localhost:3000**.

### Quick start

```bash
cd DOCKER
(provide your own keys in your shell or a .env):
OCR_SPACE_API_KEY=your_key GEMINI_API_KEY=your_key \
  docker compose -f docker-compose.prod.yml up --build
```

### Stop and clean up

```bash
docker compose down            # stop containers
docker compose down -v         # also drop the MongoDB volume
```

### Notes

- The first build downloads the Whisper model, so it can take a few minutes.
- Whisper logs a lot of "Removing initializer ..." warnings to the terminal during `/voice` calls. They are harmless and can be filtered with a `grep -v "Removing initializer"` if you want a quieter log.
- The production compose file does **not** bake any keys in — supply them via environment, a secrets manager, or a `.env` mounted into the container.

---

## Project layout

```
.
├── package.json
├── server/
│   ├── server.js                 # Express entry point
│   ├── MONGODB_MODULE/           # Mongoose connection + Patient model
│   ├── OCR_MODULE/               # OCR.space integration
│   ├── VOICE_MODULE/             # Whisper transcription
│   ├── TRIAGE_MODULE/            # Gemini triage reasoning
│   ├── VITALS_MODULE/            # Vitals + anomaly detection
│   ├── PATIENT_MODULE/           # Patient CRUD + search
│   └── public/                   # Static frontend (index.html, app.js, ...)
├── DOCKER/
│   ├── Dockerfile
│   ├
│   └── docker-compose.prod.yml
├── .env.example
└── readme.md
```

