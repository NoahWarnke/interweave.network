/** A class that handles interaction with IPFS. */
export default class IpfsHandler {
  
  /**
   * Constructor for an instance of Web3Handler. Doesn't do too much.
   */
  constructor() {
    
    this.ipfsAddress = "https://ipfs.io/ipfs/";
    this.nodePresent = false;
    this.nodeVersion = undefined;
    
    this.listeners = {};
  }
  
  /**
   * Initialize this IpfsHandler. Checks if the IPFS node is available, and then starts polling to update that regularly.
   */
  async initialize() {
    await this.update();
    
    setInterval(() => {
      this.update();
    }, 5000);
    
    setTimeout(() => {
      this.update();
    }, 2000);
  }
  
  /**
   * Register a listener for IPFS-related events.
   */
  registerListener(eventName, callback) {
    if (this.listeners[eventName] === undefined) {
      this.listeners[eventName] = [callback];
    }
    else {
      this.listeners[eventName].push(callback);
    }
  }
  
  /**
   * An event happened, so send to all registered listeners.
   */
  fireEvent(eventName, oldVal, newVal) {
    console.log("IpfsHandler fireEvent " + eventName + ": " + oldVal + " -> " + newVal);
    if (this.listeners[eventName] !== undefined) {
      this.listeners[eventName].forEach(callback => callback(oldVal, newVal));
    }
  }
  
  /**
   * Update the state of an IpfsHandler value.
   */
  updateState(varName, newVal) {
    
    if (this[varName] === newVal) {
      return; // No update.
    }
    
    let varToEventMapping = {
      "nodePresent": "nodePresenceChanged",
      "nodeVersion": "nodeVersionChanged"
    }
    
    if (varToEventMapping[varName]) {
      this.fireEvent(varToEventMapping[varName], this[varName], newVal);
    }
    
    this[varName] = newVal;
  }
  
  /** Update the web3Handler's state given the current state of window variables. */
  async update() {
    
  }
  
  async getVersion() {
    
  }
  
  async getFile(ipfsHash) {
    
  }
  
  async addAndPinFile(localPathToFile) {
    
  }
}
