/*
 * Saodat Restoran — ikonka to'plami (emoji o'rniga)
 * Muallif: Ibrayimov Javohir
 *
 * Bir xil uslubdagi (stroke, 24x24) toza SVG ikonkalar — onlayn do'kon ko'rinishi.
 * Ishlatish: <Icon name="cart" size={22} color="var(--green)" />
 */

// Har bir element ichki SVG markup (currentColor stroke bilan)
const PATHS = {
  // Navigatsiya
  cart: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/>',
  back: '<path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/>',
  arrowRight: '<path d="M5 12h14"/><path d="M12 5l7 7-7 7"/>',
  close: '<path d="M18 6 6 18"/><path d="M6 6l12 12"/>',
  plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
  refresh: '<path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 3v5h-5"/>',
  eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
  eyeOff: '<path d="M9.9 5A9.7 9.7 0 0 1 12 5c6 0 10 7 10 7a13.4 13.4 0 0 1-2 2.7"/><path d="M6.6 6.6A13.3 13.3 0 0 0 2 12s4 7 10 7a9.7 9.7 0 0 0 5.4-1.6"/><path d="M2 2l20 20"/>',

  // Restoran / mahsulot
  utensils: '<path d="M7 3v8"/><path d="M4 3v5a3 3 0 0 0 6 0V3"/><path d="M7 11v10"/><path d="M17 3c-1.7 0-3 2.2-3 5s1.3 4 3 4"/><path d="M17 3v18"/>',
  scale: '<path d="M12 3v18"/><path d="M8 21h8"/><path d="M6 7h12"/><path d="M6 7 3 14a3 3 0 0 0 6 0L6 7z"/><path d="M18 7l-3 7a3 3 0 0 0 6 0l-3-7z"/>',
  gift: '<path d="M20 12v9H4v-9"/><path d="M2 7h20v5H2z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>',
  receipt: '<path d="M5 3v18l2-1 2 1 2-1 2 1 2-1 2 1V3l-2 1-2-1-2 1-2-1-2 1z"/><path d="M8 8h8"/><path d="M8 12h8"/><path d="M8 16h5"/>',
  trophy: '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.7V17c0 1-1 1.5-1.5 2 M14 14.7V17c0 1 1 1.5 1.5 2"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>',
  fire: '<path d="M12 2s4 4 4 8a4 4 0 0 1-8 0c0-1 .5-2 1-2.5C9 9 12 2 12 2z"/><path d="M12 22a6 6 0 0 0 6-6c0-3-2-5-3-6 0 2-1 3-2 3 .5-2-1-5-1-5s-6 3-6 8a6 6 0 0 0 6 6z"/>',

  // Buyurtma turlari
  dineIn: '<path d="M3 11h18"/><path d="M5 11V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4"/><path d="M4 11v6h16v-6"/><path d="M6 17v3"/><path d="M18 17v3"/>',
  delivery: '<path d="M2 4h11v11H2z"/><path d="M13 8h4l4 4v3h-8"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>',
  takeaway: '<path d="M5 8h14l-1 13H6L5 8z"/><path d="M8 8V6a4 4 0 0 1 8 0v2"/>',

  // To'lov
  card: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
  cash: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 9v6 M18 9v6"/>',
  lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  checkCircle: '<circle cx="12" cy="12" r="9"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/>',
  printer: '<path d="M6 9V2h12v7"/><rect x="6" y="13" width="12" height="8"/><path d="M6 17H4a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-2"/>',

  // Aloqa
  phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
  mail: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 7l10 6 10-6"/>',
  pin: '<path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
  chef: '<path d="M6 13v7a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-7"/><path d="M6 13a4 4 0 0 1-1-7.9A4 4 0 0 1 12 4a4 4 0 0 1 7 1.1A4 4 0 0 1 18 13H6z"/>',
  flash: '<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z"/>',

  // Admin
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 6 19.4l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 4.6 14H4a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 5 6.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 10 4.6V4a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8 1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>',
  trash: '<path d="M3 6h18"/><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>',
  box: '<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="M3 8l9 5 9-5"/><path d="M12 13v8"/>',
  chart: '<path d="M3 3v18h18"/><path d="M7 14v3"/><path d="M12 9v8"/><path d="M17 5v12"/>',
  download: '<path d="M12 3v12"/><path d="M7 11l5 5 5-5"/><path d="M5 21h14"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.8"/><path d="M21 15l-5-5L5 21"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M8 2v4"/><path d="M16 2v4"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2 20v-1a5 5 0 0 1 7-4.6"/><path d="M16 8a3.5 3.5 0 0 1 0 6.9"/><path d="M14 14.4A5 5 0 0 1 22 19v1"/>',
  clipboard: '<rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1"/><path d="M9 11h6"/><path d="M9 15h4"/>',
};

export default function Icon({ name, size = 24, color = 'currentColor', stroke = 2, fill = 'none', style, title }) {
  const inner = PATHS[name];
  if (!inner) return null;
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24"
      fill={fill} stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
      style={{ display: 'block', flexShrink: 0, ...style }}
      aria-hidden={title ? undefined : true} role={title ? 'img' : undefined}
      dangerouslySetInnerHTML={{ __html: (title ? `<title>${title}</title>` : '') + inner }}
    />
  );
}
