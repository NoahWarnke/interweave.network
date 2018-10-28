/**
 * Represents an interface with the SetHash smart contract.
 */
class SetHashContractHandler {
  
  /**
   * Constructor for a new SetHashContractHandler object, which wraps a contract.
   */
  constructor() {
    
    this.abi = [
      {"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"getHash","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},
      {"constant":false,"inputs":[{"name":"_hash","type":"string"}],"name":"setHash","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},
      {"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":false,"name":"newHash","type":"string"}],"name":"HashChanged","type":"event"}
    ];
    
    this.addresses = {
      //3: "0xb3ac9b8ef39b5fef2e68d16444e72c5878e48514",
      4: "0xB3AC9B8eF39B5feF2E68d16444e72C5878E48514",
      5777: "0x26e9de161aaebbb6a6b15c69591300edd8a8be25"
    };
    
    this.contractCreationBlocks = {
      4: 3162223,
      5777: 44
    };
  }
  
  /**
   * Initialize this SetHashContractHandler (prepare it for actual calls against the contract.)
   * @param web3Handler The Web3Handler object to use for initializing the SetHashContractHandler.
   */
  async initialize(web3handler) {
    
    // Get network so we can get the contract address.
    this.netId = await web3handler.networkId;
    
    this.address = this.addresses[this.netId];
    if (this.address === undefined) {
      throw new Error("Contract not available on the current network.");
    }
    
    // Create the contract object!
    this.tokenContract = new web3handler.localWeb3.eth.Contract(this.abi, this.address);
  }
  
  /**
   * Call the getHash function on the test contract.
   * @param ethAddress the Eth address to look up in the contract.
   * @returns a Promise wrapping the IPFS hash the Eth address maps to in the contract (may be "" if not set.)
   */
  getHash(ethAddress) {
    
    if (this.tokenContract === undefined) {
      throw new Error("Contract not initialized, can't call getHash function.");
    }
    
    return this.tokenContract.methods.getHash(ethAddress).call();
  }
  
  /**
   * Send a new transaction calling the setHash function on the test contract.
   * @param ethAddress the Eth address to set the value for in the contract.
   * @param newValue the new hash (must be 46 characters) to set the value to.
   * @returns a PromiEvent for the assorted tx events. If successful, 'receipt' will be the transaction receipt.
   */
  setHash(ethAddress, newValue) {
    if (newValue.length !== 46) {
      throw new Error("String not 46 characters.");
    }
    
    if (this.tokenContract === undefined) {
      throw new Error("Contract not initialized, can't call setHash function.");
    }
    
    return this.tokenContract.methods.setHash(newValue).send({from: ethAddress, value: 0});
  }
  
  /**
   * Get all the HashChanged events for the given Eth address.
   * @param ethAddress the Eth address to check the logs for.
   * @returns A list of the past hash changs, each containing the new hash and the block number.
   */
  async getHashChangedEvents(ethAddress) {
    
    let rawEvents = await this.tokenContract.getPastEvents(
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
}
