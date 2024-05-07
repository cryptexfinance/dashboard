import React, { useContext } from "react";
import { Accordion, Col } from "react-bootstrap/esm";
import { useMediaQuery } from "react-responsive";
import { useTranslation } from "react-i18next";
import { networkContext } from "../../../state";
import { TokenIcon } from "../common";
import { VaultsTotalsType } from "../types";
import { TOKENS_SYMBOLS } from "../../../utils/constants";
import { isArbitrum, numberFormatStr } from "../../../utils/utils";

type props = {
  vaultsTotals: VaultsTotalsType;
};

const VaultsSummary = ({ vaultsTotals }: props) => {
  const { t } = useTranslation();
  const isMobile = useMediaQuery({ query: "(max-width: 850px)" });
  const currentNetwork = useContext(networkContext);

  const IndexIcon = () => {
    if (!isArbitrum(currentNetwork.chainId)) {
      return <TokenIcon name={TOKENS_SYMBOLS.TCAP} />;
    }
    return <TokenIcon name={TOKENS_SYMBOLS.JPEGz} />;
  };

  return (
    <Accordion defaultActiveKey={isMobile ? "1" : "0"} className="diamond mb-2 totals">
      <Accordion.Item eventKey="0">
        <Accordion.Header>
          <h5>
            <>{t("totals")}</>
          </h5>
        </Accordion.Header>
        <Accordion.Body>
          <Col md={12} className="totals-container">
            <Col md={3} className="total-box">
              <h6>
                <>{t("vaults")}</>
              </h6>
              <span className="number">
                {numberFormatStr(vaultsTotals.vaults.toString(), 0, 0)}
              </span>
            </Col>
            <Col md={3} className="total-box">
              <h6>
                <>{t("collateral")} (USD)</>
              </h6>
              <span className="number">${numberFormatStr(vaultsTotals.collateralUSD, 2, 2)}</span>
            </Col>
            <Col md={3} className="total-box">
              <div className="debt">
                <h6>
                  <>{t("debt")}</>
                </h6>
                <IndexIcon />
              </div>
              <span className="number">{numberFormatStr(vaultsTotals.debt, 4, 4)}</span>
            </Col>
            <Col md={3} className="total-box">
              <h6>
                <>{t("debt")} (USD)</>
              </h6>
              <span className="number">${numberFormatStr(vaultsTotals.debtUSD, 2, 2)}</span>
            </Col>
          </Col>
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
  );
};

export default VaultsSummary;
