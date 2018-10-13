# Interweave Network: A Decentralized Graph Representing an Explorable, User-Built Heterogeneous Metaverse

## Abstract
Human existence revolves around our twin needs to *explore*, experiencing our environment, and to *build*, modifying it. Computer-based manifestations of our urge to explore, including the World Wide Web and computer games, have commensurately proved to be enormously significant in modern culture and society. But users do not have perfect freedom to wander the digital frontier -- games in particular are highly siloed from one another, with one virtual world rarely reachable from within any other. Our desire to build has proven considerably more difficult to fulfill, an asymmetry suffered partly because of a lack of know-how, but also significantly at the hands of centralization. Gatekeepers like domain registrars and monolithic game studios have made obtaining a website, or adding something to a favorite game world, difficult or impossible for the average user, who is left with the meager Facebook post or YouTube vlog as their primary creative outlet.

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
9. [Appendix](#appendix)

## Existing Work
Graph-based games and information spaces possess an extremely rich 40-year history. Examples have heavily informed and inspired Interweave Network's design and goals. To make comparing the below examples more systematic, the Interweave Assessment Number or IWAN (see the [appendix](#appendix)) will be used to categorize games and other applications.

### Interactive Fiction
The oldest games built on location graphs were text-based games of the [interactive fiction](https://en.wikipedia.org/wiki/Interactive_fiction) genre.

##### Colossal Cave Adventure | ```IWAN 0x41 (Seamless Graph)```
The original text adventure, [Colossal Cave Adventure](http://rickadams.org/adventure/) provided players in 1977 with a text interface with which they could navigate a fixed network of "rooms", locations with a text description and possibly containing items and monsters. They would traverse the edges between rooms by giving simple direction-based text commands, like "go north". Interestingly, rooms could be slightly customized by picking up and dropping items in them, a mechanic that made solving one of the game's puzzles possible, but were not truly settable. Because the format was the same for all nodes, transitions were seamless within the console, although edges did not have their own descriptions. The game [proved addictive](https://web.archive.org/web/19970607204921/http://www.csd.uwo.ca/Infocom/Articles/globe84.html) when it hit the fledgling ARPANET, showing the potential for such exploration-based experiences. Slightly later and even-more-popular games like [Zork](https://en.wikipedia.org/wiki/Zork) were largely similar in mechanics, but featured different worlds within the text-based framework.

##### Multi-User Dungeons | ```IWAN 0x43 (Seamless Multiplayer Graph)```
Building on games like Colossal Cave, and taking advantage of the huge growth of the Internet, text-based [MUDs](https://en.wikipedia.org/wiki/MUD) allowed multiple players to explore the same world and interact with one another as well as their surroundings. This opened up social play as a possibility, something that had needed to occur in-person in the past, e.g. during Dungeons and Dragons sessions. Players still could not create nodes in the game's location graph, however, an ability limited to the game's creators outside of gameplay.

### Hyperlinked Applications
The graph format so successfully used by interactive fiction was subsequently generalized to many different types of media in the form of hyperlinking. By allowing users to create and set (in some cases arbitrarily) the content of nodes in the graph, and then easily link between them, hyperlinked applications were largely responsible for the viral onset of the Information Age.

##### HyperStudio ```IWAN 0x59 (Seamless, Settable, Creatable Graph)```
An early example of such a hyperlinked application was [HyperStudio](http://www.rogerwagner.com/hs/testdrive/Welcome_Page.html). It allowed users to create a "stack" of "cards", somewhat similar to a modern deck of PowerPoint slides. These 2D cards could embed text, images, videos, and assorted other media. Significantly, users could create buttons, arbitrarily shaped clickable regions on a card, that could link to *any card in the stack*, not just the previous or next ones. These buttons were edges in the graph between the card-nodes, and enabled stacks to be small fully explorable worlds, a purpose the software was frequently used for. However, it was not multiplayer, and only supported its 2D cards as a node format, limiting its usefulness.
  
##### World Wide Web ```IWAN 0x3f (Panformat, Settable, Creatable, Ownable, Multiplayer Graph)```
By far the most popular and successful implementation of hyperlinking has been the [World Wide Web](https://www.w3.org/). Its genius was to specify a document format (HTML) which could contain links intermixed with other content, to provide an initial implementation of a web browser that could parse HTML files, and to define locations on the Internet called URLs where resources (including HTML files) could be accessed via a new protocol (HTTP). Each URL is a node, and each link an edge, on a massive globe-spanning graph. Users can, with varying degrees of difficulty, create and set the content, in any arbitrary format, for URLs that they have control over (by owning the root domain name). Soon many other web browsers sprang up, supporting an increasing array of data formats and methods for adjusting presentation and scripting behavior. Links do not specify transitions between nodes, however (usually they are as instantaneous as possible). While the Web as a whole is very decentralized, a large fraction of present-day Web traffic, especially for important operations like registering or resolving domain names, passes through or depends on a relatively small set of monolithic domains, making that traffic vulnerable to [security flaws](https://www.nytimes.com/2018/09/28/technology/facebook-hack-data-breach.html), [accidents](https://aws.amazon.com/message/41926/), and [censorship](https://en.wikipedia.org/wiki/Censorship_by_Google#China) on the part of those centralized entities.

##### OpenCroquet/OpenCobalt ```IWAN 0x5f (Seamless, Settable, Creatable, Ownable, Multiplayer Graph)```
An interesting project in the hyperlinking genre was [OpenCroquet](http://wiki.c2.com/?OpenCroquet) and successor [OpenCobalt](http://www.opencobalt.net/). These involved the production of a "virtual world browser" which let users create and live-edit 3D virtual worlds, and seamlessly walk between them via see-through "portals". Other content could be embedded and edited within virtual worlds, including the code for the world itself, but the 3D world was the core node format, and the "portal" the edge format. In contrast to the World Wide Web, OpenCroquet/Cobalt gave up the panformat property in return for the seamless property, but also made setting node content much easier. Sadly, these projects never took off.

### Multiplayer Sandbox Games
Back in the realm of computer games, a popular genre in the past fifteen or so years has been the multiplayer sandbox game. These games give their many players a large amount of agency in collaboratively modifying their environments, subject to certain rules. Most such games might not be seen as graph-based at all, consisting instead of single large 3D worlds. However, they usually have multiple servers that could be considered nodes with very extensively-described locations, and with in-game ways of traveling between servers that could be seen as edges. Only a few of the many possible examples will be considered here, since they largely have similar IWANs.

##### Second Life ```IWAN 0x57 (Seamless, Settable, Ownable, Multiplayer Graph)```
A classic virtual world, [Second Life](#https://secondlife.com/) doesn't like to be considered a game, since it lacks set objectives. Users ("residents") can explore a huge map comprised of thousands of servers ("sims"), each a square patch of land or water 256m to a side and sometimes butting up against other sims. Much of the content in the world has been created by users from within the world itself via built-in 3D editing tools. Traveling between sims involves simply walking or flying across a sim boundary, or teleporting anywhere (a mechanism that does break the graph metaphor somewhat). Sims are subdivided into "parcels" of land that residents can purchase from [Linden Labs](#https://www.lindenlab.com/), Second Life's creator, or from other residents. Parcel owners can then modify the underlying terrain and place any objects they want on the land. However, new sims are only created at Linden Labs' discretion, only on their centralized servers, and only support the native 3D world format.

##### Wurm Online ```IWAN 0x5f (Seamless, Settable, Creatable, Ownable, Multiplayer Graph)```
Much less well known than its indirect descendent [Minecraft](#https://minecraft.net/en-us/), but attaining the same IWAN, [Wurm Online](#https://www.wurmonline.com/) consists of several canonical servers, each with a large land area that can be terraformed, built upon, farmed, and tunneled under. Players can "own" an area by putting a wall up around it, but with no guarantees, since other players can break into their enclosure easily enough. They can also pay game creator Code Club AB to "deed" an area, guaranteeing their ownership for a period of time. Traveling between servers happens similarly to Second Life, except server boundaries always occur in the ocean, so players must sail across them. Unlike Second Life, players can also create and host their own servers with a version of the game called Wurm Unlimited. Nevertheless, only the native 3D world format is supported, and the canonical servers many players use are centralized.

### Decentralized Ownership Games
A very new and relevant category of games are those which record player ownership of assets on a blockchain. Most new games in the genre have focused on item ownership, while leaving their worlds, if any, as classic static locations. [Others](https://www.gamasutra.com/view/news/326433/Ubisoft_details_its_blockchainpowered_game_HashCraft.php) have taken the [No Man's Sky](https://www.nomanssky.com/) or [CryptoKitties](https://www.cryptokitties.co/) approach to game worlds, procedurally generating locations and storing the seed and future modifications on the chain. This restricts users who want to create world content to starting from a random, algorithm-limited foundation. One game shares many similarities with the Interweave Network concept, however.

##### Decentraland ```IWAN 0xd7 (Decentralized, Seamless, Settable, Ownable, Multiplayer Graph)```
Like Second Life, [Decentraland](https://decentraland.org/whitepaper.pdf) will support a virtual multiplayer world rich with user-created content. Unlike Second Life, assets will be decentralized. Its world currently consists of a 300x300 grid of user-ownable non-fungible tokens (LAND), which were purchasable from Decentraland, and now from users, using the game's MANA currency token. Owning plots of LAND gives users the right to associate content (hosted decentrally, perhaps on IPFS in the future) with the plot, which will show up within the virtual world, both when users are on that exact plot, and also in nearby plot. However, node content format, again, will be restricted to a specific 3D data type, with additional information helping discover peers for certain peer-to-peer operations Decentraland will be managing. Users will not be able to create new nodes nor change their adjacency themselves; Decentraland ownership has retained that right for themselves.

##### Interweave Network: ```IWAN 0xff (Decentralized, Seamless, Panformat, Settable, Creatable, Ownable, Multiplayer Graph)```

## Rationale

Why does this project make sense to develop versus using existing work?

- Seamless (unlike WWW)
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

"This discovery by adjacency is at odds with having infinite land: in that scenario, users
would  have  a  hard  time  finding  relevant  content  by  traveling  through  it.  With  scarce  
land, developers can acquire users by purchasing land in high-traffic areas." - Decentraland whitepaper

## Summary

Reword the abstract :)

## Further Reading

A list of all citations from above.

## Appendix

#### Interweave Assessment Number (IWAN)
A number betweem between ```0x00``` and ```0xff```, produced by bitwise-ORing together those of a set of eight flags that are true for a given application:
1. ##### Graph ```0x01```
   The application world (the set of all its locations) can be best represented as a set of nodes associated to arbitrary data and connected by edges.
2. ##### Multiplayer ```0x02```
   Multiple users can explore and interact in the same world at once.
3. ##### Ownable ```0x04``` *(only if Multiplayer)*
   Users can own and trade locations (nodes in a graph or spaces in non-graphs).
4. ##### Creatable ```0x08``` *(only if Graph)*
   Users can create nodes.
5. ##### Settable ```0x10```
   Users can set the content for locations (nodes or spaces).
6. ##### Panformat ```0x20``` *(only if Settable)*
   Users are not limited to a subset of potentially available formats for node content.
7. ##### Seamless ```0x40``` *(only if Graph)*
   Users can follow edges between nodes smoothly and without breaking immersion, rather than instantly and jarringly, even if they have different formats.
8. ##### Decentralized ```0x80``` *(only if Multiplayer)*
   The application world's structure and content is owned and hosted by many different parties, and no one entity owns a majority or large minority.

For example, a graph-based, multiplayer, centralized game where users could create, set, own, and seamlessly move between single-format nodes, would have an IWAN of ```0x01``` | ```0x02``` | ```0x04``` | ```0x08``` | ```0x10``` | ```0x40``` = ```0x5f```.

The IWAN is intended to be used as a quick method of assessing how users may interact with and access a game's virtual world. Other attributes, like support for items, NPCs, combat, quests, scripting, in-game item creating, etc. are not considered because they are encapsulated by the "settable" and "panformat" attributes. If users can set content for nodes with any format, then they can choose content for their nodes that is formatted to support the above attributes (or any others).
