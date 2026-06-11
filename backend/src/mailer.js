/*
 * Saodat Restoran — email yuborish (tasdiqlash kodi)
 * Muallif: Ibrayimov Javohir
 *
 * Gmail orqali yuborish uchun .env ga quyidagilarni qo'shing:
 *   GMAIL_USER=sizning_pochta@gmail.com
 *   GMAIL_APP_PASSWORD=abcd efgh ijkl mnop   (Google "App Password", oddiy parol EMAS)
 *
 * Agar bu sozlamalar bo'lmasa — "dev rejim": kod konsolga chiqadi va
 * API javobida qaytadi (sinab ko'rish uchun). Haqiqiy pochta yuborilmaydi.
 */
const nodemailer = require('nodemailer');

const USER = process.env.GMAIL_USER;
const PASS = process.env.GMAIL_APP_PASSWORD;
const sozlangan = Boolean(USER && PASS);

// Transport faqat bir marta yaratiladi
let transport = null;
if (sozlangan) {
  transport = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: USER, pass: PASS },
    connectionTimeout: 10000,   // 10s — ulanmasа qotib qolmaydi
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
}

function emailSozlanganmi() {
  return sozlangan;
}

// Tasdiqlash kodini chiroyli HTML xat sifatida yuboradi.
// Qaytadi: true — haqiqiy yuborildi; false — dev rejim (yuborilmadi).
async function tasdiqKodYubor(email, ism, kod) {
  if (!sozlangan) {
    console.log(`\n📧 [DEV] ${email} uchun tasdiqlash kodi: ${kod}\n`);
    return false;
  }

  await transport.sendMail({
    from: `"Saodat Restoran" <${USER}>`,
    to: email,
    subject: `Saodat — tasdiqlash kodi: ${kod}`,
    html: `
      <div style="max-width:480px;margin:0 auto;font-family:Segoe UI,Arial,sans-serif;background:#FAF7F0;border-radius:16px;overflow:hidden;border:1px solid #E0D8C8">
        <div style="background:#0F4D3C;padding:24px 24px 20px;text-align:center">
          <div style="color:#E8C97A;font-size:13px;letter-spacing:2px;text-transform:uppercase">Restoran</div>
          <div style="color:#FAF7F0;font-size:26px;font-weight:700;margin-top:4px">Saodat</div>
        </div>
        <div style="padding:28px 24px">
          <p style="color:#2C2C2A;font-size:15px;margin:0 0 8px">Assalomu alaykum${ism ? ', ' + ism : ''}!</p>
          <p style="color:#888780;font-size:14px;margin:0 0 20px">Hisobingizni tasdiqlash uchun quyidagi kodni kiriting:</p>
          <div style="background:#fff;border:2px dashed #0F4D3C;border-radius:14px;padding:18px;text-align:center">
            <div style="font-size:34px;font-weight:800;letter-spacing:10px;color:#0F4D3C">${kod}</div>
          </div>
          <p style="color:#888780;font-size:13px;margin:18px 0 0">Kod 10 daqiqa amal qiladi. Agar bu siz bo'lmasangiz, xatni e'tiborsiz qoldiring.</p>
        </div>
        <div style="background:#0F4D3C;padding:14px;text-align:center;color:#9FBDB0;font-size:12px">
          Saodat Restoran · Samarqand
        </div>
      </div>`,
  });
  return true;
}

module.exports = { tasdiqKodYubor, emailSozlanganmi };
