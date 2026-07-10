import Footer from './Footer';
import ContactIcon from './ContactIcon';
import { SITE_CONTENT as c } from '../constants/content';

const ADDRESS_EN = [
  '68/7 Moo 3, Bangkobua Sub-district',
  'Phra Pradaeng District',
  'Samut Prakan 10130',
];

export default function AboutPage({ lang = 'TH' }: { lang?: 'TH' | 'ENG' }) {
  const isTH = lang === 'TH';
  return (
    <>
      <style>{ABOUT_CSS}</style>

      {/* ── Hero ── */}
      <section className="about__hero">
        <div className="about__hero-overlay" />
        <h1 className="about__hero-title">SookD</h1>
      </section>

      {/* ── About ── */}
      <section className="about__section about__intro">
        <h2 className="about__section-title about__section-title--center">SookD</h2>
        <p className="about__intro-text about__intro-text--center">
          {isTH ? (
            <>
              SookD ก่อตั้งเมื่อปี 2566 มุ่งเชื่อมนักเดินทางกับประสบการณ์ที่มีความหมายทุกแห่งหน
              <br /><br />
              ผ่านการท่องเที่ยวและวัฒนธรรมการเรียนรู้ที่เชื่อมโยงกับธรรมชาติ ผู้คน และความสุขอย่างลึกซึ้ง
              เรามั่นใจว่าการท่องเที่ยวที่มีคุณค่าควรสร้างความสัมพันธ์อย่างแท้จริง
              และช่วยให้ทุกคนมีส่วนในการดูแลสิ่งแวดล้อม
              <br /><br />
              ด้วยการคัดสรรประสบการณ์คุณภาพจากผู้ให้บริการที่ใส่ใจสิ่งชีวิตผู้คน ชุมชน และสิ่งแวดล้อม
            </>
          ) : (
            <>
              Founded in 2023, SookD is dedicated to connecting travelers with meaningful experiences everywhere they go.
              <br /><br />
              Through travel and cultural learning rooted in a deep connection with nature, people, and happiness,
              we believe that meaningful tourism should foster genuine relationships and empower everyone to contribute to environmental preservation.
              <br /><br />
              By curating quality experiences from providers who care for individuals, communities, and the environment.
            </>
          )}
        </p>

        <div className="about__pillars">
          {[
            { src: '/img/environment.aboutus.jpg', label: 'Environment' },
            { src: '/img/education.aboutus.jpg',   label: 'Education'   },
            { src: '/img/technology.aboutus.jpg',  label: 'Technology'  },
          ].map(({ src, label }) => (
            <div key={label} className="about__pillar-card">
              <img src={src} alt={label} className="about__pillar-img" />
              <div className="about__pillar-overlay" />
              <span className="about__pillar-label">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Founder ── */}
      <section className="about__section about__founder">
        <h2 className="about__section-title">Founder</h2>
        <div className="about__founder-inner">
          <img src="/img/founder.aboutus.jpg" alt="Founder" className="about__founder-img" />
          <div className="about__founder-content">
            <blockquote className="about__founder-quote">
              {isTH ? (
                <>
                  "ความสุขจากการเดินทางที่แท้จริง<br />
                  คือการได้เป็นส่วนหนึ่งของการของบริษัท และการได้ค้นพบตัวเองที่เราไปถึงมัน"
                </>
              ) : (
                '"The true joy of traveling is becoming a part of the world we inhabit and discovering who we are when we get there."'
              )}
            </blockquote>
            <p className="about__founder-name">
              {isTH
                ? 'ทวินทร์ ธรรมรักษ์ – ผู้ก่อตั้ง และ CEO SookD'
                : 'Twin Thammarak – Founder & CEO of SookD'}
            </p>
            <p className="about__founder-bio">
              {isTH
                ? 'ด้วยความเชื่อว่าการท่องเที่ยวที่มีความหมายต้องเริ่มจากการเข้าใจธรรมชาติ SookD จึงถือกำเนิดขึ้น เพื่อเชื่อมนักเดินทางกับประสบการณ์ที่เปลี่ยนมุมมองและสร้างผลดีต่อชุมชนท้องถิ่น'
                : 'With the belief that meaningful travel must begin with an understanding of nature, SookD was born to connect travelers with perspective-shifting experiences that create a positive impact on local communities.'}
            </p>
          </div>
        </div>
      </section>

      {/* ── Partner ── */}
      <div className="about__partner-section">
        <img src="/img/partner.aboutus.jpg" alt="Partners" className="about__partner-img" />
      </div>

      {/* ── Location ── */}
      <section className="about__section about__location">
        <h2 className="about__section-title">{isTH ? 'ตำแหน่ง' : 'Location'}</h2>
        <div className="about__location-inner">
          <a
            href="https://maps.app.goo.gl/1R7yoLzSCkwhh7yXA"
            target="_blank"
            rel="noopener noreferrer"
            className="about__map-wrap"
          >
            <img src="/img/learndomap.jpg" alt="SookD Location" className="about__map-img" />
          </a>

          <div className="about__location-info">
            <div className="about__info-block">
              <h3 className="about__info-title">{isTH ? 'ที่อยู่' : 'Address'}</h3>
              <address className="about__address">
                {(isTH ? c.footer[lang].address.lines : ADDRESS_EN).map((line, i) => (
                  <span key={i}>{line}<br /></span>
                ))}
              </address>
            </div>

            <div className="about__info-block">
              <h3 className="about__info-title">{isTH ? 'ติดต่อเรา' : 'Contact Us'}</h3>
              <ul className="about__contact-list">
                {c.footer[lang].contact.items.map(item => (
                  <li key={item.label} className="about__contact-item">
                    <span className="about__ci-icon">
                      <ContactIcon type={item.icon} size={18} color="#2d6a4f" />
                    </span>
                    <a href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined}
                       rel="noopener noreferrer" className="about__contact-link">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <div className="section-gap" />
      <Footer data={c.footer[lang]} />
    </>
  );
}

export const ABOUT_CSS = `
/* ── Hero ── */
.about__hero {
  position: relative;
  height: 420px;
  background: url('/img/technology.aboutus.jpg') center/cover no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
}
.about__hero-overlay {
  position: absolute;
  inset: 0;
  background: rgba(10, 30, 15, 0.52);
}
.about__hero-title {
  position: relative;
  z-index: 1;
  font-size: clamp(2.8rem, 7vw, 5rem);
  font-weight: 800;
  color: #fff;
  letter-spacing: .04em;
}

/* ── Sections ── */
.about__section {
  max-width: 1100px;
  margin: 0 auto;
  padding: 4rem 5%;
}
.about__section-title {
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 1.5rem;
  padding-bottom: .5rem;
  border-bottom: 2.5px solid var(--forest, #2d6a4f);
  display: inline-block;
}

/* ── Intro ── */
.about__intro-text {
  font-size: 1rem;
  color: #555;
  line-height: 1.8;
  max-width: 780px;
  font-family: var(--font-th);
  margin-bottom: 2.5rem;
}
.about__pillars {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.2rem;
}
.about__pillar-card {
  position: relative;
  aspect-ratio: 4/3;
  border-radius: 12px;
  overflow: hidden;
  cursor: default;
}
.about__pillar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform .4s ease;
}
.about__pillar-card:hover .about__pillar-img {
  transform: scale(1.04);
}
.about__pillar-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(10,30,15,.6) 0%, transparent 55%);
}
.about__pillar-label {
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  color: #fff;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: .03em;
  z-index: 1;
}

/* ── Founder ── */
.about__founder-inner {
  display: flex;
  gap: 3rem;
  align-items: flex-start;
}
.about__founder-img {
  width: 240px;
  height: 300px;
  object-fit: cover;
  border-radius: 12px;
  flex-shrink: 0;
}
.about__founder-content {
  display: flex;
  flex-direction: column;
  gap: .8rem;
  padding-top: .5rem;
}
.about__founder-quote {
  font-size: 1.1rem;
  font-style: italic;
  color: var(--text);
  line-height: 1.7;
  border-left: 3px solid var(--forest, #2d6a4f);
  padding-left: 1rem;
  margin: 0 0 .5rem;
  font-family: var(--font-th);
}
.about__founder-name {
  font-size: .95rem;
  font-weight: 700;
  color: var(--forest, #2d6a4f);
  font-family: var(--font-th);
}
.about__founder-bio {
  font-size: .9rem;
  color: #555;
  line-height: 1.75;
  font-family: var(--font-th);
}

/* ── Centered intro ── */
.about__section-title--center {
  display: block;
  text-align: center;
  border-bottom: none;
  padding-bottom: 0;
}
.about__intro-text--center {
  text-align: center;
  margin-left: auto;
  margin-right: auto;
}

/* ── Partner ── */
.about__partner-section {
  width: 100%;
  line-height: 0;
}
.about__partner-img {
  width: 100%;
  display: block;
  object-fit: cover;
}

/* ── Location ── */
.about__location-inner {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 3rem;
  align-items: start;
}
.about__map-wrap {
  display: block;
  border-radius: 12px;
  overflow: hidden;
  line-height: 0;
}
.about__map-img {
  width: 100%;
  height: 420px;
  object-fit: cover;
  display: block;
  transition: opacity .2s;
}
.about__map-wrap:hover .about__map-img { opacity: .88; }

.about__location-info {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
.about__info-block { display: flex; flex-direction: column; gap: .5rem; }
.about__info-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: .5rem;
}
.about__address {
  font-size: .95rem;
  color: #555;
  line-height: 1.9;
  font-style: normal;
  font-family: var(--font-th);
  padding-left: .25rem;
}
.about__contact-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: .85rem;
}
.about__contact-item {
  display: flex;
  align-items: center;
  gap: .75rem;
  font-size: .92rem;
}
.about__ci-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 22px;
}
.about__contact-link {
  color: #444;
  text-decoration: none;
  word-break: break-all;
}
.about__contact-link:hover { color: var(--forest, #2d6a4f); text-decoration: underline; }

/* ── Responsive ── */
@media (max-width: 768px) {
  .about__pillars { grid-template-columns: 1fr; }
  .about__founder-inner { flex-direction: column; }
  .about__founder-img { width: 100%; height: 260px; }
  .about__location-inner { grid-template-columns: 1fr; }
}
@media (max-width: 480px) {
  .about__pillars { grid-template-columns: 1fr 1fr; }
}
`;
