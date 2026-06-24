const BASE_URL = 'http://localhost:3000/api';

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json();
}

export const api = {
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
    getByUserId: (userId: string) => get<any[]>(`/orders/user/${userId}`),
    getByItemId: (itemId: string) => get<any[]>(`/orders/item/${itemId}`),
    create: (body: object) =>
      fetch(`${BASE_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }).then(r => r.json()),
  },
  promotions: {
    getAll: () => get<any[]>('/promotions'),
    getOne: (id: string) => get<any>(`/promotions/${id}`),
  },
};
