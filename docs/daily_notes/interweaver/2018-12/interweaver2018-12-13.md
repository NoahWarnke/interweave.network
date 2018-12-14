# Interweaver's to-do items, 2018-12-13:

- Thoughts on how IPFS access should work in general:
  - If the user has no IPFS node, use ipfs.io for accessing IPFS files.
  - With no IPFS node, they cannot upload their own files, so they can't create their own Nodes.
  - If they do have an IPFS node, both access and upload IPFS files via it.
  - Need to check semi-regularly for presence of the node, and have subscribable events for when it comes and goes, or for errors.
  - Should ideally show the user whether they're connected or not, somewhere.
  
- Investigations into how to actually upload to IPFS via browser...
  - So definitely want to use the IPFS api.
  - But how do we get the file to it?
  - Looks like it usually expects a path to the file on your local machine.
  - This necessitates a) downloading, and b) file-choosing the file.
  - But file-choosing to get a file path seems to be blocked in Chrome: just returns C:/fakepath/filename.txt or whatever.
  - Approaches that just use that seem pretty uniformly to fail because of that missing path.
  - I do have an example that does, in fact, work, which seems to:
    - Use a file input to get the File object produced by the input (oo, maybe we can skip the download!)
    - use FileReader to get the data out of the File and into an ArrayBuffer object containing the character data.
    - use some weird "buffer" library to convert the ArrayBuffer to a Uint8Array object.
    - use "ipfs-api" to send the Uint8Array to the ipfs daemon's add method.
  - So, ideally I could skip the entire download/upload cycle, and convert our output Node json string into a Uint8Array directly.
  - Then either we use the "ipfs-api" library, or figure out how it's sending actual data instead of a filepath to the IPFS api.
  - Okay, seems it's the "ipfs-http-client" library now.

- [ ] Build Version 1 (the "free version", i.e. without any way to exchange money) of the Interweave Network.
  - [ ] Create functional DApp
    - [ ] Make build mode:
      - [ ] Add 'draft' Nodes that can be deployed to the smart contract:
        - [ ] Figure out how to interface with the IPFS API and actually accomplish that, getting back the IPFS hash.
          - [ ] Move all IPFS-interface-related code to a dedicated IpfsHandler object. Should abstract all calls for you.
            - [ ] Convert to ipfs-http-client from hand-API calls.
              - [X] Import libraries
              - [ ] Wrap ipfs-http-client in my IpfsHandler instead of direct API calls
                - [ ] Get ipfsApi and buffer objects available.
                - [ ] Detect when node is present and when it goes away
                - [ ] Get file
                - [ ] Add needs to work
                  - [ ] Convert JSON string into an ArrayBuffer object containing the character data.
                  - [ ] Use Buffer library to convert ArrayBuffer into Buffer object.
                  - [ ] use "ipfs-api" to send the Buffer to the ipfs daemon's add method.
                  - [ ] Adding/pinning a node from a file URL
        - [ ] Make a button to deploy to blockchain.
          - [ ] Actually add the new Node
          - [ ] move the Node data from draftIpfsData to ipfsData,
          - [ ] remove the fake key from myDraftNodeKeys,
          - [ ] add real one to myNodeKeys
          - [ ] add blockchain data to nodes
          - [ ] Hunt down all instances of the fake node key in myDraftEdgeProposalKeys and replace with the real one.
      - [ ] My Edge Proposals
        - [ ] Create an app mode for myedgeproposals
        - [ ] Create a test EdgeProposal or two.
        - [ ] Show paged view of all my EdgeProposal keys.
        - [ ] Load EdgeProposal blockchain data (so getting the two Node keys and epmess and slots).
      - [ ] Edge Proposal
        - [ ] Create an App mode for edgeproposal
        - [ ] Show current EdgeProposal key
        - [ ] Show blockchain data
        - [ ] Load Node data and show the names
        - [ ] Make clicking on the Nodes go to them.
    - [ ] Add cookies to save your draft data.
    - [ ] Make a better homepage.
    - [ ] Style things up to the best of my non-designer ability.
    - [ ] Restructure repos:
      - [ ] Create new a) smart contracts, b) viewer, c) simpletext formod, d) interweave.network website repos under interweave.network github account.
      - [ ] Move code from my existing repo into them, making sure my current account has perms to do pull requests
      - [ ] Make the interweave.network website repo contain the correct composition of the other repos.
      - [ ] Set up that website instead of my current one.
      - [ ] Start developing via pull requests.
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
 



 
