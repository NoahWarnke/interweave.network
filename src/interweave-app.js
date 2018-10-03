window.addEventListener('load', startup);

async function startup() {
  
  // Set up our Vue app.
  let app = new Vue({
    el: '#interweave-app',
    data: {
      doneStartup: false,
      web3Available: false,
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
  
  // Get provider set up.
  myWeb3Handler.setUpProvider();
  
  // Set app values from web3handler.
  app.web3Available = !myWeb3Handler.web3InterfaceUnavailable();
  if (app.web3Available) {
    app.network = await myWeb3Handler.getNetwork();
    app.account = myWeb3Handler.getDefaultAccount();
  }
  app.accountAvailable = (app.account !== undefined);
  
  // Set status and get message.
  if (!app.web3Available) {
    app.status = "Please install MetaMask and sign in";
  }
  else if (!app.accountAvailable) {
    app.status = "Please sign into MetaMask";
  }
  else {
    app.status = "Connected to " + app.network + "!";
    app.value = await myWeb3Handler.testContractGetValue(app.account);
  }
  app.doneStartup = true;
}
