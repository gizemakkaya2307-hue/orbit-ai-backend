# Backend Wrapper

Bu klasor, kanonik AI backend olan `../orbit-ai-backend` icin uyumluluk girisidir.

Standart gelistirme komutu:

```bash
cd backend
npm install
cp .env.example .env
npm start
```

Ne olur:

- `backend/server.js`, `../orbit-ai-backend/server.js` dosyasini calistirir.
- `backend/.env` varsa onu okur.
- `backend/.env` yoksa `orbit-ai-backend/.env` dosyasini kullanir.

Google Play icin deploy edilecek asil servis:

- `orbit-ai-backend/`

Bu nedenle production ayarlari ve Render blueprint oradadir:

- `../orbit-ai-backend/render.yaml`
