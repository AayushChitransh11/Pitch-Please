# Pitch Please backend

The new frontend is connected to this Express backend. Rehearsals are recorded, transcribed using ElevenLabs Scribe, and then evaluated by AWS Bedrock for grammar, delivery, structure, and alignment with uploaded materials. The voice orb shares the recording microphone stream.

## Run

Use Node 24. From this project directory, run `npm ci --prefix backend` and `npm ci --prefix frontend`. The existing backend `.env` has been reused; keep secrets there. Start `npm start --prefix backend` and, in another terminal, `npm run dev --prefix frontend`. Defaults are backend port 4000 and frontend port 8080, with a Vite proxy. Stop older copies using those ports first.

Required backend settings: `ELEVENLABS_API_KEY`, `AWS_REGION`, `BEDROCK_MODEL_ID`, and AWS credentials through the SDK credential chain. Temporary AWS credentials require all three access key, secret key, and session token values. Restart the backend after refreshing credentials. ElevenLabs needs speech-to-text permission; no agent ID or conversation permission is needed.

## Files and storage

Upload PDF, DOC, DOCX, PPT, PPTX, or TXT, up to 10 MB each. Office/text files are converted to PDF by LibreOffice, configured with `LIBREOFFICE_BIN`. The slideshow displays the resulting pages. Extraction supports up to 50 pages and 40,000 characters, and does not perform OCR on scanned pages. Conversion can change fonts/layout and flattens animations.

Sessions, converted files, transcripts and reports persist in `backend/data/pitch.sqlite`. SQLite is used for this local application; MongoDB is not required. A session bearer token is stored in the browser tab. Clearing tab storage loses access to that session. Original rehearsal audio stays in browser memory for playback and is sent to ElevenLabs for transcription.

## API

- `GET /health`: configuration status.
- `POST /api/coach`: preparation assistance.
- `POST /api/sessions`: save a presentation brief and receive its access token.
- `GET /api/sessions/:id`: saved brief and document metadata.
- `POST /api/sessions/:id/documents`: upload raw document bytes with `X-File-Name`.
- `GET /api/sessions/:id/documents/:documentId/file`: converted PDF.
- `POST /api/sessions/:id/transcribe`: upload recorded audio and receive transcript ID/text.
- `POST /api/sessions/:id/practice`: evaluate transcript, duration and optional transcription ID.
- `GET /api/practice/:id`: read the saved report.
- `DELETE /api/sessions/:id`: delete a session and its reports.

Session/report endpoints require `Authorization: Bearer <sessionToken>` except session creation. This is a local capability token, not production account authentication.

## Verification and deployment

Run `npm test --prefix backend`, `npm test --prefix frontend`, and `npm run build --prefix frontend`. Provider tests use controlled adapters; live provider checks require current credentials. Errors preserve the transcript and allow evaluation retries without another recording.

The server binds to loopback and refuses production mode. Public deployment still needs account authentication, quotas, HTTPS and a deployment-specific storage plan. DeepSpace Workers cannot directly run this Node/LibreOffice process: retain it as a separate container backend or migrate the API and conversion architecture. The earlier DeepSpace scaffold is not a deployed version of this app.
