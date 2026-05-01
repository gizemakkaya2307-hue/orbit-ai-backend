# Orbit AI Backend

Bu servis Orbit'in kanonik Node/Express AI backend'idir. Gemini, OpenRouter ve Groq API key'leri sadece server environment variables icinde tutulur; Android uygulamasi dogrudan AI provider'lara gitmez.

```text
Android -> Orbit AI Backend -> Gemini / OpenRouter / Groq
```

## Calistirma

Iki farkli giris noktasi vardir:

### 1. Kanonik yol

```bash
cd orbit-ai-backend
npm install
cp .env.example .env
npm start
```

### 2. Wrapper yol

```bash
cd backend
npm install
npm start
```

`backend/server.js`, `orbit-ai-backend/server.js` dosyasini calistiran uyumluluk katmanidir.
Wrapper kullanirsan `.env` dosyasini `backend/.env` icine koyabilirsin; wrapper bunu otomatik okur.

Varsayilan port:

- `3000`

Beklenen log:

```text
[orbit-ai] listening on http://0.0.0.0:3000 (model=gemini-2.0-flash, providerConfigured=true)
```

## .env

```properties
GEMINI_API_KEY=your_key
GROQ_API_KEY=your_key
OPENROUTER_API_KEY=your_key
AI_PROVIDER_ORDER=gemini,openrouter,groq,local
PORT=3000
```

Kurallar:

- En az bir provider key'i production icin ayarlanmalidir.
- `AI_PROVIDER_ORDER` sirasiyla provider dener; `local` backend fallback'ini temsil eder.
- API key yalniz burada tutulur.
- Android APK/AAB icine asla girmez.

## Endpointler

### `GET /health`

```json
{
  "ok": true,
  "service": "orbit-ai-backend",
  "providerConfigured": true,
  "model": "gemini-2.0-flash"
}
```

### `POST /ai/chat`

Request:

```json
{
  "message": "Today I have 3 tasks and 1 hour. What should I focus on?"
}
```

Success:

```json
{
  "reply": "Pick the most blocking task first...",
  "fallbackUsed": false,
  "providerConfigured": true
}
```

Provider fallback:

```json
{
  "reply": "Pick one critical task first...",
  "fallbackUsed": true,
  "providerConfigured": true,
  "providerErrorCode": "rate_limited"
}
```

### `POST /ai/generate-tasks`

Request:

```json
{
  "message": "Bu hafta matematik calisacagim, spor yapacagim ve bir fatura odeyecegim."
}
```

Success:

```json
{
  "tasks": [
    {
      "title": "Matematik calis",
      "description": "Temel konulari tekrar et",
      "category": "study",
      "priority": "medium",
      "estimatedMinutes": 45,
      "dueDate": "2026-04-29"
    }
  ],
  "fallbackUsed": false,
  "providerConfigured": true
}
```

Fallback:

```json
{
  "tasks": [
    {
      "title": "Yeni gorev",
      "description": "Mesajdan cikarilan ilk mantikli adim.",
      "category": "general",
      "priority": "medium",
      "estimatedMinutes": 25,
      "dueDate": "2026-04-29"
    }
  ],
  "fallbackUsed": true,
  "providerConfigured": true,
  "providerErrorCode": "rate_limited"
}
```

### `POST /ai/progress-summary`

Success:

```json
{
  "reply": "Bu hafta 12 gorev tamamladin...",
  "fallbackUsed": false,
  "providerConfigured": true
}
```

## Fallback Politikasi

AI provider gecici hata verirse backend 5xx ile kapanmak yerine:

- `reply` veya `tasks` doner
- `fallbackUsed=true` doner
- `providerErrorCode` ile nedeni etiketler

Bu sayede Android uygulamasi:

- crash olmaz
- kullaniciya backend'in aktif oldugunu
- fakat provider'in sinirli modda oldugunu
gosterebilir.

## Local Test

Health:

```bash
curl http://127.0.0.1:3000/health
```

Chat:

```bash
curl -X POST http://127.0.0.1:3000/ai/chat \
  -H "Content-Type: application/json" \
  -d "{\"message\":\"Bugun icin kisa bir motivasyon ver.\"}"
```

Task generation:

```bash
curl -X POST http://127.0.0.1:3000/ai/generate-tasks \
  -H "Content-Type: application/json" \
  -d "{\"message\":\"Bugun matematik calisacagim ve spor yapacagim.\"}"
```

## Render ile Production Deploy

Manuel Render adimlari:

1. GitHub'a `orbit-ai-backend` klasorunu iceren repoyu push et.
2. Render dashboard'da `New Web Service` olustur.
3. Repo'yu sec ve backend root olarak `orbit-ai-backend` kullan.
4. Build command:

```bash
npm install
```

5. Start command:

```bash
npm start
```

6. Environment variables ekle:
   - `GEMINI_API_KEY`
   - `GROQ_API_KEY`
   - `OPENROUTER_API_KEY`
   - `AI_PROVIDER_ORDER=gemini,openrouter,groq,local`
   - `NODE_ENV=production`
7. Deploy bitince health endpoint'ini test et:

```bash
curl https://<servis-adi>.onrender.com/health
```

8. Android release base URL'ini `local.properties` icinde Render URL ile guncelle:

```properties
ORBIT_API_BASE_URL_RELEASE=https://<servis-adi>.onrender.com/
```

9. Release build al. Gradle, release URL HTTPS degilse veya local/private IP ise build'i durdurur.

Not:

- Repo icinde Render blueprint icin `render.yaml` vardir.
- Release build cleartext HTTP kabul etmez; production URL mutlaka HTTPS olmalidir.

## Android URL Ayarlari

- Debug URL: root `local.properties` icindeki `ORBIT_API_BASE_URL_DEBUG`; varsayilan `http://10.0.2.2:3000/`.
- Release URL: root `local.properties` icindeki `ORBIT_API_BASE_URL_RELEASE`; Play icin public HTTPS Render URL'i olmalidir.
- Android tarafinda tek kaynak `app/build.gradle.kts` icindeki `BuildConfig.ORBIT_API_BASE_URL` alanidir.

## Release Kontrol Listesi

- Debug build local backend ile `/health`, `/ai/chat`, `/ai/generate-tasks` test edildi.
- Release build public HTTPS backend ile test edildi.
- Canli `/health` endpoint'i `ok: true` donuyor.
- AI chat canli backend uzerinden cevap veriyor.
- AI task generation canli backend uzerinden gorev uretiyor.
- Release APK/AAB icinde `localhost`, `10.0.2.2`, `192.168.` veya provider API key yok.
