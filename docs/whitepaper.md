# Interweave Network: A Decentralized Graph Representing an Explorable, User-Built Heterogeneous Metaverse

## Abstract
Human existence revolves around our twin needs to *explore*, experiencing our environment, and to *build*, modifying it. Computer-based manifestations of our urge to explore, including the World Wide Web and computer games, have commensurately proved to be enormously significant in modern culture and society. But users do not have perfect freedom to wander the digital frontier -- games in particular are highly siloed from one another, with one virtual world rarely reachable from within any other. Our desire to build has proven considerably more difficult to fulfill, an asymmetry suffered partly because of a lack of know-how, but also significantly at the hands of centralization. Gatekeepers like domain registrars and monolithic game studios have made obtaining a website, or adding something to a favorite game world, difficult or impossible for the average Internet user, who is left with the meager Facebook post or YouTube vlog as their primary creative outlet.

The Interweave Network project proposes to eliminate the explore/build asymmetry in the <a href="https://www.nealstephenson.com/snow-crash.html">metaverse</a> and make meeting these equally important needs equally frictionless.

A new type of digital tool, the <a href="https://github.com/ethereum/wiki/wiki/White-Paper">programmable blockchain</a>, has recently emerged to provide mechanisms for decentralizing and finalizing arbitrary state transitions. The Interweave Network will use such a framework to disentangle the simple acts of visiting shared virtual locations and creating new ones from the inequitable and insecure concentrations of power that currently comprise the status quo.

The Interweave Network will consist of a decentralized graph on the <a href="https://ethereum.org/">Ethereum</a> blockchain, whose nodes can represent literally anything conceptually identifiable as a *place*, and frontend viewer applications that connect to the smart contracts containing this graph, interpret node and edge data for users, and provide an interface for creating new content. The Network will allow its users to create, own, transfer, and connect nodes in an easy, fair, and secure manner. Nodes will each be an instance of an <a href="https://github.com/ethereum/EIPs/blob/master/EIPS/eip-721.md">ERC-721</a> non-fungible token with additional properties like a data URL and list of edges connecting to other nodes that can be managed only by the owners of the nodes involved. Critically, nodes will be an *unlimited* resource: users can create as many as they can afford the gas for. Value will come not from scarcity, but from quality and connectedness.

The end goal of the project is to interweave every virtual place possible, existing and new, into one seamless, metaverse-spanning network.

## Table of Contents
1. [Existing Work](#existing-work)
2. [Rationale](#rationale)
3. [Philosophy](#philosophy)
4. [Architecture](#architecture)
5. [Applications](#applications)
6. [Challenges](#challenges)
7. [Summary](#summary)
8. [Further Reading](#further-reading)

## Existing Work

What similar things are being used as inspiration and examples of what to do (or not to do), without getting into the specifics of what to [not] do.

### Step 1: research:
- Adventure-esque games ("interactive fiction")
  - Colossal Cave Adventure
  - Zork
  - Modern abstractions: Twinery, etc. (not shared!)
- Hyperlinking:
  - Hyperstudio ("single player")
  - World Wide Web (duh)
  - OpenCroquet/OpenCobalt
- Online sandbox games:
  - Second Life
    - Own plots of land within the game (bought via auction from Linden Labs or other players)
    - Multiple plots per server.
  - Wurm Online
    - "Own" regions you put walls around (entirely ingame and free, but risky since others can break in)
    - Own deeds you pay money to CodeClubAAB for.
    - Own servers (Wurm Unlimited)
  - Minecraft
    - "Own" fortified regions,  but again, risky since other players can break in.
    - Own servers
    - Can move between servers on some modded versions.

- Decentraland
  - Inflexible in format
  - Totally inflexible in openness: fixed number of nodes.
  
### Step 2: Characterize Groups
1. Interactive text adventures
  - First instance of location-based graphs.
  - Single-player (until MUDs) (well, not counting over-the-shoulder)
  - Users cannot create or own the graph.
2. Hyperlinking
  - Media-based graphs.
  - Users can set the content that is present on each node, with either limited or unlimited formats
  - Both single- and multi-player, though the latter is what made it famous.
  - Users can create and own the graph, with varying degrees of difficulty.
3. Multiplayer sandbox games
  - Locations are open worlds and can be both fixed (canonical servers) and free-to-create (user servers)
  - Sometimes different worlds are connected, but rarely, and always within the same game.
  - Massively multi-player.
  - Users can create and own spaces within open worlds, and sometimes own servers too.
4. Decentralized fixed-location-ownership games
  - Locations are user-ownable NFTs on a blockchain.
  - Locations are created and connected once, by the game owner.
  - Users can set the content that is present on each node, within a single framework.
  
5. Decentralized open-location-ownership networks (this work):
  - Locations are user-ownable NFTs on a blockchain.
  - Locations are created and connected continuously, by the network users.
  - Users can set the content that is present on each node, with ultimately unlimited formats (they'll need to be vetted and integrated.)

### Step 3: Create Binary Categories
So, here are some flags of properties with which existing work can be considered:
- [001 Graph/Nongraph] Graph-based vs. not.
- [002 Multi/Single] Multi-player vs. single-player.
- [004 Ownable/Nonownable] Users in multi-player context can own and trade locations (nodes on the graph or spaces on non-graphs) vs. not.
- [008 Creatable/Noncreatable] Users can create nodes on the graph vs. not.
- [016 Settable/Nonsettable] Users can set the content for locations (nodes or not) vs. not.
- [032 Unlimited/Limited] Users can use unlimited node formats vs. limited formats.
- [064 Seamless/Disjointed] Users in graph context can follow edges without leaving the current format.
- [128 Decentralized/Centralized] Decentralized (no central servers hosting, or monolithic ownership of, world structure) in multi-player context vs. not.

### Step 4: Categorize Existing Things
- Colossal Cave Adventure: 65 [Graph/Single/Nonownable/Noncreatable/Nonsettable/Limited/Seamless/Centralized]
- Zork: 65 [Graph/Single/Nonownable/Noncreatable/Nonsettable/Limited/Seamless/Centralized]
- MUDs: 67 [Graph/Multi/Nonownable/Noncreatable/Nonsettable/Limited/Seamless/Centralized]
- Hyperstudio: 89 [Graph/Single/Nonownable/Creatable/Settable/Limited/Seamless/Centralized]
- WWW: 63 [Graph/Multi/Ownable/Creatable/Settable/Unlimited/Disjointed/Centralized]
- OpenCroquet/OpenCobalt: 95 [Graph/Multi/Ownable/Creatable/Settable/Limited/Seamless/Centralized]
- Decentraland: 215 [Graph/Multi/Ownable/Noncreatable/Settable/Limited/Seamless/Decentralized]
- Interweave Network: 255 [Graph/Multi/Ownable/Creatable/Settable/Unlimited/Seamless/Decentralized]

### Step 5: Write this up :)



## Rationale

Why does this project make sense to develop versus using that existing work?

- Decentralized, unlike everything except Decentraland. Reduces security and censorship risks.
- Every node within the Network will be on equal footing, and can be connected with any other node. No place will need to be 'siloed' for technological or competitive reasons (more connections will almost always be desirable for both connected parties.)
- Unlimited building potential with no arbitrary scarcity, unlike Decentraland.
- Very low barrier to entry for building, being feeless apart from gas (and possible Ethereum rent someday).

## Philosophy

What values does the project hope to promote?

- Open source development
- Fair for all participants (all functionality available to everyone regardless of wealth or when they arrive)
- Nonprofit infrastructure: project developers are not aiming to make money from the running of the Network.
  - Small fees may be charged solely for paying Ethereum rent someday.
  - Creators and early users may be able to make money by having nodes built earlier in the system, and thus older and more central to the eventual network and thus potentially more valuable... But no special privileges relative to the infrastructure.
- Flexible: formats are unspecified by the Network, and the project explicitly hopes people will develop many of these.
- Aesthetic appeal: the locations nodes represent should strive to be 'eye candy', or 'mind's eye candy' in the case of text-based nodes. Exploring should be fun and rewarding.


## Architecture

In broad strokes, what technical components will the project be composed of?

## Applications

Once up and running, what problems will the project solve or new capabilities will it enable for its users?

- Initially, as a game itself
- As glue between and method for locating existing games relative to each other
- As a free framework where you can build yourself a 'place' in the virtual world that you alone own and control (see 'profiles' on most social sites... but these always fail to be a truly immersive 'place', being just sterile slabs of UI with some blanks filled in)


## Challenges

What aspects of the project are especially risky with respect to getting it completed and working as designed?

## Summary

Reword the abstract :)

## Further Reading

A list of all citations from above.
