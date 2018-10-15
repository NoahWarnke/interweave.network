
/** A class that handles interaction with web3. */
class Web3Handler {
  
  /**
   * Constructor for an instance of Web3Handler. Doesn't do too much.
   */
  constructor() {
    
    this.provider = undefined;
    this.localWeb3 = undefined;
    this.browser = undefined;
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
    setInterval(() => {this.update();}, 1000);
    //setTimeout(() => {this.update();}, 2000);
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
    console.log("Event " + eventName + ": " + oldVal + " -> " + newVal);
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
    
    // Want to notice this, just in case web3 becomes totally deprecated.
    if (this.web3 === undefined) {
      throw new Error("window.ethereum defined but not window.web3");
    }
    
    // If the current provider isn't window.ethereum, upgrade to that.
    if (this.provider !== window.ethereum) {
      console.log("Setting provider to window.ethereum [modern].");
      this.updateState("provider", window.ethereum);
      this.updateState("localWeb3", new this.Web3js(this.provider));
      this.updateState("browser", "modern");
      this.updateState("accountAccessEnabled", false);
      this.updateState("accountAccessRejected", false);
    }
    
    // Update account.
    let networkId = await this.getNetworkId();
    this.updateState("networkId", networkId);
    this.updateState("network", this.mapNetworkString(networkId));
    
    // If the user has not yet rejected account access, update our account information.
    if (!this.accountAccessRejected) {
      try {
        
        // Request user account access...
        let accounts = await this.ethereum.enable();
        
        // No errors, so they granted access.
        this.updateState("accountAccessEnabled", true);
        
        // No default account (user not signed in?)
        if (accounts.length === 0) {
          this.updateState("loggedIn", false);
          this.updateState("account", undefined);
          console.log("Modern/access granted/not logged in");
        }
        else {
          // Default account available (user signed in)
          this.updateState("loggedIn", true);
          this.updateState("account", accounts[0]);
          console.log("Modern/access granted/logged in");
        }
      }
      // User rejected account access.
      catch (error) {
        this.updateState("loggedIn", undefined); // Don't know if they are logged in or not.
        this.updateState("accountAccessEnabled", false);
        this.updateState("accountAccessRejected", true);
        this.updateState("account", undefined);
        console.log("Modern/access rejected: " + error);
      }
    }
  }
  
  /** Update the Web3Handler's state given this is a legacy dapp browser (with window.web3 set but not window.ethereum). */
  async updateLegacy() {
    
    // If the current provider isn't web3.currentProvider, set to that.
    if (this.provider !== window.web3.currentProvider) {
      console.log("Setting provider to web3.currentProvider [legacy].");
      this.updateState("provider", window.web3.currentProvider);
      this.updateState("localWeb3", new Web3(this.provider));
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
      console.log("Legacy/logged in");
    }
    else {
      this.updateState("loggedIn", false);
      this.updateState("account", undefined);
      console.log("Legacy/not logged in");
    }
  }
  
  /** Update the Web3Handler's state given this is a non-dapp browser with no crypto-related variables already set. */
  async updateNonDapp() {
    
    if (this.infuraProvider === undefined) {
      this.infuraProvider = new Web3.providers.WebsocketProvider("wss://rinkeby.infura.io/ws");
    }
    
    if (this.provider !== this.infuraProvider) {
      console.log("Setting provider to infura.io [non-dapp browser].");
      this.updateState("provider", this.infuraProvider);
      this.updateState("localWeb3", new Web3(this.provider));
      this.updateState("browser", "nondapp");
      this.updateState("accountAccessEnabled", false);
      this.updateState("accountAccessRejected", false);
      this.updateState("account", undefined);
      this.updateState("networkId", 4);
      this.updateState("network", this.mapNetworkString(3));
    }
    console.log("Non/not logged in");
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
      default: return "Unknown";
    }
  }
}
