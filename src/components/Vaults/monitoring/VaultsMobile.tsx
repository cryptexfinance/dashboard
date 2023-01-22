import React, { useContext, useState } from "react";
import { Button, Card } from "react-bootstrap/esm";
import NumberFormat from "react-number-format";
import { networkContext } from "../../../state";
import {
  capitalize,
  TokenIcon,
  getMinRatio,
  getCollateralPrice,
  findNewArbitrumVaultCollateral,
  findNewMainnetVaultCollateral,
  findNewOptimismVaultCollateral,
  VAULT_STATUS,
} from "../common";
import { PaginationType, VaultsType, VaultToUpdateType } from "../types";
import { TOKENS_SYMBOLS } from "../../../utils/constants";
import { isArbitrum, isInLayer1, numberFormatStr } from "../../../utils/utils";

export const VaultsMobile = () => {
  const currentNetwork = useContext(networkContext);

  return (
    <div className="vaults-mobile">
      <Card className="vault">
        <Card.Body>
          <div className="vault-assets">
            <div className="asset-box">
              <h6>Index</h6>
              <div className="asset index">
                <TokenIcon name={TOKENS_SYMBOLS.TCAP} />
                <h5>TCAP</h5>
              </div>
            </div>
            <div className="asset-box collateral">
              <h6>Collateral</h6>
              <div className="asset">
                <TokenIcon name={TOKENS_SYMBOLS.WETH} />
                <h5>WETH</h5>
              </div>
            </div>
          </div>
          <div className="vault-values collateral">
            <div className="title">
              <h6>Collateral:</h6>
            </div>
            <div className="values">
              <h5 className="number neon-green">
                <NumberFormat value="100" displayType="text" thousandSeparator decimalScale={2} />
              </h5>
              <h5 className="number neon-blue">
                <NumberFormat value="11000" displayType="text" thousandSeparator decimalScale={2} />
              </h5>
            </div>
          </div>
          <div className="vault-values debt">
            <div className="title">
              <h6>Debt:</h6>
            </div>
            <div className="values">
              <h5 className="number neon-green">
                <NumberFormat value="100" displayType="text" thousandSeparator decimalScale={2} />
              </h5>
              <h5 className="number neon-blue">
                <NumberFormat value="11000" displayType="text" thousandSeparator decimalScale={2} />
              </h5>
            </div>
          </div>
          <div className="vault-values ratio">
            <div className="title">
              <h6>Ratio:</h6>
            </div>
            <div className="values status">
              <h5 className="number empty">
                <NumberFormat
                  value="110"
                  displayType="text"
                  thousandSeparator
                  decimalScale={2}
                  suffix="%"
                />
              </h5>
              <span className="empty">Empty</span>
            </div>
          </div>
        </Card.Body>
        <Card.Footer className="vault-actions">
          <Button className="empty">Go to Vault</Button>
        </Card.Footer>
      </Card>
      <Card className="vault">
        <Card.Body>
          <div className="vault-assets">
            <div className="asset-box">
              <h6>Index</h6>
              <div className="asset index">
                <TokenIcon name={TOKENS_SYMBOLS.TCAP} />
                <h5>TCAP</h5>
              </div>
            </div>
            <div className="asset-box collateral">
              <h6>Collateral</h6>
              <div className="asset">
                <TokenIcon name={TOKENS_SYMBOLS.WETH} />
                <h5>WETH</h5>
              </div>
            </div>
          </div>
          <div className="vault-values collateral">
            <div className="title">
              <h6>Collateral:</h6>
            </div>
            <div className="values">
              <h5 className="number neon-green">
                <NumberFormat value="100" displayType="text" thousandSeparator decimalScale={2} />
              </h5>
              <h5 className="number neon-blue">
                <NumberFormat value="11000" displayType="text" thousandSeparator decimalScale={2} />
              </h5>
            </div>
          </div>
          <div className="vault-values debt">
            <div className="title">
              <h6>Debt:</h6>
            </div>
            <div className="values">
              <h5 className="number neon-green">
                <NumberFormat value="100" displayType="text" thousandSeparator decimalScale={2} />
              </h5>
              <h5 className="number neon-blue">
                <NumberFormat value="11000" displayType="text" thousandSeparator decimalScale={2} />
              </h5>
            </div>
          </div>
          <div className="vault-values ratio">
            <div className="title">
              <h6>Ratio:</h6>
            </div>
            <div className="values status">
              <h5 className="number liquidation">
                <NumberFormat
                  value="110"
                  displayType="text"
                  thousandSeparator
                  decimalScale={2}
                  suffix="%"
                />
              </h5>
              <span className="liquidation">In Liquidation</span>
            </div>
          </div>
        </Card.Body>
        <Card.Footer className="vault-actions two">
          <Button className="liquidation">Liquidate</Button>
          <Button>Go to Vault</Button>
        </Card.Footer>
      </Card>
    </div>
  );
};
