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
      statusCol: "good",
      setTxHash: undefined,
      setConfirmations: -1,
      setError: undefined,
      transactionInProgress: false,
      events: undefined,
      eventsWindowOpen: false
    },
    methods: {
      callSet: function() {
        if (app.setTxHash !== undefined && app.setConfirmations < 1 && app.setError === undefined) {
          return; // Can't call set while a previous transaction is waiting. If it's confirmed or errored, then it's fine.
        }
        app.closeTxWindow(); // The submission form is hidden if a transaction is already open, but just in case.
        app.transactionInProgress = true;
        try {
          app.mySetHashContractHandler.setHash(this.account, this.formInput)
            .on("transactionHash", (hash) => {
              if (!app.transactionInProgress) {
                return;
              }
              app.setTxHash = hash;
              app.$forceUpdate();
            })
            .on("confirmation", (number, receipt) => {
              if (!app.transactionInProgress) {
                return;
              }
              app.setConfirmations = number;
              app.callGet();
              app.$forceUpdate();
            })
            .on("error", (err, receipt) => {
              if (!app.transactionInProgress) {
                return;
              }
              console.log(err);
              app.setError = err;
            })
          ;
        }
        catch (error) {
          console.log(error);
        }
      },
      closeTxWindow: function() {
        app.setTxHash = undefined;
        app.setConfirmations = -1;
        app.setError = undefined;
        app.transactionInProgress = false;
      },
      callGet: async function() {
        if (!this.contractReady) {
          return;
        }
        if (this.browserType === "nondapp" || !this.loggedIn) {
          console.log("callGet nodapp: " + this.enteredAccount);
          try {
            this.value = await this.mySetHashContractHandler.getHash(this.enteredAccount);
          }
          catch (error) {
            console.log("Error calling getHash: " + e);
          }
        }
        else if (this.loggedIn) {
          this.value = await this.mySetHashContractHandler.getHash(this.account);
        }
        else {
          // Not logged in, but not a non-dapp browser, so do nothing.
        }
      },
      status: function() {
        if (this.browserType === "nondapp") {
          this.statusCol = "warn";
          return "No MetaMask detected; dapp connected to Rinkeby via Infura in view-only mode.";
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
            return "Not signed in to MetaMask; dapp connected to " + app.network + " in view-only mode, but no contract available on this network. Try Rinkeby.";
          }
          this.statusCol = "warn";
          return "Not signed in to MetaMask; dapp connected to " + app.network + " in view-only mode.";
          
        }
        else if (!this.contractReady) {
          this.statusCol = "error";
          return "Connected to " + app.network + " but no contract available on this network. Try Rinkeby.";
        }
        this.statusCol = "good";
        return "Connected to " + this.network + "!";
      },
      getEvents: async function() {
        if (!this.contractReady) {
          return;
        }
        this.events = await this.mySetHashContractHandler.getHashChangedEvents(this.loggedIn ? this.account : this.enteredAccount);
        this.eventsWindowOpen = true;
      },
      closeEventsWindow: function() {
        this.eventsWindowOpen = false;
        this.events = undefined;
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
    if (oldVal !== newVal) {
      app.closeTxWindow();
    }
    app.closeEventsWindow();
    app.account = newVal;
    app.accountAvailable = (newVal === undefined ? false : true);
    app.callGet();
    app.$forceUpdate();
  });
  
  // Initialize the Web3Handler, checking for web3 state and then watching for changes.
  await myWeb3Handler.initialize();
  
  // Instantiate SetHashContractHandler.
  app.mySetHashContractHandler = new SetHashContractHandler();
  
  // Attempt to initialize the ContractHandler. If not available on the current network, will throw an error.
  try {
    await app.mySetHashContractHandler.initialize(myWeb3Handler);
    console.log("Contract ready.");
    app.contractReady = true;
    await app.callGet(); // Get value for the default account.
  }
  catch (error) {
    console.log(error);
  }
}
