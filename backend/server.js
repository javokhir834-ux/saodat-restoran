/*
 * ============================================================
 *  Saodat Restoran — onlayn buyurtma tizimi (backend serveri)
 *  Muallif: Ibrayimov Javohir
 *  Express + Prisma + Socket.IO. Bu yer asosiy kirish nuqtasi.
 * ============================================================
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
// Mahalliy tarmoq (LAN) — telefon va boshqa qurilmalar kira olishi uchun origin'ni aks ettiramiz.
const io = new Server(server, {
  cors: {
    origin: true,
    methods: ['GET', 'POST'],
  },
});

app.set('io', io);

app.use(cors({ origin: true }));
app.use(express.json({ limit: '1mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'src/uploads')));

// Routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/mijoz', require('./src/routes/mijoz'));
app.use('/api/categories', require('./src/routes/categories'));
app.use('/api/products', require('./src/routes/products'));
app.use('/api/orders', require('./src/routes/orders'));
app.use('/api/tables', require('./src/routes/tables'));
app.use('/api/bookings', require('./src/routes/bookings'));
app.use('/api/stats', require('./src/routes/stats'));

app.get('/api/health', (req, res) => res.json({ holat: 'ishlayapti', vaqt: new Date() }));

// API 404 — JSON qaytadi, HTML emas
app.use('/api', (req, res) => res.status(404).json({ xato: 'Endpoint topilmadi' }));

// PRODUCTION: tayyorlangan frontend (Vite build) shu serverdan beriladi.
// Bitta domen — CORS muammosi yo'q, Socket.IO ham bir xil manzilda ishlaydi.
const DIST = path.join(__dirname, 'public');
if (fs.existsSync(DIST)) {
  app.use(express.static(DIST));
  // SPA — boshqa barcha yo'llar index.html ga (React Router o'zi hal qiladi)
  app.use((req, res) => res.sendFile(path.join(DIST, 'index.html')));
}

// Global xato ushlagich — har doim JSON
app.use((err, req, res, next) => {
  console.error('Xato:', err.message);
  if (err.code === 'P2025') return res.status(404).json({ xato: 'Topilmadi' });
  if (err.code === 'P2002') return res.status(409).json({ xato: 'Bu qiymat allaqachon mavjud' });
  res.status(err.status || 500).json({ xato: err.status ? err.message : 'Server xatosi' });
});

// Socket.IO
io.on('connection', (socket) => {
  // Kassir/admin token bilan ulansa — "kassir" xonasiga.
  // Mijoz PII (telefon va h.k.) faqat shu xonaga yuboriladi.
  const token = socket.handshake.auth?.token;
  if (token) {
    try {
      jwt.verify(token, process.env.JWT_SECRET);
      socket.join('kassir');
    } catch {
      // Token yaroqsiz — oddiy mijoz sifatida davom etadi
    }
  }

  // Mijoz o'z buyurtmasi xonasiga kiradi (faqat holat o'zgarishini oladi)
  socket.on('buyurtma_xonasiga_kir', (raqam) => {
    if (typeof raqam === 'string' && /^ORD-\d{8}-\d{4}$/.test(raqam)) {
      socket.join(`order_${raqam}`);
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server ishlamoqda: http://localhost:${PORT}`);
});
