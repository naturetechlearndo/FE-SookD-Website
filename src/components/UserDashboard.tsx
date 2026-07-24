import { useState, useEffect } from 'react';
import { api } from '../services/api';
import Footer from './Footer';
import { SITE_CONTENT as c } from '../constants/content';
import { trackEvent } from '../utils/gtag';

type DashTab = 'profile' | 'orders' | 'activities' | 'reviews';

interface Props {
  user: any;
  onNavigate: (page: string) => void;
  onUserUpdate?: (user: any) => void;
  onSelectProduct?: (productId: string, order: any) => void;
  onSelectActivity?: (activityId: string, order: any) => void;
  lang?: 'TH' | 'ENG';
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

function toTs(d: any): number {
  const n = Number(d);
  return (!isNaN(n) && n > 1000) ? (n - 25569) * 86400 * 1000 : new Date(d).getTime() || 0;
}

function fmtDate(d: string | Date | number) {
  if (d === '' || d === null || d === undefined) return '-';
  try {
    const n = Number(d);
    let date: Date;
    if (!isNaN(n) && n > 1000) {
      // Google Sheets serial date: days since Dec 30, 1899
      date = new Date((n - 25569) * 86400 * 1000);
    } else {
      date = new Date(d as string | Date);
    }
    if (isNaN(date.getTime())) return String(d);
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  } catch { return String(d); }
}

const STATUS_MAP: Record<string, [string, string]> = {
  completed:  ['Completed',  '#2d6a4f'],
  paid:       ['Paid',       '#1a6b8a'],
  shipped:    ['Shipped',    '#5a3e8a'],
  pending:    ['Pending',    '#b07d0a'],
  cancelled:  ['Cancelled',  '#b03a2e'],
  processing: ['Processing', '#b07d0a'],
};

function StatusBadge({ s, isTH }: { s: string; isTH: boolean }) {
  const isCompleted = s?.toLowerCase().trim() === 'completed';
  const label = isCompleted ? (isTH ? 'เสร็จสิ้น' : 'Completed') : (isTH ? 'รอชำระเงิน' : 'Payment Pending');
  const color = isCompleted ? '#2d6a4f' : '#b07d0a';
  return <span style={{ color, fontWeight: 600, fontSize: '.88rem' }}>{label}</span>;
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
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

/* ── icons ────────────────────────────────── */
const IconProfile = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const IconBag = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);
const IconWave = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);
const IconStar = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
const IconEdit = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ verticalAlign: 'middle', marginRight: '0.35rem' }}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const NAV_LABELS: Record<string, { th: string; en: string }> = {
  profile:     { th: 'โปรไฟล์ของฉัน',    en: 'My Profile' },
  orders:      { th: 'สถานะคำสั่งซื้อ',   en: 'Order status' },
  activities:  { th: 'การจองกิจกรรม',     en: 'Activity Reservations' },
  reviews:     { th: 'รีวิว',             en: 'To Reviews' },
};

const NAV_ITEMS = [
  { key: 'profile' as DashTab, icon: <IconProfile /> },
  { key: 'orders' as DashTab, icon: <IconBag /> },
  { key: 'activities' as DashTab, icon: <IconWave /> },
  { key: 'reviews' as DashTab, icon: <IconStar /> },
];


/* ── tier helper ──────────────────────────── */
function getTierInfo(points: number) {
  if (points >= 1000) return { tier: 'Legend', relPts: points - 1000, maxPts: null as number | null, nextTier: null as string | null, needed: 0, fillPct: 100 };
  if (points >= 500)  return { tier: 'Gold',   relPts: points - 500,  maxPts: 499, nextTier: 'Legend', needed: 1000 - points, fillPct: Math.min(100, (points - 500)  / 499 * 100) };
  if (points >= 200)  return { tier: 'Silver',  relPts: points - 200,  maxPts: 299, nextTier: 'Gold',   needed: 500  - points, fillPct: Math.min(100, (points - 200)  / 299 * 100) };
  return                     { tier: 'Nature',  relPts: points,        maxPts: 199, nextTier: 'Silver', needed: 200  - points, fillPct: Math.min(100, points / 199 * 100) };
}

/* ── main component ───────────────────────── */
export default function UserDashboard({ user, onNavigate, onUserUpdate, onSelectProduct, onSelectActivity, lang = 'TH' }: Props) {
  const isTH = lang === 'TH';
  const [tab, setTab] = useState<DashTab>('profile');
  const [products, setProducts] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [reviewsReady, setReviewsReady] = useState(false);

  /* review edit/delete/create state */
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [newItemId, setNewItemId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editRating, setEditRating] = useState(0);
  const [reviewNotice, setReviewNotice] = useState(false);

  /* order filter state */
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | 'completed' | 'processing'>('all');
  const [showAllOrders, setShowAllOrders] = useState(false);
  const [showAllActivities, setShowAllActivities] = useState(false);
  const ORDERS_VISIBLE = 5;

  /* review filter state */
  const [reviewTypeFilter, setReviewTypeFilter] = useState<'all' | 'product' | 'activity'>('all');
  const [reviewDateFilter, setReviewDateFilter] = useState('');

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

  const [calculatedPoints, setCalculatedPoints] = useState(Number(user?.point ?? 0));
  const displayName = user?.user_type === 'legal_entity' ? user?.legal_entity_name : user?.first_name;

  /* reference data */
  useEffect(() => {
    api.products.getAll().then(setProducts).catch(() => { });
    api.activities.getAll().then(setActivities).catch(() => { });
  }, []);

  /* load orders for points on mount */
  useEffect(() => {
    if (!user?.user_id) return;
    api.orders.getByUserId(user.user_id)
      .then((allOrders: any[]) => {
        const pts = allOrders
          .filter(o => o.order_status?.toLowerCase() === 'completed')
          .reduce((sum, o) => sum + Math.floor(Number(o.total_price || 0) / 100), 0);
        setCalculatedPoints(pts);
        if (pts !== Number(user.point ?? 0)) {
          api.auth.updateUser(user.user_id, { point: pts })
            .then((res: any) => { if (res.success) onUserUpdate?.({ ...user, point: pts }); })
            .catch(() => {});
        }
      })
      .catch(() => {});
  }, [user?.user_id]);

  /* tab data */
  useEffect(() => {
    if (!user?.user_id) return;
    const dedup = (ords: any[]) => {
      const seen = new Set<string>();
      return ords.filter(o => {
        const key = String(o.order_id);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    };
    if (tab === 'orders' || tab === 'activities') {
      setLoading(true);
      api.orders.getByUserId(user.user_id).then(o => setOrders(dedup(o))).catch(() => []).finally(() => setLoading(false));
    }
    if (tab === 'reviews') {
      setLoading(true);
      setReviewsReady(false);
      Promise.all([
        api.orders.getByUserId(user.user_id),
        api.reviews.getByUserId(user.user_id),
      ]).then(([ords, revs]) => { setOrders(dedup(ords)); setReviews(revs); })
        .catch(() => {}).finally(() => { setLoading(false); setReviewsReady(true); });
    }
  }, [tab, user?.user_id]);

  const langSuffix = lang === 'TH' ? '_TH' : '_EN';
  const normalizeId = (id: string) => id?.replace(/_(TH|EN)$/, '').replace(/_B2C/, '') ?? '';
  const getProduct = (id: string) => {
    const base = normalizeId(id);
    return products.find(p => normalizeId(p.id) === base && p.id?.endsWith(langSuffix))
        ?? products.find(p => normalizeId(p.id) === base);
  };
  const getActivity = (id: string) => {
    const base = normalizeId(id);
    return activities.find(a => normalizeId(a.id) === base && a.id?.endsWith(langSuffix))
        ?? activities.find(a => normalizeId(a.id) === base);
  };
  const productOrders = orders.filter(o => !!getProduct(o.item_id));
  const activityOrders = orders.filter(o => !!getActivity(o.item_id));

  /* ── helpers ── */
  function afterReviewAction() {
    setDeleteId(null);
    setEditId(null);
    setNewItemId(null);
    setEditText('');
    setEditRating(0);
    setReviewNotice(true);
  }

  /* ── handlers ── */
  async function doDelete() {
    if (!deleteId) return;
    setReviews(prev => prev.filter(r => r.review_id !== deleteId));
    try { await api.reviews.delete(deleteId); } catch { }
    afterReviewAction();
  }

  async function doSave(reviewId: string) {
    setReviews(prev => prev.map(r =>
      r.review_id === reviewId ? { ...r, rating: editRating, comment: editText } : r
    ));
    try { await api.reviews.update(reviewId, { rating: editRating, comment: editText }); } catch { }
    afterReviewAction();
  }

  async function doCreate(itemId: string) {
    const newReview = {
      review_id: `temp_${Date.now()}`,
      user_id: user.user_id,
      user_name: displayName,
      item_id: itemId,
      rating: editRating,
      comment: editText,
      review_date: new Date().toISOString().slice(0, 10),
    };
    setReviews(prev => [...prev, newReview]);
    try {
      await api.reviews.create({
        user_id: user.user_id,
        user_name: displayName,
        item_id: itemId,
        rating: editRating,
        comment: editText,
        review_date: new Date().toISOString().slice(0, 10),
      });
    } catch { }
    afterReviewAction();
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
              <span>{isTH ? NAV_LABELS[item.key].th : NAV_LABELS[item.key].en}</span>
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
                {(() => {
                  const tierInfo = getTierInfo(calculatedPoints);
                  return (
                    <>
                      <div className="ud-member-card">
                        <img
                          src={
                            tierInfo.tier === 'Silver' ? '/img/silvercard.png'
                            : tierInfo.tier === 'Gold' ? '/img/goldcard.png'
                            : tierInfo.tier === 'Legend' ? '/img/legendcard.png'
                            : '/img/naturecard.png'
                          }
                          alt={tierInfo.tier}
                        />
                      </div>

                      {/* Points */}
                      <div className="ud-points-section">
                        <div className="ud-points-top">
                          <span className="ud-points-label">
                            {tierInfo.maxPts !== null
                              ? `${tierInfo.relPts}/${tierInfo.maxPts} Tramony Points`
                              : `${calculatedPoints} Tramony Points`}
                          </span>
                        </div>
                        <div className="ud-points-bar">
                          <div className="ud-points-fill" style={{ width: `${tierInfo.fillPct}%` }} />
                        </div>
                        {tierInfo.nextTier
                          ? <p className="ud-points-hint">สะสมอีก {tierInfo.needed} Tramony Point เพื่อเลื่อนขึ้นเป็นระดับ {tierInfo.nextTier}</p>
                          : <p className="ud-points-hint">คุณอยู่ในระดับสูงสุด Legend แล้ว!</p>
                        }
                      </div>
                    </>
                  );
                })()}

                <hr className="ud-divider" />

                {/* Avatar */}
                <div className="ud-profile-center">
                  <div className="ud-avatar-wrap">
                    <div className="ud-avatar-lg">{displayName?.[0]?.toUpperCase() ?? ''}</div>
                    <button className="ud-avatar-edit" aria-label="Edit avatar">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* User information */}
                <h3 className="ud-info-title">{isTH ? 'ข้อมูลผู้ใช้' : 'User Information'}</h3>
                <table className="ud-info-table">
                  <tbody>
                    {user?.user_type === 'individual' ? (
                      <>
                        <tr>
                          <td className="ud-info-key">{isTH ? 'ชื่อผู้ใช้' : 'Username'}</td>
                          <td className="ud-info-sep">:</td>
                          <td className="ud-info-val">{user.user_name}</td>
                        </tr>
                        <tr>
                          <td className="ud-info-key">{isTH ? 'ชื่อ-นามสกุล' : 'Name'}</td>
                          <td className="ud-info-sep">:</td>
                          <td className="ud-info-val">{user.first_name} {user.last_name}</td>
                        </tr>
                        <tr>
                          <td className="ud-info-key">{isTH ? 'ประเภท' : 'Role'}</td>
                          <td className="ud-info-sep">:</td>
                          <td className="ud-info-val">{isTH ? 'บุคคลธรรมดา' : 'Individual'}</td>
                        </tr>
                        <tr>
                          <td className="ud-info-key">{isTH ? 'เพศ' : 'Gender'}</td>
                          <td className="ud-info-sep">:</td>
                          <td className="ud-info-val">{user.gender || '-'}</td>
                        </tr>
                        <tr>
                          <td className="ud-info-key">{isTH ? 'วันเกิด' : 'Birthdate'}</td>
                          <td className="ud-info-sep">:</td>
                          <td className="ud-info-val">{fmtDate(user.birthdate)}</td>
                        </tr>
                      </>
                    ) : (
                      <>
                        <tr>
                          <td className="ud-info-key">{isTH ? 'ชื่อนิติบุคคล' : 'Name'}</td>
                          <td className="ud-info-sep">:</td>
                          <td className="ud-info-val">{user.legal_entity_name}</td>
                        </tr>
                        <tr>
                          <td className="ud-info-key">{isTH ? 'ประเภท' : 'Role'}</td>
                          <td className="ud-info-sep">:</td>
                          <td className="ud-info-val">{isTH ? 'นิติบุคคล' : 'Legal Entity'}</td>
                        </tr>
                        <tr>
                          <td className="ud-info-key">{isTH ? 'ประเภทธุรกิจ' : 'Type'}</td>
                          <td className="ud-info-sep">:</td>
                          <td className="ud-info-val">{user.business_type || '-'}</td>
                        </tr>
                        <tr>
                          <td className="ud-info-key">{isTH ? 'เลขทะเบียน' : 'Reg No.'}</td>
                          <td className="ud-info-sep">:</td>
                          <td className="ud-info-val">{user.business_registration_number || '-'}</td>
                        </tr>
                      </>
                    )}
                    <tr>
                      <td className="ud-info-key">{isTH ? 'อีเมล' : 'Email'}</td>
                      <td className="ud-info-sep">:</td>
                      <td className="ud-info-val">{user.email}</td>
                    </tr>
                    <tr>
                      <td className="ud-info-key">{isTH ? 'เบอร์โทรศัพท์' : 'Phone'}</td>
                      <td className="ud-info-sep">:</td>
                      <td className="ud-info-val">{user.phone_number || '-'}</td>
                    </tr>
                    <tr>
                      <td className="ud-info-key">{isTH ? 'ที่อยู่จัดส่ง' : 'Shipping Address'}</td>
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
                    <IconEdit /> {isTH ? 'แก้ไขข้อมูล' : 'Edit Information'}
                  </button>
                  <button className="ud-edit-btn" onClick={() => {
                    setEditPw({ current: '', newPw: '', confirm: '' });
                    setEditErr('');
                    setShowEditPw(true);
                  }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ verticalAlign: 'middle', marginRight: '0.35rem' }}>
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    {isTH ? 'เปลี่ยนรหัสผ่าน' : 'Edit Password'}
                  </button>
                </div>

              </div>{/* end ud-profile-col */}

            </div>
          )}

          {/* ── ORDER STATUS TAB ── */}
          {tab === 'orders' && (
            <div className="ud-section">
              <h2 className="ud-section__title">{isTH ? 'สถานะคำสั่งซื้อ' : 'Order Status'}</h2>
              <p className="ud-section__sub">{isTH ? 'ติดตามสินค้าของคุณ ทุกชิ้นดูแลด้วยใจใส่ใจ' : 'Monitor your recent acquisitions. Every piece is handled with care for you and nature.'}</p>
              <div className="ud-order-filterbar">
                {(['all', 'processing', 'completed'] as const).map(s => (
                  <button key={s} className={`ud-order-filter-btn${orderStatusFilter === s ? ' active' : ''}`} onClick={() => setOrderStatusFilter(s)}>
                    {s === 'all' ? (isTH ? 'ทั้งหมด' : 'All') : s === 'processing' ? (isTH ? 'รอชำระเงิน' : 'Payment Pending') : (isTH ? 'เสร็จสิ้น' : 'Completed')}
                  </button>
                ))}
              </div>
              {loading ? <p className="ud-loading">กำลังโหลด...</p> : (() => {
                const filtered = productOrders.filter(o => {
                  if (orderStatusFilter === 'all') return true;
                  const s = o.order_status?.toLowerCase().trim() ?? '';
                  if (orderStatusFilter === 'completed') return s === 'completed';
                  if (orderStatusFilter === 'processing') return s !== 'completed' && s !== 'cancelled' && s !== '';
                  return s === orderStatusFilter;
                });
                if (filtered.length === 0) return <p className="ud-empty">{isTH ? 'ไม่มีคำสั่งซื้อในหมวดนี้' : 'No orders in this category'}</p>;
                const sortedOrders = [...filtered].sort((a, b) => toTs(b.order_date) - toTs(a.order_date));
                const visible = showAllOrders ? sortedOrders : sortedOrders.slice(0, ORDERS_VISIBLE);
                return <>
                  {visible.map(o => {
                  const p = getProduct(o.item_id);
                  return (
                    <div key={o.order_id} className="ud-card">
                      <img className="ud-card__img" src={driveImg(p?.image)} alt={p?.name}
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      <div className="ud-card__body">
                        <h3 className="ud-card__name">{p?.name ?? o.item_id}</h3>
                        <div className="ud-card__meta">
                          <span><strong>{isTH ? 'วันที่' : 'DATE'}</strong><br />{fmtDate(o.order_date)}</span>
                          <span><strong>{isTH ? 'สถานะ' : 'STATUS'}</strong><br /><StatusBadge s={o.order_status} isTH={isTH} /></span>
                          <span><strong>{isTH ? 'รวม' : 'TOTAL'}</strong><br />{o.total_price} {isTH ? 'บาท' : 'Baht'}</span>
                        </div>
                      </div>
                      <button className="ud-detail-btn" onClick={() => {
                        trackEvent('select_item', {
                          item_list_name: 'Order History',
                          items: [{ item_id: o.item_id, item_name: p?.name ?? o.item_id, price: Number(o.total_price ?? 0) }]
                        });
                        onSelectProduct ? onSelectProduct(o.item_id, o) : onNavigate('products');
                      }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg> {isTH ? 'รายละเอียด' : 'Detail'}
                      </button>
                    </div>
                  );
                })}
                  {filtered.length > ORDERS_VISIBLE && (
                    <div className="ud-more-wrap">
                      <button className="ud-more-btn" onClick={() => setShowAllOrders(v => !v)}>
                        {showAllOrders ? (isTH ? 'ย่อ' : 'Show less') : (isTH ? 'ดูทั้งหมด' : 'See more')}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points={showAllOrders ? '18 15 12 9 6 15' : '6 9 12 15 18 9'} />
                        </svg>
                      </button>
                    </div>
                  )}
                </>;
              })()}
            </div>
          )}

          {/* ── ACTIVITY RESERVATIONS TAB ── */}
          {tab === 'activities' && (
            <div className="ud-section">
              <h2 className="ud-section__title">{isTH ? 'การจองกิจกรรม' : 'Activity Reservations'}</h2>
              <p className="ud-section__sub">{isTH ? 'จัดการการจองกิจกรรมของคุณได้ที่นี่' : 'Anticipate your upcoming eco-experiences. Seamlessly manage your mindful itineraries.'}</p>
              {loading ? <p className="ud-loading">กำลังโหลด...</p> : (() => {
                const sorted = [...activityOrders].sort((a, b) => toTs(b.order_date) - toTs(a.order_date));
                if (sorted.length === 0) return <p className="ud-empty">{isTH ? 'ยังไม่มีการจองกิจกรรม' : 'No activity reservations yet'}</p>;
                const visible = showAllActivities ? sorted : sorted.slice(0, ORDERS_VISIBLE);
                return <>
                  {visible.map(o => {
                  const a = getActivity(o.item_id);
                  return (
                    <div key={o.order_id} className="ud-card">
                      <img className="ud-card__img" src={driveImg(a?.image)} alt={a?.name}
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      <div className="ud-card__body">
                        <h3 className="ud-card__name">{a?.name ?? o.item_id}</h3>
                        <div className="ud-card__meta">
                          <span><strong>{isTH ? 'วันที่สั่งซื้อ' : 'ORDER DATE'}</strong><br />{fmtDate(o.order_date)}</span>
                          {o.order_select_date && <span><strong>{isTH ? 'วันกิจกรรม' : 'ACTIVITY DATE'}</strong><br />{fmtDate(o.order_select_date)}</span>}
                          {a?.location && <span><strong>{isTH ? 'สถานที่' : 'Location'}</strong><br />{a.location}</span>}
                          <span><strong>{isTH ? 'รวม' : 'TOTAL'}</strong><br />{o.total_price} {isTH ? 'บาท' : 'Baht'}</span>
                        </div>
                      </div>
                      <button className="ud-detail-btn" onClick={() => {
                        trackEvent('select_item', {
                          item_list_name: 'Activity Reservations',
                          items: [{ item_id: o.item_id, item_name: a?.name ?? o.item_id, price: Number(o.total_price ?? 0) }]
                        });
                        onSelectActivity ? onSelectActivity(o.item_id, o) : onNavigate('experiences');
                      }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg> {isTH ? 'รายละเอียด' : 'Detail'}
                      </button>
                    </div>
                  );
                })}
                  {sorted.length > ORDERS_VISIBLE && (
                    <div className="ud-more-wrap">
                      <button className="ud-more-btn" onClick={() => setShowAllActivities(v => !v)}>
                        {showAllActivities ? (isTH ? 'ย่อ' : 'Show less') : (isTH ? 'ดูทั้งหมด' : 'See more')}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points={showAllActivities ? '18 15 12 9 6 15' : '6 9 12 15 18 9'} />
                        </svg>
                      </button>
                    </div>
                  )}
                </>;
              })()}
            </div>
          )}

          {/* ── TO REVIEWS TAB ── */}
          {tab === 'reviews' && (
            <div className="ud-section">
              <h2 className="ud-section__title">{isTH ? 'รีวิว' : 'To Reviews'}</h2>
              <p className="ud-section__sub">{isTH ? 'แบ่งปันความคิดเห็นของคุณเกี่ยวกับสินค้าและกิจกรรมของเรา' : 'Your voice matters. Share your thoughts on our sustainable products and experiences.'}</p>

              {reviewNotice && (
                <div className="ud-review-notice">
                  <span className="ud-review-notice__icon">⏳</span>
                  <div>
                    <p className="ud-review-notice__title">{isTH ? 'กรุณารอสักครู่' : 'Please wait a moment'}</p>
                    <p className="ud-review-notice__sub">{isTH ? 'การอัปเดทรีวิวจะเสร็จสิ้นภายใน 1 นาที จากนั้นกรุณารีเฟรชหน้าจอเพื่อดูผลลัพธ์' : 'Your review update will be completed within 1 minute. Please refresh the page to see the result.'}</p>
                  </div>
                  <button className="ud-review-notice__close" onClick={() => setReviewNotice(false)}>✕</button>
                </div>
              )}

              {/* Filter bar */}
              <div className="ud-review-filterbar">
                <div className="ud-review-filter-select">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" />
                  </svg>
                  <select value={reviewTypeFilter} onChange={e => setReviewTypeFilter(e.target.value as any)}
                    className="ud-review-select">
                    <option value="all">{isTH ? 'ประเภทบริการ' : 'Type of services'}</option>
                    <option value="product">{isTH ? 'สินค้า' : 'Products'}</option>
                    <option value="activity">{isTH ? 'กิจกรรม' : 'Activities'}</option>
                  </select>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
                <div className="ud-review-filter-date">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <input type="date" className="ud-review-date-input" value={reviewDateFilter}
                    onChange={e => setReviewDateFilter(e.target.value)} placeholder="mm/dd/yyyy" />
                </div>
              </div>

              {(!reviewsReady || loading) ? <p className="ud-loading">กำลังโหลด...</p> : (() => {
                  // Build unique completed-order items merged with existing reviews
                  const seenItemIds = new Set<string>();
                  const mergedItems = orders
                    .filter(o => o.order_status?.toLowerCase() === 'completed')
                    .filter(o => { if (seenItemIds.has(o.item_id)) return false; seenItemIds.add(o.item_id); return true; })
                    .map(o => ({ order: o, review: reviews.find(r => r.item_id === o.item_id) ?? null }));

                  const filterDateFmt = (() => {
                    if (!reviewDateFilter) return '';
                    const [yyyy, mm, dd] = reviewDateFilter.split('-');
                    return `${dd}/${mm}/${yyyy}`;
                  })();
                  const filtered = mergedItems.filter(({ order, review: _review }) => {
                    const isPrd = String(order.item_id).startsWith('PRD');
                    if (reviewTypeFilter === 'product' && !isPrd) return false;
                    if (reviewTypeFilter === 'activity' && isPrd) return false;
                    if (filterDateFmt && fmtDate(order.order_date) !== filterDateFmt) return false;
                    return true;
                  });

                  if (filtered.length === 0) return <p className="ud-empty">{isTH ? 'ยังไม่มีออเดอร์ที่เสร็จสมบูรณ์' : 'No completed orders yet'}</p>;

                  return (
                    <div className="ud-review-grid">
                      {filtered.map(({ order, review }, i) => {
                        const isProduct = String(order.item_id).startsWith('PRD');
                        const item = isProduct ? getProduct(order.item_id) : getActivity(order.item_id);
                        const name = item?.name;
                        const isEditing = review ? editId === review.review_id : newItemId === order.item_id;
                        const isCheckerA = (Math.floor(i / 2) + (i % 2)) % 2 === 0;
                        return (
                          <div key={order.order_id} className={`ud-review-card ${isCheckerA ? 'ud-review-card--a' : 'ud-review-card--b'}`}>
                            <div className="ud-review-card__top">
                              <img className="ud-review-card__img" src={driveImg(item?.image ?? '')} alt={name}
                                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                              <div className="ud-review-card__info">
                                <h4 className="ud-review-card__name">{name ?? order.item_id}</h4>
                                <table className="ud-review-meta-table">
                                  <tbody>
                                    {isProduct ? (
                                      <>
                                        <tr>
                                          <td className="ud-rmt-label">{isTH ? 'วันที่' : 'Date'}</td>
                                          <td className="ud-rmt-sep">:</td>
                                          <td className="ud-rmt-val">{fmtDate(order.order_date)}</td>
                                        </tr>
                                        <tr>
                                          <td className="ud-rmt-label">{isTH ? 'รวม' : 'Total'}</td>
                                          <td className="ud-rmt-sep">:</td>
                                          <td className="ud-rmt-val">{order.total_price} {isTH ? 'บาท' : 'Baht'}</td>
                                        </tr>
                                      </>
                                    ) : (
                                      <>
                                        <tr>
                                          <td className="ud-rmt-label">{isTH ? 'วันที่' : 'Date'}</td>
                                          <td className="ud-rmt-sep">:</td>
                                          <td className="ud-rmt-val">{fmtDate(order.order_date)}</td>
                                        </tr>
                                        {item?.location && (
                                          <tr>
                                            <td className="ud-rmt-label">{isTH ? 'สถานที่' : 'Location'}</td>
                                            <td className="ud-rmt-sep">:</td>
                                            <td className="ud-rmt-val">{item.location}</td>
                                          </tr>
                                        )}
                                      </>
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                            {isEditing ? (
                              <>
                                <Stars n={editRating} onClick={setEditRating} />
                                <textarea className="ud-review-textarea"
                                  value={editText} onChange={e => setEditText(e.target.value)} />
                                <div className="ud-review-actions">
                                  <button className="ud-review-btn--save" onClick={() => review ? doSave(review.review_id) : doCreate(order.item_id)}>
                                    {isTH ? 'บันทึก' : 'Save Changes'}
                                  </button>
                                  <button className="ud-review-btn--cancel" onClick={() => { setEditId(null); setNewItemId(null); }}>
                                    {isTH ? 'ยกเลิก' : 'Cancel'}
                                  </button>
                                </div>
                              </>
                            ) : (
                              <>
                                <Stars n={Number(review?.rating ?? 0)} />
                                {review?.comment && <p className="ud-review-comment">{review.comment}</p>}
                                <div className="ud-review-actions">
                                  {review ? (
                                    <>
                                      <button className="ud-review-btn" onClick={() => { setEditId(review.review_id); setEditText(review.comment); setEditRating(Number(review.rating)); }}>
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                        {isTH ? 'แก้ไขรีวิว' : 'Edit Review'}
                                      </button>
                                      <button className="ud-review-btn ud-review-btn--del" onClick={() => setDeleteId(review.review_id)}>
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" /></svg>
                                        {isTH ? 'ลบรีวิว' : 'Delete Review'}
                                      </button>
                                    </>
                                  ) : (
                                    <button className="ud-review-btn" onClick={() => { setNewItemId(order.item_id); setEditText(''); setEditRating(0); }}>
                                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                      {isTH ? 'เขียนรีวิว' : 'Write Review'}
                                    </button>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
            </div>
          )}
        </main>
      </div>

      {/* ── DELETE REVIEW MODAL ── */}
      {deleteId && (
        <div className="ud-overlay" onClick={() => setDeleteId(null)}>
          <div className="ud-modal" onClick={e => e.stopPropagation()}>
            <button className="ud-modal__x" onClick={() => setDeleteId(null)}>×</button>
            <h3 className="ud-modal__title">{isTH ? 'ยืนยันการลบ?' : 'Are you sure?'}</h3>
            <p className="ud-modal__body">{isTH ? 'คุณต้องการลบความคิดเห็น/คะแนนนี้ใช่หรือไม่? การดำเนินการนี้ไม่สามารถยกเลิกได้' : 'Do you really want to delete the comment/rating? This action cannot be done.'}</p>
            <div className="ud-modal__btns">
              <button className="ud-modal__btn ud-modal__btn--confirm" onClick={doDelete}>✓ {isTH ? 'ยืนยัน' : 'Confirm'}</button>
              <button className="ud-modal__btn ud-modal__btn--cancel" onClick={() => setDeleteId(null)}>✕ {isTH ? 'ยกเลิก' : 'Cancel'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT INFORMATION MODAL ── */}
      {showEditInfo && (
        <div className="ud-overlay" onClick={() => setShowEditInfo(false)}>
          <div className="ud-modal ud-modal--form" onClick={e => e.stopPropagation()}>
            <button className="ud-modal__x" onClick={() => setShowEditInfo(false)}>×</button>
            <h3 className="ud-modal__title"><IconEdit /> {isTH ? 'แก้ไขข้อมูล' : 'Edit Information'}</h3>

            <div className="ud-form">
              {user?.user_type === 'individual' ? (
                <>
                  <div className="ud-field">
                    <label className="ud-field__label">{isTH ? 'ชื่อผู้ใช้' : 'Username'}</label>
                    <input className="ud-field__input" value={editInfo.user_name || ''}
                      onChange={e => setEditInfo((p: any) => ({ ...p, user_name: e.target.value }))} />
                  </div>
                  <div className="ud-form-row">
                    <div className="ud-field">
                      <label className="ud-field__label">{isTH ? 'ชื่อ' : 'First Name'}</label>
                      <input className="ud-field__input" value={editInfo.first_name || ''}
                        onChange={e => setEditInfo((p: any) => ({ ...p, first_name: e.target.value }))} />
                    </div>
                    <div className="ud-field">
                      <label className="ud-field__label">{isTH ? 'นามสกุล' : 'Last Name'}</label>
                      <input className="ud-field__input" value={editInfo.last_name || ''}
                        onChange={e => setEditInfo((p: any) => ({ ...p, last_name: e.target.value }))} />
                    </div>
                  </div>
                  <div className="ud-field">
                    <label className="ud-field__label">{isTH ? 'เพศ' : 'Gender'}</label>
                    <select className="ud-field__input" value={editInfo.gender || ''}
                      onChange={e => setEditInfo((p: any) => ({ ...p, gender: e.target.value }))}>
                      <option value="">-- {isTH ? 'เลือก' : 'Select'} --</option>
                      <option value={isTH ? 'ชาย' : 'Male'}>{isTH ? 'ชาย' : 'Male'}</option>
                      <option value={isTH ? 'หญิง' : 'Female'}>{isTH ? 'หญิง' : 'Female'}</option>
                      <option value={isTH ? 'อื่นๆ' : 'Other'}>{isTH ? 'อื่นๆ' : 'Other'}</option>
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div className="ud-field">
                    <label className="ud-field__label">{isTH ? 'ชื่อนิติบุคคล' : 'Organization Name'}</label>
                    <input className="ud-field__input" value={editInfo.legal_entity_name || ''}
                      onChange={e => setEditInfo((p: any) => ({ ...p, legal_entity_name: e.target.value }))} />
                  </div>
                  <div className="ud-field">
                    <label className="ud-field__label">{isTH ? 'ประเภทธุรกิจ' : 'Type'}</label>
                    <select className="ud-field__input" value={editInfo.business_type || ''}
                      onChange={e => setEditInfo((p: any) => ({ ...p, business_type: e.target.value }))}>
                      <option value="">-- {isTH ? 'เลือก' : 'Select'} --</option>
                      <option value="บริษัท">บริษัท</option>
                      <option value="ห้างหุ้นส่วน">ห้างหุ้นส่วน</option>
                      <option value="มูลนิธิ">มูลนิธิ</option>
                      <option value="สมาคม">สมาคม</option>
                      <option value="องค์กรอื่นๆ">องค์กรอื่นๆ</option>
                    </select>
                  </div>
                  <div className="ud-field">
                    <label className="ud-field__label">{isTH ? 'เลขทะเบียน' : 'Registration Number'}</label>
                    <input className="ud-field__input" value={editInfo.business_registration_number || ''}
                      onChange={e => setEditInfo((p: any) => ({ ...p, business_registration_number: e.target.value }))} />
                  </div>
                </>
              )}
              <div className="ud-field">
                <label className="ud-field__label">{isTH ? 'อีเมล' : 'Email'}</label>
                <input className="ud-field__input" type="email" value={editInfo.email || ''}
                  onChange={e => setEditInfo((p: any) => ({ ...p, email: e.target.value }))} />
              </div>
              <div className="ud-field">
                <label className="ud-field__label">{isTH ? 'เบอร์โทรศัพท์' : 'Phone Number'}</label>
                <input className="ud-field__input" value={editInfo.phone_number || ''}
                  onChange={e => setEditInfo((p: any) => ({ ...p, phone_number: e.target.value }))} />
              </div>
              <div className="ud-field">
                <label className="ud-field__label">{isTH ? 'ที่อยู่จัดส่ง' : 'Shipping Address'}</label>
                <textarea className="ud-field__input ud-field__textarea" value={editInfo.address || ''}
                  onChange={e => setEditInfo((p: any) => ({ ...p, address: e.target.value }))} rows={2} />
              </div>
            </div>

            {editErr && <p className="ud-form-err">{editErr}</p>}

            <div className="ud-modal__btns">
              <button className="ud-modal__btn ud-modal__btn--save" onClick={handleSaveInfo} disabled={editSaving}>
                {editSaving ? 'กำลังบันทึก...' : (isTH ? 'บันทึก' : 'Save Changes')}
              </button>
              <button className="ud-modal__btn ud-modal__btn--cancel-outline" onClick={() => setShowEditInfo(false)}>
                {isTH ? 'ยกเลิก' : 'Cancel'}
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
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              {isTH ? 'เปลี่ยนรหัสผ่าน' : 'Edit Password'}
            </h3>

            <div className="ud-form">
              <div className="ud-field">
                <label className="ud-field__label">{isTH ? 'รหัสผ่านใหม่' : 'New Password'}</label>
                <div className="ud-pw-wrap">
                  <input className="ud-field__input ud-pw-input" type={showNewPw ? 'text' : 'password'}
                    value={editPw.newPw} onChange={e => setEditPw(p => ({ ...p, newPw: e.target.value }))} />
                  <button className="ud-pw-eye" type="button" onClick={() => setShowNewPw(p => !p)}>
                    {showNewPw ? '🙈' : '👁'}
                  </button>
                </div>
              </div>
              <div className="ud-field">
                <label className="ud-field__label">{isTH ? 'ยืนยันรหัสผ่านใหม่' : 'Confirm New Password'}</label>
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
                <label className="ud-field__label">{isTH ? 'รหัสผ่านปัจจุบัน' : 'Current Password'}</label>
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
                {editSaving ? 'กำลังบันทึก...' : (isTH ? 'บันทึก' : 'Save Changes')}
              </button>
              <button className="ud-modal__btn ud-modal__btn--cancel-outline" onClick={() => setShowEditPw(false)}>
                {isTH ? 'ยกเลิก' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer data={c.footer[lang]} />
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
  border-radius: 12px;
  padding: 1rem 1.2rem; margin-bottom: 1rem;
  display: flex; align-items: center; gap: 1.2rem;
  box-shadow: 0 1px 8px rgba(0,0,0,.05);
}
.ud-card:nth-child(odd)  { background: #C5D2D2; border: 1px solid #b0c2c2; }
.ud-card:nth-child(even) { background: #EDE8DE; border: 1px solid #d4cdc0; }
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

/* ── Order filter bar ───────────────────── */
.ud-order-filterbar {
  display: flex; gap: .5rem; margin-bottom: 1.2rem;
}
.ud-order-filter-btn {
  padding: .4rem 1.1rem; border-radius: 20px; border: 1.5px solid #c8d8c4;
  background: transparent; color: #3a3a3a; font-family: Kanit, sans-serif;
  font-size: .85rem; cursor: pointer; transition: all .18s;
}
.ud-order-filter-btn:hover { border-color: #2d6a4f; color: #2d6a4f; }
.ud-order-filter-btn.active { background: #2d6a4f; color: #fff; border-color: #2d6a4f; }

/* ── See more button ────────────────────── */
.ud-see-more-wrap {
  display: flex; justify-content: center;
  margin-top: 1.8rem; padding-top: 1.2rem;
  border-top: 1px solid #e5e5e5;
}
.ud-see-more-btn {
  display: inline-flex; align-items: center; gap: .5rem;
  padding: .65rem 2rem;
  border: 1.5px solid var(--forest, #2d6a4f);
  border-radius: 8px; background: #fff;
  color: var(--forest, #2d6a4f);
  font-size: .9rem; font-weight: 600;
  font-family: Kanit, sans-serif;
  text-decoration: none; cursor: pointer;
  transition: background .2s, color .2s;
}
.ud-see-more-btn:hover { background: var(--forest, #2d6a4f); color: #fff; }

/* ── Show more / Show less ─────────────── */
.ud-more-wrap { text-align: center; margin: 1.5rem 0 0; }
.ud-more-btn {
  display: inline-flex; align-items: center; gap: .45rem;
  background: none; border: none; cursor: pointer;
  font-size: .92rem; font-weight: 600;
  color: #555; font-family: Kanit, sans-serif;
  transition: color .2s;
}
.ud-more-btn:hover { color: var(--forest, #2d6a4f); }

/* ── Review notice banner ──────────────── */
.ud-review-notice {
  display: flex; align-items: center; gap: 1rem;
  background: #fff8e1; border: 1.5px solid #f0c040;
  border-radius: 10px; padding: .85rem 1.1rem;
  margin-bottom: 1.2rem;
}
.ud-review-notice__icon { font-size: 1.4rem; flex-shrink: 0; }
.ud-review-notice__title {
  font-size: .92rem; font-weight: 700; color: #7a5800; margin: 0 0 .15rem;
}
.ud-review-notice__sub { font-size: .82rem; color: #8a6800; margin: 0; }
.ud-review-notice__close {
  margin-left: auto; background: none; border: none;
  cursor: pointer; font-size: 1rem; color: #aaa; flex-shrink: 0;
  line-height: 1; padding: .2rem;
}
.ud-review-notice__close:hover { color: #555; }

/* ── Review filter bar ──────────────────── */
.ud-review-filterbar {
  display: flex; gap: .8rem; justify-content: flex-end;
  margin-bottom: 1.4rem;
}
.ud-review-filter-select,
.ud-review-filter-date {
  display: flex; align-items: center; gap: .5rem;
  border: 1.5px solid #c8b89a; border-radius: 8px;
  padding: .45rem .9rem; background: #EDE8DE;
  color: #555; font-size: .82rem; cursor: pointer;
}
.ud-review-select {
  border: none; outline: none; background: #EDE8DE;
  font-size: .82rem; color: #555; cursor: pointer;
  font-family: var(--font-th); appearance: none;
  -webkit-appearance: none; min-width: 110px;
}
.ud-review-date-input {
  border: none; outline: none; background: #EDE8DE;
  font-size: .82rem; color: #555; cursor: pointer;
  font-family: var(--font-th); width: 110px;
}

/* ── Reviews ────────────────────────────── */
.ud-review-grid {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 1.4rem;
}
.ud-review-card {
  background: var(--white); border-radius: 18px;
  padding: 1.2rem; border: 1.5px solid #d4d4d4;
  box-shadow: 0 2px 10px rgba(0,0,0,.06);
}
.ud-review-card--a { background: #C5D2D2; border-color: #b0c2c2; }
.ud-review-card--b { background: #EDE8DE; border-color: #d4cdc0; }
.ud-review-card__top { display: flex; gap: 1rem; margin-bottom: .9rem; }
.ud-review-card__img {
  width: 110px; height: 110px; object-fit: cover;
  border-radius: 10px; flex-shrink: 0; background: #ddd;
}
.ud-review-card__info { flex: 1; padding-top: .2rem; }
.ud-review-card__name { font-size: 1rem; font-weight: 700; margin-bottom: .5rem; font-family: var(--font-th); color: var(--text); }

/* meta table inside review card */
.ud-review-meta-table { border-collapse: collapse; width: 100%; }
.ud-rmt-label {
  font-size: .8rem; color: #666; font-weight: 500;
  padding: .18rem .6rem .18rem 0; white-space: nowrap;
  vertical-align: top; font-family: var(--font-th); width: 70px;
}
.ud-rmt-sep { padding: .18rem .5rem; color: #888; vertical-align: top; font-size: .8rem; }
.ud-rmt-val {
  font-size: .8rem; color: #333; line-height: 1.55;
  vertical-align: top; font-family: var(--font-th);
}
.ud-stars { display: flex; gap: 3px; margin: .6rem 0 .3rem; }
.ud-star { transition: fill .15s; }
.ud-star--on { fill: #c8880a; stroke: #c8880a; }
.ud-review-comment { font-size: .84rem; color: #555; margin: .3rem 0 .9rem; font-family: var(--font-th); line-height: 1.55; }
.ud-review-textarea {
  width: 100%; min-height: 80px;
  border: 1.5px solid #bbb; border-radius: 10px;
  padding: .65rem .75rem; font-size: .85rem; font-family: var(--font-th);
  resize: vertical; outline: none; margin: .4rem 0 .9rem;
  box-sizing: border-box; background: rgba(255,255,255,.7);
}
.ud-review-textarea:focus { border-color: var(--forest); }
.ud-review-actions { display: flex; gap: .7rem; }
.ud-review-btn {
  padding: .48rem 1.1rem; border-radius: 50px;
  font-size: .8rem; font-weight: 600; cursor: pointer;
  border: 1.5px solid #444; background: none;
  color: #333; transition: .2s; font-family: var(--font-th);
  display: flex; align-items: center; gap: .35rem;
}
.ud-review-btn:hover { background: rgba(0,0,0,.06); }
.ud-review-btn--del { border-color: #e53935; color: #e53935; }
.ud-review-btn--del:hover { background: rgba(229,57,53,.07); }
.ud-review-btn--save {
  background: #3d2f2a; color: #fff;
  border: none; border-radius: 50px;
  padding: .48rem 1.3rem; font-size: .8rem;
  font-weight: 600; cursor: pointer; font-family: var(--font-th);
}
.ud-review-btn--save:hover { background: #5a453e; }
.ud-review-btn--cancel {
  background: #c0533a; color: #fff;
  border: none; border-radius: 50px;
  padding: .48rem 1.1rem; font-size: .8rem;
  font-weight: 600; cursor: pointer; font-family: var(--font-th);
}
.ud-review-btn--cancel:hover { background: #a8422c; }

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


/* ─────────────────────────────
   Responsive
───────────────────────────── */

@media (max-width: 1024px) {

  .ud-sidebar {
    width: 140px;
  }

  .ud-nav-item {
    padding: .75rem .8rem;
    font-size: .78rem;
  }

  .ud-main {
    padding: 2rem 1.5rem;
  }

  .ud-profile-col {
    max-width: 520px;
  }

  .ud-review-grid {
    grid-template-columns: 1fr;
  }

  .ud-card {
    gap: .8rem;
  }

  .ud-card__meta {
    gap: 1rem;
  }

  .ud-profile-btns {
    margin-left: 0;
    justify-content: center;
    width: 100%;
  }
}


@media (max-width: 768px) {

  .ud-page {
    flex-direction: column;
    padding-top: 64px;
  }

  /* sidebar เปลี่ยนเป็นแนวนอน */
  .ud-sidebar {
    width: 100%;
    height: auto;
    position: sticky;
    top: 64px;
    flex-direction: row;
    overflow-x: auto;
    padding: .5rem;
    border-right: none;
    border-bottom: 1px solid #c4cccc;
    z-index: 50;
  }

  .ud-nav-item {
    flex-shrink: 0;
    width: auto;
    padding: .6rem 1rem;
    border-radius: 8px;
    justify-content: center;
  }

  .ud-main {
    padding: 1.2rem .8rem;
  }


  .ud-section__title {
    font-size: 1.3rem;
  }


  .ud-member-card {
    max-width: 320px;
  }


  .ud-avatar-lg {
    width: 75px;
    height: 75px;
    font-size: 1.8rem;
  }


  .ud-info-table {
    width: 100%;
  }

  .ud-info-key {
    width: 70px;
    padding-right: .5rem;
    font-size: .78rem;
  }

  .ud-info-sep {
    padding: .5rem;
  }

  .ud-info-val {
    min-width: 0;
    font-size: .8rem;
    word-break: break-word;
  }


  .ud-profile-btns {
    flex-direction: column;
    align-items: center;
  }

  .ud-edit-btn {
    width: 100%;
    justify-content: center;
  }


  .ud-impact-grid {
    gap: .8rem;
  }

  .ud-impact-card {
    width: 105px;
    height: 105px;
  }

  .ud-impact-val {
    font-size: 1.3rem;
  }


  .ud-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .ud-card__img {
    width: 100%;
    height: 160px;
  }

  .ud-detail-btn {
    width: 100%;
    justify-content: center;
  }


  .ud-order-filterbar {
    overflow-x: auto;
    padding-bottom: .3rem;
  }


  .ud-review-filterbar {
    justify-content: flex-start;
    flex-direction: column;
  }

  .ud-review-filter-select,
  .ud-review-filter-date {
    width: 100%;
  }


  .ud-review-card__top {
    flex-direction: column;
  }

  .ud-review-card__img {
    width: 100%;
    height: 180px;
  }


  .ud-modal {
    padding: 1.5rem;
  }

  .ud-modal--form {
    max-height: 85vh;
  }

}


@media (max-width: 480px) {

  .ud-main {
    padding: 1rem .6rem;
  }


  .ud-sidebar {
    top: 56px;
  }


  .ud-nav-item {
    font-size: .72rem;
    padding: .55rem .8rem;
  }


  .ud-section__title {
    font-size: 1.15rem;
  }

  .ud-section__sub {
    font-size: .75rem;
  }


  .ud-points-label {
    font-size: .8rem;
  }

  .ud-points-count {
    font-size: .72rem;
  }


  .ud-impact-card {
    width: 90px;
    height: 90px;
    border-radius: 12px;
  }

  .ud-impact-val {
    font-size: 1.1rem;
  }

  .ud-impact-label {
    font-size: .65rem;
  }


  .ud-card {
    padding: .8rem;
  }

  .ud-card__name {
    font-size: .85rem;
  }


  .ud-review-card {
    padding: .9rem;
  }

  .ud-review-actions {
    flex-direction: column;
  }

  .ud-review-btn {
    width: 100%;
    justify-content: center;
  }


  .ud-modal__btns {
    flex-direction: column;
  }

  .ud-modal__btn {
    width: 100%;
  }


  .ud-form-row {
    flex-direction: column;
  }

}
`;
