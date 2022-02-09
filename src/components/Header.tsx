import React, { useContext, useEffect, useState } from "react";
import Nav from "react-bootstrap/esm/Nav";
import Button from "react-bootstrap/esm/Button";
import OverlayTrigger from "react-bootstrap/esm/OverlayTrigger";
import Tooltip from "react-bootstrap/esm/Tooltip";
import "../styles/header.scss";
import { ethers } from "ethers";
import Davatar from "@davatar/react";
import NumberFormat from "react-number-format";
import { ChangeNetwork } from "./modals/ChangeNetwork";
import SignerContext from "../state/SignerContext";
import { Web3ModalContext } from "../state/Web3ModalContext";
import TokensContext from "../state/TokensContext";
import NetworkContext from "../state/NetworkContext";
import { makeShortAddress, getENS, isInLayer1, isOptimism, isPolygon } from "../utils/utils";
import { NETWORKS } from "../utils/constants";
import { ReactComponent as TcapIcon } from "../assets/images/tcap-coin.svg";
import { ReactComponent as ETHIcon } from "../assets/images/graph/weth.svg";
import { ReactComponent as OPTIMISMIcon } from "../assets/images/graph/optimism.svg";
import { ReactComponent as POLYGONIcon } from "../assets/images/polygon2.svg";

type props = {
  signerAddress: string;
};

const Header = ({ signerAddress }: props) => {
  const web3Modal = useContext(Web3ModalContext);
  const signer = useContext(SignerContext);
  const tokens = useContext(TokensContext);
  const currentNetwork = useContext(NetworkContext);
  const [showChangeNetwork, setShowChangeNetwork] = useState(false);
  const [address, setAddress] = useState("0x0000000000000000000000000000000000000000");
  const [addressField, setAddressField] = useState("");
  const [tokenBalance, setTokenBalance] = useState("0.0");

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
          (newChainId === NETWORKS.optimism.hexChainId ||
            newChainId === NETWORKS.okovan.hexChainId ||
            newChainId === NETWORKS.polygon.hexChainId)
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
    };

    loadAddress();
    // eslint-disable-next-line
  }, [signerAddress, currentNetwork.chainId]);

  const EthereumBtn = () => (
    <>
      <ETHIcon className="eth" />
      <h6>{currentNetwork.chainId === NETWORKS.mainnet.chainId ? "Ethereum" : "Rinkeby"}</h6>
    </>
  );

  const OptimismBtn = () => (
    <>
      <OPTIMISMIcon className="optimism" />
      <h6>{currentNetwork.chainId === NETWORKS.optimism.chainId ? "Optimism" : "Kovan"}</h6>
    </>
  );

  const PolygonBtn = () => (
    <>
      <POLYGONIcon className="eth" />
      <h6>{currentNetwork.chainId === NETWORKS.polygon.chainId ? "Polygon" : "Mumbai"}</h6>
    </>
  );

  return (
    <Nav className="header">
      {signer.signer ? (
        <>
          {!window.location.pathname.includes("/governance") && (
            <div className="network-container">
              <Button
                className="btn"
                onClick={
                  currentNetwork.wallet === "metamask" ? () => setShowChangeNetwork(true) : () => {}
                }
              >
                <div className="title">
                  {isInLayer1(currentNetwork.chainId) && EthereumBtn()}
                  {isOptimism(currentNetwork.chainId) && OptimismBtn()}
                  {isPolygon(currentNetwork.chainId) && PolygonBtn()}
                </div>
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
          </div>
          <ChangeNetwork
            show={showChangeNetwork}
            onHide={() => setShowChangeNetwork(false)}
            changeNetwork={changeNetwork}
          />
        </>
      ) : (
        <Button
          variant="pink"
          className="neon-pink"
          onClick={() => {
            web3Modal.toggleModal();
          }}
        >
          Connect Wallet
        </Button>
      )}
    </Nav>
  );
};

export default Header;
