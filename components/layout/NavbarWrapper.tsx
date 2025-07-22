import React from "react";
import Navbar from "./Navbar";
import { usePathname } from "next/navigation";

const NavbarWrapper: React.FC = () => {
  const pathname = usePathname();
  // Only show Navbar on /admin/dashboard and /student/events (and its subpages)
  const showNavbar =
    pathname === "/admin/dashboard" ||
    pathname.startsWith("/student/events");

  if (!showNavbar) return null;
  return <Navbar />;
};

export default NavbarWrapper; 