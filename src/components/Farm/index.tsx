import React, { useContext } from "react";
import Row from "react-bootstrap/esm/Row";
import { useTranslation } from "react-i18next";
import { useMediaQuery } from "react-responsive";
import { networkContext, signerContext } from "../../state";
import UniV3Rewards from "./UniV3Rewards/index";
import LiquidityRewards from "./LiquidityRewards/index";
import "../../styles/farm.scss";
import { NETWORKS } from "../../utils/constants";

const Farm = () => {
  const { t } = useTranslation();
  const isMobile = useMediaQuery({ query: "(max-width: 600px)" });
  const currentNetwork = useContext(networkContext);
  const signer = useContext(signerContext);

  return (
    <div className="farm">
      <div>
        {!isMobile ? (
          <h3>
            <>{t("farming.farming")}</>
          </h3>
        ) : (
          <h5>Uniswap V3 Liquidity Rewards</h5>
        )}
        <Row className="card-wrapper">
          <UniV3Rewards signer={signer} />
          {currentNetwork.chainId === NETWORKS.mainnet.chainId && <LiquidityRewards />}
        </Row>
      </div>
    </div>
  );
};

export default Farm;
