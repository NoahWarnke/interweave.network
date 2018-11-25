
/**
 * NodeData represents the common pieces of data that an Interweave Node's IPFS file must contain, regardless of format. */
export default class NodeData {
  
  constructor(data) {
    
    // format
    if (typeof data.format !== "string" || data.format.length === 0) {
      throw new Error("NodeData must have a non-empty format string.");
    }
    this._format = data.format;
    
    // version
    if (data.formatVersion !== parseInt(data.formatVersion)) {
      throw new Error("NodeData format version must be an integer.");
    }
    this._formatVersion = data.formatVersion;
    
    // name
    if (typeof data.name !== "string" || data.name.length < 1 || data.name.length > 32) {
      throw new Error("NodeData must contain a name property (the not-necessarily-unique name of the Node) that is a non-empty string with <= 32 characters.");
    }
    this._name = data.name;
    
    this._content = {};
  }
  
  get format() {
    return this._format;
  }
  
  set format(newFormat) {
    this._format = newFormat;
    this._content = {};
  }
  
  get formatVersion() {
    return this._formatVersion;
  }
  
  set formatVersion(newFormatVersion) {
    this._formatVersion = newFormatVersion;
  }
  
  get name() {
    return this._name;
  }
  
  set name(newName) {
    if (newName.length > 32) {
      throw new Error("Cannot set a name with more than 32 characters.");
    }
    
    this._name = newName;
  }
  
  get content() {
    return this._content;
  }
  
  set content(newContent) {
    this._content = newContent;
  }
}
