import React from "react";
import Nav from "react-bootstrap/esm/Nav";
import "../styles/sidebar.scss";
import { ReactComponent as Logo } from "../assets/images/favicon.svg";
import { ReactComponent as DashboardIcon } from "../assets/images/welcome/dashboard.svg";
import { ReactComponent as VaultIcon } from "../assets/images/welcome/vault.svg";
import { ReactComponent as FaucetIcon } from "../assets/images/welcome/faucet.svg";
import { ReactComponent as LogoutIcon } from "../assets/images/welcome/logout.svg";
import { ReactComponent as GraphIcon } from "../assets/images/welcome/graph.svg";

const Sidebar = () => (
  <Nav
    className="sidebar"
    activeKey="/home"
    onSelect={(selectedKey) => alert(`selected ${selectedKey}`)}
  >
    <Nav.Item className="mt-4 mb-1">
      <Logo />
    </Nav.Item>
    <Nav.Item>
      <Nav.Link href="/home">
        <DashboardIcon />
      </Nav.Link>
    </Nav.Item>
    <Nav.Item>
      <Nav.Link eventKey="link-1">
        <VaultIcon />
      </Nav.Link>
    </Nav.Item>
    <Nav.Item>
      <Nav.Link eventKey="link-1">
        <GraphIcon />
      </Nav.Link>
    </Nav.Item>
    <Nav.Item>
      <Nav.Link eventKey="link-2">
        <FaucetIcon />
      </Nav.Link>
    </Nav.Item>
    <Nav.Item>
      <Nav.Link eventKey="link-1">
        <LogoutIcon />
      </Nav.Link>
    </Nav.Item>
  </Nav>
);

export default Sidebar;
