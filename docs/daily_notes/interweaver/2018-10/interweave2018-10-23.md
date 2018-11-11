# Interweaver's to-do items, 2018-10-23:

- Thoughts on HalfEdges being unnecessarily complicated
  - Haha, it was only a matter of time before I reconsidered this system.
  - As evidenced by yesterday's several "helper functions" ideas, HalfEdges are pretty complicated and expensive.
  - What do they enable?
    - Nodes connected to other Nodes dynamically (i.e., not in the IPFS file, which would be totally impossible to make two-way Edges with, much less keep up to date)
    - Allow dynamically managing *where* these Edges can emerge from the Node (which edge slots)
    - Enforce non-zero IPFS content specifically for that outgoing HalfEdge associated with the Node's content
    - EdgeProposals have something to refer to
    - Failings:
      - Take tons more data (and hence money) to create and manage
      - Don't actually enforce the IPFS data has the same format as their Node, thus making the halfEdge potentially unrenderable (well, it is anyway, but w/e)
  - Alternative implementation idea:
    - Delete HalfEdge struct and halfEdgeLookup
    - Node halfEdgeKeys becomes connectedNodeKeys (with fixed length of 6 - or perhaps a mapping? would be cheaper to start, maybe, but more expensive to look up?)
    - EdgeProposals refer to two nodeKeys, and now additionally two 0-5 indices indicating *which* of the connectedNodeKeys of the targeted Nodes the connection will go between.
    - When creating their IPFS file, users included an "outgoing" section or something similar, which is an object with keys 0-5 (optionally), giving edge names and descriptions (all in the same format)
    - These numbers are what people select when picking the EdgeProposal indices
    - What does this system enable?
      - Nodes connected to other Nodes dynamically (directly instead of via two HalfEdges)
      - Dynamically managing *where* these edges can emerge from the Node (by picking the indices)
      - Enforce same-format IPFS content (it's all part of the same IPFS file)
      - EdgeProposals have something to refer to
      - Failings:
        - The IPFS file may not have an outgoing section, or may not have all the keys, but EdgeProposals to those keys can still be created and accepted.
          - Again, anything related to IPFSes is unenforceable apart from that they aren't empty.
          - In the old system, people could upload junk IPFSes for the HalfEdge IPFSes.
          - In the new system, "junk" is simply the description of the edge not existing.
          - However, this is kind of self-enforcing: the Viewer will only render the outgoing edges that exist in the IPFS file (and have corresponding connectedNodeKeys)
          - Thus you could have connectedNodeKeys with no corresponding IPFS data, but explorers would never see them. This is almost cleaner than before.
        - EdgeProposals become 50% more expensive, due to the two needed indices (could fit them in two uint8s, or even 1, but still requires a full uint256 to store)
        - You have to come up with all the possible outgoing Edges on a Node when you create it, and can't change them later.
          - This kind of makes sense: the outgoing Edges are 100% fully part of the description of the Node, and should be considered at the same time.
          - When you created the IPFS files for HalfEdges in the old system, this would never really change once an Edge was connected, anyway, so it was just a means of delaying when you had to decide what your HalfEdge contained.
          - It also enabled an annoying mechanic where you would propose an Edge with a HalfEdge with a certain IPFS, get rejected, delete the HalfEdge, change the IPFS, and re-propose, hoping the changed HalfEdge met with approval.
          - Now, it's always entirely on whichever Node was created second to make sure its outgoing content (heck, let's still call it a halfedge, just not caps) matches with yours.
            - Hmm, this is actually a little problematic: do we lock ourselves into impossible situations where two long-established Nodes want to connect, but can't?
            - They both have open edge slots
            - However, the content for those edge slots was written long before they were aware of each other's existence.
            - Thus, the edge, once forged, would be anything but seamless.
            - Having updatable HalfEdge content, independent from the Node content, seems like the only way to achieve seamless connection flexibility.
            - This may be a dealbreaker for this simplified idea...
            - To get it to work, the only way I can see is to allow changing the Node's IPFS content.
            - You'd have to not have nodeKeys calculated from just the IPFS, in this case, which would remove the no-duplication property, which was nice.
            - You'd also lose any guarantees about Nodes you made connections with keeping the same content after you made that connection (oops, now I'm locked into a connection with a Node whose content is just porn)
            - Nah, I just can't see allowing changing the IPFS, at least not without some "free disconnect" mechanism, like I've talked about in the past, if you change it.
            - The benefit of owning a Node is purely in being able to manage its connections, and having the option to delete it. Not in changing its content.
            - So yeah, that seems to put the kaibosh on this idea. The added complexity of HalfEdges is needed for making not-previously-planned connections between Nodes.
          
      - Major improvements:
        - Much simpler and cheaper! Tons less code to test (all the HalfEdge stuff), and creating Edges doesn't require all the intermediate HalfEdges and IPFS file creations.
        
- Further thoughts on simplifying things:
  - This really seems to be seamlessness versus accessibility.
  - Can make a more accessible network (cheaper and easier, or mostly just cheaper, because less storage used).
  - Or can make a more seamless one, where users can edit/tailor their HalfEdges to perfectly link up, even if linking nodes created before they knew of each other.
  - In the accessible case, people would probably write their single-IPFS Node+HalfEdges so the HalfEdges were as vague as possible if they were not immediately linking.
  - Like "You walk up the staircase, into the dark..."
  - Okay! How about this as a solution:
    - Say you have a Node you want to connect to another Node, and the Edges of both don't line up well (this is the rarer case - in general, you should create nodes with at least one link already planned, and ideally more of them.)
    - To make a seamless link between Nodes not designed to link, just make another Node in between!
    - Then that Node can handle the transition, because it is designed specifically to bind the unintended edges together.
    - This might be mildly obnoxious in cases where Nodes otherwise were occurring regularly, like on a grid...
    - But basically it's having a Node take the role of an Edge for purposes of seamlessness.
    - In the rareish case where this happens, the user would a) make a new new Node with two outgoing edges tailored to bind their old Node and the other Node's edges.
    - b) toggleEdge on their pair of Nodes
    - c) proposeEdge on their new Node and that of the other party.
    - Voila, a seamless connection is forged. A bit more expensive, since you have to create a Node and call toggleEdge and proposeEdge (or probably, proposeEdge twice)
    - So okay, that seems like a good solution.
  - So now we can have seamlessness and accessibility with the simpler model.
  - I like it!
  - Let's do it. Goodbye HalfEdges!
  
- Okay, also, thoughts on 'format'?
  - This is key to being multiformat: the Viewer should be able to read some of just about any Node file format.
  - However, the IPFS file can easily specify the format itself.
  - Viewer flow would be:
    - Get IPFS from chain
    - Look up IPFS file
    - Parse it (should always be json? Can reference other file formats from the json)
    - Check the 'format' variable at the top.
    - Spin up the proper formod.
    - Render the IPFS file with the formod.
  - Only difference here being that, with format on-chain, you don't need a json wrapper: could just have a format number that's "image", and a pure .jpg as the file.
  - Also, we need the owner node index to support efficient deletes, so may as well use more of that underlying uint256: no additional cost to store.
  - May as well keep it.
  - Could even use up the other two uint64 slots to support a small "name" field? Future.
  

- [ ] Build Version 1 (the "free version", i.e. without any way to exchange money) of the Interweave Network.
  - [ ] Smart contracts
    - [ ] Get rid of HalfEdges
      - [X] Make a new NodesConnected and NodesDisconnected event pair
      - [X] Test gas prices for mappings versus dynamic arrays versus static arrays for halfedges
        - Creating struct with dynamic array: 5800 gas, 27000 total
        - Creating struct with mapping: 260 gas, 21540 total
        - Creating struct with static array: 0 gas (don't need to create it???)
        - Setting struct with mapping: 20435 gas, 42347 total
        - Setting struct with dynamic array: 61536 gas (creating at index 3 here, so had to set 3 0s first), 83512 total
        - Setting struct with static array: 20330 gas, 42242 total
        - Getting struct with mapping: 586 gas, 22050 total (it's view though)
        - Getting struct with dynamic array: error lol, oops
        - Getting struct with static array: 506 gas, 21970 gas total
        - So conclusion: static array wins, especially since it seems like it doesn't have a create cost? Just start using empty slots in the mapping?
      - [X] Make Nodes have a static array of 6 nodeKeys
      - [X] Update logic accordingly, removing HalfEdges everywhere
  
  
    - [ ] Write unit tests for InterweaveGraph:
      - [ ] test_halfedges.js:
        - [ ] createHalfEdge
        - [ ] deleteHalfEdge
        - [ ] getNode if that Node has HalfEdges
        - [ ] getEdge
        - [ ] deleteNode if that Node has HalfEdges
    - [ ] Fix any bugs with InterweaveGraph this turns up
    - [ ] Write unit tests for InterweaveProposals (at least, an attempt at them, given none of them will pass yet)
      - [ ] test_proposals.js:
        - [ ] createEdgeProposal
        - [ ] acceptEdgeProposal
        - [ ] rejectEdgeProposal
        - [ ] deleteNode if that Node's HalfEdges have EdgeProposals
        - [ ] deleteHalfEdge if that HalfEdge has EdgeProposals
    - [ ] Finish InterweaveProposals
    - [ ] Run tests as we go, and fix bugs with the contract and with the tests
    - [ ] With tested InterweaveGraph and InterweaveProposals contracts, compile and deploy to testnet!
    - [ ] Share somewhere, and fix bugs that people find, haha. This being the "free version", less (but not nothing) is at stake.
    - [ ] When DApp is tested and ready to go, deploy to mainnet!
  - [ ] DApp
    - [ ] Clone Set Hash code to start with
    - [ ] Rewrite the ContractHandler to interface with all of the smart contract functions
    - [ ] Spend a little time designing how the UI should look/be structured
    - [ ] Rewrite the Vue app to use the ContractHandler functions to implement this UI
    - [ ] Extensively test! Probably can point the ContractHandler at my Ganache testnet for cheaper tests before hitting up testnet.
    
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
 



 
