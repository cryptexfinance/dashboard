import React from "react";
import Nav from "react-bootstrap/esm/Nav";
import Button from "react-bootstrap/esm/Button";
import "../styles/header.scss";

const Header = () => (
  <Nav className="header">
    <Button variant="pink" className="neon-pink">
      Connect Wallet
    </Button>
  </Nav>
);

export default Header;
