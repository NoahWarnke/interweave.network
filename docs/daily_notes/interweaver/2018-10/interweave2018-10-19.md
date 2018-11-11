# Interweaver's assorted thoughts, 2018-10-20:

- Owners, Nodes, HalfEdges should all have byte32 names.
- ipfs should all be bye32[2]?

- getNext8Nodes (owner, index) can return 8 node addrs (instead of usual 1)
- getNodeInfo(nodeAddr) can return node basics + halfEdge addrs

- getNext8Proposals(owner, index) can return 8 proposal addrs (instead of usual 1)
- getEdgeProposalInfo(edgeProposalAddr) can return 5 byte32s containing names of Edge items:
  - Owner OwnerName proposes TheirNodeName ---(TheirHalfEdgeName, YourHalfEdgeName)---> TheirHalfEdgeName (5 bytes32)
