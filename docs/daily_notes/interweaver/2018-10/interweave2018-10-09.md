# Interweaver's to-do items, 2018-10-09:

- [ ] Design the Interweave Network.
  - [ ] Rewrite interweave design documents into whitepaper-style document with more carefully-thought-out ideas.
    - [ ] Fill in sections. Note: leave out implementation details (anything as specific as which smart contracts or fields need to be created.) That goes in yellow paper.
      - [X] Abstract
        - Some ideas:
        - The World Wide Web, and in particular the combination of permissioned, owned domain names and free outward hyperlinks, has huge value for its explorability: the property of providing curious human users with infinite avenues to pursue interesting things.
        - However, domain name ownership and trading is extremely centralized, and hyperlink connections are only able to be controlled in one direction.
        - Another class of things hugely valuable for their explorability are games. They provide an interactive space where human users can choose their path through a large set of locations. Again, control of game settings is generally highly centralized.
        - Non-fungible tokens, like ERC721s, are a powerful way for people to own and trade discrete units of a system.
        - The value of these tokens ultimately comes from their properties. Are they limited-edition? Serve some utility? Is attached data somehow significant?
        - Interweave Network proposes to interweave, or combine and connect, a freely-explorable universe built from an unlimited number of different interactive content formats, ranging from simple text to 3D graphics.
        - So the basic point here is: Humans love explorability. The Web and computer games are enormously significant manifestations of this. But both suffer from centralization, and games in particular are highly siloed from one another. Programmable blockchains provide a mechanism to decentralize the ownership, transfer, and management of arbitrary entities. Interweave Network proposes to use one such framework, Ethereum, to build a highly-explorable network where its nodes can be equitably created, owned, and connected entirely by the users of the network, free from the hierarchical interference and vulnerabilities of existing explorable networks under centralized control.
      - [X] Table of contents
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