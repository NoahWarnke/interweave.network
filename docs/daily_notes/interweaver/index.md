# Index of interweaver's notes on the Interweave Network project.

### 2018-09-13
- Project naming.
- Nodes and their properties.
- Edges and their properties.
- Creating nodes, unconnected to anything.
- Creating edges between your own nodes.
- Proposing edges between your nodes and other people's nodes.
- Optional exchange of money (eth) for these edge propositions.
- Accepting edge propositions.
- Deleting edges: unilateral, bilateral.
- Deleting nodes.
- Possible mechanisms for auctioning off edges (would be superseded by ERC721)
- Changing the ipfs link, but only with sign-off of other node owners connected to your node.
- Possible fees to take care of possible future Ethereum smart contract rent.
- Avoiding conflicts of interest where smart contract owner is making money off network functioning.
- The value proposition for nodes.
- Dapp front-end (aka viewers) connecting to the Interweave smart contract(s).
- Viewers not just for exploration, but editing your nodes/edges too.

### 2018-10-01
- Setting up a new Git repo.
- Setting up a new GitHub repo and connecting the local one to it.
- Buying and setting up a Google Domain (interweave.network!)

### 2018-10-02
- IPFS (basic).
- readme.md (very basic).
- Building out the initial world (aka, content).
- Edge lengths, subdividing edges, and sanity checking.
- "Rules of Thumb" for building.
- Rules governing edges.
- Handling dead URLs/ipfs links.
- Interweave browsers (aka viewers).
- People, items, and quest logic, etc.

### 2018-10-04
- Running a local http server.
- Trapping MetaMask login/presence cases.

### 2018-10-07
- Reddit accounts
- 'Entrance nodes' and how the creators of different Interweave viewers can control/set that.
- 'Call' and 'send' Web3.eth.Contract methods.

### 2018-10-08
- Organize notes.
- Whitepaper research.
- Whitepaper design.

### 2018-10-09
- Whitepaper abstract ideas.

### 2018-10-13
- Whitepaper research.

### 2018-10-14
- Setting up an IPFS node!
- Ropsten problems, redeploying Set Hash to Rinkeby

### 2018-10-15
- Text format 1 formatting.

### 2018-10-17
- How Edges should work. The HalfEdge + EdgeProposal mechanism!

### 2018-10-18
- Remix as a way to unit test (not great)
- Having a global ownerAddrs array listing all owners, so you could enumerate the whole graph
- How to create/delete HalfEdges
- Returning 'bulk' information for Nodes instead of having to do a lot of address-based lookups for each part of a Node
- Subsequent realizations that you can't return Structs, that you can return a set of values, but there can only be <14 or so of them.
- Initial attempts at refactoring the project's contract into several.

### 2018-10-19
- Nodes, Owners, HalfEdges having names on the blockchain
- ipfs should be bytes32[2], not string
- Functions that return bulk owner node addresses (8 instead of just one), bulk node data (all desired data, including edge addresses, in one bulk return)

### 2018-10-20
- Compiling, locally deploying, and unit testing using Truffle and Ganache
- Getting rid of node.owner and just hashing it into node addresses instead.

### 2018-10-21
- Further thoughts on getting rid of node.owner (you can't, and still have nodes be tradeable)
- The workflow for a User interacting with a Viewer, and which functions would get called during that flow (a minimal set, ideally)
- My use of 'address' (spoiler: changed it to uint256)
- ERC-721 implementation difficulty (shouldn't be very, especially if existing unit tests can be sourced)

### 2018-10-22
- More convenience functions for connecting/disconnecting your own HalfEdges, adding HalfEdges between Nodes at once, and creating 2 HalfEdges and a Node at once.

### 2018-10-23
- Considerations for majorly simplifying things (and reducing costs) by removing HalfEdges entirely. Almost decided against it, but then went for it!
- Considerations for eliminating 'format'. Decided against it.

### 2018-10-24
- How to find the second slot index when traversing an edge
- Transferring Nodes eventually and how this is made impossible by having an unbounded edgeProposalsKeys array belonging to the owner (unbounded number of keys to delete)
- Getting rid of owner edgeProposalKeys array and using event logs to get EdgeProposal keys indexed by nodeKeys
- Getting rid of owner nodeKeys and using event logs to get Node keys indexed by ownerAddr

### 2018-10-25
- Replacing owner info on-chain with event logs: tests indicate it's easy!
- Getting rid of format.
- Adding a 30-byte message string to EdgeProposals in the unused 30 bytes beyond the two slots as a means of personalizing proposals.

### 2018-10-27
- An 'internal mini-audit' of the two Interweave Free contracts against the list of Solidity vulnerabilities.
- Connecting your Ganache private network to MetaMask and accessing accounts in it (and fixing nonce errors when you restart the network)

### 2018-10-28
- Fixing MetaMask when it borks when connecting to Ganache
- Small cheat-sheet of functions that can now be run in the console to test dapp functionality.

### 2018-10-31
- Vue components

### 2018-11-02
- Changing IPFS in full
- New method of calculating node key predictably in full (enabling changing IPFS without changing node key)

## 2018-11-03
- Why doing routing isn't going to work at the moment (with GitHub hosting and http-server)

## 2018-11-04
- Validating ipfs data per its format
- SimpleText format update

## 2018-11-13
- A better way to organize the dapp's model variables

## 2018-11-17
- How to keep objects reactive in Vue
- How to fix bash !: issue
