import React from "react";
import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";

class MerkleTreeFactory {
  merkleTree: MerkleTree;

  constructor(whitellist: Array<string>) {
    const leaves = whitellist.map((addr) => keccak256(addr));
    this.merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });
  }

  getProof = (address: string): any => this.merkleTree.getHexProof(keccak256(address));

  verify = (address: string): boolean => {
    const merkleRoot = this.merkleTree.getHexRoot();
    const proof = this.getProof(address);

    return this.merkleTree.verify(proof, keccak256(address), merkleRoot);
  };
}

export const useMerkleTree = (whitellist: Array<string>): MerkleTreeFactory => {
  const merkleTree = React.useMemo(() => new MerkleTreeFactory(whitellist), [whitellist]);

  return merkleTree;
};
