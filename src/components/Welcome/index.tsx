import React from "react";
import "../../styles/summary.scss";
import Features from "./Features";
import Summary from "./Summary";

type props = {
  signerAddress: string;
  loadingContracts: boolean;
};

const WelcomeWrapper = ({ signerAddress, loadingContracts }: props) => (
  <div className="dashboard">
    <Features />
    <Summary signerAddress={signerAddress} loadingContracts={loadingContracts} />
  </div>
);

export default WelcomeWrapper;
