
/** A class that handles interaction with web3. */
export default class Web3Handler {
  
  /**
   * Constructor for an instance of Web3Handler. Doesn't do too much.
   */
  constructor() {
    
    this.provider = undefined;
    this.Web3Instance = undefined;
    this.browser = undefined;
    this.accountRequested = false;
    this.loggedIn = undefined;
    this.accountAccessEnabled = false;
    this.accountAccessRejected = false;
    this.account = undefined;
    this.networkId = undefined;
    this.network = undefined;
    
    this.listeners = {};
  }
  
  /**
   * Initialize this web3Handler. Gets all the current dapp-browser state, and then starts polling to update that regularly. */
  async initialize() {
    await this.update();
    //setInterval(() => {this.update();}, 1000);
    setTimeout(() => {this.update();}, 2000);
  }
  
  registerListener(eventName, callback) {
    if (this.listeners[eventName] === undefined) {
      this.listeners[eventName] = [callback];
    }
    else {
      this.listeners[eventName].push(callback);
    }
  }
  
  fireEvent(eventName, oldVal, newVal) {
    console.log("Web3Handler fireEvent " + eventName + ": " + oldVal + " -> " + newVal);
    if (this.listeners[eventName] !== undefined) {
      this.listeners[eventName].forEach(callback => callback(oldVal, newVal));
    }
  }
  
  updateState(varName, newVal) {
    
    if (this[varName] === newVal) {
      return; // No update.
    }
    
    let varToEventMapping = {
      "browser": "browserTypeChanged",
      "loggedIn": "loggedInStatusChanged",
      "accountAccessEnabled": "accessEnabledChanged",
      "accountAccessRejected": "accessRejectedChanged",
      "account": "accountChanged",
      "network": "networkChanged"
    }
    
    if (varToEventMapping[varName]) {
      this.fireEvent(varToEventMapping[varName], this[varName], newVal);
    }
    
    this[varName] = newVal;
  }
  
  /** Update the web3Handler's state given the current state of window variables. */
  async update() {
    if (window.ethereum !== undefined) {
      await this.updateModern();
    }
    else if (window.web3 !== undefined) {
      await this.updateLegacy();
    }
    else {
      await this.updateNonDapp();
    }
  }
  
  /** Update the Web3Handler's state given this is a modern dapp browser (with window.ethereum set). */
  async updateModern() {
    
    // If the current provider isn't window.ethereum, upgrade to that.
    if (this.provider !== window.ethereum) {
      this.updateState("provider", window.ethereum);
      this.updateState("Web3Instance", new Web3(this.provider));
      this.updateState("browser", "modern");
      this.updateState("accountAccessEnabled", false);
      this.updateState("accountAccessRejected", false);
    }
    
    // Update account.
    let networkId = await this.getNetworkId();
    this.updateState("networkId", networkId);
    this.updateState("network", this.mapNetworkString(networkId));
    
    // If we don't need account info yet, we're done here.
    if (!this.accountRequested) {
      console.log("Web3Handler updateModern: account access not requested, so not trying to get it...");
      return;
    }
    
    // If the user has not yet rejected account access, update our account information.
    if (!this.accountAccessRejected) {
      try {
        
        // Request user account access...
        let accounts = await window.ethereum.enable();
        
        // No errors, so they granted access.
        this.updateState("accountAccessEnabled", true);
        
        // No default account (user not signed in?)
        if (accounts.length === 0) {
          this.updateState("loggedIn", false);
          this.updateState("account", undefined);
        }
        else {
          // Default account available (user signed in)
          this.updateState("loggedIn", true);
          this.updateState("account", accounts[0]);
        }
      }
      // User rejected account access.
      catch (error) {
        console.log(error);
        this.updateState("loggedIn", undefined); // Don't know if they are logged in or not.
        this.updateState("accountAccessEnabled", false);
        this.updateState("accountAccessRejected", true);
        this.updateState("account", undefined);
      }
    }
  }
  
  /** Update the Web3Handler's state given this is a legacy dapp browser (with window.web3 set but not window.ethereum). */
  async updateLegacy() {
    
    // If the current provider isn't web3.currentProvider, set to that.
    if (this.provider !== window.web3.currentProvider) {
      this.updateState("provider", window.web3.currentProvider);
      this.updateState("Web3Instance", new Web3(this.provider));
      this.updateState("browser", "legacy");
      this.updateState("accountAccessEnabled", true); // Legacy gives account access always.
      this.updateState("accountAccessRejected", false);
    }
    
    // Update network.
    let networkId = await this.getNetworkId();
    this.updateState("networkId", networkId);
    this.updateState("network", this.mapNetworkString(networkId));
    
    // Update account.
    if (window.web3.eth.defaultAccount !== undefined) {
      this.updateState("loggedIn", true);
      this.updateState("account", window.web3.eth.defaultAccount);
    }
    else {
      this.updateState("loggedIn", false);
      this.updateState("account", undefined);
    }
  }
  
  /** Update the Web3Handler's state given this is a non-dapp browser with no crypto-related variables already set. */
  async updateNonDapp() {
    
    if (this.infuraProvider === undefined) {
      this.infuraProvider = new Web3.providers.WebsocketProvider("wss://rinkeby.infura.io/ws");
    }
    
    if (this.provider !== this.infuraProvider) {
      this.updateState("provider", this.infuraProvider);
      this.updateState("Web3Instance", new Web3(this.provider));
      this.updateState("browser", "nondapp");
      this.updateState("accountAccessEnabled", false);
      this.updateState("accountAccessRejected", false);
      this.updateState("account", undefined);
      this.updateState("networkId", 4);
      this.updateState("network", this.mapNetworkString(3));
    }
  }
  
  /** Attempt to get the user's account info (trigger a MetaMask connect request.) */
  requestAccount() {
    if (!this.accountRequested) {
      this.accountRequested = true;
      this.update();
    }
  }
  
  /** @returns the current result of getNetwork, wrapped in a Promise. */
  getNetworkId() {
    return new Promise((resolve, reject) => {
      window.web3.version.getNetwork((err, netId) => {
        if (err) {
          reject(err);
        }
        else {
          resolve(parseInt(netId));
        }
      });
    });
  }
  
  /**
   * Get the string version of a networkId. Should be static.
   * @param networkId the id to map.
   * @returns a string indicating the current network.
   */
  mapNetworkString(networkId) {
    switch (networkId) {
      case 1: return "Mainnet";
      case 2: return "Morden";
      case 3: return "Ropsten";
      case 4: return "Rinkeby";
      case 42: return "Kovan";
      default: return "Unknown Network (ID " + networkId + ")";
    }
  }
}
