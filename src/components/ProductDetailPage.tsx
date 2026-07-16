import { useState, useEffect } from 'react';
import { api } from '../services/api';
import Footer from './Footer';
import { SITE_CONTENT as c } from '../constants/content';
import { addToCart } from '../utils/cart';
import { trackEvent } from '../utils/gtag'; 

interface Props {
  productId: string;
  onBack: () => void;
  onSelectProduct?: (id: string) => void;
  orderData?: any;
  onNavigate?: (page: string) => void;
  currentUser?: any;
  lang?: 'TH' | 'ENG';
}

function fmtOrderDate(d: any) {
  if (!d) return '-';
  const n = Number(d);
  let date: Date;
  if (!isNaN(n) && n > 1000) {
    date = new Date((n - 25569) * 86400 * 1000);
  } else {
    date = new Date(d);
  }
  if (isNaN(date.getTime())) return String(d);
  return `${String(date.getDate()).padStart(2,'0')}/${String(date.getMonth()+1).padStart(2,'0')}/${date.getFullYear()}`;
}

const ORDER_STATUS_MAP: Record<string, [string, string]> = {
  completed: ['Completed', '#2d6a4f'],
  paid:      ['Paid',      '#1a6b8a'],
  shipped:   ['Shipped',   '#5a3e8a'],
  pending:   ['Pending',   '#b07d0a'],
  cancelled: ['Cancelled', '#b03a2e'],
};
function OrderStatusBadge({ s }: { s: string }) {
  const [label, color] = ORDER_STATUS_MAP[s?.toLowerCase()] ?? [s ?? '-', '#555'];
  return <span style={{ color, fontWeight: 600 }}>{label}</span>;
}

function driveThumb(url: string, size = 'w800'): string {
  const m = url?.match(/\/d\/([^/]+)\//);
  if (m) {
    const driveUrl = encodeURIComponent(`https://drive.google.com/thumbnail?id=${m[1]}&sz=${size}`);
    return `https://res.cloudinary.com/zgor0mh6/image/fetch/q_auto,f_auto/${driveUrl}`;
  }
  return url || '';
}

function Stars({ rating, size = 16, emptyFill = '#d0d0d0' }: { rating: number; size?: number; emptyFill?: string }) {
  return (
    <span className="pdet__stars">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24"
          fill={i <= Math.round(rating) ? '#f5a623' : emptyFill}
          stroke={i <= Math.round(rating) ? '#f5a623' : emptyFill}
          strokeWidth="1.5">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </span>
  );
}

const SIZE_TAB_CONFIG: Record<string, { label: string; labelEn?: string; altId?: string }[]> = {
  PRD001_A: [
    { label: 'ไซส์ยักษ์ (13-16 ลูก/กก.)',   labelEn: 'Jumbo Size (13-16 pcs/kg)' },
    { label: 'รวมมิตร (17-20 ลูก/กก.)',       labelEn: 'Mixed Sizes (17-20 pcs/kg)', altId: 'PRD002_A' },
  ],
  PRD004_A: [
    { label: 'กล่อง 3+ กิโล', labelEn: '3+ kg Box' },
    { label: 'กล่อง 5+ กิโล', labelEn: '5+ kg Box', altId: 'PRD004_B' },
    { label: 'กล่อง 7+ กิโล', labelEn: '7+ kg Box', altId: 'PRD004_C' },
  ],
  PRD005_A: [
    { label: 'ชุด 3 กระปุก',  labelEn: 'Set of 3 Jars' },
    { label: 'ชุด 8 กระปุก',  labelEn: 'Set of 8 Jars',  altId: 'PRD005_B' },
    { label: 'ชุด 20 กระปุก', labelEn: 'Set of 20 Jars', altId: 'PRD005_C' },
  ],
};

const normalizeId = (id: string) => id.replace(/_(TH|EN)$/, '');

export default function ProductDetailPage({ productId, onBack, onSelectProduct, orderData, onNavigate, currentUser, lang = 'TH' }: Props) {
  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [others, setOthers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [reviewIdx, setReviewIdx] = useState(0);
  const [otherIdx, setOtherIdx] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [tabIdx, setTabIdx] = useState(0);
  const [altProducts, setAltProducts] = useState<Record<string, any>>({});
  const isLoggedIn = !!currentUser;

  useEffect(() => {
    setTabIdx(0);
    window.scrollTo(0, 0);
    Promise.all([
      api.products.getOne(productId),
      api.reviews.getByItemId(productId).catch(() => []),
      api.reviews.getAvgByItemId(productId).catch(() => ({ averageRating: 0 })),
      api.products.getAll().catch(() => []),
    ]).then(([prod, revs, avg, allProds]) => {
      setProduct(prod);
      setReviews(Array.isArray(revs) ? revs : []);
      setAvgRating(Math.ceil(Number(avg?.averageRating ?? avg?.average ?? 0)));
      const HIDDEN_IDS = ['PRD002_A', 'PRD004_B', 'PRD004_C', 'PRD005_B', 'PRD005_C'];
      const langSuffix = lang === 'TH' ? '_TH' : '_EN';
      setOthers(Array.isArray(allProds) ? allProds.filter((p: any) =>
        p.id !== productId &&
        p.id?.endsWith(langSuffix) &&
        !HIDDEN_IDS.includes(normalizeId(p.id))
      ).slice(0, 9) : []);
    }).finally(() => setLoading(false));
  }, [productId]);

  useEffect(() => {
    const baseId = normalizeId(productId);
    const tabConfig = SIZE_TAB_CONFIG[baseId];
    if (!tabConfig) return;
    const langSuffix = lang === 'TH' ? '_TH' : '_EN';
    const altIds = tabConfig.map(t => t.altId ? t.altId + langSuffix : undefined).filter(Boolean) as string[];
    altIds.forEach(id => {
      api.products.getOne(id).then(p => setAltProducts(prev => ({ ...prev, [id]: p }))).catch(() => {});
    });
  }, [productId, lang]);

  if (loading) return <div className="pdet__loading">กำลังโหลด...</div>;
  if (!product) return <div className="pdet__loading">ไม่พบสินค้า</div>;

  const tags = product.origin?.split(',').map((t: string) => t.trim()).filter(Boolean) ?? [];
  const descLines = product.note?.split('\n').filter((l: string) => l.trim()) ?? [];
  const REVIEWS_PER = 2;
  const OTHERS_PER = 3;
  const maxRevIdx = Math.max(0, reviews.length - REVIEWS_PER);
  const maxOtherIdx = Math.max(0, others.length - OTHERS_PER);

  return (
    <>
      <div className="pdet">
        {/* Back */}
        <div className="pdet__back-wrap">
          <button className="pdet__back" onClick={onBack}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            {lang === 'TH' ? 'กลับ' : 'Back'}
          </button>
        </div>

        {/* Hero */}
        <div className="pdet__hero">
          <div className="pdet__img-wrap">
            <div className="pdet__img-bg">
              <img src={driveThumb(product.image, 'w400')} alt={product.name} className="pdet__img"
                onError={e => {
                  const img = e.currentTarget as HTMLImageElement;
                  img.src = driveThumb(product.image, 'w200');
                  img.onerror = () => { img.style.display = 'none'; };
                }} />
              <div className="impact-badge">
                <span className="impact-badge__pct">10%</span>
                <span className="impact-badge__text">{lang === 'TH' ? <>รายได้ 10%<br/>สนับสนุนมูลนิธิ<br/>ในท้องถิ่น</> : <>10% of income<br/>supports local<br/>foundations.</>}</span>
              </div>
            </div>
          </div>

          <div className="pdet__info">
            {orderData ? (
              /* ── ORDER VIEW ── */
              <>
                <h1 className="pdet__title">{product.name}</h1>
                <div className="pdet__order-panel">
                  <div className="pdet__order-row">
                    <div className="pdet__order-col">
                      <span className="pdet__order-label">DATE</span>
                      <span className="pdet__order-val">{fmtOrderDate(orderData.order_date)}</span>
                    </div>
                    <div className="pdet__order-sep" />
                    <div className="pdet__order-col">
                      <span className="pdet__order-label">TOTAL</span>
                      <span className="pdet__order-val">{orderData.total_price} {lang === 'TH' ? 'บาท' : 'Baht'}</span>
                    </div>
                  </div>
                  <div className="pdet__order-divider" />
                  <div className="pdet__order-col">
                    <span className="pdet__order-label">Status</span>
                    <OrderStatusBadge s={orderData.order_status} />
                  </div>
                  {orderData.shipping_address && (
                    <>
                      <div className="pdet__order-divider" />
                      <div className="pdet__order-col">
                        <span className="pdet__order-label">Location</span>
                        <span className="pdet__order-val">{orderData.shipping_address}</span>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              /* ── NORMAL VIEW ── */
              <>
                {tags.length > 0 && (
                  <div className="pdet__tags">
                    {tags.map((t: string) => (
                      <span key={t} className="pdet__tag">#{t}</span>
                    ))}
                  </div>
                )}
                <div className="pdet__title-row">
                  <h1 className="pdet__title">{product.name}</h1>
                  <div className="pdet__rating-inline">
                    <span className="pdet__rating-num">{avgRating > 0 ? avgRating : '—'}</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text)" strokeWidth="1.5">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </div>
                </div>
                {product.quantity ? <p className="pdet__qty-label">{product.quantity} กรัม</p> : null}
                <p className="pdet__remain"><span className="pdet__remain-label">{lang === 'TH' ? 'สินค้าคงเหลือ' : 'Remaining stock'}:</span> {product.remain ?? 0}</p>
                {product.note && <p className="pdet__short-desc">{product.note.split('\n')[0]}</p>}
                {product.shipping_duration && (
                  <div className="pdet__shipping">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v4h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
                    </svg>
                    <span>shipping {product.shipping_duration}</span>
                  </div>
                )}
                {SIZE_TAB_CONFIG[normalizeId(productId)] && (
                  <div className="pdet__size-tabs">
                    {SIZE_TAB_CONFIG[normalizeId(productId)].map((tab, i) => (
                      <button
                        key={i}
                        className={`pdet__size-tab${tabIdx === i ? ' pdet__size-tab--active' : ''}`}
                        onClick={() => setTabIdx(i)}
                      >{lang === 'ENG' && tab.labelEn ? tab.labelEn : tab.label}</button>
                    ))}
                  </div>
                )}
                {(() => {
                  const langSuffix = lang === 'TH' ? '_TH' : '_EN';
                  const tabConfig = SIZE_TAB_CONFIG[normalizeId(productId)];
                  const baseAltId = tabConfig?.[tabIdx]?.altId;
                  const altId = baseAltId ? baseAltId + langSuffix : undefined;
                  const activeProduct = (altId && altProducts[altId]) ? altProducts[altId] : product;
                  return (
                    <>
                      <div className="pdet__buy-row">
                        <div className="pdet__price">{(Number(activeProduct.price) * qty).toLocaleString()} {lang === 'TH' ? 'บาท' : 'Baht'}</div>
                        <div className="pdet__qty-ctrl">
                          <button onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                          <span>{qty}</span>
                          <button onClick={() => setQty(q => q + 1)}>+</button>
                        </div>
                      </div>
                      <button className="pdet__cart-btn" onClick={() => {
                        if (!isLoggedIn) { setShowLoginModal(true); return; }
                        trackEvent('add_to_cart', {
                          currency: 'THB',
                          value: Number(activeProduct?.price ?? 0) * qty,
                          items: [
                            {
                              item_id: activeProduct?.id,
                              item_name: activeProduct?.name,
                              price: Number(activeProduct?.price ?? 0),
                              quantity: qty
                            }
                          ]
                        });
                        addToCart([{
                          itemId: activeProduct?.id ?? '',
                          itemType: 'product',
                          name: activeProduct?.name ?? '',
                          image: activeProduct?.image ?? '',
                          price: Number(activeProduct?.price ?? 0),
                          qty,
                          sellerName: activeProduct?.origin ?? 'SookD',
                          weightInfo: activeProduct?.quantity ? `${activeProduct.quantity} กรัม` : undefined,
                        }]);
                        onNavigate?.('cart');
                      }}>{lang === 'TH' ? 'เพิ่มในตะกร้าสินค้า' : 'Add to cart'}</button>
                    </>
                  );
                })()}
              </>
            )}
          </div>
        </div>

        {/* Description */}
        {descLines.length > 0 && (
          <section className="pdet__section">
            <h2 className="pdet__section-title">{lang === 'TH' ? 'รายละเอียด' : 'Description'}</h2>
            <ul className="pdet__desc-list">
              {descLines.map((line: string, i: number) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          </section>
        )}

        {/* Reviews */}
        {!orderData && reviews.length > 0 && (
          <section className="pdet__section">
            <h2 className="pdet__section-title">Reviews</h2>
            <div className="pdet__reviews-wrap">
              <button className="pdet__arrow" onClick={() => setReviewIdx(i => Math.max(0, i - 1))}
                disabled={reviewIdx === 0}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <div className="pdet__reviews">
                {reviews.slice(reviewIdx, reviewIdx + REVIEWS_PER).map((r: any, i: number) => {
                  const isDark = (reviewIdx + i) % 2 === 0;
                  return (
                    <div key={r.review_id ?? r.id}
                      className={`pdet__review-card${isDark ? '' : ' pdet__review-card--light'}`}>
                      <div className="pdet__review-header">
                        <div className={`pdet__avatar${isDark ? '' : ' pdet__avatar--light'}`}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                          </svg>
                        </div>
                        <div>
                          <div className="pdet__reviewer-name">{r.username ?? 'ผู้ใช้'}</div>
                          <Stars rating={Number(r.rating)} size={13}
                            emptyFill={isDark ? 'rgba(255,255,255,0.5)' : '#d0d0d0'} />
                        </div>
                      </div>
                      <p className="pdet__review-text">{r.comment}</p>
                    </div>
                  );
                })}
              </div>
              <button className="pdet__arrow" onClick={() => setReviewIdx(i => Math.min(maxRevIdx, i + 1))}
                disabled={reviewIdx >= maxRevIdx}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </section>
        )}

        {/* Promo banner */}
        {!orderData && (<div className="pdet__promo">
          <div className="pdet__promo-overlay" />
          <div className="pdet__promo-content">
            <p className="pdet__promo-heading">{lang === 'TH' ? 'รับสิทธิ์พิเศษก่อนใคร!' : 'Be the First to Get Exclusive Perks!'}</p>
            <p className="pdet__promo-sub">{lang === 'TH' ? 'สมัครสมาชิกวันนี้ เพื่อเข้าถึงดีลสุดเอกซ์คลูซีฟที่คุณปฏิเสธไม่ลง' : 'Sign up today for irresistible exclusive deals.'}</p>
          </div>
        </div>)}

        {/* Other products */}
        {!orderData && others.length > 0 && (
          <section className="pdet__section">
            <h2 className="pdet__section-title">Other</h2>
            <div className="pdet__others-wrap">
              <button className="pdet__arrow" onClick={() => setOtherIdx(i => Math.max(0, i - 1))}
                disabled={otherIdx === 0}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <div className="pdet__others">
                {others.slice(otherIdx, otherIdx + OTHERS_PER).map((p: any) => (
                  <div key={p.id} className="pdet__other-card" onClick={() => 
                  {
                    trackEvent('select_item', {
                      item_list_name: 'Other Products',
                      items: [
                        {
                          item_id: p.id,
                          item_name: p.name,
                          price: Number(p.price ?? 0)
                        }
                      ]
                    });
                    onSelectProduct?.(p.id);
                  }} 
                    style={{ cursor: onSelectProduct ? 'pointer' : 'default' }}>
                    <div className="pdet__other-img-wrap">
                      <img src={driveThumb(p.image, 'w400')} alt={p.name} className="pdet__other-img"
                        loading="lazy"
                        onError={e => {
                          const img = e.currentTarget as HTMLImageElement;
                          img.src = driveThumb(p.image, 'w200');
                          img.onerror = () => { img.style.display = 'none'; };
                        }} />
                    </div>
                    <div className="pdet__other-body">
                      <div className="pdet__other-top">
                        <span className="pdet__other-name">{p.name}</span>
                        <span className="pdet__other-origin">{p.origin?.split(',').slice(1).join(', ') || p.origin}</span>
                      </div>
                      <div className="pdet__other-meta">
                        <span className="pdet__other-qty">{lang === 'TH' ? 'สินค้าคงเหลือ' : 'Remaining stock'}: {p.remain ?? 0}</span>
                        <span className="pdet__other-price">{Number(p.price).toLocaleString()} {lang === 'TH' ? 'บาท' : 'Baht'}</span>
                      </div>
                      <p className="pdet__other-note">{p.note?.replace(/\n/g,' ').slice(0, 60)}{p.note?.length > 60 ? '…' : ''}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="pdet__arrow" onClick={() => setOtherIdx(i => Math.min(maxOtherIdx, i + 1))}
                disabled={otherIdx >= maxOtherIdx}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </section>
        )}
      </div>
      <div className="section-gap" />
      <Footer data={c.footer[lang]} />

      {showLoginModal && (
        <div className="adet__modal-overlay" onClick={() => setShowLoginModal(false)}>
          <div className="adet__modal" onClick={e => e.stopPropagation()}>
            <button className="adet__modal-close" onClick={() => setShowLoginModal(false)}>✕</button>
            <h3 className="adet__modal-title">{lang === 'TH' ? 'เข้าสู่ระบบเพื่อดำเนินการต่อ' : 'Sign in to Continue'}</h3>
            <p className="adet__modal-msg">{lang === 'TH' ? 'โปรดเข้าสู่ระบบหรือสมัครสมาชิก เพื่อเพิ่มสินค้าลงในรถเข็นและดำเนินการชำระเงิน' : 'Please log in or register an account to add items to your cart and proceed with checkout.'}</p>
            <div className="adet__modal-actions">
              <button className="adet__modal-login" onClick={() => { setShowLoginModal(false); onNavigate?.('login'); }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
                Login/Register
              </button>
              <button className="adet__modal-later" onClick={() => setShowLoginModal(false)}>{lang === 'TH' ? 'ไว้ทีหลัง' : 'Maybe Later'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export const PRODUCT_DETAIL_CSS = `
.pdet { padding-top: 64px; }
.pdet__loading {
  padding-top: 120px; text-align: center;
  color: #888; font-family: var(--font-th); font-size: 1rem;
}

/* Back */
.pdet__back-wrap { padding: 1.2rem 5%; max-width: 1100px; margin: 0 auto; }
.pdet__back {
  display: inline-flex; align-items: center; gap: .35rem;
  background: none; border: none; cursor: pointer;
  font-size: .9rem; color: #666; font-weight: 500;
  transition: color .2s;
  font:inherit;
}
.pdet__back:hover { color: var(--forest); }

/* Hero */
.pdet__hero {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 2.5rem;
  max-width: 1100px; margin: 0 auto;
  padding: 0 5% 3rem;
}
.pdet__img-wrap { position: relative; }
.pdet__img-bg {
  border-radius: 14px; overflow: hidden;
  aspect-ratio: 4/3; background: #e8ede8;
}
.pdet__img { width: 100%; height: 100%; object-fit: cover; display: block; }

/* Info panel */
.pdet__info { display: flex; flex-direction: column; gap: .7rem; }
.pdet__tags { display: flex; gap: .5rem; flex-wrap: wrap; }
.pdet__tag {
  font-size: .78rem; color: #6b7c6b;
  background: #f0f4f0; border-radius: 4px;
  padding: .15rem .5rem; font-family: var(--font-th);
}
.pdet__title-row {
  display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem;
}
.pdet__title {
  font-size: 1.45rem; font-weight: 700;
  color: var(--text); font-family: var(--font-th);
  line-height: 1.35; flex: 1;
}
.pdet__rating-inline { display: flex; align-items: center; gap: .3rem; flex-shrink: 0; }
.pdet__rating-num { font-size: 1.15rem; font-weight: 700; color: var(--text); }
.pdet__stars { display: flex; gap: 2px; }

.pdet__qty-label { font-size: .88rem; color: #777; font-family: var(--font-th); }
.pdet__remain { font-size: .88rem; color: #555; font-family: var(--font-th); }
.pdet__remain-label { font-weight: 600; color: var(--text); }
.pdet__short-desc { font-size: .88rem; color: #555; font-family: var(--font-th); line-height: 1.6; }

.pdet__shipping {
  display: flex; align-items: center; gap: .5rem;
  font-size: .83rem; color: #777; font-family: var(--font-th);
}

.pdet__buy-row {
  display: flex; align-items: center; justify-content: space-between;
  margin-top: .4rem;
}
.pdet__price {
  font-size: 1.8rem; font-weight: 700; color: var(--text);
}
.pdet__qty-ctrl {
  display: flex; align-items: center; gap: 0;
  border: 1.5px solid #d0d0d0; border-radius: 8px;
  overflow: hidden;
}
.pdet__qty-ctrl button {
  background: none; border: none; cursor: pointer;
  width: 36px; height: 36px; font-size: 1.1rem;
  color: #444; display: flex; align-items: center; justify-content: center;
  transition: background .15s;
}
.pdet__qty-ctrl button:hover { background: #f0f0f0; }
.pdet__qty-ctrl span {
  width: 40px; text-align: center;
  font-size: .95rem; font-weight: 600;
  border-left: 1px solid #d0d0d0; border-right: 1px solid #d0d0d0;
  line-height: 36px;
}
.pdet__size-tabs {
  display: flex;
  gap: .5rem;
  margin-bottom: .75rem;
}
.pdet__size-tab {
  flex: 1;
  padding: .55rem .75rem;
  border: 1.5px solid #ccc;
  border-radius: 8px;
  background: #fff;
  color: #555;
  font-size: .82rem;
  font-family: 'Kanit', sans-serif;
  cursor: pointer;
  transition: all .2s;
  text-align: center;
}
.pdet__size-tab--active {
  border-color: var(--forest);
  background: var(--forest);
  color: #fff;
  font-weight: 600;
}
.pdet__size-tab:hover:not(.pdet__size-tab--active) {
  border-color: var(--forest);
  color: var(--forest);
}
.pdet__cart-btn {
  padding: .85rem 2rem;
  background: var(--forest); color: var(--white);
  border: none; border-radius: 8px;
  font-size: 1rem; font-weight: 600; cursor: pointer;
  transition: background .2s; width: 100%;
  margin-top: .25rem;
  font:inherit;
}
.pdet__cart-btn:hover { background: #1a3d2e; }

/* Sections */
.pdet__section {
  max-width: 1100px; margin: 0 auto;
  padding: 2rem 5%;
  border-top: 1px solid #eee;
}
.pdet__section-title {
  font-size: 1.25rem; font-weight: 700; color: var(--text);
  margin-bottom: 1.2rem;
  padding-bottom: .5rem;
  border-bottom: 2px solid var(--forest);
  display: inline-block;
}
.pdet__desc-list {
  list-style: disc; padding-left: 1.5rem;
  font-family: var(--font-th); font-size: .92rem;
  color: #444; line-height: 1.9;
}

/* Reviews */
.pdet__reviews-wrap { display: flex; align-items: center; gap: 1rem; }
.pdet__reviews { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; flex: 1; }
.pdet__arrow {
  background: none; border: 1.5px solid #ddd; border-radius: 50%;
  width: 36px; height: 36px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; color: #555; transition: all .2s;
}
.pdet__arrow:hover:not(:disabled) { border-color: var(--forest); color: var(--forest); }
.pdet__arrow:disabled { opacity: .35; cursor: default; }
.pdet__review-card {
  background: var(--forest); border-radius: 12px;
  padding: 1.2rem 1.4rem;
}
.pdet__review-card--light { background: #e8eeec; }
.pdet__review-header { display: flex; align-items: center; gap: .75rem; margin-bottom: .75rem; }
.pdet__avatar {
  width: 40px; height: 40px; border-radius: 50%;
  background: rgba(255,255,255,.15);
  display: flex; align-items: center; justify-content: center;
  color: rgba(255,255,255,.8); flex-shrink: 0;
}
.pdet__avatar--light { background: rgba(0,0,0,.08); color: #555; }
.pdet__reviewer-name { font-size: .88rem; font-weight: 600; color: var(--white); margin-bottom: .2rem; }
.pdet__review-card--light .pdet__reviewer-name { color: var(--text); }
.pdet__review-text { font-size: .83rem; color: rgba(255,255,255,.85); line-height: 1.6; }
.pdet__review-card--light .pdet__review-text { color: #444; }

/* Promo */
.pdet__promo {
  position: relative; min-height: 200px;
  display: flex; align-items: center; justify-content: center;
  text-align: center;
  background: url('/img/local.jpg') center/cover no-repeat;
  background-color: #3d2b1a;
  margin: 2rem 0;
}
.pdet__promo-overlay { position: absolute; inset: 0; background: rgba(15,10,5,.55); }
.pdet__promo-content { position: relative; z-index: 1; padding: 3rem 2rem; }
.pdet__promo-heading {
  font-size: clamp(1.5rem,3vw,2rem); font-weight: 700; color: var(--white);
  margin-bottom: .5rem;
}
.pdet__promo-sub { font-size: 1rem; color: rgba(255,255,255,.9); }
.pdet__promo-sub strong { color: var(--white); }

/* Other products */
.pdet__others-wrap { display: flex; align-items: center; gap: 1rem; }
.pdet__others { display: grid; grid-template-columns: repeat(3,1fr); gap: 1rem; flex: 1; }
.pdet__other-card {
  border-radius: 10px; overflow: hidden;
  background: var(--white); box-shadow: 0 2px 10px rgba(0,0,0,.08);
}
.pdet__other-img-wrap { position: relative; aspect-ratio: 4/3; overflow: hidden; background: #e8ede8; }
.pdet__other-img { width: 100%; height: 100%; object-fit: cover; }
.pdet__other-badge {
  position: absolute; bottom: .5rem; left: .5rem;
  background: rgba(255,255,255,.88); border-radius: 20px;
  padding: .18rem .5rem;
  display: flex; flex-direction: column; align-items: center;
  color: #1b4332; line-height: 1.2;
}
.pdet__other-badge-origin { font-weight: 700; font-size: .75rem; }
.pdet__other-badge-note { font-size: .6rem; font-family: var(--font-th); }
.pdet__other-body { padding: .75rem .85rem .9rem; }
.pdet__other-top {
  display: flex; justify-content: space-between; align-items: flex-start;
  gap: .4rem; margin-bottom: .4rem;
}
.pdet__other-name {
  font-size: .85rem; font-weight: 600; color: var(--text);
  font-family: var(--font-th); flex: 1;
  display: -webkit-box; -webkit-line-clamp: 2;
  -webkit-box-orient: vertical; overflow: hidden;
}
.pdet__other-origin { font-size: .68rem; color: #999; font-family: var(--font-th); flex-shrink: 0; }
.pdet__other-meta { display: flex; justify-content: space-between; margin-bottom: .35rem; }
.pdet__other-qty { font-size: .78rem; color: #888; font-family: var(--font-th); }
.pdet__other-price { font-size: .85rem; font-weight: 600; color: var(--forest); }
.pdet__other-note { font-size: .72rem; color: #aaa; font-family: var(--font-th); line-height: 1.4; }

/* Responsive */
@media(max-width:768px) {
  .pdet__hero { grid-template-columns: 1fr; }
  .pdet__reviews { grid-template-columns: 1fr; }
  .pdet__others { grid-template-columns: 1fr 1fr; }
}
@media(max-width:480px) {
  .pdet__others { grid-template-columns: 1fr; }
}

/* Order Panel */
.pdet__order-panel {
  display: flex;
  flex-direction: column;
  gap: 0;
  margin-top: .5rem;
}
.pdet__order-row {
  display: flex;
  align-items: stretch;
  gap: 0;
}
.pdet__order-sep {
  width: 1px;
  background: #c8bfaf;
  margin: 0 1.4rem;
  align-self: stretch;
  min-height: 48px;
}
.pdet__order-divider {
  height: 1px;
  background: #c8bfaf;
  margin: 1rem 0;
}
.pdet__order-col {
  display: flex;
  flex-direction: column;
  gap: .3rem;
}
.pdet__order-label {
  font-size: .72rem;
  font-weight: 700;
  letter-spacing: .1em;
  color: #9a8877;
  text-transform: uppercase;
}
.pdet__order-val {
  font-size: 1rem;
  font-weight: 600;
  color: #3d2f2a;
}
`;
