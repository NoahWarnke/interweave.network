window.addEventListener('load', startup);

async function startup() {
  
  // Set up our Vue app.
  let app = new Vue({
    el: '#interweave-app',
    data: {
      doneStartup: false,
      web3Available: false,
      status: "Loading...",
      account: "",
      value: "",
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
  
  window.interweaveApp = app;
  
  // Instantiate my handler.
  let myWeb3Handler = new Web3Handler();
  
  // Get provider set up.
  await myWeb3Handler.setUpProvider();
  
  // Set app values from web3handler.
  app.web3Available = !myWeb3Handler.web3InterfaceUnavailable();
  app.doneStartup = true;
  app.network = await myWeb3Handler.getNetwork();
  app.account = myWeb3Handler.getDefaultAccount();
  
  if (!app.web3Available) {
    app.status = "Please install MetaMask and sign in";
  }
  else if (app.account === undefined) {
    app.status = "Please sign into MetaMask";
  }
  else {
    app.status = "Connected to " + app.network + "!";
    app.value = await myWeb3Handler.testContractGetValue(app.account);
  }
}
