import React, { useContext, useState } from "react";
import Alert from "react-bootstrap/esm/Alert";
import { useLocation } from "react-router-dom";
import { isInLayer1 } from "../../utils/utils";
import { networkContext } from "../../state";

const FarmWarning = () => {
  const location = useLocation();
  const currentNetwork = useContext(networkContext);
  const [showWarning, setShowWarning] = useState(true);

  return (
    <>
      {showWarning && !isInLayer1(currentNetwork.chainId) && location.pathname === "/farm" && (
        <Alert
          onClose={() => {
            setShowWarning(false);
          }}
          dismissible
        >
          <b>Liquidity incentives are only available ethereum mainnet network.</b>
        </Alert>
      )}
    </>
  );
};

export default FarmWarning;
