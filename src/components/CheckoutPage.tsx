import { useState, useEffect } from 'react';
import { getCart, saveCart, CartItem } from '../utils/cart';
import { api } from '../services/api';

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

function getTierDiscount(points: number): { tier: string; pct: number } {
  if (points >= 1000) return { tier: 'Legend', pct: 0.20 };
  if (points >= 500)  return { tier: 'Gold',   pct: 0.10 };
  if (points >= 200)  return { tier: 'Silver',  pct: 0.05 };
  return                     { tier: 'Nature',  pct: 0 };
}

export default function CheckoutPage({ currentUser, onNavigate, lang = 'TH' }: Props) {
  const isTH = lang === 'TH';
  const [items, setItems] = useState<CartItem[]>([]);
  const [placing, setPlacing] = useState(false);
  const [orderErr, setOrderErr] = useState('');
  const [userPoints, setUserPoints] = useState(0);

  useEffect(() => {
    const all = getCart();
    setItems(all.filter(i => i.checked));
  }, []);

  useEffect(() => {
    if (!currentUser?.user_id) return;
    api.orders.getByUserId(currentUser.user_id)
      .then((orders: any[]) => {
        const pts = orders
          .filter((o: any) => o.order_status === 'completed')
          .reduce((s: number, o: any) => s + Math.floor(Number(o.total_price || 0) / 100), 0);
        setUserPoints(pts);
      })
      .catch(() => {});
  }, [currentUser?.user_id]);

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const { tier: memberTier, pct: discountPct } = getTierDiscount(userPoints);
  const discount = Math.floor(subtotal * discountPct);
  const totalAmount = subtotal - discount;

  const grouped = new Map<string, CartItem[]>();
  items.forEach(item => {
    const key = item.sellerName?.trim() || 'อื่นๆ';
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(item);
  });

  const handlePlaceOrder = async () => {
    if (placing || items.length === 0) return;
    setPlacing(true);
    setOrderErr('');
    try {
      const results = await Promise.all(
        items.map(item =>
          api.orders.create({
            user_id: currentUser?.user_id || '',
            order_date: new Date().toISOString().split('T')[0],
            item_id: item.itemId,
            quantity: item.qty,
            total_price: Math.round(item.price * item.qty * (1 - discountPct)),
            order_status: item.itemType === 'activity' ? 'completed' : 'processing',
            shipping_address: currentUser?.address || '',
            act_date: item.actDate || '',
            act_time: item.actTime || '',
            applied_promotion_id: '',
          })
        )
      );
      const failed = results.filter(r => r && r.success === false);
      if (failed.length > 0) {
        setOrderErr(isTH ? 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' : 'Order failed, please try again.');
        return;
      }
      const all = getCart();
      const checkedIds = new Set(items.map(i => i.id));
      saveCart(all.filter(i => !checkedIds.has(i.id)));
      onNavigate('home');
    } catch (err) {
      console.error('Order failed:', err);
      setOrderErr(isTH ? 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่' : 'Cannot connect to server, please try again.');
    } finally {
      setPlacing(false);
    }
  };

  const firstName = currentUser?.first_name || '';
  const lastInitial = currentUser?.last_name ? currentUser.last_name.charAt(0) + '.' : '';
  const userName = [firstName, lastInitial].filter(Boolean).join(' ') || 'Guest';
  const phone = currentUser?.phone_number || '';
  const address = currentUser?.address || '';

  return (
    <div className="co__page">
      <div className="co__head-bar">
        <h1 className="co__title">{isTH ? 'ชำระเงิน' : 'Checkout'}</h1>
      </div>

      <div className="co__content">
        {/* Address */}
        <div className="co__address-card">
          <div className="co__addr-row">
            <svg className="co__pin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            <div className="co__addr-info">
              <div className="co__addr-name-row">
                <span className="co__addr-name">{userName}</span>
                {phone && <span className="co__addr-phone">{phone}</span>}
              </div>
              {address && <div className="co__addr-detail">{address}</div>}
            </div>
            <button className="co__edit-addr-btn">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Edit Address
            </button>
          </div>
        </div>

        <div className="co__divider" />

        {/* Items grouped by seller */}
        {[...grouped.entries()].map(([seller, sellerItems]) => (
          <div key={seller} className="co__group">
            <div className="co__group-header">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              <span className="co__group-name">{seller}</span>
            </div>
            {sellerItems.map(item => (
              <div key={item.id} className="co__item">
                <div className="co__item-img-wrap">
                  {item.image ? (
                    <img src={driveThumb(item.image)} alt={item.name} className="co__item-img"
                      onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                  ) : (
                    <div className="co__item-img-ph">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                    </div>
                  )}
                </div>
                <div className="co__item-info">
                  <span className="co__item-name">{item.name}</span>
                  {item.itemType === 'product' && item.weightInfo && (
                    <span className="co__item-sub">{item.weightInfo}</span>
                  )}
                  {item.itemType === 'activity' && (
                    <div className="co__item-act-meta">
                      {item.actDate && <span className="co__item-sub">Date: {item.actDate}</span>}
                      {item.actTime && <span className="co__item-sub">Option: {item.actTime}</span>}
                    </div>
                  )}
                </div>
                <div className="co__item-right">
                  <span className="co__item-qty">
                    {item.itemType === 'activity' && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                      </svg>
                    )}
                    x {item.qty}
                  </span>
                  <span className="co__item-price">{(item.price * item.qty).toLocaleString()} {isTH ? 'บาท' : 'Baht'}</span>
                </div>
              </div>
            ))}
            <div className="co__divider" />
          </div>
        ))}

        {/* Payment Summary */}
        <div className="co__payment-summary">
          <h3 className="co__summary-title">{isTH ? 'สรุปยอดชำระเงิน' : 'Payment Summary'}</h3>
          <div className="co__summary-rows">
            <div className="co__summary-row">
              <span>{isTH ? 'ยอดรวม' : 'Subtotal'}</span>
              <span>{subtotal.toLocaleString()} {isTH ? 'บาท' : 'Baht'}</span>
            </div>
            <div className="co__summary-row">
              <span>
                {isTH ? 'ส่วนลด' : 'Discount'}
                {discountPct > 0 && (
                  <span style={{ marginLeft: '0.4rem', fontSize: '.75rem', color: '#2d6a4f', fontWeight: 600 }}>
                    ({memberTier} {Math.round(discountPct * 100)}%)
                  </span>
                )}
              </span>
              <span style={{ color: discountPct > 0 ? '#c0392b' : undefined }}>
                {discountPct > 0 ? '-' : ''}{discount.toLocaleString()} {isTH ? 'บาท' : 'Baht'}
              </span>
            </div>
            <div className="co__divider co__divider--thin" />
            <div className="co__summary-row co__summary-row--total">
              <span>{isTH ? 'ยอดรวมทั้งสิ้น' : 'Total Amount'}</span>
              <span>{totalAmount.toLocaleString()} {isTH ? 'บาท' : 'Baht'}</span>
            </div>
          </div>
        </div>

        <div className="co__divider" />
      </div>

      {/* Sticky bottom */}
      {orderErr && <p style={{ color: '#e53935', textAlign: 'center', padding: '0.5rem 5%', fontSize: '0.88rem' }}>{orderErr}</p>}
      <div className="co__bottom">
        <div className="co__bottom-total">
          <strong>{totalAmount.toLocaleString()} {isTH ? 'บาท' : 'Baht'}</strong>
        </div>
        <button className="co__place-btn" onClick={handlePlaceOrder} disabled={placing || items.length === 0}>
          {placing ? (isTH ? 'กำลังดำเนินการ...' : 'Processing...') : (isTH ? 'ยืนยันการสั่งซื้อ' : 'Place Order')}
        </button>
      </div>
    </div>
  );
}

export const CHECKOUT_CSS = `
.co__page {
  min-height: 100vh;
  background: #fff;
  font-family: 'Kanit', sans-serif;
  padding-top: 64px;
  padding-bottom: 100px;
}
.co__head-bar {
  background: #dce5dc;
  padding: 1.5rem 5%;
}
.co__title {
  font-size: 1.6rem;
  font-weight: 700;
  color: #1a1a1a;
  max-width: 900px;
  margin: 0 auto;
  display: block;
}
.co__content {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 5%;
}
.co__divider {
  height: 1px;
  background: #e0e0e0;
  margin: 1.25rem 0;
}
.co__divider--thin { margin: .6rem 0; }

/* Address */
.co__address-card { padding: 1.5rem 0 .75rem; }
.co__addr-row {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}
.co__pin { color: #2d6a4f; margin-top: .15rem; flex-shrink: 0; }
.co__addr-info { flex: 1; }
.co__addr-name-row {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  margin-bottom: .4rem;
}
.co__addr-name { font-weight: 700; font-size: 1rem; color: #111; }
.co__addr-phone { font-size: .9rem; color: #666; }
.co__addr-detail { font-size: .86rem; color: #555; line-height: 1.55; }
.co__edit-addr-btn {
  display: flex;
  align-items: center;
  gap: .4rem;
  padding: .45rem 1rem;
  border: 1.5px solid #c8b89a;
  border-radius: 50px;
  background: #fff;
  color: #8a7350;
  font-size: .8rem;
  font-family: 'Kanit', sans-serif;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  margin-top: .1rem;
  transition: background .2s;
}
.co__edit-addr-btn:hover { background: #faf5ee; }

/* Group */
.co__group { margin-bottom: 0; }
.co__group-header {
  display: flex;
  align-items: center;
  gap: .6rem;
  padding: .4rem 0 .7rem;
  color: #555;
}
.co__group-name { font-size: .9rem; font-weight: 600; color: #333; }

/* Item */
.co__item {
  display: grid;
  grid-template-columns: 110px 1fr auto;
  gap: 1.1rem;
  align-items: center;
  padding: .7rem 0 1rem;
}
.co__item-img-wrap {
  width: 110px;
  height: 110px;
  border-radius: 10px;
  overflow: hidden;
  background: #e8f0eb;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.co__item-img { width: 100%; height: 100%; object-fit: cover; display: block; }
.co__item-img-ph {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%; height: 100%;
  color: #bbb;
}
.co__item-info {
  display: flex;
  flex-direction: column;
  gap: .3rem;
  min-width: 0;
}
.co__item-name { font-size: .95rem; font-weight: 600; color: #111; line-height: 1.4; }
.co__item-sub { font-size: .8rem; color: #888; }
.co__item-act-meta { display: flex; flex-direction: column; gap: .2rem; }
.co__item-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: .5rem;
  flex-shrink: 0;
}
.co__item-qty {
  display: flex;
  align-items: center;
  gap: .35rem;
  font-size: .88rem;
  color: #555;
}
.co__item-price { font-size: 1rem; font-weight: 700; color: #111; white-space: nowrap; }

/* Payment Summary */
.co__payment-summary { padding: .25rem 0 1rem; }
.co__summary-title { font-size: 1rem; font-weight: 700; color: #1a1a1a; margin-bottom: 1rem; }
.co__summary-rows {
  display: flex;
  flex-direction: column;
  gap: .55rem;
  max-width: 480px;
  margin-left: auto;
}
.co__summary-row {
  display: flex;
  justify-content: space-between;
  font-size: .9rem;
  color: #444;
}
.co__summary-row--total {
  font-size: 1rem;
  font-weight: 700;
  color: #111;
  margin-top: .25rem;
}

/* Bottom bar */
.co__bottom {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  z-index: 100;
  background: #fff;
  border-top: 1px solid #e0e0e0;
  box-shadow: 0 -4px 20px rgba(0,0,0,.06);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1.5rem;
  padding: 1rem 5%;
}
.co__bottom-total { font-size: 1.25rem; font-weight: 700; color: #111; }
.co__place-btn {
  padding: .72rem 2.4rem;
  background: #2d6a4f;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: .95rem;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Kanit', sans-serif;
  transition: background .2s;
}
.co__place-btn:hover:not(:disabled) { background: #1b4332; }
.co__place-btn:disabled { opacity: .55; cursor: default; }

@media (max-width: 600px) {
  .co__item { grid-template-columns: 85px 1fr auto; }
  .co__item-img-wrap { width: 85px; height: 85px; }
  .co__addr-row { flex-wrap: wrap; }
  .co__edit-addr-btn { margin-top: .5rem; }
}
`;
