import { assets, copyrightLine, footerLegal, footerNav, type NavLink } from "./content";

function Link({ link }: { link: NavLink }) {
  if (link.external) {
    return (
      <a href={link.href} target="_blank" rel="noopener noreferrer">
        {link.label}
      </a>
    );
  }
  return <a href={link.href}>{link.label}</a>;
}

export function SiteFooter() {
  return (
    <footer id="footer">
      <div className="footer-logo">
        <img src={assets.footerLogo} alt="AG Live" width={120} height={52} />
      </div>

      <ul className="footer-nav">
        {footerNav.map((link) => (
          <li key={link.label}>
            <Link link={link} />
          </li>
        ))}
      </ul>

      <ul className="footer-nav footer-legal">
        {footerLegal.map((link) => (
          <li key={link.label}>
            <Link link={link} />
          </li>
        ))}
      </ul>

      <div className="footer-rule" />
      <p className="footer-copy">{copyrightLine}</p>
    </footer>
  );
}