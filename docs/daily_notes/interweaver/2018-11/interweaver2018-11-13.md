# Interweaver's to-do items, 2018-11-13:

- Thoughts on dapp model variables:
  - Let's have the dapp have a 'nodes' object, which just maps from node keys to node blockchain data.
    - If a node hasn't been loaded from the blockchain, the node key will map to undefined.
  - Let's also have the dapp have a 'ipfs' object, which maps from ipfs hashes to the JSON-parsed data
    - If a file was never loaded, it's undefined.
    - If it's pending, it's a status: pending object.
    - If it failed to load, it's a status: error object (with the appropriate error).
    - If it failed to parse, it's a status: error object.
    - If it failed validation, it's a status: error object.
  - Then we'd want a 'currentNodeKey' value which is just the key, not the data, for the current node.
    - Then getting current node file, e.g., would be ipfs[nodes[currentNodeKey]], pretty straightforward.
  - Also want a 'myNodes' array which is just an array of node keys belonging to the current address.
  - This way there's no duplication of node data: always look it up in the appropriate spot.
  - Would want to unload IPFS whenever it stops being the current node or on the current 'my nodes' page, since this is potentially large.
  - This all revolves around being able to successfully have object properties and deep-detecting changes to those values...
    


- [ ] Build Version 1 (the "free version", i.e. without any way to exchange money) of the Interweave Network.
  - [ ] DApp
    - [ ] Components and modes:
      - [ ] Build mode
        - [ ] Formod1 build mode (triggered by 'add node' button and then picking formod1 in the dropdown)
      - [ ] My Nodes
        - [ ] Fix data binding on nodes list.
      - [ ] My Edge Proposals
      - [ ] Edge Proposal
    - [ ] Extensively test!
    - [ ] Share somewhere, and fix bugs that people find, haha. This being the "free version", less (but not nothing) is at stake.
  - [ ] Smart contracts
    - [ ] When DApp is ready to share, compile and deploy to testnet!
    - [ ] When DApp is tested and ready to go, deploy to mainnet!
    
- [ ] Build Version 2 (the "payable version", i.e. with the ability to pay/be paid for EdgeProposals, and Nodes are ERC-721s)

- [ ] Write whitepaper:
    - [ ] Fill in sections. Note: leave out implementation details (anything as specific as which smart contracts or fields need to be created.) That goes in yellow paper.
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
 



 
