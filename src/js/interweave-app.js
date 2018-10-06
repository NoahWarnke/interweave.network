window.addEventListener('load', startup);

async function startup() {
  
  // Set up our Vue app.
  let app = new Vue({
    el: '#interweave-app',
    data: {
      browserType: undefined,
      accountAccessEnabled: false,
      accountAccessRejected: false,
      loggedIn: false,
      accountAvailable: false,
      contractReady: false,
      account: undefined,
      enteredAccount: "0xa1b6d4d311a9da00d32738824e8c67b2001b3cd5", // A starting account.
      value: undefined,
      formInput: "type here",
      statusCol: "good"
    },
    methods: {
      callSet: function() {
        try {
          app.myStoreLinkContractHandler.setLink(this.account, this.formInput);
        }
        catch (e) {
          console.log("Error calling setLink: " + e);
        }
      },
      callGet: async function() {
        if (!this.contractReady) {
          return;
        }
        if (this.browserType === "nondapp" || !this.loggedIn) {
          console.log("callGet nodapp: " + this.enteredAccount);
          this.value = await this.myStoreLinkContractHandler.getLink(this.enteredAccount);
        }
        else if (this.loggedIn) {
          this.value = await this.myStoreLinkContractHandler.getLink(this.account);
        }
        else {
          // Not logged in, but not a non-dapp browser, so do nothing.
        }
      },
      status: function() {
        if (this.browserType === "nondapp") {
          this.statusCol = "warn";
          return "No MetaMask detected; dapp connected to Ropsten via Infura in view-only mode.";
        }
        if (!this.accountAvailable) {
          if (!this.accountAccessEnabled && !this.accountAccessRejected) {
            this.statusCol = "warn";
            return "Please accept the connect request for this dapp in MetaMask.";
          }
          if (this.accountAccessRejected) {
            this.statusCol = "error";
            return "You rejected the connect request for this dapp in MetaMask. Please accept it.";
          }
          if (!this.contractReady) {
            this.statusCol = "error";
            return "Not signed in to MetaMask; dapp connected to " + app.network + " in view-only mode, but no contract available on this network. Try Ropsten.";
          }
          this.statusCol = "warn";
          return "Not signed in to MetaMask; dapp connected to " + app.network + " in view-only mode.";
          
        }
        else if (!this.contractReady) {
          this.statusCol = "error";
          return "Connected to " + app.network + " but no contract available on this network. Try Ropsten.";
        }
        this.statusCol = "good";
        return "Connected to " + this.network + "!";
      }
    }
  });
  
  // Save on window for testing.
  window.interweaveApp = app;
  
  // Instantiate Web3Handler.
  window.myWeb3Handler = new Web3Handler();
  
  // Register to listen for web3 state changes.
  myWeb3Handler.registerListener("browserTypeChanged", (oldVal, newVal) => {app.browserType = newVal; app.$forceUpdate();});
  myWeb3Handler.registerListener("networkChanged", (oldVal, newVal) => {app.network = newVal; app.$forceUpdate();});
  myWeb3Handler.registerListener("loggedInStatusChanged", (oldVal, newVal) => {app.loggedIn = newVal; app.$forceUpdate();});
  myWeb3Handler.registerListener("accessEnabledChanged", (oldVal, newVal) => {app.accountAccessEnabled = newVal; app.$forceUpdate();});
  myWeb3Handler.registerListener("accessRejectedChanged", (oldVal, newVal) => {app.accountAccessRejected = newVal; app.$forceUpdate();});
  myWeb3Handler.registerListener("accessEnabledChanged", (oldVal, newVal) => {app.accountAccessEnabled = newVal; app.$forceUpdate();});
  
  myWeb3Handler.registerListener("accountChanged", (oldVal, newVal) => {
    app.account = newVal;
    app.accountAvailable = (newVal === undefined ? false : true);
    app.callGet();
    app.$forceUpdate();
  });
  
  // Initialize the Web3Handler, checking for web3 state and then watching for changes.
  await myWeb3Handler.initialize();
  
  // Instantiate StoreLinkContractHandler.
  app.myStoreLinkContractHandler = new StoreLinkContractHandler();
  
  // Attempt to initialize the ContractHandler. If not available on the current network, will throw an error.
  try {
    await app.myStoreLinkContractHandler.initialize(myWeb3Handler);
    console.log("Contract ready.");
    app.contractReady = true;
    await app.callGet(); // Get value for the default account.
  }
  catch (error) {
    console.log(error);
  }
}
