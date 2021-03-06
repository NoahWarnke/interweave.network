# Interweaver's to-do items, 2018-10-10:

- [X] Read ERC-721 EIP...
  - Interesting, seems to say a 'mechanism is provided to associate NFTs with URIs'. May want to consider this as the IPFS url.

- [ ] Design the Interweave Network.
  - [ ] Rewrite interweave design documents into whitepaper-style document with more carefully-thought-out ideas.
    - [ ] Fill in sections. Note: leave out implementation details (anything as specific as which smart contracts or fields need to be created.) That goes in yellow paper.
      - [X] Rough in some ideas for all sections.
      - [ ] Existing work
      - [ ] Rationale for Interweave Network
      - [ ] Philosophy
      - [ ] Architecture
      - [ ] Applications
      - [ ] Challenges
      - [ ] Summary
      - [ ] Further Reading
    - [ ] Let sit for a few days while doing other things.
    - [ ] Revisions, round 1.
    - [ ] Let sit for another few days while doing other things.
    - [ ] Revisions, round 2.
    - [ ] Publish (reddit? medium? Lol, I've seen enough whitepapers to know where this is going. Not that I have any reach...)
- [ ] Build the network!
  - [ ] Stage 1a
    - [ ] Non-transferrable nodes (not yet ERC721)
    - [ ] Non-deletable edges that you can create between any of your own nodes (that don't already have an edge)
    - [ ] Uses normal URLs for the link value (up to 100 chars)
    - [ ] Node format 1 (simple text) node and edge 1 format (edge-edge, edge-else, else-edge)
    - [ ] Simple front-end viewer that supports exploring a network built of nodetype1 and edgetype1
    - [ ] Network built via direct function calls, not through the viewer.
  - [ ] Stage 1b
    - [ ] Viewer supports a way to add nodes and edges and keep track of your account's nodes.
  - [ ] Stage 1c
    - [ ] Node format 2 (images) and edges 2 format (image-image, image-else, else-image)
  - [ ] Stage 2a
    - [ ] Nodes ERC721 and thus transferrable
    - [ ] Edges proposable according to proposition rules.
    - [ ] Edges deletable according to edge deletion rules.
  - [ ] Stage 2b
    - [ ] Edge proposals/deletions (and node transfers?) in viewer.
  - [ ] Stage 3a
    - [ ] Nodes switch to only supporting IPFS URLs.
  - [ ] Stage 3b
    - [ ] IPFS uploads through the viewer.
  - [ ] Stage 4
    - [ ] Additional formats, like 3d, etc.
