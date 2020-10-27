import React from "react";
import Container from "react-bootstrap/esm/Container";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Welcome from "./components/Welcome";

const App = () => (
  <div className="">
    <Sidebar />
    <Container fluid className="wrapper">
      <Header />
      <Welcome />
    </Container>
  </div>
);

export default App;
