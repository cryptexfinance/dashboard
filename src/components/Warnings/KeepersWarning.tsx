import React, { useContext, useState } from "react";
import Alert from "react-bootstrap/Alert";
import { useLocation } from "react-router-dom";
import { isInLayer1 } from "../../utils/utils";
import { networkContext } from "../../state";

const KeepersWarning = () => {
  const location = useLocation();
  const currentNetwork = useContext(networkContext);
  const [showWarning, setShowWarning] = useState(true);

  return (
    <>
      {showWarning &&
        !isInLayer1(currentNetwork.chainId) &&
        location.pathname === "/governance" && (
          <Alert
            onClose={() => {
              setShowWarning(false);
            }}
            dismissible
          >
            <b>Please switch to mainnet network to be able to delegate CTX to Crypt Keepers.</b>
          </Alert>
        )}
    </>
  );
};

export default KeepersWarning;
