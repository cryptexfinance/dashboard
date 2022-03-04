import React from "react";
import Table from "react-bootstrap/Table";
import OverlayTrigger from "react-bootstrap/esm/OverlayTrigger";
import Tooltip from "react-bootstrap/esm/Tooltip";
import { ReactComponent as TcapIcon } from "../../../assets/images/tcap-coin.svg";
import { PaginationType, VaultsType } from "./types";
import { capitalize, CollateralIcon, numberFormatStr } from "./common";

type dataType = {
  vaults: Array<VaultsType>;
  pagination: PaginationType;
};

export const Vaults = ({ vaults, pagination }: dataType) => {
  console.log("vaults ---");
  return (
    <Table hover className="mt-2 vaults">
      <thead>
        <tr>
          <th className="status">Status</th>
          <th className="collateral">Collateral</th>
          <th className="collateral-usd">Collateral (USD)</th>
          <th>
            <div className="debt">
              <TcapIcon className="tcap" /> <span>Debt</span>
            </div>
          </th>
          <th className="debt-usd">Debt (USD)</th>
          <th className="ratio">Ratio</th>
        </tr>
      </thead>
      <tbody>
        {vaults.map((v, index) => {
          const itemPage = Math.ceil((index + 1) / pagination.itemsPerPage);
          return (
            <tr key={index} className={pagination.current === itemPage ? "show" : "hide"}>
              <td>
                <div className="status">
                  <span className={v.status}>{capitalize(v.status)}</span>
                </div>
              </td>
              <td>
                <div className="collateral">
                  <OverlayTrigger
                    key="top"
                    placement="right"
                    trigger={["hover", "click"]}
                    overlay={
                      <Tooltip id="ttip-current-reward" className="farm-tooltip">
                        {v.collateralValue}
                      </Tooltip>
                    }
                  >
                    <>
                      <span className="number">{numberFormatStr(v.collateralValue, 4)}</span>
                      <CollateralIcon name={v.collateralSymbol.toLowerCase()} />
                    </>
                  </OverlayTrigger>
                </div>
              </td>
              <td>
                <div className="collateral-usd">
                  <span className="number">${numberFormatStr(v.collateralUsd, 2)}</span>
                </div>
              </td>
              <td>
                <div className="debt">
                  <span className="number">{numberFormatStr(v.debt, 4)}</span>
                </div>
              </td>
              <td>
                <div className="debt">
                  <span className="number">${numberFormatStr(v.debtUsd, 2)}</span>
                </div>
              </td>
              <td>
                <div className="ratio">
                  <span className={v.status}>
                    {v.ratio.toFixed(0)}
                    {v.ratio === 0 ? "" : "%"}
                  </span>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
};
