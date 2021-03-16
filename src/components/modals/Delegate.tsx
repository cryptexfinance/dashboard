import React, { useContext, useState } from "react";
import Modal from "react-bootstrap/esm/Modal";
import Button from "react-bootstrap/esm/Button";
import Form from "react-bootstrap/esm/Form";
import "../../styles/modal.scss";
import governanceContext from "../../state/GovernanceContext";
import { isValidAddress, errorNotification, notifyUser } from "../../utils/utils";

type props = {
  show: boolean;
  onHide: () => void;
  refresh: () => void;
};

export const Delegate = ({ show, onHide, refresh }: props) => {
  const governance = useContext(governanceContext);
  const [addressText, setAddressText] = useState("");

  const onChangeAddress = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAddressText(event.target.value);
  };

  const delegateCTX = async (event: React.MouseEvent) => {
    event.preventDefault();
    if (governance) {
      const validAddress = await isValidAddress(addressText);
      if (validAddress && governance.ctxToken) {
        try {
          const tx = await governance.ctxToken.delegate(validAddress);
          notifyUser(tx, refresh);
          setAddressText("");
          onHide();
        } catch (error) {
          if (error.code === 4001) {
            errorNotification("Transaction rejected");
          } else {
            errorNotification("Invalid address");
          }
        }
      } else {
        errorNotification("Invalid address");
      }
    }
  };
  return (
    <Modal
      show={show}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      onHide={onHide}
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">Delegate CTX</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Delegate your CTX tokens to an Adress so it can vote for you.</p>
        <Form>
          <Form.Group>
            <Form.Label>Address</Form.Label>
            <Form.Control
              type="text"
              placeholder="Delegatee Address"
              className="neon-green"
              value={addressText}
              onChange={onChangeAddress}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" className="neon-highlight" onClick={delegateCTX}>
          Delegate Tokens
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
