/**
 * Represents an interface with the InterweaveFreeProposals smart contract.
 */
export default class InterweaveFreeHandler {
  
  /**
   * Constructor for a new SetHashContractHandler object, which wraps a contract.
   */
  constructor() {
    
    this.abi = [
      // Functions
      {"constant":false,"inputs":[{"name":"_nodeKey0","type":"uint256"},{"name":"_nodeKey1","type":"uint256"},{"name":"_slot0","type":"uint8"},{"name":"_slot1","type":"uint8"},{"name":"_message","type":"bytes30"}],"name":"createEdgeProposal","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},
      {"constant":false,"inputs":[{"name":"_nodeKey","type":"uint256"}],"name":"deleteNode","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},
      {"constant":true,"inputs":[{"name":"_nodeKey","type":"uint256"}],"name":"getNode","outputs":[{"name":"ownerAddr","type":"address"},{"name":"ipfs","type":"bytes32[2]"},{"name":"edgeNodeKeys","type":"uint256[6]"}],"payable":false,"stateMutability":"view","type":"function"},
      {"constant":false,"inputs":[{"name":"_ipfs","type":"bytes32[2]"}],"name":"createNode","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},
      {"constant":false,"inputs":[{"name":"_edgeProposalKey","type":"uint256"}],"name":"acceptEdgeProposal","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},
      {"constant":true,"inputs":[{"name":"_ipfs","type":"bytes32[2]"}],"name":"nodeKeyFromIpfs","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"pure","type":"function"},
      {"constant":false,"inputs":[{"name":"_edgeProposalKey","type":"uint256"}],"name":"rejectEdgeProposal","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},
      {"constant":true,"inputs":[{"name":"_edgeProposalKey","type":"uint256"}],"name":"getEdgeProposal","outputs":[{"name":"nodeKey0","type":"uint256"},{"name":"nodeKey1","type":"uint256"},{"name":"message","type":"bytes30"},{"name":"slot0","type":"uint8"},{"name":"slot1","type":"uint8"},{"name":"valid","type":"bool"},{"name":"connect","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},
      {"constant":true,"inputs":[{"name":"_nodeKey0","type":"uint256"},{"name":"_nodeKey1","type":"uint256"},{"name":"_slot0","type":"uint8"},{"name":"_slot1","type":"uint8"}],"name":"edgeProposalKeyFromNodesAndSlots","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"pure","type":"function"},
      // Events
      {"anonymous":false,"inputs":[{"indexed":false,"name":"edgeProposalKey","type":"uint256"},{"indexed":true,"name":"proposerAddr","type":"address"},{"indexed":true,"name":"proposedToAddr","type":"address"}],"name":"EdgeProposalCreated","type":"event"},
      {"anonymous":false,"inputs":[{"indexed":false,"name":"edgeProposalKey","type":"uint256"},{"indexed":true,"name":"accepterAddr","type":"address"},{"indexed":true,"name":"acceptedAddr","type":"address"}],"name":"EdgeProposalAccepted","type":"event"},
      {"anonymous":false,"inputs":[{"indexed":false,"name":"edgeProposalKey","type":"uint256"},{"indexed":true,"name":"rejecterAddr","type":"address"},{"indexed":true,"name":"rejectedAddr","type":"address"}],"name":"EdgeProposalRejected","type":"event"},
      {"anonymous":false,"inputs":[{"indexed":false,"name":"nodeKey0","type":"uint256"},{"indexed":false,"name":"nodeKey1","type":"uint256"},{"indexed":false,"name":"slot0","type":"uint8"},{"indexed":false,"name":"slot1","type":"uint8"},{"indexed":true,"name":"ownerAddr0","type":"address"},{"indexed":true,"name":"ownerAddr1","type":"address"}],"name":"EdgeCreated","type":"event"},
      {"anonymous":false,"inputs":[{"indexed":false,"name":"nodeKey0","type":"uint256"},{"indexed":false,"name":"nodeKey1","type":"uint256"},{"indexed":false,"name":"slot0","type":"uint8"},{"indexed":false,"name":"slot1","type":"uint8"},{"indexed":true,"name":"ownerAddr0","type":"address"},{"indexed":true,"name":"ownerAddr1","type":"address"}],"name":"EdgeDeleted","type":"event"},
      {"anonymous":false,"inputs":[{"indexed":false,"name":"nodeKey","type":"uint256"},{"indexed":true,"name":"ownerAddr","type":"address"}],"name":"NodeCreated","type":"event"},
      {"anonymous":false,"inputs":[{"indexed":false,"name":"nodeKey","type":"uint256"},{"indexed":true,"name":"ownerAddr","type":"address"}],"name":"NodeDeleted","type":"event"}
    ];
    
    this.addresses = {
      4: "0xaC22849453aA5eDc684c4Fc35EfE6250d1DC2F11",   // Rinkeby
      5777: "0xd9b3369c84f4bd30e00ad296d359b791a24a60e2" // Interweaver's local.
    };
    
    this.contractCreationBlocks = {
      4: 3249396,
      5777: 0
    };
  }
  
  /**
   * Initialize this InterweaveFreeHandler (prepare it for actual calls against the contract.)
   * @param web3Handler The Web3Handler object to use for initializing the InterweaveFreeHandler.
   */
  async initialize(web3handler) {
    
    // Save the Web3 instance
    this.Web3Instance = web3handler.Web3Instance;
    
    // Get network so we can get the contract address.
    this.netId = await web3handler.networkId;
    
    this.address = this.addresses[this.netId];
    if (this.address === undefined) {
      throw new Error("Contract not available on the current network.");
    }
    
    // Create the contract object!
    this.contract = new this.Web3Instance.eth.Contract(this.abi, this.address);
  }
  
  /**
   * Convert from string to an array of Bytes32 (string-encoded).
   * @param ascii The string to encode.
   * @returns an array of strings, each the string representation of a Bytes32.
   */
  stringToBytes32Array(str) {
    let bytesString = this.Web3Instance.utils.fromAscii(str);
    
    let result = [];
    
    while (bytesString.length > 66) {
      result.push(bytesString.substr(0, 66));
      bytesString = "0x" + bytesString.substr(66);
    }
    result.push(bytesString + "0".repeat(66 - bytesString.length));
    
    return result;
  }
  
  /**
   * Convert from an array of Bytes32 (string-encoded) to a string.
   * @param bytes32Array An array of strings, each the string representation of a Bytes32.
   * @returns The string.
   */
  bytes32ArrayToString(bytes32Array) {
    
    // Trim trailing 0s
    let i = 64;
    let lastBytes32 = bytes32Array[bytes32Array.length - 1];
    while (i > -2 && lastBytes32.substr(i, 2) == "00") {
      i-= 2;
    }
    bytes32Array[bytes32Array.length - 1] = lastBytes32.substr(0, i + 2);
    
    let result = "";
    
    // Convert each Bytes32 to a string and tag it to the end of the result string.
    for (i = 0; i < bytes32Array.length; i++) {
      result += this.Web3Instance.utils.toAscii(bytes32Array[i]);
    }
    
    return result;
  }
  
  /**
   * Convert a string to a Bytes32[2] array, and throw an error if the string is too long for this.
   * @param str The string to convert.
   * @returns An array of 2 strings, each the string representation of a Bytes32.
   */
  stringToBytes322(str) {
    let result = this.stringToBytes32Array(str);
    if (result.length === 1) {
      result.push("0x0000000000000000000000000000000000000000000000000000000000000000");
    }
    else if (result.length > 2) {
      throw new Error("Ipfs string was too long - it needs to fit into only 2 bytes32s.");
    }
    return result;
  }
  
  /**
   * Convert a string to a bytes30 (in string form).
   * @param str The string to convert.
   * @returns A bytes30 (in string form).
   */
  stringToBytes30(str) {
    let bytesString = this.Web3Instance.utils.fromAscii(str);
    
    if (bytesString.length > 62) { // 2 characters per byte * 30 bytes + 2 extra characters for the "0x".
      throw new Error("String was too long - it needs to fit into 30 bytes.");
    }
    
    // Pad if it isn't 62 long.
    bytesString = bytesString + "0".repeat(62 - bytesString.length);
    
    return bytesString;
  }
  
  /**
   * Convert a bytes30 (in string form) to a string.
   * @param bytes30 The bytes30, duh.
   * @returns The string.
   */
  bytes30ToString(bytes30) {
    if (bytes30.length !== 62) {
      throw new Error("bytes30 was not 30 bytes!");
    }
    
    // Trim trailing 0s.
    let i = 60;
    while (i > -2 && bytes30.substr(i, 2) == "00") {
      i-= 2;
    }
    bytes30 = bytes30.substr(0, i + 2);
    
    // Finally, convert back to an ascii string.
    return this.Web3Instance.utils.toAscii(bytes30);
  }
  
  /** Simply throw an error if the contract is not initialized. */
  contractMustBeInitialized() {
    if (this.contract === undefined) {
      throw new Error("Contract not initialized.");
    }
  }
  
  /**
   * Get the key for a Node with the given IPFS hash.
   * @param ipfs The IPFS hash string to get the nodeKey from.
   * @returns A Promise wrapping the nodeKey (a string representation of a uint256).
   */
  async nodeKeyFromIpfs(ipfs) {
    this.contractMustBeInitialized();
    
    return await this.contract.methods.nodeKeyFromIpfs(this.stringToBytes322(ipfs)).call();
  }
  
  /**
   * Create a Node!
   * @param ipfs The IPFS hash string to create the Node from.
   * @param addr The Ethereum address of the sender (the account creating the Node.)
   * @returns A Promise wrapping the tx.
   */
  async createNode(ipfs, addr) {
    this.contractMustBeInitialized();
    
    return await this.contract.methods.createNode(this.stringToBytes322(ipfs)).send({from: addr});
  }
  
  /**
   * Delete a Node.
   * @param nodeKey The key of the Node to delete.
   * @param addr The Ethereum address of the sender (the account creating the Node.)
   * @returns A Promise wrapping the tx.
   */
  async deleteNode(nodeKey, addr) {
    this.contractMustBeInitialized();
    
    return await this.contract.methods.deleteNode(nodeKey).send({from: addr});
  }
  
  /**
   * Get the data for a Node by key.
   * @param nodeKey The key of the Node to get the data for.
   * @returns An object containing the Node data: ipfs string, owner address, and an array of the 6 edgeNodeKeys.
   */
  async getNode(nodeKey) {
    this.contractMustBeInitialized();
    
    let rawData = await this.contract.methods.getNode(nodeKey).call();
    
    return {
      key: nodeKey,
      ownerAddr: rawData[0],
      ipfs: this.bytes32ArrayToString(rawData[1]),
      edgeNodeKeys: rawData[2],
      data: undefined
    };
  }
  
  /**
   * Get a list of the keys of all the Nodes currently belonging to the given Ethereum address.
   * @param addr The Ethereum address to check for Nodes.
   * @returns An array of Node keys.
   */
  async getNodesBelongingTo(addr) {
    this.contractMustBeInitialized();
    
    // Get all created and deleted events in parallel using await, Promise.all, and array destructuring :) Yay ES6.
    let [rawCreatedEvents, rawDeletedEvents] = await Promise.all([
      this.contract.getPastEvents(
        "NodeCreated",
        {
          filter: {
            ownerAddr: addr
          },
          fromBlock: this.contractCreationBlocks[this.netId],
          toBlock: "latest"
        }
      ),
      this.contract.getPastEvents(
        "NodeDeleted",
        {
          filter: {
            ownerAddr: addr
          },
          fromBlock: this.contractCreationBlocks[this.netId],
          toBlock: "latest"
        }
      )
    ]);
    
    // TODO For full Interweave Network, also check transfer events!
    
    // Add all the created Nodes, and subtract all the deleted Nodes.
    // The logic here is that you may have created and deleted the same Node multiple times,
    // so only if creations + deletions = 0 for a node does it not exist. It should only ever be 0 or 1 in sum, though, lol!
    let resultNodes = {};
    rawCreatedEvents.forEach((event) => {
      if (resultNodes[event.returnValues.nodeKey] == undefined) {
        resultNodes[event.returnValues.nodeKey] = 1;
      }
      else {
        resultNodes[event.returnValues.nodeKey]++;
      }
    });
    
    rawDeletedEvents.forEach((event) => {
      if (resultNodes[event.returnValues.nodeKey] == 1) {
        delete resultNodes[event.returnValues.nodeKey];
      }
      else if (resultNodes[event.returnValues.nodeKey] == 0) {
        // Check for that invariant, just in case!
        throw new Error("Um, number of Node creations - deletions went negative for nodeKey " + event.returnValues.nodeKey + "???");
      }
      else {
        resultNodes[event.returnValues.nodeKey]--;
      }
    });
    
    return Object.keys(resultNodes);
  }
  
  /**
   * Get the key for an EdgeProposal with the given nodeKeys and slots.
   * @param nodeKey0 The key of Node 0.
   * @param nodeKey1 The key of Node 1.
   * @param slot0 The slot (0-5) of Node 0.
   * @param slot1 The slot (0-5) of Node 1.
   * @returns A Promise wrapping the edgeProposalKey (a string representation of a uint256).
   */
  async edgeProposalKeyFromNodesAndSlots(nodeKey0, nodeKey1, slot0, slot1) {
    this.contractMustBeInitialized();
    
    return await this.contract.methods.edgeProposalKeyFromNodesAndSlots(nodeKey0, nodeKey1, slot0, slot1).call();
  }
  
  /**
   * Create an EdgeProposal!
   * @param nodeKey0 The key for addr's Node0.
   * @param nodeKey1 The key for the Node1 (maybe addr's, maybe not.)
   * @param slot0 The slot for Node0.
   * @param slot1 The slot for Node1.
   * @param message The epmess :) (A <= 30-character message from addr, the proposer, to the proposee.)
   * @param addr The Ethereum address of the sender (the account wanting to link the Nodes.)
   * @returns A Promise wrapping the tx.
   */
  async createEdgeProposal(nodeKey0, nodeKey1, slot0, slot1, message, addr) {
    this.contractMustBeInitialized();
    
    return await this.contract.methods.createEdgeProposal(
      nodeKey0,
      nodeKey1,
      slot0,
      slot1,
      this.stringToBytes30(message)
    ).send({from: addr});
  }
  
  /**
   * Accept an EdgeProposal.
   * @param edgeProposalKey The key of the EdgeProposal to accept (addr must be the proposee.)
   * @param addr The Ethereum address of the sender.
   * @returns A Promise wrapping the tx.
   */
  async acceptEdgeProposal(edgeProposalKey, addr) {
    this.contractMustBeInitialized();
    
    return await this.contract.methods.acceptEdgeProposal(edgeProposalKey).send({from: addr});
  }
  
  /**
   * Reject an EdgeProposal.
   * @param edgeProposalKey The key of the EdgeProposal reject accept (addr must be the proposer or the proposee.)
   * @param addr The Ethereum address of the sender.
   * @returns A Promise wrapping the tx.
   */
  async rejectEdgeProposal(edgeProposalKey, addr) {
    this.contractMustBeInitialized();
    
    return await this.contract.methods.rejectEdgeProposal(edgeProposalKey).send({from: addr});
  }
  
  /**
   * Get the data for an EdgeProposal by key.
   * @param edgeProposalKey The key for the EdgeProposal.
   * @returns The EdgeProposal data. Includes nodeKey0, nodeKey1, message, slot0, slot1, and valid, and connect bools.
   */
  async getEdgeProposal(edgeProposalKey) {
    this.contractMustBeInitialized();
    
    let rawEdgeProposal = await this.contract.methods.getEdgeProposal(edgeProposalKey).call();
    
    return {
      nodeKey0: rawEdgeProposal[0],
      nodeKey1: rawEdgeProposal[1],
      message: this.bytes30ToString(rawEdgeProposal[2]),
      slot0: rawEdgeProposal[3],
      slot1: rawEdgeProposal[4],
      valid: rawEdgeProposal[5],
      connect: rawEdgeProposal[6]
    };
  }
  
  /**
   * Get a list of the keys of all the EdgeProposals currently co-belonging to the given Ethereum address.
   * @param addr The Ethereum address to check for Nodes.
   * @returns An array of EdgeProposal keys.
   */
  async getEdgeProposalsBelongingTo(addr) {
    this.contractMustBeInitialized();
    
    // Get all creation, acceptance, and rejection events in parallel using await, Promise.all, and array destructuring :) Yay ES6.
    let [rawProposerEvents, rawProposedToEvents, rawAccepterEvents, rawAcceptedEvents, rawRejecterEvents, rawRejectedEvents] = await Promise.all([
      this.contract.getPastEvents(
        "EdgeProposalCreated",
        {
          filter: {
            proposerAddr: addr
          },
          fromBlock: this.contractCreationBlocks[this.netId],
          toBlock: "latest"
        }
      ),
      this.contract.getPastEvents(
        "EdgeProposalCreated",
        {
          filter: {
            proposedToAddr: addr
          },
          fromBlock: this.contractCreationBlocks[this.netId],
          toBlock: "latest"
        }
      ),
      this.contract.getPastEvents(
        "EdgeProposalAccepted",
        {
          filter: {
            accepterAddr: addr
          },
          fromBlock: this.contractCreationBlocks[this.netId],
          toBlock: "latest"
        }
      ),
      this.contract.getPastEvents(
        "EdgeProposalAccepted",
        {
          filter: {
            acceptedAddr: addr
          },
          fromBlock: this.contractCreationBlocks[this.netId],
          toBlock: "latest"
        }
      ),
      this.contract.getPastEvents(
        "EdgeProposalRejected",
        {
          filter: {
            rejecterAddr: addr
          },
          fromBlock: this.contractCreationBlocks[this.netId],
          toBlock: "latest"
        }
      ),
      this.contract.getPastEvents(
        "EdgeProposalRejected",
        {
          filter: {
            rejectedAddr: addr
          },
          fromBlock: this.contractCreationBlocks[this.netId],
          toBlock: "latest"
        }
      )
    ]);
    
    // Add all the created EdgeProposals, and subtract all the accepted/rejected EdgeProposals.
    // Similar logic to the code for Nodes, but more complex because of the two-sided ownership of EdgeProposals (so make some helper functions.)
    let resultEdgeProposals = {};
    
    function addEp(arr, resultEdgeProposals) {
      arr.forEach((event) => {
        if (resultEdgeProposals[event.returnValues.edgeProposalKey] == undefined) {
          resultEdgeProposals[event.returnValues.edgeProposalKey] = 1;
        }
        else {
          resultEdgeProposals[event.returnValues.edgeProposalKey]++;
        }
      });
    }
    
    function subEp(arr, resultEdgeProposals) {
      arr.forEach((event) => {
        if (resultEdgeProposals[event.returnValues.edgeProposalKey] == 1) {
          delete resultEdgeProposals[event.returnValues.edgeProposalKey];
        }
        else if (resultEdgeProposals[event.returnValues.edgeProposalKey] == 0) {
          // Check for that invariant, just in case!
          throw new Error("Um, number of EdgeProposal creations - deletions went negative for edgeProposalKey " + event.returnValues.edgeProposalKey + "???");
        }
        else {
          resultEdgeProposals[event.returnValues.edgeProposalKey]--;
        }
      });
    }
    
    // First, add up all the proposer/proposedTo events involving this address. They will be in either one or the other for any given EdgeProposal creation, not both.
    addEp(rawProposerEvents, resultEdgeProposals);
    addEp(rawProposedToEvents, resultEdgeProposals);
    
    // Second, subtract all the accepter/accepted events involving this address. Again, any given EdgeProposal acceptance will have them in one or the other, not both.
    subEp(rawAccepterEvents, resultEdgeProposals);
    subEp(rawAcceptedEvents, resultEdgeProposals);
    subEp(rawRejecterEvents, resultEdgeProposals);
    subEp(rawRejectedEvents, resultEdgeProposals);
    
    return Object.keys(resultEdgeProposals);
  }
}
