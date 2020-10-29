import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Container from "react-bootstrap/esm/Container";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Welcome from "./components/Welcome";
import Graph from "./components/Graph";
import Vault from "./components/Vault";

const App = () => (
  <Router>
    <Sidebar />
    <Container fluid className="wrapper">
      <Header />
      <Switch>
        <Route path="/" exact>
          <Welcome />
        </Route>
        <Route path="/graph" exact>
          <Graph />
        </Route>
        <Route path="/vault" exact>
          <Vault />
        </Route>
      </Switch>
    </Container>
  </Router>
);

export default App;
