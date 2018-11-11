# Interweaver's to-do items, 2018-11-04:

- Should validate file conforms to its stated format before trying to render it.
  - Add a validation function to the format module's main class.
  - This should also be callable by the user in the build function, if they wrote their file not using the build func!
  - Maybe they can do "add new -> pick format -> paste existing", and that parses and populates the build form (and validates first).
  
- Thoughts about my SimpleText file format so far:
  - 'go' shouldn't be a special verb.
  - Verbs should be in their own array, not on the main object.
  - Edges should be how they are, except without the names or verbs.
  - Should be arrays of the following:
    - edges (keyed by 0-6, contain enterDesc and leaveDesc)
    - verbs (keyed by arbitrary id, contain array of same-meaning verbs, e.g. 'look' and 'examine' and 'look at' and 'inspect' are all the same)
      - Maybe it actually contains an object with one element being that array, and another being the 'did not find' text: 'you don't see anything' e.g.
      - These should kind of be universal to the SimpleText formod though, right?
      - Yeah, so maybe this array is in the formod.
    - targets ((keyed by arbitrary id, contain array of same-meaning targets, e.g. 'rock wall' and 'cliff')
    - results (keyed by arbitrary id, contain a string which is either "edge#" to trigger that edge, or a description to print.)
    - bindings matrix: 2d array: (verb-id, target-id) => result-id

  - Hmm, maybe it would make more sense to invert the id->array situation.
  - Have it be a mapping from the target/verb text to the ID number.
  - That way you can quickly check for that target/verb existing.
  - If you have a sentence with 10 words, that's 10 combinations to check for verbs (max).
  - Then you check the remainder for targets.
  - Then you do results(bindings(verbid, targetid)), and if there's a value there, do the result. Otherwise do verb_fail(verbid) text.
  
  - Note: need to always match the most specific target.
  
  - So: SimpleTextExplorer has:
    - verb_fail: mapping from verb ID to failure text.
    - verbs: mapping from verb string (lowercase) to verb ID.
  - parsedData has:
    - edges: mapping from 0-5 to {arriveDesc, leaveDesc}
    - targets: mapping from target string (lowercase) to target ID.
    - results: mapping from result ID to result string (edge# if an edge)
    - bindings: mapping from verb ID to mapping from target ID to result ID. (note: target ID 0 is always the empty string?)
    
  - To do a lookup:
    - Break cmd up into lowercase words
    - for i = number of words (len) to 1,
      - take the first i words and put them back together...
      - look up verbs[words]
      - If it exists,
        - if i = len,
          - look up bindings(verbid, 0), and if it exists, do it and return.
        - For j = len - i to 1,
          - take the remaining j words and put them back together
          - Look up targets[words]
          - If it exists,
            - look up bindings(verbid, targetid), and if it exists, do it and return.
      - didn't match this verb: if mostSpecificVerb is undefined, set it to  verbid.
    - didn't match any verbs. Do verb_fail(mostspecificverb).

- [ ] Create a simple network of test Nodes on Rinkeby so I can test the dapp better (MetaMask + Ganache = totally impossible to use...)
  - [ ] Write simple versions of those Nodes
  - [ ] Create and connect them (at least 2 accounts)
  - [ ] Make sure there are some NodeProposals floating around.
  
- [ ] Build Version 1 (the "free version", i.e. without any way to exchange money) of the Interweave Network.
  - [ ] DApp
    - [ ] Write the Vue app
      - [X] Formod1 validation function
      - [ ] Formod1 explore mode
        - [X] Add text-entry box
        - [X] Add textarea for output
        - [X] Make sure they style correctly
        - [X] Add verb/noun chaining selectors along bottom (shrinks input bar)?
          - Well, this is kind of an advanced thing (for mobile, etc.) Maybe later.
        - [ ] Make sure clicking the default edge buttons along the top puts in the correct slot for the format module
      - [ ] Build mode
        - [ ] Formod1 build mode (triggered by 'add node' button and then picking formod1 in the dropdown)
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
 



 
