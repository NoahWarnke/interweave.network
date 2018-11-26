
/** Represents all the data we have on a given Node. */
export default class Node {
  
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
    this._formatVersion = 1;
  }
  
  get key() {
    return this._key;
  }
  
  get type() {
    return this._type;
  }
  
  get bData() {
    return this._bData;
  }
  
  get bStatus() {
    return this._bStatus;
  }
  
  get bError() {
    return this._bError;
  }
  
  get iData() {
    return this._iData;
  }
  
  get iStatus() {
    return this._iStatus;
  }
  
  get iError() {
    return this._iError;
  }
  
  setKey(key, keyType) {
    this._key = key;
    this._type = type;
  }
  
  setBlockchainState(status, data, error) {
    this._bStatus = status;
    this._bData = data;
    this._bError = error;
  }
  
  setIPFSState(status, data, error) {
    this._iStatus = status;
    this._iData = data;
    this._iError = error;
  }
  
  set name(name) {
    if (typeof name !== "string" || name.length < 1 || name.length > 32) {
      //throw new Error("Node name must be a non-empty string with <= 32 characters.");
      return;
    }
    this._name = name;
  }
  
  get name() {
    return this._name;
  }
  
  set format(format) {
    if (typeof format !== "string" || format.length === 0) {
      throw new Error("Node format must be a non-empty string.");
    }
    
    this._format = format;
  }
  
  get format() {
    return this._format;
  }
  
  set formatVersion(formatVersion) {
    if (formatVersion !== parseInt(formatVersion)) {
      throw new Error("Node format version must be an integer.");
    }
    this._formatVersion = formatVersion;
  }
  
  get formatVersion() {
    return this._formatVersion;
  }
}
