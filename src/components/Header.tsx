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
import { makeShortAddress, getENS } from "../utils/utils";
import { NETWORKS } from "../utils/constants";
import { ReactComponent as TcapIcon } from "../assets/images/tcap-coin.svg";
import { ReactComponent as ETHIcon } from "../assets/images/graph/weth.svg";
import { ReactComponent as OPTIMISMIcon } from "../assets/images/graph/optimism.svg";

// TODO: On change account reload page

const Header = () => {
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

  async function changeNetwork(newChainId: string) {
    if (currentNetwork.wallet === "metamask") {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: newChainId }],
        });
      } catch (error) {
        // This error code indicates that the chain has not been added to MetaMask.
        if (error.code === 4902 && newChainId === NETWORKS.okovan.hexChainId) {
          try {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: newChainId,
                  chainName: "Optimistic Ethereum (Kovan)",
                  nativeCurrency: {
                    name: "Ether (ETH)",
                    symbol: "ETH",
                    decimals: 18,
                  },
                  rpcUrls: ["https://kovan.optimism.io"],
                  blockExplorerUrls: ["https://kovan-optimistic.etherscan.io"],
                },
              ],
            });
          } catch (addError) {
            // handle "add" error
          }
        }
      }
    }
  }

  useEffect(() => {
    const loadAddress = async () => {
      if (signer.signer && tokens.tcapToken) {
        const currentAddress = await signer.signer?.getAddress();
        const filterMint = tokens.tcapToken.filters.Transfer(null, currentAddress);
        const filterBurn = tokens.tcapToken.filters.Transfer(currentAddress, null);
        tokens.tcapToken.on(filterMint, async () => {
          const currentBalance = await tokens.tcapToken?.balanceOf(currentAddress);
          setTokenBalance(ethers.utils.formatEther(currentBalance));
        });

        tokens.tcapToken.on(filterBurn, async () => {
          const currentBalance = await tokens.tcapToken?.balanceOf(currentAddress);
          setTokenBalance(ethers.utils.formatEther(currentBalance));
        });
        setAddress(currentAddress);
        const currentTcapBalance = await tokens.tcapToken.balanceOf(currentAddress);
        setTokenBalance(ethers.utils.formatEther(currentTcapBalance));
        const ens = await getENS(currentAddress);
        if (ens) {
          setAddressField(ens);
        } else {
          setAddressField(makeShortAddress(currentAddress));
        }
      }
    };

    loadAddress();
    // eslint-disable-next-line
  }, [signer]);

  return (
    <Nav className="header">
      {signer.signer ? (
        <>
          <div className="network-container">
            <Button
              className="btn"
              onClick={
                currentNetwork.wallet === "metamask" ? () => setShowChangeNetwork(true) : () => {}
              }
            >
              {currentNetwork.chainId === NETWORKS.okovan.chainId ? (
                <div className="title">
                  <OPTIMISMIcon className="optimism" /> <h6>Kovan</h6>
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
