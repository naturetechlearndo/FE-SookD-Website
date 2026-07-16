import { useState, useEffect, useRef } from 'react';
import { addToCart } from '../utils/cart';
import { trackEvent } from '../utils/gtag';

const API_BASE = import.meta.env.VITE_API_URL ?? '${API_BASE}';

const DEFAULT_OPTIONAL_IDS = ['ACT014', 'ACT015', 'ACT016', 'ACT017', 'ACT018'];
const DEFAULT_OFFER_IDS = ['PRD019','PRD020','PRD021','PRD022','PRD024','PRD025','PRD026','PRD027','PRD028'];
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_NAMES = ['Mo','Tu','We','Th','Fr','Sa','Su'];

interface Props {
  activity: any;
  currentUser?: any;
  onClose: () => void;
  onNavigateToCart?: () => void;
  optionalIds?: string[];
  offerIds?: string[];
  simple?: boolean;
  lang?: 'TH' | 'ENG';
}

interface OptItem {
  act: any;
  checked: boolean;
  qty: number;
  time: string;
}

function driveThumb(url: string, size = 'w400'): string {
  const m = url?.match(/\/d\/([^/]+)\//);
  if (m) {
    const driveUrl = encodeURIComponent(`https://drive.google.com/thumbnail?id=${m[1]}&sz=${size}`);
    return `https://res.cloudinary.com/zgor0mh6/image/fetch/q_auto,f_auto/${driveUrl}`;
  }
  return url || '';
}

function Calendar({ selected, onSelect, error }: { selected: Date | null; onSelect: (d: Date) => void; error?: boolean }) {
  const today = new Date();
  const [viewing, setViewing] = useState(() => selected ?? new Date());
  const year = viewing.getFullYear();
  const month = viewing.getMonth();

  const firstDow = new Date(year, month, 1).getDay();
  const startOffset = firstDow === 0 ? 6 : firstDow - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const isSel = (d: number | null) =>
    d !== null && selected &&
    selected.getFullYear() === year &&
    selected.getMonth() === month &&
    selected.getDate() === d;

  const isToday = (d: number | null) =>
    d !== null &&
    today.getFullYear() === year &&
    today.getMonth() === month &&
    today.getDate() === d;

  return (
    <div className={`bk__cal${error ? ' bk__cal--error' : ''}`}>
      <div className="bk__cal-header">
        <button className="bk__cal-nav" onClick={() => setViewing(new Date(year, month - 1, 1))}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <span className="bk__cal-title">{MONTH_NAMES[month]} {year}</span>
        <button className="bk__cal-nav" onClick={() => setViewing(new Date(year, month + 1, 1))}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
      <div className="bk__cal-grid">
        {DAY_NAMES.map(d => <span key={d} className="bk__cal-dayname">{d}</span>)}
        {cells.map((d, i) => (
          <button
            key={i}
            className={[
              'bk__cal-day',
              d === null ? 'bk__cal-day--empty' : '',
              isSel(d) ? 'bk__cal-day--sel' : '',
              isToday(d) && !isSel(d) ? 'bk__cal-day--today' : '',
            ].join(' ').trim()}
            disabled={d === null}
            onClick={() => d && onSelect(new Date(year, month, d))}
          >
            {d ?? ''}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function BookingModal({ activity, currentUser: _currentUser, onClose, onNavigateToCart, optionalIds = DEFAULT_OPTIONAL_IDS, offerIds = DEFAULT_OFFER_IDS, simple = false, lang = 'TH' }: Props) {
  const isTH = lang === 'TH';
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [participants, setParticipants] = useState(1);
  const [selectedTime, setSelectedTime] = useState('');
  const [optItems, setOptItems] = useState<OptItem[]>([]);
  const [optLoading, setOptLoading] = useState(true);
  const [step, setStep] = useState<1 | 2>(1);
  const [offerItems, setOfferItems] = useState<any[]>([]);
  const [offerQtys, setOfferQtys] = useState<Record<string,number>>({});
  const [cartItems, setCartItems] = useState<{product: any; qty: number}[]>([]);
  const [showDateError, setShowDateError] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const timeSlots: string[] = activity.activity_time
    ? String(activity.activity_time).split(',').map((t: string) => t.trim()).filter(Boolean)
    : [];

  useEffect(() => {
    if (timeSlots.length > 0) setSelectedTime(timeSlots[0]);
  }, []);

  useEffect(() => {
    fetch(`${API_BASE}/api/activities`)
      .then(r => r.json())
      .then((acts: any[]) => {
        const opts = acts
          .filter((a: any) => optionalIds.includes(a.id))
          .map((a: any) => {
            const times: string[] = a.activity_time
              ? String(a.activity_time).split(',').map((t: string) => t.trim()).filter(Boolean)
              : [];
            return { act: a, checked: false, qty: 1, time: times[0] ?? '' };
          });
        setOptItems(opts);
      })
      .catch(() => {})
      .finally(() => setOptLoading(false));
  }, []);

  useEffect(() => {
    fetch(`${API_BASE}/api/products`)
      .then(r => r.json())
      .then((prds: any[]) => {
        const filtered = prds.filter((p: any) => offerIds.includes(p.id));
        setOfferItems(filtered);
        const qtys: Record<string,number> = {};
        filtered.forEach((p: any) => { qtys[p.id] = 1; });
        setOfferQtys(qtys);
      })
      .catch(() => {});
  }, []);

  const updateOpt = (idx: number, patch: Partial<OptItem>) =>
    setOptItems(prev => prev.map((o, i) => i === idx ? { ...o, ...patch } : o));

  const checkedOpts = optItems.filter(o => o.checked);
  const total = activity.price * participants +
    checkedOpts.reduce((s, o) => s + (Number(o.act.price) * o.qty), 0) +
    cartItems.reduce((s, c) => s + (Number(c.product.price) * c.qty), 0);

  const addOfferToLocalCart = (product: any, qty: number) => {
    setCartItems(prev => {
      const idx = prev.findIndex(c => c.product.id === product.id);
      if (idx >= 0) return prev.map((c, i) => i === idx ? { ...c, qty: c.qty + qty } : c);
      return [...prev, { product, qty }];
    });
  };

  const removeCheckedOpt = (actId: string) =>
    setOptItems(prev => prev.map(o => o.act.id === actId ? { ...o, checked: false } : o));

  const removeCartItem = (productId: string) =>
    setCartItems(prev => prev.filter(c => c.product.id !== productId));

  const handleAddToCart = () => {
    const actDateStr = selectedDate ? selectedDate.toISOString().split('T')[0] : '';
    const items: Parameters<typeof addToCart>[0] = [
      {
        itemId: activity.id,
        itemType: 'activity',
        name: activity.name?.trim() || '',
        image: activity.image || '',
        price: activity.price,
        qty: participants,
        sellerName: activity.by || '',
        actDate: actDateStr,
        actTime: selectedTime,
        weightInfo: '',
      },
      ...checkedOpts.map(o => ({
        itemId: o.act.id,
        itemType: 'activity' as const,
        name: o.act.name?.trim() || '',
        image: o.act.image || '',
        price: Number(o.act.price),
        qty: o.qty,
        sellerName: o.act.by || '',
        actDate: actDateStr,
        actTime: o.time,
        weightInfo: '',
      })),
      ...cartItems.map(c => ({
        itemId: c.product.id,
        itemType: 'product' as const,
        name: c.product.name?.trim() || '',
        image: c.product.image || '',
        price: Number(c.product.price),
        qty: c.qty,
        sellerName: c.product.origin || '',
        actDate: '',
        actTime: '',
        weightInfo: c.product.note || '',
      })),
    ];
    addToCart(items);
    onClose();
    onNavigateToCart?.();
  };
  const fmtDate = (d: Date) =>
    `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
 
  const handleCloseModal = () => {
    trackEvent('click_close_modal', {
      modal_name: 'booking_modal',
      item_id: activity?.id,
      item_name: activity?.name
    });
    onClose();
  };

  return (
    <div className="bk__overlay" onClick={handleCloseModal}> 
      <div className="bk__modal" ref={modalRef} onClick={e => e.stopPropagation()}>
        
        {/* 💡 จุดที่ 2 ปุ่มกากบาท (มุมขวาบน) */}
        <button className="bk__close" onClick={handleCloseModal}>&#x2715;</button>

        {step === 1 && (<>
        {/* ── Top: calendar + right panel ── */}
        <div className="bk__top">
          <Calendar selected={selectedDate} error={showDateError && !selectedDate} onSelect={d => { setSelectedDate(d); setShowDateError(false); }} />

          <div className="bk__right">
            {/* Participants */}
            <div className="bk__participants">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              <span className="bk__colon">:</span>
              <button className="bk__qty-btn" onClick={() => setParticipants(p => Math.max(1, p - 1))}>&#x2212;</button>
              <span className="bk__qty-val">{participants}</span>
              <button className="bk__qty-btn" onClick={() => setParticipants(p => p + 1)}>+</button>
            </div>

            {/* Time slots */}
            {timeSlots.length > 0 && (
              <div className="bk__times">
                <p className="bk__times-label">Time</p>
                {timeSlots.map(t => (
                  <label key={t} className="bk__time-option">
                    <input
                      type="radio" name="bk-time" value={t}
                      checked={selectedTime === t}
                      onChange={() => setSelectedTime(t)}
                    />
                    <span className="bk__time-radio" />
                    {t}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Optional activities ── */}
        {!simple && <div className="bk__optional">
          <div className="bk__opt-title-row">
            <h4 className="bk__opt-title">{isTH ? 'กิจกรรม (เลือกเพิ่มได้)' : 'Activity (Optional)'}</h4>
            {showDateError && !selectedDate && (
              <span className="bk__date-error">กรุณาเลือกวันเข้าร่วมกิจกรรม</span>
            )}
          </div>
          <p className="bk__opt-desc">
            {isTH
              ? <>สั่งซื้อพร้อมการจองกิจกรรมวันนี้ รับสิทธิ์<strong>ส่งฟรี</strong> และรับสินค้าได้ง่ายๆ ที่หน้างานในวันที่เข้าชม</>
              : <>Order now along with your activity booking and enjoy <strong>Free Shipping</strong>. You can conveniently pick up your items directly at the location on the day of your visit.</>}
          </p>

          <div className="bk__opt-list">
            {optLoading && <p className="bk__opt-loading">Loading...</p>}
            {optItems.map((item, idx) => {
              const times: string[] = item.act.activity_time
                ? String(item.act.activity_time).split(',').map((t: string) => t.trim()).filter(Boolean)
                : [];
              const tags: string[] = item.act.type
                ? String(item.act.type).split(',').map((t: string) => t.trim())
                : [];
              return (
                <div key={item.act.id} className={`bk__opt-item${item.checked ? ' bk__opt-item--checked' : ''}`}>
                  <button
                    className={`bk__opt-check${item.checked ? ' bk__opt-check--on' : ''}`}
                    onClick={() => updateOpt(idx, { checked: !item.checked })}
                  >
                    {item.checked && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                  </button>

                  <div className="bk__opt-img-wrap">
                    {item.act.image ? (
                      <img
                        src={driveThumb(item.act.image)}
                        alt={item.act.name}
                        className="bk__opt-img"
                        onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <div className="bk__opt-img-placeholder">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                          <polyline points="21 15 16 10 5 21"/>
                        </svg>
                      </div>
                    )}
                    <div className="bk__opt-badge">
                      <span className="bk__opt-badge-pct">10%</span>
                      <span className="bk__opt-badge-txt">{isTH ? <>รายได้ 10%<br/>สนับสนุนมูลนิธิ<br/>ในท้องถิ่น</> : <>10% of income<br/>supports local<br/>foundations.</>}</span>
                    </div>
                  </div>

                  <div className="bk__opt-info">
                    {/* Row 1: name + tag */}
                    <div className="bk__opt-top-row">
                      <span className="bk__opt-name">{item.act.name}</span>
                      {tags[0] && <span className="bk__opt-tag">#{tags[0]}</span>}
                    </div>

                    {/* Row 2: duration | person controls */}
                    <div className="bk__opt-row2">
                      <span className="bk__opt-duration">{item.act.activity_duration || ''}</span>
                      <div className="bk__opt-controls">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                        </svg>
                        <span>:</span>
                        <button className="bk__qty-btn bk__qty-btn--sm" onClick={() => updateOpt(idx, { qty: Math.max(1, item.qty - 1) })}>&#x2212;</button>
                        <span className="bk__qty-val bk__qty-val--sm">{item.qty}</span>
                        <button className="bk__qty-btn bk__qty-btn--sm" onClick={() => updateOpt(idx, { qty: item.qty + 1 })}>+</button>
                        {times.length > 0 && (
                          <select
                            className="bk__opt-time-sel"
                            value={item.time}
                            onChange={e => updateOpt(idx, { time: e.target.value })}
                          >
                            {times.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        )}
                      </div>
                    </div>

                    {/* Row 3: description + price */}
                    <div className="bk__opt-row3">
                      <span className="bk__opt-desc-text">{item.act.description}</span>
                      <span className="bk__opt-price">{Number(item.act.price).toLocaleString()} {isTH ? 'บาท' : 'Baht'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>}

        {/* ── Footer ── */}
        <div className="bk__footer">
          <div className="bk__divider" />
          <div className="bk__footer-row">
            <button className="bk__confirm-check">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </button>
            {simple && showDateError && !selectedDate && (
              <span className="bk__date-error">กรุณาเลือกวันเข้าร่วมกิจกรรม</span>
            )}
            <div className="bk__total">
              Total&nbsp;&nbsp;:&nbsp;&nbsp;<strong>{total.toLocaleString()}</strong>&nbsp;Baht
            </div>
            {simple ? (
              <button className="bk__next-btn" onClick={() => {
                if (!selectedDate) {
                  setShowDateError(true);
                  modalRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                  return;
                }
                setShowDateError(false);
                handleAddToCart();
              }}>{isTH ? 'เพิ่มในตะกร้าสินค้า' : 'Add to Cart'}</button>
            ) : (
              <button className="bk__next-btn" onClick={() => {
                if (!selectedDate) {
                  setShowDateError(true);
                  modalRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                  return;
                }
                setShowDateError(false);
                setStep(2);
              }}>{isTH ? 'ถัดไป' : 'Next'}</button>
            )}
          </div>
        </div>
        </>)}

        {step === 2 && (<>
          {/* ── Reservation Summary ── */}
          <div className="bk__sum">
            <h3 className="bk__sum-title">{isTH ? 'สรุปรายละเอียดการจอง' : 'Reservation Summary'}</h3>
            <p className="bk__sum-sub">{isTH
              ? "โปรดตรวจสอบรายละเอียดการจองของคุณให้ถูกต้องก่อนยืนยัน หากพบข้อมูลไม่ถูกต้อง สามารถคลิก 'ย้อนกลับ' เพื่อแก้ไขได้ทันที"
              : "Don't forget to double-check your booking details before confirming! If anything looks off, just click 'Back' to edit."}</p>
            <div className="bk__sum-main">
              <div className="bk__sum-img-wrap">
                {activity.image
                  ? <img src={driveThumb(activity.image)} alt={activity.name} className="bk__sum-img"
                      onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                  : <div className="bk__sum-img-ph" />}
              </div>
              <div className="bk__sum-info">
                <h4 className="bk__sum-name">{activity.name}</h4>
                <div className="bk__sum-table">
                  <div className="bk__sum-col">
                    <p className="bk__sum-lbl">{isTH ? 'วันที่' : 'Date'}</p>
                    <p className="bk__sum-val">{selectedDate ? fmtDate(selectedDate) : '–'}</p>
                  </div>
                  <div className="bk__sum-col">
                    <p className="bk__sum-lbl">{isTH ? 'รายละเอียดกิจกรรม' : 'Activity Detail'}</p>
                    <p className="bk__sum-val">{isTH ? 'เวลา' : 'Time'} : {selectedTime || '–'}</p>
                  </div>
                  <div className="bk__sum-col">
                    <p className="bk__sum-lbl">{isTH ? 'จำนวน' : 'Quantity'}</p>
                    <p className="bk__sum-val">{participants}</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Checked optional activities — the "red rectangle" area */}
            {checkedOpts.length > 0 && (
              <div className="bk__sum-opts">
                {checkedOpts.map(o => (
                  <div key={o.act.id} className="bk__sum-opt-row">
                    <div className="bk__sum-opt-img-wrap">
                      {o.act.image
                        ? <img src={driveThumb(o.act.image)} alt={o.act.name} className="bk__sum-img"
                            onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                        : <div className="bk__sum-img-ph" />}
                    </div>
                    <div className="bk__sum-info">
                      <div className="bk__sum-name-row">
                        <h4 className="bk__sum-name">{o.act.name}</h4>
                        <button className="bk__trash-btn" onClick={() => removeCheckedOpt(o.act.id)}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                          </svg>
                        </button>
                      </div>
                      <div className="bk__sum-table">
                        <div className="bk__sum-col">
                          <p className="bk__sum-lbl">{isTH ? 'วันที่' : 'Date'}</p>
                          <p className="bk__sum-val">{selectedDate ? fmtDate(selectedDate) : '–'}</p>
                        </div>
                        <div className="bk__sum-col">
                          <p className="bk__sum-lbl">{isTH ? 'รายละเอียดกิจกรรม' : 'Activity Detail'}</p>
                          <p className="bk__sum-val">{isTH ? 'เวลา' : 'Time'} : {o.time || '–'}</p>
                        </div>
                        <div className="bk__sum-col">
                          <p className="bk__sum-lbl">{isTH ? 'จำนวน' : 'Quantity'}</p>
                          <p className="bk__sum-val">{o.qty}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Cart items added from Exclusive Offer */}
            {cartItems.length > 0 && (
              <div className="bk__sum-opts">
                {cartItems.map(c => (
                  <div key={c.product.id} className="bk__sum-opt-row">
                    <div className="bk__sum-opt-img-wrap">
                      {c.product.image
                        ? <img src={driveThumb(c.product.image)} alt={c.product.name} className="bk__sum-img"
                            onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                        : <div className="bk__sum-img-ph" />}
                    </div>
                    <div className="bk__sum-info">
                      <div className="bk__sum-name-row">
                        <h4 className="bk__sum-name">{c.product.name}</h4>
                        <button className="bk__trash-btn" onClick={() => removeCartItem(c.product.id)}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                          </svg>
                        </button>
                      </div>
                      <div className="bk__sum-table">
                        <div className="bk__sum-col">
                          <p className="bk__sum-lbl">{isTH ? 'วันที่' : 'Date'}</p>
                          <p className="bk__sum-val">{selectedDate ? fmtDate(selectedDate) : '–'}</p>
                        </div>
                        <div className="bk__sum-col">
                          <p className="bk__sum-lbl">{isTH ? 'จำนวน' : 'Quantity'}</p>
                          <p className="bk__sum-val">{c.qty}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="bk__sum-back-row">
              <button className="bk__back-btn" onClick={() => setStep(1)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
                {isTH ? 'ย้อนกลับ' : 'Back'}
              </button>
            </div>
          </div>

          {offerItems.length > 0 && (<>
            <div className="bk__divider" />
            <div className="bk__offer">
              <h4 className="bk__offer-title">{isTH ? <>สิทธิพิเศษ: <em>ฟรีค่าจัดส่งเมื่อรับที่หน้างาน!</em></> : <>Exclusive On-Site Offer: <em>Zero Shipping Fees!</em></>}</h4>
              <p className="bk__offer-sub">{isTH
                ? <>สั่งซื้อพร้อมการจองกิจกรรมวันนี้ รับสิทธิ์<strong>ส่งฟรี</strong> และรับสินค้าได้ง่ายๆ ที่หน้างานในวันที่เข้าชม</>
                : <>Order now along with your activity booking and enjoy <strong>Free Shipping</strong>. You can conveniently pick up your items directly at the location on the day of your visit.</>}</p>
              <div className="bk__offer-list">
                {offerItems.map(item => {
                  const tag = item.origin || '';
                  const qty = offerQtys[item.id] ?? 1;
                  return (
                    <div key={item.id} className="bk__offer-item">
                      <div className="bk__offer-img-wrap">
                        {item.image
                          ? <img src={driveThumb(item.image)} alt={item.name} className="bk__offer-img"
                              onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                          : <div className="bk__offer-img-ph" />}
                        <div className="bk__opt-badge">
                          <span className="bk__opt-badge-pct">10%</span>
                          <span className="bk__opt-badge-txt">{isTH ? <>รายได้ 10%<br/>สนับสนุนมูลนิธิ<br/>ในท้องถิ่น</> : <>10% of income<br/>supports local<br/>foundations.</>}</span>
                        </div>
                      </div>
                      <div className="bk__offer-info">
                        <div className="bk__offer-row1">
                          <span className="bk__offer-name">{item.name}</span>
                          {tag && <span className="bk__offer-tag">#{tag}</span>}
                        </div>
                        <div className="bk__offer-row2">
                          <span className="bk__offer-dur">{item.shipping_duration || ''}</span>
                          <div className="bk__offer-qty">
                            <button className="bk__qty-btn bk__qty-btn--sm"
                              onClick={() => setOfferQtys(q => ({...q, [item.id]: Math.max(1, (q[item.id]??1)-1)}))}
                            >&#x2212;</button>
                            <span className="bk__offer-qty-val">{qty}</span>
                            <button className="bk__qty-btn bk__qty-btn--sm"
                              onClick={() => setOfferQtys(q => ({...q, [item.id]: (q[item.id]??1)+1}))}
                            >+</button>
                          </div>
                          <span className="bk__offer-price">{Number(item.price).toLocaleString()} {isTH ? 'บาท' : 'Baht'}</span>
                        </div>
                        <p className="bk__offer-desc">{item.note}</p>
                        <button className="bk__add-cart" onClick={() => addOfferToLocalCart(item, qty)}>{isTH ? 'เพิ่มในตะกร้าสินค้า' : 'Add to cart'}</button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="bk__offer-footer">
                <button className="bk__close-btn" onClick={handleCloseModal}>{isTH ? 'ปิด' : 'Close'}</button>
                <button className="bk__pay-btn" onClick={handleAddToCart}>{isTH ? 'เพิ่มในตะกร้าสินค้า' : 'Add to cart'}</button>
              </div>
            </div>
          </>)}
        </>)}
      </div>
    </div>
  );
}

export const BOOKING_MODAL_CSS = `
.bk__overlay {
  position: fixed; inset: 0; z-index: 1100;
  background: rgba(0,0,0,.4);
  display: flex; align-items: center; justify-content: center;
  padding: 1rem;
}
.bk__modal {
  position: relative;
  background: #fff;
  border-radius: 18px;
  width: min(780px, 94vw);
  max-height: 92vh;
  overflow-y: auto;
  padding: 2rem 2.5rem 1.5rem;
  box-shadow: 0 16px 60px rgba(0,0,0,.18);
  display: flex; flex-direction: column; gap: 1.5rem;
  font-family: 'Kanit', sans-serif;
}
.bk__close {
  position: absolute; top: 1.1rem; right: 1.2rem;
  background: none; border: none; cursor: pointer;
  font-size: 1.2rem; color: #888; line-height: 1;
  transition: color .2s;
}
.bk__close:hover { color: #333; }

/* -- Top section -- */
.bk__top {
  display: grid; grid-template-columns: 280px 1fr; gap: 1.5rem;
  max-width: 620px; margin: 0 auto; width: 100%;
}

/* -- Calendar -- */
.bk__cal {
  border: 1.5px solid var(--forest);
  border-radius: 12px;
  padding: .85rem 1rem;
  margin-left: 2cm;
}
.bk__cal-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: .65rem;
}
.bk__cal-nav {
  background: none; border: none; cursor: pointer;
  color: var(--forest); padding: .2rem .3rem;
  border-radius: 6px; transition: background .2s;
  display: flex; align-items: center; justify-content: center;
}
.bk__cal-nav:hover { background: #e8f0eb; }
.bk__cal-title {
  font-size: .85rem; font-weight: 700; color: var(--text);
}
.bk__cal-grid {
  display: grid; grid-template-columns: repeat(7, 1fr);
  gap: .15rem;
}
.bk__cal-dayname {
  text-align: center; font-size: .68rem; font-weight: 600;
  color: #888; padding: .15rem 0;
}
.bk__cal-day {
  aspect-ratio: 1; border-radius: 50%;
  background: none; border: none; cursor: pointer;
  font-size: .75rem; color: var(--text);
  display: flex; align-items: center; justify-content: center;
  transition: all .15s; font-family: inherit;
}
.bk__cal-day:hover:not(:disabled):not(.bk__cal-day--sel) { background: #e8f0eb; color: var(--forest); }
.bk__cal-day--empty { visibility: hidden; pointer-events: none; }
.bk__cal-day--sel {
  background: var(--forest); color: #fff; font-weight: 700;
}
.bk__cal-day--today {
  border: 1.5px solid var(--forest); color: var(--forest); font-weight: 600;
}

/* -- Right panel -- */
.bk__right { display: flex; flex-direction: column; gap: 1.5rem; padding-top: 1cm; }
.bk__participants {
  display: flex; align-items: center; gap: .7rem;
  font-size: 1rem;
}
.bk__colon { color: #888; }
.bk__qty-btn {
  width: 28px; height: 28px; border-radius: 50%;
  border: 1.5px solid #bbb; background: none; cursor: pointer;
  font-size: 1.1rem; display: flex; align-items: center; justify-content: center;
  color: #555; transition: all .2s; line-height: 1;
}
.bk__qty-btn:hover { border-color: var(--forest); color: var(--forest); }
.bk__qty-val {
  font-size: 1.1rem; font-weight: 700; min-width: 24px; text-align: center;
}
.bk__qty-btn--sm { width: 22px; height: 22px; font-size: .9rem; }
.bk__qty-val--sm { font-size: .9rem; }

/* -- Time slots -- */
.bk__times { display: flex; flex-direction: column; gap: .6rem; }
.bk__times-label {
  font-size: .85rem; font-weight: 600; color: #888;
  letter-spacing: .05em; margin-bottom: .2rem;
}
.bk__time-option {
  display: flex; align-items: center; gap: .7rem;
  cursor: pointer; font-size: .9rem; color: var(--text);
}
.bk__time-option input[type="radio"] { display: none; }
.bk__time-radio {
  width: 18px; height: 18px; border-radius: 50%;
  border: 2px solid #ccc; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  transition: all .2s;
}
.bk__time-option input:checked + .bk__time-radio {
  border-color: var(--forest);
  background: radial-gradient(circle, var(--forest) 40%, transparent 45%);
}

/* -- Optional section -- */
.bk__optional { display: flex; flex-direction: column; gap: .8rem; }
.bk__opt-title {
  font-size: 1rem; font-weight: 700; color: var(--text);
}
.bk__opt-desc {
  font-size: .82rem; color: #666; line-height: 1.6;
}
.bk__opt-loading { color: #888; font-size: .85rem; }
.bk__opt-list {
  display: flex; flex-direction: column; gap: 0;
  max-height: 310px; overflow-y: auto;
  padding-right: .5rem;
}
.bk__opt-list::-webkit-scrollbar { width: 8px; }
.bk__opt-list::-webkit-scrollbar-track { background: #ede8de; border-radius: 10px; }
.bk__opt-list::-webkit-scrollbar-thumb { background: #c4a882; border-radius: 10px; }

.bk__opt-item {
  display: grid; grid-template-columns: 36px 110px 1fr;
  gap: .85rem; align-items: start;
  padding: .85rem 0;
  border-bottom: 1px solid #e5e5e5;
}
.bk__opt-item--checked { background: none; }

.bk__opt-check {
  width: 28px; height: 28px; border-radius: 6px;
  border: 2px solid #ccc; background: #fff;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; transition: all .2s; margin-top: .2rem;
}
.bk__opt-check--on {
  background: var(--forest); border-color: var(--forest); color: #fff;
}

.bk__opt-img-wrap {
  position: relative; border-radius: 8px; overflow: hidden;
  aspect-ratio: 1; width: 100%;
  background: #2d5a3d;
}
.bk__opt-img { width: 100%; height: 100%; object-fit: cover; display: block; }
.bk__opt-img-placeholder {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  color: rgba(255,255,255,.4);
}
.bk__opt-img-placeholder svg { opacity: .5; }
.bk__opt-badge {
  position: absolute; bottom: 0; left: 0; right: 0;
  background: rgba(27,67,50,.85);
  padding: .3rem .4rem;
  display: flex; align-items: center; gap: .3rem;
}
.bk__opt-badge-pct {
  font-size: .65rem; font-weight: 800; color: #fff;
  background: rgba(255,255,255,.2); border-radius: 3px;
  padding: .1rem .25rem;
}
.bk__opt-badge-txt {
  font-size: .55rem; color: rgba(255,255,255,.9);
  line-height: 1.35;
}

/* Row 1: name + tag */
.bk__opt-info { display: flex; flex-direction: column; min-width: 0; }
.bk__opt-top-row {
  display: flex; justify-content: space-between; align-items: center; gap: .5rem;
  padding-bottom: .5rem;
  border-bottom: 1.5px solid #aaa;
}
.bk__opt-name {
  font-size: .88rem; font-weight: 700; color: var(--text);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.bk__opt-tag { font-size: .72rem; color: #888; flex-shrink: 0; white-space: nowrap; }

.bk__opt-row2 {
  display: flex; align-items: center; gap: 1.5cm;
  padding: .5rem 0;
  border-bottom: 1.5px solid #aaa;
}
.bk__opt-duration { font-size: .8rem; color: #555; flex-shrink: 0; white-space: nowrap; }
.bk__opt-controls {
  display: flex; align-items: center; gap: .4rem;
}
.bk__opt-time-sel {
  border: 1px solid #ccc; border-radius: 6px;
  font-size: .78rem; padding: .2rem .45rem;
  background: #fff; cursor: pointer; color: var(--text);
  appearance: auto; margin-left: 1.5cm;
}
.bk__opt-row3 {
  display: flex; justify-content: space-between; align-items: flex-start; gap: .5rem;
  padding-top: .5rem; min-width: 0;
}
.bk__opt-desc-text {
  font-size: .78rem; color: #888; line-height: 1.45;
  flex: 1; min-width: 0;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
  overflow: hidden;
}
.bk__opt-price {
  font-size: .88rem; font-weight: 700; color: var(--text);
  white-space: nowrap; flex-shrink: 0;
}

/* -- Footer -- */
.bk__divider { height: 1px; background: #e0e0e0; }
.bk__footer-row {
  display: flex; align-items: center; gap: 1rem;
}
.bk__confirm-check {
  width: 32px; height: 32px;
  background: none; border: none; cursor: pointer;
  color: var(--forest); display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.bk__total {
  flex: 1; text-align: center;
  font-size: .92rem; color: var(--text);
}
.bk__total strong { font-size: 1.05rem; }
.bk__next-btn {
  padding: .65rem 2.2rem;
  background: var(--forest); color: #fff;
  border: none; border-radius: 8px;
  font-size: .95rem; font-weight: 600; cursor: pointer;
  transition: background .2s; flex-shrink: 0;
  font-family: 'Kanit', sans-serif;
}
.bk__next-btn:hover { background: #1a3d2e; }

@media(max-width: 640px) {
  /* Modal */
  .bk__modal {
    padding: 1.2rem 1rem 1rem;
    border-radius: 14px;
    width: 96vw;
    gap: 1rem;
  }
  .bk__close { top: .75rem; right: .75rem; }

  /* Step 1 – stack calendar above participants/time */
  .bk__top {
    grid-template-columns: 1fr;
    justify-items: center;
    gap: 1rem;
  }
  .bk__cal {
    margin-left: 0;
    width: 100%;
    max-width: 280px;
    padding: .7rem .75rem;
  }
  .bk__right {
    padding-top: 0;
    width: 100%;
    align-items: flex-start;
  }

  /* Optional activities */
  .bk__opt-title-row { gap: .5rem; flex-wrap: wrap; }
  .bk__opt-item { grid-template-columns: 28px 80px 1fr; gap: .5rem; }
  .bk__opt-row2 { gap: .5rem; flex-wrap: wrap; }
  .bk__opt-time-sel { margin-left: .3rem; }
  .bk__opt-list { max-height: 260px; }

  /* Footer */
  .bk__footer-row { flex-wrap: wrap; gap: .6rem; }
  .bk__total { flex: 1 1 100%; order: -1; text-align: left; font-size: .88rem; }
  .bk__next-btn { width: 100%; text-align: center; padding: .6rem 1rem; }

  /* Step 2 – Reservation Summary */
  .bk__sum-title { font-size: 1rem; }
  .bk__sum-main { flex-direction: column; gap: .9rem; }
  .bk__sum-img-wrap { width: 100%; max-width: 100%; aspect-ratio: 16/9; }
  .bk__sum-info { gap: .6rem; }
  .bk__sum-table { flex-wrap: wrap; gap: .8rem; }

  /* Optional rows in summary */
  .bk__sum-opt-row { flex-direction: column; gap: .75rem; }
  .bk__sum-opt-img-wrap { width: 100%; max-width: 100%; aspect-ratio: 16/9; }

  /* Step 2 – Offer section */
  .bk__offer-item { grid-template-columns: 1fr; }
  .bk__offer-img-wrap { width: 100%; aspect-ratio: 16/9; }
  .bk__offer-row2 { gap: .5rem; flex-wrap: wrap; }
  .bk__offer-price { margin-left: 0; }
  .bk__offer-list { max-height: none; }
  .bk__offer-footer { flex-direction: column; }
  .bk__close-btn, .bk__pay-btn { width: 100%; padding: .6rem 1rem; text-align: center; }

  /* Back button */
  .bk__back-btn { width: 100%; justify-content: center; }
}

/* ── Step 2: Reservation Summary ── */
.bk__sum { display: flex; flex-direction: column; gap: 1.2rem; }
.bk__sum-title { font-size: 1.15rem; font-weight: 700; color: var(--text); }
.bk__sum-sub { font-size: .82rem; color: #666; line-height: 1.55; }
.bk__sum-main {
  display: flex; gap: 1.5rem; align-items: flex-start;
}
.bk__sum-img-wrap {
  width: 190px; flex-shrink: 0;
  border-radius: 10px; overflow: hidden; background: #2d5a3d;
  aspect-ratio: 4/3;
}
.bk__sum-img { width: 100%; height: 100%; object-fit: cover; display: block; }
.bk__sum-img-ph { width: 100%; height: 100%; background: #2d5a3d; }
.bk__sum-info { flex: 1; display: flex; flex-direction: column; gap: .9rem; }
.bk__sum-name { font-size: 1rem; font-weight: 700; color: var(--text); }
.bk__sum-table { display: flex; gap: 1.5rem; align-items: flex-start; }
.bk__sum-col { display: flex; flex-direction: column; gap: .3rem; min-width: 0; }
.bk__sum-lbl { font-size: .78rem; color: #888; font-weight: 600; white-space: nowrap; }
.bk__sum-val { font-size: .82rem; color: var(--text); }
.bk__cal--error { border-color: #e53e3e !important; }
.bk__opt-title-row {
  display: flex; align-items: center; gap: 1cm;
}
.bk__date-error {
  font-size: .78rem; color: #e53e3e; white-space: nowrap;
}
.bk__sum-name-row {
  display: flex; align-items: center; justify-content: space-between; gap: .5rem;
}
.bk__trash-btn {
  background: none; border: none; cursor: pointer;
  color: #aaa; padding: .2rem; flex-shrink: 0;
  display: flex; align-items: center; transition: color .2s;
}
.bk__trash-btn:hover { color: #e53e3e; }
.bk__sum-opts { display: flex; flex-direction: column; gap: 0; }
.bk__sum-opt-row {
  display: flex; gap: 1.5rem; align-items: flex-start;
  padding: .85rem 0; border-top: 1px solid #e5e5e5;
}
.bk__sum-opt-img-wrap {
  width: 190px; flex-shrink: 0;
  border-radius: 10px; overflow: hidden; background: #2d5a3d;
  aspect-ratio: 4/3;
}
.bk__sum-back-row { display: flex; justify-content: flex-end; }
.bk__back-btn {
  display: flex; align-items: center; gap: .4rem;
  padding: .55rem 1.4rem;
  border: 1.5px solid #bbb; border-radius: 8px;
  background: #fff; cursor: pointer; font-size: .88rem;
  color: var(--text); font-family: 'Kanit', sans-serif;
  transition: border-color .2s;
}
.bk__back-btn:hover { border-color: var(--forest); color: var(--forest); }

/* ── Step 2: On-Site Offer ── */
.bk__offer { display: flex; flex-direction: column; gap: .9rem; }
.bk__offer-title { font-size: 1rem; font-weight: 700; color: var(--text); }
.bk__offer-title em { font-style: normal; }
.bk__offer-sub { font-size: .82rem; color: #666; line-height: 1.55; }
.bk__offer-list {
  display: flex; flex-direction: column; gap: 0;
  max-height: 310px; overflow-y: auto; padding-right: .4rem;
}
.bk__offer-list::-webkit-scrollbar { width: 8px; }
.bk__offer-list::-webkit-scrollbar-track { background: #ede8de; border-radius: 10px; }
.bk__offer-list::-webkit-scrollbar-thumb { background: #c4a882; border-radius: 10px; }
.bk__offer-item {
  display: grid; grid-template-columns: 160px 1fr;
  gap: 1rem; align-items: start;
  padding: .85rem 0; border-bottom: 1px solid #e5e5e5;
}
.bk__offer-img-wrap {
  position: relative; border-radius: 8px; overflow: hidden;
  aspect-ratio: 4/3; background: #2d5a3d;
}
.bk__offer-img { width: 100%; height: 100%; object-fit: cover; display: block; }
.bk__offer-img-ph { position: absolute; inset: 0; background: #2d5a3d; }
.bk__offer-info { display: flex; flex-direction: column; gap: .45rem; min-width: 0; }
.bk__offer-row1 {
  display: flex; justify-content: space-between; align-items: center; gap: .5rem;
  padding-bottom: .45rem; border-bottom: 1.5px solid #aaa;
}
.bk__offer-name { font-size: .9rem; font-weight: 700; color: var(--text); }
.bk__offer-tag { font-size: .72rem; color: #888; white-space: nowrap; flex-shrink: 0; }
.bk__offer-row2 {
  display: flex; align-items: center; gap: 1.5cm;
  padding: .45rem 0; border-bottom: 1.5px solid #aaa;
}
.bk__offer-dur { font-size: .8rem; color: #555; white-space: nowrap; flex-shrink: 0; }
.bk__offer-qty { display: flex; align-items: center; gap: .5rem; font-size: .88rem; }
.bk__offer-qty-val { font-weight: 700; min-width: 20px; text-align: center; }
.bk__offer-price { font-size: .88rem; font-weight: 700; color: var(--text); white-space: nowrap; margin-left: auto; }
.bk__offer-desc {
  font-size: .78rem; color: #888; line-height: 1.45;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.bk__add-cart {
  align-self: flex-end;
  padding: .4rem 1.1rem;
  background: var(--forest); color: #fff;
  border: none; border-radius: 6px; cursor: pointer;
  font-size: .82rem; font-weight: 600; font-family: 'Kanit', sans-serif;
  transition: background .2s;
}
.bk__add-cart:hover { background: #1a3d2e; }
.bk__offer-footer {
  display: flex; justify-content: center; gap: 1rem; padding-top: .5rem;
}
.bk__close-btn {
  padding: .65rem 2.5rem;
  border: 1.5px solid #bbb; border-radius: 8px;
  background: #fff; cursor: pointer;
  font-size: .95rem; font-weight: 600; color: var(--text);
  font-family: 'Kanit', sans-serif; transition: border-color .2s;
}
.bk__close-btn:hover { border-color: var(--forest); }
.bk__pay-btn {
  padding: .65rem 2.5rem;
  background: var(--forest); color: #fff;
  border: none; border-radius: 8px; cursor: pointer;
  font-size: .95rem; font-weight: 600;
  font-family: 'Kanit', sans-serif; transition: background .2s;
}
.bk__pay-btn:hover:not(:disabled) { background: #1a3d2e; }
.bk__pay-btn:disabled { opacity: .7; cursor: default; }
`;
