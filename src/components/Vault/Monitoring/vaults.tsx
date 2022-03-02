import React from "react";
import Table from "react-bootstrap/Table";
import { ReactComponent as TcapIcon } from "../../../assets/images/tcap-coin.svg";
import { capitalize, CollateralIcon, VaultsType } from "./types";

type dataType = {
  vaults: Array<VaultsType>;
};

export const Vaults = ({ vaults }: dataType) => {
  console.log("a");
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
          console.log("enter");
          return (
            <tr key={index}>
              <td>
                <div className="status">
                  <span className={v.status}>{capitalize(v.status)}</span>
                </div>
              </td>
              <td>
                <div className="collateral">
                  <span className="number">{v.collateralValue}</span>
                  <CollateralIcon name={v.collateralSymbol.toLowerCase()} />
                </div>
              </td>
              <td>
                <div className="collateral-usd">
                  <span className="number">${v.collateralUsd}</span>
                </div>
              </td>
              <td>
                <div className="debt">
                  <span className="number">{v.debt}</span>
                </div>
              </td>
              <td>
                <div className="debt">
                  <span className="number">${v.debtUsd}</span>
                </div>
              </td>
              <td>
                <div className="ratio">
                  <span className={v.status}>
                    {v.ratio}
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
