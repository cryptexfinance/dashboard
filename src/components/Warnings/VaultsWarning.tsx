import React, { useState } from "react";
import Alert from "react-bootstrap/esm/Alert";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

const VaultsWarning = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [showWarning, setShowWarning] = useState(true);

  return (
    <>
      {showWarning && location.pathname === "/vaults" && (
        <Alert
          onClose={() => {
            setShowWarning(false);
            localStorage.setItem("alert", "false");
          }}
          dismissible
        >
          <b>
            <>{t("vault-warning")}</>
          </b>
        </Alert>
      )}
    </>
  );
};

export default VaultsWarning;
