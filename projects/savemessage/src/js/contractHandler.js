/**
 * Represents an interface with the StoreLink smart contract.
 */
class StoreLinkContractHandler {
  
  /**
   * Constructor for a new StoreLinkContractHandler object, which wraps a contract.
   */
  constructor() {
    
    this.abi = [
      {
        "constant":false,
        "inputs":[{"name":"_link","type":"string"}],
        "name":"setLink",
        "outputs":[],
        "payable":false,
        "stateMutability":"nonpayable",
        "type":"function"
      },
      {
        "constant":true,
        "inputs":[{"name":"_owner","type":"address"}],
        "name":"getLink",
        "outputs":[{"name":"","type":"string"}],
        "payable":false,
        "stateMutability":"view",
        "type":"function"
      },
      {
        "anonymous":false,
        "inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":false,"name":"newLink","type":"string"}],
        "name":"LinkChanged",
        "type":"event"
      }
    ];
    
    this.addresses = {
      3: "0xb3ac9b8ef39b5fef2e68d16444e72c5878e48514"
    };
  }
  
  /**
   * Initialize this StoreLinkContractHandler (prepare it for actual calls against the contract.)
   * @param web3Handler The Web3Handler object to use for initializing the StoreLinkContractHandler.
   */
  async initialize(web3handler) {
    
    // Get network so we can get the contract address.
    let netId = await web3handler.networkId;
    
    this.address = this.addresses[netId];
    if (this.address === undefined) {
      throw new Error("Contract not available on the current network.");
    }
    
    // Create the contract object!
    this.tokenContract = new web3handler.localWeb3.eth.Contract(this.abi, this.address);
  }
  
  /**
   * Call the getLink function on the test contract.
   * @param ethAddress the Eth address to look up in the contract.
   * @returns a Promise wrapping the string the Eth address maps to in the contract (may be "" if not set.)
   */
  getLink(ethAddress) {
    
    if (this.tokenContract === undefined) {
      throw new Error("Contract not initialized, can't call getLink function.");
    }
    
    return this.tokenContract.methods.getLink(ethAddress).call();
  }
  
  /**
   * Send a new transaction calling the setLink function on the test contract.
   * @param ethAddress the Eth address to set the value for in the contract.
   * @param newValue the new string (must be <= 32 characters) to set the
   * @returns a PromiEvent for the assorted tx events. If successful, 'receipt' will be the transaction receipt.
   */
  setLink(ethAddress, newValue) {
    if (newValue.length > 32) {
      throw new Error("String too long.");
    }
    
    if (this.tokenContract === undefined) {
      throw new Error("Contract not initialized, can't call getLink function.");
    }
    
    return this.tokenContract.methods.setLink(newValue).send({from: ethAddress, value: 0});
    
    /**
    return new Promise((resolve, reject) => {
      this.tokenContract.methods.setLink(newValue).send({from: ethAddress, value: 0})
        .on("receipt", (receipt) => resolve(receipt))
        .on("error", (error) => reject(error))
      ;
    });
    */
  }
}
