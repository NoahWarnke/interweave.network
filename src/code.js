/** A class that handles interaction with web3. */
class Web3Handler {
  
  /** Constructor. */
  constructor() {
    this.provider = undefined;
    this.localWeb3 = undefined;
  }
  
  web3Interface() {
    return window.web3;
  }
  
  web3InterfaceUnavailable() {
    return (typeof this.web3Interface() === 'undefined');
  }
  
  web3Library() {
    return window.Web3;
  }
  
  web3LibraryUnavailable() {
    return (typeof this.web3Library() === 'undefined');
  }
  
  async setUpProvider() {
    console.log("Window loaded...");
    
    // Check for library.
    if (this.web3LibraryUnavailable()) {
      console.log("Web3.js library missing...");
      document.querySelector('#status').innerHTML = "No Web3 library.";
      return;
    }
    else {
      console.log("Web3.js library available.");
    }
    
    // Check for interface.
    if (this.web3InterfaceUnavailable()) {
      console.log("No injected web3 interface. Get MetaMask?");
      document.querySelector('#status').innerHTML = "No injected web3.";
      return;
    }
    else {
      console.log("web3 interface was injected. Using it to create a new Web3 instance.");
      
      this.provider = this.web3Interface().currentProvider;
      this.localWeb3 = new (this.web3Library())(this.provider);
      document.querySelector('#status').innerHTML = "Ready.";
    }
    
    // Do stuff when ready.
    
    let network = await this.getNetwork();
    console.log("Network: " + network);
    document.querySelector('#network').innerHTML = network;
    
    let account = this.getDefaultAccount();
    console.log("Account: " + account);
    document.querySelector('#account').innerHTML = account;
    
    let value = await this.testContractGetValue(account);
    document.querySelector('#value').innerHTML = value;
  }
  
  getDefaultAccount() {
    if (this.web3InterfaceUnavailable()) {
      console.log("No injected web3 interface, cannot get default account.")
      return;
    }
    return this.web3Interface().eth.defaultAccount;
  }
  
  getNetwork() {
    if (this.web3InterfaceUnavailable()) {
      console.log("No injected web3 interface, cannot get current network.")
      return;
    }
    return new Promise((resolve, reject) => {
      this.web3Interface().version.getNetwork((err, netId) => {
        if (err) {
          reject(err);
        }
        else {
          let networks = ["Unknown", "Mainnet", "Morden", "Ropsten", "Rinkeby", "Kovan"];
          resolve(
            netId < networks.length
              ? networks[netId]
              : "Unknown"
          );
        }
      });
    });
  }
  
  testContractGetValue(ethAddress) {
    if (this.web3LibraryUnavailable() || this.web3InterfaceUnavailable()) {
      console.log("Dapp not ready, cannot try calling a contract.");
      return;
    }
    
    var contractABI = storelinkABI;
    var contractAddress = "0xb3ac9b8ef39b5fef2e68d16444e72c5878e48514";
    var tokenContract = new this.localWeb3.eth.Contract(contractABI, contractAddress);
    var methods = tokenContract.methods;
    
    return methods.getLink(ethAddress).call();
  }
  
  testContractSetValue(newValue) {
    if (newValue.length > 32) {
      console.log("Too long.");
      return;
    }
    
    if (this.web3LibraryUnavailable() || this.web3InterfaceUnavailable()) {
      console.log("Dapp not ready, cannot try calling a contract.");
      return;
    }
    
    var contractABI = storelinkABI;
    var contractAddress = "0xb3ac9b8ef39b5fef2e68d16444e72c5878e48514";
    var tokenContract = new this.localWeb3.eth.Contract(contractABI, contractAddress);
    var methods = tokenContract.methods;
    
    return methods.setLink(newValue).call();
  }
}


// Instantiate my handler.
let myWeb3Handler = new Web3Handler();

// Listen for the window to load, and then set up the web3 provider.
window.addEventListener('load', () => {
  myWeb3Handler.setUpProvider();
  document.querySelector("#submit-new").addEventListener('click', () => {
    let value = document.querySelector('#new-value').value;
    myWeb3Handler.testContractSetValue(value);
  });
});
