const BASE_URL = 'http://localhost:3000/api';
const _cache = new Map<string, any>();

function clearCacheByPrefix(prefix: string) {
  for (const key of _cache.keys()) {
    if (key.startsWith(prefix)) _cache.delete(key);
  }
}

export interface Impact {
  job_count: number;
  sum_profits: number;
}

async function get<T>(path: string): Promise<T> {
  if (_cache.has(path)) return _cache.get(path) as T;
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  const data = await res.json();
  _cache.set(path, data);
  return data;
}

export const api = {
  auth: {
    login: async (body: { email: string; password: string }) => {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      return data;
    },
    register: (body: object) =>
      fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }).then(r => r.json()),
    updateUser: (userId: string, body: object) =>
      fetch(`${BASE_URL}/auth/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }).then(r => r.json()),
    updatePassword: (userId: string, body: object) =>
      fetch(`${BASE_URL}/auth/password/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }).then(r => r.json()),
  },
  activities: {
    getAll: () => get<any[]>('/activities'),
    getOne: (id: string) => get<any>(`/activities/${id}`),
  },
  products: {
    getAll: () => get<any[]>('/products'),
    getOne: (id: string) => get<any>(`/products/${id}`),
  },
  reviews: {
    getAll: () => get<any[]>('/reviews'),
    getByItemId: (itemId: string) => get<any[]>(`/reviews/item/${itemId}`),
    getByUserId: (userId: string) => get<any[]>(`/reviews/user/${userId}`),
    getAvgByItemId: (itemId: string) => get<any>(`/reviews/avg/${itemId}`),
    getRatingByItemId: (itemId: string) => get<any>(`/reviews/rating/${itemId}`),
    create: (body: object) =>
      fetch(`${BASE_URL}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }).then(r => r.json()),
    update: (id: string, body: object) =>
      fetch(`${BASE_URL}/reviews/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }).then(r => r.json()),
    delete: (id: string) =>
      fetch(`${BASE_URL}/reviews/${id}`, { method: 'DELETE' }).then(r => r.json()),
  },
  orders: {
    getAll: () => get<any[]>('/orders'),
    getOne: (id: string) => get<any>(`/orders/${id}`),
    getByUserId: async (userId: string) => {
      const result = await get<any[]>(
        `/orders/user/${userId}`
      );

      clearCacheByPrefix('/orders');

      return result;
    },
    generateId: async () => {
      console.log("Here2");
      const res = await fetch(`${BASE_URL}/orders/generate-id`);
      console.log(res);
      return await res.json();
    },
    getByItemId: (itemId: string) => get<any[]>(`/orders/item/${itemId}`),
    create: async (body: object) => {
      const res = await fetch(`${BASE_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      clearCacheByPrefix('/orders');
      return data;
    },
    getImpact: () => get<Impact>('/orders/impact'),
  },
  promotions: {
    getAll: () => get<any[]>('/promotions'),
    getOne: (id: string) => get<any>(`/promotions/${id}`),
  },
  line: {
    payment: async (data: { order_id: string }) => {
      const res = await fetch(`${BASE_URL}/line/payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      return await res.json();
    }
  },
};
