import Utils from "./Utils.js";

/** A class that handles interaction with IPFS. */
export default class IpfsHandler {
  
  /**
   * Constructor for an instance of Web3Handler. Doesn't do too much.
   */
  constructor() {
    
    this.defaultGatewayAddress = "https://ipfs.io/ipfs/";
    
    // Your node details (maybe local, maybe not)
    // TODO make settable by user.
    this.nodeAddress = "localhost";
    this.nodePort = 5001;
    
    // Handler state.
    this.ipfsHttpClient = undefined;
    this.nodePresent = false;
    this.nodeError = undefined;
    this.nodeVersion = undefined;
    
    this.listeners = {};
  }
  
  /**
   * Initialize this IpfsHandler. Checks if the IPFS node is available, and then starts polling to update that regularly.
   */
  async initialize() {
    console.log("Ipfs handler init!");
    await this.update();
    
    //setInterval(() => {this.update();}, 5000);
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
    
    this.ipfsHttpClient = window.IpfsHttpClient(this.nodeAddress, this.nodePort);
    
    let version = undefined;
    let error = "Missing or undefined Version";
    try {
      version = await this.getVersion();
    }
    catch (err) {
      error = "Unable to connect to IPFS node at " + this.nodeAddress + ":" + this.nodePort + ". " + err.toString();
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
    let result = await this.ipfsHttpClient.version();
    if (result !== undefined) {
      return result.version;
    }
    return undefined;
  }
  
  /**
   * Get an IPFS file with the given hash. Will use a web gateway if no local node.
   */
  async getFile(ipfsHash) {
    if (this.nodePresent) {
      let results = await this.ipfsHttpClient.get(ipfsHash);
      if (results.length === 0) {
        throw new Exception("No files at ipfs hash " + ipfsHash);
      }
      return results[0].content.toString();
    }
    // Web ipfs gateway fallback.
    return await Utils.getAjax(this.defaultGatewayAddress + ipfsHash, 30000);
  }
  
  /** Add file to IPFS. */
  async addAndPinFile(fileContentString) {
    if (!this.nodePresent) {
      throw new Exception("Cannot upload file without an IPFS node available!");
    }
    
    let buffer = this.ipfsHttpClient.Buffer(fileContentString);
    
    console.log(buffer);
    
    return "hashbrowns";
  }
}
