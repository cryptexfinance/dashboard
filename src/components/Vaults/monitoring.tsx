import React, { useContext, useRef, useState } from "react";
import { Card, Row } from "react-bootstrap/esm";
import Col from "react-bootstrap/Col";
// import Spinner from "react-bootstrap/Spinner";
import { useTranslation } from "react-i18next";

import { useRatios } from "./useRatios";
import { usePrices } from "./usePrices";
import { getMinRatio, getCollateralPrice, VAULT_STATUS } from "./common";
import { DropdownItemType, PaginationType, VaultsTotalsType, VaultsType } from "./types";

const pagDefault = {
  previous: 0,
  current: 0,
  next: 0,
  pages: 0,
  lastDataPage: 0,
  itemsPerPage: 10,
  itemsCount: 0,
  lastId: "0",
};

const totalsDefault = {
  vaults: 0,
  collateral: "0",
  collateralUSD: "0",
  debt: "0",
  debtUSD: "0",
};

type liqVaultsTempType = {
  vaultId: string;
  vaultType: string;
  decimals: number;
  hardVault: boolean;
};

const showAllVaults = true;

type props = {
  ownerAddress: string;
};

const Monitoring = ({ ownerAddress }: props) => {
  const { t } = useTranslation();
  const prices = usePrices();
  const ratios = useRatios();
  const [skipQuery, setSkipQuery] = useState(false);
  const [vaultsTotals, setVaultsTotals] = useState<VaultsTotalsType>(totalsDefault);
  const [vaultList, setVaultList] = useState<Array<VaultsType>>([]);
  const [vaultGraphList, setVaultGraphList] = useState<Array<any>>([]);
  const [pagination, setPagination] = useState<PaginationType>(pagDefault);
  const [loadMore, setLoadMore] = useState(false);
  const [filteringRatios, setFilteringRatios] = useState(false);
  const [radioValue, setRadioValue] = useState("2");
  const [tokenSymbol, setTokenSymbol] = useState("all");
  const [currentStatus, setCurrentStatus] = useState("all");
  const [vaultMode, setVaultMode] = useState("all");
  const [currentMinRatio, setCurrentMinRatio] = useState("0%");
  const [currentMaxRatio, setCurrentMaxRatio] = useState("2500%");
  const [renderTable, setRenderTable] = useState(false);
  const ratioRangeDropdown = useRef(null);
  const minRatioInput = useRef(null);
  const maxRatioInput = useRef(null);
  const radios = [
    { name: t("all-vaults"), value: "1" },
    { name: t("my-vaults"), value: "2" },
  ];
  const viewsList = [
    { key: "5", name: "5" },
    { key: "10", name: "10" },
    { key: "15", name: "15" },
    { key: "20", name: "20" },
    { key: "25", name: "25" },
    { key: "30", name: "30" },
  ];
  const statusList = [
    { key: "all", name: "All" },
    { key: VAULT_STATUS.empty, name: "Empty" },
    { key: VAULT_STATUS.ready, name: "Ready" },
    { key: VAULT_STATUS.active, name: "Active" },
    { key: VAULT_STATUS.liquidation, name: "Liquidation" },
  ];
  const modeList = [
    { key: "all", name: "All" },
    { key: "regular", name: "Regular" },
    { key: "hard", name: "Hard" },
  ];

  const buildFilters = () => {
    const weiLimit = "100000000";
    let filter = "";
    let ownerFilter = "";
    let vaultFilter = "";
    let statusFilter = "";
    let modeFilter = "";
    if (radioValue === "2" && ownerAddress !== "") {
      ownerFilter = `, owner: "${ownerAddress}"`;
    }
    if (tokenSymbol !== "all") {
      vaultFilter = `tokenSymbol: "${tokenSymbol.toUpperCase()}"`;
    }
    if (currentStatus !== "all") {
      if (currentStatus === "empty") {
        statusFilter = `collateral_lt: "${weiLimit}"`;
      }
      if (currentStatus === "ready") {
        statusFilter = `collateral_gte: "${weiLimit}", debt_lt: "${weiLimit}"`;
      }
    }
    if (vaultMode !== "all") {
      const isHard = vaultMode === "hard" ? "true" : "false";
      modeFilter = "hardVault: ".concat(isHard);
    }

    filter = ownerFilter;
    if (vaultFilter !== "") {
      filter = filter.concat(`, ${vaultFilter}`);
    }
    if (statusFilter !== "") {
      filter = filter.concat(`, ${statusFilter}`);
    }
    if (modeFilter !== "") {
      filter = filter.concat(`, ${modeFilter}`);
    }
    if (filter !== "") {
      if (loadMore) {
        filter = `, where: { blockTS_gt: "${pagination.lastId}" ${filter} }`;
      } else {
        filter = `, where: { blockTS_gt: "0" ${filter} }`;
      }
    }
    return filter;
  };

  const str =
    "query allVaults {" +
    `vaults(first: 1000, orderBy: blockTS ${buildFilters()}) {` +
    "id " +
    "vaultId " +
    "owner " +
    "collateral " +
    "debt " +
    "currentRatio " +
    "tokenSymbol " +
    "hardVault " +
    "blockTS " +
    "underlyingProtocol { " +
    "underlyingToken { " +
    "decimals " +
    "} " +
    "}" +
    "} " +
    "}";

  return (
    <div className="vault-monitoring">
      <Row className="card-wrapper">
        <Row>
          <Card className="diamond mb-2 totals">
            <Card.Header>
              <h5>
                <>{t("totals")}</>
              </h5>
            </Card.Header>
            <Card.Body>
              <Col md={12} className="totals-container">
                <Col md={3} className="total-box">
                  <h6>
                    <>{t("vaults")}</>
                  </h6>
                </Col>
                <Col md={3} className="total-box">
                  <h6>
                    <>{t("collateral")} (USD)</>
                  </h6>
                </Col>
                <Col md={3} className="total-box">
                  <div className="debt">
                    <h6>
                      <>{t("debt")}</>
                    </h6>
                  </div>
                </Col>
                <Col md={3} className="total-box">
                  <h6>
                    <>{t("debt")} (USD)</>
                  </h6>
                </Col>
              </Col>
            </Card.Body>
          </Card>
          <Card className="diamond mb-2">
            <Card.Body>
              <h3>{getMinRatio(ratios, "ETH", true).toString()}</h3>
              <h3>{getMinRatio(ratios, "ETH", false).toString()}</h3>
              <h3>{getMinRatio(ratios, "AAVE", true).toString()}</h3>
              <h3>{getCollateralPrice(prices, "DAI")}</h3>
              <h3>{getCollateralPrice(prices, "ETH")}</h3>
            </Card.Body>
          </Card>
        </Row>
      </Row>
    </div>
  );
};

export default Monitoring;
