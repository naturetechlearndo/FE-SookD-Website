import { useState, useEffect, useMemo } from 'react';
import { getCart, saveCart, removeFromCart, CartItem } from '../utils/cart';
import { trackEvent } from '../utils/gtag';

interface Props {
  currentUser?: any;
  onNavigate: (page: string) => void;
  lang?: 'TH' | 'ENG';
}

function driveThumb(url: string, size = 'w400'): string {
  const m = url?.match(/\/d\/([^/]+)\//);
  if (m) {
    const driveUrl = encodeURIComponent(`https://drive.google.com/thumbnail?id=${m[1]}&sz=${size}`);
    return `https://res.cloudinary.com/zgor0mh6/image/fetch/q_auto,f_auto/${driveUrl}`;
  }
  return url || '';
}

export default function CartPage({ currentUser: _currentUser, onNavigate, lang = 'TH' }: Props) {
  const isTH = lang === 'TH';
  const [items, setItems] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<{ product: boolean; activity: boolean }>({ product: true, activity: true });

  useEffect(() => {
    setItems(getCart());
  }, []);

  const persist = (next: CartItem[]) => {
    setItems(next);
    saveCart(next);
  };

  const toggleItem = (id: string) => {
    persist(items.map(i => i.id === id ? { ...i, checked: !i.checked } : i));
  };

  const toggleAll = () => {
    const allChecked = displayed.every(i => i.checked);
    const displayedIds = new Set(displayed.map(i => i.id));
    persist(items.map(i => displayedIds.has(i.id) ? { ...i, checked: !allChecked } : i));
  };

  const updateQty = (id: string, delta: number) => {
    persist(items.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i));
  };

  const removeItem = (id: string) => {
    const itemToRemove = items.find(i => i.id === id);
    if (itemToRemove) {
      trackEvent('remove_from_cart', {
        currency: 'THB',
        value: itemToRemove.price * itemToRemove.qty,
        items: [
          {
            item_id: itemToRemove.id,
            item_name: itemToRemove.name,
            price: itemToRemove.price,
            quantity: itemToRemove.qty
          }
        ]
      });
    }
    const next = items.filter(i => i.id !== id);
    setItems(next);
    removeFromCart(id);
  };

  const displayed = useMemo(() => {
    return items.filter(i => {
      const matchType = (filterType.product && i.itemType === 'product') || (filterType.activity && i.itemType === 'activity');
      const matchSearch = !search.trim() || i.name.toLowerCase().includes(search.trim().toLowerCase());
      return matchType && matchSearch;
    });
  }, [items, filterType, search]);

  const grouped = useMemo(() => {
    const map = new Map<string, CartItem[]>();
    displayed.forEach(item => {
      const key = item.sellerName?.trim() || 'อื่นๆ';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    });
    return map;
  }, [displayed]);

  const checkedItems = displayed.filter(i => i.checked);
  const allChecked = displayed.length > 0 && displayed.every(i => i.checked);
  const total = checkedItems.reduce((s, i) => s + i.price * i.qty, 0);

  const handlePayNow = () => {
    if (checkedItems.length === 0) return;
    trackEvent('begin_checkout', {
      currency: 'THB',
      value: total,
      items: checkedItems.map(item => ({
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        quantity: item.qty
      }))
    });
    onNavigate('checkout');
  };

  return (
    <div className="cart__page">
      {/* Header */}
      <div className="cart__header">
        <h1 className="cart__title">{isTH ? 'ตะกร้าสินค้า' : 'Cart'}</h1>
      </div>

      {/* Search */}
      <div className="cart__search-row">
        <div className="cart__search-wrap">
          <svg className="cart__search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            className="cart__search"
            type="text"
            placeholder="Search items..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="cart__controls">
          <label className="cart__filter-label">
            <input type="checkbox" checked={filterType.product} onChange={e => setFilterType(f => ({ ...f, product: e.target.checked }))} />
            <span>{isTH ? 'สินค้า' : 'Product'}</span>
          </label>
          <label className="cart__filter-label">
            <input type="checkbox" checked={filterType.activity} onChange={e => setFilterType(f => ({ ...f, activity: e.target.checked }))} />
            <span>{isTH ? 'กิจกรรม' : 'Activity'}</span>
          </label>
        </div>
      </div>

      {/* Items */}
      <div className="cart__body">
        {grouped.size === 0 && (
          <div className="cart__empty">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.2">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            <p>Your cart is empty</p>
          </div>
        )}

        {[...grouped.entries()].map(([seller, sellerItems], gi) => (
          <div key={seller} className="cart__group">
            {gi > 0 && <div className="cart__group-divider" />}
            {/* Group header */}
            <div className="cart__group-header">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              <span className="cart__group-name">{seller}</span>
            </div>

            {sellerItems.map(item => (
              <div key={item.id} className="cart__item">
                {/* Checkbox */}
                <button
                  className={`cart__item-check${item.checked ? ' cart__item-check--on' : ''}`}
                  onClick={() => toggleItem(item.id)}
                >
                  {item.checked && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </button>

                {/* Image */}
                <div className="cart__item-img-wrap">
                  {item.image ? (
                    <img
                      src={driveThumb(item.image)}
                      alt={item.name}
                      className="cart__item-img"
                      onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <div className="cart__item-img-ph">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="cart__item-info">
                  <span className="cart__item-name">{item.name}</span>
                  {item.itemType === 'product' && item.weightInfo && (
                    <span className="cart__item-sub">{item.weightInfo}</span>
                  )}
                  {item.itemType === 'activity' && (
                    <div className="cart__item-act-meta">
                      {item.actDate && <span className="cart__item-sub">Date: {item.actDate}</span>}
                      {item.actTime && (
                        <span className="cart__item-sub">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 2 }}>
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                          </svg>
                          Option: {item.actTime}
                        </span>
                      )}
                    </div>
                  )}
                  {/* Qty controls */}
                  <div className="cart__item-qty-row">
                    <button className="cart__qty-btn" onClick={() => updateQty(item.id, -1)}>&#x2212;</button>
                    <span className="cart__qty-val">{item.qty}</span>
                    <button className="cart__qty-btn" onClick={() => updateQty(item.id, 1)}>+</button>
                  </div>
                </div>

                {/* Price + trash */}
                <div className="cart__item-right">
                  <span className="cart__item-price">{(item.price * item.qty).toLocaleString()} ฿</span>
                  <button className="cart__trash-btn" onClick={() => removeItem(item.id)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6l-1 14H6L5 6"/>
                      <path d="M10 11v6M14 11v6"/>
                      <path d="M9 6V4h6v2"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Sticky bottom bar */}
      <div className="cart__bottom">
        <button
          className={`cart__all-check${allChecked ? ' cart__all-check--on' : ''}`}
          onClick={toggleAll}
        >
          {allChecked && (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          )}
        </button>
        <span className="cart__all-label">{isTH ? 'ทั้งหมด' : 'All'}</span>
        <div className="cart__bottom-total">
          {isTH ? 'รวมทั้งหมด' : 'Total'} : <strong>{total.toLocaleString()}</strong> {isTH ? 'บาท' : 'Baht'}
        </div>
        <button
          className="cart__pay-btn"
          onClick={handlePayNow}
          disabled={checkedItems.length === 0}
        >
          {isTH ? 'ชำระเงิน' : 'Pay Now'}
        </button>
      </div>
    </div>
  );
}

export const CART_CSS = `
.cart__page {
  min-height: 100vh;
  background: #fff;
  font-family: 'Kanit', sans-serif;
  padding-top: 64px;
  padding-bottom: 80px;
}

/* Header */
.cart__header {
  padding: 2rem 5% 1rem;
  max-width: 900px;
  margin: 0 auto;
}
.cart__title {
  font-size: 2.2rem;
  font-weight: 700;
  color: #111;
}

/* Search row */
.cart__search-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  max-width: 900px;
  margin: 0 auto 1.5rem;
  padding: 0 5%;
  flex-wrap: wrap;
}
.cart__search-wrap {
  flex: 1;
  min-width: 200px;
  position: relative;
  display: flex;
  align-items: center;
}
.cart__search-icon {
  position: absolute;
  left: .85rem;
  color: #aaa;
  pointer-events: none;
}
.cart__search {
  width: 100%;
  padding: .6rem .9rem .6rem 2.5rem;
  border: 1.5px solid #ddd;
  border-radius: 50px;
  font-size: .9rem;
  font-family: 'Kanit', sans-serif;
  outline: none;
  transition: border-color .2s;
}
.cart__search:focus { border-color: #2d6a4f; }

.cart__controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.cart__filter-label {
  display: flex;
  align-items: center;
  gap: .4rem;
  cursor: pointer;
  font-size: .88rem;
  color: #444;
  user-select: none;
}
.cart__filter-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: #2d6a4f;
  cursor: pointer;
}

/* Body */
.cart__body {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 5%;
}

.cart__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 5rem 0;
  color: #bbb;
  font-size: 1rem;
}

/* Group */
.cart__group { margin-bottom: .5rem; }
.cart__group-divider {
  height: 1px;
  background: #e5e5e5;
  margin: 1rem 0;
}
.cart__group-header {
  display: flex;
  align-items: center;
  gap: .6rem;
  padding: .65rem 0;
  color: #444;
}
.cart__group-name {
  font-size: .9rem;
  font-weight: 600;
  color: #333;
}

/* Item row */
.cart__item {
  display: grid;
  grid-template-columns: 36px 100px 1fr auto;
  gap: .85rem;
  align-items: center;
  padding: .85rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.cart__item-check {
  width: 22px;
  height: 22px;
  border-radius: 5px;
  border: 2px solid #ccc;
  background: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all .2s;
}
.cart__item-check--on {
  background: #2d6a4f;
  border-color: #2d6a4f;
  color: #fff;
}

.cart__item-img-wrap {
  width: 100px;
  height: 100px;
  border-radius: 10px;
  overflow: hidden;
  background: #e8f0eb;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.cart__item-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.cart__item-img-ph {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #bbb;
}

.cart__item-info {
  display: flex;
  flex-direction: column;
  gap: .3rem;
  min-width: 0;
}
.cart__item-name {
  font-size: .95rem;
  font-weight: 600;
  color: #111;
  line-height: 1.4;
}
.cart__item-sub {
  font-size: .78rem;
  color: #888;
  display: flex;
  align-items: center;
  gap: .25rem;
}
.cart__item-act-meta {
  display: flex;
  flex-direction: column;
  gap: .15rem;
}

.cart__item-qty-row {
  display: flex;
  align-items: center;
  gap: .5rem;
  margin-top: .35rem;
}
.cart__qty-btn {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 1.5px solid #bbb;
  background: none;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #555;
  transition: all .2s;
  line-height: 1;
}
.cart__qty-btn:hover { border-color: #2d6a4f; color: #2d6a4f; }
.cart__qty-val {
  font-size: .95rem;
  font-weight: 700;
  min-width: 22px;
  text-align: center;
}

.cart__item-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: .6rem;
  flex-shrink: 0;
}
.cart__item-price {
  font-size: 1rem;
  font-weight: 700;
  color: #111;
  white-space: nowrap;
}
.cart__trash-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #e53e3e;
  padding: .2rem;
  display: flex;
  align-items: center;
  transition: color .2s;
}
.cart__trash-btn:hover { color: #b91c1c; }

/* Sticky bottom bar */
.cart__bottom {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: #fff;
  border-top: 1px solid #e5e5e5;
  box-shadow: 0 -4px 20px rgba(0,0,0,.06);
  display: flex;
  align-items: center;
  gap: .75rem;
  padding: .85rem 5%;
  max-width: 100%;
}
.cart__all-check {
  width: 22px;
  height: 22px;
  border-radius: 5px;
  border: 2px solid #ccc;
  background: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all .2s;
  margin-left: 150px;
}
.cart__all-check--on {
  background: #2d6a4f;
  border-color: #2d6a4f;
  color: #fff;
}
.cart__all-label {
  font-size: .88rem;
  color: #555;
  white-space: nowrap;
}
.cart__bottom-total {
  flex: 1;
  text-align: right;
  font-size: .95rem;
  color: #333;
  padding-right: 1rem;
}
.cart__bottom-total strong {
  font-size: 1.1rem;
  color: #111;
}
.cart__pay-btn {
  padding: .7rem 2.2rem;
  background: #2d6a4f;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: .95rem;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Kanit', sans-serif;
  transition: background .2s;
  flex-shrink: 0;
  white-space: nowrap;
  margin-right: 150px;
}
.cart__pay-btn:hover:not(:disabled) { background: #1b4332; }
.cart__pay-btn:disabled { opacity: .55; cursor: default; }

@media (max-width: 1024px) {
  .cart__bottom {
    padding: .85rem 3%;
  }

  .cart__all-check {
    margin-left: 50px;
  }
}

@media (max-width: 768px) {
  .cart__bottom {
    gap: .5rem;
    padding: .75rem 1rem;
  }

  .cart__all-check {
    margin-left: 0;
    width: 20px;
    height: 20px;
  }

  .cart__all-label {
    font-size: .85rem;
  }

  .cart__bottom-total {
    font-size: .85rem;
    padding-right: .5rem;
  }

  .cart__pay-btn {
    padding: .6rem 1.2rem;
    font-size: .85rem;
  }
}

@media (max-width: 480px) {
  .cart__bottom {
    gap: .35rem;
    padding: .7rem .75rem;
  }

  .cart__all-label {
    display: none;
  }

  .cart__bottom-total {
    font-size: .8rem;
    padding-right: 0;
  }

  .cart__pay-btn {
    padding: .55rem 1rem;
    font-size: .8rem;
  }
}
`;
