# SITARA

SITARA adalah prototype aplikasi internal untuk monitoring notulen rapat, keputusan, dan tindak lanjut. Aplikasi ini terdiri dari frontend React + Tailwind dan backend FastAPI dengan SQLite untuk lingkungan demo lokal.

## Fitur utama
- Login berbasis role
- Dashboard ringkasan rapat dan tindak lanjut
- Data rapat CRUD
- Live Input catatan rapat
- Decision Brief
- Monitoring tindak lanjut
- Laporan ringkasan
- Pengguna dan pengaturan dasar
- Audit log dasar

## Struktur proyek

- `frontend/` - aplikasi React + Vite
- `backend/` - aplikasi FastAPI dengan SQLAlchemy
- `docs/` - dokumentasi lanjutan (opsional)

## Persyaratan
- Node.js LTS
- Python 3.12

## Setup backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

Salin file `.env.example` ke `.env` bila diperlukan:

```bash
copy .env.example .env
```

Jalankan backend:

```bash
.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Setup frontend

```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0
```

Frontend default berjalan pada `http://localhost:5173`.

## Akun demo

- admin / Admin123!
- sekretariat / Sekretariat123!
- direktur / Direktur123!
- pic / Pic123!

## API docs

Setelah backend berjalan, buka:
- Swagger UI: http://localhost:8000/docs
- OpenAPI JSON: http://localhost:8000/openapi.json

## Verifikasi

Backend:

```bash
cd backend
set PYTHONPATH=%cd%
.venv\Scripts\python.exe -m pytest tests -q
```

Frontend:

```bash
cd frontend
npm run build
```

## Catatan asumsi
- Role awal dibuat: admin, secretariat, director, pic.
- Dashboard dan data demo bersifat simulasi untuk prototype.
- Data diproses di SQLite untuk demo lokal dan dapat diperluas ke PostgreSQL saat produksi.
