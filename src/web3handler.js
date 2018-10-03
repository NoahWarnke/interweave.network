/** A class that handles interaction with web3. */
class Web3Handler {
  
  /** Constructor. */
  constructor() {
    this.provider = undefined;
    this.localWeb3 = undefined;
  }
  
  /** @returns the injected instance of the web3 interface, if it exists. */
  web3Interface() {
    return window.web3;
  }
  
  /** @returns true if injected instance of web3 interface doesn't exist, or false if it does. */
  web3InterfaceUnavailable() {
    return (typeof this.web3Interface() === 'undefined');
  }
  
  /** @returns the included Web3 library object, if it exists. */
  web3Library() {
    return window.Web3;
  }
  
  /** @returns true if Web3 library object doesn't exist, or false if it does. */
  web3LibraryUnavailable() {
    return (typeof this.web3Library() === 'undefined');
  }
  
  /** @returns the default Eth account from the injected web3 interface, if it exists. */
  getDefaultAccount() {
    if (this.web3InterfaceUnavailable()) {
      console.log("No injected web3 interface, cannot get default account.")
      return;
    }
    return this.web3Interface().eth.defaultAccount;
  }
  
  /** @returns a string indicating the current network, mapped from the injected web3 interface, if it exists. */
  getNetwork() {
    if (this.web3InterfaceUnavailable()) {
      console.log("No injected web3 interface, cannot get current network.")
      return;
    }
    return new Promise((resolve, reject) => {
      this.web3Interface().version.getNetwork((err, netId) => {
        if (err) {
          reject(err);
        }
        else {
          let networks = ["Unknown", "Mainnet", "Morden", "Ropsten", "Rinkeby", "Kovan"];
          resolve(
            netId < networks.length
              ? networks[netId]
              : "Unknown"
          );
        }
      });
    });
  }
  
  /**
   * Sets up state variables for this Web3Hander, including getting the injected provider
   * and creating a new Web3 instance from it.
   */
  async setUpProvider() {
    console.log("Window loaded...");
    
    // Check for library.
    if (this.web3LibraryUnavailable()) {
      console.log("Web3.js library missing...");
      return;
    }
    else {
      console.log("Web3.js library available.");
    }
    
    // Check for interface.
    if (this.web3InterfaceUnavailable()) {
      console.log("No injected web3 interface. Get MetaMask?");
      return;
    }
    else {
      console.log("web3 interface was injected. Using it to create a new Web3 instance.");
      
      this.provider = this.web3Interface().currentProvider;
      this.localWeb3 = new (this.web3Library())(this.provider);
    }
  }
  
  /**
   * Call the getLink function on the test contract.
   * @param ethAddress the Eth address to look up in the contract.
   * @returns the string the Eth address maps to in the contract (may be false).
   */
  testContractGetValue(ethAddress) {
    if (this.web3LibraryUnavailable() || this.web3InterfaceUnavailable()) {
      console.log("Dapp not ready, cannot try calling a contract.");
      return;
    }
    
    var contractABI = storelinkABI;
    var contractAddress = "0xb3ac9b8ef39b5fef2e68d16444e72c5878e48514";
    var tokenContract = new this.localWeb3.eth.Contract(contractABI, contractAddress);
    var methods = tokenContract.methods;
    
    return methods.getLink(ethAddress).call();
  }
  
  /**
   * Send a new transaction calling the setLink function on the test contract.
   * @param ethAddress the Eth address to set the value for in the contract.
   * @param newValue the new string (must be <= 32 characters) to set the
   * @returns the string the Eth address maps to in the contract (may be false).
   */
  testContractSetValue(ethAddress, newValue) {
    if (newValue.length > 32) {
      console.log("Too long.");
      return;
    }
    
    if (this.web3LibraryUnavailable() || this.web3InterfaceUnavailable()) {
      console.log("Dapp not ready, cannot try calling a contract.");
      return;
    }
    
    var contractABI = storelinkABI;
    var contractAddress = "0xb3ac9b8ef39b5fef2e68d16444e72c5878e48514";
    var tokenContract = new this.localWeb3.eth.Contract(contractABI, contractAddress);
    var methods = tokenContract.methods;
    
    return new Promise((resolve, reject) => {
      methods.setLink(newValue).send({from: ethAddress, value: 0})
        .on("receipt", (receipt) => resolve(receipt))
        .on("error", (error) => reject(error))
      ;
    });
  }
}
