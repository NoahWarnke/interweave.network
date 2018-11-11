# Interweaver's to-do items, 2018-10-31:

- [ ] Read up on Vue project structuring and best practices
  - Name components multi-word things like TheNavbar or EdgeButton.
  - Organize files by what they are: assets, components, mixins, etc.
  - Components should go in their own files if possible.
  - Component data element should always be a function.
  - Props should be well defined (type, required, validator)
  - v-for should always have a :key added on (makes sure anything that changes doesn't mess up the loop)
  - Don't mix v-for and v-if on the same element
    - much better: iterate over computed property list, so filtering only happens once, or wrap for in another if'd element
  - Styles: top-level App component can have global styles, but scope all other components' styles.
    - 'scoped' attribute on style tags?
  - Mixin properties: name $_mixinName_functionName __
  - Base components (that are purely presentational, without logic) should start with Base, App, or V.
  - Components with single active instance should begin with The. (and should have no props.)
  - Components tightly coupled with a parent component should start with the parent component name: TodoList, TodoListItem, TodoListItemButton
  - Component names should start with most general words and end with descriptive words.
  - Don't use abbreviations in component names.
  - prop names: camelCase in declaration, kebab-case in templates.
  - Templates should only contain simple expressions, not complex ones. Refactor complex into computed properties.
  - Computed properties should be broken into as simple chunks as possible. Easier to test and understand.
  
- [ ] Build Version 1 (the "free version", i.e. without any way to exchange money) of the Interweave Network.
  - [ ] DApp
    - [ ] Rewrite the Vue app to use the InterweaveFreeContract handler functions to implement this UI
      - [X] Start up some Vue components.
      - [ ] Explore mode
        - [ ] Navbar
          - [X] Home button
          - [X] Status/Build Mode button
          - [X] 0-5 edge buttons
        - [X] Render window
          - [ ] Text box showing ipfs file
      - [ ] Build mode
      - [ ] My Nodes
      - [ ] My Edge Proposals
      - [ ] Edge Proposal
    - [ ] Design how formods should interface with the dApp on a technical level, enabling both exploration and file-generation for that format.
    - [ ] Design how the first formod (exploration:text) should look
    - [ ] Implement the formod!
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
 



 
