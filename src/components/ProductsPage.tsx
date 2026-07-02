import { useState, useEffect, useRef } from 'react';
import Footer from './Footer';
import { SITE_CONTENT as c } from '../constants/content';
import { api } from '../services/api';

function driveThumb(url: string): string {
  const m = url?.match(/\/d\/([^/]+)\//);
  if (m) {
    const driveUrl = encodeURIComponent(`https://drive.google.com/thumbnail?id=${m[1]}&sz=w400`);
    return `https://res.cloudinary.com/zgor0mh6/image/fetch/w_400,q_auto,f_auto/${driveUrl}`;
  }
  return url || '';
}

interface ProductsPageProps {
  onSelectProduct: (id: string) => void;
}

const VISIBLE_COUNT = 6;

export default function ProductsPage({ onSelectProduct }: ProductsPageProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [activeOrigin, setActiveOrigin] = useState('ทั้งหมด');
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.products.getAll()
      .then(setProducts)
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

  const origins = ['ทั้งหมด', ...Array.from(new Set(
    products.flatMap(p => p.origin?.split(',').map((o: string) => o.trim()) ?? [])
  ))];

  const filtered = products.filter(p => {
    const matchSearch =
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.note?.toLowerCase().includes(search.toLowerCase()) ||
      p.origin?.toLowerCase().includes(search.toLowerCase());
    const matchOrigin =
      activeOrigin === 'ทั้งหมด' ||
      p.origin?.split(',').map((o: string) => o.trim()).includes(activeOrigin);
    return matchSearch && matchOrigin;
  });

  const visible = showAll ? filtered : filtered.slice(0, VISIBLE_COUNT);

  return (
    <>
      <div className="exp-page">
        {/* Hero */}
        <section className="exp-hero prod-hero">
          <div className="exp-hero__overlay" />
          <div className="exp-hero__content">
            <h1 className="exp-hero__heading">Local Products</h1>
            <p className="exp-hero__sub">สินค้าท้องถิ่นคุณภาพจากชุมชน</p>
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
              placeholder="Search"
              value={search}
              onChange={e => { setSearch(e.target.value); setShowAll(false); }}
            />
          </div>
        </div>

        {/* Filter / Sort bar */}
        <div className="exp-filterbar-wrap">
          <div className="exp-filterbar">
            <div className="exp-filterbar__right">
              <div className="exp-filter-dd" ref={filterRef}>
                <button className="exp-filterbar__btn" onClick={() => setFilterOpen(o => !o)}>
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
                    {origins.map(o => (
                      <button key={o}
                        className={`exp-dropdown__item${activeOrigin === o ? ' active' : ''}`}
                        onClick={() => { setActiveOrigin(o); setFilterOpen(false); setShowAll(false); }}>
                        {activeOrigin === o && (
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                        {o}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="exp-filterbar__sep" />
              <button className="exp-filterbar__btn">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="6" x2="21" y2="6" /><line x1="6" y1="12" x2="18" y2="12" /><line x1="10" y1="18" x2="14" y2="18" />
                </svg>
                Sort
              </button>
            </div>
          </div>
        </div>

        {loading && <p className="exp-state">กำลังโหลดสินค้า...</p>}
        {error && <p className="exp-state exp-state--error">{error}</p>}

        {!loading && !error && (
          <>
            <div className="exp-grid">
              {visible.map(p => (
                <ProductCard key={p.id} product={p} onClick={() => onSelectProduct(p.id)} />
              ))}
            </div>

            {filtered.length === 0 && (
              <p className="exp-state">ไม่พบสินค้าที่ตรงกับการค้นหา</p>
            )}

            {filtered.length > VISIBLE_COUNT && (
              <div className="exp-more-wrap">
                <button className="exp-more-btn" onClick={() => setShowAll(!showAll)}>
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
      <Footer data={c.footer} />
    </>
  );
}

function ProductCard({ product: p, onClick }: { product: any; onClick: () => void }) {
  const tags = p.origin?.split(',').map((o: string) => o.trim()) ?? [];
  const imgSrc = driveThumb(p.image);

  return (
    <div className="exp-card" onClick={onClick} role="button" tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick()}>
      <div className="exp-card__img-wrap">
        <img src={imgSrc} alt={p.name} className="exp-card__img" loading="lazy"
          onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
        {tags.length > 0 && (
          <div className="exp-card__img-tags">
            {tags.slice(0, 2).map((t: string) => (
              <span key={t} className="exp-card__img-tag">#{t}</span>
            ))}
          </div>
        )}
      </div>
      <div className="exp-card__body">
        <h3 className="exp-card__title">{p.name}</h3>
        <div className="exp-card__divider" />
        <div className="exp-card__meta">
          <span className="exp-card__duration">สินค้าคงเหลือ: {p.remain ?? 0}</span>
          <span className="exp-card__price">{Number(p.price).toLocaleString()} Baht</span>
        </div>
        <div className="exp-card__divider" />
        <p className="exp-card__desc">
          {p.note?.replace(/\n/g, ' ').slice(0, 90)}{p.note?.length > 90 ? '…' : ''}
        </p>
      </div>
    </div>
  );
}

export const PRODUCTS_CSS = `
.prod-hero {
  background-image: url('/img/local.jpg') !important;
  background-color: #3d2b1a !important;
}
`;
