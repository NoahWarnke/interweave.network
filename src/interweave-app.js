window.addEventListener('load', startup);

async function startup() {
  
  // Set up our Vue app.
  let app = new Vue({
    el: '#interweave-app',
    data: {
      doneStartup: false,
      web3Available: false,
      accountAccessEnabled: false,
      accountAvailable: false,
      account: undefined,
      value: undefined,
      status: "Loading...",
      formInput: "type here"
    },
    methods: {
      callSet: function() {
        try {
          myWeb3Handler.testContractSetValue(this.account, this.formInput);
        }
        catch (e) {
          console.log("Error calling setLink: " + e);
        }
      }
    }
  });
  
  // Save on window for testing.
  window.interweaveApp = app;
  
  // Instantiate my handler.
  let myWeb3Handler = new Web3Handler();
  
  // Set app values from web3handler.
  app.web3Available = !myWeb3Handler.web3InterfaceUnavailable();
  if (app.web3Available) {
    app.network = await myWeb3Handler.getNetwork();
    app.account = await myWeb3Handler.getDefaultAccount();
    app.accountAccessEnabled = myWeb3Handler.accountAccessGranted(); // Check after a getDefaultAccount call, where it will be requested if needed.
  }
  app.accountAvailable = (app.account !== false);
  
  // Set status and get message.
  if (!app.web3Available) {
    app.status = "Please install MetaMask to use ths dapp.";
  }
  else if (!app.accountAvailable) {
    if (!app.accountAccessEnabled) {
      app.status = "Please accept the connect request for this dapp in MetaMask.";
    }
    else {
      app.status = "Please sign into MetaMask to use this dapp.";
    }
  }
  else {
    app.status = "Connected to " + app.network + "!";
    app.value = await myWeb3Handler.testContractGetValue(app.account);
    console.log(app.value);
  }
  app.doneStartup = true;
}
