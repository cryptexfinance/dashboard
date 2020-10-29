import React from "react";
import Nav from "react-bootstrap/esm/Nav";
import "../styles/sidebar.scss";
import { Link } from "react-router-dom";
import { ReactComponent as Logo } from "../assets/images/favicon.svg";
import { ReactComponent as DashboardIcon } from "../assets/images/welcome/dashboard.svg";
import { ReactComponent as VaultIcon } from "../assets/images/welcome/vault.svg";
import { ReactComponent as FaucetIcon } from "../assets/images/welcome/faucet.svg";
import { ReactComponent as LogoutIcon } from "../assets/images/welcome/logout.svg";
import { ReactComponent as GraphIcon } from "../assets/images/welcome/graph.svg";

const Sidebar = () => (
  <Nav className="sidebar">
    <Nav.Item className="mt-4 mb-1">
      <Logo />
    </Nav.Item>
    <Nav.Item>
      <Link to="/" className="active">
        <DashboardIcon />
      </Link>
    </Nav.Item>
    <Nav.Item>
      <Link to="/graph">
        <GraphIcon />
      </Link>
    </Nav.Item>
    <Nav.Item>
      <Link to="/vault">
        <VaultIcon />
      </Link>
    </Nav.Item>
    <Nav.Item>
      <Link to="/dashboard">
        <FaucetIcon />
      </Link>
    </Nav.Item>
    <Nav.Item>
      <Link to="/dashboard">
        <LogoutIcon />
      </Link>
    </Nav.Item>
  </Nav>
);

export default Sidebar;
