# FrequencyMail — Temp Email di Domain Sendiri

Web temp email (disposable inbox) dengan domain sendiri, MongoDB, dan update realtime lewat Socket.IO. UI glassmorphism, dark/light mode, mobile responsive.

## Fitur

- Generate alamat email sekali pakai (random atau custom username)
- Multi domain — pilih dari domain yang kamu daftarkan
- Inbox realtime (Socket.IO) — email baru langsung muncul tanpa refresh
- Baca email HTML dengan aman (sandboxed iframe + sanitasi di backend)
- Search inbox, hapus per-email atau clear semua
- Auto-expire: email otomatis terhapus dari MongoDB setelah TTL yang kamu atur (default 24 jam) — sesuai sifat "temp"
- Dark/Light mode, mobile responsive
- Siap deploy: frontend → Vercel, backend → Railway/Render/VPS mana saja

## Kenapa ada 3 folder, bukan cuma frontend?

Vercel (serverless) **tidak bisa** menerima koneksi SMTP masuk atau menahan koneksi Socket.IO yang persisten. Jadi proyek ini dipecah jadi 3 bagian yang saling terhubung:

```
┌─────────────┐        ┌──────────────────┐        ┌─────────────────────┐
│   Domain     │ email  │ Cloudflare Email  │  POST  │   backend/           │
│   kamu       │──────► │ Routing + Worker  │───────►│   Express + Socket.IO │
│ (MX record)  │        │ (parse w/         │webhook │   + MongoDB           │
└─────────────┘        │  postal-mime)     │        │   (Railway/Render/VPS)│
                        └──────────────────┘        └──────────┬───────────┘
                                                                 │ REST API +
                                                                 │ Socket.IO
                                                                 ▼
                                                        ┌─────────────────┐
                                                        │  frontend (kamu  │
                                                        │  di sini) →      │
                                                        │  Vercel           │
                                                        └─────────────────┘
```

| Bagian | Isi | Deploy ke |
|---|---|---|
| `/` (root) | Frontend Vite + Tailwind | **Vercel** |
| `/backend` | REST API + Socket.IO + MongoDB | Railway / Render / VPS apa saja yang jalanin Node persisten |
| `/cloudflare-worker` | Nangkep email masuk, parse, forward ke backend | Cloudflare (gratis) |

## Setup — urutan yang disarankan

### 1. MongoDB Atlas (gratis)

1. Buat cluster gratis di [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Database Access → buat user + password.
3. Network Access → Allow Access from Anywhere (`0.0.0.0/0`) supaya backend di Railway/Render bisa connect.
4. Connect → Drivers → copy connection string, nanti dipakai sebagai `MONGODB_URI`.

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Isi `.env`:
- `MONGODB_URI` — dari langkah 1
- `DOMAINS` — domain-domain kamu, pisahkan koma, contoh: `mail1.com,mail2.com`
- `WEBHOOK_SECRET` — string random panjang, generate dengan `openssl rand -hex 32`
- `CORS_ORIGIN` — nanti diisi URL Vercel frontend kamu (boleh `http://localhost:5173` dulu buat testing lokal)

Jalankan lokal:
```bash
npm run dev
# GET http://localhost:4000/health -> {"ok":true}
```

Deploy (contoh pakai Railway, Render/Fly.io caranya mirip):
1. Push folder `backend/` sebagai repo (atau repo terpisah), connect ke Railway.
2. Set semua env var dari `.env` di dashboard Railway.
3. Start command: `npm start`.
4. Setelah deploy, catat URL publiknya, misal `https://tempmail-backend.up.railway.app` — ini dipakai di dua tempat lain di bawah.

### 3. Cloudflare Email Routing (per domain)

Domain kamu **harus pakai nameserver Cloudflare** untuk fitur ini.

1. Tambahkan domain ke Cloudflare, ganti nameserver di registrar sesuai instruksi Cloudflare.
2. Di dashboard: **Compute > Email Service > Email Routing** → **Onboard Domain**. Cloudflare otomatis nambahin MX + SPF + DKIM record.
3. Ulangi langkah ini untuk setiap domain tambahan (multi-domain = ulang langkah 2 & 3 per domain, worker-nya tetap sama, lihat langkah 4).

### 4. Cloudflare Email Worker

```bash
cd cloudflare-worker
npm install
npx wrangler login
```

Edit `wrangler.toml` → set `BACKEND_WEBHOOK_URL` ke `https://<backend-kamu>/api/inbound`.

```bash
npx wrangler deploy
npx wrangler secret put WEBHOOK_SECRET
# paste nilai yang sama persis dengan WEBHOOK_SECRET di backend/.env
```

Lalu sambungkan domain ke worker ini:
1. **Compute > Email Service > Email Routing > Routing Rules** (pilih domain-nya).
2. Aktifkan **Catch-all rule** → Action = **Send to a Worker** → pilih `tempmail-email-worker`.
3. Ulangi untuk domain lain — semua bisa diarahkan ke worker yang sama.

Tes cepat: kirim email dari Gmail ke `siapa-aja@domainkamu.com`, cek log dengan `npx wrangler tail`.

### 5. Frontend

```bash
cp .env.example .env
npm install
```

Isi `.env`:
```
VITE_API_URL=https://<backend-kamu>/api
VITE_SOCKET_URL=https://<backend-kamu>
```

Jalankan lokal:
```bash
npm run dev
```

Deploy ke Vercel:
```bash
npx vercel
```
atau lewat dashboard Vercel (import repo ini, root directory = root repo). Jangan lupa set `VITE_API_URL` dan `VITE_SOCKET_URL` sebagai Environment Variables di project Vercel, lalu redeploy.

Terakhir, balik ke backend → update `CORS_ORIGIN` dengan URL Vercel yang baru jadi, redeploy backend.

## Testing tanpa nunggu email asli

Simulasikan webhook inbound langsung dengan curl (ganti secret & url):

```bash
curl -X POST http://localhost:4000/api/inbound \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: <WEBHOOK_SECRET kamu>" \
  -d '{
    "to": "test@domainkamu.com",
    "from": "pengirim@contoh.com",
    "fromName": "Contoh Pengirim",
    "subject": "Halo dari curl",
    "text": "Ini isi email plain text.",
    "html": "<p>Ini <b>isi</b> email HTML.</p>"
  }'
```

Buka frontend, generate address `test@domainkamu.com`, harusnya email langsung muncul realtime.

## Keamanan yang sudah dibangun

- **Sanitasi HTML** di backend (`sanitize-html`) sebelum email disimpan — strip `<script>`, event handler, dsb.
- **Sandboxed iframe** (`sandbox="allow-same-origin"`, tanpa `allow-scripts`) saat render email di frontend — lapis kedua, email tidak bisa menjalankan JS apa pun.
- **Webhook secret** — endpoint `/api/inbound` menolak request tanpa header `x-webhook-secret` yang cocok.
- **Rate limiting** di endpoint publik dan endpoint inbound.
- **TTL index MongoDB** — email otomatis kehapus sendiri setelah `MAIL_TTL_SECONDS`, jadi database tidak membengkak.

## Kustomisasi

- **Ganti TTL**: ubah `MAIL_TTL_SECONDS` di `backend/.env`, restart backend (index MongoDB auto-update).
- **Ganti warna/tema**: edit CSS variable di `src/styles.css` (`--color-void`, `--color-cyan`, `--color-violet`, `--color-magenta`).
- **Tambah domain baru**: tambahkan ke `DOMAINS` di backend env, lalu ulangi setup Cloudflare Email Routing (langkah 3 & 4) untuk domain itu.
- **Ganti gaya generate username**: edit daftar kata di `backend/utils/generateAddress.js`.

## Struktur folder

```
tempmail/
├── index.html, package.json, vite.config.js, tailwind.config.js,
│   postcss.config.js, vercel.json, .env.example   ← frontend (Vercel)
├── public/favicon.svg
├── src/
│   ├── main.js, App.js, api.js, socket.js, styles.css
│   ├── components/
│   │   ├── Header.js, Sidebar.js, Inbox.js, MailItem.js,
│   │   └── MailView.js, Toast.js, Loader.js, ThemeToggle.js
│   └── utils/ storage.js, helpers.js
├── backend/                                        ← Railway/Render/VPS
│   ├── server.js, package.json, .env.example
│   ├── config/db.js
│   ├── models/Email.js
│   ├── routes/ mailRoutes.js, inboundRoutes.js
│   ├── sockets/index.js
│   ├── middleware/ verifyWebhookSecret.js, rateLimiter.js, errorHandler.js
│   └── utils/ generateAddress.js, sanitizeHtml.js
└── cloudflare-worker/                               ← Cloudflare (gratis)
    ├── wrangler.toml, package.json
    └── src/worker.js
```
