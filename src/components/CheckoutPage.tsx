import { useState, useEffect } from 'react';
import { getCart, saveCart, CartItem } from '../utils/cart';
import { api } from '../services/api';
import { FaLine, FaRegCopy } from "react-icons/fa";
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

function getTierDiscount(points: number): { tier: string; pct: number } {
  if (points >= 1000) return { tier: 'Legend', pct: 0.20 };
  if (points >= 500) return { tier: 'Gold', pct: 0.10 };
  if (points >= 200) return { tier: 'Silver', pct: 0.05 };
  return { tier: 'Nature', pct: 0 };
}

export default function CheckoutPage({ currentUser, onNavigate, lang = 'TH' }: Props) {
  const isTH = lang === 'TH';
  const [items, setItems] = useState<CartItem[]>([]);
  const [placing, setPlacing] = useState(false);
  const [orderErr, setOrderErr] = useState('');
  const [userPoints, setUserPoints] = useState(0);
  const [paymentUrl, setPaymentUrl] = useState("");
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [orderID, setOrderID] = useState("");

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
      .catch(() => { });
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
    setLoadingPayment(true);
    setPlacing(true);
    setOrderErr('');
    console.log("here1");
    const { order_id } = await api.orders.generateId();
    console.log(order_id);
    try {
      const results = await Promise.all(
        items.map(item =>
          api.orders.create({
            order_id: order_id,
            user_id: currentUser?.user_id || '',
            order_date: new Date().toISOString().split('T')[0],
            item_id: item.itemId,
            quantity: item.qty,
            total_price: Math.round(item.price * item.qty * (1 - discountPct)),
            order_status: 'processing',
            shipping_address: currentUser?.address || '',
            order_select_date: item.actDate || '',
            applied_promotion_id: '',
          })
        )
      );


      const orderId = results[results.length - 1].order_id;

      let order = null;

      for (let i = 0; i < 10; i++) {
        try {
          order = await api.orders.getOne(orderId);
          break; // เจอแล้ว
        } catch {
          // ยังไม่เจอ รอ 1 วินาที
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      if (!order) {
        throw new Error("Order not found after waiting");
      }

      const payment =
        await api.line.payment({
          order_id: orderId
        });


      setPaymentUrl(payment);
      setOrderID(orderId);

      // ล้าง cart ทันทีที่ order สร้างสำเร็จ
      const all = getCart();
      const checkedIds = new Set(items.map(i => i.id));
      saveCart(all.filter(i => !checkedIds.has(i.id)));

      setLoadingPayment(false);

      const failed = results.filter(r => r && r.success === false);
      if (failed.length > 0) {
        setLoadingPayment(false);
        setOrderErr(isTH ? 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' : 'Order failed, please try again.');
        return;
      }
      trackEvent('purchase', {
  transaction_id: orderId, // รหัสออเดอร์
  value: totalAmount, // ยอดรวมที่ลดราคาแล้ว
  currency: 'THB', // สกุลเงิน
  coupon: discountPct > 0 ? memberTier : '', // (Optional) ใส่ชื่อ Tier ถ้ามีการใช้ส่วนลด
  items: items.map(item => ({
    item_id: item.itemId,
    item_name: item.name,
    price: item.price,
    quantity: item.qty,
    item_category: item.itemType // 'product' หรือ 'activity'
  }))
});
return;

} catch (err) {
  console.error('Order failed:', err);
  setLoadingPayment(false);
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
              <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
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
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
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
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
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
                        <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
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
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
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
        {paymentUrl && (
          <div className="payment-popup">

            <div className="payment-box">

              <h3>
                {isTH
                  ? "กรุณาชำระเงิน"
                  : "Payment Required"}
              </h3>


              <p>
                {isTH
                  ? "ส่งรหัส order ด้านล่างผ่าน LINE  @226xrnni เพื่อแจ้งชำระเงินผ่าน LINE หรือกดปุ่มด้านล่าง"
                  : "Send the Order ID below via LINE @226xrnni to confirm your payment, or simply tap the button below."}
              </p>

              <div className="linkBox">
                {/* <div className="linkBox__text">
                  {paymentUrl}
                </div> */}
                <div className="linkBox__text">
                  {orderID}
                </div>
                <button
                  className="linkBox__copy"
                  onClick={() => navigator.clipboard.writeText(orderID)}
                  title={isTH ? "คัดลอกลิงก์" : "Copy link"}
                >
                  <FaRegCopy />
                </button>
              </div>

              <div className="payment-actions">
                <button
                  className="payment-actions__line"
                  onClick={() => {
                    window.open(paymentUrl, "_blank");
                    onNavigate('home');
                  }}
                >
                  <FaLine size={22} />
                  <span>{isTH ? "ชำระเงิน" : "Pay here"}</span>
                </button>

                {/* <button
                  className="payment-actions__cancel"
                  onClick={() => setPaymentUrl("")}
                >
                  {isTH ? "ยกเลิก" : "Cancel"}
                </button> */}
              </div>

            </div>

          </div>
        )}
      </div>
      {loadingPayment && (
        <div className="payment-loading">

          <div className="payment-loading-box">

            <div className="spinner"></div>

            <h3>
              {isTH
                ? "กำลังเตรียมการชำระเงิน..."
                : "Preparing payment..."}
            </h3>

            <p>
              {isTH
                ? "กรุณารอสักครู่"
                : "Please wait"}
            </p>

          </div>

        </div>
      )}
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
      margin-right: 150px;
}
.co__place-btn:hover:not(:disabled) { background: #1b4332; }
.co__place-btn:disabled { opacity: .55; cursor: default; }

@media (max-width: 600px) {
  .co__item { grid-template-columns: 85px 1fr auto; }
  .co__item-img-wrap { width: 85px; height: 85px; }
  .co__addr-row { flex-wrap: wrap; }
  .co__edit-addr-btn { margin-top: .5rem; }
    .co__place-btn {
    padding: .6rem 1.2rem;
    font-size: 0; /* ซ่อน text เดิม */
  }

  .co__place-btn::after {
    content: "ยืนยัน";
    font-size: .85rem;
  }

  .co__bottom-total {
    font-size: .9rem;
  }
}



.payment-popup {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);

  display: flex;
  justify-content: center;
  align-items: center;

  z-index: 9999;
}

.linkBox {
  display: flex;
  align-items: flex-start;
  gap: 12px;

  width: 100%;
  padding: 14px 16px;

  background: #f8f8f8;
  border: 1px solid #ddd;
  border-radius: 12px;

  box-sizing: border-box;
}

.linkBox__text {
  flex: 1;

  max-height: 120px;
  overflow-y: auto;

  color: #444;
  font-size: 1.7rem;
  font-weight: bold;
  line-height: 1.6;

  overflow-wrap: anywhere;
  word-break: break-word;
    /* Firefox */
  scrollbar-width: thin;
  scrollbar-color: #bdbdbd transparent;
  
}

/* Chrome / Edge / Safari */
.linkBox__text::-webkit-scrollbar {
  width: 5px;
}

.linkBox__text::-webkit-scrollbar-track {
  background: transparent;
}

.linkBox__text::-webkit-scrollbar-thumb {
  background: #c5c5c5;
  border-radius: 999px;
}

.linkBox__text::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.linkBox__copy {
  width: 42px;
  height: 42px;

  flex-shrink: 0;

  border: none;
  border-radius: 10px;

  background: #848484;
  color: #fff;

  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;
  font-size: 18px;

  transition: .2s;
}

.linkBox__copy:hover {
  background: #05b34c;
  transform: scale(1.05);
}

.linkBox__copy:active {
  transform: scale(0.96);
}

.payment-box {
  background: white;
  width: 500px;
  max-width: 90%;

  padding: 28px;

  border-radius: 16px;

  text-align: center;

  box-shadow: 0 10px 30px rgba(0,0,0,0.2);

  animation: popupShow 0.25s ease;
}


.payment-box h3 {
  margin-bottom: 12px;
  font-size: 22px;
}


.payment-box p {
  margin-bottom: 24px;
  color: #555;
}


.payment-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 20px;
}

.payment-actions button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  width: 90%;
  max-width: 200px;
  padding: 12px 20px;

  border: none;
  border-radius: 10px;

  font: inherit;
  font-weight: 600;

  cursor: pointer;
  transition: all .2s ease;
}

.payment-actions__line {
  background: #06c755;
  color: #fff;
}

.payment-actions__line:hover {
  background: #05b34c;
}

.payment-actions__cancel {
  background: #ececec;
  color: #333;
}

.payment-actions__cancel:hover {
  background: #ddd;
}


@keyframes popupShow {

  from {
    opacity: 0;
    transform: scale(0.9);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }

}

.payment-loading {
  position: fixed;
  inset: 0;

  background: rgba(255,255,255,0.8);

  display: flex;
  justify-content: center;
  align-items: center;

  z-index: 99999;
}


.payment-loading-box {
  background: white;

  padding: 30px;

  border-radius: 16px;

  text-align: center;

  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
}


.spinner {
  width: 45px;
  height: 45px;

  border: 4px solid #ddd;
  border-top: 4px solid #2d6a4f;

  border-radius: 50%;

  margin: 0 auto 20px;

  animation: spin 1s linear infinite;
}


@keyframes spin {

  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }

}
`;
