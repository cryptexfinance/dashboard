import React from "react";
import logo from "../assets/images/logo.svg";
import "../styles/loading.scss";

type props = {
  title?: string;
  message?: string;
  position?: string;
};

const Loading = ({ title, message, position }: props) => {
  const lng = localStorage.getItem("language");

  const translateTitle = () => {
    switch (lng) {
      case "en":
        return "Loading";
      case "zh":
        return "加载中";
      default:
        return "Loading";
    }
  };

  const translateMsg = () => {
    switch (lng) {
      case "en":
        return "Please Wait";
      case "zh":
        return "请等待";
      default:
        return "Please Wait";
    }
  };

  return (
    <div className={`loading-modal ${position}`}>
      <img src={logo} alt="tcap logo" className="breathing-icon" height="70" />
      <h4 className="">{title || translateTitle()}</h4>
      <p>{message || translateMsg()}</p>
    </div>
  );
};

export default Loading;
