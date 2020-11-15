import React from "react";
import logo from "../assets/images/tcap-logo.svg";
import "../styles/loading.scss";

type props = {
  title: string;
  message?: string;
  position?: string;
};

const Loading = ({ title, message, position }: props) => (
  <div className={`loading-modal ${position}`}>
    <img src={logo} alt="tcap logo" className="breathing-icon" height="70" />
    <h4 className="">{title}</h4>
    <p>{message}</p>
  </div>
);

export default Loading;
