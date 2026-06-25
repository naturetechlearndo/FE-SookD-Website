import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import StartJourney from './components/StartJourney';
import NatureQuote from './components/NatureQuote';
import PursuitFeeling from './components/PursuitFeeling';
import LuxuryTravel from './components/LuxuryTravel';
import SocialImpact from './components/SocialImpact';
import Footer from './components/Footer';
import ExperiencesPage, { EXPERIENCES_CSS } from './components/ExperiencesPage';
import ActivityDetailPage, { ACTIVITY_DETAIL_CSS } from './components/ActivityDetailPage';
import ProductDetailPage, { PRODUCT_DETAIL_CSS } from './components/ProductDetailPage';
import { SITE_CONTENT as c } from './constants/content';

type Page = 'home' | 'experiences' | 'activity-detail' | 'product-detail';

export default function App() {
  const [page, setPage] = useState<Page>('home');
  const [selectedActivityId, setSelectedActivityId] = useState<string>('');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [prevPage, setPrevPage] = useState<Page>('experiences');

  useEffect(() => {
    window.history.replaceState({ page: 'home' }, '');
    const handlePop = (e: PopStateEvent) => {
      const s = e.state;
      if (!s?.page) { setPage('home'); return; }
      if (s.activityId) setSelectedActivityId(s.activityId);
      if (s.productId) setSelectedProductId(s.productId);
      if (s.prevPage) setPrevPage(s.prevPage);
      setPage(s.page);
    };
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  function navigate(p: string) {
    window.history.pushState({ page: p }, '');
    setPage(p as Page);
  }

  function openActivity(id: string) {
    setSelectedActivityId(id);
    window.history.pushState({ page: 'activity-detail', activityId: id }, '');
    setPage('activity-detail');
  }

  function openProduct(id: string, from: Page = 'activity-detail') {
    setSelectedProductId(id);
    setPrevPage(from);
    window.history.pushState({ page: 'product-detail', productId: id, prevPage: from }, '');
    setPage('product-detail');
  }

  return (
    <>
      <style>{CSS}</style>
      <style>{EXPERIENCES_CSS}</style>
      <style>{ACTIVITY_DETAIL_CSS}</style>
      <style>{PRODUCT_DETAIL_CSS}</style>
      <Navbar links={c.navLinks} onNavigate={navigate} currentPage={page} lightTop={page !== 'home'} />

      {page === 'product-detail' ? (
        <ProductDetailPage productId={selectedProductId} onBack={() => setPage(prevPage)} onSelectProduct={(id) => openProduct(id, prevPage)} />
      ) : page === 'activity-detail' ? (
        <ActivityDetailPage activityId={selectedActivityId} onBack={() => setPage('experiences')} onSelectProduct={(id) => openProduct(id, 'activity-detail')} />
      ) : page === 'experiences' ? (
        <ExperiencesPage onSelectActivity={openActivity} />
      ) : (
        <main>
          <Hero heading={c.hero.heading} subheading={c.hero.subheading} />

          {/* ── Section gap ── */}
          <div className="section-gap" />
          <StartJourney heading={c.journey.heading} cards={c.journey.cards} />
          <div className="section-gap" />

          <NatureQuote heading={c.natureQuote.heading} subtext={c.natureQuote.subtext} />
          <PursuitFeeling
            heading={c.pursuit.heading}
            body={c.pursuit.body}
            ctaLabel={c.pursuit.ctaLabel}
            ctaHref={c.pursuit.ctaHref}
          />
          {/* Pursuit → Luxury ไม่มี gap เพราะ Luxury image อยู่ซ้าย ต่อเนื่องกัน */}
          <LuxuryTravel heading={c.luxury.heading} body={c.luxury.body} />
          <div className="section-gap" />

          <SocialImpact
            heading={c.socialImpact.heading}
            subheading={c.socialImpact.subheading}
            stats={c.socialImpact.stats}
          />
          <div className="section-gap" />
          <Footer data={c.footer} />
        </main>
      )}
    </>
  );
}

const CSS = `
/* ── Tokens ─────────────────────────────────────────────────── */
:root {
  --forest:  #1b4332;
  --teal:    #2d6a4f;
  --mint:    #40916c;
  --cta-bg:  #2d6a4f;
  --white:   #ffffff;
  --cream:   #f9f9f7;
  --stone:   #666;
  --text:    #222;
  --font-th: 'Sarabun', 'Noto Sans Thai', sans-serif;
  --font-en: 'Inter', 'Helvetica Neue', Arial, sans-serif;
  --r: 14px;
  --ease: 0.28s ease;
  --section-gap: 100px;
}

/* ── Reset ───────────────────────────────────────────────────── */
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{font-family:var(--font-en);color:var(--text);background:var(--white);line-height:1.65;-webkit-font-smoothing:antialiased}
a{text-decoration:none;color:inherit}
ul{list-style:none}
img{display:block;max-width:100%}
address{font-style:normal}

/* ── Section gap spacer ──────────────────────────────────────── */
.section-gap { height: var(--section-gap); background: var(--white); }

/* ── Navbar ──────────────────────────────────────────────────── */
.navbar {
  position: fixed; top:0; left:0; right:0; z-index:200;
  display: flex; align-items:center;
  padding: 0 2.5rem;
  height: 64px;
  background: transparent;
  transition: background var(--ease), box-shadow var(--ease);
}
.navbar--scrolled {
  background: var(--white);
  box-shadow: 0 1px 12px rgba(0,0,0,.08);
}
.navbar--scrolled .navbar__link { color: var(--forest); }
.navbar--scrolled .navbar__link:hover { color: var(--mint); }
.navbar--scrolled .navbar__lang { color: var(--forest); }

.navbar__logo { display:flex; align-items:center; flex-shrink:0; }
.navbar__logo-img { height:44px; width:44px; object-fit:contain; }

.navbar__links {
  display:flex; gap:3rem;
  position:absolute; left:50%; transform:translateX(-50%);
}
.navbar__link {
  font-size:.95rem; font-weight:500;
  color: rgba(255,255,255,.92);
  transition: color var(--ease);
  white-space:nowrap;
}
.navbar__link:hover { color: var(--white); opacity:.75; }
.navbar__link--active { text-decoration: underline; text-underline-offset: 4px; }

.navbar__right { display:flex; align-items:center; gap:1rem; margin-left:auto; }
.navbar__lang {
  background:none; border:none; cursor:pointer;
  color:rgba(255,255,255,.9); display:flex; align-items:center;
  transition:color var(--ease);
}
.navbar__divider { width:1px; height:28px; background:rgba(255,255,255,.35); }
.navbar--scrolled .navbar__divider { background: rgba(0,0,0,.15); }
.navbar__cta {
  padding:.45rem 1.4rem;
  background: var(--cta-bg);
  color: var(--white);
  border-radius:6px;
  font-size:.9rem; font-weight:600;
  transition: background var(--ease);
}
.navbar__cta:hover { background:#1b5e3d; }

/* ── Hero ────────────────────────────────────────────────────── */
.hero {
  position:relative;
  height:100vh; min-height:600px;
  display:flex; align-items:flex-end;
  padding-bottom:6vh;
  overflow:hidden;
}
.hero__bg {
  position:absolute; inset:0;
  background: url('/img/hero-bg.jpg') center/cover no-repeat;
  background-color: #1b3a2f;
}
.hero__content {
  position:relative; z-index:1;
  padding: 0 3.5rem;
}
.hero__heading {
  font-size: clamp(3rem,7vw,5.5rem);
  font-weight:700; color:var(--white);
  line-height:1; letter-spacing:-.01em;
  margin-bottom:.6rem;
  font-family: var(--font-en);
}
.hero__subheading {
  font-size:1.05rem; color:rgba(255,255,255,.9);
  font-family: var(--font-th);
}
.hero__mascot {
  position:absolute; bottom:0; right:3rem;
  height:180px; object-fit:contain;
  z-index:2;
}

/* ── Journey ─────────────────────────────────────────────────── */
.journey {
  position:relative;
  padding: 0 5%;
  background:var(--white);
  text-align:center;
}
.journey__heading {
  font-size:1.9rem; font-weight:600;
  color:var(--forest); margin-bottom:.75rem;
}
.journey__divider {
  width:320px; height:1px;
  background:linear-gradient(to right,transparent,#b5c4b1,transparent);
  margin:0 auto 3.5rem;
}
.journey__cards {
  display:grid; grid-template-columns:repeat(3,1fr);
  gap:1.5rem; max-width:1100px; margin:0 auto;
}
.journey__card {
  position:relative; border-radius:var(--r); overflow:hidden;
  display:block;
  transition:transform var(--ease), box-shadow var(--ease);
}
.journey__card:hover { transform:translateY(-5px); box-shadow:0 16px 40px rgba(0,0,0,.18); }
.journey__card-img {
  width:100%; aspect-ratio:3/4; object-fit:cover; display:block;
}
.journey__card-overlay {
  position:absolute; inset:0;
  background:rgba(0,0,0,0);
  transition:background var(--ease);
  border-radius:var(--r);
}
.journey__card:hover .journey__card-overlay {
  background:rgba(0,0,0,.28);
}
.journey__card-label {
  position:absolute; bottom:1.2rem; left:1.25rem;
  font-size:1.35rem; font-weight:600; color:var(--white);
  text-shadow:0 1px 6px rgba(0,0,0,.5);
  z-index:1;
}
.journey__mascot {
  position:absolute; bottom:0; right:2rem;
  height:130px; object-fit:contain; pointer-events:none;
}

/* ── Nature Quote ────────────────────────────────────────────── */
.nature-quote {
  position:relative;
  min-height:340px;
  display:flex; align-items:center; justify-content:center;
  text-align:center;
  background: url('/img/nature-quote-bg.jpg') center/cover no-repeat;
  background-color:#2d4a3e;
}
.nature-quote__overlay {
  position:absolute; inset:0;
  background:rgba(30,50,38,.48);
}
.nature-quote__content { position:relative; z-index:1; padding:4rem 2rem; }
.nature-quote__heading {
  font-size:clamp(1.75rem,3.5vw,2.6rem);
  font-weight:600; color:var(--white);
  margin-bottom:.75rem;
}
.nature-quote__sub {
  font-size:1rem; color:rgba(255,255,255,.82);
  font-family:var(--font-th);
}

/* ── Pursuit of Feeling ──────────────────────────────────────── */
.pursuit {
  display:grid; grid-template-columns:1fr 1fr;
  min-height:500px;
}
.pursuit__text {
  padding:5rem 5% 5rem 6%;
  display:flex; flex-direction:column; justify-content:center;
  background:var(--white);
}
.pursuit__heading {
  font-size:1.75rem; font-weight:700;
  color:var(--text); margin-bottom:1.25rem;
}
.pursuit__body {
  font-size:.97rem; color:#555; line-height:1.75;
  margin-bottom:2.5rem; max-width:460px;
}
.pursuit__cta {
  display:inline-block; align-self:flex-start;
  padding:.6rem 1.75rem;
  border:1.5px solid var(--forest);
  color:var(--forest);
  border-radius:6px;
  font-size:.9rem; font-weight:600;
  transition:background var(--ease),color var(--ease);
}
.pursuit__cta:hover { background:var(--forest); color:var(--white); }
.pursuit__image {
  background:url('/img/pursuit-river.jpg') center/cover no-repeat;
  background-color:#2d4a3e;
  min-height:420px;
}

/* ── Luxury Travel ───────────────────────────────────────────── */
.luxury {
  display:grid; grid-template-columns:1fr 1fr;
  min-height:460px;
}
.luxury__image {
  background:url('/img/luxury-local.jpg') center/cover no-repeat;
  background-color:#3a4a3e;
  min-height:400px;
}
.luxury__text {
  padding:5rem 6% 5rem 5%;
  display:flex; flex-direction:column; justify-content:center;
  background:var(--white);
}
.luxury__heading {
  font-size:1.6rem; font-weight:700;
  color:var(--text); margin-bottom:1.25rem;
}
.luxury__body {
  font-size:.97rem; color:#555; line-height:1.75;
  max-width:420px;
  text-align:center;
}

/* ── Social Impact ───────────────────────────────────────────── */
.impact {
  position:relative;
  padding:5rem 5%;
  text-align:center;
  background:url('/img/social-impact-bg.jpg') center/cover no-repeat;
  background-color:#2d4a2e;
}
.impact__overlay {
  position:absolute; inset:0;
  background:rgba(10,30,15,.25);
}
.impact__content { position:relative; z-index:1; }
.impact__heading {
  font-size:2rem; font-weight:700; color:var(--white);
  margin-bottom:.75rem;
}
.impact__sub {
  font-size:.95rem; color:rgba(255,255,255,.85);
  max-width:640px; margin:0 auto 3rem;
  font-family:var(--font-th); line-height:1.7;
}
.impact__stats {
  display:flex; flex-wrap:wrap;
  justify-content:center; gap:1.5rem;
}
.impact__card {
  background:rgba(200,220,200,.45);
  backdrop-filter:blur(10px);
  -webkit-backdrop-filter:blur(10px);
  border-radius:20px;
  padding:2.5rem 2rem 1.5rem;
  width:220px; min-height:160px;
  display:flex; flex-direction:column; align-items:center; gap:.5rem;
}
.impact__value {
  font-size:2.6rem; font-weight:700;
  color:var(--forest); line-height:1;
}
.impact__label {
  font-size:.85rem; color:var(--forest);
  font-family:var(--font-th); text-align:center; line-height:1.4;
}

/* ── Footer ──────────────────────────────────────────────────── */
.footer { background:#1b4332; color:rgba(255,255,255,.85); padding:3.5rem 5% 1.5rem; }
.footer__inner {
  display:grid; grid-template-columns:auto 2fr 1.5fr 1.5fr;
  gap:2.5rem 3rem; align-items:start;
  margin-bottom:2.5rem;
}
.footer__logo-img { width:110px; height:110px; object-fit:contain; border-radius:50%; }
.footer__brand-name { font-size:1.35rem; font-weight:700; color:var(--white); margin-bottom:.75rem; }
.footer__brand-desc { font-size:.83rem; line-height:1.75; color:rgba(255,255,255,.75); font-family:var(--font-th); }
.footer__col-title { font-size:1rem; font-weight:700; color:var(--white); margin-bottom:.9rem; }
.footer__address { font-size:.85rem; line-height:2; color:rgba(255,255,255,.75); font-family:var(--font-th); }
.footer__contact-list { display:flex; flex-direction:column; gap:.55rem; }
.footer__contact-item { display:flex; align-items:center; gap:.6rem; font-size:.88rem; }
.footer__contact-icon { font-size:1rem; }
.footer__contact-link { color:rgba(255,255,255,.8); transition:color var(--ease); }
.footer__contact-link:hover { color:var(--white); }
.footer__col--contact { position:relative; padding-bottom:6rem; }
.footer__mascot {
  position:absolute; bottom:-1.5rem; right:-1rem;
  height:140px; object-fit:contain; pointer-events:none;
}
.footer__bottom {
  border-top:1px solid rgba(255,255,255,.12);
  padding-top:1.25rem; text-align:center;
  font-size:.82rem; color:rgba(255,255,255,.55);
}

/* ── Responsive ──────────────────────────────────────────────── */
@media(max-width:1024px){
  .navbar__links{gap:2rem}
  .journey__cards{gap:1rem}
  .footer__inner{grid-template-columns:1fr 1fr}
  :root{--section-gap:60px}
}
@media(max-width:768px){
  .navbar__links{display:none}
  .hero__mascot{height:110px}
  .journey__cards{grid-template-columns:1fr}
  .pursuit{grid-template-columns:1fr}
  .pursuit__image{min-height:280px;order:-1}
  .luxury{grid-template-columns:1fr}
  .luxury__image{min-height:280px}
  .impact__card{width:160px}
  .footer__inner{grid-template-columns:1fr 1fr}
  .footer__logo-col{display:none}
  :root{--section-gap:48px}
}
@media(max-width:480px){
  .footer__inner{grid-template-columns:1fr}
  :root{--section-gap:32px}
}
@media(prefers-reduced-motion:reduce){
  *,*::before,*::after{transition:none!important}
}
`;
