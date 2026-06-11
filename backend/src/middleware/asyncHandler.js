// Express 5 async xatolarni o'zi ushlaydigan bo'lsa ham,
// Express 4 uchun mos bo'lsin deb va stack trace aniq ko'rinishi uchun qoldirish
module.exports = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
