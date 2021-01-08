import React from "react";
import Modal from "react-bootstrap/esm/Modal";
import Button from "react-bootstrap/esm/Button";
import Form from "react-bootstrap/esm/Form";
import InputGroup from "react-bootstrap/esm/InputGroup";
import "../../styles/modal.scss";

type props = {
  show: boolean;
  onHide: () => void;
};

export const NewProposal = ({ show, onHide }: props) => (
  <Modal
    show={show}
    size="lg"
    aria-labelledby="contained-modal-title-vcenter"
    centered
    onHide={onHide}
  >
    <Modal.Header closeButton>
      <Modal.Title id="contained-modal-title-vcenter">New Proposal</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <p>
        Create a new proposla with a maximun of 10 actions. You need a total of 100,000 CTX
        delegated to your address in order to create a new proposal
      </p>
      <Form>
        <Form.Group>
          <Form.Label>Description</Form.Label>
          <Form.Control type="text" placeholder="" className="neon-green" />
        </Form.Group>
        <Form.Group>
          <Form.Label>Add Action</Form.Label>
          <InputGroup>
            <Form.Control type="text" placeholder="" className="neon-green" />
            <InputGroup.Append>
              <Button className="neon-green">+</Button>
            </InputGroup.Append>
          </InputGroup>
        </Form.Group>
      </Form>
    </Modal.Body>
    <Modal.Footer>
      <Button variant="primary" className="neon-highlight">
        Create Proposal
      </Button>
    </Modal.Footer>
  </Modal>
);
