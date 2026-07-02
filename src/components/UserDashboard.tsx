import { useState, useEffect } from 'react';
import { api } from '../services/api';
import Footer from './Footer';
import { SITE_CONTENT as c } from '../constants/content';

type DashTab = 'profile' | 'orders' | 'activities' | 'reviews';

interface Props {
  user: any;
  onNavigate: (page: string) => void;
  onUserUpdate?: (user: any) => void;
}

/* ── helpers ──────────────────────────────── */
function driveImg(src: string) {
  if (!src) return '';
  const m = src.match(/\/d\/([^/]+)\//);
  if (m) {
    const driveUrl = encodeURIComponent(`https://drive.google.com/thumbnail?id=${m[1]}&sz=w200`);
    return `https://res.cloudinary.com/zgor0mh6/image/fetch/w_200,q_auto,f_auto/${driveUrl}`;
  }
  if (src.startsWith('http')) return src;
  const driveUrl = encodeURIComponent(`https://drive.google.com/thumbnail?id=${src}&sz=w200`);
  return `https://res.cloudinary.com/zgor0mh6/image/fetch/w_200,q_auto,f_auto/${driveUrl}`;
}

function fmtDate(d: string | Date) {
  if (!d) return '-';
  try { return new Date(d).toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' }); }
  catch { return String(d); }
}

const STATUS_MAP: Record<string, [string, string]> = {
  cancelled: ['Cancelled', '#e53935'],
  completed: ['Complete', '#2d6a4f'],
  pending:   ['Processing', '#b07d0a'],
  paid:      ['Processing', '#b07d0a'],
  shipping:  ['Processing', '#b07d0a'],
};

function StatusBadge({ s }: { s: string }) {
  const [label, color] = STATUS_MAP[s?.toLowerCase()] ?? ['Processing', '#b07d0a'];
  const icons: Record<string, string> = { Cancelled: '⊗', Complete: '✓', Processing: '🚚' };
  return <span style={{ color, fontWeight: 600, fontSize: '.88rem' }}>{icons[label]} {label}</span>;
}

function Stars({ n, max = 5, onClick }: { n: number; max?: number; onClick?: (i: number) => void }) {
  return (
    <div className="ud-stars">
      {Array.from({ length: max }, (_, i) => (
        <svg key={i} className={`ud-star ${i < n ? 'ud-star--on' : ''}`}
          width="18" height="18" viewBox="0 0 24 24"
          fill={i < n ? '#c8880a' : 'none'} stroke={i < n ? '#c8880a' : '#bbb'} strokeWidth="1.5"
          style={{ cursor: onClick ? 'pointer' : 'default' }}
          onClick={() => onClick?.(i + 1)}
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </div>
  );
}

/* ── icons ────────────────────────────────── */
const IconProfile = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconBag = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>
);
const IconWave = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
);
const IconStar = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const IconEdit = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ verticalAlign: 'middle', marginRight: '0.35rem' }}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const NAV_ITEMS = [
  { key: 'profile' as DashTab, label: 'My Profile', icon: <IconProfile /> },
  { key: 'orders' as DashTab, label: 'Order status', icon: <IconBag /> },
  { key: 'activities' as DashTab, label: 'Activity Reservations', icon: <IconWave /> },
  { key: 'reviews' as DashTab, label: 'To Reviews', icon: <IconStar /> },
];


/* ── main component ───────────────────────── */
export default function UserDashboard({ user, onNavigate, onUserUpdate }: Props) {
  const [tab, setTab] = useState<DashTab>('profile');
  const [products, setProducts] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  /* review edit/delete state */
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editRating, setEditRating] = useState(0);

  /* edit info modal state */
  const [showEditInfo, setShowEditInfo] = useState(false);
  const [editInfo, setEditInfo] = useState<any>({});
  const [editSaving, setEditSaving] = useState(false);
  const [editErr, setEditErr] = useState('');

  /* edit password modal state */
  const [showEditPw, setShowEditPw] = useState(false);
  const [editPw, setEditPw] = useState({ current: '', newPw: '', confirm: '' });
  const [showNewPw, setShowNewPw] = useState(false);
  const [showCfmPw, setShowCfmPw] = useState(false);
  const [showCurPw, setShowCurPw] = useState(false);

  const displayName = user?.user_type === 'legal_entity' ? user?.legal_entity_name : user?.first_name;

  /* reference data */
  useEffect(() => {
    api.products.getAll().then(setProducts).catch(() => {});
    api.activities.getAll().then(setActivities).catch(() => {});
  }, []);

  /* tab data */
  useEffect(() => {
    if (!user?.user_id) return;
    if (tab === 'orders' || tab === 'activities') {
      setLoading(true);
      api.orders.getByUserId(user.user_id).then(setOrders).catch(() => []).finally(() => setLoading(false));
    }
    if (tab === 'reviews') {
      setLoading(true);
      api.reviews.getByUserId(user.user_id).then(setReviews).catch(() => []).finally(() => setLoading(false));
    }
  }, [tab, user?.user_id]);

  const getProduct = (id: string) => products.find(p => p.id === id);
  const getActivity = (id: string) => activities.find(a => a.id === id);
  const productOrders = orders.filter(o => !!getProduct(o.item_id));
  const activityOrders = orders.filter(o => !!getActivity(o.item_id));

  /* ── handlers ── */
  async function doDelete() {
    if (!deleteId) return;
    try { await api.reviews.delete(deleteId); } catch {}
    setReviews(rs => rs.filter(r => r.review_id !== deleteId));
    setDeleteId(null);
  }

  async function doSave(reviewId: string) {
    try { await api.reviews.update(reviewId, { rating: editRating, comment: editText }); } catch {}
    setReviews(rs => rs.map(r => r.review_id === reviewId ? { ...r, rating: editRating, comment: editText } : r));
    setEditId(null);
  }

  async function handleSaveInfo() {
    setEditSaving(true);
    setEditErr('');
    try {
      const res = await api.auth.updateUser(user.user_id, editInfo);
      if (res.success) {
        onUserUpdate?.({ ...user, ...editInfo });
        setShowEditInfo(false);
      } else {
        setEditErr(res.message ?? 'เกิดข้อผิดพลาด');
      }
    } catch {
      setEditErr('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    } finally {
      setEditSaving(false);
    }
  }

  async function handleSavePw() {
    if (!editPw.newPw || !editPw.confirm || !editPw.current) {
      setEditErr('กรุณากรอกข้อมูลให้ครบทุกช่อง');
      return;
    }
    if (editPw.newPw !== editPw.confirm) {
      setEditErr('รหัสผ่านใหม่ไม่ตรงกัน');
      return;
    }
    setEditSaving(true);
    setEditErr('');
    try {
      const res = await api.auth.updatePassword(user.user_id, {
        currentPassword: editPw.current,
        newPassword: editPw.newPw,
      });
      if (res.success) {
        setShowEditPw(false);
      } else {
        setEditErr(res.message ?? 'เกิดข้อผิดพลาด');
      }
    } catch {
      setEditErr('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    } finally {
      setEditSaving(false);
    }
  }

  return (
    <>
      <div className="ud-page">
        {/* Left sidebar */}
        <aside className="ud-sidebar">
          {NAV_ITEMS.map(item => (
            <button key={item.key}
              className={`ud-nav-item ${tab === item.key ? 'ud-nav-item--active' : ''}`}
              onClick={() => setTab(item.key)}>
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </aside>

        {/* Right content */}
        <main className="ud-main">

          {/* ── MY PROFILE TAB ── */}
          {tab === 'profile' && (
            <div className="ud-section ud-section--profile">

              {/* ── Centre column ─────────────────── */}
              <div className="ud-profile-col">

                {/* Membership card */}
                <div className="ud-member-card">
                  <img src="/img/sookd card.png" alt="" />
                </div>

                {/* Points */}
                <div className="ud-points-section">
                  <div className="ud-points-top">
                    <span className="ud-points-label">20/199 SookD Points</span>
                  </div>
                  <div className="ud-points-bar">
                    <div className="ud-points-fill" style={{ width: '10%' }} />
                  </div>
                  <p className="ud-points-hint">สะสมอีก 180 SookD Point เพื่อเลื่อนขึ้นเป็นระดับ Silver</p>
                </div>

                <hr className="ud-divider" />

                {/* Avatar */}
                <div className="ud-profile-center">
                  <div className="ud-avatar-wrap">
                    <div className="ud-avatar-lg">{displayName?.[0]?.toUpperCase() ?? ''}</div>
                    <button className="ud-avatar-edit" aria-label="Edit avatar">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* User information */}
                <h3 className="ud-info-title">User Information</h3>
                <table className="ud-info-table">
                  <tbody>
                    {user?.user_type === 'individual' ? (
                      <>
                        <tr>
                          <td className="ud-info-key">Name</td>
                          <td className="ud-info-sep">:</td>
                          <td className="ud-info-val">{user.first_name} {user.last_name}</td>
                        </tr>
                        <tr>
                          <td className="ud-info-key">Role</td>
                          <td className="ud-info-sep">:</td>
                          <td className="ud-info-val">Individual</td>
                        </tr>
                        <tr>
                          <td className="ud-info-key">Gender</td>
                          <td className="ud-info-sep">:</td>
                          <td className="ud-info-val">{user.gender || '-'}</td>
                        </tr>
                        <tr>
                          <td className="ud-info-key">Birthdate</td>
                          <td className="ud-info-sep">:</td>
                          <td className="ud-info-val">{user.birthdate || '-'}</td>
                        </tr>
                      </>
                    ) : (
                      <>
                        <tr>
                          <td className="ud-info-key">Name</td>
                          <td className="ud-info-sep">:</td>
                          <td className="ud-info-val">{user.legal_entity_name}</td>
                        </tr>
                        <tr>
                          <td className="ud-info-key">Role</td>
                          <td className="ud-info-sep">:</td>
                          <td className="ud-info-val">Legal Entity</td>
                        </tr>
                        <tr>
                          <td className="ud-info-key">Type</td>
                          <td className="ud-info-sep">:</td>
                          <td className="ud-info-val">{user.business_type || '-'}</td>
                        </tr>
                        <tr>
                          <td className="ud-info-key">Reg No.</td>
                          <td className="ud-info-sep">:</td>
                          <td className="ud-info-val">{user.business_registration_number || '-'}</td>
                        </tr>
                      </>
                    )}
                    <tr>
                      <td className="ud-info-key">Email</td>
                      <td className="ud-info-sep">:</td>
                      <td className="ud-info-val">{user.email}</td>
                    </tr>
                    <tr>
                      <td className="ud-info-key">Phone</td>
                      <td className="ud-info-sep">:</td>
                      <td className="ud-info-val">{user.phone_number || '-'}</td>
                    </tr>
                    <tr>
                      <td className="ud-info-key">Address</td>
                      <td className="ud-info-sep">:</td>
                      <td className="ud-info-val">{user.address || '-'}</td>
                    </tr>
                  </tbody>
                </table>

                {/* Edit buttons */}
                <div className="ud-profile-btns">
                  <button className="ud-edit-btn" onClick={() => {
                    setEditInfo({ ...user });
                    setEditErr('');
                    setShowEditInfo(true);
                  }}>
                    <IconEdit /> Edit Information
                  </button>
                  <button className="ud-edit-btn" onClick={() => {
                    setEditPw({ current: '', newPw: '', confirm: '' });
                    setEditErr('');
                    setShowEditPw(true);
                  }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ verticalAlign: 'middle', marginRight: '0.35rem' }}>
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    Edit Password
                  </button>
                </div>

              </div>{/* end ud-profile-col */}

            </div>
          )}

          {/* ── ORDER STATUS TAB ── */}
          {tab === 'orders' && (
            <div className="ud-section">
              <h2 className="ud-section__title">Order Status</h2>
              <p className="ud-section__sub">Monitor your recent acquisitions. Every piece is handled with care for you and nature.</p>
              {loading ? <p className="ud-loading">กำลังโหลด...</p> : productOrders.length === 0
                ? <p className="ud-empty">ยังไม่มีคำสั่งซื้อ</p>
                : productOrders.map(o => {
                  const p = getProduct(o.item_id);
                  return (
                    <div key={o.order_id} className="ud-card">
                      <img className="ud-card__img" src={driveImg(p?.image)} alt={p?.name}
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      <div className="ud-card__body">
                        <h3 className="ud-card__name">{p?.name ?? o.item_id}</h3>
                        <div className="ud-card__meta">
                          <span><strong>DATE</strong><br />{fmtDate(o.order_date)}</span>
                          <span><strong>STATUS</strong><br /><StatusBadge s={o.order_status} /></span>
                          <span><strong>TOTAL</strong><br />{o.total_price} Baht</span>
                        </div>
                      </div>
                      <button className="ud-detail-btn" onClick={() => onNavigate('products')}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg> Detail
                      </button>
                    </div>
                  );
                })}
            </div>
          )}

          {/* ── ACTIVITY RESERVATIONS TAB ── */}
          {tab === 'activities' && (
            <div className="ud-section">
              <h2 className="ud-section__title">Activity Reservations</h2>
              <p className="ud-section__sub">Anticipate your upcoming eco-experiences. Seamlessly manage your mindful itineraries.</p>
              {loading ? <p className="ud-loading">กำลังโหลด...</p> : activityOrders.length === 0
                ? <p className="ud-empty">ยังไม่มีการจองกิจกรรม</p>
                : activityOrders.map(o => {
                  const a = getActivity(o.item_id);
                  return (
                    <div key={o.order_id} className="ud-card">
                      <img className="ud-card__img" src={driveImg(a?.image)} alt={a?.name}
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      <div className="ud-card__body">
                        <h3 className="ud-card__name">{a?.name ?? o.item_id}</h3>
                        <div className="ud-card__meta">
                          <span><strong>DATE</strong><br />{fmtDate(o.order_date)}</span>
                          {a?.date && <span><strong>Time</strong><br />{a.date}</span>}
                          {a?.location && <span><strong>Location</strong><br />{a.location}</span>}
                          <span><strong>TOTAL</strong><br />{o.total_price} Baht</span>
                        </div>
                      </div>
                      <button className="ud-detail-btn" onClick={() => onNavigate('experiences')}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg> Detail
                      </button>
                    </div>
                  );
                })}
            </div>
          )}

          {/* ── TO REVIEWS TAB ── */}
          {tab === 'reviews' && (
            <div className="ud-section">
              <h2 className="ud-section__title">To Reviews</h2>
              <p className="ud-section__sub">Your voice matters. Share your thoughts on our sustainable products and experiences.</p>
              {loading ? <p className="ud-loading">กำลังโหลด...</p> : reviews.length === 0
                ? <p className="ud-empty">ยังไม่มีรีวิว</p>
                : (
                  <div className="ud-review-grid">
                    {reviews.map(r => {
                      const isProduct = String(r.item_id).startsWith('PRD');
                      const item = isProduct ? getProduct(r.item_id) : getActivity(r.item_id);
                      const imgId = item?.image;
                      const name = item?.name;
                      const isEditing = editId === r.review_id;
                      return (
                        <div key={r.review_id} className="ud-review-card">
                          <div className="ud-review-card__top">
                            <img className="ud-review-card__img" src={driveImg(imgId ?? '')} alt={name}
                              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                            <div className="ud-review-card__info">
                              <h4 className="ud-review-card__name">{name ?? r.item_id}</h4>
                              {isProduct
                                ? <p className="ud-review-card__meta"><strong>Total</strong> : {item?.price ?? '-'} Baht</p>
                                : <>
                                    {r.review_date && (
                                      <p className="ud-review-card__meta"><strong>Date</strong> : {fmtDate(r.review_date)}</p>
                                    )}
                                    {item?.location && (
                                      <p className="ud-review-card__meta"><strong>Location</strong> : {item.location}</p>
                                    )}
                                  </>
                              }
                            </div>
                          </div>
                          {isEditing ? (
                            <>
                              <Stars n={editRating} onClick={setEditRating} />
                              <textarea className="ud-review-textarea"
                                value={editText} onChange={e => setEditText(e.target.value)} />
                              <div className="ud-review-actions">
                                <button className="ud-review-btn" onClick={() => doSave(r.review_id)}>Save Changes</button>
                                <button className="ud-review-btn ud-review-btn--cancel" onClick={() => setEditId(null)}>Cancel</button>
                              </div>
                            </>
                          ) : (
                            <>
                              <Stars n={Number(r.rating)} />
                              <p className="ud-review-comment">{r.comment}</p>
                              <div className="ud-review-actions">
                                <button className="ud-review-btn" onClick={() => { setEditId(r.review_id); setEditText(r.comment); setEditRating(Number(r.rating)); }}>
                                  ✏ Edit Review
                                </button>
                                <button className="ud-review-btn ud-review-btn--del" onClick={() => setDeleteId(r.review_id)}>
                                  🗑 Delete Review
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
            </div>
          )}
        </main>
      </div>

      {/* ── DELETE REVIEW MODAL ── */}
      {deleteId && (
        <div className="ud-overlay" onClick={() => setDeleteId(null)}>
          <div className="ud-modal" onClick={e => e.stopPropagation()}>
            <button className="ud-modal__x" onClick={() => setDeleteId(null)}>×</button>
            <h3 className="ud-modal__title">Are you sure?</h3>
            <p className="ud-modal__body">Do you really want to delete the comment/rating? This action cannot be done.</p>
            <div className="ud-modal__btns">
              <button className="ud-modal__btn ud-modal__btn--confirm" onClick={doDelete}>✓ Confirm</button>
              <button className="ud-modal__btn ud-modal__btn--cancel" onClick={() => setDeleteId(null)}>✕ Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT INFORMATION MODAL ── */}
      {showEditInfo && (
        <div className="ud-overlay" onClick={() => setShowEditInfo(false)}>
          <div className="ud-modal ud-modal--form" onClick={e => e.stopPropagation()}>
            <button className="ud-modal__x" onClick={() => setShowEditInfo(false)}>×</button>
            <h3 className="ud-modal__title"><IconEdit /> Edit Information</h3>

            <div className="ud-form">
              {user?.user_type === 'individual' ? (
                <>
                  <div className="ud-form-row">
                    <div className="ud-field">
                      <label className="ud-field__label">First Name</label>
                      <input className="ud-field__input" value={editInfo.first_name || ''}
                        onChange={e => setEditInfo((p: any) => ({ ...p, first_name: e.target.value }))} />
                    </div>
                    <div className="ud-field">
                      <label className="ud-field__label">Last Name</label>
                      <input className="ud-field__input" value={editInfo.last_name || ''}
                        onChange={e => setEditInfo((p: any) => ({ ...p, last_name: e.target.value }))} />
                    </div>
                  </div>
                  <div className="ud-field">
                    <label className="ud-field__label">Gender</label>
                    <select className="ud-field__input" value={editInfo.gender || ''}
                      onChange={e => setEditInfo((p: any) => ({ ...p, gender: e.target.value }))}>
                      <option value="">-- เลือก --</option>
                      <option value="ชาย">ชาย</option>
                      <option value="หญิง">หญิง</option>
                      <option value="อื่นๆ">อื่นๆ</option>
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div className="ud-field">
                    <label className="ud-field__label">Organization Name</label>
                    <input className="ud-field__input" value={editInfo.legal_entity_name || ''}
                      onChange={e => setEditInfo((p: any) => ({ ...p, legal_entity_name: e.target.value }))} />
                  </div>
                  <div className="ud-field">
                    <label className="ud-field__label">Type</label>
                    <select className="ud-field__input" value={editInfo.business_type || ''}
                      onChange={e => setEditInfo((p: any) => ({ ...p, business_type: e.target.value }))}>
                      <option value="">-- เลือก --</option>
                      <option value="บริษัท">บริษัท</option>
                      <option value="ห้างหุ้นส่วน">ห้างหุ้นส่วน</option>
                      <option value="มูลนิธิ">มูลนิธิ</option>
                      <option value="สมาคม">สมาคม</option>
                      <option value="องค์กรอื่นๆ">องค์กรอื่นๆ</option>
                    </select>
                  </div>
                  <div className="ud-field">
                    <label className="ud-field__label">Registration Number</label>
                    <input className="ud-field__input" value={editInfo.business_registration_number || ''}
                      onChange={e => setEditInfo((p: any) => ({ ...p, business_registration_number: e.target.value }))} />
                  </div>
                </>
              )}
              <div className="ud-field">
                <label className="ud-field__label">Email</label>
                <input className="ud-field__input" type="email" value={editInfo.email || ''}
                  onChange={e => setEditInfo((p: any) => ({ ...p, email: e.target.value }))} />
              </div>
              <div className="ud-field">
                <label className="ud-field__label">Phone Number</label>
                <input className="ud-field__input" value={editInfo.phone_number || ''}
                  onChange={e => setEditInfo((p: any) => ({ ...p, phone_number: e.target.value }))} />
              </div>
              <div className="ud-field">
                <label className="ud-field__label">Address</label>
                <textarea className="ud-field__input ud-field__textarea" value={editInfo.address || ''}
                  onChange={e => setEditInfo((p: any) => ({ ...p, address: e.target.value }))} rows={2} />
              </div>
            </div>

            {editErr && <p className="ud-form-err">{editErr}</p>}

            <div className="ud-modal__btns">
              <button className="ud-modal__btn ud-modal__btn--save" onClick={handleSaveInfo} disabled={editSaving}>
                {editSaving ? 'กำลังบันทึก...' : 'Save Changes'}
              </button>
              <button className="ud-modal__btn ud-modal__btn--cancel-outline" onClick={() => setShowEditInfo(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT PASSWORD MODAL ── */}
      {showEditPw && (
        <div className="ud-overlay" onClick={() => setShowEditPw(false)}>
          <div className="ud-modal ud-modal--form" onClick={e => e.stopPropagation()}>
            <button className="ud-modal__x" onClick={() => setShowEditPw(false)}>×</button>
            <h3 className="ud-modal__title">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ verticalAlign: 'middle', marginRight: '0.35rem' }}>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Edit Password
            </h3>

            <div className="ud-form">
              <div className="ud-field">
                <label className="ud-field__label">New Password</label>
                <div className="ud-pw-wrap">
                  <input className="ud-field__input ud-pw-input" type={showNewPw ? 'text' : 'password'}
                    value={editPw.newPw} onChange={e => setEditPw(p => ({ ...p, newPw: e.target.value }))} />
                  <button className="ud-pw-eye" type="button" onClick={() => setShowNewPw(p => !p)}>
                    {showNewPw ? '🙈' : '👁'}
                  </button>
                </div>
              </div>
              <div className="ud-field">
                <label className="ud-field__label">Confirm New Password</label>
                <div className="ud-pw-wrap">
                  <input className="ud-field__input ud-pw-input" type={showCfmPw ? 'text' : 'password'}
                    value={editPw.confirm} onChange={e => setEditPw(p => ({ ...p, confirm: e.target.value }))} />
                  <button className="ud-pw-eye" type="button" onClick={() => setShowCfmPw(p => !p)}>
                    {showCfmPw ? '🙈' : '👁'}
                  </button>
                </div>
              </div>
              <hr className="ud-form-divider" />
              <div className="ud-field">
                <label className="ud-field__label">Current Password</label>
                <div className="ud-pw-wrap">
                  <input className="ud-field__input ud-pw-input" type={showCurPw ? 'text' : 'password'}
                    value={editPw.current} onChange={e => setEditPw(p => ({ ...p, current: e.target.value }))} />
                  <button className="ud-pw-eye" type="button" onClick={() => setShowCurPw(p => !p)}>
                    {showCurPw ? '🙈' : '👁'}
                  </button>
                </div>
              </div>
            </div>

            {editErr && <p className="ud-form-err">{editErr}</p>}

            <div className="ud-modal__btns">
              <button className="ud-modal__btn ud-modal__btn--save" onClick={handleSavePw} disabled={editSaving}>
                {editSaving ? 'กำลังบันทึก...' : 'Save Changes'}
              </button>
              <button className="ud-modal__btn ud-modal__btn--cancel-outline" onClick={() => setShowEditPw(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer data={c.footer} />
    </>
  );
}

export const USER_DASHBOARD_CSS = `
/* ── Layout ─────────────────────────────── */
.ud-page {
  display: flex;
  min-height: calc(100vh - 64px);
  padding-top: 64px;
  background: #f4f6f4;
}

/* ── Left sidebar ───────────────────────── */
.ud-sidebar {
  width: 168px; flex-shrink: 0;
  background: #D4DDDD;
  border-right: 1px solid #c4cccc;
  padding: 1.5rem 0;
  display: flex; flex-direction: column;
  position: sticky; top: 64px; height: calc(100vh - 64px);
  overflow-y: auto;
}
.ud-nav-item {
  display: flex; align-items: center; gap: .65rem;
  padding: .8rem 1.2rem;
  background: none; border: none; cursor: pointer;
  font-size: .82rem; font-weight: 500;
  color: #555; text-align: left; width: 100%;
  transition: background .18s, color .18s;
  font-family: var(--font-th);
}
.ud-nav-item:hover { background: #f0f5f2; color: var(--forest); }
.ud-nav-item--active { background: var(--forest) !important; color: var(--white) !important; }

/* ── Right main ─────────────────────────── */
.ud-main {
  flex: 1; padding: 2.5rem 3rem;
}

/* ── Profile layout ─────────────────────── */
.ud-section--profile { width: 100%; }
.ud-profile-col {
  max-width: 600px;
  margin: 0 auto;
}

/* ── Section header ─────────────────────── */
.ud-section__title { font-size: 1.6rem; font-weight: 700; color: var(--text); margin-bottom: .3rem; }
.ud-section__sub { font-size: .85rem; color: #888; margin-bottom: 2rem; font-family: var(--font-th); }
.ud-loading, .ud-empty { color: #999; font-size: .9rem; text-align: center; padding: 3rem 0; }

/* ── Membership card ─────────────────────── */
.ud-member-card {
  width: 100%;
  max-width: 420px;
  margin: 0 auto 1.4rem;
}
.ud-member-card img {
  width: 100%;
  height: auto;
  display: block;
}

/* ── Points ─────────────────────────────── */
.ud-points-section { margin-bottom: 1.2rem; }
.ud-points-top {
  display: flex; justify-content: space-between;
  align-items: center; margin-bottom: .45rem;
}
.ud-points-label { font-size: .9rem; font-weight: 700; color: var(--text); }
.ud-points-count { font-size: .82rem; color: #888; }
.ud-points-bar {
  width: 100%; height: 8px; border-radius: 50px;
  background: #e0e7e0; overflow: hidden;
}
.ud-points-fill {
  height: 100%; border-radius: 50px;
  background: #8AADA0;
  transition: width .5s ease;
}
.ud-points-hint { font-size: .78rem; color: #aaa; margin-top: .5rem; font-family: var(--font-th); }

/* ── Divider ────────────────────────────── */
.ud-divider {
  border: none; border-top: 2px solid #b8c4b8;
  margin: 1.8rem 0;
}

/* ── Avatar ─────────────────────────────── */
.ud-profile-center { display: flex; justify-content: center; margin-bottom: 1.2rem; }
.ud-avatar-wrap { position: relative; display: inline-block; }
.ud-avatar-lg {
  width: 90px; height: 90px; border-radius: 50%;
  background: #ccd6cc; color: #6a8a6a;
  display: flex; align-items: center; justify-content: center;
  font-size: 2.2rem; font-weight: 700;
  border: 3px solid #e0e8e0;
}
.ud-avatar-edit {
  position: absolute; bottom: 2px; right: 2px;
  width: 26px; height: 26px; border-radius: 50%;
  background: var(--white); border: 2px solid #d0d8d0;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: #555;
  box-shadow: 0 1px 4px rgba(0,0,0,.12);
}
.ud-avatar-edit:hover { background: #f5f5f5; }

/* ── User info table ────────────────────── */
.ud-info-title {
  font-size: 1.3rem; font-weight: 700;
  color: var(--text); margin-bottom: 1rem;
  text-align: center;
}
.ud-info-table {
  border-collapse: collapse;
  margin: 0 auto 1.4rem;
}
.ud-info-table tr { border-bottom: 1px solid #f0f0f0; }
.ud-info-table tr:last-child { border-bottom: none; }
.ud-info-key {
  padding: .55rem 1rem .55rem 0;
  font-size: .85rem; font-weight: 600; color: #777;
  width: 100px; vertical-align: top;
  white-space: nowrap; text-align: right;
}
.ud-info-sep {
  padding: .55rem .7rem; color: #bbb;
  vertical-align: top; width: 14px;
}
.ud-info-val {
  padding: .55rem .5rem;
  font-size: .88rem; color: var(--text);
  font-family: var(--font-th); line-height: 1.5;
  min-width: 200px;
}

/* ── Edit buttons ───────────────────────── */
.ud-profile-btns { display: flex; gap: 1rem; margin: 1.4rem 0 0.5rem; margin-left: 50%; width: max-content; }
.ud-edit-btn {
  padding: .6rem 1.6rem; border-radius: 50px;
  border: 1.5px solid #C8A070;
  background: #E8C8A0; color: #1e3a25;
  font-size: .85rem; font-weight: 600; cursor: pointer;
  display: flex; align-items: center; gap: .4rem;
  transition: background .18s, border-color .18s;
  font-family: var(--font-th);
}
.ud-edit-btn:hover { background: #D4AA82; border-color: #A87848; }

/* ── Social Impact ──────────────────────── */
.ud-impact-title {
  font-size: 1.3rem; font-weight: 700;
  color: var(--text); margin-bottom: .9rem;
  text-align: center;
}
.ud-impact-grid {
  display: flex; flex-wrap: wrap; gap: 1.2rem;
  justify-content: center; margin-bottom: 1rem;
}
.ud-impact-card {
  background: #C4D4D0;
  border-radius: 16px;
  width: 148px; height: 148px;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  text-align: center;
}
.ud-impact-val {
  font-size: 1.6rem; font-weight: 800;
  color: var(--forest); line-height: 1.2;
}
.ud-impact-label {
  font-size: .72rem; color: #666; margin-top: .35rem;
  font-family: var(--font-th); line-height: 1.4;
}

/* ── Order / Activity cards ─────────────── */
.ud-card {
  background: var(--white); border-radius: 12px;
  padding: 1rem 1.2rem; margin-bottom: 1rem;
  display: flex; align-items: center; gap: 1.2rem;
  box-shadow: 0 1px 8px rgba(0,0,0,.05);
}
.ud-card__img {
  width: 88px; height: 70px; object-fit: cover;
  border-radius: 8px; flex-shrink: 0; background: #eee;
}
.ud-card__body { flex: 1; min-width: 0; }
.ud-card__name { font-size: .95rem; font-weight: 600; margin-bottom: .6rem; font-family: var(--font-th); }
.ud-card__meta { display: flex; gap: 2rem; flex-wrap: wrap; }
.ud-card__meta > span { font-size: .8rem; color: #555; line-height: 1.6; font-family: var(--font-th); }
.ud-card__meta strong { text-transform: uppercase; font-size: .72rem; color: #999; display: block; }
.ud-detail-btn {
  padding: .5rem 1rem; border-radius: 50px;
  background: var(--forest); color: var(--white);
  border: none; cursor: pointer; font-size: .82rem;
  display: flex; align-items: center; gap: .4rem;
  white-space: nowrap; flex-shrink: 0;
  font-family: var(--font-th);
}
.ud-detail-btn:hover { background: #1a3d2e; }

/* ── Reviews ────────────────────────────── */
.ud-review-grid {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 1.2rem;
}
.ud-review-card {
  background: var(--white); border-radius: 12px;
  padding: 1.1rem; box-shadow: 0 1px 8px rgba(0,0,0,.05);
}
.ud-review-card__top { display: flex; gap: .9rem; margin-bottom: .8rem; }
.ud-review-card__img {
  width: 70px; height: 70px; object-fit: cover;
  border-radius: 8px; flex-shrink: 0; background: #eee;
}
.ud-review-card__info { flex: 1; }
.ud-review-card__name { font-size: .9rem; font-weight: 600; margin-bottom: .3rem; font-family: var(--font-th); }
.ud-review-card__meta { font-size: .78rem; color: #666; line-height: 1.7; font-family: var(--font-th); }
.ud-stars { display: flex; gap: 2px; margin: .5rem 0; }
.ud-star { transition: fill .15s; }
.ud-star--on { fill: #c8880a; stroke: #c8880a; }
.ud-review-comment { font-size: .83rem; color: #555; margin: .4rem 0 .8rem; font-family: var(--font-th); line-height: 1.5; }
.ud-review-textarea {
  width: 100%; min-height: 80px;
  border: 1.5px solid #d5d5d5; border-radius: 8px;
  padding: .6rem; font-size: .85rem; font-family: var(--font-th);
  resize: vertical; outline: none; margin: .4rem 0 .8rem; box-sizing: border-box;
}
.ud-review-textarea:focus { border-color: var(--forest); }
.ud-review-actions { display: flex; gap: .6rem; }
.ud-review-btn {
  padding: .45rem 1rem; border-radius: 50px;
  font-size: .78rem; font-weight: 600; cursor: pointer;
  border: 1.5px solid var(--forest); background: none;
  color: var(--forest); transition: .2s;
  font-family: var(--font-th);
}
.ud-review-btn:hover { background: #f0f5f2; }
.ud-review-btn--del { border-color: #e53935; color: #e53935; }
.ud-review-btn--del:hover { background: #fff5f5; }
.ud-review-btn--cancel { border-color: #999; color: #666; }
.ud-review-btn--cancel:hover { background: #f5f5f5; }

/* ── Overlay / Modal ─────────────────────── */
.ud-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,.45);
  z-index: 1000; display: flex; align-items: center; justify-content: center;
}
.ud-modal {
  background: var(--white); border-radius: 16px;
  padding: 2rem 2.5rem; max-width: 380px; width: 90%;
  position: relative; text-align: center;
  box-shadow: 0 8px 40px rgba(0,0,0,.2);
}
.ud-modal--form {
  max-width: 480px; text-align: left;
  max-height: 90vh; overflow-y: auto;
}
.ud-modal__x {
  position: absolute; top: .8rem; right: 1rem;
  background: none; border: none; font-size: 1.4rem;
  cursor: pointer; color: #888;
}
.ud-modal__title {
  font-size: 1.05rem; font-weight: 700; margin-bottom: 1.2rem;
  display: flex; align-items: center;
}
.ud-modal__body { font-size: .85rem; color: #666; margin-bottom: 1.5rem; line-height: 1.6; font-family: var(--font-th); }
.ud-modal__btns { display: flex; gap: .8rem; justify-content: center; margin-top: 1.4rem; }
.ud-modal--form .ud-modal__btns { justify-content: flex-start; }
.ud-modal__btn {
  padding: .6rem 2rem; border-radius: 50px; min-width: 130px;
  font-size: .9rem; font-weight: 600; cursor: pointer; border: none;
  display: flex; align-items: center; justify-content: center; gap: .4rem;
}
.ud-modal__btn--confirm { background: #ebebeb; color: #333; }
.ud-modal__btn--confirm:hover { background: #ddd; }
.ud-modal__btn--cancel { background: #fde8e8; color: #e53935; }
.ud-modal__btn--cancel:hover { background: #fac; }
.ud-modal__btn--save {
  background: var(--forest); color: var(--white);
  border-radius: 50px; padding: .6rem 2rem; min-width: 130px;
  font-size: .9rem; font-weight: 600; cursor: pointer; border: none;
}
.ud-modal__btn--save:hover { background: #1a3d2e; }
.ud-modal__btn--save:disabled { opacity: .6; cursor: not-allowed; }
.ud-modal__btn--cancel-outline {
  background: #f5f5f5; color: #666;
  border: none; border-radius: 50px;
  padding: .6rem 2rem; min-width: 130px;
  font-size: .9rem; font-weight: 600; cursor: pointer;
}
.ud-modal__btn--cancel-outline:hover { background: #ebebeb; }

/* ── Edit form ──────────────────────────── */
.ud-form { display: flex; flex-direction: column; gap: .75rem; }
.ud-form-row { display: flex; gap: .75rem; }
.ud-form-row .ud-field { flex: 1; }
.ud-field { display: flex; flex-direction: column; gap: .3rem; }
.ud-field__label { font-size: .8rem; font-weight: 600; color: #666; font-family: var(--font-th); }
.ud-field__input {
  padding: .55rem .75rem; border: 1.5px solid #d5d5d5; border-radius: 8px;
  font-size: .88rem; outline: none; font-family: var(--font-th);
  width: 100%; box-sizing: border-box; background: var(--white);
}
.ud-field__input:focus { border-color: var(--forest); }
.ud-field__textarea { resize: vertical; min-height: 60px; }
.ud-pw-wrap { position: relative; }
.ud-pw-input { padding-right: 2.4rem; }
.ud-pw-eye {
  position: absolute; right: .6rem; top: 50%; transform: translateY(-50%);
  background: none; border: none; cursor: pointer; font-size: 1rem; color: #888;
  padding: 0; line-height: 1;
}
.ud-form-err { color: #e53935; font-size: .82rem; margin-top: .6rem; font-family: var(--font-th); }
.ud-form-divider { border: none; border-top: 1px solid #eee; margin: .4rem 0; }

@media(max-width: 768px) {
  .ud-sidebar { width: 120px; }
  .ud-main { padding: 1.5rem 1rem; }
  .ud-review-grid { grid-template-columns: 1fr; }
  .ud-card__meta { gap: 1rem; }
  .ud-impact-card { width: 120px; height: 120px; }
  .ud-form-row { flex-direction: column; }
}
`;
