import React, { useContext, useState } from "react";
import Alert from "react-bootstrap/esm/Alert";
import { useLocation } from "react-router-dom";
import { isInLayer1 } from "../../utils/utils";
import { networkContext } from "../../state";

const SewageFruitzWarning = () => {
  const location = useLocation();
  const currentNetwork = useContext(networkContext);
  const [showWarning, setShowWarning] = useState(true);

  return (
    <>
      {showWarning &&
        !isInLayer1(currentNetwork.chainId) &&
        location.pathname === "/sewagefruitz" && (
          <Alert
            onClose={() => {
              setShowWarning(false);
            }}
            dismissible
          >
            <b>Please switch to mainnet network to continue your Sewage Fruitz quest.</b>
          </Alert>
        )}
    </>
  );
};

export default SewageFruitzWarning;
