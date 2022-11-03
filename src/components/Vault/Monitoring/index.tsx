import React, { useContext, useEffect, useRef, useState } from "react";
import { ethers, BigNumber } from "ethers";
import Button from "react-bootstrap/esm/Button";
import ButtonGroup from "react-bootstrap/esm/ButtonGroup";
import Card from "react-bootstrap/esm/Card";
import Col from "react-bootstrap/Col";
import Dropdown from "react-bootstrap/Dropdown";
import { FaArrowsAltH } from "react-icons/fa";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/esm/Row";
import Spinner from "react-bootstrap/Spinner";
import { useTranslation } from "react-i18next";
import ToggleButton from "react-bootstrap/esm/ToggleButton";
import "../../../styles/vault-monitoring.scss";
import { useQuery, gql } from "@apollo/client";
import { useLocation } from "react-router-dom";
import {
  hardVaultsContext,
  networkContext,
  oraclesContext,
  signerContext,
  vaultsContext,
} from "../../../state";
import { ReactComponent as TcapIcon } from "../../../assets/images/tcap-coin.svg";
import {
  getRatio2,
  isInLayer1,
  isOptimism,
  isPolygon,
  isUndefined,
  numberFormatStr,
  toUSD,
  validOracles,
  validVaults,
  validHardVaults,
} from "../../../utils/utils";
import { Vaults } from "./Vaults";
import { VaultPagination } from "./Pagination";
import {
  DropdownItemType,
  OraclePricesType,
  PaginationType,
  VaultsRatioType,
  VaultsType,
  VaultsTotalsType,
} from "./types";
import { capitalize, CollateralIcon, VAULT_STATUS } from "./common";

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

export const Monitoring = () => {
  const { t } = useTranslation();
  const currentNetwork = useContext(networkContext);
  const oracles = useContext(oraclesContext);
  const vaults = useContext(vaultsContext);
  const hardVaults = useContext(hardVaultsContext);
  const signer = useContext(signerContext);
  const { state } = useLocation();
  const [skipQuery, setSkipQuery] = useState(false);
  const [currentAddress, setCurrentAddress] = useState("");
  const [oraclePrices, setOraclePrices] = useState<OraclePricesType>();
  const [vaultsRatio, setVaultsRatio] = useState<VaultsRatioType>();
  const [vaultsTotals, setVaultsTotals] = useState<VaultsTotalsType>(totalsDefault);
  const [vaultList, setVaultList] = useState<Array<VaultsType>>([]);
  const [vaultGraphList, setVaultGraphList] = useState<Array<any>>([]);
  const [pagination, setPagination] = useState<PaginationType>(pagDefault);
  const [loadMore, setLoadMore] = useState(false);
  const [pricesUpdated, setPricesUpdated] = useState(false);
  const [filteringRatios, setFilteringRatios] = useState(false);
  // @ts-ignore
  const [ownerAddress, setOwnerAddress] = useState(state && state.address ? state.address : "");
  // @ts-ignore
  const [radioValue, setRadioValue] = useState(state && state.address ? "2" : "1");
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
        const usdcOraclePriceCall = await oracles.usdcOracleRead?.getLatestAnswer();
        const wbtcOraclePriceCall = await oracles.wbtcOracleRead?.getLatestAnswer();
        ethcalls.push(wethOraclePriceCall);
        ethcalls.push(aaveOraclePriceCall);
        ethcalls.push(linkOraclePriceCall);
        ethcalls.push(usdcOraclePriceCall);
        ethcalls.push(wbtcOraclePriceCall);
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
      if (isPolygon(currentNetwork.chainId)) {
        const maticOraclePriceCall = await oracles.maticOracleRead?.getLatestAnswer();
        const wbtcOraclePriceCall = await oracles.wbtcOracleRead?.getLatestAnswer();
        ethcalls.push(maticOraclePriceCall);
        ethcalls.push(wbtcOraclePriceCall);
      }
      let tcapOraclePrice = BigNumber.from(0);
      let wethOraclePrice = BigNumber.from(0);
      let daiOraclePrice = BigNumber.from(0);
      let aaveOraclePrice = BigNumber.from(0);
      let linkOraclePrice = BigNumber.from(0);
      let snxOraclePrice = BigNumber.from(0);
      let uniOraclePrice = BigNumber.from(0);
      let maticOraclePrice = BigNumber.from(0);
      let wbtcOraclePrice = BigNumber.from(0);
      let usdcOraclePrice = BigNumber.from(0);

      if (isInLayer1(currentNetwork.chainId)) {
        // @ts-ignore
        [
          tcapOraclePrice,
          daiOraclePrice,
          wethOraclePrice,
          aaveOraclePrice,
          linkOraclePrice,
          usdcOraclePrice,
          wbtcOraclePrice,
        ] = await signer.ethcallProvider?.all(ethcalls);
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
      } else if (isPolygon(currentNetwork.chainId)) {
        // @ts-ignore
        [tcapOraclePrice, daiOraclePrice, maticOraclePrice, wbtcOraclePrice] =
          await signer.ethcallProvider?.all(ethcalls);
      }

      setOraclePrices({
        tcapOraclePrice: ethers.utils.formatEther(tcapOraclePrice),
        wethOraclePrice: ethers.utils.formatEther(wethOraclePrice.mul(10000000000)),
        daiOraclePrice: ethers.utils.formatEther(daiOraclePrice.mul(10000000000)),
        aaveOraclePrice: ethers.utils.formatEther(aaveOraclePrice.mul(10000000000)),
        linkOraclePrice: ethers.utils.formatEther(linkOraclePrice.mul(10000000000)),
        uniOraclePrice: ethers.utils.formatEther(uniOraclePrice.mul(10000000000)),
        snxOraclePrice: ethers.utils.formatEther(snxOraclePrice.mul(10000000000)),
        maticOraclePrice: ethers.utils.formatEther(maticOraclePrice.mul(10000000000)),
        wbtcOraclePrice: ethers.utils.formatEther(wbtcOraclePrice.mul(10000000000)),
        usdcOraclePrice: ethers.utils.formatEther(usdcOraclePrice.mul(10000000000)),
      });
      setPricesUpdated(true);
    }
  };

  const loadRatios = async () => {
    if (
      signer &&
      vaults &&
      hardVaults &&
      validVaults(currentNetwork.chainId || 1, vaults) &&
      validHardVaults(currentNetwork.chainId || 1, hardVaults)
    ) {
      const daiRatioCall = await vaults.daiVaultRead?.ratio();
      const ethcalls = [daiRatioCall];

      if (isInLayer1(currentNetwork.chainId)) {
        const wethRatioCall = await vaults.wethVaultRead?.ratio();
        const aaveRatioCall = await vaults.aaveVaultRead?.ratio();
        const linkRatioCall = await vaults.linkVaultRead?.ratio();
        const hardWethRatioCall = await hardVaults.wethVaultRead?.ratio();
        const hardDaiRatioCall = await hardVaults.daiVaultRead?.ratio();
        const hardUsdcRatioCall = await hardVaults.usdcVaultRead?.ratio();
        ethcalls.push(wethRatioCall);
        ethcalls.push(aaveRatioCall);
        ethcalls.push(linkRatioCall);
        ethcalls.push(hardWethRatioCall);
        ethcalls.push(hardDaiRatioCall);
        ethcalls.push(hardUsdcRatioCall);
      }
      if (isOptimism(currentNetwork.chainId)) {
        const wethRatioCall = await vaults.wethVaultRead?.ratio();
        const linkRatioCall = await vaults.linkVaultRead?.ratio();
        const snxRatioCall = await vaults.snxVaultRead?.ratio();
        const uniRatioCall = await vaults.uniVaultRead?.ratio();
        ethcalls.push(wethRatioCall);
        ethcalls.push(linkRatioCall);
        ethcalls.push(snxRatioCall);
        ethcalls.push(uniRatioCall);
      }
      if (isPolygon(currentNetwork.chainId)) {
        const maticRatioCall = await vaults.maticVaultRead?.ratio();
        const wbtcRatioCall = await vaults.wbtcVaultRead?.ratio();
        ethcalls.push(maticRatioCall);
        ethcalls.push(wbtcRatioCall);
      }
      let ethRatio = 0;
      let daiRatio = 0;
      let aaveRatio = 0;
      let linkRatio = 0;
      let snxRatio = 0;
      let uniRatio = 0;
      let maticRatio = 0;
      let wbtcRatio = 0;
      let hardEthRatio = 0;
      let hardDaiRatio = 0;
      let hardUsdcRatio = 0;
      if (isInLayer1(currentNetwork.chainId)) {
        // @ts-ignore
        [daiRatio, ethRatio, aaveRatio, linkRatio, hardEthRatio, hardDaiRatio, hardUsdcRatio] =
          await signer.ethcallProvider?.all(ethcalls);
      } else if (isOptimism(currentNetwork.chainId)) {
        // @ts-ignore
        [daiRatio, ethRatio, linkRatio, snxRatio, uniRatio] = await signer.ethcallProvider?.all(
          ethcalls
        );
      } else if (isPolygon(currentNetwork.chainId)) {
        // @ts-ignore
        [daiRatio, maticRatio, wbtcRatio] = await signer.ethcallProvider?.all(ethcalls);
      }
      setVaultsRatio({
        ethRatio,
        wethRatio: ethRatio,
        daiRatio,
        aaveRatio,
        linkRatio,
        uniRatio,
        snxRatio,
        maticRatio,
        wbtcRatio,
        hardEthRatio,
        hardWethRatio: hardEthRatio,
        hardDaiRatio,
        hardUsdcRatio,
      });
    }
  };

  const getCollateralPrice = (symbol: string) => {
    let price = "0";
    switch (symbol) {
      case "ETH":
        price = oraclePrices?.wethOraclePrice || "0";
        break;
      case "WETH":
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
      case "USDC":
        price = oraclePrices?.usdcOraclePrice || "0";
        break;
      default:
        break;
    }
    return price;
  };

  const getMinRatio = (symbol: string, isHardVault: boolean) => {
    let minRatio = 200;
    switch (symbol) {
      case "ETH":
        if (isHardVault) {
          minRatio = vaultsRatio?.hardEthRatio || 100;
        } else {
          minRatio = vaultsRatio?.ethRatio || 200;
        }
        break;
      case "WETH":
        if (isHardVault) {
          minRatio = vaultsRatio?.hardWethRatio || 110;
        } else {
          minRatio = vaultsRatio?.ethRatio || 200;
        }
        break;
      case "DAI":
        if (isHardVault) {
          minRatio = vaultsRatio?.hardDaiRatio || 110;
        } else {
          minRatio = vaultsRatio?.daiRatio || 200;
        }
        break;
      case "AAVE":
        minRatio = vaultsRatio?.aaveRatio || 200;
        break;
      case "LINK":
        minRatio = vaultsRatio?.linkRatio || 200;
        break;
      case "UNI":
        minRatio = vaultsRatio?.uniRatio || 200;
        break;
      case "SNX":
        minRatio = vaultsRatio?.snxRatio || 200;
        break;
      case "MATIC":
        minRatio = vaultsRatio?.maticRatio || 200;
        break;
      case "WBTC":
        minRatio = vaultsRatio?.wbtcRatio || 200;
        break;
      case "USDC":
        minRatio = vaultsRatio?.hardUsdcRatio || 110;
        break;
      default:
        break;
    }
    return minRatio;
  };

  const confPagination = (vData: Array<VaultsType>, itemsPerPage: number) => {
    if (vData.length > 0) {
      const lastVaultId = vData[vData.length - 1].blockTS;
      const itemsCount = vData.length;
      const pages = Math.ceil(itemsCount / itemsPerPage);
      const lastDataPage = Math.ceil(itemsCount / itemsPerPage);
      const pag = {
        previous: 0,
        current: 1,
        next: 2,
        pages,
        lastDataPage,
        itemsPerPage,
        itemsCount,
        lastId: lastVaultId,
      };
      setPagination(pag);
    } else {
      setPagination(pagDefault);
    }
  };

  const calculateNetRewardUsd = async (
    vaultId: string,
    vaultType: string,
    isHardVault: boolean,
    decimals: number
  ) => {
    try {
      let cVault = vaults.wethVault;
      let cVaultRead = vaults.wethVaultRead;
      let vaultPrice = oraclePrices?.wethOraclePrice;
      if (isHardVault) {
        cVault = hardVaults.wethVault;
        cVaultRead = hardVaults.wethVaultRead;
      }

      switch (vaultType) {
        case "DAI":
          if (isHardVault) {
            cVault = hardVaults.daiVault;
            cVaultRead = hardVaults.daiVaultRead;
          } else {
            cVault = vaults.daiVault;
            cVaultRead = vaults.daiVaultRead;
          }
          vaultPrice = oraclePrices?.daiOraclePrice;
          break;
        case "AAVE":
          cVault = vaults.aaveVault;
          cVaultRead = vaults.aaveVaultRead;
          vaultPrice = oraclePrices?.aaveOraclePrice;
          break;
        case "LINK":
          cVault = vaults.linkVault;
          cVaultRead = vaults.linkVaultRead;
          vaultPrice = oraclePrices?.linkOraclePrice;
          break;
        case "SNX":
          cVault = vaults.snxVault;
          cVaultRead = vaults.snxVaultRead;
          vaultPrice = oraclePrices?.snxOraclePrice;
          break;
        case "UNI":
          cVault = vaults.uniVault;
          cVaultRead = vaults.uniVaultRead;
          vaultPrice = oraclePrices?.uniOraclePrice;
          break;
        case "MATIC":
          cVault = vaults.maticVault;
          cVaultRead = vaults.maticVaultRead;
          vaultPrice = oraclePrices?.maticOraclePrice;
          break;
        case "WBTC":
          cVault = vaults.wbtcVault;
          cVaultRead = vaults.wbtcVaultRead;
          vaultPrice = oraclePrices?.wbtcOraclePrice;
          break;
        case "USDC":
          cVault = hardVaults.usdcVault;
          cVaultRead = hardVaults.usdcVaultRead;
          vaultPrice = oraclePrices?.usdcOraclePrice;
          break;
        default:
          if (isHardVault) {
            cVault = hardVaults.wethVault;
            cVaultRead = hardVaults.wethVaultRead;
          } else {
            cVault = vaults.wethVault;
            cVaultRead = vaults.wethVaultRead;
          }
          vaultPrice = oraclePrices?.wethOraclePrice;
          break;
      }

      const reqTcapCall = await cVaultRead?.requiredLiquidationTCAP(BigNumber.from(vaultId));
      const liqRewardCall = await cVaultRead?.liquidationReward(BigNumber.from(vaultId));
      // @ts-ignore
      const [reqTcap, liqReward] = await signer.ethcallProvider?.all([reqTcapCall, liqRewardCall]);

      const reqTcapText = ethers.utils.formatEther(reqTcap);
      const liqRewardText = ethers.utils.formatUnits(liqReward, decimals);
      const currentLiqFee = await cVault?.getFee(reqTcap);
      const increasedFee = currentLiqFee.add(currentLiqFee.div(100)).toString();
      const ethFee = ethers.utils.formatEther(increasedFee);

      return (
        toUSD(liqRewardText, vaultPrice || "0") -
        toUSD(reqTcapText, oraclePrices?.tcapOraclePrice || "0") -
        toUSD(ethFee, oraclePrices?.wethOraclePrice || "0")
      );
    } catch (error) {
      if (error.code !== "UNPREDICTABLE_GAS_LIMIT") {
        console.log(error.code);
      }
      return 0;
    }
  };

  const calculateVaultData = (
    collateralWei: ethers.BigNumberish,
    debtWei: ethers.BigNumberish,
    symbol: string,
    isHardVault: boolean,
    decimals: number
  ) => {
    const collateralText = ethers.utils.formatUnits(collateralWei, decimals);
    const debtText = ethers.utils.formatEther(debtWei);
    const collateralPrice = getCollateralPrice(symbol);
    const collateralUSD = toUSD(collateralText, collateralPrice);
    const debtUSD = toUSD(debtText, oraclePrices?.tcapOraclePrice || "0");
    const minRatio = getMinRatio(symbol, isHardVault);

    const ratio = getRatio2(
      collateralText,
      collateralPrice,
      debtText,
      oraclePrices?.tcapOraclePrice || "1"
    );

    let status = VAULT_STATUS.liquidation;
    if (parseFloat(collateralText) < 0.0000000001) {
      status = VAULT_STATUS.empty;
    } else if (parseFloat(collateralText) >= 0.0000000001 && parseFloat(debtText) < 0.0000000001) {
      status = VAULT_STATUS.ready;
    } else if (ratio >= minRatio) {
      status = VAULT_STATUS.active;
    }
    return { collateralText, collateralUSD, debtText, debtUSD, ratio, minRatio, status };
  };

  const isValidRatio = (value: string) => {
    let valid = false;
    if (!Number.isNaN(value)) {
      valid = Number.parseFloat(value) >= 0;
    }
    return valid;
  };

  const getMinRangeRatio = (): number => {
    if (minRatioInput && minRatioInput.current) {
      // @ts-ignore
      const minRatio = minRatioInput.current.value;
      if (isValidRatio(minRatio)) {
        return parseFloat(minRatio);
      }
    }
    return 0;
  };

  const getMaxRangeRatio = (): number => {
    if (maxRatioInput && maxRatioInput.current) {
      // @ts-ignore
      const maxRatio = maxRatioInput.current.value;
      if (isValidRatio(maxRatio)) {
        return parseFloat(maxRatio);
      }
    }
    return 3000;
  };

  const loadVaults = async (vaultsData: any) => {
    const vData = new Array<VaultsType>();
    const vLiquidables = new Array<liqVaultsTempType>();
    const totals = { ...totalsDefault };
    const minFilterRatio = getMinRangeRatio();
    const maxFilterRatio = getMaxRangeRatio();

    setSkipQuery(true);
    setLoadMore(false);
    setFilteringRatios(true);
    // setLiqLoaded(currentStatus !== VAULT_STATUS.liquidation);
    // @ts-ignore
    vaultsData.vaults.forEach((v) => {
      const cVaultDecimals = v.underlyingProtocol.underlyingToken.decimals;
      const { collateralText, collateralUSD, debtText, debtUSD, ratio, minRatio, status } =
        calculateVaultData(v.collateral, v.debt, v.tokenSymbol, v.hardVault, cVaultDecimals);

      let addVault = true;
      if (currentStatus === VAULT_STATUS.active || currentStatus === VAULT_STATUS.liquidation) {
        addVault = currentStatus === status;
      }
      // filter ratio
      if (currentStatus !== VAULT_STATUS.empty && currentStatus !== VAULT_STATUS.ready) {
        addVault = addVault && ratio >= minFilterRatio && ratio <= maxFilterRatio;
      }

      if (!showAllVaults) {
        addVault = v.tokenSymbol === "WETH" || v.tokenSymbol === "DAI";
      }
      if (addVault && v.tokenSymbol !== "WBTC") {
        let vaultUrl = "";
        const symbol = v.tokenSymbol === "WETH" ? "ETH" : v.tokenSymbol;
        if (v.owner.toLowerCase() === currentAddress.toLowerCase()) {
          vaultUrl = window.location.origin.concat("/vault/").concat(symbol);
        }
        if (currentStatus === VAULT_STATUS.liquidation) {
          vLiquidables.push({
            vaultId: v.vaultId,
            vaultType: v.tokenSymbol,
            decimals: cVaultDecimals,
            hardVault: v.hardVault,
          });
        }

        vData.push({
          id: v.vaultId,
          collateralSymbol: v.tokenSymbol,
          collateralValue: collateralText,
          collateralUsd: collateralUSD.toFixed(2),
          debt: debtText,
          debtUsd: debtUSD.toFixed(2),
          ratio,
          minRatio: minRatio.toString(),
          decimals: cVaultDecimals,
          isHardVault: v.hardVault,
          netReward: 0,
          status,
          blockTS: v.blockTS,
          url: vaultUrl,
        });

        totals.vaults += 1;
        totals.collateral = (parseFloat(totals.collateral) + parseFloat(collateralText)).toFixed(4);
        totals.collateralUSD = (parseFloat(totals.collateralUSD) + collateralUSD).toFixed(2);
        totals.debt = (parseFloat(totals.debt) + parseFloat(debtText)).toFixed(4);
        totals.debtUSD = (parseFloat(totals.debtUSD) + debtUSD).toFixed(2);
      }
    });
    if (currentStatus !== VAULT_STATUS.liquidation) {
      setVaultList(vData);
      setVaultsTotals(totals);
    } else {
      const loadNetReward = async () => {
        vLiquidables.forEach((l, index) => {
          calculateNetRewardUsd(l.vaultId, l.vaultType, l.hardVault, l.decimals).then((result) => {
            const newA = [...vData];
            newA[index].netReward = result;
            setVaultList(newA);
          });
        });
      };
      loadNetReward().then(() => {
        setVaultList(vData);
        setVaultsTotals(totals);
      });
    }
    // Set pagination data
    confPagination(vData, pagination.itemsPerPage);
    setFilteringRatios(false);
  };

  const { loading } = useQuery(vaultsQuery, {
    fetchPolicy: "no-cache",
    notifyOnNetworkStatusChange: true,
    skip: skipQuery,
    onError: (error) => {
      console.log(error);
    },
    onCompleted: (data: any) => {
      console.log("--- graph --");
      console.log(data);
      if (pricesUpdated && !isUndefined(data)) {
        setVaultGraphList(data);
        loadVaults(data);
      }
    },
  });

  useEffect(
    () => {
      if (!pricesUpdated) {
        loadPrices();
        loadRatios();
      }
      // else if (!isUndefined(data)) {
      // loadVaults(data);
      // }
    },
    // eslint-disable-next-line
    [signer, currentNetwork.chainId, pricesUpdated]
  );

  const tokensSymbols = (): Array<DropdownItemType> => {
    const symbols = [{ key: "all", name: "All" }];
    if (isInLayer1(currentNetwork.chainId)) {
      symbols.push({ key: "weth", name: "ETH" });
      symbols.push({ key: "dai", name: "DAI" });
      if (showAllVaults) {
        symbols.push({ key: "aave", name: "AAVE" });
        symbols.push({ key: "link", name: "LINK" });
        symbols.push({ key: "usdc", name: "USDC" });
      }
    } else if (isOptimism(currentNetwork.chainId)) {
      symbols.push({ key: "eth", name: "ETH" });
      symbols.push({ key: "dai", name: "DAI" });
      if (showAllVaults) {
        symbols.push({ key: "link", name: "LINK" });
        symbols.push({ key: "uni", name: "UNI" });
        symbols.push({ key: "snx", name: "SNX" });
      }
    } else {
      symbols.push({ key: "matic", name: "MATIC" });
      symbols.push({ key: "dai", name: "DAI" });
      symbols.push({ key: "wbtc", name: "WBTC" });
    }

    return symbols;
  };

  const handleItemsViewChange = (number: string) => {
    setSkipQuery(true);
    confPagination(vaultList, parseInt(number));
  };

  const handleRadioBtnChange = (value: string) => {
    setSkipQuery(false);
    setRadioValue(value);
    if (value === "1") {
      setOwnerAddress("");
    } else {
      setOwnerAddress(currentAddress);
    }
  };

  const handleStatusChange = (newStatus: string) => {
    setSkipQuery(false);
    setCurrentStatus(newStatus);
  };

  const handleTokenChange = (newToken: string) => {
    setSkipQuery(false);
    setTokenSymbol(newToken);
  };

  const handleModeChange = (newMode: string) => {
    setSkipQuery(false);
    setVaultMode(newMode);
  };

  /* const onChangeMinFilterRatio = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setMinFilterRatio(event.target.value);
  };

  const onChangeMaxFilterRatio = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setMaxFilterRatio(event.target.value);
  }; */

  const onFilterRatioClick = () => {
    if (minRatioInput && maxRatioInput) {
      // @ts-ignore
      const minRatio = minRatioInput.current.value;
      // @ts-ignore
      const maxRatio = maxRatioInput.current.value;
      if (isValidRatio(minRatio) && isValidRatio(maxRatio)) {
        setCurrentMinRatio(minRatio.concat("%"));
        setCurrentMaxRatio(maxRatio.concat("%"));
        // @ts-ignore
        loadVaults(vaultGraphList);
        if (ratioRangeDropdown !== null) {
          // @ts-ignore
          ratioRangeDropdown.current.click();
        }
      }
    }
  };

  const onPageSelected = (pageNumber: number) => {
    const nextPage = pageNumber === pagination.pages ? 0 : pageNumber + 1;
    const newPagination = {
      ...pagination,
      previous: pageNumber === 1 ? 0 : pageNumber - 1,
      current: pageNumber,
      next: nextPage,
    };
    setPagination(newPagination);
  };

  const updateLiquidatedVault = async (index: number, symbol: string) => {
    let currentVault = vaults?.wethVault;
    if (vaultList[index].isHardVault) {
      currentVault = hardVaults?.wethVault;
    }
    switch (symbol) {
      case "DAI":
        if (vaultList[index].isHardVault) {
          currentVault = hardVaults?.daiVault;
        } else {
          currentVault = vaults?.daiVault;
        }
        break;
      case "AAVE":
        currentVault = vaults?.aaveVault;
        break;
      case "LINK":
        currentVault = vaults?.linkVault;
        break;
      case "UNI":
        currentVault = vaults?.uniVault;
        break;
      case "SNX":
        currentVault = vaults?.snxVault;
        break;
      case "MATIC":
        currentVault = vaults?.maticVault;
        break;
      case "WBTC":
        currentVault = vaults?.wbtcVault;
        break;
      case "USDC":
        currentVault = hardVaults?.usdcVault;
        break;
      default:
        break;
    }
    const [vaultId, collateral, , debt] = await currentVault?.getVault(
      BigNumber.from(vaultList[index].id)
    );
    const { collateralText, collateralUSD, debtText, debtUSD, ratio, minRatio, status } =
      calculateVaultData(
        collateral,
        debt,
        symbol,
        vaultList[index].isHardVault,
        vaultList[index].decimals
      );
    const allVaults = vaultList;
    const v = {
      id: vaultId,
      collateralSymbol: symbol,
      collateralValue: collateralText,
      collateralUsd: collateralUSD.toFixed(2),
      debt: debtText,
      debtUsd: debtUSD.toFixed(2),
      ratio,
      minRatio: minRatio.toString(),
      decimals: vaultList[index].decimals,
      isHardVault: vaultList[index].isHardVault,
      netReward: 0,
      status,
      blockTS: vaultList[index].blockTS,
      url: vaultList[index].url,
    };
    allVaults[index] = Object.create(v);
    setVaultList(Array.from(allVaults));
    setRenderTable(!renderTable);
  };

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
                  <span className="number">{vaultsTotals.vaults}</span>
                </Col>
                <Col md={3} className="total-box">
                  <h6>
                    <>{t("collateral")} (USD)</>
                  </h6>
                  <span className="number">
                    ${numberFormatStr(vaultsTotals.collateralUSD, 2, 2)}
                  </span>
                </Col>
                <Col md={3} className="total-box">
                  <div className="debt">
                    <h6>
                      <>{t("debt")}</>
                    </h6>
                    <TcapIcon className="tcap-icon" />
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
            </Card.Body>
          </Card>
          <Card className="diamond mb-2">
            <Card.Body>
              <Col md={12} className="actions">
                <div className="items-view">
                  <div className="dd-container">
                    <h6 className="titles">
                      <>{t("view")}:</>
                    </h6>
                    <Dropdown onSelect={(eventKey) => handleItemsViewChange(eventKey || "15")}>
                      <Dropdown.Toggle
                        variant="secondary"
                        id="dropdown-filters"
                        className="text-left"
                      >
                        <div className="items-view-toggle">
                          <span>{pagination.itemsPerPage}</span>
                        </div>
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        {viewsList.map((item) => (
                          <Dropdown.Item key={item.key} eventKey={item.key}>
                            {item.name}
                          </Dropdown.Item>
                        ))}
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>
                </div>
                <div className="filters">
                  <div className="dd-container">
                    <h6 className="titles">
                      <>{t("collateral")}:</>
                    </h6>
                    <Dropdown
                      className="dd-collateral"
                      onSelect={(eventKey) => handleTokenChange(eventKey || "ALL")}
                    >
                      <Dropdown.Toggle
                        variant="secondary"
                        id="dropdown-filters"
                        className="text-left"
                      >
                        <div className="collateral-toggle">
                          <CollateralIcon name={tokenSymbol} />
                          <span>{tokenSymbol.toUpperCase()}</span>
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
                    <h6 className="titles">Status</h6>
                    <Dropdown onSelect={(eventKey) => handleStatusChange(eventKey || "ALL")}>
                      <Dropdown.Toggle
                        variant="secondary"
                        id="dropdown-flags"
                        className="text-left"
                      >
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
                  {isInLayer1(currentNetwork.chainId) && (
                    <div className="dd-container">
                      <h6 className="titles">
                        <>{t("mode")}:</>
                      </h6>
                      <Dropdown
                        className="dd-mode"
                        onSelect={(eventKey) => handleModeChange(eventKey || "ALL")}
                      >
                        <Dropdown.Toggle
                          variant="secondary"
                          id="dropdown-flags"
                          className="text-left"
                        >
                          <div className="status-toggle">
                            <span>{capitalize(vaultMode)}</span>
                          </div>
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          {modeList.map((item) => (
                            <Dropdown.Item key={item.key} eventKey={item.key}>
                              {item.name}
                            </Dropdown.Item>
                          ))}
                        </Dropdown.Menu>
                      </Dropdown>
                    </div>
                  )}
                  {currentStatus !== VAULT_STATUS.empty && currentStatus !== VAULT_STATUS.ready && (
                    <div className="dd-container">
                      <h6 className="titles">Ratio Range</h6>
                      <Dropdown>
                        <Dropdown.Toggle
                          variant="secondary"
                          id="dropdown-flags"
                          className="text-left ratio-range-toggle"
                          ref={ratioRangeDropdown}
                        >
                          <div className="status-toggle">
                            <span>
                              {currentMinRatio} <FaArrowsAltH /> {currentMaxRatio}
                            </span>
                          </div>
                        </Dropdown.Toggle>
                        <Dropdown.Menu className="ratio-range-menu">
                          <div className="range-container">
                            <Form.Control
                              type="number"
                              placeholder=""
                              className="neon-green"
                              defaultValue="0"
                              ref={minRatioInput}
                            />
                            <FaArrowsAltH />
                            <Form.Control
                              type="number"
                              placeholder=""
                              className="neon-green"
                              defaultValue="2500"
                              ref={maxRatioInput}
                            />
                          </div>
                          <Button onClick={() => onFilterRatioClick()}>Apply</Button>
                        </Dropdown.Menu>
                      </Dropdown>
                    </div>
                  )}
                  {currentAddress !== "" && (
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
                  )}
                </div>
              </Col>
              {loading || filteringRatios || !pricesUpdated ? (
                <Spinner variant="danger" className="spinner" animation="border" />
              ) : (
                <Vaults
                  currentAddress={currentAddress}
                  vaults={vaultList}
                  setVaults={(v: Array<VaultsType>) => setVaultList(v)}
                  currentStatus={currentStatus}
                  pagination={pagination}
                  refresh={updateLiquidatedVault}
                />
              )}
              <Col md={12} className="pag-container">
                {pagination.pages > 0 && !loading && (
                  <VaultPagination pagination={pagination} onPageSelected={onPageSelected} />
                )}
              </Col>
            </Card.Body>
          </Card>
        </Row>
      </Row>
    </div>
  );
};
