import React, { useContext, useState } from "react";
import Alert from "react-bootstrap/esm/Alert";
import { useLocation } from "react-router-dom";
import { isOptimism } from "../../utils/utils";
import { networkContext } from "../../state";

const FarmWarning = () => {
  const location = useLocation();
  const currentNetwork = useContext(networkContext);
  const [showWarning, setShowWarning] = useState(true);

  return (
    <>
      {showWarning && isOptimism(currentNetwork.chainId) && location.pathname === "/farm" && (
        <Alert
          onClose={() => {
            setShowWarning(false);
          }}
        >
          <b>Liquidity incentives are not available on Optimism.</b>
        </Alert>
      )}
    </>
  );
};

export default FarmWarning;
