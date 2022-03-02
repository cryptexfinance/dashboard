import React, { useContext, useEffect, useState } from "react";
import { ethers, BigNumber } from "ethers";
import ButtonGroup from "react-bootstrap/esm/ButtonGroup";
import Card from "react-bootstrap/esm/Card";
import Col from "react-bootstrap/Col";
import Dropdown from "react-bootstrap/Dropdown";
import Pagination from "react-bootstrap/Pagination";
import ToggleButton from "react-bootstrap/esm/ToggleButton";
import "../../../styles/vault-monitoring.scss";
import { useQuery, gql } from "@apollo/client";
import NetworkContext from "../../../state/NetworkContext";
import OraclesContext from "../../../state/OraclesContext";
import SignerContext from "../../../state/SignerContext";
import { ReactComponent as TcapIcon } from "../../../assets/images/tcap-coin.svg";
import { getRatio2, isInLayer1, isOptimism, toUSD, validOracles } from "../../../utils/utils";
import { Vaults } from "./vaults";
import {
  capitalize,
  CollateralIcon,
  DropdownItemType,
  OraclePricesType,
  PaginationType,
  VaultsType,
} from "./types";

const pagDefault = {
  previous: 0,
  current: 0,
  next: 0,
  pages: 0,
  itemsPerPage: 20,
  itemsCount: 0,
  lastId: "",
};

export const Monitoring = () => {
  const currentNetwork = useContext(NetworkContext);
  const oracles = useContext(OraclesContext);
  const signer = useContext(SignerContext);
  const [currentAddress, setCurrentAddress] = useState("");
  const [oraclePrices, setOraclePrices] = useState<OraclePricesType>();
  const [vaults, setVaults] = useState<Array<VaultsType>>([]);
  const [pagination, setPagination] = useState<PaginationType>(pagDefault);
  const [pricesUpdated, setPricesUpdated] = useState(false);
  const [owner, setOwner] = useState("");
  const [radioValue, setRadioValue] = useState("1");
  const [tokenSymbol, setTokenSymbol] = useState("all");
  const [currentStatus, setCurrentStatus] = useState("all");
  const radios = [
    { name: "All Vaults", value: "1" },
    { name: "My Vaults", value: "2" },
  ];
  const statusList = [
    { key: "all", name: "All" },
    { key: "empty", name: "Empty" },
    { key: "ready", name: "Ready" },
    { key: "active", name: "Active" },
    { key: "liquidation", name: "Liquidation" },
  ];

  const buildFilters = () => {
    const weiLimit = "100000000";
    let filter = "";
    let ownerFilter = "";
    let vaultFilter = "";
    let statusFilter = "";
    if (radioValue === "2" && owner !== "") {
      ownerFilter = `owner: "${owner}"`;
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

    filter = ownerFilter;
    if (vaultFilter !== "") {
      filter = filter === "" ? `${vaultFilter}` : filter.concat(`, ${vaultFilter}`);
    }
    if (statusFilter !== "") {
      filter = filter === "" ? `${statusFilter}` : filter.concat(`, ${statusFilter}`);
    }
    if (filter !== "") {
      filter = `, where: { ${filter} }`;
    }

    return filter;
  };

  const str =
    "query allVaults {" +
    `vaults(first: 20 ${buildFilters()}) {` +
    "id " +
    "vaultId " +
    "owner " +
    "collateral " +
    "debt " +
    "currentRatio " +
    "tokenSymbol " +
    "} " +
    "}";

  const vaultsQuery = gql`
    ${str}
  `;

  const loadPrices = async () => {
    if (signer && oracles && validOracles(currentNetwork.chainId || 1, oracles)) {
      if (signer.signer) {
        const address = await signer.signer.getAddress();
        setCurrentAddress(address);
      }
      const tcapPriceCall = await oracles.tcapOracleRead?.getLatestAnswer();
      const daiOraclePriceCall = await oracles.daiOracleRead?.getLatestAnswer();

      const ethcalls = [tcapPriceCall, daiOraclePriceCall];
      if (isInLayer1(currentNetwork.chainId)) {
        const wethOraclePriceCall = await oracles.wethOracleRead?.getLatestAnswer();
        const aaveOraclePriceCall = await oracles.aaveOracleRead?.getLatestAnswer();
        const linkOraclePriceCall = await oracles.linkOracleRead?.getLatestAnswer();
        ethcalls.push(wethOraclePriceCall);
        ethcalls.push(aaveOraclePriceCall);
        ethcalls.push(linkOraclePriceCall);
      }
      if (isOptimism(currentNetwork.chainId)) {
        const wethOraclePriceCall = await oracles.wethOracleRead?.getLatestAnswer();
        const linkOraclePriceCall = await oracles.linkOracleRead?.getLatestAnswer();
        const snxOraclePriceCall = await oracles.snxOracleRead?.getLatestAnswer();
        const uniOraclePriceCall = await oracles.uniOracleRead?.getLatestAnswer();
        ethcalls.push(wethOraclePriceCall);
        ethcalls.push(linkOraclePriceCall);
        ethcalls.push(snxOraclePriceCall);
        ethcalls.push(uniOraclePriceCall);
      }
      let tcapOraclePrice = BigNumber.from(0);
      let wethOraclePrice = BigNumber.from(0);
      let daiOraclePrice = BigNumber.from(0);
      let aaveOraclePrice = BigNumber.from(0);
      let linkOraclePrice = BigNumber.from(0);
      let uniOraclePrice = BigNumber.from(0);
      let snxOraclePrice = BigNumber.from(0);

      if (isInLayer1(currentNetwork.chainId)) {
        // @ts-ignore
        [tcapOraclePrice, daiOraclePrice, wethOraclePrice, aaveOraclePrice, linkOraclePrice] =
          await signer.ethcallProvider?.all(ethcalls);
      } else if (isOptimism(currentNetwork.chainId)) {
        // @ts-ignore
        [
          tcapOraclePrice,
          daiOraclePrice,
          wethOraclePrice,
          linkOraclePrice,
          snxOraclePrice,
          uniOraclePrice,
        ] = await signer.ethcallProvider?.all(ethcalls);
      }

      setOraclePrices({
        tcapOraclePrice: ethers.utils.formatEther(tcapOraclePrice.mul(10000000000)),
        wethOraclePrice: ethers.utils.formatEther(wethOraclePrice.mul(10000000000)),
        daiOraclePrice: ethers.utils.formatEther(daiOraclePrice.mul(10000000000)),
        aaveOraclePrice: ethers.utils.formatEther(aaveOraclePrice.mul(10000000000)),
        linkOraclePrice: ethers.utils.formatEther(linkOraclePrice.mul(10000000000)),
        uniOraclePrice: ethers.utils.formatEther(uniOraclePrice.mul(10000000000)),
        snxOraclePrice: ethers.utils.formatEther(snxOraclePrice.mul(10000000000)),
        maticOraclePrice: "0",
        wbtcOraclePrice: "0",
      });
      setPricesUpdated(true);
    }
  };

  useEffect(
    () => {
      if (!pricesUpdated) {
        loadPrices();
      }
    },
    // eslint-disable-next-line
    [oracles, currentNetwork.chainId]
  );

  const getCollateralPrice = (symbol: string) => {
    let price = "0";
    switch (symbol) {
      case "ETH":
        price = oraclePrices?.wethOraclePrice || "0";
        break;
      case "DAI":
        price = oraclePrices?.daiOraclePrice || "0";
        break;
      case "AAVE":
        price = oraclePrices?.aaveOraclePrice || "0";
        break;
      case "LINK":
        price = oraclePrices?.linkOraclePrice || "0";
        break;
      case "UNI":
        price = oraclePrices?.uniOraclePrice || "0";
        break;
      case "SNX":
        price = oraclePrices?.snxOraclePrice || "0";
        break;
      case "MATIC":
        price = oraclePrices?.maticOraclePrice || "0";
        break;
      case "WBTC":
        price = oraclePrices?.wbtcOraclePrice || "0";
        break;
      default:
        break;
    }
    return price;
  };

  const loadVaults = async (vaultsData: any) => {
    const vData = new Array<VaultsType>();
    // @ts-ignore
    vaultsData.vaults.forEach((v) => {
      const collateral = ethers.utils.formatEther(v.collateral);
      const debt = ethers.utils.formatEther(v.debt);
      const collateralPrice = getCollateralPrice(v.tokenSymbol);
      const collateralUSD = toUSD(collateral, collateralPrice);
      const debtUSD = toUSD(debt, collateralPrice);
      const ratio = getRatio2(
        collateral,
        collateralPrice,
        debt,
        oraclePrices?.tcapOraclePrice || "1"
      );
      let status = "liquidation";
      if (collateralUSD === 0) {
        status = "empty";
      } else if (collateralUSD > 0 && debtUSD === 0) {
        status = "ready";
      } else if (ratio >= 150) {
        status = "active";
      }
      vData.push({
        id: v.id,
        collateralSymbol: v.tokenSymbol,
        collateralValue: collateral,
        collateralUsd: collateralUSD.toFixed(2),
        debt,
        debtUsd: debtUSD.toFixed(2),
        ratio,
        minRatio: "",
        status,
      });
    });
    setVaults(vData);
    const lastVaultId = vData[vData.length - 1].id;
    const itemsCount = pagination.itemsCount + vData.length;
    const pages = Math.ceil(itemsCount / pagination.itemsPerPage);
    const pag = {
      previous: 0,
      current: 1,
      next: 2,
      pages,
      itemsPerPage: pagination.itemsPerPage,
      itemsCount,
      lastId: lastVaultId,
    };
    setPagination(pag);
  };

  const { data, error } = useQuery(vaultsQuery, {
    fetchPolicy: "no-cache",
    notifyOnNetworkStatusChange: true,
    onError: () => {
      console.log(error);
    },
    onCompleted: () => {
      loadVaults(data);
    },
  });

  const tokensSymbols = (): Array<DropdownItemType> => {
    const symbols = [{ key: "all", name: "All" }];
    if (isInLayer1(currentNetwork.chainId)) {
      symbols.push({ key: "eth", name: "ETH" });
      symbols.push({ key: "weth", name: "WETH" });
      symbols.push({ key: "dai", name: "DAI" });
      symbols.push({ key: "aave", name: "AAVE" });
      symbols.push({ key: "link", name: "LINK" });
    } else if (isOptimism(currentNetwork.chainId)) {
      symbols.push({ key: "eth", name: "ETH" });
      symbols.push({ key: "dai", name: "DAI" });
      symbols.push({ key: "link", name: "LINK" });
      symbols.push({ key: "uni", name: "UNI" });
      symbols.push({ key: "snx", name: "SNX" });
    } else {
      symbols.push({ key: "matic", name: "MATIC" });
      symbols.push({ key: "dai", name: "DAI" });
    }

    return symbols;
  };

  const handleRadioBtnChange = (value: string) => {
    setRadioValue(value);
    if (value === "1") {
      setOwner("");
    } else {
      setOwner(currentAddress);
    }
  };

  const handleStatusChange = (newStatus: string) => {
    setCurrentStatus(newStatus);
  };

  const handleTokenChange = (newToken: string) => {
    setTokenSymbol(newToken);
  };

  const VaultPages = () => {
    const midPage = Math.floor(pagination.pages / 2);
    return (
      <>
        <Pagination.Item active={pagination.current === 1}>{1}</Pagination.Item>
        <Pagination.Ellipsis />
        <Pagination.Item active={pagination.current === midPage - 2}>{midPage - 2}</Pagination.Item>
        <Pagination.Item active={pagination.current === midPage - 1}>{midPage - 1}</Pagination.Item>
        <Pagination.Item active={pagination.current === midPage}>midPage</Pagination.Item>
        <Pagination.Item active={pagination.current === midPage + 1}>{midPage + 1}</Pagination.Item>
        <Pagination.Item active={pagination.current === midPage + 2}>{midPage + 2}</Pagination.Item>
        <Pagination.Ellipsis />
        <Pagination.Item active={pagination.current === pagination.pages}>
          {pagination.pages}
        </Pagination.Item>
      </>
    );
  };

  const VaultPagination = () => {
    const pag = Array.from(Array(10).keys());
    const activePag = pagination.current;
    return (
      <Pagination>
        <Pagination.First />
        <Pagination.Prev />
        {pagination.pages >= 10 ? (
          <VaultPages />
        ) : (
          pag.map((item) => (
            <Pagination.Item key={item} active={activePag === item + 1}>
              {item + 1}
            </Pagination.Item>
          ))
        )}
        <Pagination.Next />
        <Pagination.Last />
      </Pagination>
    );
  };

  return (
    <div className="vault-monitoring">
      <Card className="diamond mb-2 totals">
        <Card.Header>
          <h5>Totals</h5>
        </Card.Header>
        <Card.Body>
          <Col md={12} className="container">
            <Col md={3} className="total-box">
              <h6>Vaults</h6>
              <span className="number">1,200</span>
            </Col>
            <Col md={3} className="total-box">
              <h6>Collateral (USD)</h6>
              <span className="number">$2,580,200.55</span>
            </Col>
            <Col md={3} className="total-box">
              <div className="debt">
                <h6>Debt</h6>
                <TcapIcon className="tcap-icon" />
              </div>
              <span className="number">5,210.55</span>
            </Col>
            <Col md={3} className="total-box">
              <h6>Debt (USD)</h6>
              <span className="number">$988,180.81</span>
            </Col>
          </Col>
        </Card.Body>
      </Card>
      <Card className="diamond mb-2">
        <Card.Body>
          <Col md={12} className="filters">
            <div className="dd-container">
              <h6 className="titles">Collateral:</h6>
              <Dropdown onSelect={(eventKey) => handleTokenChange(eventKey || "ALL")}>
                <Dropdown.Toggle variant="secondary" id="dropdown-filters" className="text-left">
                  <div className="collateral-toggle">
                    <CollateralIcon name={tokenSymbol} /> <span>{tokenSymbol.toUpperCase()}</span>
                  </div>
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {tokensSymbols().map((item) => (
                    <Dropdown.Item key={item.key} eventKey={item.key}>
                      {item.name}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            </div>
            <div className="dd-container">
              <h6 className="titles">Status:</h6>
              <Dropdown onSelect={(eventKey) => handleStatusChange(eventKey || "ALL")}>
                <Dropdown.Toggle variant="secondary" id="dropdown-flags" className="text-left">
                  <div className="status-toggle">
                    <span>{capitalize(currentStatus)}</span>
                  </div>
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {statusList.map((item) => (
                    <Dropdown.Item key={item.key} eventKey={item.key}>
                      {item.name}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            </div>
            <div className="dd-container">
              <ButtonGroup className="mb-2">
                {radios.map((radio, idx) => (
                  <ToggleButton
                    key={idx}
                    id={`radio-${idx}`}
                    type="radio"
                    variant="secondary"
                    name="radio"
                    value={radio.value}
                    checked={radioValue === radio.value}
                    onChange={(e) => handleRadioBtnChange(e.currentTarget.value)}
                  >
                    {radio.name}
                  </ToggleButton>
                ))}
              </ButtonGroup>
            </div>
          </Col>
          <Vaults vaults={vaults} />
          <Col md={12} className="pag-container">
            {pagination.pages > 0 && <VaultPagination />}
          </Col>
        </Card.Body>
      </Card>
    </div>
  );
};
