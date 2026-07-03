# Multilingual Translation API & AuraTranslate Dashboard

A fully featured Translation API and frontend dashboard that allows you to translate JSON and CSV language files seamlessly. The application features a premium, modern **Light Pastel Theme** dashboard for interactive file uploads, setting configurations, authentication renewal, and live translation previews.

---

## Features

- **Gorgeously Styled Dashboard**: Modern, light pastel UI (soft lavender, mint, and blue accents, glassmorphic cards, smooth animations, and Outfit typography) served at the root `/` path.
- **Demo JSON Inputs**: Ready-to-use sample JSON inputs (`Simple`, `Dashboard UI`, and `E-commerce`) available in the dashboard to load directly or download.
- **JSON File Translation**: Upload keys, translate them, and retrieve structured JSON translations.
- **CSV Export Support**: Extract translations directly into standard CSV formats.
- **JWT Authentication**: Secured routing with self-renewing token state on the dashboard.
- **Swagger Documentation**: Self-documenting API spec available at `/api-docs`.
- **Translation Caching**: Fast re-runs and reduced cost via `node-cache`.
- **Bulk Translation Optimization**: Translations executed in parallel batches of 5.
- **Docker Support**: Containerized configuration for easy deployment.

---

## Installation & Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Create a `.env` file in the root directory (already pre-configured for local testing):
   ```env
   PORT=3000
   JWT_SECRET=IT4TSOLUTIONS
   ```

---

## Run Locally

Start the translation server:
```bash
npm start
```
Or run in development mode with nodemon:
```bash
npm run dev
```

The app will be running at **[http://localhost:3000](http://localhost:3000)**:
- **Interactive Playground / Dashboard**: [http://localhost:3000](http://localhost:3000)
- **API Swagger Documentation**: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

---

## API Endpoints

### 1. Authentication
* **Endpoint**: `POST /api/auth/login`
* **Response**: Generates a JWT token for translation authorization.

### 2. Translation
* **Endpoint**: `POST /api/translate`
* **Headers**: `Authorization: Bearer <JWT_TOKEN>`
* **Content-Type**: `multipart/form-data`
* **Parameters**:
  - `file`: JSON translation file (binary)
  - `Code`: Translation namespace (e.g. `shared`, `dashboard`)
  - `LanguageCode`: Target language code (e.g. `es`, `fr`, `de`, `ar`, `hi`, `ja`)
  - `filetype`: Format of output (`json` or `csv`)

---

## Docker Deployment

1. **Build the container**:
   ```bash
   docker build -t multilingual-api .
   ```

2. **Run the container**:
   ```bash
   docker run -p 3000:3000 -e PORT=3000 -e JWT_SECRET=IT4TSOLUTIONS multilingual-api
   ```
   Access the app in your browser at `http://localhost:3000`.

