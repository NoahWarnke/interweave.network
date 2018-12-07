
/** Represents all the data we have on a given Node. */
export default class Node {
  
  /**
   * Constructor for a new Node item with the given key and type.
   * Sets other properties to initial values.
   * @param key The new Node's key string.
   * @param type The new Node's type string (either 'deployed' or 'draft').
   */
  constructor(key, type) {
    
    this._key = key;
    this._type = type;
    
    // Blockchain data.
    this._bData = undefined;
    this._bStatus = "init";
    
    // IPFS data (the content).
    this._iData = undefined;
    this._iStatus = "init";
    
    // Universal IPFS data.
    this._name = "";
    this._format = undefined;
    this._formatVersion = undefined;
  }
  
  /**
   * @returns This Node's key.
   */
  get key() {
    return this._key;
  }
  
  /**
   * @returns This Node's type (either 'deployed' or 'draft')
   */
  get type() {
    return this._type;
  }
  
  /**
   * @returns This Node's blockchain data object.
   */
  get bData() {
    return this._bData;
  }
  
  /**
   * @returns This Node's blockchain data status: 'init', 'pending', 'failed', or 'successful'.
   */
  get bStatus() {
    return this._bStatus;
  }
  
  /**
   * @returns This Node's blockchain error message, or undefined if none.
   */
  get bError() {
    return this._bError;
  }
  
  /**
   * @returns This Node's IPFS data object.
   */
  get iData() {
    return this._iData;
  }
  
  /**
   * @returns This Node's IPFS data status: 'init', 'pending', 'failed', or 'successful'.
   */
  get iStatus() {
    return this._iStatus;
  }
  
  /**
   * @returns This Node's IPFS error message, or undefined if none.
   */
  get iError() {
    return this._iError;
  }
  
  /**
   * Set this Node's key and type.
   * @param key The Node's new key.
   * @param type The Node's new type, 'deployed' or 'draft'
   */
  setKey(key, type) {
    this._key = key;
    this._type = type;
  }
  
  /**
   * Set this Node's blockchain state.
   * @param status The Node's new blockchain status, 'init', 'pending', 'failed', or 'successful'
   * @param data The Node's new blockchain data, or undefined if none.
   * @param error The Node's new blockchain error message, or undefined if none.
   */
  setBlockchainState(status, data, error) {
    this._bStatus = status;
    this._bData = data;
    this._bError = error;
  }
  
  /**
   * Set this Node's IPFS state.
   * @param status The Node's new IPFS status, 'init', 'pending', 'failed', or 'successful'
   * @param data The Node's new IPFS data, or undefined if none.
   * @param error The Node's new IPFS error message, or undefined if none.
   */
  setIPFSState(status, data, error) {
    this._iStatus = status;
    this._iData = data;
    this._iError = error;
  }
  
  /**
   * Set this Node's name.
   * @param name The Node's new name string.
   */
  set name(name) {
    if (typeof name !== "string" || name.length < 1 || name.length > 32) {
      //throw new Error("Node name must be a non-empty string with <= 32 characters.");
      return;
    }
    this._name = name;
  }
  
  /**
   * @returns This Node's name.
   */
  get name() {
    return this._name;
  }
  
  /**
   * Set this Node's format.
   * @param format The Node's new format string.
   */
  set format(format) {
    if (typeof format !== "string" || format.length === 0) {
      throw new Error("Node format must be a non-empty string.");
    }
    
    this._format = format;
  }
  
  /**
   * @returns this Node's format.
   */
  get format() {
    return this._format;
  }
  
  /**
   * Set this Node's format version.
   * @param formatVersion The Node's new format version integer.
   */
  set formatVersion(formatVersion) {
    if (formatVersion !== parseInt(formatVersion)) {
      throw new Error("Node format version must be an integer.");
    }
    this._formatVersion = formatVersion;
  }
  
  /**
   * @returns This Node's format version.
   */
  get formatVersion() {
    return this._formatVersion;
  }
  
  isOwnedBy(addr) {
    return (this._bData !== undefined && this._bData.ownerAddr.toLowerCase() === addr.toLowerCase());
  }
}
