window.addEventListener('load', () => {
  
  // Instantiate my handler.
  let myWeb3Handler = new Web3Handler();
  
  // Get provider set up.
  myWeb3Handler.setUpProvider();
  
  // Set up our Vue app.
  let app = new Vue({
    el: '#interweave-app',
    data: {
      doneStartup: true,
      web3Available: !myWeb3Handler.web3InterfaceUnavailable(),
      status: myWeb3Handler.web3InterfaceUnavailable() ? "Please install MetaMask and sign in" : "Connected to " + myWeb3Handler.getNetwork() + "!",
      account: myWeb3Handler.getDefaultAccount(),
      value: myWeb3Handler.testContractGetValue(),
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
  
});
