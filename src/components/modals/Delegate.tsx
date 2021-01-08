import React from "react";
import Modal from "react-bootstrap/esm/Modal";
import Button from "react-bootstrap/esm/Button";
import Form from "react-bootstrap/esm/Form";
import "../../styles/modal.scss";

type props = {
  show: boolean;
  onHide: () => void;
};

export const Delegate = ({ show, onHide }: props) => (
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
          <Form.Control type="text" placeholder="" className="neon-green" />
        </Form.Group>
      </Form>
    </Modal.Body>
    <Modal.Footer>
      <Button variant="primary" className="neon-highlight">
        Delegate Tokens
      </Button>
    </Modal.Footer>
  </Modal>
);
