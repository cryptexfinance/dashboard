import React from "react";
import Modal from "react-bootstrap/esm/Modal";
import Button from "react-bootstrap/esm/Button";
import { useTranslation } from "react-i18next";
import { FEATURES, NETWORKS } from "../../utils/constants";
import { useNetworks } from "../../hooks/useNetworks";
import { ReactComponent as ETHIconSmall } from "../../assets/images/vault/eth.svg";
import { ReactComponent as POLYGONIconSmall } from "../../assets/images/vault/polygon.svg";
import { ReactComponent as OPTIMISMIconSmall } from "../../assets/images/graph/optimism.svg";

type props = {
  show: boolean;
  onHide: () => void;
  changeNetwork: (chainId: string) => void;
};

export const ChangeNetwork = ({ show, onHide, changeNetwork }: props) => {
  const { t } = useTranslation();
  const networks = useNetworks();

  const PolygonNetworks = () => {
    let { hexChainId, chainId } = NETWORKS.polygon;
    let name = "Polygon";

    if (process.env.REACT_APP_NETWORK_ID !== "1") {
      hexChainId = NETWORKS.mumbai.hexChainId;
      chainId = NETWORKS.mumbai.chainId;
      name = "Mumbai";
    }

    return (
      <Button
        className="btn-polygon"
        onClick={() => changeNetwork(hexChainId)}
        disabled={networks.chainId === chainId}
      >
        <POLYGONIconSmall className="polygon" /> {name}
      </Button>
    );
  };

  return (
    <Modal
      show={show}
      onHide={() => {
        onHide();
      }}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">{t("choose-network")}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="change-network">
          {process.env.REACT_APP_NETWORK_ID === "1" ? (
            <>
              <Button
                onClick={() => changeNetwork(NETWORKS.mainnet.hexChainId)}
                disabled={networks.chainId === NETWORKS.mainnet.chainId}
              >
                <ETHIconSmall className="eth" /> Ethereum
              </Button>
              <Button
                className="btn-polygon"
                onClick={() => changeNetwork(NETWORKS.optimism.hexChainId)}
                disabled={networks.chainId === NETWORKS.optimism.chainId}
              >
                <OPTIMISMIconSmall className="polygon" /> Optimism
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => changeNetwork(NETWORKS.rinkeby.hexChainId)}
                disabled={networks.chainId === NETWORKS.rinkeby.chainId}
              >
                <ETHIconSmall className="eth" /> Rinkeby
              </Button>
              <Button
                className="btn-polygon"
                onClick={() => changeNetwork(NETWORKS.okovan.hexChainId)}
                disabled={networks.chainId === NETWORKS.okovan.chainId}
              >
                <OPTIMISMIconSmall className="polygon" /> Kovan
              </Button>
            </>
          )}
          {FEATURES.POLYGON && <PolygonNetworks />}
        </div>
      </Modal.Body>
    </Modal>
  );
};
