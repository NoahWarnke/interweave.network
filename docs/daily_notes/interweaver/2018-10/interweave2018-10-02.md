Notes on interweave.network project.

 [X] Research IPFS a little better.
 - Need the 'ipfs-api' JS library to do stuff in the browser.
 - Need to connect to a node in order to upload stuff.
 - Infura hosts one: const ipfs = new IPFS({ host: ‘ipfs.infura.io’, port: 5001, protocol: ‘https’ });
 - Files get garbage-collected if not pinned or transferred...? How to prevent?
 - File hashes: QmZtmD2qt6fJot32nabSP3CUjicnypEBz7bHVDhPQt9aAy (46 chars long?)
 - A simpler design to start would be to assume someone's already got something up on ipfs, or even to allow normal URLs.

 [X] Add a README
 # = big title
 ### = smaller title
 ##### = smallest title
 

 [X] Use Vue.js and some more css to neaten up my test StoreLink dapp, just to get some more frontend experience.
  [X] Start NPM project
  [X] Import Vue.js
  [X] Redo frontend to use it.
   [X] Use Vue
   [X] Update styles to look fancier
   [X] Set title and favicon
  
 [ ] Trap case where there's no message set yet
 [ ] Trap case where you're on the wrong network and the contract doesn't exist
 [ ] Trap case where the submit fails
 [ ] Trap case where the submit succeeds (and show waiting graphics until then, etc.)
  
 [ ] Create Reddit accounts (1 normal, 1 project), get some practice with that.

 [ ] Rewrite interweave design document into whitepaper-style document with slightly more carefully-thought-out ideas.

 [ ] Design basic json file format for nodes and edges (format 1 for both)

 [ ] MVP: Nodes not transferrable, edges not deletable, normal URLs (up to X length), front-end is a simple viewer, with no built-in way to create new nodes/edges or manage existing ones.
 [ ] Stage2: Built-in way to add nodes and edges.
 [ ] Stage3: Nodes ERC721, edges deletable.
 [ ] Stage4: Edge deletions in interface
 [ ] Stage5: IPFS URLs!
 [ ] Stage6: IPFS uploads built-in.
 [ ] Stage7: additional formats, like 3d, etc.

 [X] Do some broad thinking about various aspects:

When building out the initial world:
  - Central point that's really cool (plant-filled grotto with shrine to decentralized future? Mountaintop?)
  - Six maximum edges per node, so use maybe 3 of the central point's.
  - Then from those, branch a further 1-4 out (this is to leave space for future connections)
  - Within this region of maybe up to 16 nodes, should have connecting points to some massive farm networks.
  - e.g., a spaceport with a spaceship that lets you fly to arbitrary other planets
  - e.g., a library that lets you link to other ages
  - e.g., a path/tunnel network that lets you explore the starter planet
  - e.g., a city/suburb with a dense network of streets or floors, lots of room for expandable house nodes, etc.
  - e.g., some monetizable commercial zone where people can cluster by things they're selling/advertising (bazaar?)
  - Also need some connecter points that I let involved others connect to, and reasonably let them do similar things.
  - Every node needs to be really cool and interesting, not just utilitarian. This is the first stuff visitors will see.
  

On edge lengths, subdividing edges, and sanity checking:
  - Initially, one might be tempted to make edges that are like "you follow the road for a thousand miles, and then arrive X."
  - All well and good, but what if you, or someone else, want to build new nodes along that road?
  - The obvious thing to do would be for the creator to delete the edge and re-build it as a sequence of edges and nodes.
  - This would be incentivized by the demand for connections along the road.
  - The road-builder would have to realize that such demand exists, though (no on-chain way to recognize the demand for nonexistant nodes)
  - They could also be AWOL and leave everyone else with a road they couldn't connect to.
  - I guess the incentive of connecting nodes would just have to be relied upon to have them not make a giant road in the first place.
  - There's always the thought of having actual coordinates be part of the node properties, and then having maximum/minimum edge lengths within worlds...
  - Seems like that would add a massive layer of complexity though, since everything would suddenly be 3D-located.
  - There *are* cases where without that, you could have a nonsensical situation, where a node is surrounded on all sides by other nodes, and yet makes a connection ignoring those.
  - Those will probably just have to be left alone. If others have the ability to break off connections, they will.
  - Regarding locations, any nodes with actual 3D formats will have them anyway. But no need to force it.

On "Rules of Thumb" for building:
  - Always keep a map of your nearby networks when building a new node. Know how it fits in.
  - Build your nodes with possible edge starting points already there. It's okay if they're not edges yet (people will propose!)
  - In areas with line-of-sight (e.g. open areas), describe mostly just the node area, since the surroundings may change hugely.
  - If you do describe your surroundings, try to plan for the future, and be prepared to update.
  - Make your edges go far enough to take you somewhere different (or able to be different once nodes are added)
  - But don't make your edges go so far that opportunities for nodes are missed.
  - The method of travel you're using determines this: if it's highway/boat/air/space travel, you can go a lot longer before stopping opportunities.
  
Rules governing edges:
  - Bilateral, unilateral (a or b or both) disconnects can all be set.
  - If a node owner changes the link on their node, all edges not owned entirely by them get a free disconnect for X blocks.
    - This disincentivizes changing nodes with other folks connected to them, but allows it (at the risk of them leaving unless they like.)
	
Handling dead URLs/ipfs links:
  - All nodes and edges should have a short string description (on-chain) that can be used for fallback navigation.
  - Ideally, there would be some way of submitting a proof of a dead link, and then claiming that node for yourself after X time.
    - This would be outside the scope though... Would need validators to check proofs and each other, etc. Whole 'nother chain.
	

Interweave browsers:
  - These are just websites/apps that let a user traverse the graph, and maybe add to it/manage their nodes.
  - I would be building a reference implementation of one as a web page (interweave.network) in MetaMask-enabled web browsers.
  - For SEO, should deep linking to nodes be allowed? E.g. interweave.network/458
  - Would be cool, but also kind of breaks the immersion, if you can just link wherever.
  - Would incentivize building near biggest sources of traffic, rather than just near starting point.
  - Big sources of traffic wouldn't be browser-builders though, but anybody with a big real web reach.
  - I kind of like keeping the browser-builders the arbiters of starting locations?
  - If I don't allow it on my browser, someone else will. So probably may as well do it.
  - Can still keep the canonical starting location, which new visitors would be directed to if they don't specify a node.
  - Maybe a flag on nodes for whether they are 'incoming' friendly?
  - This would let you specify 'landing points' in your networks.
  - Then browsers could choose to respect that or not, but because landing points would make more sense to arrivals, they'd be incentivized to.
  - So: 'landing' flag on nodes, set by users, and allow deep linking only to those nodes
  - Site would URL rewrite to non-linking nodes, but arriving directly at one of those, it would not let you in (maybe find nearest landing spot?)
  

On people, items, and quest logic, etc.:
  - Interweave is JUST a format for specifying locations and how they are connected.
  - The format value on nodes and edges lets you specify nearly infinite data-types.
  - You rely on your interweave browser to be able to interpret those formats.
  - The browsers may very well keep track of explorers/items moving around (off-chain or elsewhere on-chain) and render them.
  - Quest logic, too, can be the responsibility of browsers.
    - An edge, for example, could have a flag saying you can only pass with the right key in your inventory.
	- That key would be available (instanced or non-instanced) in a different node.
	- Or, a node might simply look different at different times of days, or depending on user variables, etc. (e.g. door open/closed)
	- The data for flags/items/inventory/ would be format-dependent and browser-dependent.
  - Supplemental standards for these basic types of things may well emerge, and that's great.
  - But the core Interweave is JUST for locations and how they are connected.
