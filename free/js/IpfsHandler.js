import Utils from "./Utils.js";

/** A class that handles interaction with IPFS. */
export default class IpfsHandler {
  
  /**
   * Constructor for an instance of Web3Handler. Doesn't do too much.
   */
  constructor() {
    
    this.ipfsAddress = "https://ipfs.io/ipfs/";
    this.nodePort = 5001; // TODO: make changeable by user.
    this.nodePresent = false;
    this.nodeErorr = undefined;
    this.nodeVersion = undefined;
    
    this.listeners = {};
  }
  
  /**
   * Initialize this IpfsHandler. Checks if the IPFS node is available, and then starts polling to update that regularly.
   */
  async initialize() {
    console.log("Ipfs handler init!");
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
      "nodePresent": "nodePresentChanged",
      "nodeVersion": "nodeVersionChanged",
      "nodeError": "nodeErrorChanged"
    }
    
    if (varToEventMapping[varName]) {
      this.fireEvent(varToEventMapping[varName], this[varName], newVal);
    }
    
    this[varName] = newVal;
  }
  
  /** Update the web3Handler's state given the current state of window variables. */
  async update() {
    let version = undefined;
    let error = "Missing or undefined Version";
    try {
      version = await this.getVersion();
    }
    catch (err) {
      error = err;
    }
    if (version === undefined || version === "") {
      this.updateState("nodePresent", false);
      this.updateState("nodeVersion", undefined);
      this.updateState("nodeError", error);
    }
    else {
      this.updateState("nodePresent", true);
      this.updateState("nodeVersion", version);
      this.updateState("nodeError", undefined);
    }
  }
  
  /**
   * Get the version of the IPFS node the user may or may not have running. */
  async getVersion() {
    let versionJson = await Utils.getAjax("http://localhost:" + this.nodePort + "/api/v0/version", 10000);
    let result = JSON.parse(versionJson);
    if (result !== undefined) {
      return result.Version;
    }
    return undefined;
  }
  
  async getFile(ipfsHash) {
    if (this.nodePresent) {
      return await Utils.getAjax("http://localhost:" + this.nodePort + "/api/v0/get/" + ipfsHash);
    }
    // Web ipfs gateway fallback.
    return await Utils.getAjax(this.ipfsAddress + ipfsHash);
  }
  
  async addAndPinFile(localPathToFile) {
    
  }
}
