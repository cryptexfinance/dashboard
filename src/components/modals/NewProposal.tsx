import React, { useContext, useState } from "react";
import Modal from "react-bootstrap/esm/Modal";
import Button from "react-bootstrap/esm/Button";
import Form from "react-bootstrap/esm/Form";
import InputGroup from "react-bootstrap/esm/InputGroup";
import ethers from "ethers";
import governanceContext from "../../state/GovernanceContext";
import "../../styles/modal.scss";
import { errorNotification, notifyUser } from "../../utils/utils";

type props = {
  show: boolean;
  onHide: () => void;
  refresh: () => void;
};

export const NewProposal = ({ show, onHide, refresh }: props) => {
  const governance = useContext(governanceContext);

  const [description, setDescription] = useState("");

  const onChangeDescription = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(event.target.value);
  };

  const createProposal = async (event: React.MouseEvent) => {
    event.preventDefault();
    if (governance.governorAlpha) {
      if (description !== "") {
        try {
          const targets = ["0x5F671E22bb8EFf4C37b1acDe466c544bd87BaD56"];
          const values = ["0"];
          const signatures = ["setRatio(address, uint256)"];
          const abi = new ethers.utils.AbiCoder();
          const calldata = abi.encode(
            ["address", "uint256"],
            ["0x8ad7af3ACec2455f7CC842a1D725c3e51896C13f", "250"]
          );
          const calldatas = [calldata];
          const tx = await governance.governorAlpha.propose(
            targets,
            values,
            signatures,
            calldatas,
            description
          );
          notifyUser(tx, refresh);
          setDescription("");
          onHide();
        } catch (error) {
          console.log("🚀 ~ file: NewProposal.tsx ~ line 36 ~ createProposal ~ error", error);

          if (error.code === 4001) {
            errorNotification("Transaction rejected");
          } else {
            errorNotification("Description can't be empty");
          }
        }
      } else {
        errorNotification("Description can't be empty");
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
      className="green"
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
            <Form.Control
              type="text"
              placeholder=""
              className="neon-green"
              value={description}
              onChange={onChangeDescription}
            />
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
        <Button variant="success" className="neon-green" onClick={createProposal}>
          Create Proposal
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
