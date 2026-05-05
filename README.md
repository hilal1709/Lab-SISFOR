# SISFOR Lab Booking System

Sistem peminjaman lab dengan UI neo brutalism menggunakan Next.js, PostgreSQL, shadcn/ui, GSAP, dan anime.js

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
- **Animations**: GSAP, anime.js
- **ORM**: Prisma
- **Form Validation**: React Hook Form, Zod

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
DATABASE_URL="postgresql://postgres:hilal123@localhost:5432/sisfor_lab"
NEXTAUTH_SECRET="your-secret-key-generate-with-openssl-rand-base64-32"
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
- `fullName` - Student full name
- `studentId` - Student ID
- `date` - Booking date
- `timeSlot` - Booking time (e.g., "09:30")
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
Fetch semua bookings

**Response:**
```json
[
  {
    "id": "...",
    "fullName": "John Doe",
    "studentId": "s-12345678",
    "date": "2026-05-10",
    "timeSlot": "09:30",
    "purpose": "Research",
    "status": "pending",
    "createdAt": "...",
    "updatedAt": "..."
  }
]
```

### POST /api/bookings
Create new booking

**Request:**
```json
{
  "fullName": "John Doe",
  "studentId": "s-12345678",
  "date": "2026-05-10",
  "timeSlot": "09:30",
  "purpose": "Research on polymer synthesis"
}
```

### GET /api/bookings/[id]
Get specific booking

### PATCH /api/bookings/[id]
Update booking status

**Request:**
```json
{
  "status": "approved"
}
```

### DELETE /api/bookings/[id]
Delete booking

## Usage

### For Users

1. Klik "SCHEDULE" di homepage untuk melihat jadwal
2. Pilih tanggal dan lihat ketersediaan time slot
3. Klik time slot yang tersedia untuk membuat booking
4. Isi form booking dengan data lengkap
5. Klik "SUBMIT BOOKING"
6. Tunggu approval dari admin

### For Admin

1. Klik "ADMIN" untuk masuk ke dashboard
2. Lihat semua pending bookings
3. Filter by status (pending, approved, rejected)
4. Klik "APPROVE" untuk menerima atau "REJECT" untuk menolak
5. Lihat statistik bookings

## Design Features

- **Neo Brutalism**: Bold borders, strong typography, high contrast
- **Color Scheme**: 
  - Primary: Lime (#a3e635)
  - Background: Dark gray (#0f0f0f, #1a1a1a)
  - Accents: White (#ffffff)
- **Animations**:
  - Page transitions dengan GSAP
  - Staggered element animations dengan anime.js
  - Interactive hover effects
  - Smooth micro-interactions

## Customization

### Update Colors

Edit `tailwind.config.js`:
```js
colors: {
  lime: {
    400: '#a3e635',
    500: '#84cc16',
  }
}
```

### Change PostgreSQL Credentials

Update `.env.local`:
```
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
```

### Modify Time Slots

Update array di `src/app/schedule/page.tsx`:
```typescript
const [slots, setSlots] = useState<TimeSlot[]>([
  { time: '07:30', available: true },
  // ...
])
```

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

2. Deploy `out/` directory

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

2. Verify DATABASE_URL in `.env.local`

3. Check credentials: `postgres:hilal123`

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
- Implement authentication untuk admin panel
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
