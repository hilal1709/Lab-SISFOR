# SISFOR Lab Booking System

Sistem peminjaman lab dengan UI neo brutalism menggunakan Next.js, PostgreSQL, shadcn/ui, Aceternity UI, dan Auth.js

## Fitur

✓ **Melihat Jadwal Peminjaman** - Lihat ketersediaan waktu untuk peminjaman lab
✓ **Form Peminjaman** - Isi form untuk mengajukan peminjaman lab
✓ **Admin Dashboard** - Panel CMS untuk melihat dan mengelola semua peminjaman
✓ **Approve/Reject Bookings** - Admin bisa menyetujui atau menolak peminjaman
✓ **Neo Brutalism Design** - UI bold dan modern dengan tema neo brutalism
✓ **Smooth Animations** - Animasi halus menggunakan GSAP dan anime.js

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL
- **UI Components**: shadcn/ui, Tailwind CSS
- **Animations**: GSAP, Swiper, Anime.js, AOS, dan Lottie
- **ORM**: Prisma
- **Autentikasi admin**: Auth.js Credentials dengan sesi JWT 24 jam

## Prerequisites

- Node.js 18+
- PostgreSQL 13+
- npm atau yarn

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup PostgreSQL

Pastikan PostgreSQL sudah terinstall dan berjalan. Buat database baru:

```sql
CREATE DATABASE sisfor_lab;
```

### 3. Configure Environment

Edit `.env.local`:

```
DATABASE_URL="postgresql://username:password@localhost:5432/sisfor_lab"
NEXTAUTH_URL="http://localhost:3000"
AUTH_SECRET="<secret acak unik>"
ADMIN_ID="<id admin>"
ADMIN_KEY="<kata sandi admin>"
```

### 4. Initialize Database

```bash
npx prisma migrate dev --name init
```

Ini akan:
- Membuat semua tables
- Generate Prisma Client
- Seed database (jika ada)

### 5. Start Development Server

```bash
npm run dev
```

Server akan berjalan di `http://localhost:3000`

## Project Structure

```
src/
├── app/
│   ├── page.tsx           # Landing page
│   ├── schedule/page.tsx  # Schedule view
│   ├── booking/page.tsx   # Booking form
│   ├── admin/page.tsx     # Admin dashboard
│   ├── api/
│   │   └── bookings/
│   │       ├── route.ts   # GET/POST bookings
│   │       └── [id]/route.ts  # GET/PATCH/DELETE booking
│   └── layout.tsx
├── globals.css            # Global styles
└── components/            # Reusable components (optional)

prisma/
└── schema.prisma          # Database schema
```

## Database Schema

### Booking Table
- `id` - Unique identifier (cuid)
- `fullName` - Nama lengkap peminjam
- `borrowerType` - `mahasiswa` atau `dosen`
- `studentId` - NIM, NIDN, atau NIP yang disimpan dengan nama kolom lama
- `date` - Booking date
- `timeSlots` - Daftar jam mulai sesi. `timeSlot` tetap berisi jam pertama untuk kompatibilitas.
- `purpose` - Purpose of lab usage
- `status` - pending | approved | rejected
- `createdAt` - Created timestamp
- `updatedAt` - Updated timestamp

### User Table
- `id` - Unique identifier
- `email` - User email
- `password` - Hashed password
- `role` - admin | staff
- `createdAt` - Created timestamp
- `updatedAt` - Updated timestamp

## API Endpoints

### GET /api/bookings
Daftar pengajuan khusus admin. Tambahkan `?date=YYYY-MM-DD` untuk jadwal publik yang mengembalikan `{ "timeSlot": "09:30" }` per sesi terisi.

**Response:**
```json
[
  {
    "id": "...",
    "fullName": "John Doe",
    "studentId": "s-12345678",
    "borrowerType": "mahasiswa",
    "date": "2026-05-10",
    "timeSlot": "09:30",
    "timeSlots": ["09:30", "11:30", "12:30"],
    "purpose": "Research",
    "status": "pending",
    "createdAt": "...",
    "updatedAt": "..."
  }
]
```

### POST /api/bookings
Ajukan satu atau beberapa sesi pada satu tanggal. Kirim `timeSlots` sebagai array JSON atau ulangi field `timeSlots` dalam `multipart/form-data` untuk menyertakan lampiran. Field `timeSlot` dan `studentId` dari klien lama tetap diterima.

**Request:**
```json
{
  "fullName": "John Doe",
  "borrowerType": "mahasiswa",
  "borrowerId": "s-12345678",
  "prodi": "sistem-informasi",
  "date": "2026-05-10",
  "timeSlots": ["09:30", "11:30", "12:30"],
  "purpose": "Praktikum basis data"
}
```

### GET /api/bookings/[id]
Ringkasan publik berdasarkan ID berisi ID, tanggal, daftar sesi, dan satu status pengajuan.

### PATCH /api/bookings/[id]
Perbarui pengajuan dengan sesi admin.

**Request:**
```json
{
  "status": "approved"
}
```

### DELETE /api/bookings/[id]
Hapus pengajuan dengan sesi admin.

## Penggunaan

Mahasiswa dan dosen memilih **Lihat jadwal**, membuka sesi yang tersedia, lalu dapat menambahkan sesi lain pada tanggal yang sama. Surat Korin opsional untuk semua peminjam dan menerima PDF, DOC, atau DOCX. KTM opsional untuk mahasiswa. Simpan satu ID dari bukti pengajuan untuk membuka **Cek status**.

Admin masuk melalui `/admin/login` dengan ID dan kata sandi yang dikonfigurasi di server. Buka **Detail** pada antrean untuk mengunduh lampiran, menyetujui, menolak, atau menghapus pengajuan. Galeri menerima unggahan foto dan URL gambar.

## Desain dan konfigurasi

Palet Bata & Pasir, tipografi, serta status interaktif diatur di `src/globals.css`. Ikon Potlab dan ilustrasi komputer Lottie disajikan dari folder `public`.

### Change PostgreSQL Credentials

Update `.env.local`:
```
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
```

### Modify Time Slots

Ubah daftar sesi di `src/lib/lab-time-slots.ts`. Semua tanggal jadwal menggunakan WIB.

## Deployment

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

### Deploy to Other Platforms

1. Build production:
```bash
npm run build
```

2. Jalankan `npm start` dengan URL aplikasi dan konfigurasi database yang sesuai.

**Note**: Pastikan PostgreSQL tersedia di production

## Troubleshooting

### Port Already in Use

```bash
# Find process on port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Database Connection Error

1. Check PostgreSQL is running:
```bash
psql -U postgres -c "select 1"
```

2. Verify `DATABASE_URL` in `.env.local`

3. Cocokkan kredensial pada `DATABASE_URL` dengan akun database.

### Prisma Migration Error

```bash
# Reset database
npx prisma migrate reset

# Or create new migration
npx prisma migrate dev --name fix_migration_name
```

## Performance Tips

- Use Prisma caching untuk database queries
- Implement pagination untuk large datasets
- Optimize images dan assets
- Enable Next.js Image Optimization

## Security Considerations

⚠️ **Important**: 
- Change default password di production
- Use HTTPS untuk production
- Atur `AUTH_SECRET`, `ADMIN_ID`, dan `ADMIN_KEY` pada environment server. Setelah migrasi dari sesi lama, admin perlu masuk kembali.
- Validate semua user inputs di backend
- Use environment variables untuk sensitive data

## Contributing

1. Create feature branch: `git checkout -b feature/nama-fitur`
2. Commit changes: `git commit -m "Add fitur"`
3. Push to branch: `git push origin feature/nama-fitur`
4. Open Pull Request

## License

MIT

## Support

Untuk pertanyaan atau issues, hubungi tim development.

---

**Made with 💚 by SISFOR Team**
