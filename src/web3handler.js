/** A class that handles interaction with web3. */
class Web3Handler {
  
  /** Constructor. */
  constructor() {
    this.localWeb3 = undefined;
    this.accountAccessEnabled = false;
    this.tokenContract = undefined;
    
    // Check for library.
    if (this.web3LibraryUnavailable()) {
      console.log("Web3.js library missing...");
      return;
    }
    
    // Check for provider.
    if (this.providerUnavailable()) {
      console.log("No injected provider. Get MetaMask?");
      return;
    }
    else {
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
  
  /** @returns the dapp's Solidity contract for the given network, or false if unavailable. */
  contractAddress(netId) {
    switch (netId) {
      case 3: {
        return "0xb3ac9b8ef39b5fef2e68d16444e72c5878e48514";
      }
      default: {
        return false;
      }
    }
  }
  
  /** @returns the contract ABI, or false if not available. */
  contractABI() {
    if (!storelinkABI) {
      return false;
    }
    return storelinkABI;
  }
  
  /** @returns true if contract ABI variable is not available. */
  contractABIUnavailable() {
    return (this.contractABI() === false);
  }
  
  /** Prepare the dapp contract object for calling and sending. */
  async prepareContract() {
    // Get contract access.
    if (this.contractABIUnavailable()) {
      throw new Error("Contract ABI variable is not available. Can't access contract.");
    }
    let contractABI = this.contractABI();
    
    // Get network so we can get the contract address.
    let netId = await this.getNetwork();
    if (netId === false) {
      throw new Error("Network not available. Can't select contract address, so can't access contract.");
    }
    
    let contractAddress = this.contractAddress(netId);
    if (contractAddress === false) {
      throw new Error("Contract not available on the current network.");
    }
    
    // Create the contract object!
    this.tokenContract = new this.localWeb3.eth.Contract(contractABI, contractAddress);
  }
  
  /** @returns the default Eth account from the injected web3 interface, if it is available, or false otherwise. */
  async getDefaultAccount() {
        
    // Modern dapp browsers.
    if (window.ethereum) {
      // Modern dapp browser.
      this.accountAccessEnabled = false;
      try {
        // Request user account access...
        let accounts = await window.ethereum.enable();
        this.accountAccessEnabled = true;
        if (accounts.length === 0) {
          // Access granted, but no default account (user not signed in?)
          return false;
        }
        // Access granted, return default account.
        return accounts[0];
      }
      catch (error) {
        // User rejected account access.
        return false;
      }
    }
    
    // Legacy dapp browsers.
    if (!this.web3InterfaceUnavailable()) {
      this.accountAccessEnabled = true;
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
  
  /** @returns (asynchronously) a number indicating the current network, from the injected web3 interface, if it exists, or false otherwise. */
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
          resolve(parseInt(netId));
        }
      });
    });
  }
  
  /** @returns (asynchronously) a string indicating the current network, if available, or false otherwise. */
  getNetworkString() {
    return this.getNetwork().then((netId) => {
      if (netId === false) {
        return false;
      }
      switch (netId) {
        case 1: return "Mainnet";
        case 2: return "Morden";
        case 3: return "Ropsten";
        case 4: return "Rinkeby";
        case 42: return "Kovan";
        default: return "Unknown";
      }
    });
  }
  
  /**
   * Call the getLink function on the test contract.
   * @param ethAddress the Eth address to look up in the contract.
   * @returns the string the Eth address maps to in the contract (may be "" if not set, or false if unable to call contract.)
   */
  testContractGetValue(ethAddress) {
    
    if (this.tokenContract === undefined) {
      console.log("Contract not initialized, can't call getLink function.");
      return false;
    }
    
    return this.tokenContract.methods.getLink(ethAddress).call();
  }
  
  /**
   * Send a new transaction calling the setLink function on the test contract.
   * @param ethAddress the Eth address to set the value for in the contract.
   * @param newValue the new string (must be <= 32 characters) to set the
   * @returns the string the Eth address maps to in the contract (may be false).
   */
  testContractSetValue(ethAddress, newValue) {
    
    if (newValue.length > 32) {
      console.log("String too long.");
      return;
    }
    
    if (this.tokenContract === undefined) {
      console.log("Contract not initialized, can't call getLink function.");
      return false;
    }
    
    return new Promise((resolve, reject) => {
      this.tokenContract.methods.setLink(newValue).send({from: ethAddress, value: 0})
        .on("receipt", (receipt) => resolve(receipt))
        .on("error", (error) => reject(error))
      ;
    });
  }
}
