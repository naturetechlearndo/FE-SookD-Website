import { useState, useEffect } from 'react';
import Footer from './Footer';
import { SITE_CONTENT as c } from '../constants/content';
import { api } from '../services/api';

interface Activity {
  id: string;
  name: string;
  price: number;
  type: string;
  description: string;
  image: string;
  location: string;
  date: string;
  note: string;
  by: string;
  min_participants: number;
  max_participants: number;
}

function driveThumb(url: string): string {
  const m = url?.match(/\/d\/([^/]+)\//);
  if (m) return `https://drive.google.com/thumbnail?id=${m[1]}&sz=w400`;
  return url;
}

function typeColor(type: string): string {
  if (type?.includes('Adventure')) return '#2d5a3d';
  if (type?.includes('Academic')) return '#3d5a6b';
  if (type?.includes('Community')) return '#5a3d2d';
  if (type?.includes('Wellness')) return '#4a3d6b';
  return '#2d4a3e';
}

const VISIBLE_COUNT = 6;

export default function ExperiencesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [activeType, setActiveType] = useState('ทั้งหมด');

  useEffect(() => {
    api.activities.getAll()
      .then(setActivities)
      .catch(() => setError('ไม่สามารถโหลดข้อมูลได้ กรุณาตรวจสอบ backend'))
      .finally(() => setLoading(false));
  }, []);

  const types = ['ทั้งหมด', ...Array.from(new Set(
    activities.flatMap(a => a.type?.split(',').map(t => t.trim()) ?? [])
  ))];

  const filtered = activities.filter(a => {
    const matchSearch =
      a.name?.toLowerCase().includes(search.toLowerCase()) ||
      a.description?.toLowerCase().includes(search.toLowerCase()) ||
      a.location?.toLowerCase().includes(search.toLowerCase());
    const matchType =
      activeType === 'ทั้งหมด' ||
      a.type?.split(',').map(t => t.trim()).includes(activeType);
    return matchSearch && matchType;
  });

  const visible = showAll ? filtered : filtered.slice(0, VISIBLE_COUNT);

  return (
    <>
      <div className="exp-page">
        {/* Hero */}
        <section className="exp-hero">
          <div className="exp-hero__overlay" />
          <div className="exp-hero__content">
            <h1 className="exp-hero__heading">{c.experiences.hero.heading}</h1>
            <p className="exp-hero__sub">{c.experiences.hero.subheading}</p>
          </div>
        </section>

        {/* Search */}
        <div className="exp-controls">
          <div className="exp-search-wrap">
            <svg className="exp-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              className="exp-search"
              type="text"
              placeholder="ค้นหากิจกรรม..."
              value={search}
              onChange={e => { setSearch(e.target.value); setShowAll(false); }}
            />
          </div>

          {/* Type filter pills */}
          <div className="exp-type-pills">
            {types.map(t => (
              <button
                key={t}
                className={`exp-pill${activeType === t ? ' exp-pill--active' : ''}`}
                onClick={() => { setActiveType(t); setShowAll(false); }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="exp-divider" />

        {/* States */}
        {loading && <p className="exp-state">กำลังโหลดกิจกรรม...</p>}
        {error && <p className="exp-state exp-state--error">{error}</p>}

        {/* Grid */}
        {!loading && !error && (
          <>
            <div className="exp-grid">
              {visible.map(a => (
                <ActivityCard key={a.id} activity={a} />
              ))}
            </div>

            {filtered.length === 0 && (
              <p className="exp-state">ไม่พบกิจกรรมที่ตรงกับการค้นหา</p>
            )}

            {filtered.length > VISIBLE_COUNT && (
              <div className="exp-more-wrap">
                <button className="exp-more-btn" onClick={() => setShowAll(!showAll)}>
                  {showAll ? 'Show less' : `See more (${filtered.length - VISIBLE_COUNT} รายการ)`}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points={showAll ? '18 15 12 9 6 15' : '6 9 12 15 18 9'} />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </div>
      <div className="section-gap" />
      <Footer data={c.footer} />
    </>
  );
}

function ActivityCard({ activity: a }: { activity: Activity }) {
  const tags = a.type?.split(',').map(t => t.trim()) ?? [];
  const imgSrc = driveThumb(a.image);
  const bg = typeColor(a.type);

  return (
    <div className="exp-card">
      <div className="exp-card__img-wrap" style={{ background: bg }}>
        <img
          src={imgSrc}
          alt={a.name}
          className="exp-card__img"
          onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
        />
        {a.by && (
          <div className="exp-badge exp-badge--low">
            <span className="exp-badge__note">{a.by}</span>
          </div>
        )}
      </div>

      <div className="exp-card__body">
        <div className="exp-card__top-row">
          <h3 className="exp-card__title">{a.name}</h3>
          <div className="exp-card__tags">
            {tags.map(t => (
              <span key={t} className="exp-card__tag">#{t}</span>
            ))}
          </div>
        </div>

        <div className="exp-card__meta">
          <span className="exp-card__duration">{a.location?.split(' ')[0] ?? ''}</span>
          <span className="exp-card__price">
            {Number(a.price).toLocaleString()} ฿
          </span>
        </div>

        {a.description && (
          <p className="exp-card__desc">
            {a.description.length > 80 ? a.description.slice(0, 80) + '…' : a.description}
          </p>
        )}
      </div>
    </div>
  );
}

export const EXPERIENCES_CSS = `
/* ── Experiences Page ────────────────────────────────────────── */
.exp-page { padding-top: 64px; }

.exp-hero {
  position: relative;
  height: 300px;
  display: flex; align-items: center; justify-content: center;
  text-align: center;
  background: url('/img/exp-hero.jpg') center/cover no-repeat;
  background-color: #2d5a3d;
  overflow: hidden;
}
.exp-hero__overlay {
  position: absolute; inset: 0;
  background: rgba(20,45,30,.45);
}
.exp-hero__content { position: relative; z-index: 1; }
.exp-hero__heading {
  font-size: clamp(2rem,5vw,3.2rem);
  font-weight: 700; color: var(--white);
  letter-spacing: -.01em; margin-bottom: .4rem;
}
.exp-hero__sub {
  font-size: 1.1rem; color: rgba(255,255,255,.9);
  font-weight: 400;
}

/* Controls */
.exp-controls {
  max-width: 900px; margin: 2.5rem auto 0;
  padding: 0 5%;
  display: flex; flex-direction: column; gap: 1rem;
}
.exp-search-wrap { position: relative; width: 100%; }
.exp-search-icon {
  position: absolute; left: .9rem; top: 50%; transform: translateY(-50%);
  color: #999; pointer-events: none;
}
.exp-search {
  width: 100%;
  padding: .7rem 1rem .7rem 2.6rem;
  border: 1.5px solid #e0ddd5;
  border-radius: 8px;
  font-size: .95rem;
  background: #faf9f7;
  outline: none;
  transition: border-color .2s;
}
.exp-search:focus { border-color: var(--mint); }

/* Type filter pills */
.exp-type-pills {
  display: flex; flex-wrap: wrap; gap: .5rem;
}
.exp-pill {
  padding: .35rem .9rem;
  border: 1.5px solid #d4d0c8;
  border-radius: 20px;
  background: var(--white);
  font-size: .82rem; font-weight: 500; color: #666;
  cursor: pointer;
  transition: all .2s;
  font-family: var(--font-th);
}
.exp-pill:hover { border-color: var(--mint); color: var(--forest); }
.exp-pill--active {
  background: var(--forest); color: var(--white);
  border-color: var(--forest);
}

.exp-divider {
  max-width: 900px; margin: 1rem auto 0;
  height: 1px; background: #e8e5de;
}

/* State messages */
.exp-state {
  text-align: center; padding: 3rem;
  color: #888; font-family: var(--font-th);
}
.exp-state--error { color: #c0392b; }

/* Grid */
.exp-grid {
  max-width: 900px; margin: 2rem auto 0;
  padding: 0 5%;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

/* Card */
.exp-card {
  border-radius: 12px;
  overflow: hidden;
  background: var(--white);
  box-shadow: 0 2px 12px rgba(0,0,0,.08);
  transition: transform .25s ease, box-shadow .25s ease;
  cursor: pointer;
}
.exp-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 28px rgba(0,0,0,.14);
}
.exp-card__img-wrap {
  position: relative;
  aspect-ratio: 4/3;
  overflow: hidden;
}
.exp-card__img {
  width: 100%; height: 100%; object-fit: cover;
}
.exp-badge {
  position: absolute; top: .65rem; left: .65rem;
  display: flex; align-items: center; gap: .3rem;
  padding: .2rem .55rem;
  border-radius: 20px;
  font-size: .75rem;
  max-width: 80%;
}
.exp-badge--low { background: rgba(255,255,255,.88); color: #1b4332; }
.exp-badge__pct { font-weight: 700; font-size: .85rem; }
.exp-badge__note {
  font-size: .68rem; line-height: 1.2;
  font-family: var(--font-th);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.exp-card__body { padding: .85rem 1rem 1rem; }
.exp-card__top-row {
  display: flex; justify-content: space-between; align-items: flex-start;
  gap: .5rem; margin-bottom: .5rem;
}
.exp-card__title {
  font-size: .92rem; font-weight: 600;
  color: var(--text); font-family: var(--font-th);
  flex: 1;
  display: -webkit-box; -webkit-line-clamp: 2;
  -webkit-box-orient: vertical; overflow: hidden;
}
.exp-card__tags {
  display: flex; flex-direction: column; align-items: flex-end; gap: .15rem;
  flex-shrink: 0;
}
.exp-card__tag {
  font-size: .68rem; color: #6b7c6b;
  font-family: var(--font-th); white-space: nowrap;
}
.exp-card__meta {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: .45rem;
}
.exp-card__duration { font-size: .82rem; color: #666; font-family: var(--font-th); }
.exp-card__price { font-size: .88rem; font-weight: 600; color: var(--forest); }
.exp-card__desc {
  font-size: .78rem; color: #888;
  font-family: var(--font-th); line-height: 1.55;
}

/* See more */
.exp-more-wrap { text-align: center; margin: 2rem 0 0; }
.exp-more-btn {
  display: inline-flex; align-items: center; gap: .4rem;
  background: none; border: none;
  font-size: .95rem; color: #555; cursor: pointer; font-weight: 500;
  transition: color .2s;
}
.exp-more-btn:hover { color: var(--forest); }

@media(max-width:768px){
  .exp-grid { grid-template-columns: repeat(2, 1fr); }
  .exp-hero { height: 220px; }
}
@media(max-width:480px){
  .exp-grid { grid-template-columns: 1fr; }
}
`;
