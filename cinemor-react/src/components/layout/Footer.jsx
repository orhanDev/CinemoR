import { useLanguage } from '../../context/LanguageContext';
import './Footer.scss';

const Footer = () => {
  const { t } = useLanguage();
  return (
    <footer className="footer">
      <div className="footer__copyright">
        <p>{t("footer.copyright")}</p>
      </div>
      <div className="footer__demo">
        <p>{t("footer.demo")}</p>
      </div>
    </footer>
  );
};

export default Footer;
