import React from "react";
import Nav from "react-bootstrap/esm/Nav";
import "../styles/topbar.scss";
import { ReactComponent as Logo } from "../assets/images/logo.svg";
import { ReactComponent as MenuLogo } from "../assets/images/menu.svg";

type props = {
  showSidebar: boolean;
  setShowSidebar: (showSidebar: boolean) => void;
  isMobile: boolean;
};

const Topbar = ({ showSidebar, setShowSidebar, isMobile }: props) => {
  const topbarClass = () => {
    if (!isMobile) return "topbar hidden";
    if (showSidebar) return "topbar slide-in";
    return "topbar slide-out";
  };

  return (
    <>
      <Nav className={topbarClass()}>
        <Nav.Item className="menu" onClick={() => setShowSidebar(false)}>
          <MenuLogo />
        </Nav.Item>
        <Nav.Item className="logo">
          <Logo />
        </Nav.Item>
      </Nav>
    </>
  );
};

export default Topbar;
