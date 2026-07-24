import { useState, useEffect } from 'react';
import { api } from '../services/api';
import Footer from './Footer';
import ContactIcon from './ContactIcon';
import BookingModal from './BookingModal';
import { SITE_CONTENT as c } from '../constants/content';
import { trackEvent } from '../utils/gtag';

const BOOKING_ACTIVITY_IDS = [
  'ACT001', 'ACT002', 'ACT003', 'ACT004',
  'ACT010', 'ACT011', 'ACT012',
  'ACT005_B2C', 'ACT006_B2C',
  'ACT007_B2C', 'ACT008', 'ACT009',
  'ACT014', 'ACT015', 'ACT016', 'ACT017', 'ACT018',
  'ACT019',
];

const BOOKING_CONFIG: Record<string, { optionalIds: string[]; offerIds: string[]; simple?: boolean }> = {
  default: {
    optionalIds: ['ACT014', 'ACT015', 'ACT016', 'ACT017', 'ACT018'],
    offerIds: ['PRD019','PRD020','PRD021','PRD022','PRD024','PRD025','PRD026','PRD027','PRD028'],
  },
  ACT005_B2C: {
    optionalIds: ['ACT007_B2C', 'ACT008', 'ACT009'],
    offerIds: ['PRD015','PRD016','PRD017','PRD018'],
  },
  ACT006_B2C: {
    optionalIds: ['ACT007_B2C', 'ACT008', 'ACT009'],
    offerIds: ['PRD015','PRD016','PRD017','PRD018'],
  },
  ACT001: {
    optionalIds: [],
    offerIds: ['PRD001_A','PRD002','PRD003','PRD004','PRD005','PRD006','PRD007','PRD008','PRD009','PRD010','PRD011'],
  },
  ACT002: {
    optionalIds: [],
    offerIds: ['PRD001_A','PRD002','PRD003','PRD004','PRD005','PRD006','PRD007','PRD008','PRD009','PRD010','PRD011'],
  },
  ACT003: {
    optionalIds: [],
    offerIds: ['PRD001_A','PRD002','PRD003','PRD004','PRD005','PRD006','PRD007','PRD008','PRD009','PRD010','PRD011'],
  },
  ACT004: {
    optionalIds: [],
    offerIds: ['PRD001_A','PRD002','PRD003','PRD004','PRD005','PRD006','PRD007','PRD008','PRD009','PRD010','PRD011'],
  },
  ACT007_B2C: {
    optionalIds: ['ACT005_B2C', 'ACT006_B2C'],
    offerIds: ['PRD015','PRD016','PRD017','PRD018'],
  },
  ACT008: {
    optionalIds: ['ACT005_B2C', 'ACT006_B2C'],
    offerIds: ['PRD015','PRD016','PRD017','PRD018'],
  },
  ACT009: {
    optionalIds: ['ACT005_B2C', 'ACT006_B2C'],
    offerIds: ['PRD015','PRD016','PRD017','PRD018'],
  },
  ACT014: {
    optionalIds: ['ACT010', 'ACT011', 'ACT012'],
    offerIds: ['PRD019','PRD020','PRD021','PRD022','PRD024','PRD025','PRD026','PRD027','PRD028'],
  },
  ACT015: {
    optionalIds: ['ACT010', 'ACT011', 'ACT012'],
    offerIds: ['PRD019','PRD020','PRD021','PRD022','PRD024','PRD025','PRD026','PRD027','PRD028'],
  },
  ACT016: {
    optionalIds: ['ACT010', 'ACT011', 'ACT012'],
    offerIds: ['PRD019','PRD020','PRD021','PRD022','PRD024','PRD025','PRD026','PRD027','PRD028'],
  },
  ACT017: {
    optionalIds: ['ACT010', 'ACT011', 'ACT012'],
    offerIds: ['PRD019','PRD020','PRD021','PRD022','PRD024','PRD025','PRD026','PRD027','PRD028'],
  },
  ACT018: {
    optionalIds: ['ACT010', 'ACT011', 'ACT012'],
    offerIds: ['PRD019','PRD020','PRD021','PRD022','PRD024','PRD025','PRD026','PRD027','PRD028'],
  },
  ACT019: {
    optionalIds: [],
    offerIds: [],
    simple: true,
  },
};

interface Props {
  activityId: string;
  onBack: () => void;
  orderData?: any;
  currentUser?: any;
  onNavigate?: (page: string) => void;
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

function OrderStatusBadge({ s, lang = 'TH' }: { s: string; lang?: 'TH' | 'ENG' }) {
  const isCompleted = s?.toLowerCase().trim() === 'completed';
  const label = isCompleted ? (lang === 'TH' ? 'เสร็จสิ้น' : 'Completed') : (lang === 'TH' ? 'รอชำระเงิน' : 'Payment Pending');
  const color = isCompleted ? '#2d6a4f' : '#b07d0a';
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

function Stars({ rating, size = 16, emptyFill = '#e0e0e0' }: { rating: number; size?: number; emptyFill?: string }) {
  return (
    <span className="adet__stars">
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

const normalizeId = (id: string) => id.replace(/_(TH|EN)$/, '');

export default function ActivityDetailPage({ activityId, onBack, orderData, currentUser, onNavigate, lang = 'TH' }: Props) {
  const [activity, setActivity] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [reviewIdx, setReviewIdx] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [userTab, setUserTab] = useState<'individual' | 'legal_entity'>(
    currentUser?.user_type === 'legal_entity' ? 'legal_entity' : 'individual'
  );
  const isLoggedIn = !!currentUser;

  useEffect(() => { window.scrollTo(0, 0); }, [activityId]);

  useEffect(() => {
    const effectiveId = /_(TH|EN)$/.test(activityId)
      ? activityId.replace(/_(TH|EN)$/, lang === 'TH' ? '_TH' : '_EN')
      : activityId;
    setLoading(true);
    Promise.all([
      api.activities.getOne(effectiveId),
      api.reviews.getByItemId(effectiveId).catch(() => []),
      api.reviews.getAvgByItemId(effectiveId).catch(() => ({ average: 0 })),
    ]).then(([act, revs, avg]) => {
      setActivity(act);
      setReviews(Array.isArray(revs) ? revs : []);
      setAvgRating(Number(avg?.averageRating ?? avg?.average ?? avg?.avg ?? 0));
    }).finally(() => setLoading(false));
  }, [activityId, lang]);

  if (loading) return <div className="adet__loading">{lang==='ENG'?"loading...":"กำลังโหลดกิจกรรม..."}</div>;
  if (!activity) return <div className="adet__loading">{lang==='ENG'?"activity not found":"ไม่พบกิจกรรม"}</div>;

  const tags = activity.type?.split(',').map((t: string) => t.trim()) ?? [];
  const descLines = activity.description?.split('\n').filter((l: string) => l.trim()) ?? [];
  const REVIEWS_PER_PAGE = 2;
  const maxRevIdx = Math.max(0, reviews.length - REVIEWS_PER_PAGE);

  return (
    <>
      <div className="adet">
        {/* Back button */}
        <div className="adet__back-wrap">
          <button className="adet__back" onClick={onBack}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            {lang === 'TH' ? 'กลับ' : 'Back'}
          </button>
        </div>

        {/* ── Hero section ── */}
        <div className="adet__hero">
          {/* Image */}
          <div className="adet__img-wrap">
            <div className="adet__img-bg" style={{ background: '#2d5a3d' }}>
              <img src={driveThumb(activity.image)} alt={activity.name} className="adet__img"
                onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
              <div className="impact-badge">
                <span className="impact-badge__pct">10%</span>
                <span className="impact-badge__text">{lang === 'TH' ? <>รายได้ 10%<br/>สนับสนุนมูลนิธิ<br/>ในท้องถิ่น</> : <>10% of income<br/>supports local<br/>foundations.</>}</span>
              </div>
            </div>
          </div>

          {/* Info panel */}
          <div className="adet__info">
            {orderData ? (
              /* ── ORDER VIEW ── */
              <>
                <h1 className="adet__title">{activity.name}</h1>
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
                    <OrderStatusBadge s={orderData.order_status} lang={lang} />
                  </div>
                  {activity.date && (
                    <>
                      <div className="pdet__order-divider" />
                      <div className="pdet__order-col">
                        <span className="pdet__order-label">Time</span>
                        <span className="pdet__order-val">{activity.date}</span>
                      </div>
                    </>
                  )}
                  {activity.location && (
                    <>
                      <div className="pdet__order-divider" />
                      <div className="pdet__order-col">
                        <span className="pdet__order-label">Location</span>
                        <span className="pdet__order-val">{activity.location}</span>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              /* ── NORMAL VIEW ── */
              <>
                <div className="adet__tags">
                  {tags.map((t: string) => (
                    <span key={t} className="adet__tag">#{t}</span>
                  ))}
                </div>
                <div className="adet__title-row">
                  <h1 className="adet__title">{activity.name}</h1>
                  <div className="adet__rating-inline">
                    <span className="adet__rating-num">{avgRating > 0 ? Math.ceil(avgRating) : '—'}</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text)" strokeWidth="1.5" className="adet__rating-star">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </div>
                </div>
                {activity.location && (
                  <div className="adet__meta-row">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                    </svg>
                    <span>{activity.location}</span>
                  </div>
                )}
                {activity.max_participants > 0 && (
                  <div className="adet__meta-row">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    <span>{activity.max_participants} seats</span>
                  </div>
                )}
                {/* User type tabs */}
                <div className="adet__user-tabs">
                  <button
                    className={`adet__user-tab${userTab === 'individual' ? ' adet__user-tab--active' : ''}`}
                    onClick={() => setUserTab('individual')}
                  >{lang === 'TH' ? 'บุคคลธรรมดา' : 'Individual'}</button>
                  <button
                    className={`adet__user-tab${userTab === 'legal_entity' ? ' adet__user-tab--active' : ''}`}
                    onClick={() => setUserTab('legal_entity')}
                  >{lang === 'TH' ? 'นิติบุคคล' : 'Legal Entity'}</button>
                </div>

                <div className="adet__price">{Number(activity.price).toLocaleString()} {lang === 'TH' ? 'บาท' : 'Baht'}</div>
                <button className="adet__reserve" onClick={() => {
                  if (!isLoggedIn) { setShowLoginModal(true); }
                  else if (userTab === 'legal_entity') { setShowContactModal(true); }
                  else if (BOOKING_ACTIVITY_IDS.includes(normalizeId(activity?.id ?? ''))) { setShowBookingModal(true); }
                  else { 
                    trackEvent('add_to_cart', {
                      currency: 'THB',
                      value: Number(activity?.price || 0),
                      items: [
                        {
                          item_id: activity?.id,
                          item_name: activity?.name,
                          price: Number(activity?.price || 0),
                          quantity: 1
                        }
                      ]
                    });             
                  }
                }}>{lang === 'TH' ? 'จองกิจกรรม' : 'Reserve a Spot'}</button>
              </>
            )}
          </div>
        </div>

        {/* ── Description ── */}
        <section className="adet__section">
          <h2 className="adet__section-title">{lang === 'TH' ? 'รายละเอียดกิจกรรม' : 'Description'}</h2>
          <div className="adet__desc">
            {descLines.length > 0 && (
              <ul className="adet__desc-list">
                {descLines.map((line: string, i: number) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            )}

            <div className="adet__desc-fields">
              {activity.location && (
                <div className="adet__field">
                  <span className="adet__field-label">{lang === 'TH' ? 'สถานที่จัดกิจกรรม' : 'Event location'}:</span>
                  <span className="adet__field-val">{activity.location}</span>
                </div>
              )}
              {activity.note && (
                <div className="adet__field">
                  <span className="adet__field-label">{lang === 'TH' ? 'หมายเหตุ' : 'Note'}:</span>
                  <span className="adet__field-val">{activity.note}</span>
                </div>
              )}
              {activity.date && (
                <div className="adet__field">
                  <span className="adet__field-label">วันกิจกรรม:</span>
                  <span className="adet__field-val">{activity.date}</span>
                </div>
              )}
              {activity.min_participants > 0 && (
                <div className="adet__field">
                  <span className="adet__field-label">{lang === 'TH' ? 'จำนวนผู้เข้าร่วมขั้นต่ำ' : 'Minimum number of participants'}:</span>
                  <span className="adet__field-val">{activity.min_participants} {lang === 'TH' ? "คน":"persons"}</span>
                </div>
              )}
            </div>
          </div>
        </section>


        {/* ── Reviews ── */}
        {!orderData && reviews.length > 0 && (
          <section className="adet__section">
            <h2 className="adet__section-title">Reviews</h2>
            <div className="adet__reviews-wrap">
              <button className="adet__arrow" onClick={() => setReviewIdx(i => Math.max(0, i - 1))}
                disabled={reviewIdx === 0}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>

              <div className="adet__reviews">
                {reviews.slice(reviewIdx, reviewIdx + REVIEWS_PER_PAGE).map((r: any, i: number) => {
                  const isDark = (reviewIdx + i) % 2 === 0;
                  return (
                  <div key={r.review_id ?? r.id}
                    className={`adet__review-card${isDark ? '' : ' adet__review-card--light'}`}>
                    <div className="adet__review-header">
                      <div className={`adet__avatar${isDark ? '' : ' adet__avatar--light'}`}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                        </svg>
                      </div>
                      <div>
                        <div className="adet__reviewer-name">
                          {r.username ?? 'ผู้ใช้'}
                        </div>
                        <Stars rating={Number(r.rating)} size={13} emptyFill={isDark ? 'rgba(255,255,255,0.5)' : '#d0d0d0'} />
                      </div>
                    </div>
                    <p className="adet__review-text">{r.comment}</p>
                  </div>
                  );
                })}
              </div>

              <button className="adet__arrow" onClick={() => setReviewIdx(i => Math.min(maxRevIdx, i + 1))}
                disabled={reviewIdx >= maxRevIdx}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </section>
        )}

        {/* ── Promo banner ── */}
        {!orderData && (<div className="adet__promo">
          <div className="adet__promo-overlay" />
          <div className="adet__promo-content">
            <p className="adet__promo-heading">{lang === 'TH' ? 'รับสิทธิ์พิเศษก่อนใคร!' : 'Be the First to Get Exclusive Perks!'}</p>
            <p className="adet__promo-sub">{lang === 'TH' ? 'สมัครสมาชิกวันนี้ เพื่อเข้าถึงดีลสุดเอกซ์คลูซีฟที่คุณปฏิเสธไม่ลง' : 'Sign up today for irresistible exclusive deals.'}</p>
          </div>
        </div>)}

      </div>
      <div className="section-gap" />
      <Footer data={c.footer[lang]} />

      {/* ── Booking Modal ── */}
      {showBookingModal && (
        <BookingModal
          activity={activity}
          currentUser={currentUser}
          onClose={() => setShowBookingModal(false)}
          onNavigateToCart={() => onNavigate?.('cart')}
          optionalIds={(BOOKING_CONFIG[normalizeId(activity?.id ?? '')] ?? BOOKING_CONFIG.default).optionalIds.map(id => id + (lang === 'TH' ? '_TH' : '_EN'))}
          offerIds={(BOOKING_CONFIG[normalizeId(activity?.id ?? '')] ?? BOOKING_CONFIG.default).offerIds.map(id => id + (lang === 'TH' ? '_TH' : '_EN'))}
          simple={!!(BOOKING_CONFIG[normalizeId(activity?.id ?? '')] ?? BOOKING_CONFIG.default).simple}
          lang={lang}
        />
      )}

      {/* ── Legal Entity Contact Modal ── */}
      {showContactModal && (
        <div className="adet__modal-overlay" onClick={() => setShowContactModal(false)}>
          <div className="adet__modal" onClick={e => e.stopPropagation()}>
            <button className="adet__modal-close" onClick={() => setShowContactModal(false)}>✕</button>
            <h3 className="adet__modal-title">Contact Administrator</h3>
            <p className="adet__modal-msg">For legal entities, please contact the administrator for further inquiries via the channels below:</p>
            <h4 className="adet__contact-modal-subtitle">Contact Us</h4>
            <ul className="adet__contact-modal-list">
              {c.footer[lang].contact.items.map(item => (
                <li key={item.label} className="adet__contact-modal-item">
                  <ContactIcon type={item.icon} size={18} color="var(--forest)" />
                  <a href={item.href} className="adet__contact-modal-link" target="_blank" rel="noopener noreferrer">{item.label}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* ── Login Modal ── */}
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

export const ACTIVITY_DETAIL_CSS = `
.adet { padding-top: 64px; }
.adet__loading {
  padding-top: 120px; text-align: center;
  color: #888; font-family: var(--font-th); font-size: 1rem;
}

/* Back */
.adet__back-wrap { padding: 1.2rem 5%; max-width: 1100px; margin: 0 auto; }
.adet__back {
  display: inline-flex; align-items: center; gap: .35rem;
  background: none; border: none; cursor: pointer;
  font-size: .9rem; color: #666; font-weight: 500;
  transition: color .2s;
  font: inherit;
}
.adet__back:hover { color: var(--forest); }

/* Hero */
.adet__hero {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 2.5rem;
  max-width: 1100px; margin: 0 auto;
  padding: 0 5% 3rem;
}
.adet__img-wrap { position: relative; }
.adet__img-bg {
  border-radius: 14px; overflow: hidden;
  aspect-ratio: 4/3;
}
.adet__img { width: 100%; height: 100%; object-fit: cover; display: block; }

/* Info panel */
.adet__info { display: flex; flex-direction: column; gap: .75rem; }
.adet__tags { display: flex; gap: .5rem; flex-wrap: wrap; }
.adet__tag {
  font-size: .78rem; color: #6b7c6b;
  font-family: var(--font-th);
  background: #f0f4f0; border-radius: 4px;
  padding: .15rem .5rem;
}
.adet__title-row {
  display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem;
}
.adet__title {
  font-size: 1.45rem; font-weight: 700;
  color: var(--text); font-family: var(--font-th);
  line-height: 1.35; flex: 1;
}
.adet__rating-inline {
  display: flex; align-items: center; gap: .3rem;
  flex-shrink: 0;
}
.adet__rating-num { font-size: 1.15rem; font-weight: 700; color: var(--text); }
.adet__rating-star { flex-shrink: 0; }
.adet__stars { display: flex; gap: 2px; }

.adet__meta-row {
  display: flex; align-items: flex-start; gap: .6rem;
  font-size: .88rem; color: #555; font-family: var(--font-th);
  line-height: 1.5;
}
.adet__meta-row svg { flex-shrink: 0; margin-top: 2px; }

.adet__price {
  font-size: 1.8rem; font-weight: 700; color: var(--text);
  margin-top: .5rem;
}
.adet__user-tabs {
  display: flex;
  border: 1.5px solid var(--forest);
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 1.1rem;
  width: fit-content;
}
.adet__user-tab {
  padding: .45rem 1.4rem;
  background: none; border: none; cursor: pointer;
  font-size: .88rem; font-weight: 500;
  color: var(--forest); transition: all .2s;
  font-family: var(--font-th);
}
.adet__user-tab + .adet__user-tab {
  border-left: 1.5px solid var(--forest);
}
.adet__user-tab--active {
  background: var(--forest); color: var(--white);
}
.adet__reserve {
  padding: .85rem 2rem;
  background: var(--forest); color: var(--white);
  border: none; border-radius: 8px;
  font-size: 1rem; font-weight: 600; cursor: pointer;
  transition: background .2s;
  width: 100%;
  font:inherit;
}
.adet__reserve:hover { background: #1a3d2e; }

/* Sections */
.adet__section {
  max-width: 1100px; margin: 0 auto;
  padding: 2rem 5%;
  border-top: 1px solid #eee;
}
.adet__section-title {
  font-size: 1.25rem; font-weight: 700; color: var(--text);
  margin-bottom: 1.2rem;
  padding-bottom: .5rem;
  border-bottom: 2px solid var(--forest);
  display: inline-block;
}

/* Description */
.adet__desc-list {
  list-style: disc; padding-left: 1.5rem;
  font-family: var(--font-th); font-size: .92rem;
  color: #444; line-height: 1.9;
  margin-bottom: 1.25rem;
}
.adet__desc-fields { display: flex; flex-direction: column; gap: .6rem; }
.adet__field {
  display: flex; gap: .6rem;
  font-size: .9rem; font-family: var(--font-th); line-height: 1.6;
  align-items: flex-start;
}
.adet__field-label {
  font-weight: 600; color: var(--forest);
  white-space: nowrap; flex-shrink: 0;
}
.adet__field-val { color: #444; }

/* Reviews */
.adet__reviews-wrap {
  display: flex; align-items: center; gap: 1rem;
}
.adet__reviews {
  display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; flex: 1;
}
.adet__arrow {
  background: none; border: 1.5px solid #ddd; border-radius: 50%;
  width: 36px; height: 36px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; color: #555; transition: all .2s;
}
.adet__arrow:hover:not(:disabled) { border-color: var(--forest); color: var(--forest); }
.adet__arrow:disabled { opacity: .35; cursor: default; }
.adet__review-card {
  background: var(--forest); border-radius: 12px;
  padding: 1.2rem 1.4rem;
}
.adet__review-card--light {
  background: #e8eeec;
}
.adet__review-header { display: flex; align-items: center; gap: .75rem; margin-bottom: .75rem; }
.adet__avatar {
  width: 40px; height: 40px; border-radius: 50%;
  background: rgba(255,255,255,.15);
  display: flex; align-items: center; justify-content: center;
  color: rgba(255,255,255,.8); flex-shrink: 0;
}
.adet__avatar--light {
  background: rgba(0,0,0,.08);
  color: #555;
}
.adet__reviewer-name { font-size: .88rem; font-weight: 600; color: var(--white); margin-bottom: .2rem; }
.adet__review-card--light .adet__reviewer-name { color: var(--text); }
.adet__review-text { font-size: .83rem; color: rgba(255,255,255,.85); line-height: 1.6; }
.adet__review-card--light .adet__review-text { color: #444; }

/* Promo banner */
.adet__promo {
  position: relative; min-height: 200px;
  display: flex; align-items: center; justify-content: center;
  text-align: center;
  background: url('/img/pursuit-river.jpg') center/cover no-repeat;
  background-color: #1b4332;
  margin: 2rem 0;
}
.adet__promo-overlay { position: absolute; inset: 0; background: rgba(10,30,15,.55); }
.adet__promo-content { position: relative; z-index: 1; padding: 3rem 2rem; }
.adet__promo-heading {
  font-size: clamp(1.5rem,3vw,2rem); font-weight: 700; color: var(--white);
  margin-bottom: .5rem;
}
.adet__promo-sub { font-size: 1rem; color: rgba(255,255,255,.9); }
.adet__promo-sub strong { color: var(--white); }

/* Products */
.adet__products-wrap { display: flex; align-items: center; gap: 1rem; }
.adet__products { display: grid; grid-template-columns: repeat(3,1fr); gap: 1rem; flex: 1; }
.adet__product-card {
  border-radius: 10px; overflow: hidden;
  background: var(--white); box-shadow: 0 2px 10px rgba(0,0,0,.08);
}
.adet__product-img-wrap {
  position: relative; aspect-ratio: 4/3; overflow: hidden;
}
.adet__product-img { width: 100%; height: 100%; object-fit: cover; }
.adet__product-badge {
  position: absolute; top: .5rem; left: .5rem;
  background: rgba(255,255,255,.88); border-radius: 20px;
  padding: .18rem .5rem;
  display: flex; align-items: center; gap: .25rem;
  color: #1b4332;
}
.adet__product-body { padding: .75rem .85rem .9rem; }
.adet__product-top {
  display: flex; justify-content: space-between; align-items: flex-start;
  gap: .4rem; margin-bottom: .4rem;
}
.adet__product-name {
  font-size: .85rem; font-weight: 600; color: var(--text);
  font-family: var(--font-th); flex: 1;
  display: -webkit-box; -webkit-line-clamp: 2;
  -webkit-box-orient: vertical; overflow: hidden;
}
.adet__product-origin { font-size: .68rem; color: #999; font-family: var(--font-th); flex-shrink: 0; }
.adet__product-meta { display: flex; justify-content: space-between; margin-bottom: .35rem; }
.adet__product-qty { font-size: .78rem; color: #888; font-family: var(--font-th); }
.adet__product-price { font-size: .85rem; font-weight: 600; color: var(--forest); }
.adet__product-note { font-size: .72rem; color: #aaa; font-family: var(--font-th); line-height: 1.4; }

/* Contact Modal */
.adet__contact-modal-subtitle {
  font-size: 1rem; font-weight: 700;
  color: var(--text); margin: .25rem 0 1rem;
  font-family: Georgia, serif;
}
.adet__contact-modal-list {
  list-style: none; padding: 0; margin: 0;
  display: flex; flex-direction: column; gap: .85rem;
  text-align: left;
}
.adet__contact-modal-item {
  display: flex; align-items: center; gap: .75rem;
}
.adet__contact-modal-link {
  font-size: .92rem; color: var(--forest); text-decoration: none;
  font-weight: 500; transition: opacity .2s;
}
.adet__contact-modal-link:hover { opacity: .75; }

/* Login Modal */
.adet__modal-overlay {
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(0,0,0,.35);
  display: flex; align-items: center; justify-content: center;
}
.adet__modal {
  position: relative;
  background: var(--white);
  border: 2px solid #a8c5b5;
  border-radius: 16px;
  padding: 2.2rem 2.4rem 2rem;
  width: 460px; max-width: 92vw;
  box-shadow: 0 12px 40px rgba(0,0,0,.15);
  text-align: center;
}
.adet__modal-close {
  position: absolute; top: 1rem; right: 1.1rem;
  background: none; border: none; cursor: pointer;
  color: #888; font-size: 1.2rem; line-height: 1;
  padding: .2rem .4rem;
  transition: color .2s;
}
.adet__modal-close:hover { color: #333; }
.adet__modal-title {
  font-size: 1.45rem; font-weight: 700;
  color: var(--forest); margin-bottom: .75rem;
  font-family: Georgia, serif;
}
.adet__modal-msg {
  font-size: .9rem; color: #777;
  line-height: 1.65;
  margin-bottom: 1.8rem;
  max-width: 320px; margin-left: auto; margin-right: auto;
}
.adet__modal-actions { display: flex; gap: 1rem; justify-content: center; }
.adet__modal-login {
  display: inline-flex; align-items: center; gap: .5rem;
  padding: .7rem 1.6rem; border-radius: 50px;
  background: var(--forest); color: var(--white);
  border: none; font-size: .92rem; font-weight: 600;
  cursor: pointer; transition: background .2s;
}
.adet__modal-login:hover { background: #1a3d2e; }
.adet__modal-later {
  padding: .7rem 1.6rem; border-radius: 50px;
  background: var(--white); color: var(--forest);
  border: 1.5px solid var(--forest);
  font-size: .92rem; font-weight: 500;
  cursor: pointer; transition: all .2s;
}
.adet__modal-later:hover { background: #f0f7f4; }

/* Responsive */
@media(max-width: 768px) {
  .adet__hero { grid-template-columns: 1fr; }
  .adet__reviews { grid-template-columns: 1fr; }
  .adet__products { grid-template-columns: 1fr 1fr; }
}
@media(max-width: 480px) {
  .adet__products { grid-template-columns: 1fr; }
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
