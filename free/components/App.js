// Blockchain integration
import Web3Handler from '../js/Web3Handler.js';
import InterweaveFreeHandler from '../js/InterweaveFreeHandler.js';
import Utils from '../js/Utils.js';

// Viewer modules
import TheNavbar from './TheNavbar.js';
import TheRenderArea from './TheRenderArea.js';
import ListNodes from './ListNodes.js';
import ModalInfo from './ModalInfo.js';

// Format modules
import SimpleText from '../../formods/1/SimpleText.js';


export default {
  name: 'App',
  template: `
    <div id="app">
      <the-navbar
        v-bind:currentNodeKey="currentNodeKey"
        v-bind:nodes="nodes"
        v-bind:ipfsData="ipfsData"
        v-bind:showBuildTools="showBuildTools"
        v-bind:currentView="currentView"
        v-bind:account="account"
        v-on:buildClick="buildClick()"
        v-on:myNodesClick="myNodesClick()"
        v-on:myEdgeProposalsClick="myEdgeProposalsClick()"
        v-on:addNodeClick="addNodeClick()"
        v-on:deleteNodeClick="deleteNodeClick()"
        v-on:edgeClick="edgeStart($event); edgeBoundary();">
      </the-navbar>
      <the-render-area
        v-bind:currentNodeKey="currentNodeKey"
        v-bind:previousNodeKey="previousNodeKey"
        v-bind:nextNodeKey="nextNodeKey"
        v-bind:nodes="nodes"
        v-bind:ipfsData="ipfsData"
        v-bind:formats="formats"
        v-on:edgeStart="edgeStart($event)"
        v-on:edgeBoundary="edgeBoundary()"
        v-show="currentView === 'explore'">
      </the-render-area>
      <list-nodes
        v-if="currentView === 'mynodes'"
        v-bind:myNodeKeys="myNodeKeys"
        v-bind:nodes="nodes"
        v-bind:ipfsData="ipfsData"
        v-on:pagedToTheseNodeKeys="updateNodes($event)"
        v-on:myNodesNodeClick="myNodesNodeClick($event)">
      </list-nodes>
      <modal-info v-if="false"></modal-info>
    </div>
  `,
  components: {
    TheNavbar,
    TheRenderArea,
    ListNodes,
    ModalInfo
  },
  data: function() {
    return {
      web3Handler: undefined,
      contract: undefined,
      accountPending: false, // Requested account access, don't have it yet.
      account: undefined,
      formats: {
        1: new SimpleText()
      },
      currentNodeKey: undefined,
      previousNodeKey: undefined,
      nextNodeKey: undefined, // For when an edge transition is in progress.
      myNodeKeys: [],
      myEdgeProposalKeys: [],
      nodes: {},
      ipfsData: {},
      edgeProposals: {},
      showBuildTools: false,
      currentView: "explore"
    }
  },
  methods: {
    /**
     * Initialize the App!
     * This involves setting up the web3 handler and contract handler objects,
     * and then setting our starting Node.
     */
    init: async function() {
      try {
        this.web3Handler = new Web3Handler();
        window.web3Handler = this.web3Handler; // For console access.
        await this.web3Handler.initialize();
        
        this.web3Handler.registerListener("accountChanged", (oldAccount, newAccount) => {
          this.account = newAccount;
          
          if (newAccount !== undefined && this.accountPending) {
            this.accountPending = false;
            this.showBuildTools = true;
          }
          this.$forceUpdate(); // external event.
        });
        
        this.contract = new InterweaveFreeHandler();
        window.contract = this.contract; // For console access.
        await this.contract.initialize(this.web3Handler);
        
        // For console access.
        window.web3Handler = this.web3Handler;
        window.interweave = this.contract;
        
        // Grab starting node data.
        await this.setCurrentNode("4802423149786398712975601635277375780486398097217997509586637249159306333648");
      }
      catch (error) {
        console.log("App init: " + error);
      }
    },
    /**
     * Update the nodes object to contain the latest blockchain data for the given Node key.
     * @param nodeKey The key of the Node to update.
     * @param force Whether to force-update, even if it's already loaded.
     */
    updateNodeBlockchain: async function(nodeKey, force) {
      
      // If not forcing, don't reload existing data.
      if (!force && this.nodes[nodeKey] !== undefined) {
        return;
      }
      
      let node = undefined;
      try {
        node = await this.contract.getNode(nodeKey);
        node.status = "successful";
      }
      catch (error) {
        console.log("App updateNodeBlockchain: load failed: " + error);
        node = {
          status: "failed",
          error: error
        }
      }
      this.$set(this.nodes, nodeKey, node); // Reactively detect object property change.
    },
    /**
     * Update the ipfsData object to contain the latest IPFS data for the given Node key.
     * @param nodeKey The key of the Node to update.
     * @param force Whether to force-update, even if it's already loaded.
     */
    updateNodeIpfs: async function(nodeKey, force) {
      
      // If not forcing, don't reload existing data.
      if (!force && this.ipfsData[nodeKey] !== undefined) {
        return;
      }
      
      let node = this.nodes[nodeKey];
      
      // Make sure we've loaded the Node's blockchain data first.
      if (node === undefined) {
        return;
      }
      
      // Load IFPS data from the Node's ipfs hash.
      let nodeIpfsData = undefined;
      try {
        let rawNodeIpfsData = await Utils.getAjax("https://ipfs.io/ipfs/" + node.ipfs, 30000);
        nodeIpfsData = JSON.parse(rawNodeIpfsData);
        nodeIpfsData.status = "successful";
      }
      catch (error) {
        console.log("App updateNodeIpfs: ipfs data load failed: " + error);
        nodeIpfsData = {
          status: "failed",
          error: error
        };
      }
      this.$set(this.ipfsData, nodeKey, nodeIpfsData);
    },
    /**
     * Update the Node blockchain and ipfs data for the given Node key.
    * @param nodeKey The key of the Node to update.
    * @param force Whether to force-update if it's already loaded.
    */
    updateNode: async function(nodeKey, force) {
      await this.updateNodeBlockchain(nodeKey, force);
      await this.updateNodeIpfs      (nodeKey, force);
    },
    /**
     * Load Node blockchain and ipfs data for a given set of Node keys.
     * @param nodeKeys An array containing a set of Node keys to load.
     * @param force Whether to force-update, even if a Node is already loaded.
     */
    updateNodes: async function(nodeKeys, force) {
      let promises = [];
      for (var keyKey in nodeKeys) {
        promises.push(this.updateNode(nodeKeys[keyKey]), force);
      }
      await Promise.all(promises);
    },
    /**
     * Set the current Node (the location of our intrepid explorer!) to the given Node key.
     * @param nodeKey The key of the Node to make be the current one.
     * @param force Whether to force-update, even if it's already loaded.
     */
    setCurrentNode: async function(nodeKey) {
      
      if (this.currentNodeKey !== undefined) {
        this.previousNodeKey = this.currentNodeKey;
      }
      this.currentNodeKey = nodeKey;
      
      // Load blockchain data first (rather than just doing updateNode) so we can start updating the edge Nodes as needed.
      await this.updateNodeBlockchain(nodeKey, false);
      if (this.nodes[nodeKey].status === "failed") {
        return;
      }
      
      // Now get the current Node's ipfs data, and also simultaneously load all its edge Nodes, so we can be ready for edge transitions.
      let promises = [];
      promises.push(this.updateNodeIpfs(nodeKey, false));
      
      let adjacentNodeKeys = this.nodes[nodeKey]
        .edgeNodeKeys
        .filter((key) => {
          return key != 0;
        })
      ;
      promises.push(this.updateNodes(adjacentNodeKeys, false));
      
      await Promise.all(promises);
    },
    /**
     * Get the latest list of all of the current account's Nodes.
     */
    updateMyNodeKeys: async function() {
      try {
        this.myNodeKeys = await this.contract.getNodesBelongingTo(this.web3Handler.account);
      }
      catch (error) {
        this.myNodeKeys = [];
        console.log("App updateMyNodeKeys: " + error);
      }
    },
    /**
     * Begin a standard transition between Nodes.
     * @param event An Object containing a slot value, indicating which Node edge to follow.
     */
    edgeStart: function(event) {
      
      // Make sure current Node's blockchain data has loaded.
      let currentNode = this.nodes[this.currentNodeKey];
      if (currentNode === undefined) {
        console.log("App edgeStart: current Node not loaded, so cannot transition away from it.");
        return;
      }
      
      // Make sure the Node's outgoing slot has been set to another Node key.
      let edgeNodeKey = currentNode.edgeNodeKeys[event.slot];
      if (edgeNodeKey == 0) {
        console.log("App edgeStart: Formod attempted to trigger an edge start, but the edge slot is not set for the current Node in the blockchain.");
        return;
      }

      this.nextNodeKey = edgeNodeKey;
    },
    /**
     * Do the actual transition between Nodes.
     */
    edgeBoundary: function() {
      if (this.nextNodeKey === undefined) {
        console.log("App edgeBoundary: attempted to cross an edge boundary, but edgeStart was never called!");
        return;
      }
      this.setCurrentNode(this.nextNodeKey);
      this.nextNodeKey = undefined;
    },
    /**
     * When the Connect MetaMask/Show Build Tools/Hide Build Tools button is clicked.
     */
    buildClick: function() {
      
      // Trigger web3Handler to try and log in, if not already logged in.
      if (!this.account) {
        this.accountPending = true;
        this.web3Handler.requestAccount();
        return;
      }
      
      this.showBuildTools = !this.showBuildTools;
      if (!this.showBuildTools) {
        this.currentView = "explore";
      }
      // TODO watch web3Handler for log-out events and turn off build mode
    },
    /**
     * When the My Nodes button is clicked.
     */
    myNodesClick: async function() {
      if (this.web3Handler.loggedIn) {
        if (this.currentView !== "mynodes") {
          this.currentView = "mynodes";
          await this.updateMyNodeKeys();
        }
        else {
          this.currentView = "explore";
          // TODO delete ipfs data for currently-paged nodes?
        }
      }
    },
    /**
     * When a Node in the My Nodes list is clicked.
     * @param nodeKey The key of the Node clicked.
     */
    myNodesNodeClick: async function(nodeKey) {
      this.setCurrentNode(nodeKey);
      this.previousNodeKey = undefined;
      this.nextNodeKey = undefined;
      this.currentView = "explore";
    },
    myEdgeProposalsClick: async function() {
      
    },
    addNodeClick: async function() {
      
    },
    deleteNodeClick: async function() {
      
    }
  },
  created: function() {
    this.init();
  }
};
