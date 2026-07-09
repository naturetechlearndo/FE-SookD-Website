import Footer from './Footer';
import { SITE_CONTENT as c } from '../constants/content';

interface MembershipPageProps {
  lang?: 'TH' | 'ENG';
}

const TIERS = [
  {
    name: 'Nature',
    img: '/img/sookd card.png',
    points: '0–199',
    benefits: [
      { th: 'สะสม SookD Point ทุกการเดินทาง', en: 'Earn SookD Points every trip' },
      { th: 'รับ Welcome Gift จากคุณชุมชนท้องถิ่น', en: 'Receive a Welcome Gift from local communities' },
      { th: 'บันทึกและติดตามผลกระทบเชิงบวกต่อธรรมชาติและชุมชน', en: 'Track your positive impact on nature & communities' },
    ],
  },
  {
    name: 'Silver',
    img: '/img/silver-removebg-preview.png',
    points: '200–499',
    benefits: [
      { th: 'สะสม SookD Point ทุกการเดินทาง', en: 'Earn SookD Points every trip' },
      { th: 'รับส่วนลดพิเศษ 5% ทุกการสั่งซื้อ', en: '5% special discount on every order', bold: true },
      { th: 'รับ Welcome Gift จากคุณชุมชนท้องถิ่น', en: 'Receive a Welcome Gift from local communities' },
      { th: 'รับ Signature Drink จากชุมชนท้องถิ่น', en: 'Signature Drink from local communities', bold: true },
      { th: 'บันทึกและติดตามผลกระทบเชิงบวกต่อธรรมชาติและชุมชน', en: 'Track your positive impact on nature & communities' },
    ],
  },
  {
    name: 'Gold',
    img: '/img/gold-removebg-preview.png',
    points: '500–999',
    benefits: [
      { th: 'สะสม SookD Point ทุกการเดินทาง', en: 'Earn SookD Points every trip' },
      { th: 'รับส่วนลดพิเศษ 10% ทุกการสั่งซื้อ', en: '10% special discount on every order', bold: true },
      { th: 'รับ Welcome Gift จากคุณชุมชนท้องถิ่น', en: 'Receive a Welcome Gift from local communities' },
      { th: 'รับ Signature Drink จากชุมชนท้องถิ่น', en: 'Signature Drink from local communities' },
      { th: 'บันทึกและติดตามผลกระทบเชิงบวกต่อธรรมชาติและชุมชน', en: 'Track your positive impact on nature & communities' },
    ],
  },
  {
    name: 'Legend',
    img: '/img/legend-removebg-preview.png',
    points: '1,000+',
    benefits: [
      { th: 'สะสม SookD Point ทุกการเดินทาง', en: 'Earn SookD Points every trip' },
      { th: 'รับส่วนลดพิเศษ 20% ทุกการสั่งซื้อ', en: '20% special discount on every order', bold: true },
      { th: 'รับ Welcome Gift จากคุณชุมชนท้องถิ่น', en: 'Receive a Welcome Gift from local communities' },
      { th: 'รับ Signature Drink จากชุมชนท้องถิ่น', en: 'Signature Drink from local communities' },
      { th: 'บันทึกและติดตามผลกระทบเชิงบวกต่อธรรมชาติและชุมชน', en: 'Track your positive impact on nature & communities' },
      { th: 'เชิญเข้าร่วม Exclusive Event', en: 'Invitation to Exclusive Events', bold: true },
    ],
  },
];

const RULES_TH = [
  'บัญชีนึงคูณหลายบัญชีไม่สามารถสะสม SookD Point ได้',
  'ทุกการใช้จ่าย 10 บาท รับ 1 SookD Point',
  'SookD Point จะคำนวณจากยอดใช้จ่ายหลังหักส่วนลด',
  'SookD Point ไม่สามารถแลกเปลี่ยนหรือถอนคืนเป็นเงินสดได้',
];

const RULES_EN = [
  'One account per person — multiple accounts cannot accumulate SookD Points.',
  'Every 10 THB spent earns 1 SookD Point.',
  'SookD Points are calculated from the amount paid after discounts.',
  'SookD Points cannot be exchanged for or redeemed as cash.',
];

export default function MembershipPage({ lang = 'TH' }: MembershipPageProps) {
  const isTH = lang === 'TH';

  return (
    <>
      {/* ── Hero ── */}
      <section className="mem-hero">
        <div className="mem-hero__overlay" />
      </section>

      {/* ── Content ── */}
      <div className="mem-body">
        <h2 className="mem-title">Membership</h2>
        <p className="mem-desc">
          {isTH ? (
            <>
              ยิ่งคุณออกเดินทางมากขึ้น คุณยิ่งได้รับสิทธิพิเศษที่มากขึ้น<br />
              พร้อมร่วมเป็นส่วนหนึ่งในการสร้างผลกระทบเชิงบวกต่อธรรมชาติ<br />
              SookD Membership มอบสิทธิประโยชน์พิเศษมากมาย และรางวัลสำหรับทุกก้าวของการเดินทางของคุณอย่างยั่งยืน
            </>
          ) : (
            <>
              The more you travel, the more exclusive benefits you receive.<br />
              Join us in creating a positive impact on nature and communities.<br />
              SookD Membership offers special privileges and rewards for every step of your sustainable journey.
            </>
          )}
        </p>

        {/* ── Table ── */}
        <div className="mem-table-wrap">
          <table className="mem-table">
            <thead>
              <tr>
                <th>{isTH ? 'สมาชิก' : 'Membership'}</th>
                <th>{isTH ? 'สิทธิประโยชน์' : 'Benefits'}</th>
                <th>SookD Points</th>
              </tr>
            </thead>
            <tbody>
              {TIERS.map(tier => (
                <tr key={tier.name}>
                  <td className="mem-td-card">
                    <img src={tier.img} alt={tier.name} className="mem-tier-card" />
                  </td>
                  <td className="mem-td-benefits">
                    <ol>
                      {tier.benefits.map((b, i) => (
                        <li key={i} style={b.bold ? { fontWeight: 700 } : {}}>
                          {isTH ? b.th : b.en}
                        </li>
                      ))}
                    </ol>
                  </td>
                  <td className="mem-td-points">{tier.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Rules ── */}
        <div className="mem-rules">
          <h3 className="mem-rules-title">
            {isTH ? 'ข้อกำหนดการสะสมแนะนำ:' : 'Point Accumulation Rules:'}
          </h3>
          <ol className="mem-rules-list">
            {(isTH ? RULES_TH : RULES_EN).map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ol>
        </div>
      </div>

      <div className="section-gap" />
      <Footer data={c.footer} />
    </>
  );
}

export const MEMBERSHIP_CSS = `
.mem-hero {
  position: relative;
  height: 420px;
  background: url('/img/memberhead.jpg') center/cover no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding-top: 64px;
}
.mem-hero__overlay {
  position: absolute;
  inset: 0;
  background: rgba(20, 35, 20, 0.35);
}
.mem-hero__cards {
  position: relative;
  z-index: 1;
  width: 480px;
  height: 280px;
}
.mem-card {
  position: absolute;
  width: 210px;
  border-radius: 14px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.45);
  object-fit: cover;
}
.mem-card--nature { top: 20px;  left: 30px;   transform: rotate(-12deg); }
.mem-card--silver { top: 10px;  right: 20px;  transform: rotate(8deg); }
.mem-card--gold   { bottom: 0;  left: 60px;   transform: rotate(5deg); }
.mem-card--legend { bottom: 10px; right: 0;   transform: rotate(-8deg); }

.mem-body {
  max-width: 860px;
  margin: 0 auto;
  padding: 48px 24px 24px;
}
.mem-title {
  text-align: center;
  font-size: 2rem;
  font-weight: 700;
  color: #1b3a2d;
  margin-bottom: 16px;
  font-family: Georgia, serif;
}
.mem-desc {
  text-align: center;
  color: #4a5568;
  line-height: 1.8;
  font-size: .95rem;
  margin-bottom: 36px;
}
.mem-table-wrap {
  overflow-x: auto;
  border-radius: 8px;
  border: 1px solid #d1d5db;
}
.mem-table {
  width: 100%;
  border-collapse: collapse;
  font-size: .9rem;
}
.mem-table thead th {
  background: #f9fafb;
  padding: 14px 16px;
  text-align: center;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #d1d5db;
  border-right: 1px solid #d1d5db;
}
.mem-table thead th:last-child { border-right: none; }
.mem-table tbody tr {
  border-bottom: 1px solid #e5e7eb;
}
.mem-table tbody tr:last-child { border-bottom: none; }
.mem-table tbody td {
  padding: 20px 16px;
  vertical-align: middle;
  color: #374151;
  border-right: 1px solid #e5e7eb;
}
.mem-table tbody td:last-child { border-right: none; }
.mem-td-card {
  text-align: center;
  width: 180px;
}
.mem-tier-card {
  width: 150px;
  object-fit: contain;
}
.mem-td-benefits ol {
  margin: 0;
  padding-left: 18px;
  line-height: 1.9;
}
.mem-td-points {
  text-align: center;
  font-weight: 700;
  color: #1b3a2d;
  font-size: 1rem;
  white-space: nowrap;
  width: 120px;
}
.mem-rules {
  margin-top: 40px;
  padding: 0 4px;
}
.mem-rules-title {
  font-size: .95rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 10px;
}
.mem-rules-list {
  padding-left: 20px;
  color: #4a5568;
  font-size: .88rem;
  line-height: 2;
}

@media (max-width: 600px) {
  .mem-hero__cards { width: 320px; height: 200px; }
  .mem-card { width: 148px; }
  .mem-card--nature { top: 14px;  left: 16px; }
  .mem-card--silver { top: 6px;   right: 10px; }
  .mem-card--gold   { bottom: 0;  left: 36px; }
  .mem-card--legend { bottom: 6px; right: 0; }
  .mem-td-card { width: 120px; }
  .mem-tier-card { width: 110px; }
}
`;
