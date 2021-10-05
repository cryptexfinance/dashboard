import React, { useContext, useState } from "react";
import Nav from "react-bootstrap/esm/Nav";
import "../styles/sidebar.scss";
import { Link, useLocation } from "react-router-dom";
import { Web3ModalContext } from "../state/Web3ModalContext";
import { ReactComponent as Logo } from "../assets/images/favicon.svg";
import { ReactComponent as MenuLogo } from "../assets/images/menu.svg";
import { ReactComponent as DashboardIcon } from "../assets/images/welcome/dashboard.svg";
import { ReactComponent as VaultIcon } from "../assets/images/welcome/vault.svg";
import { ReactComponent as PoolsIcon } from "../assets/images/welcome/pool.svg";
import { ReactComponent as LogoutIcon } from "../assets/images/welcome/logout.svg";
import { ReactComponent as GraphIcon } from "../assets/images/welcome/graph.svg";
import { ReactComponent as StakeIcon } from "../assets/images/welcome/stake.svg";
import { ReactComponent as FarmIcon } from "../assets/images/welcome/farm.svg";

type props = {
  showSidebar: boolean;
  setShowSidebar: (showSidebar: boolean) => void;
  isMobile: boolean;
};

const Sidebar = ({ showSidebar, setShowSidebar, isMobile }: props) => {
  const location = useLocation();
  let activeVal = "dashboard";
  switch (location.pathname) {
    case "/":
      activeVal = "dashboard";
      break;
    case "/vault":
      activeVal = "vault";
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
    default:
      activeVal = "dashboard";
      break;
  }
  const [active, setActive] = useState(activeVal);
  const web3Modal = useContext(Web3ModalContext);
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
          {active === "dashboard" ? (
            <Link
              to="/"
              className="active"
              onClick={() => {
                setActive("dashboard");
              }}
            >
              <DashboardIcon />
            </Link>
          ) : (
            <Link
              to="/"
              onClick={() => {
                setActive("dashboard");
              }}
            >
              <DashboardIcon />
            </Link>
          )}
        </Nav.Item>
        <Nav.Item>
          {active === "vault" ? (
            <Link
              to="/vault"
              className="active"
              onClick={() => {
                setActive("vault");
              }}
            >
              <VaultIcon />
            </Link>
          ) : (
            <Link
              to="/vault"
              onClick={() => {
                setActive("vault");
              }}
            >
              <VaultIcon />
            </Link>
          )}
        </Nav.Item>
        <Nav.Item>
          {active === "pools" ? (
            <Link
              to="/pools"
              className="active"
              onClick={() => {
                setActive("pools");
              }}
            >
              <PoolsIcon />
            </Link>
          ) : (
            <Link
              to="/pools"
              onClick={() => {
                setActive("pools");
              }}
            >
              <PoolsIcon />
            </Link>
          )}
        </Nav.Item>
        <Nav.Item>
          {active === "farm" ? (
            <Link
              to="/farm"
              className="active"
              onClick={() => {
                setActive("farm");
              }}
            >
              <FarmIcon />
            </Link>
          ) : (
            <Link
              to="/farm"
              onClick={() => {
                setActive("farm");
              }}
            >
              <FarmIcon />
            </Link>
          )}
        </Nav.Item>
        <Nav.Item>
          {active === "governance" ? (
            <Link
              to="/governance"
              className="active"
              onClick={() => {
                setActive("governance");
              }}
            >
              <StakeIcon className="governance" />
            </Link>
          ) : (
            <Link
              to="/governance"
              onClick={() => {
                setActive("governance");
              }}
            >
              <StakeIcon className="governance" />
            </Link>
          )}
        </Nav.Item>
        <Nav.Item>
          {active === "graph" ? (
            <Link
              to="/graph"
              className="active"
              onClick={() => {
                setActive("graph");
              }}
            >
              <GraphIcon />
            </Link>
          ) : (
            <Link
              to="/graph"
              onClick={() => {
                setActive("graph");
              }}
            >
              <GraphIcon />
            </Link>
          )}
        </Nav.Item>
        <Nav.Item>
          <Link
            to=""
            onClick={(event) => {
              event.preventDefault();
              web3Modal.clearCachedProvider();
              window.location.reload();
            }}
          >
            <LogoutIcon />
          </Link>
        </Nav.Item>
      </Nav>
    </>
  );
};

export default Sidebar;
