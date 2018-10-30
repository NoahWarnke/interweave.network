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
      statusCol: "good",
      status: 0,
      statusDescription: "",
      modalOpen: false,
      modalContent: "",
      currentNodeEdges: [{num: 0}, {num: 1}, {num: 2}, {num: 3}, {num: 4}, {num: 5}]
    },
    methods: {
      updateState: function() {
        this.updateStatus();
      },
      updateStatus: function() {
        if (this.browserType === "nondapp") {
          this.statusCol = "warn";
          this.status = 1;
          this.statusDescription = "No MetaMask detected; dapp connected to " + this.network + " via Infura in view-only mode.";
        }
        else if (!this.accountAvailable) {
          if (!this.accountAccessEnabled && !this.accountAccessRejected) {
            this.statusCol = "warn";
            this.status = 2;
            this.statusDescription = "Please accept the connect request for this dapp in MetaMask.";
          }
          else if (this.accountAccessRejected) {
            this.statusCol = "error";
            this.status = 3;
            this.statusDescription = "You rejected the connect request for this dapp in MetaMask. Please accept it.";
          }
          else if (!this.contractReady) {
            this.statusCol = "error";
            this.status = 4;
            this.statusDescription = "Not signed in to MetaMask; dapp connected to " + app.network + " in view-only mode, but no contract available on this network.";
          }
          else {
            this.statusCol = "warn";
            this.status = 5;
            this.statusDescription = "Not signed in to MetaMask; dapp connected to " + app.network + " in view-only mode.";
          }
        }
        else if (!this.contractReady) {
          this.statusCol = "error";
          this.status = 6;
          this.statusDescription = "Connected to " + app.network + " but no contract available on this network.";
        }
        else {
          this.statusCol = "good";
          this.status = 7;
          this.statusDescription = "Connected to " + this.network + "!";
        }
      },
      statusBuildClick: function() {
        if (this.status !== 7) {
          this.modalOpen = true;
          this.modalContent = this.statusDescription;
        }
      }
    }
  });
  
  // Save on window for testing.
  window.interweaveApp = app;
  
  // Instantiate Web3Handler.
  window.myWeb3Handler = new Web3Handler();
  
  // Register to listen for web3 state changes.
  myWeb3Handler.registerListener("browserTypeChanged", (oldVal, newVal) => {app.browserType = newVal; app.updateState();});
  myWeb3Handler.registerListener("networkChanged", (oldVal, newVal) => {app.network = newVal; app.updateState();});
  myWeb3Handler.registerListener("loggedInStatusChanged", (oldVal, newVal) => {app.loggedIn = newVal; app.updateState();});
  myWeb3Handler.registerListener("accessEnabledChanged", (oldVal, newVal) => {app.accountAccessEnabled = newVal; app.updateState();});
  myWeb3Handler.registerListener("accessRejectedChanged", (oldVal, newVal) => {app.accountAccessRejected = newVal; app.updateState();});
  myWeb3Handler.registerListener("accessEnabledChanged", (oldVal, newVal) => {app.accountAccessEnabled = newVal; app.updateState();});
  
  myWeb3Handler.registerListener("accountChanged", (oldVal, newVal) => {
    app.account = newVal;
    app.accountAvailable = (newVal === undefined ? false : true);
    app.updateState();
  });
  
  // Initialize the Web3Handler, checking for web3 state and then watching for changes.
  await myWeb3Handler.initialize();
  
  // Instantiate InterweaveFreeHandler.
  app.InterweaveFreeHandler = new InterweaveFreeHandler();
  
  // Attempt to initialize the InterweaveFreeHandler. If not available on the current network, will throw an error.
  try {
    await app.InterweaveFreeHandler.initialize(myWeb3Handler);
    app.contractReady = true;
  }
  catch (error) {
    console.log(error);
  }
}
