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
    
    /// @notice EdgeProposal struct represents a proposal to connect or disconnect two Nodes via two HalfEdges belonging to them. halfEdgeAddr0 belongs to the proposer.
    struct EdgeProposal {
        address halfEdgeAddr0;
        address halfEdgeAddr1;
    }
    
    /// @notice Owner struct represents the set of Nodes and EdgeProposals belonging to a particular Ethereum address.
    struct Owner {
        address[] nodeAddrs;
        address[] edgeProposalAddrs;
    }
    
    /// @notice A new Node was created on the graph.
    /// @param nodeAddr The address of the created Node.
    /// @param ownerAddr The Ethereum address of the created Node's Owner.
    event NodeCreated(address nodeAddr, address ownerAddr);
    
    /// @notice A Node was deleted from the graph.
    /// @param nodeAddr The address of the Node that was deleted.
    /// @param ownerAddr The Ethereum address of the deleted Node's Owner.
    event NodeDeleted(address nodeAddr, address ownerAddr);
    
    event HalfEdgeCreated(address halfEdgeAddr, address ownerAddr);
    
    event HalfEdgeDeleted(address halfEdge, address ownerAddr);
    
    event EdgeProposalCreated(address edgeProposalAddr, address createrAddr);
    
    event EdgeProposalAccepted(address nodeAddr0, address nodeAddr1, address accepterAddr);
    
    event EdgeProposalRejected(address nodeAddr0, address nodeAddr1, address rejecterAddr);
    
    /// @notice A Mapping allowing lookup of Nodes by their address.
    /// @dev Node addresses = kekkac(ipfsHash)
    mapping (address => Node) public nodeLookup;
    
    /// @notice A mapping allowing lookup of HalfEdges by their address.
    /// @dev HalfEdge addresses = kekkac(ipfsHash)
    mapping (address => HalfEdge) public halfEdgeLookup;
    
    /// @notice A mapping allowing lookup of EdgeProposals by their address.
    /// @dev EdgeProposal addresses = kekkac(halfEdgeAddr0, halfEdgeAddr1)
    mapping (address => EdgeProposal) public edgeProposalLookup;
    
    /// @notice A mapping allowing lookup of Owners by their (Ethereum) address.
    mapping (address => Owner) private ownerLookup;
    
    function createNode(bytes32 _ipfs, uint32 _format) external returns (address) {
        
        address newNodeAddress = address(keccak256(abi.encodePacked(_ipfs)));
        
        // There must not already be a node at that address. Or, in other words,
        // The maze of twisty little passages must *not* be all alike.
        require(
            uint(nodeLookup[newNodeAddress].ownerAddr) == 0,
            "A node with _ipfs already exists!"
        );
    }
    
    function deleteNode(address _nodeAddr) external { }
    
    function createHalfEdge(address _nodeAddr, bytes32 _ipfs) external returns (address) { }
    
    function deleteHalfEdge(address _halfEdgeAddr) external returns (address) { }
    
    function createEdgeProposal(address _halfEdgeAddr0, address _halfEdgeAddr1) external returns (address) { }
    
    function acceptEdgeProposal(address _edgeProposalAddr) external { }
    
    function rejectEdgeProposal(address _edgeProposalAddr) external { }
    
    function getOwnerNodeCount(address _ownerAddr) public view returns (uint) { }
    
    function getOwnerNodeByIndex(address _ownerAddr, uint index) public view returns (address) { }
    
    function getOwnerEdgeProposalCount(address _ownerAddr) public view returns (uint) { }
    
    function getOwnerEdgeProposalByIndex(address _ownerAddr, uint index) public view returns (address) { }
}
