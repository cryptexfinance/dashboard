import React, { useContext } from "react";
import Nav from "react-bootstrap/esm/Nav";
import { useWeb3Modal } from '@web3modal/ethers5/react'
import { useTranslation } from "react-i18next";
import "../styles/header.scss";
import { signerContext } from "../state";
import { Button } from "react-bootstrap";

type props = {
  signerAddress: string;
  isMobile: boolean;
};

const Header = ({ signerAddress, isMobile }: props) => {
  const { t } = useTranslation();
  const { open } = useWeb3Modal()
  const signer = useContext(signerContext);
  // const [language, setLanguage] = useState("EN");

  /* useEffect(() => {
    const loadAddress = async () => {
      setLoading(true);
      if (signerAddress !== "" && signer.signer) {
        setLoading(false);
      }
      /* let lng = localStorage.getItem("language");
      if (lng) {
        if (lng === "en-US") lng = "en";
        setLanguage(lng.toUpperCase());
      } 
    };

    loadAddress();
    // eslint-disable-next-line
  }, [signerAddress, currentNetwork.chainId]); */

  // const showDropdown = (): boolean => !isMobile || (isMobile && !loading);

  /* const ArbitrumToggle = () => (
    <>
      <ARBITRUMIcon className="eth" />
      <h6>{process.env.REACT_APP_NETWORK_ID === "1" ? "Arbitrum" : "A. Goerli"}</h6>
    </>
  ); */


  return (
    <Nav className="header">
      {signer.signer ? (
        <>
          <div className="info">
            {/* <div className="info-address">
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
            </div> */}
            <w3m-button />
          </div>
        </>
      ) : (
        <Button
          variant="pink"
          className="neon-pink btn-connect"
          onClick={() => open()}
        >
          <>{t("connect")}</>
        </Button>
      )}
    </Nav>
  );
};

export default Header;
