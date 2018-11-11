# Interweaver's to-do items, 2018-10-20:
   
- [X] Learn how to do Truffle/Ganache development and, as a main goal, unit testing.
  - Installing: sudo npm install -g truffle
  - Seems you need to "boxify" your project? Requires GitHub repo (to support 'unbox' command from anywhere), config file.
    - Download https://truffleframework.com/files/truffle-box-essentials.zip
    - Unzip them into root of project.
    - Modify truffle-box.json to also ignore CNAME.
    - Modify truffle-box.json hooks to include "npm install" in the post-unpack hook.
    - Delete the two .png files (I think they're for truffle box decorations on their site)
  - Okay, maybe you don't?
  - Do definitely need to do 'truffle init' in an empty folder...
  - Make truffle folder inside my project
  - truffle init
  - Yep, generated files in there.
  - truffle compile
  - This generated a 'build' folder with a .json file in it?
  - I guess this contains some specially-formatted json wrapping the ABI and bin bytecode?
  - "Migration": a js file that is basically configuration for deploying contracts to an Eth network?
  - truffle migrate: supposed to run these migrations?
  - Just running it like is: produces "No network specified. Cannot determine current network" error. Probably expected?
  
  - Let's do Ganache...
  - Download https://github.com/trufflesuite/ganache/releases/download/v1.2.2/ganache-1.2.2-x86_64.AppImage
  - sudo chmod +x ganache[tab]
  - Double click on the AppImage file in Downloads
  - No, don't integrate with system
  - No, don't send data back to them
  - Okay, opens a Ganache window, cool!
  - Has a set of addresses with Eth balances, etc.
  - Can I run 'truffle migrate' now?
  - Nope, same error.
  - Looks like I have to config the network in truffle/truffle.js
  - Get RPC server address (localhost IP : portnumber)
  - Then add this to the module.exports object in truffle.js:
    networks: {
      development: {
        host: "127.0.0.1",
        port: 7545,
        network_id: "5777"
      }
    }
  - truffle migrate
  - This time it produced a "using network 'development', 'network up to date'" message.
  - Ganache shows a "eth_accounts" event in its logs, whatever that is... but no contract deployments or any other transactions.
  - So, how do I deploy so that I can test? And, where would compile errors go?
  
  - Add another migrations file: 2_sethash.js
  - Point this at a copy of my sethash.sol contract (copied in from sethash project) in the contracts folder.
  - The "Migrations.sol" finally deployed, but it bombed out at the sethash... "Could not find artifacts for ./sethash from any sources"
  - Ah, the "1_initial_migration.js" was lying... Needs to be the contract name (SetHash) in the artifacts.require, not "./sethash.sol".
  - Okay, that deployed it! Cool! I can see the deployment go through in Ganache (from the 1st account).
  
  - So: what if there's an error in the sethash function, for example?
  - Cool! the compiler points out the error. Not quite as nice as the Remix IDE showing multiple errors in context at once, but good enough.
  - So I guess I would do my development in this truffle folder, and then copy the changed file into my repo to commit to GitHub, etc.?
  - And I could manage deploying stuff here, somehow? Not sure how I'd connect it to real eth accounts on a testnet or mainnet though.
  
  - At any rate, seems I can move on to testing my contract via Ganache. How?
  - truffle test
  - Running this seems to have re-deployed the two contracts (Migrations and my SetHash)
  - This is probably to keep everything completely fresh each time you run your tests.
  - "0 passing" - probably because I didn't have any tests lol.
  - So how do I write tests?
  - Should go in the /tests directory.
  - Uses Mocha testing framework, Chai for assertions.
  
  - Mocha:
  var assert = require('assert');
  describe('Array', function() {
    
    // A test! As many as you want.
    describe('#indexOf()', function() {
      
      it('should return -1 when the value is not present', function() {
        assert.equal([1,2,3].indexOf(4), -1);
      });
    });
  });
  - Okay, but seems like for Truffle, you use 'contract' instead of 'describe'.
  - Have to pass in contracts: const ContractNAme = artifacts.require("ContractName");
  - An 'accounts' array gets passed into the function: contract('TestName', function(accounts) { ... });
  - Create a test_sethash.js test file.
  - Put in a first test...
  - Had no luck with 'before' to get an instance of the contract.
  - But still, sweet! Test seemed to run?
  - Okay, how to test for 'require's?
  - Seems like a 'try catch' thing, where the error gets put into a variable in the 'catch', and then requiring the error to be something, will work.
  - Yeah, I wrapped that into a function and added it to assert :)
  - Also, can do 'beforeEach' inside the 'contract' function but above the 'it' functions that gets the contract instance each time.
    - Just need to do 'let instance = undefined' up outside the 'beforeEach' so that it's in the scope of the contract call's passed-in function, and hence the 'its' too.
  - Haha okay great, unit testing is working as expected.
  - Importantly for when I have multiple test files, looks like you can do "truffle test test/mytest.js" to run just that test.
  - Can I use a file that's in a subfolder of contracts? And a test in a subfolder of test?
  
- [X] Write a daily get-up-and-running instruction sheet for testing for myself...
  - Fire up Ganache:
    - double click on the Ganache icon (I let it set up system stuff the second time I ran the AppImage)
  - Get terminal into my project folder/truffle
  - Run truffle test
  - Should about do it!
  
- [X] Write unit tests for my practice SetHash contract.

- [X] Set up a migration (to my Ganache instance) for the InterweaveGraph contract.
  - [X] Copy the contract (ugh, that's going to get annoying...)
    - Okay, I gave in: renaming 'truffle' to 'solidity', and it is going to contain all of my smart contracts and their tests, not the 'src' folder.
    - Truffle config stays in 'solidity'.
  - [X] Run truffle compile
    - Sigh, it only goes up to 0.4.24 atm... just downgrade my contract from 0.4.25 for the moment.
  - [X] Split into two contracts: one for the graph, one for the proposals.
  - [X] Get it to compile
    - ownerlookup has to be internal, rather than private, so that InterweaveProposals can access it. (can't be public because has no primitive properties to return)
    - Okay, we good!
    
- Thoughts on node.owner
  - What if we got rid of that?
  - What if the nodeAddr was keccak(ipfs, owner)?
  - Then you couldn't directly find out who owned any given Node, because keccak is one-way.
  - But, you (and the smart contract) could validate node ownership: if keccak(ipfs, msg.sender) == nodeAddr, you're in business. Much cheaper than reading storage.
  - This isn't real anonymity, since the transactions (with your from address) would always be visible in the blockchain.
  - However, some functions wouldn't normally require reading ipfs... Well, any that get the Node out of storage would by default, I guess.
  - So having one fewer value in the Node would save space, in any case.
  - It *would* break the 'ipfs may only be used once' property, changing it to 'only used once per account'. Better than nothing, though a little sad.
  - Mind you, the original requirement wasn't too strong, since anyone could re-upload ipfs data with one invisible character changed, and they'd be good to go.
  - But yeah, I don't think there's anywhere we'd actually need to get the node's owner, apart from checking whether a given account owns a given node.
  - Would let us get rid of the owner field in all the events, too.
  - Could have a simple ownNode(nodeAddr), which returns true if msg.sender owns that node.
  - Would not get rid of the ownerLookup mapping, which will always let you enumerate all your owned nodes.
  - Hmm, seems like a good idea, perhaps as an optimization. But will complicate things at the moment. Let's stick with .owner for now.
  
    

- [ ] Design the Interweave Network.
  - [ ] Rewrite interweave design documents into whitepaper-style document with more carefully-thought-out ideas.
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
 


- [ ] Build Version 1 of the InterweaveGraph contract.
 
