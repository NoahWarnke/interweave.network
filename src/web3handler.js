/** A class that handles interaction with web3. */
class Web3Handler {
  
  /** Constructor. */
  constructor() {
    this.localWeb3 = undefined;
    this.accountAccessEnabled = false;
    
    // Check for library.
    if (this.web3LibraryUnavailable()) {
      console.log("Web3.js library missing...");
      return;
    }
    else {
      console.log("Web3.js library available.");
    }
    
    // Check for provider.
    if (this.providerUnavailable()) {
      console.log("No injected provider. Get MetaMask?");
      return;
    }
    else {
      console.log("web3 interface was injected. Using it to create a new Web3 instance.");
      this.localWeb3 = new (this.web3Library())(this.provider());
    }
  }
  
  /** @returns the injected instance of the web3 interface, if it exists. */
  web3Interface() {
    return window.web3;
  }
  
  /** @returns true if injected instance of web3 interface doesn't exist, or false if it does. */
  web3InterfaceUnavailable() {
    return (typeof this.web3Interface() === 'undefined');
  }

  /** @returns the current injected provider, if it exists, or false otherwise. */
  provider() {
    if (window.ethereum) {
      return window.ethereum;
    }
    if (window.web3) {
      return web3.currentProvider;
    }
    return false;
  }

  /** @returns true if injected provider doesn't exist, or false if it does. */
  providerUnavailable() {
    return (this.provider() === false);
  }
  
  /** @returns the included Web3 library object, if it exists, or false otherwise (shouldn't be!). */
  web3Library() {
    if (window.Web3) {
      return window.Web3;
    }
    return false;
  }
  
  /** @returns true if Web3 library object doesn't exist, or false if it does. */
  web3LibraryUnavailable() {
    return (this.web3Library() === false);
  }
  
  /** @returns the default Eth account from the injected web3 interface, if it is available, or false otherwise. */
  async getDefaultAccount() {
        
    // Modern dapp browsers.
    if (window.ethereum) {
      this.accountAccessEnabled = false;
      try {
        console.log("Modern dapp browser, requesting user account access...");
        let accounts = await window.ethereum.enable();
        this.accountAccessEnabled = true;
        if (accounts.length === 0) {
          console.log("Access granted, but no default account (user not signed in?)");
          return false;
        }
        console.log("Access granted, returning default account.");
        return accounts[0];
      }
      catch (error) {
        console.log("User rejected account access.");
        return false;
      }
    }
    
    // Legacy dapp browsers.
    if (!this.web3InterfaceUnavailable()) {
      console.log("Legacy dapp browser, getting defaultAccount.");
      return this.web3Interface().eth.defaultAccount;
    }
    
    console.log("Browser without Ethereum support, so can't get default account. Install MetaMask?");
    return false;
  }
  
  /** @returns true if user has granted access to their public accounts. */
  accountAccessGranted() {
    return this.accountAccessEnabled;
  }
  
  /** @returns (asynchronously) a string indicating the current network, mapped from the injected web3 interface, if it exists, or false otherwise. */
  getNetwork() {
    if (this.web3InterfaceUnavailable()) {
      console.log("No injected web3 interface, cannot get current network.")
      return false;
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
