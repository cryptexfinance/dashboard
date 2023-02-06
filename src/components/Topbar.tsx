import React, { useState } from "react";
import Nav from "react-bootstrap/esm/Nav";
import { AiOutlineSetting } from "react-icons/ai";
// import Davatar from "@davatar/react";
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
  const [showSettings, setShowSettings] = useState(false);

  /* const copyCodeToClipboard = (e: React.MouseEvent) => {
    e.preventDefault();
    // Create new element
    const el = document.createElement("textarea");
    // Set value (string to be copied)
    el.value = "address";
    // Set non-editable to avoid focus and move outside of view
    el.setAttribute("readonly", "");
    document.body.appendChild(el);
    // Select text inside element
    el.select();
    // Copy text to clipboard
    document.execCommand("copy");
    // Remove temporary element
    document.body.removeChild(el);
  }; */

  return (
    <>
      <Nav className={topbarClass()}>
        <Nav.Item className="menu" onClick={() => setShowSidebar(false)}>
          <MenuLogo />
        </Nav.Item>
        <Nav.Item className="logo">
          <Logo />
        </Nav.Item>
        <Nav.Item className="settings">
          <AiOutlineSetting size={30} onClick={() => setShowSettings(!showSettings)} />
        </Nav.Item>
      </Nav>
      {/* showSettings && (
        <div className="top-settings">
          <div className="info-address">
            <Davatar
              size={25}
              address="0xd4fa23307a181B9ca567886eB5bCd5c8f8f8bB3E"
              generatedAvatarType="jazzicon"
              className="avatar"
            />
            <h5 className="ml-2">
              <OverlayTrigger
                key="bottom"
                placement="bottom"
                overlay={<Tooltip id="tooltip-bottom">Click to Copy</Tooltip>}
              >
                <a href="/" onClick={copyCodeToClipboard} className="address">
                  00000
                </a>
              </OverlayTrigger>
            </h5>
          </div>
          <Button className="logout">
            <LogoutIcon className="logout-icon" />
            <h6>Logout</h6>
          </Button>
        </div>
      ) */}
    </>
  );
};

export default Topbar;
