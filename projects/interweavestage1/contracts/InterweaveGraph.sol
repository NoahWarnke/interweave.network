pragma solidity ^0.4.25;

/// @title The Interweave Network graph contract.
/// @author interweaver
/// @notice This is still a development version, but for now, is intended to represent a full graph.
contract InterweaveGraph {
    
    /// @notice Node struct represents a node in the graph (a place), with owner, representation with format, and connections to other Nodes.
    struct Node {
        address ownerAddr;
        bytes32 ipfsHash;
        uint32 format;
        address[6] halfEdgeAddrs;
    }
    
    /// @notice HalfEdge struct represents half of an edge in the graph, with the Node it belongs to, representation with implicit format, and connection to another HalfEdge.
    struct HalfEdge {
        address nodeAddr;
        bytes32 ipfsHash; // format = format of node
        address otherHalfEdgeAddr;
    }
    
    /// @notice Proposal struct represents a proposal to connect or disconnect two Nodes via two HalfEdges belonging to them. halfEdgeAddr0 belongs to the proposer.
    struct Proposal {
        address halfEdgeAddr0;
        address halfEdgeAddr1;
    }
    
    /// @notice Owner struct represents the set of Nodes and Proposals belonging to a particular Ethereum address.
    struct Owner {
        address[] nodeAddrs;
        address[] proposalAddrs;
    }
    
    /// @notice A Mapping allowing lookup of Nodes by their address.
    /// @dev Node addresses = kekkac(ipfsHash)
    mapping (address => Node) nodeLookup;
    
    /// @notice A mapping allowing lookup of HalfEdges by their address.
    /// @dev HalfEdge addresses = kekkac(ipfsHash)
    mapping (address => HalfEdge) halfEdgeLookup;
    
    /// @notice A mapping allowing lookup of Proposals by their address.
    /// @dev Proposal addresses = kekkac(halfEdgeAddr0, halfEdgeAddr1)
    mapping (address => Proposal) proposalLookup;
    
    /// @notice A mapping allowing lookup of Owners by their (Ethereum) address.
    mapping (address => Owner) ownerLookup;
    
    function createNode(bytes32 _ipfs, uint32 _format) external returns (address) { }
    
    function deleteNode(address _nodeAddr) external { }
    
    function createHalfEdge(address _nodeAddr, bytes32 _ipfs) external returns (address) { }
    
    function deleteHalfEdge(address _halfEdgeAddr) external returns (address) { }
    
    function createEdgeProposal(address _halfEdgeAddr0, address _halfEdgeAddr1) external returns (address) { }
    
    function acceptEdgeProposal(address _proposalAddr) external { }
    
    function rejectEdgeProposal(address _proposalAddr) external { }
    
    function getOwnerNodeCount(address _ownerAddr) public view returns (uint) { }
    
    function getOwnerNodeByIndex(address _ownerAddr, uint index) public view returns (address) { }
    
    function getOwnerProposalCount(address _ownerAddr) public view returns (uint) { }
    
    function getOwnerProposalByIndex(address _ownerAddr, uint index) public view returns (address) { }
}
