import React, { useState } from "react";
import { Button, Form } from "react-bootstrap";
import { ethers } from "ethers";
import Modal from "react-bootstrap/esm/Modal";
import "../../styles/modal.scss";
import { errorNotification, notifyUser } from "../../utils/utils";

type props = {
  show: boolean;
  currentAddress: string;
  delegatorFactory?: ethers.Contract;
  onHide: () => void;
  refresh: () => void;
};

const NewDelegator = ({ show, currentAddress, delegatorFactory, onHide, refresh }: props) => {
  const [delegatee, setDelegatee] = useState("");

  const onChangeDelegatee = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDelegatee(event.target.value);
  };

  const createDelegator = async (event: React.MouseEvent) => {
    event.preventDefault();
    if (delegatorFactory && currentAddress !== "") {
      if (delegatee) {
        try {
          const tx = await delegatorFactory.createDelegator(delegatee);
          notifyUser(tx, refresh);
          setDelegatee("");
          onHide();
        } catch (error) {
          errorNotification("Delegator for the address already exists.");
        }
      } else {
        errorNotification("Field can't be empty");
      }
    }
  };

  return (
    <Modal
      show={show}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      onHide={() => {
        setDelegatee("");
        onHide();
      }}
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">New Delegator</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="diamond" />
        <Form>
          <p>Create a Delegator contract which will allow you to receive CTX token votes.</p>
          <Form.Group className="" controlId="">
            <Form.Control
              type="text"
              className="neon-green"
              placeholder="Delegatee Address"
              value={delegatee}
              onChange={onChangeDelegatee}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="pink" className="mt-3 mb-4 w-100" onClick={createDelegator}>
          Create Delegator
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default NewDelegator;
