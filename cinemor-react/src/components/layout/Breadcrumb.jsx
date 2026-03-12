"use client";
import React from "react";
import { Breadcrumb as BootstrapBreadcrumb } from "react-bootstrap";
import Link from "next/link";
import { FaHome, FaChevronRight } from "react-icons/fa";
import { usePathname } from "next/navigation";
import "./Breadcrumb.scss";

const Breadcrumb = ({ customItems = null }) => {
  const pathname = usePathname();

  if (pathname === "/") return null;

  const generateBreadcrumbItems = () => {
    if (customItems) return customItems;

    const pathSegments = pathname.split("/").filter(Boolean);
    const items = [{ label: "Startseite", href: "/" }];

    let currentPath = "";
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      const labelMap = {
        movies: "Filme",
        cinemas: "Kinos", 
        halls: "Säle",
        campaigns: "Aktionen",
        events: "Events",
        profile: "Profil",
        "my-tickets": "Meine Tickets",
        favorites: "Favoriten",
        "booking-history": "Buchungsverlauf",
        payment: "Zahlung",
        "seat-selection": "Sitzplatzwahl",
        login: "Anmelden",
        register: "Registrieren",
        "im-kino": "Im Kino",
        bald: "Bald"
      };

      const label = labelMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
      
      items.push({
        label,
        href: index === pathSegments.length - 1 ? null : currentPath,
      });
    });

    return items;
  };

  const breadcrumbItems = generateBreadcrumbItems();

  return (
    <div className="modern-breadcrumb">
      <BootstrapBreadcrumb>
        {breadcrumbItems.map((item, index) => (
          <BootstrapBreadcrumb.Item
            key={index}
            active={!item.href}
            className={!item.href ? "active-item" : ""}
          >
            {item.href ? (
              <Link href={item.href} className="breadcrumb-link">
                {index === 0 && <FaHome className="home-icon me-1" />}
                {item.label}
              </Link>
            ) : (
              <span className="current-page">
                {item.label}
              </span>
            )}
          </BootstrapBreadcrumb.Item>
        ))}
      </BootstrapBreadcrumb>
    </div>
  );
};

export default Breadcrumb;
