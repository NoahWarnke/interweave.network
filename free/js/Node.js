
/** Represents all the data we have on a given Node. */
export default class Node {
  
  constructor(key, type) {
    
    this.key = key;
    this.type = type;
    
    // Blockchain data.
    this.bData = undefined;
    this.bStatus = "init";
    
    // IPFS data.
    this.iData = undefined;
    this.iStatus = "init";
  }
  
  setKey(key, keyType) {
    this.key = key;
    this.keyType = keyType;
  }
  
  setBlockchainState(status, data, error) {
    this.bStatus = status;
    this.bData = data;
    this.bError = error;
  }
  
  setIPFSState(status, data, error) {
    this.iStatus = status;
    this.iData = data;
    this.iError = error;
  }
}
