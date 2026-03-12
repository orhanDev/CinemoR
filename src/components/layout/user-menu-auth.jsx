import React from "react";
import { Dropdown, Badge } from "react-bootstrap";
import { FaUser, FaTicketAlt, FaSignOutAlt, FaHeart, FaHistory, FaQuestionCircle } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { useCartStore } from "../../store/cartStore";

const getDisplayName = (user) => {
  if (!user) return "";
  const first = user.firstName || user.first_name;
  if (first) return first;
  const name = user.name || user.fullName || user.full_name;
  if (name) return String(name).trim().split(/\s+/)[0] || "";
  const username = user.username || user.userName;
  if (username) return username;
  if (user.email) return user.email.split("@")[0];
  return "";
};

export const UserMenuAuth = ({ user, logout }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { clearCart } = useCartStore();
  const displayName = getDisplayName(user);
  
  const handleLogout = () => {
    clearCart();
    logout(() => navigate('/'));
  };
  
  return (
    <Dropdown className="user-dropdown">
      <Dropdown.Toggle variant="link" className="user-dropdown-toggle" id="user-dropdown">
        <span className="user-menu-label">{t("usermenu.hallo")}, {displayName || t("usermenu.myAccount")}</span>
      </Dropdown.Toggle>

      <Dropdown.Menu className="user-dropdown-menu">
        <Dropdown.Header className="user-dropdown-header">
          <div className="user-header-info">
            <strong>{t("usermenu.hallo")}, {displayName || t("usermenu.user")}</strong>
            <small className="user-email d-block">{user?.email}</small>
          </div>
        </Dropdown.Header>
        
        <Dropdown.Divider />
        
        <Dropdown.Item as="div" className="dropdown-item-custom">
          <Link to="/profile" className="dropdown-link">
            <FaUser className="dropdown-icon" />
            {t("usermenu.profile")}
          </Link>
        </Dropdown.Item>
        
        <Dropdown.Item as="div" className="dropdown-item-custom">
          <Link to="/my-tickets" className="dropdown-link">
            <FaTicketAlt className="dropdown-icon" />
            {t("usermenu.myTickets")}
            <Badge bg="primary" className="ms-2">2</Badge>
          </Link>
        </Dropdown.Item>
        
        <Dropdown.Item as="div" className="dropdown-item-custom">
          <Link to="/favorites" className="dropdown-link">
            <FaHeart className="dropdown-icon" />
            {t("usermenu.favorites")}
          </Link>
        </Dropdown.Item>
        
        <Dropdown.Item as="div" className="dropdown-item-custom">
          <Link to="/booking-history" className="dropdown-link">
            <FaHistory className="dropdown-icon" />
            {t("usermenu.history")}
          </Link>
        </Dropdown.Item>
        
        <Dropdown.Item as="div" className="dropdown-item-custom">
          <Link to="/help" className="dropdown-link">
            <FaQuestionCircle className="dropdown-icon" />
            {t("usermenu.info")}
          </Link>
        </Dropdown.Item>
        
        <Dropdown.Divider />
        
        <Dropdown.Item 
          className="dropdown-item-custom logout-item" 
          onClick={handleLogout}
        >
          <FaSignOutAlt className="dropdown-icon" />
          {t("usermenu.logout")}
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};
