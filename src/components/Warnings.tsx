import React, { useEffect, useState } from "react";
import Alert from "react-bootstrap/esm/Alert";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Warnings = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [vaultWarning, setVaultWarning] = useState(true);
  const [showBeta, setShowBeta] = useState(true);

  useEffect(() => {
    const savedAlert = localStorage.getItem("alert");
    if (savedAlert) setShowBeta(false);
  }, [location]);

  return (
    <>
      {showBeta && (
        <Alert
          onClose={() => {
            setShowBeta(false);
            localStorage.setItem("alert", "false");
          }}
          dismissible
        >
          <b>💀 {t("warning")}</b>
        </Alert>
      )}
      {vaultWarning && location.pathname === "/vault" && (
        <Alert
          onClose={() => {
            setVaultWarning(false);
            localStorage.setItem("alert", "false");
          }}
          dismissible
        >
          <b>{t("vault-warning")}</b>
        </Alert>
      )}
    </>
  );
};

export default Warnings;
