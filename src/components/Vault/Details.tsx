import React, { useState, useEffect, useContext } from "react";
import Button from "react-bootstrap/esm/Button";
import Card from "react-bootstrap/esm/Card";
import Form from "react-bootstrap/esm/Form";
import InputGroup from "react-bootstrap/esm/InputGroup";
import OverlayTrigger from "react-bootstrap/esm/OverlayTrigger";
import Tooltip from "react-bootstrap/esm/Tooltip";
import { Contract } from "ethers-multicall";
import { ethers, BigNumber } from "ethers";
import NumberFormat from "react-number-format";
import { useRouteMatch, useHistory } from "react-router-dom";
import { useQuery, gql, NetworkStatus } from "@apollo/client";
import OraclesContext from "../../state/OraclesContext";
import TokensContext from "../../state/TokensContext";
import VaultsContext from "../../state/VaultsContext";
import SignerContext from "../../state/SignerContext";
import "../../styles/vault.scss";
import { ReactComponent as ETHIconSmall } from "../../assets/images/vault/eth.svg";
import { ReactComponent as BTCIconSmall } from "../../assets/images/vault/bitcoin.svg";
import { ReactComponent as DAIIconSmall } from "../../assets/images/vault/dai.svg";
import { ReactComponent as ETHIcon } from "../../assets/images/graph/weth.svg";
import { ReactComponent as DAIIcon } from "../../assets/images/graph/DAI.svg";
import { ReactComponent as WBTCIcon } from "../../assets/images/graph/WBTC.svg";
import { ReactComponent as RatioIcon } from "../../assets/images/vault/ratio.svg";
import { ReactComponent as TcapIcon } from "../../assets/images/tcap-coin.svg";
import {
  notifyUser,
  toUSD,
  errorNotification,
  getRatio,
  getSafeRemoveCollateral,
  getSafeMint,
} from "../../utils/utils";
import Loading from "../Loading";

type props = {
  address: string;
};

// TODO: Vault doesn't show if approve is 0 even if there is data in the vault

const Details = ({ address }: props) => {
  const oracles = useContext(OraclesContext);
  const tokens = useContext(TokensContext);
  const vaults = useContext(VaultsContext);
  const signer = useContext(SignerContext);

  let currency = "ETH";
  const match = useRouteMatch("/vault/:currency");
  const history = useHistory();
  // @ts-ignore
  switch (match?.params?.currency?.toLowerCase()) {
    case "eth":
      currency = "ETH";
      break;
    case "weth":
      currency = "WETH";
      break;
    case "dai":
      currency = "DAI";
      break;
    case "wbtc":
      currency = "WETH";
      history?.push(`/vault/WETH`);
      break;
    default:
      currency = "ETH";
      break;
  }

  // Actions
  const [title, setTitle] = useState("Create Vault");
  const [text, setText] = useState(
    "No vault Created. Please Create a Vault and approve your collateral to start minting TCAP tokens."
  );
  const [isApproved, setIsApproved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Vault Data
  const [selectedVaultId, setSelectedVaultId] = useState("0");
  const [vaultDebt, setVaultDebt] = useState("0");
  const [vaultDebtUSD, setVaultDebtUSD] = useState("0");
  const [vaultCollateral, setVaultCollateral] = useState("0");
  const [vaultCollateralUSD, setVaultCollateralUSD] = useState("0");
  const [vaultRatio, setVaultRatio] = useState("0");
  const [tempRatio, setTempRatio] = useState("");
  const [minRatio, setMinRatio] = useState("0");
  const [selectedVault, setSelectedVault] = useState(currency);
  const [selectedVaultContract, setSelectedVaultContract] = useState<ethers.Contract>();
  const [selectedVaultRead, setSelectedVaultRead] = useState<Contract>();
  const [selectedOracleRead, setSelectedOracleRead] = useState<Contract>();
  const [selectedCollateralContract, setSelectedCollateralContract] = useState<ethers.Contract>();
  const [selectedVaultDecimals, setSelectedVaultDecimals] = useState(18);

  // General Data
  const [tokenBalanceUSD, setTokenBalanceUSD] = useState("0");
  const [tokenBalance, setTokenBalance] = useState("0");
  const [tokenBalanceDecimals, setTokenBalanceDecimals] = useState(2);

  // Inputs
  const [addCollateralTxt, setAddCollateralTxt] = useState("");
  const [addCollateralUSD, setAddCollateralUSD] = useState("0");
  const [removeCollateralTxt, setRemoveCollateralTxt] = useState("");
  const [removeCollateralUSD, setRemoveCollateralUSD] = useState("0");
  const [mintTxt, setMintTxt] = useState("");
  const [mintUSD, setMintUSD] = useState("0");
  const [burnTxt, setBurnTxt] = useState("");
  const [burnUSD, setBurnUSD] = useState("0");
  const [burnFee, setBurnFee] = useState("0");
  const [vaultStatus, setVaultStatus] = useState("");

  // Infinite Approval
  const approveValue = BigNumber.from("1157920892373161954235709850086879078532699");

  const USER_VAULT = gql`
    query getVault($owner: String!) {
      vaults(where: { owner: $owner }) {
        id
        vaultId
        owner
        collateral
        debt
        address
        owner
      }
      _meta {
        block {
          number
          hash
        }
        hasIndexingErrors
      }
    }
  `;

  const tcapPrice = async () => {
    const currentTCAPPriceCall = await oracles.tcapOracleRead?.getLatestAnswer();

    // @ts-ignore
    const [currentTCAPPrice] = await signer.ethcallProvider?.all([currentTCAPPriceCall]);
    return currentTCAPPrice;
  };

  const collateralPrice = async () => {
    const collateralPriceCall = await selectedOracleRead?.getLatestAnswer();

    // @ts-ignore
    const [currentCollateralPrice] = await signer.ethcallProvider?.all([collateralPriceCall]);
    return currentCollateralPrice;
  };

  async function loadVault(vaultType: string, vaultData: any) {
    if (
      signer.signer &&
      oracles.wethOracle &&
      oracles.daiOracle &&
      oracles.wethOracleRead &&
      oracles.daiOracleRead &&
      oracles.tcapOracle &&
      vaults.wethVault &&
      vaults.daiVault &&
      tokens.wethToken &&
      tokens.daiToken &&
      tokens.wethTokenRead &&
      tokens.daiTokenRead &&
      vaultData
    ) {
      let currentVault: any;
      let currentVaultRead: any;
      let currentToken;
      let currentOracleRead;
      let currentTokenRead;
      let balance;
      const network = process.env.REACT_APP_NETWORK_NAME;
      const provider = ethers.getDefaultProvider(network, {
        infura: process.env.REACT_APP_INFURA_ID,
        alchemy: process.env.REACT_APP_ALCHEMY_KEY,
      });
      switch (vaultType) {
        case "ETH": {
          currentVault = vaults.wethVault;
          currentVaultRead = vaults.wethVaultRead;
          currentToken = tokens.wethToken;
          currentOracleRead = oracles.wethOracleRead;
          currentTokenRead = tokens.wethTokenRead;
          balance = await provider.getBalance(address);
          break;
        }
        case "WETH":
          currentVault = vaults.wethVault;
          currentVaultRead = vaults.wethVaultRead;
          currentToken = tokens.wethToken;
          currentOracleRead = oracles.wethOracleRead;
          currentTokenRead = tokens.wethTokenRead;
          break;
        case "DAI":
          currentVault = vaults.daiVault;
          currentVaultRead = vaults.daiVaultRead;
          currentToken = tokens.daiToken;
          currentOracleRead = oracles.daiOracleRead;
          currentTokenRead = tokens.daiTokenRead;
          break;
        default:
          currentVault = vaults.wethVault;
          currentVaultRead = vaults.wethVaultRead;
          currentToken = tokens.wethToken;
          currentOracleRead = oracles.wethOracleRead;
          currentTokenRead = tokens.wethTokenRead;
          break;
      }
      setSelectedVaultContract(currentVault);
      setSelectedCollateralContract(currentToken);
      setSelectedVaultRead(currentVaultRead);
      setSelectedOracleRead(currentOracleRead);

      let currentVaultData: any;
      // Removed GRAPH
      // if data is empty load vault data from contract
      const graphBlock = vaultData._meta.block.number;
      let currentBlock = await provider.getBlockNumber();
      currentBlock -= 10;
      if (
        vaultData.vaults.length > 0 &&
        !vaultData._meta.hasIndexingErrors &&
        graphBlock >= currentBlock
      ) {
        await vaultData.vaults.forEach((v: any) => {
          if (v.address.toLowerCase() === currentVault.address.toLowerCase()) {
            currentVaultData = v;
          }
        });
      } else {
        const vaultID = await currentVault.userToVault(address);
        if (!vaultID.eq(0)) {
          const vault = await currentVault.vaults(vaultID);
          currentVaultData = {
            vaultId: vaultID,
            collateral: vault.Collateral,
            debt: vault.Debt,
          };
        }
      }

      if (vaultType !== "ETH") {
        balance = await currentToken.balanceOf(address);
      }

      let decimals;
      let currentPrice;

      if (currentVaultData) {
        const { vaultId, collateral, debt } = currentVaultData;
        const allowanceCall = await currentTokenRead.allowance(address, currentVault.address);
        const currentRatioCall = await currentVaultRead.getVaultRatio(vaultId);
        const currentTCAPPriceCall = await oracles.tcapOracleRead?.getLatestAnswer();
        const decimalsCall = await currentTokenRead.decimals();
        const currentPriceCall = await currentOracleRead.getLatestAnswer();
        const currentMinRatioCall = await currentVaultRead.ratio();

        // @ts-ignore
        const [
          allowance,
          currentRatio,
          currentTCAPPrice,
          decimalsVal,
          currentPriceVal,
          currentMinRatio,
        ] = await signer.ethcallProvider?.all([
          allowanceCall,
          currentRatioCall,
          currentTCAPPriceCall,
          decimalsCall,
          currentPriceCall,
          currentMinRatioCall,
        ]);

        decimals = decimalsVal;
        currentPrice = ethers.utils.formatEther(currentPriceVal.mul(10000000000));
        setSelectedVaultId(vaultId);
        if (!allowance.isZero() || vaultType === "ETH") {
          setMinRatio(currentMinRatio.toString());
          setIsApproved(true);
          setVaultRatio(currentRatio.toString());
          if (currentRatio.toString() === "0") {
            setVaultStatus("N/A");
          } else if (currentRatio.toString() >= parseFloat(currentMinRatio.toString()) + 50) {
            setVaultStatus("safe");
          } else if (currentRatio.toString() >= parseFloat(currentMinRatio.toString()) + 30) {
            setVaultStatus("warning");
          } else {
            setVaultStatus("danger");
          }

          const parsedCollateral = ethers.utils.formatUnits(collateral, decimals);

          // const parsedCollateral = ethers.utils.formatEther(collateral);
          setVaultCollateral(parsedCollateral);
          const usdCollateral = toUSD(currentPrice, parsedCollateral);
          setVaultCollateralUSD(usdCollateral.toString());

          const currentTCAPPriceFormat = ethers.utils.formatEther(currentTCAPPrice);
          const parsedDebt = ethers.utils.formatEther(debt);
          setVaultDebt(parsedDebt);
          const usdTCAP = toUSD(currentTCAPPriceFormat, parsedDebt);
          setVaultDebtUSD(usdTCAP.toString());
        } else {
          setText(
            "Vault not approved. Please approve your collateral to start minting TCAP tokens."
          );
          setTitle("Approve Vault");
          setIsApproved(false);
        }
      } else {
        const decimalsCall = await currentTokenRead.decimals();
        const currentPriceCall = await currentOracleRead.getLatestAnswer();

        // @ts-ignore
        const [decimalsVal, currentPriceVal] = await signer.ethcallProvider?.all([
          decimalsCall,
          currentPriceCall,
        ]);

        decimals = decimalsVal;
        currentPrice = ethers.utils.formatEther(currentPriceVal.mul(10000000000));

        setSelectedVaultId("0");
        setText(
          "No vault Created. Please Create a Vault and approve your collateral to start minting TCAP tokens."
        );
        setTitle("Create Vault");
        setIsApproved(false);
      }

      setSelectedVaultDecimals(decimals);
      const currentBalance = ethers.utils.formatUnits(balance, decimals);

      if (parseFloat(currentBalance) < 0.09) {
        setTokenBalanceDecimals(4);
      }
      setTokenBalance(currentBalance);

      const usdBalance = toUSD(currentPrice, currentBalance);
      setTokenBalanceUSD(usdBalance.toString());
    }
  }

  const { data, refetch, networkStatus } = useQuery(USER_VAULT, {
    variables: { owner: address },
    pollInterval: 200000,
    fetchPolicy: "no-cache",
    notifyOnNetworkStatusChange: true,
    onCompleted: () => {
      loadVault(selectedVault, data);
    },
  });

  const refresh = async () => {
    try {
      await refetch();
    } catch (error) {
      // catch error in case the vault screen is changed
    }
  };

  const resetFields = () => {
    setBurnFee("0");
    setAddCollateralUSD("0");
    setAddCollateralTxt("");
    setRemoveCollateralTxt("");
    setRemoveCollateralUSD("0");
    setMintTxt("");
    setMintUSD("0");
    setBurnUSD("0");
    setBurnTxt("");
  };

  const changeVault = async (newRatio: number, reset = false) => {
    let r = newRatio;
    if (reset) {
      r = parseFloat(tempRatio);
      setVaultRatio(tempRatio);
      setTempRatio("");
      resetFields();
    } else {
      if (tempRatio === "") {
        setTempRatio(vaultRatio);
      }
      r = newRatio;
      setVaultRatio(r.toString());
    }

    if (r === 0) {
      setVaultStatus("N/A");
    } else if (r >= parseFloat(minRatio) + 50) {
      setVaultStatus("safe");
    } else if (r >= parseFloat(minRatio) + 30) {
      setVaultStatus("warning");
    } else if (r >= parseFloat(minRatio)) {
      setVaultStatus("danger");
    } else {
      setVaultRatio("0");
      setVaultStatus("error");
    }
  };

  // forms
  const onChangeAddCollateral = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setAddCollateralTxt(event.target.value);
    if (event.target.value !== "") {
      const currentPrice = ethers.utils.formatEther((await collateralPrice()).mul(10000000000));
      const currentTcapPrice = ethers.utils.formatEther(await tcapPrice());
      let usd = toUSD(currentPrice, event.target.value);
      if (!usd) {
        usd = 0;
      }
      const newCollateral = parseFloat(event.target.value) + parseFloat(vaultCollateral);
      const r = await getRatio(newCollateral.toString(), currentPrice, vaultDebt, currentTcapPrice);
      changeVault(r);
      setAddCollateralUSD(usd.toString());
    } else {
      changeVault(0, true);
      setAddCollateralUSD("0");
    }
  };

  const onChangeRemoveCollateral = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setRemoveCollateralTxt(event.target.value);
    if (event.target.value !== "") {
      const currentPrice = ethers.utils.formatEther((await collateralPrice()).mul(10000000000));
      const currentTcapPrice = ethers.utils.formatEther(await tcapPrice());
      let usd = toUSD(currentPrice, event.target.value);
      if (!usd) {
        usd = 0;
      }
      const newCollateral = parseFloat(vaultCollateral) - parseFloat(event.target.value);
      const r = await getRatio(newCollateral.toString(), currentPrice, vaultDebt, currentTcapPrice);
      changeVault(r);
      setRemoveCollateralUSD(usd.toString());
    } else {
      changeVault(0, true);
      setRemoveCollateralUSD("0");
    }
  };

  const onChangeMint = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setMintTxt(event.target.value);
    if (event.target.value !== "") {
      const currentPrice = ethers.utils.formatEther((await collateralPrice()).mul(10000000000));
      const currentTcapPrice = ethers.utils.formatEther(await tcapPrice());
      let usd = toUSD(currentTcapPrice, event.target.value);
      if (!usd) {
        usd = 0;
      }
      const newDebt = parseFloat(event.target.value) + parseFloat(vaultDebt);
      const r = await getRatio(vaultCollateral, currentPrice, newDebt.toString(), currentTcapPrice);
      changeVault(r);
      setMintUSD(usd.toString());
    } else {
      changeVault(0, true);
      setMintUSD("0");
    }
  };

  const onChangeBurn = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setBurnTxt(event.target.value);
      if (event.target.value !== "") {
        const currentPrice = ethers.utils.formatEther((await collateralPrice()).mul(10000000000));
        const currentTcapPrice = ethers.utils.formatEther(await tcapPrice());
        let usd = toUSD(currentTcapPrice, event.target.value);
        if (!usd) {
          usd = 0;
        }
        const newDebt = parseFloat(vaultDebt) - parseFloat(event.target.value);
        const r = await getRatio(
          vaultCollateral,
          currentPrice,
          newDebt.toString(),
          currentTcapPrice
        );
        changeVault(r);
        setBurnUSD(usd.toString());
        const currentBurnFee = await selectedVaultContract?.getFee(
          ethers.utils.parseEther(event.target.value)
        );
        const increasedFee = currentBurnFee.add(currentBurnFee.div(100)).toString();
        const ethFee = ethers.utils.formatEther(increasedFee);
        setBurnFee(ethFee.toString());
      } else {
        changeVault(0, true);
        setBurnUSD("0");
        setBurnFee("0");
      }
    } catch (error) {
      console.error(error);
      changeVault(0, true);
      setBurnUSD("0");
      setBurnFee("0");
    }
  };

  const addCollateral = async () => {
    if (addCollateralTxt) {
      // fix decimals
      const amount = ethers.utils.parseUnits(addCollateralTxt, selectedVaultDecimals);

      // const amount = ethers.utils.parseEther(addCollateralTxt);
      try {
        if (selectedVault === "ETH") {
          const tx = await selectedVaultContract?.addCollateralETH({
            value: amount,
          });
          notifyUser(tx, refresh);
        } else {
          const tx = await selectedVaultContract?.addCollateral(amount);
          notifyUser(tx, refresh);
        }
      } catch (error) {
        console.error(error);
        if (error.code === 4001) {
          errorNotification("Transaction rejected");
        } else {
          errorNotification("Insufficient funds to stake");
        }
      }
      setAddCollateralTxt("");
      setAddCollateralUSD("0");
    } else {
      errorNotification("Field can't be empty");
    }
  };

  const maxAddCollateral = async (e: React.MouseEvent) => {
    e.preventDefault();
    let balance = "0";
    if (selectedVault === "ETH") {
      const network = process.env.REACT_APP_NETWORK_NAME;
      const provider = ethers.getDefaultProvider(network, {
        infura: process.env.REACT_APP_INFURA_ID,
        alchemy: process.env.REACT_APP_ALCHEMY_KEY,
      });

      balance = ethers.utils.formatEther(await provider.getBalance(address));
    } else if (selectedCollateralContract) {
      const value = BigNumber.from(await selectedCollateralContract.balanceOf(address));
      balance = ethers.utils.formatUnits(value, selectedVaultDecimals);
    }
    const currentPrice = ethers.utils.formatEther((await collateralPrice()).mul(10000000000));
    const currentTcapPrice = ethers.utils.formatEther(await tcapPrice());
    setAddCollateralTxt(balance);
    let usd = toUSD(currentPrice, balance);
    if (!usd) {
      usd = 0;
    }
    const newCollateral = parseFloat(balance) + parseFloat(vaultCollateral);
    const r = await getRatio(newCollateral.toString(), currentPrice, vaultDebt, currentTcapPrice);
    changeVault(r);
    setAddCollateralUSD(usd.toString());
  };

  const removeCollateral = async () => {
    if (removeCollateralTxt) {
      const amount = ethers.utils.parseUnits(removeCollateralTxt, selectedVaultDecimals);

      try {
        if (selectedVault === "ETH") {
          const tx = await selectedVaultContract?.removeCollateralETH(amount);
          notifyUser(tx, refresh);
        } else {
          const tx = await selectedVaultContract?.removeCollateral(amount);
          notifyUser(tx, refresh);
        }
      } catch (error) {
        console.error(error);
        if (error.code === 4001) {
          errorNotification("Transaction rejected");
        } else {
          errorNotification("Not enough collateral on vault");
        }
      }
      setRemoveCollateralTxt("");
      setRemoveCollateralUSD("0");
    } else {
      errorNotification("Field can't be empty");
    }
  };

  const safeRemoveCollateral = async (e: React.MouseEvent) => {
    e.preventDefault();
    const currentPrice = ethers.utils.formatEther((await collateralPrice()).mul(10000000000));
    const currentTcapPrice = ethers.utils.formatEther(await tcapPrice());
    const collateralToRemove = await getSafeRemoveCollateral(
      minRatio,
      vaultCollateral,
      currentPrice,
      currentTcapPrice,
      vaultDebt
    );
    setRemoveCollateralTxt(collateralToRemove.toString());
    let usd = toUSD(currentPrice, collateralToRemove.toString());
    if (!usd) {
      usd = 0;
    }
    const newCollateral = parseFloat(vaultCollateral) - collateralToRemove;
    const r = await getRatio(newCollateral.toString(), currentPrice, vaultDebt, currentTcapPrice);
    changeVault(r);
    setRemoveCollateralUSD(usd.toString());
  };

  const mintTCAP = async () => {
    if (mintTxt) {
      try {
        const amount = ethers.utils.parseEther(mintTxt);
        const tx = await selectedVaultContract?.mint(amount);
        notifyUser(tx, refresh);
      } catch (error) {
        console.error(error);
        if (error.code === 4001) {
          errorNotification("Transaction rejected");
        } else {
          errorNotification("Not enough collateral on vault");
        }
      }
      setMintTxt("");
      setMintUSD("0");
    } else {
      errorNotification("Field can't be empty");
    }
  };

  const safeMintTCAP = async (e: React.MouseEvent) => {
    e.preventDefault();
    const currentPrice = ethers.utils.formatEther((await collateralPrice()).mul(10000000000));
    const currentTcapPrice = ethers.utils.formatEther(await tcapPrice());
    const safeMint = await getSafeMint(
      minRatio,
      vaultCollateral,
      currentPrice,
      currentTcapPrice,
      vaultDebt
    );
    setMintTxt(safeMint.toString());
    let usd = toUSD(currentTcapPrice, safeMint.toString());
    if (!usd) {
      usd = 0;
    }
    const newDebt = safeMint + parseFloat(vaultDebt);
    const r = await getRatio(vaultCollateral, currentPrice, newDebt.toString(), currentTcapPrice);
    changeVault(r);
    setMintUSD(usd.toString());
  };

  const burnTCAP = async () => {
    if (burnTxt) {
      try {
        const amount = ethers.utils.parseEther(burnTxt);
        const currentBurnFee = await selectedVaultContract?.getFee(amount);
        const increasedFee = currentBurnFee.add(currentBurnFee.div(100)).toString();
        const ethFee = ethers.utils.formatEther(increasedFee);
        setBurnFee(ethFee.toString());
        const tx = await selectedVaultContract?.burn(amount, { value: increasedFee });
        notifyUser(tx, refresh);
      } catch (error) {
        console.error(error);
        if (error.code === 4001) {
          errorNotification("Transaction rejected");
        } else {
          errorNotification("Burn value too high");
        }
      }
      setBurnTxt("");
      setBurnUSD("0");
      setBurnFee("0");
    } else {
      errorNotification("Field can't be empty");
    }
  };

  const maxBurnTCAP = async (e: React.MouseEvent) => {
    e.preventDefault();
    const currentPrice = ethers.utils.formatEther((await collateralPrice()).mul(10000000000));
    const currentTcapPrice = ethers.utils.formatEther(await tcapPrice());
    const currentBalanceCall = await tokens.tcapTokenRead?.balanceOf(address);
    const currentVaultDebtCall = await selectedVaultRead?.vaults(selectedVaultId);

    // @ts-ignore
    const [currentBalance, currentVault] = await signer.ethcallProvider?.all([
      currentBalanceCall,
      currentVaultDebtCall,
    ]);

    let balanceFormat = "0";
    let balance;
    if (currentBalance.lt(currentVault.Debt)) {
      balanceFormat = ethers.utils.formatEther(currentBalance);
      balance = currentBalance;
    } else {
      balanceFormat = vaultDebt;
      balance = currentVault.Debt;
    }
    setBurnTxt(balanceFormat);
    let usd = toUSD(currentTcapPrice, balanceFormat);
    if (!usd) {
      usd = 0;
    }
    const newDebt = parseFloat(balanceFormat) - parseFloat(balanceFormat);
    const r = await getRatio(vaultCollateral, currentPrice, newDebt.toString(), currentTcapPrice);
    changeVault(r);
    setBurnUSD(usd.toString());

    if (balanceFormat !== "0") {
      const currentBurnFee = await selectedVaultContract?.getFee(balance);
      const increasedFee = currentBurnFee.add(currentBurnFee.div(100)).toString();
      const ethFee = ethers.utils.formatEther(increasedFee);
      setBurnFee(ethFee.toString());
    } else {
      setBurnFee("0");
    }
  };

  const action = async () => {
    if (selectedVaultId === "0") {
      const tx = await selectedVaultContract?.createVault();
      notifyUser(tx, refresh);
    } else {
      const amount = approveValue;
      const tx = await selectedCollateralContract?.approve(selectedVaultContract?.address, amount);
      notifyUser(tx, refresh);
    }
  };

  const onChangeVault = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedVault(event.target.value);
    // Clean form
    setAddCollateralTxt("");
    setAddCollateralUSD("0");
    setRemoveCollateralTxt("");
    setRemoveCollateralUSD("0");
    setMintTxt("");
    setMintUSD("0");
    setBurnTxt("");
    setBurnUSD("0");
    setBurnFee("0");
    // Load values
    history?.push(`/vault/${event.target.value}`);
    await refetch();
  };

  useEffect(() => {
    async function load() {
      // TODO : if stuck at pending do something
      if (networkStatus === NetworkStatus.ready || networkStatus === NetworkStatus.error) {
        // await loadVault(selectedVault);
        setIsLoading(false);
      }
    }
    load();
    // eslint-disable-next-line
  }, [address, data]);

  if (isLoading) {
    return (
      <div className="loading-container">
        <Loading title="Loading Vault" message="Please wait..." />
      </div>
    );
  }

  return (
    <>
      <p>Select your Collateral</p>
      <div className="icon-container">
        {(() => {
          switch (selectedVault) {
            case "DAI":
              return <DAIIconSmall className="dai" />;
            case "WBTC":
              return <BTCIconSmall className="btc" />;
            default:
              return <ETHIconSmall className="weth" />;
          }
        })()}

        <div className="select-container">
          <Form.Control as="select" onChange={onChangeVault} value={selectedVault}>
            <option value="ETH">ETH</option>
            <option>WETH</option>
            {/* <option>WBTC</option> */}
            <option>DAI</option>
          </Form.Control>
          <p className="number">
            <NumberFormat
              className="number"
              value={tokenBalance}
              displayType="text"
              thousandSeparator
              decimalScale={2}
            />{" "}
            {selectedVault} /{" "}
            <NumberFormat
              className="number"
              value={tokenBalanceUSD}
              displayType="text"
              thousandSeparator
              prefix="$"
              decimalScale={2}
            />
          </p>
        </div>
      </div>
      {isApproved ? (
        <>
          <div className="actions-container">
            <div className="balance">
              <Card>
                {(() => {
                  switch (selectedVault) {
                    case "DAI":
                      return <DAIIcon className="eth" />;
                    case "WBTC":
                      return <WBTCIcon className="eth" />;
                    default:
                      return <ETHIcon className="eth" />;
                  }
                })()}
                <div className="info">
                  <h4>{selectedVault} Balance</h4>
                  <div>
                    <div className="amount">
                      {(() => {
                        switch (selectedVault) {
                          case "DAI":
                            return <DAIIconSmall className="dai small" />;
                          case "WBTC":
                            return <BTCIconSmall className="btc small" />;
                          default:
                            return <ETHIconSmall className="small" />;
                        }
                      })()}
                      <h4 className=" ml-2 number neon-highlight">
                        <NumberFormat
                          className="number"
                          value={tokenBalance}
                          displayType="text"
                          thousandSeparator
                          decimalScale={tokenBalanceDecimals}
                        />
                      </h4>
                    </div>
                    <p className="number">
                      <NumberFormat
                        className="number"
                        value={tokenBalanceUSD}
                        displayType="text"
                        thousandSeparator
                        prefix="$"
                        decimalScale={parseFloat(tokenBalanceUSD) > 1000 ? 0 : 2}
                      />
                    </p>
                  </div>
                </div>
              </Card>
              <Card>
                <RatioIcon className="ratio" />
                <div className="info">
                  <h4>Vault Ratio</h4>{" "}
                  <OverlayTrigger
                    key="top"
                    placement="top"
                    overlay={
                      <Tooltip id="tooltip-top">
                        Ratio must be {`>`} {minRatio}% or you will be liquidated
                      </Tooltip>
                    }
                  >
                    <Button variant="dark">?</Button>
                  </OverlayTrigger>
                  <div>
                    <div className="amount">
                      <h4 className=" ml-2 number neon-blue">
                        <NumberFormat
                          className="number"
                          value={vaultRatio}
                          displayType="text"
                          thousandSeparator
                          decimalScale={0}
                          suffix="%"
                        />
                      </h4>
                    </div>
                    <p className={`number ${vaultStatus}`}>{vaultStatus.toUpperCase()}</p>
                  </div>
                </div>
              </Card>
            </div>
            <div className="form-card">
              <Card>
                <div className="info">
                  <h4>Staked Collateral</h4>
                  <div>
                    <div className="amount">
                      {(() => {
                        switch (selectedVault) {
                          case "DAI":
                            return <DAIIconSmall className="dai" />;
                          case "WBTC":
                            return <BTCIconSmall className="btc" />;
                          default:
                            return <ETHIconSmall className="weth" />;
                        }
                      })()}
                      <h4 className=" ml-2 number neon-dark-blue">
                        <NumberFormat
                          className="number"
                          value={vaultCollateral}
                          displayType="text"
                          thousandSeparator
                          decimalScale={2}
                        />
                      </h4>
                    </div>
                    <p className="number">
                      <NumberFormat
                        className="number"
                        value={vaultCollateralUSD}
                        displayType="text"
                        thousandSeparator
                        prefix="$"
                        decimalScale={parseFloat(vaultCollateralUSD) > 1000 ? 0 : 2}
                      />
                    </p>
                  </div>
                </div>
                <Form>
                  <Form.Group>
                    <Form.Label>Add Collateral</Form.Label>
                    <Form.Label className="max">
                      <a href="/" className="number" onClick={maxAddCollateral}>
                        MAX
                      </a>
                    </Form.Label>
                    <InputGroup>
                      <Form.Control
                        type="number"
                        placeholder=""
                        className="neon-green"
                        value={addCollateralTxt}
                        onChange={onChangeAddCollateral}
                      />
                      <InputGroup.Append>
                        <Button className="neon-green" onClick={addCollateral}>
                          +
                        </Button>
                      </InputGroup.Append>
                    </InputGroup>
                    <Form.Text className="text-muted">
                      <NumberFormat
                        className="number"
                        value={addCollateralUSD}
                        displayType="text"
                        thousandSeparator
                        prefix="$"
                        decimalScale={2}
                      />
                    </Form.Text>
                  </Form.Group>
                  <Form.Group className="remove">
                    <Form.Label>Remove Collateral</Form.Label>
                    <Form.Label className="max">
                      <a href="/" className="number orange" onClick={safeRemoveCollateral}>
                        MAX SAFE
                      </a>
                    </Form.Label>
                    <InputGroup>
                      <Form.Control
                        type="number"
                        placeholder=""
                        className="neon-orange"
                        value={removeCollateralTxt}
                        onChange={onChangeRemoveCollateral}
                      />
                      <InputGroup.Append>
                        <Button className="neon-orange" onClick={removeCollateral}>
                          -
                        </Button>
                      </InputGroup.Append>
                    </InputGroup>
                    <Form.Text className="text-muted">
                      <NumberFormat
                        className="number"
                        value={removeCollateralUSD}
                        displayType="text"
                        thousandSeparator
                        prefix="$"
                        decimalScale={2}
                      />
                    </Form.Text>
                  </Form.Group>
                </Form>
              </Card>
            </div>
            <div className="form-card">
              <Card>
                <div className="info">
                  <h4>Vault Debt</h4>
                  <div>
                    <div className="amount">
                      <TcapIcon className="tcap-neon" />
                      <h4 className=" ml-2 number neon-pink">
                        <NumberFormat
                          className="number"
                          value={vaultDebt}
                          displayType="text"
                          thousandSeparator
                          decimalScale={2}
                        />
                      </h4>
                    </div>
                    <p className="number">
                      <NumberFormat
                        className="number"
                        value={vaultDebtUSD}
                        displayType="text"
                        thousandSeparator
                        prefix="$"
                        decimalScale={parseFloat(vaultDebtUSD) > 1000 ? 0 : 2}
                      />
                    </p>
                  </div>
                </div>
                <Form>
                  <Form.Group>
                    <Form.Label>Mint TCAP</Form.Label>
                    <Form.Label className="max">
                      <a href="/" className="number" onClick={safeMintTCAP}>
                        MAX SAFE
                      </a>
                    </Form.Label>
                    <InputGroup>
                      <Form.Control
                        type="number"
                        placeholder=""
                        className="neon-green"
                        value={mintTxt}
                        onChange={onChangeMint}
                      />
                      <InputGroup.Append>
                        <Button className="neon-green" onClick={mintTCAP}>
                          +
                        </Button>
                      </InputGroup.Append>
                    </InputGroup>
                    <Form.Text className="text-muted">
                      <NumberFormat
                        className="number"
                        value={mintUSD}
                        displayType="text"
                        thousandSeparator
                        prefix="$"
                        decimalScale={2}
                      />
                    </Form.Text>
                  </Form.Group>
                  <Form.Group className="remove">
                    <Form.Label>Burn TCAP</Form.Label>
                    <Form.Label className="max">
                      <a href="/" className="number orange" onClick={maxBurnTCAP}>
                        MAX
                      </a>
                    </Form.Label>
                    <InputGroup>
                      <Form.Control
                        type="number"
                        placeholder=""
                        className="neon-orange"
                        value={burnTxt}
                        onChange={onChangeBurn}
                      />
                      <InputGroup.Append>
                        <Button className="neon-orange" onClick={burnTCAP}>
                          -
                        </Button>
                      </InputGroup.Append>
                    </InputGroup>
                    <Form.Text className="text-muted">
                      <NumberFormat
                        className="number"
                        value={burnUSD}
                        displayType="text"
                        thousandSeparator
                        prefix="$"
                        decimalScale={2}
                      />
                    </Form.Text>
                    <Form.Text className="text-muted burn-fee">
                      Burn Fee:{" "}
                      <NumberFormat
                        className="number neon-pink"
                        value={burnFee}
                        displayType="text"
                        thousandSeparator
                        decimalScale={4}
                      />{" "}
                      ETH
                    </Form.Text>
                  </Form.Group>
                </Form>
              </Card>
            </div>
          </div>
        </>
      ) : (
        <div className="pre-actions">
          <h5 className="action-title">{title}</h5>
          <p>{text}</p>
          <Button variant="pink neon-pink" onClick={action}>
            {title}
          </Button>
        </div>
      )}
    </>
  );
};

export default Details;
