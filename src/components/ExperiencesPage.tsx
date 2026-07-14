import { useState, useEffect, useRef } from 'react';
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
  if (m) {
    const driveUrl = encodeURIComponent(`https://drive.google.com/thumbnail?id=${m[1]}&sz=w400`);
    return `https://res.cloudinary.com/zgor0mh6/image/fetch/w_400,q_auto,f_auto/${driveUrl}`;
  }
  return url;
}

function shortDuration(date: string): string {
  if (!date) return '';
  return date.split(/[\n(]/)[0].trim();
}

const VISIBLE_COUNT = 6;

interface ExperiencesPageProps {
  onSelectActivity: (id: string) => void;
  currentUser?: any;
  lang?: 'TH' | 'ENG';
}


export default function ExperiencesPage({ onSelectActivity, currentUser, lang = 'TH' }: ExperiencesPageProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [activeType, setActiveType] = useState('ทั้งหมด');
  const [filterOpen, setFilterOpen] = useState(false);
  const [featuredIds, setFeaturedIds] = useState<string[]>([]);
  const filterRef = useRef<HTMLDivElement>(null);

  const langSuffix = lang === 'TH' ? '_TH' : '_EN';
  const allLabel = 'ทั้งหมด';


  useEffect(() => {
    const stored = sessionStorage.getItem('featuredActivities');
    if (stored) {
      try {
        const ids = JSON.parse(stored);
        setFeaturedIds(ids);
        setShowAll(true);
        sessionStorage.removeItem('featuredActivities');
      } catch {}
    }
  }, []);

  useEffect(() => {
    api.activities.getAll()
      .then(setActivities)
      .catch(() => setError('ไม่สามารถโหลดข้อมูลได้ กรุณาตรวจสอบ backend'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => { setActiveType(allLabel); }, [lang]);

  const langActivities = activities.filter(a => a.id?.endsWith(langSuffix));

  const types = [allLabel, ...Array.from(new Set(
    langActivities.flatMap(a => a.type?.split(',').map(t => t.trim()) ?? [])
  ))];

  const filtered = langActivities.filter(a => {
    const matchSearch =
      a.name?.toLowerCase().includes(search.toLowerCase()) ||
      a.description?.toLowerCase().includes(search.toLowerCase()) ||
      a.location?.toLowerCase().includes(search.toLowerCase());
    const matchType =
      activeType === allLabel ||
      a.type?.split(',').map(t => t.trim()).includes(activeType);
    return matchSearch && matchType;
  });

  const sorted = featuredIds.length > 0
    ? [
        ...featuredIds.map(id => filtered.find(a => a.id === id)).filter(Boolean) as Activity[],
        ...filtered.filter(a => !featuredIds.includes(a.id)),
      ]
    : filtered;

  const visible = showAll ? sorted : sorted.slice(0, VISIBLE_COUNT);

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

        {/* Search + active filter chip */}
        <div className="exp-controls">
          <div className="exp-search-wrap">
            <svg className="exp-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              className="exp-search"
              type="text"
              placeholder="Search"
              value={search}
              onChange={e => { setSearch(e.target.value); setShowAll(false); }}
              onBlur={e => { if (e.target.value) (window as any).gtag?.('event', 'search', { search_term: e.target.value }); }}
            />
          </div>

        </div>

        {/* Filter / Sort bar */}
        <div className="exp-filterbar-wrap">
          <div className="exp-filterbar">
            <div className="exp-filterbar__right">
              <div className="exp-filter-dd" ref={filterRef}>
                <button
                  className="exp-filterbar__btn"
                  onClick={() => setFilterOpen(o => !o)}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" />
                  </svg>
                  Filter
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points={filterOpen ? '18 15 12 9 6 15' : '6 9 12 15 18 9'} />
                  </svg>
                </button>
                {filterOpen && (
                  <div className="exp-dropdown">
                    {types.map(t => (
                      <button
                        key={t}
                        className={`exp-dropdown__item${activeType === t ? ' active' : ''}`}
                        onClick={() => { (window as any).gtag?.('event', 'click_filter', { filter_value: t, list_name: 'Experiences' }); setActiveType(t); setFilterOpen(false); setShowAll(false); }}
                      >
                        {activeType === t && (
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                        {t}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="exp-filterbar__sep" />

              <button className="exp-filterbar__btn" onClick={() => (window as any).gtag?.('event', 'click_sort', { list_name: 'Experiences' })}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="6" x2="21" y2="6" /><line x1="6" y1="12" x2="18" y2="12" /><line x1="10" y1="18" x2="14" y2="18" />
                </svg>
                Sort
              </button>
            </div>
          </div>
        </div>

        {/* States */}
        {loading && <p className="exp-state">กำลังโหลดกิจกรรม...</p>}
        {error && <p className="exp-state exp-state--error">{error}</p>}

        {/* Grid */}
        {!loading && !error && (
          <>
            <div className="exp-grid">
              {visible.map(a => (
                <ActivityCard key={a.id} activity={a} lang={lang} isFeatured={featuredIds.includes(a.id)} onClick={() => { (window as any).gtag?.('event', 'select_item', { item_list_name: 'Experiences', item_id: a.id, item_name: a.name }); onSelectActivity(a.id); }} />
              ))}
            </div>

            {filtered.length === 0 && (
              <p className="exp-state">ไม่พบกิจกรรมที่ตรงกับการค้นหา</p>
            )}

            {filtered.length > VISIBLE_COUNT && (
              <div className="exp-more-wrap">
                <button className="exp-more-btn" onClick={() => { if (!showAll) (window as any).gtag?.('event', 'click_load_more', { list_name: 'Experiences' }); setShowAll(!showAll); }}>
                  {showAll ? 'Show less' : 'See more'}
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
      <Footer data={c.footer[lang]} />
    </>
  );
}

function ActivityCard({ activity: a, onClick, lang = 'TH', isFeatured = false }: { activity: Activity; onClick: () => void; lang?: 'TH' | 'ENG'; isFeatured?: boolean }) {
  const tags = a.type?.split(',').map(t => t.trim()) ?? [];
  const imgSrc = driveThumb(a.image);
  const duration = shortDuration(a.date);

  return (
    <div className="exp-card" onClick={onClick} role="button" tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick()}>
      <div className="exp-card__img-wrap">
        {isFeatured && (
          <div style={{position:'absolute',top:'8px',left:'8px',zIndex:2,background:'#E65100',color:'#fff',fontSize:'.72rem',fontWeight:700,padding:'.2rem .6rem',borderRadius:'50px',lineHeight:1.3}}>
            {lang === 'TH' ? '🎨 แนะนำพิเศษ' : '🎨 Recommended'}
          </div>
        )}
        <img
          src={imgSrc}
          alt={a.name}
          className="exp-card__img"
          loading="lazy"
          onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
        />
        <div className="impact-badge">
          <span className="impact-badge__pct">10%</span>
          <span className="impact-badge__text">{lang === 'TH' ? <>รายได้ 10%<br/>สนับสนุนมูลนิธิ<br/>ในท้องถิ่น</> : <>10% of income<br/>supports local<br/>foundations.</>}</span>
        </div>
        {tags.length > 0 && (
          <div className="exp-card__img-tags">
            {tags.slice(0, 2).map(t => (
              <span key={t} className="exp-card__img-tag">#{t}</span>
            ))}
          </div>
        )}
      </div>

      <div className="exp-card__body">
        <h3 className="exp-card__title">{a.name}</h3>
        <div className="exp-card__divider" />
        <div className="exp-card__meta">
          <span className="exp-card__duration">{duration}</span>
          <span className="exp-card__price">{Number(a.price).toLocaleString()} {lang === 'TH' ? 'บาท' : 'Baht'}</span>
        </div>
        <div className="exp-card__divider" />
        {a.description && (
          <p className="exp-card__desc">
            {a.description.replace(/\n/g, ' ').slice(0, 80)}
            {a.description.length > 80 ? '…' : ''}
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
  max-width: 1200px; margin: 2.5rem auto 0;
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
  box-sizing: border-box;
  font:inherit;
}
.exp-search:focus { border-color: var(--mint); }

/* Filter bar */
.exp-filterbar-wrap {
  max-width: 1200px; margin: 1rem auto 0;
  padding: 0 5%;
  border-top: 1px solid #e8e5de;
  border-bottom: 1px solid #e8e5de;
}
.exp-filterbar {
  display: flex; justify-content: flex-end; align-items: center;
  height: 44px;
}
.exp-filterbar__right {
  display: flex; align-items: center; gap: .75rem;
}
.exp-filterbar__sep {
  width: 1px; height: 18px; background: #d4d0c8;
}
.exp-filterbar__btn {
  display: inline-flex; align-items: center; gap: .3rem;
  background: none; border: none;
  font-size: .88rem; font-weight: 500; color: #444;
  cursor: pointer; padding: 0;
  font-family: inherit;
  transition: color .2s;
}
.exp-filterbar__btn:hover { color: var(--forest); }

/* Filter dropdown */
.exp-filter-dd { position: relative; }
.exp-dropdown {
  position: absolute; top: calc(100% + 8px); left: 0;
  background: var(--white);
  border: 1px solid #e0ddd5;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,.12);
  min-width: 200px; z-index: 100;
  padding: .4rem 0;
  overflow: hidden;
}
.exp-dropdown__item {
  display: flex; align-items: center; gap: .5rem;
  width: 100%; padding: .55rem 1rem;
  background: none; border: none;
  font-size: .88rem; color: #444;
  cursor: pointer; text-align: left;
  font-family: var(--font-th);
  transition: background .15s;
}
.exp-dropdown__item:hover { background: #f5f4f0; }
.exp-dropdown__item.active { color: var(--forest); font-weight: 600; }

/* State messages */
.exp-state {
  text-align: center; padding: 3rem;
  color: #888; font-family: var(--font-th);
}
.exp-state--error { color: #c0392b; }

/* Grid */
.exp-grid {
  max-width: 1200px; margin: 2rem auto 0;
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
  background: #2d5a3d;
}
.exp-card__img {
  width: 100%; height: 100%; object-fit: cover;
}
.exp-badge {
  position: absolute; top: .65rem; left: .65rem;
  display: flex; flex-direction: column; align-items: center;
  padding: .3rem .55rem;
  border-radius: 20px;
  background: rgba(255,255,255,.88);
  color: #1b4332;
  line-height: 1.2;
}
.exp-badge__pct { font-weight: 700; font-size: .9rem; }
.exp-badge__note {
  font-size: .62rem;
  font-family: var(--font-th);
  white-space: nowrap;
}
.exp-card__img-tags {
  position: absolute; top: .7rem; right: .7rem;
  display: flex; flex-direction: column; align-items: flex-end; gap: .3rem;
}
.exp-card__img-tag {
  background: rgba(255,255,255,.88);
  backdrop-filter: blur(4px);
  color: #3d3d2b; font-size: .68rem; font-family: var(--font-th);
  padding: .2rem .55rem; border-radius: 20px;
  white-space: nowrap; font-weight: 500;
}
.exp-card__body { padding: .85rem 1rem 1rem; }
.exp-card__title {
  font-size: .95rem; font-weight: 700;
  color: var(--text); font-family: var(--font-th);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  margin-bottom: .55rem;
}
.exp-card__divider { height: 1px; background: #eee; border: none; margin: .45rem 0; }
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
  font:inherit;
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
