import React from "react";
import Modal from "react-bootstrap/esm/Modal";
import Button from "react-bootstrap/esm/Button";
import { NETWORKS } from "../../utils/constants";
import { useNetworks } from "../../hooks/useNetworks";
import { ReactComponent as ETHIconSmall } from "../../assets/images/vault/eth.svg";
import { ReactComponent as POLYGONIconSmall } from "../../assets/images/vault/polygon.svg";

type props = {
  show: boolean;
  onHide: () => void;
  changeNetwork: (chainId: string) => void;
};

export const ChangeNetwork = ({ show, onHide, changeNetwork }: props) => {
  const networks = useNetworks();

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
        <Modal.Title id="contained-modal-title-vcenter">Choose Network</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="change-network">
          {process.env.REACT_APP_NETWORK_NAME === "mainnet" ? (
            <Button
              onClick={() => changeNetwork(NETWORKS.mainnet.hexChainId)}
              disabled={networks.chainId === NETWORKS.mainnet.chainId}
            >
              <ETHIconSmall className="eth" /> Ethereum
            </Button>
          ) : (
            <Button
              onClick={() => changeNetwork(NETWORKS.rinkeby.hexChainId)}
              disabled={networks.chainId === NETWORKS.rinkeby.chainId}
            >
              <ETHIconSmall className="eth" /> Rinkeby
            </Button>
          )}
          <Button
            className="btn-polygon"
            onClick={() => changeNetwork(NETWORKS.polygon.hexChainId)}
            disabled={networks.chainId === NETWORKS.polygon.chainId}
          >
            <POLYGONIconSmall className="polygon" /> Polygon
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};
