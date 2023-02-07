import React, { useContext, useEffect, useState } from "react";
import Nav from "react-bootstrap/esm/Nav";
import Button from "react-bootstrap/esm/Button";
import Dropdown from "react-bootstrap/Dropdown";
import OverlayTrigger from "react-bootstrap/esm/OverlayTrigger";
import Tooltip from "react-bootstrap/esm/Tooltip";
import { useTranslation } from "react-i18next";
import "../styles/header.scss";
import Davatar from "@davatar/react";
import { networkContext, signerContext, Web3ModalContext } from "../state";
import {
  makeShortAddress,
  getENS,
  isInLayer1,
  isOptimism,
  isPolygon,
  isArbitrum,
} from "../utils/utils";
import { NETWORKS, FEATURES } from "../utils/constants";
import { ReactComponent as LogoutIcon } from "../assets/images/welcome/logout.svg";
import { ReactComponent as ETHIcon } from "../assets/images/graph/weth.svg";
import { ReactComponent as OPTIMISMIcon } from "../assets/images/graph/optimism.svg";
import { ReactComponent as ARBITRUMIcon } from "../assets/images/arbitrum.svg";
import { ReactComponent as POLYGONIcon } from "../assets/images/polygon2.svg";

type props = {
  signerAddress: string;
  isMobile: boolean;
};
/* type propsDD = {
  className: string;
}; */

const Header = ({ signerAddress, isMobile }: props) => {
  const { t } = useTranslation();
  const web3Modal = useContext(Web3ModalContext);
  const signer = useContext(signerContext);
  const currentNetwork = useContext(networkContext);
  const [address, setAddress] = useState("0x0000000000000000000000000000000000000000");
  const [addressField, setAddressField] = useState("");
  // const [language, setLanguage] = useState("EN");
  const [loading, setLoading] = useState(false);

  const copyCodeToClipboard = (e: React.MouseEvent) => {
    e.preventDefault();
    // Create new element
    const el = document.createElement("textarea");
    // Set value (string to be copied)
    el.value = address;
    // Set non-editable to avoid focus and move outside of view
    el.setAttribute("readonly", "");
    document.body.appendChild(el);
    // Select text inside element
    el.select();
    // Copy text to clipboard
    document.execCommand("copy");
    // Remove temporary element
    document.body.removeChild(el);
  };

  async function addNetwork(newChainId: string) {
    let chainName = "Optimism";
    let currency = "Ether (ETH)";
    let symbol = "ETH";
    let rpcUrl = "https://mainnet.optimism.io/";
    let blockExplorerUrl = "https://optimistic.etherscan.io";

    if (newChainId === NETWORKS.arbitrum_goerli.hexChainId) {
      chainName = "Arbitrum Goerli";
      currency = "GoerliETH";
      symbol = "AGOR";
      rpcUrl = "https://goerli-rollup.arbitrum.io/rpc";
      blockExplorerUrl = "https://goerli.arbiscan.io/";
    }
    if (newChainId === NETWORKS.okovan.hexChainId) {
      chainName = "Optimistic Ethereum (Kovan)";
      rpcUrl = "https://kovan.optimism.io";
      blockExplorerUrl = "https://kovan-optimistic.etherscan.io";
    }
    if (newChainId === NETWORKS.polygon.hexChainId) {
      chainName = "Polygon Mainnet";
      currency = "Matic Token";
      symbol = "MATIC";
      rpcUrl = "https://rpc-mainnet.maticvigil.com/";
      blockExplorerUrl = "https://polygonscan.com/";
    }
    if (newChainId === NETWORKS.mumbai.hexChainId) {
      chainName = "Mumbai";
      currency = "Matic Token";
      symbol = "MATIC";
      rpcUrl = "https://rpc-mumbai.maticvigil.com/";
      blockExplorerUrl = "https://mumbai.polygonscan.com/";
    }

    try {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: newChainId,
            chainName,
            nativeCurrency: {
              name: currency,
              symbol,
              decimals: 18,
            },
            rpcUrls: [rpcUrl],
            blockExplorerUrls: [blockExplorerUrl],
          },
        ],
      });
    } catch (addError) {
      // handle "add" error
    }
  }

  const onNetworkChange = async (newChainId: string | null) => {
    if (currentNetwork.isBrowserWallet) {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: newChainId }],
        });
      } catch (error) {
        // This error code indicates that the chain has not been added to MetaMask.
        if (
          error.code === 4902 &&
          (newChainId === NETWORKS.optimism.hexChainId ||
            newChainId === NETWORKS.okovan.hexChainId ||
            newChainId === NETWORKS.arbitrum_goerli.hexChainId ||
            newChainId === NETWORKS.polygon.hexChainId)
        ) {
          addNetwork(newChainId);
        }
      }
    }
  };

  useEffect(() => {
    const loadAddress = async () => {
      setLoading(true);
      if (signerAddress !== "" && signer.signer) {
        const ens = await getENS(signerAddress);
        if (ens) {
          setAddressField(ens);
        } else {
          setAddressField(makeShortAddress(signerAddress));
        }
        setAddress(signerAddress);
        setLoading(false);
      }
      /* let lng = localStorage.getItem("language");
      if (lng) {
        if (lng === "en-US") lng = "en";
        setLanguage(lng.toUpperCase());
      } */
    };

    loadAddress();
    // eslint-disable-next-line
  }, [signerAddress, currentNetwork.chainId]);

  const showDropdown = (): boolean => !isMobile || (isMobile && !loading);

  const ArbitrumToggle = () => (
    <>
      <ARBITRUMIcon className="eth" />
      <h6>{process.env.REACT_APP_NETWORK_ID === "1" ? "Arbitrum" : "A. Goerli"}</h6>
    </>
  );

  const ArbitrumOpt = () => (
    <Dropdown.Item
      key={
        process.env.REACT_APP_NETWORK_ID === "1"
          ? NETWORKS.arbitrum.chainId
          : NETWORKS.arbitrum_goerli.chainId
      }
      eventKey={
        process.env.REACT_APP_NETWORK_ID === "1"
          ? NETWORKS.arbitrum.hexChainId
          : NETWORKS.arbitrum_goerli.hexChainId
      }
    >
      <>{ArbitrumToggle()}</>
    </Dropdown.Item>
  );

  const EthereumToggle = () => (
    <>
      <ETHIcon className="eth" />
      <h6>{process.env.REACT_APP_NETWORK_ID === "1" ? "Ethereum" : "Goerli"}</h6>
    </>
  );

  const EthereumOpt = () => {
    let { chainId } = NETWORKS.mainnet;
    let { hexChainId } = NETWORKS.mainnet;
    if (process.env.REACT_APP_NETWORK_ID === "5") {
      chainId = NETWORKS.goerli.chainId;
      hexChainId = NETWORKS.goerli.hexChainId;
    }

    return (
      <Dropdown.Item key={chainId} eventKey={hexChainId}>
        {EthereumToggle()}
      </Dropdown.Item>
    );
  };

  const OptimismToggle = () => (
    <>
      <OPTIMISMIcon className="optimism" />
      <h6>{process.env.REACT_APP_NETWORK_ID === "1" ? "Optimism" : "Kovan"}</h6>
    </>
  );

  const OptimismOpt = () => (
    <Dropdown.Item
      key={
        process.env.REACT_APP_NETWORK_ID === "1"
          ? NETWORKS.optimism.chainId
          : NETWORKS.okovan.chainId
      }
      eventKey={
        process.env.REACT_APP_NETWORK_ID === "1"
          ? NETWORKS.optimism.hexChainId
          : NETWORKS.okovan.hexChainId
      }
    >
      {OptimismToggle()}
    </Dropdown.Item>
  );

  const PolygonToggle = () => (
    <>
      <POLYGONIcon className="eth" />
      <h6>{process.env.REACT_APP_NETWORK_ID === "1" ? "Polygon" : "Mumbai"}</h6>
    </>
  );

  const PolygonOpt = () => (
    <Dropdown.Item
      key={
        process.env.REACT_APP_NETWORK_ID === "1"
          ? NETWORKS.polygon.chainId
          : NETWORKS.mumbai.chainId
      }
      eventKey={
        process.env.REACT_APP_NETWORK_ID === "1"
          ? NETWORKS.polygon.hexChainId
          : NETWORKS.mumbai.hexChainId
      }
    >
      {PolygonToggle()}
    </Dropdown.Item>
  );

  return (
    <Nav className="header">
      {signer.signer ? (
        <>
          {showDropdown() && (
            <div className="network-container">
              <Dropdown onSelect={(eventKey) => onNetworkChange(eventKey)}>
                <Dropdown.Toggle
                  variant="secondary"
                  id="dropdown-flags"
                  className="text-left"
                  style={{ width: 200 }}
                >
                  <div className="network-toggle">
                    <>
                      {isInLayer1(currentNetwork.chainId) && EthereumToggle()}
                      {isOptimism(currentNetwork.chainId) && OptimismToggle()}
                      {isPolygon(currentNetwork.chainId) && PolygonToggle()}
                      {isArbitrum(currentNetwork.chainId) && ArbitrumToggle()}
                    </>
                  </div>
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {EthereumOpt()}
                  {ArbitrumOpt()}
                  {OptimismOpt()}
                  {FEATURES.POLYGON && PolygonOpt()}
                </Dropdown.Menu>
              </Dropdown>
            </div>
          )}
          <div className="info">
            <div className="info-address">
              <Davatar size={25} address={address} generatedAvatarType="jazzicon" />
              <h5 className="ml-2">
                <OverlayTrigger
                  key="bottom"
                  placement="bottom"
                  overlay={<Tooltip id="tooltip-bottom">Click to Copy</Tooltip>}
                >
                  <a href="/" onClick={copyCodeToClipboard} className="address">
                    {addressField}
                  </a>
                </OverlayTrigger>
              </h5>
            </div>
            <Button
              className="logout"
              onClick={(event) => {
                event.preventDefault();
                web3Modal.clearCachedProvider();
                window.location.reload();
              }}
            >
              <LogoutIcon className="logout-icon" />
            </Button>
            {/* <LangDropDown className="btn-language small" /> */}
          </div>
        </>
      ) : (
        <>
          <Button
            variant="pink"
            className="neon-pink btn-connect"
            onClick={() => {
              web3Modal.toggleModal();
            }}
          >
            <>{t("connect")}</>
          </Button>
          {/* <LangDropDown className="btn-language" /> */}
        </>
      )}
    </Nav>
  );
};

export default Header;
