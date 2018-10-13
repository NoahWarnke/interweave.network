# Interweave Network: A Decentralized Graph Representing an Explorable, User-Built Heterogeneous Metaverse

## Abstract
Human existence revolves around our twin needs to *explore*, experiencing our environment, and to *build*, modifying it. Computer-based manifestations of our urge to explore, including the World Wide Web and computer games, have commensurately proved to be enormously significant in modern culture and society. But users do not have perfect freedom to wander the digital frontier -- games in particular are highly siloed from one another, with one virtual world rarely reachable from within any other. Our desire to build has proven considerably more difficult to fulfill, an asymmetry suffered partly because of a lack of know-how, but also significantly at the hands of centralization. Gatekeepers like domain registrars and monolithic game studios have made obtaining a website, or adding something to a favorite game world, difficult or impossible for the average Internet user, who is left with the meager Facebook post or YouTube vlog as their primary creative outlet.

The Interweave Network project proposes to eliminate the explore/build asymmetry in the [metaverse](https://www.nealstephenson.com/snow-crash.html) and make meeting these equally important needs equally frictionless.

A new type of digital tool, the [programmable blockchain](https://github.com/ethereum/wiki/wiki/White-Paper), has recently emerged to provide mechanisms for decentralizing and finalizing arbitrary state transitions. The Interweave Network will use such a framework to disentangle the simple acts of visiting shared virtual locations and creating new ones from the inequitable and insecure concentrations of power that currently comprise the status quo.

The Interweave Network will consist of a decentralized graph on the [Ethereum](https://ethereum.org/) blockchain, whose nodes can represent literally anything conceptually identifiable as a *place*, and frontend viewer applications that connect to the smart contracts containing this graph, interpret node and edge data for users, and provide an interface for creating new content. The Network will allow its users to create, own, transfer, and connect nodes in an easy, fair, and secure manner. Nodes will each be an instance of an [ERC-721](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-721.md) non-fungible token with additional properties like a data URL and list of edges connecting to other nodes that can be managed only by the owners of the nodes involved. Critically, nodes will be an *unlimited* resource: users can create as many as they can afford the gas for. Value will come not from scarcity, but from quality and connectedness.

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
Graph-based games and information spaces possess an extremely rich 40-year history. Examples have heavily informed and inspired Interweave Network's design and goals. To make comparing the below examples more straightforward, the following set of flags, collectively called the Interweave Assessment Number, will be used to categorize games and other applications.

#### Interweave Assessment Number (IWAN)
A number betweem between ```0x00``` and ```0xff```, produced by bitwise-ORing together those of a set of eight flags that are true for a given application:
1. ##### Graph ```0x01```
The world (the set of all locations) can be best represented as a set of nodes associated to arbitrary data and connected by edges.
2. ##### Multiplayer ```0x02```
Multiple users can explore and interact in the same world at once.
3. ##### Ownable ```0x04``` *(only if Multiplayer)*
Users can own and trade locations (nodes in a graph or spaces in non-graphs).
4. ##### Creatable ```0x08``` *(only if Graph)*
Users can create nodes.
5. ##### Settable ```0x10```
Users can set the content for locations (nodes or spaces).
6. ##### Panformat ```0x20``` *(only if Settable)*
Users are not limited to a subset of potentially available formats for nodes.
7. ##### Seamless ```0x40``` *(only if Graph)*
Users can follow edges between nodes smoothly and without breaking immersion, rather than instantly and jarringly, even if they have different formats.
8. ##### Decentralized ```0x80``` *(only if Multiplayer)*
The world's structure and content is owned and hosted by many different parties, and no one entity owns a majority or large minority.

For example, a graph-based, multiplayer, centralized game where users could create, set, own, and seamlessly move between single-format nodes, would have an IWAN of ```0x01``` | ```0x02``` | ```0x04``` | ```0x08``` | ```0x10``` | ```0x40``` = ```0x5f```.

### Interactive Fiction
The oldest graph-based games were text-based games of the [interactive fiction](https://en.wikipedia.org/wiki/Interactive_fiction) genre.

##### Colossal Cave Adventure ```IWAN 0b01000001 = 0x41```
The original text adventure, [Colossal Cave Adventure](http://rickadams.org/adventure/) provided players in 1977 with a text interface with which they could navigate a fixed network of "rooms", locations with a text description and where items and monsters were available. They would traverse the edges between rooms by giving simple direction-based text commands, like "go north". Remarkably for the era, rooms could be slightly customized by picking up and dropping items in them, a mechanic that made solving one of the game's puzzles possible. Because the format was the same for all nodes, transitions were seamless within the console, although edges did not have their own descriptions. The game [proved addictive](https://web.archive.org/web/19970607204921/http://www.csd.uwo.ca/Infocom/Articles/globe84.html) when it hit computers at MIT and elsewhere, showing the potential for such exploration-based experiences. Later games like [Zork](https://en.wikipedia.org/wiki/Zork) were largely similar in mechanics, but featured different worlds within the text-based framework.

##### Multi-User Dungeons ```0b01000011 = 0x43```
Building on games like Colossal Cave, and taking advantage of the advent of the Internet, text-based [MUDs](https://en.wikipedia.org/wiki/MUD) allowed multiple players to explore the same dungeon and interact with one another as well as their surroundings. This opened up social play as a possibility, something that had needed to occur in person in the past, e.g. during Dungeons and Dragons sessions. Players still could not create nodes in the game's location graph, however, an ability limited to the game's creators outside of gameplay.

### Hyperlinks
- Media-based graphs.
- Users can set the content that is present on each node, with either limited or unlimited formats
- Both single- and multi-player, though the latter is what made it famous.
- Users can create and own the graph, with varying degrees of difficulty.

- ##### Hyperstudio ```0b01011001 = 0x59```
  - [Graph/Creatable/Settable/Seamless]
- ##### World Wide Web ```0b00111111 = 0x3f```
  - [Graph/Multi/Ownable/Creatable/Settable/Unlimited/Centralized]
- ##### OpenCroquet/OpenCobalt ```0b01011111 = 0x5f```
  - [Graph/Multi/Ownable/Creatable/Settable/Seamless]

#### Multiplayer Sandbox Games
- Locations are open worlds and can be both fixed (canonical servers) and free-to-create (user servers)
- Sometimes different worlds are connected, but rarely, and always within the same game.
- Massively multi-player.
- Users can create and own spaces within open worlds, and sometimes own servers too.


- ##### Second Life
  - Own plots of land within the game (bought via auction from Linden Labs or other players)
  - Multiple plots per server.
- ##### Wurm Online
  - "Own" regions you put walls around (entirely ingame and free, but risky since others can break in)
  - Own deeds you pay money to CodeClubAAB for.
  - Own servers (Wurm Unlimited)
- ##### Minecraft
  - "Own" fortified regions,  but again, risky since other players can break in.
  - Own servers
  - Can move between servers on some modded versions.

#### Decentralized Onership Games
- Locations are user-ownable NFTs on a blockchain.
- Locations are created and connected once, by the game owner.
- Users can set the content that is present on each node, within a single framework.

- ##### Decentraland ```0b11010111 = 0xd7```
  - [Graph/Multi/Ownable/Settable/Seamless/Decentralized]
  - Inflexible in format
  - Totally inflexible in openness: fixed number of nodes.

- Interweave Network: ```0b11111111 = 0xff``` [Graph/Multi/Ownable/Creatable/Settable/Unlimited/Seamless/Decentralized]

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
