# Interweaver's to-do items, 2018-11-03:

- [ ] Create a simple network of test Nodes on Rinkeby so I can test the dapp better (MetaMask + Ganache = totally impossible to use...)
  - [ ] Write simple versions of those Nodes
    - [ ]
  - [ ] Create and connect them (at least 2 accounts)
  - [ ] Make sure there are some NodeProposals floating around.
  

- [ ] Build Version 1 (the "free version", i.e. without any way to exchange money) of the Interweave Network.
  - [ ] DApp
    - [X] Design how formods should interface with the dApp on a technical level, enabling both exploration and file-generation for that format.
      - Okay, so these are intended to be modular and developable on their own.
      - Thus, that suggests a separate repo (or at least a child repo).
      - It needs to support two functions: render(nodeData) and build() (returns nodeData).
      - Oh also, needs a formatID value/function that matches up with the format number (or string?) in files. And maybe a niceName function too.
      - Then the Viewer simply imports the formod class, adds it to a lookup (by ID), and then uses it when a file or build is encountered.
      - A naively good idea would be to simply have files give an IPFS link to the formod code, and then the Viewer pulls it dynamically...
      - But guh, huge security flaws with that. Viewer writers need to be gatekeepers about which formods are verified to be safe.
      - So yeah, formod code is always guaranteed to be available in the same place as the viewer code.
      - Oh, the formod also needs a way to trigger edge transitions in the Viewer.
      - So maybe a subscribeEdges function that the viewer can call, and which the formod will call when you navigate an edge via the formod.
      - The formod is still responsible for rendering its half of the edge though...
      - So maybe subscribeEdgeStart and subscribeEdgeBoundary?
      - The first gets called when the user starts taking an Edge (to give the Viewer time to prepare the transition)
      - The second gets called when the starting-side Edge render time has finished, and the actual transition needs to take place.
      - The formod keeps rendering in that case for, say, 5s, while the viewer cross-fades into the other formod's 5-s fade lead time.
      - The exception to the fade situation would be that the formods are the same format. Then, perhaps, a direct cut, since they should be able to line up?
      
      - Okay, so as far as components go: the formod class should return a Renderer component from its render(nodeData). This then gets inserted by TheRenderArea.
      - It should return a Builder component from its build() function.
      - So how do you get the filedata out of build() if it returns a component, not a file?
      - Well, at some point you'll hit a 'finish' button or similar in the build()
      - So you need a way for the Viewer to subscribe to that. subscribeBuildFinished should do it.
      - And what if the user picks an Edge from the Viewer?
      - Hmm. Maybe the edge buttons actually shouldn't be default on the Viewer?
      - Maybe they should only appear when the Node cannot be rendered (or no IPFS file)?
      - But it doesn't make sense to have buttons in various places...
      - So maybe we need a way to get buttons, separate from the actual renderable component.
      - Throw in a list of them along with the renderable component?
      - Then the Viewer's job is to fill up the list with them.
      - How do they communicate back with the render module though? Wouldn't they be kind of orphaned?
      - Okay nevermind - any format-specific buttons must be inside the format window.
      - Interface:
        - render(node): returns {renderable: the actual render component which the Viewer should instantiate}
        - build(): returns {renderable: the build component which the Viewer should instantiate}
        - subscribeEdgeStart(callback): calls callback (with edge number) when user chooses an Edge.
        - subscribeEdgeBoundary(callback): calls callback when user completes an Edge.
        - subscribeBuildFinished(callback): calls (with file data) when someone completes a build.
    - [X] Design how the first formod (exploration:text) should look
      - Classic text console, PLUS.
      - Textarea with white-on-black, larger font text.
      - Input bar at the bottom (with flashing > prompt)
      - Type something in there, hit enter, it vanishes, and the result appears in the text area above.
      - Does the textarea contain past history like a console? I think probably it should, though will need to play with that.
      - When you type the appropriate 'go X' command, it alerts all registered listeners (via subscribeEdges) of the desired edge.
    - [ ] Implement the formod!
    - [ ] Rewrite the Vue app to use the InterweaveFreeContract handler functions to implement this UI
      - [X] Router?
        - Needs server support - all pages under /free/ would need to be redirected (without being rewritten) to /free/index.html instead of 404ing.
        - Not gonna work when hosting on GitHub. And http-server also doesn't support that behavior. So yeah, maybe later (design components to allow it.)
      - [ ] Build mode
      - [ ] My Nodes
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
 



 
