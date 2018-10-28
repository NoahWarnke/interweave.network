/**
 * Represents an interface with the InterweaveFreeProposals smart contract.
 */
class InterweaveFreeHandler {
  
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
      5777: "0xd9b3369c84f4bd30e00ad296d359b791a24a60e2"
    };
    
    this.contractCreationBlocks = {
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
   * Convert from ascii to an array of Bytes32 (string-encoded).
   * @param ascii The ASCII string to encode.
   * @returns an array of strings, each the string representation of a Bytes32.
   */
  asciiToBytes32Array(ascii) {
    let bytesString = this.Web3Instance.utils.fromAscii(ascii);
    
    let result = [];
    
    while (bytesString.length > 66) {
      result.push(bytesString.substr(0, 66));
      bytesString = "0x" + bytesString.substr(66);
    }
    result.push(bytesString + "0".repeat(66 - bytesString.length));
    
    return result;
  }
  
  /**
   * Convert from an array of Bytes32 (string-encoded) to an ASCII string.
   * @param bytes32Array An array of strings, each the string representation of a Bytes32.
   * @returns The ASCII string.
   */
  bytes32ArrayToAscii(bytes32Array) {
    
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
   * Call the nodeKeyFromIpfs function on the InterweaveFreeGraph contract (or rather, the InterweaveFreeProposals contract that inherits from it).
   * @param ipfs The IPFS hash (in String form) to get the nodeKey from.
   * @returns A Promise wrapping the nodeKey (a string representation of a uint256).
   */
  nodeKeyFromIpfs(ipfs) {
    if (this.contract === undefined) {
      throw new Error("Contract not initialized.");
    }
    
    // Convert to array and make sure it's 2 long.
    let bytes32Array = this.asciiToBytes32Array(ipfs);
    if (bytes32Array.length === 1) {
      bytes32Array.push("0x0000000000000000000000000000000000000000000000000000000000000000");
    }
    else if (bytes32Array.length > 2) {
      throw new Error("Ipfs string was too long - it needs to fit into only 2 bytes32s.");
    }
    
    return this.contract.methods.nodeKeyFromIpfs(bytes32Array).call();
  }
  
  /**
   * Call the getHash function on the test contract.
   * @param ethAddress the Eth address to look up in the contract.
   * @returns a Promise wrapping the IPFS hash the Eth address maps to in the contract (may be "" if not set.)
   */
   /*
  getHash(ethAddress) {
    
    if (this.contract === undefined) {
      throw new Error("Contract not initialized, can't call getHash function.");
    }
    
    return this.contract.methods.getHash(ethAddress).call();
  }
  */
  /**
   * Send a new transaction calling the setHash function on the test contract.
   * @param ethAddress the Eth address to set the value for in the contract.
   * @param newValue the new hash (must be 46 characters) to set the value to.
   * @returns a PromiEvent for the assorted tx events. If successful, 'receipt' will be the transaction receipt.
   */
   /*
  setHash(ethAddress, newValue) {
    if (newValue.length !== 46) {
      throw new Error("String not 46 characters.");
    }
    
    if (this.contract === undefined) {
      throw new Error("Contract not initialized, can't call setHash function.");
    }
    
    return this.contract.methods.setHash(newValue).send({from: ethAddress, value: 0});
  }
  */
  
  /**
   * Get all the HashChanged events for the given Eth address.
   * @param ethAddress the Eth address to check the logs for.
   * @returns A list of the past hash changs, each containing the new hash and the block number.
   */
   /*
  async getHashChangedEvents(ethAddress) {
    
    let rawEvents = await this.contract.getPastEvents(
      "HashChanged",
      {
        filter: {
          owner: ethAddress
        },
        fromBlock: this.contractCreationBlocks[this.netId],
        toBlock: "latest"
      }
    )
    
    return rawEvents.map((rawEvent) => {
      return {
        block: rawEvent.blockNumber,
        hash: rawEvent.returnValues.newHash,
        tx: rawEvent.transactionHash
      };
    });
  }
  */
}
