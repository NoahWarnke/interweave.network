Notes on interweave.network project.

 [ ] Create Reddit accounts (1 normal, 1 crypto boards (create later), 1 project), get some practice with that.

 [ ] Build basic knowledge of Solidity and web3.js
  [ ] Trap case where the setLink send fails
  [ ] Trap case where the setLink succeeds (and show waiting graphics until then, etc.)
  [ ] Trap case where user logs in/out of MetaMask after page load (need polling?)
  [ ] Trap case where user changes accounts in MetaMask (need polling?)

 [ ] Design the network.
  [ ] Rewrite interweave design document into whitepaper-style document with more carefully-thought-out ideas.

 [ ] Build the network!
  [ ] Stage 1a
  - Non-transferrable nodes (not yet ERC721)
  - Non-deletable edges that you can create between any of your own nodes (that don't already have an edge)
  - Uses normal URLs for the link value (up to 100 chars)
  - Node format #1 (simple text) node and edge 1 format (edge-edge, edge-else, else-edge)
  - Simple front-end viewer that supports exploring a network built of nodetype1 and edgetype1
  - Network built via direct function calls, not through the viewer.
  
  [ ] Stage 1b
  - Viewer supports a way to add nodes and edges and keep track of your account's nodes.
  
  [ ] Stage 1c
  - Node format #2 (images) and edges 2 format (image-image, image-else, else-image)
 
  [ ] Stage 2a
  - Nodes ERC721 and thus transferrable
  - Edges proposable according to proposition rules.
  - Edges deletable according to edge deletion rules.
  
 [ ] Stage 2b
  - Edge proposals/deletions (and node transfers?) in viewer.
  
 [ ] Stage 3a
  - Nodes switch to only supporting IPFS URLs.
  
 [ ] Stage 3b
  - IPFS uploads through the viewer.
  
 [ ] Stage 4
  - additional formats, like 3d, etc.

