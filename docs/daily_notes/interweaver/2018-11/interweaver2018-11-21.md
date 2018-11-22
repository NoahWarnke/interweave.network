# Interweaver's to-do items, 2018-11-21:

- Thoughts on node building process:
  - This is the core of the network taking off.
  - It needs to be as simple as possible.
  - Especially any operations that have to happen no matter what formod you're using...
  - Which ones are these?
  - Well, it kind of seems like I'm trending towards the following:
  - All root IPFS files shall be JSON files.
  - They shall all contain:
    - format: A number? Though I'm kinda leaning towards a string, moving forwards. Just easier to keep track of.
    - format version: A number. Could do semantic versioning, but the important thing is just that it's distinguishable.
    - name: A string. <= 32 chars. Meant to identify the Node readably, not necessarily uniquely.
    - content: An object. Contains all format-specific data.
    - Hmm. How about coordinates and a worldframe?
      - This is very tempting to me... It's going to be quite hard to keep track of where each Node is relative to each other.
      - Having a worldframe for each Node (again, perhaps just an ID string? Not enforced or anything) and coords would help coordinate stuff a ton.
      - You could map the Node networks not just topologically, but actually in Cartesian space.
      - For example, a planet would be a spherical-coordinate space.
      - Regions of space could just be simple cubes.
      - But hmm, do Nodes have extent? Yes. They're all not just actual points.
      - If a Node has a canonical location, I guess it'd be up to the node content to specify the actual boundaries.
      - Not being enforced, this would all give a lot of potential for getting messy.
      - Also, for text nodes, it's almost intentionally *not* quantitatively located.
      - Nah, I think Nodes can have this, but only if their format supports it (e.g. 2d or 3d formats.)
    - So yes, just a format string, format version integer, name string (<= 32 chars), and content object.
    - For SimpleText v2, this would contain shortDesc, edges, targets, bindings.
    - For future formats, e.g. a picture, that could easily contain an IPFS hash for the image, etc, so further loading would be required.
  - So, back to the node building process...
  - This would be kind of a wizard-esque set of steps that you could navigate between easily.
  - 1) Choose a format (version is automatically set to latest) and name string.
  - 2) Do format-dependent stuff.
    - For simpletext:
    - 2.1) Write a short description.
    - 2.2) Create all targets with an add-target button (which you add a list of target names to)
    - 2.3) Create all results strings with an add-results button
    - 2.4) Create all edge string-pairs (for each slot)
    - 2.5) Connect all of these, plus the verbs, into bindings via an add-bindings process.
  - 3) Export via a text area containing the resulting JSON (which you save to a file, upload to IPFS, and get the IPFS hash.)
  - 4) Paste in IPFS hash.
  - 5) Push button to call blockchain CreateNode!
  
  - This seems a tad involved...
  - Particularly the IPFS step. Is there any way we can simplify this?
  - Well, hypothetically, could one generate the hash in-browser?
  - Then you could create the node before actually putting it into IPFS...
  - But that's kinda scary. What if you lost the file and then had a Node you could never resolve?
  - Two ideas there:
    - 1) calculate the hash in-browser, but don't show it, and force the user to upload to IPFS, enter resulting hash, and actually validate it!
    - 2) maybe there's some way to contact the localhost port of IPFS and send the file to it that way, and retrieve the hash?
      - :O ooo, there's an API... So yes, you can actually do that. Sweet!
      - https://ethereum.stackexchange.com/questions/4531/how-to-add-a-file-to-ipfs-using-the-api
    - So yes, let's go with 2), since that actually enforces you to have an IPFS node, but also automates.
    - This means steps 3) and 4) above would be replaced by:
      - (3 and 4) a simple "Add content to IPFS" button (entire process can't start if no IPFS node)
      - (5) an "add Node to blockchain" button, with appropriate spinnies and stuff.
    
  - Further questions: how does one test one's node before committing to it?
  - And this could be a slow process: how does one save a draft and come back to it? It's kinda like email in that way.
  - For drafts: you kinda want "my draft Nodes" as a button...
  - Whenever you start a new Node, it creates (in cookies) a new "Node" with all the data you're entering.
  - If you go to "My Draft Nodes", you could choose to create a new one, import an existing one from a file, nodekey, or ipfs hash, or open an existing draft.
  - Then, the workflow would be 1) create a draft Node, 2) test it somehow (and iterate), 3) launch it to IPFS/blockchain.
  - Okay, so we're proposing either a new My Draft Nodes page, or some type of division in My Nodes between drafts and launched Nodes.
  - The email analogy may be apt. Just a few folders in My Nodes for "draft", "launched", "unconnected", "connected" (basically filters)
  
  - For the testing question:
    - Let's say Draft Nodes show up in My Nodes.
    - Let's say each Node (draft or otherwise) has an "Edit" and a "View" button next to it.
    - View does the current thing where it takes you to Explore mode at that Node.
    - Edit opens up the Node for editing, whether draft or real (if real, it loads the content data from IPFS into the builder, and the step 5) becomes 'relaunch' (eventually, when IPFS is changable.)
    - Thus, you could actually explore a draft Node!
    - It wouldn't be connected... how would you do that?
    - Perhaps any Node that isn't currently launched can have 'test' edges applied to it, between it and any other Node?
    - Or, how about any Node at all can have these? You'd want them to test connections between already-launched Nodes before proposing them.
    - Maybe they even lead into the add-Edge-Proposal interface, if you decide you like them (and the Node is already launched)?
    
  
    

- [ ] Build Version 1 (the "free version", i.e. without any way to exchange money) of the Interweave Network.
  - [ ] Create functional DApp:
    - [ ] Make build mode:
      - [ ] Formod1 create node:
        - [X] Give it a formats property
        - [X] Pass in the formats list from App
        - [X] Give it a computed property with a mapping from formod name to actual formod object (or the Build item it returns)
        - [X] Give it a dropdown to pick one of the formods (may need to add formod string names.)
        - [X] When a formod is selected, set a variable to the correct one.
        - [X] Make a component slot for the actual formod build component.
        - [X] Make a basic SimpleTextBuild component.
        - [X] Make it render when you select it in TheNodeBuilder
        - [X] Make it stop rendering when you click Add Node again.
        - [ ] Give it an 'output' button.
        - [ ] Make clicking it open a modal with a text area containing the JSON output (for your IPFS file).
        - [ ] Make the modal have an 'x' that closes it.
        - [ ] Add fields for various SimpleText properties:
          - [ ]
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
 



 
