import React from "react";
import Button from "react-bootstrap/esm/Button";
import Card from "react-bootstrap/esm/Card";
import Form from "react-bootstrap/esm/Form";
import InputGroup from "react-bootstrap/esm/InputGroup";
import "../styles/faucet.scss";

const Faucet = () => (
  <div className="faucet">
    <div>
      <h3>Faucet</h3>
      <div className="actions">
        <Card>
          <div className="info">
            <h4>Print Tokens</h4>
          </div>
          <Form>
            <Form.Group>
              <Form.Label>Wallet Address</Form.Label>
              <InputGroup>
                <Form.Control type="text" placeholder="" className="" />
              </InputGroup>
            </Form.Group>
            <Form.Group className="remove">
              <Form.Label>Amount to Print</Form.Label>
              <InputGroup>
                <Form.Control type="text" placeholder="" className="" />
              </InputGroup>
              <Form.Text className="text-muted">You require that amount on ETH</Form.Text>
              <Button variant="pink" className="">
                Print
              </Button>
            </Form.Group>
          </Form>
        </Card>
      </div>
    </div>
  </div>
);

export default Faucet;
