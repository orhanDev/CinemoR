import React from "react";
import { useAuth } from "../../context/AuthContext";
import { UserMenuAuth } from "./user-menu-auth";
import { UserMenuGuest } from "./user-menu-guest";
import { Spinner } from "react-bootstrap";

export const UserMenu = () => {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="user-menu-loading">
        <Spinner animation="border" size="sm" variant="light" />
      </div>
    );
  }

  if (user) {
    return (
      <UserMenuAuth
        user={user}
        logout={logout}
      />
    );
  }

  return <UserMenuGuest />;
};
