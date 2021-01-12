import React from "react";
import Modal from "react-bootstrap/esm/Modal";
import Button from "react-bootstrap/esm/Button";
import Row from "react-bootstrap/esm/Row";
import Col from "react-bootstrap/esm/Col";
import ProgressBar from "react-bootstrap/esm/ProgressBar";
import "../../styles/modal.scss";

type props = {
  show: boolean;
  onHide: () => void;
};

export const Vote = ({ show, onHide }: props) => (
  <Modal
    show={show}
    size="lg"
    aria-labelledby="contained-modal-title-vcenter"
    centered
    onHide={onHide}
  >
    <Modal.Header closeButton>
      <Modal.Title id="contained-modal-title-vcenter">Raise DAI Vault Fee</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <p>
        Raise DAI Vault with address <b>0x8ad7af3ACec2455f7CC842a1D725c3e51896C13f</b> Burn Fee to
        <b> 2%</b>
      </p>
      <ProgressBar>
        <ProgressBar variant="primary" now={60} key={1} animated label="For 👍: 41,000" />
        <ProgressBar variant="warning" now={40} key={2} animated label="Against 👎: 61,000" />
      </ProgressBar>
      <Row className="mt-4">
        <Col>
          <Button variant="primary" className="neon-highlight">
            For
          </Button>
        </Col>
        <Col>
          <Button variant="warning" className="neon-orange">
            Against
          </Button>
        </Col>
      </Row>
    </Modal.Body>
  </Modal>
);
