import React from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Welcome from "./components/Welcome";

const App = () => (
  <div className="">
    <Sidebar />
    <div>
      <Header />
      <Welcome />
    </div>
  </div>
);

export default App;
