import React, { useContext, useEffect, useState } from "react";
import Nav from "react-bootstrap/esm/Nav";
import { GiSpottedMushroom } from "react-icons/gi";
import "../styles/sidebar.scss";
import { Link, useLocation } from "react-router-dom";
import { Web3ModalContext } from "../state/Web3ModalContext";
import { networkContext } from "../state";
import { isGoerli, isInLayer1 } from "../utils/utils";
import { ReactComponent as Logo } from "../assets/images/favicon.svg";
import { ReactComponent as MenuLogo } from "../assets/images/menu.svg";
import { ReactComponent as DashboardIcon } from "../assets/images/welcome/dashboard.svg";
import { ReactComponent as VaultIcon } from "../assets/images/welcome/vault.svg";
import { ReactComponent as LogoutIcon } from "../assets/images/welcome/logout.svg";
import { ReactComponent as StakeIcon } from "../assets/images/welcome/stake.svg";
import { ReactComponent as FarmIcon } from "../assets/images/welcome/farm.svg";

type props = {
  showSidebar: boolean;
  setShowSidebar: (showSidebar: boolean) => void;
  isMobile: boolean;
};

const Sidebar = ({ showSidebar, setShowSidebar, isMobile }: props) => {
  const currentNetwork = useContext(networkContext);
  const location = useLocation();
  let activeVal = "dashboard";
  switch (location.pathname) {
    case "/":
      activeVal = "dashboard";
      break;
    case "/vault":
      activeVal = "vault";
      break;
    case "/vault-monitoring":
      activeVal = "/vault-monitoring";
      break;
    case "/graph":
      activeVal = "graph";
      break;
    case "/pools":
      activeVal = "pools";
      break;
    case "/farm":
      activeVal = "farm";
      break;
    case "/governance":
      activeVal = "governance";
      break;
    case "/sewagefruit":
      activeVal = "sewagefruit";
      break;
    default:
      activeVal = "dashboard";
      break;
  }
  const [active, setActive] = useState(activeVal);
  const web3Modal = useContext(Web3ModalContext);

  useEffect(
    () => {
      const path = window.location.pathname.replace("/", "");
      if (path !== "") {
        setActive(path);
      } else {
        setActive(activeVal);
      }
    },
    // eslint-disable-next-line
    [window.location.pathname]
  );

  const sidebarClass = () => {
    if (!isMobile) return "sidebar";
    if (showSidebar) return "sidebar mobile slide-out";
    return "sidebar mobile slide-in";
  };

  const sideBarLogo = () => {
    if (isMobile) return <MenuLogo className="menu" onClick={() => setShowSidebar(true)} />;
    return <Logo />;
  };

  return (
    <>
      <Nav className={sidebarClass()}>
        <Nav.Item className="mt-4 mb-1">{sideBarLogo()}</Nav.Item>
        <Nav.Item>
          <Link
            to="/"
            className={active === "dashboard" ? "active" : ""}
            onClick={() => {
              setActive("dashboard");
            }}
          >
            <DashboardIcon />
            <span className={active === "dashboard" ? "title active" : "title"}>Summary</span>
          </Link>
        </Nav.Item>
        <Nav.Item>
          <Link
            to="/vaults"
            className={active === "vaults" ? "active" : ""}
            onClick={() => {
              setActive("vaults");
            }}
          >
            <VaultIcon />
            <span className={active === "vaults" ? "title active" : "title"}>Vaults</span>
          </Link>
        </Nav.Item>
        {!isGoerli(currentNetwork.chainId) && (
          <Nav.Item>
            <Link
              to="/farm"
              className={active === "farm" ? "active" : ""}
              onClick={() => {
                setActive("farm");
              }}
            >
              <FarmIcon />
              <span className={active === "farm" ? "title active" : "title"}>Farm</span>
            </Link>
          </Nav.Item>
        )}
        {isInLayer1(currentNetwork.chainId) && !isGoerli(currentNetwork.chainId) && (
          <Nav.Item>
            <Link
              to="/governance"
              className={active === "governance" ? "active" : ""}
              onClick={() => {
                setActive("governance");
              }}
            >
              <StakeIcon className="governance" />
              <span className={active === "governance" ? "title active" : "title"}>Delegate</span>
            </Link>
          </Nav.Item>
        )}
        {isInLayer1(currentNetwork.chainId) && (
          <Nav.Item>
            <Link
              to="/sewagefruitz"
              className={active === "sewagefruit" ? "active" : ""}
              onClick={() => {
                setActive("sewagefruitz");
              }}
            >
              <GiSpottedMushroom size={28} className="sewagefruit" />
              <span className={active === "sewagefruitz" ? "title active" : "title"}>
                Sewagefruitz
              </span>
            </Link>
          </Nav.Item>
        )}
        <Nav.Item>
          <Link
            to=""
            onClick={(event) => {
              event.preventDefault();
              web3Modal.clearCachedProvider();
              window.location.reload();
            }}
          >
            <LogoutIcon className="logout-icon" />
            <span className="title">Disconnect</span>
          </Link>
        </Nav.Item>
      </Nav>
    </>
  );
};

export default Sidebar;
