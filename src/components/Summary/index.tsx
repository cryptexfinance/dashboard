import React from "react";
import "../../styles/summary.scss";
import Features from "./Features";
import Summary from "./Summary";

type props = {
  signerAddress: string;
};

const SummaryPage = ({ signerAddress }: props) => (
  <div className="dashboard">
    <Features />
    <Summary signerAddress={signerAddress} />
  </div>
);

export default SummaryPage;
