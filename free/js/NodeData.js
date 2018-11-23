
/**
 * NodeData represents the common pieces of data that an Interweave Node's IPFS file must contain, regardless of format. */
export default class NodeData {
  
  constructor(format, formatVersion) {
    this._format = format;
    this._formatVersion = formatVersion;
    this._name = "New Node";
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
