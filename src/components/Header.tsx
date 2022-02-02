import React, { useContext, useEffect, useState } from "react";
import Nav from "react-bootstrap/esm/Nav";
import Button from "react-bootstrap/esm/Button";
import Dropdown from "react-bootstrap/Dropdown";
import OverlayTrigger from "react-bootstrap/esm/OverlayTrigger";
import Tooltip from "react-bootstrap/esm/Tooltip";
import { useTranslation } from "react-i18next";
import "../styles/header.scss";
import { ethers } from "ethers";
import Davatar from "@davatar/react";
import NumberFormat from "react-number-format";
import { ChangeNetwork } from "./modals/ChangeNetwork";
import SignerContext from "../state/SignerContext";
import { Web3ModalContext } from "../state/Web3ModalContext";
import TokensContext from "../state/TokensContext";
import NetworkContext from "../state/NetworkContext";
import { makeShortAddress, getENS, isPolygon } from "../utils/utils";
import { FEATURES, NETWORKS } from "../utils/constants";
import { ReactComponent as TcapIcon } from "../assets/images/tcap-coin.svg";
import { ReactComponent as ETHIcon } from "../assets/images/graph/weth.svg";
import { ReactComponent as OPTIMISMIcon } from "../assets/images/graph/optimism.svg";
import { ReactComponent as POLYGONIcon } from "../assets/images/polygon2.svg";

type props = {
  signerAddress: string;
};
type propsDD = {
  className: string;
};

const Header = ({ signerAddress }: props) => {
  const { t, i18n } = useTranslation();
  const web3Modal = useContext(Web3ModalContext);
  const signer = useContext(SignerContext);
  const tokens = useContext(TokensContext);
  const currentNetwork = useContext(NetworkContext);
  const [showChangeNetwork, setShowChangeNetwork] = useState(false);
  const [address, setAddress] = useState("0x0000000000000000000000000000000000000000");
  const [addressField, setAddressField] = useState("");
  const [tokenBalance, setTokenBalance] = useState("0.0");
  const [language, setLanguage] = useState("EN");

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
    let chainName = "Polygon Mainnet";
    let currency = "Matic Token";
    let symbol = "MATIC";
    let rpcUrl = "https://rpc-mainnet.maticvigil.com/";
    let blockUrl = "https://polygonscan.com/";

    if (newChainId === NETWORKS.mumbai.hexChainId) {
      chainName = "Mumbai";
      currency = "Matic Token";
      symbol = "MATIC";
      rpcUrl = "https://rpc-mumbai.maticvigil.com/";
      blockUrl = "https://mumbai.polygonscan.com/";
    }
    if (newChainId === NETWORKS.okovan.hexChainId) {
      chainName = "Optimistic Ethereum (Kovan)";
      currency = "Ether (ETH)";
      symbol = "ETH";
      rpcUrl = "https://kovan.optimism.io";
      blockUrl = "https://kovan-optimistic.etherscan.io";
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
            blockExplorerUrls: [blockUrl],
          },
        ],
      });
    } catch (addError) {
      // handle "add" error
    }
  }

  async function changeNetwork(newChainId: string) {
    if (currentNetwork.wallet === "metamask") {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: newChainId }],
        });
      } catch (error) {
        // This error code indicates that the chain has not been added to MetaMask.
        if (
          error.code === 4902 &&
          (newChainId !== NETWORKS.mainnet.hexChainId || newChainId !== NETWORKS.rinkeby.hexChainId)
        ) {
          addNetwork(newChainId);
        }
      }
    }
  }

  useEffect(() => {
    const loadAddress = async () => {
      if (signerAddress !== "" && signer.signer && tokens.tcapToken) {
        const filterMint = tokens.tcapToken.filters.Transfer(null, signerAddress);
        const filterBurn = tokens.tcapToken.filters.Transfer(signerAddress, null);
        tokens.tcapToken.on(filterMint, async () => {
          const currentBalance = await tokens.tcapToken?.balanceOf(signerAddress);
          setTokenBalance(ethers.utils.formatEther(currentBalance));
        });

        tokens.tcapToken.on(filterBurn, async () => {
          const currentBalance = await tokens.tcapToken?.balanceOf(signerAddress);
          setTokenBalance(ethers.utils.formatEther(currentBalance));
        });
        const ens = await getENS(signerAddress);
        if (ens) {
          setAddressField(ens);
        } else {
          setAddressField(makeShortAddress(signerAddress));
        }

        setAddress(signerAddress);
        const currentTcapBalance = await tokens.tcapToken.balanceOf(signerAddress);
        setTokenBalance(ethers.utils.formatEther(currentTcapBalance));
      }
      let lng = localStorage.getItem("language");
      if (lng) {
        if (lng === "en-US") lng = "en";
        setLanguage(lng.toUpperCase());
      }
    };

    loadAddress();
    // eslint-disable-next-line
  }, [signerAddress, currentNetwork.chainId]);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setLanguage(lng.toUpperCase());
    localStorage.setItem("language", lng);
  };

  const handleOnSelect = (eventKey: any, event: Object) => {
    console.log(event);
    changeLanguage(eventKey);
  };

  const LangDropDown = ({ className }: propsDD) => (
    <Dropdown onSelect={handleOnSelect} className={className}>
      <Dropdown.Toggle variant="success" id="dropdown-basic">
        {language}
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Item eventKey="en">English</Dropdown.Item>
        <Dropdown.Item eventKey="zh">繁體中文</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );

  return (
    <Nav className="header">
      {signer.signer ? (
        <>
          {(FEATURES.OPTIMISM || FEATURES.POLYGON) &&
            !window.location.pathname.includes("/governance") && (
              <div className="network-container">
                <Button
                  className="btn"
                  onClick={
                    currentNetwork.wallet === "metamask"
                      ? () => setShowChangeNetwork(true)
                      : () => {}
                  }
                >
                  {currentNetwork.chainId === NETWORKS.okovan.chainId ||
                  isPolygon(currentNetwork.chainId) ? (
                    <div className="title">
                      {currentNetwork.chainId === NETWORKS.okovan.chainId ? (
                        <>
                          <OPTIMISMIcon className="optimism" /> <h6>Kovan</h6>
                        </>
                      ) : (
                        <>
                          <POLYGONIcon className="eth" />
                          {currentNetwork.chainId === NETWORKS.polygon.chainId ? (
                            <h6>Polygon</h6>
                          ) : (
                            <h6>Mumbai</h6>
                          )}
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="title">
                      <ETHIcon className="eth" />
                      {currentNetwork.chainId === NETWORKS.mainnet.chainId ? (
                        <h6>Ethereum</h6>
                      ) : (
                        <h6>Rinkeby</h6>
                      )}
                    </div>
                  )}
                </Button>
              </div>
            )}
          <div className="info">
            <TcapIcon className="tcap-neon" />
            <h5>
              <NumberFormat
                className="number mx-2 neon-pink"
                value={tokenBalance}
                displayType="text"
                thousandSeparator
                prefix=""
                decimalScale={2}
              />
            </h5>
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
            <LangDropDown className="btn-language small" />
          </div>
          <ChangeNetwork
            show={showChangeNetwork}
            onHide={() => setShowChangeNetwork(false)}
            changeNetwork={changeNetwork}
          />
        </>
      ) : (
        <>
          <Button
            variant="pink"
            className="neon-pink"
            onClick={() => {
              web3Modal.toggleModal();
            }}
          >
            {t("connect")}
          </Button>
          <LangDropDown className="btn-language" />
        </>
      )}
    </Nav>
  );
};

export default Header;
