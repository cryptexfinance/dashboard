import React, { useContext, useEffect, useState } from "react";
// import { Spinner } from "react-bootstrap/esm/";
import "../../styles/summary.scss";
import { signerContext } from "../../state";
import Features from "./Features";
import Summary from "./Summary";
import { NETWORKS } from "../../utils/constants";

const SummaryPage = () => {
  const signer = useContext(signerContext);
  const [loading, setLoading] = useState(true);
  const [signerAddress, setSignerAddress] = useState("");
  const [signerChainId, setSignerChainId] = useState(
    process.env.REACT_APP_NETWORK_ID === "1" ? NETWORKS.mainnet.chainId : NETWORKS.goerli.chainId
  );

  useEffect(() => {
    const load = async () => {
      if (signer.signer) {
        setSignerAddress(await signer.signer.getAddress());
        setSignerChainId(await signer.signer.getChainId());
      }
      setLoading(false);
    };
    load();
    // eslint-disable-next-line
  }, [signer.signer]);

  return (
    <div className="dashboard">
      <Features />
      {!loading && <Summary signerAddress={signerAddress} signerChainId={signerChainId} />}
    </div>
  );
};

export default SummaryPage;
