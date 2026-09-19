// Server Component — can safely read ADMIN_SECRET_ROUTE without exposing it to the browser.
// It passes the secret to the client Navbar purely as a prop for pathname matching.
import React from "react";
import Navbar from "./Navbar";

const NavbarWrapper: React.FC = () => {
  const adminSecretRoute = (process.env.ADMIN_SECRET_ROUTE ?? "").trim().replace(/^["']|["']$/g, '');
  return <Navbar adminSecretRoute={adminSecretRoute} />;
};

export default NavbarWrapper;