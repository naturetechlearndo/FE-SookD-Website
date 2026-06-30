import type { FooterData } from '../types';

interface FooterProps {
  data: FooterData;
}

export default function Footer({ data }: FooterProps) {
  return (
    <footer className="footer">
      <div className="footer__inner">
        {/* Logo col */}
        <div className="footer__logo-col">
          {/* logo circle image: /img/logo-circle.png  (วงกลมสีเขียว + ใบไม้/ภูเขา) */}
          <img src="/img/logo.png" alt="SookD" className="footer__logo-img" />
        </div>

        {/* Brand description col */}
        <div className="footer__brand-col">
          <h3 className="footer__brand-name">{data.brand.name}</h3>
          <p className="footer__brand-desc">{data.brand.tagline}</p>
        </div>

        {/* Address col */}
        <div className="footer__col">
          <h4 className="footer__col-title">Address</h4>
          <address className="footer__address">
            {data.address.lines.map((line, i) => (
              <span key={i}>{line}<br /></span>
            ))}
          </address>
        </div>

        {/* Contact col + mascot */}
        <div className="footer__col footer__col--contact">
          <h4 className="footer__col-title">Contact Us</h4>
          <ul className="footer__contact-list">
            {data.contact.items.map((item) => (
              <li key={item.label} className="footer__contact-item">
                <span className="footer__contact-icon">{item.icon}</span>
                <a href={item.href} className="footer__contact-link">{item.label}</a>
              </li>
            ))}
          </ul>
          {/* Mascot big — /img/mascot-big.png */}
          <img src="/img/mascot-big.png" alt="" className="footer__mascot" aria-hidden="true" />
        </div>
      </div>

      <div className="footer__bottom">
        <p>{data.copyright}</p>
      </div>
    </footer>
  );
}
