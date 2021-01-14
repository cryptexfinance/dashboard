import React from "react";
import Modal from "react-bootstrap/esm/Modal";
import Button from "react-bootstrap/esm/Button";
import Row from "react-bootstrap/esm/Row";
import Col from "react-bootstrap/esm/Col";
import ProgressBar from "react-bootstrap/esm/ProgressBar";
import ethers from "ethers";
import "../../styles/modal.scss";

type props = {
  show: boolean;
  onHide: () => void;
  description: string;
  forVote: number;
  against: number;
  status: string;
  signatures: string;
  calldatas: string;
  endTime: string;
  proposalId: string;
};

export const Vote = ({
  show,
  onHide,
  description,
  forVote,
  against,
  status,
  signatures,
  calldatas,
  endTime,
  proposalId,
}: props) => {
  const denominator = forVote + against;
  const forRate = denominator !== 0 ? forVote / denominator : 0;
  const againstRate = denominator !== 0 ? against / denominator : 0;
  const animated = status === "PENDING";
  if (calldatas !== "") {
    const abi = new ethers.utils.AbiCoder();
    const decodedCalldata = abi.decode(["address", "uint256"], calldatas);
    console.log("🚀 ~ file: Vote.tsx ~ line 41 ~ decodedCalldata", decodedCalldata);
  }
  // TODO: show the data
  return (
    <Modal
      show={show}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      onHide={onHide}
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">{description}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          Calling: <b>{signatures}</b>
          <br />
          Values: <b>{calldatas}</b>
          <br />
          Voting Close: <b>{endTime}</b>
        </p>

        {denominator !== 0 ? (
          <ProgressBar>
            <ProgressBar
              variant="primary"
              now={forRate}
              key={1}
              animated={animated}
              label={`For 👍: ${forVote}`}
            />
            <ProgressBar
              variant="warning"
              now={againstRate}
              key={2}
              animated={animated}
              label={`Against 👎: ${against}"`}
            />
          </ProgressBar>
        ) : (
          <h5>No votes yet!</h5>
        )}

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
};
