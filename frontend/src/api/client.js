import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

// Token tanlash:
//  - /mijoz/* endpointlari → mijoz tokeni
//  - POST /orders (mijoz kirgan, xodim emas) → mijoz tokeni (buyurtma hisobiga bog'lanadi)
//  - qolganlari → xodim (admin/kassir) tokeni
api.interceptors.request.use((config) => {
  const xodim = localStorage.getItem('token');
  const mijoz = localStorage.getItem('mijoz_token');
  const url = config.url || '';
  const method = (config.method || 'get').toLowerCase();

  const mijozEndpoint = url.startsWith('/mijoz');
  const buyurtmaYaratish = url === '/orders' && method === 'post';

  // Buyurtma berish — mijoz amali; mijoz tokeni bo'lsa o'shani ishlatamiz
  if ((mijozEndpoint || buyurtmaYaratish) && mijoz) {
    config.headers.Authorization = `Bearer ${mijoz}`;
  } else if (xodim) {
    config.headers.Authorization = `Bearer ${xodim}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    const url = err.config?.url || '';
    // Faqat XODIM tokeni eskirganda login sahifasiga yo'naltiramiz.
    // Mijoz endpointlari xatosini komponent o'zi ushlaydi.
    if (err.response?.status === 401 && !url.startsWith('/mijoz')) {
      const xodimTokeni = localStorage.getItem('token');
      if (xodimTokeni) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
