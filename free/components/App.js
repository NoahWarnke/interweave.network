// Blockchain integration
import Web3Handler from '../js/Web3Handler.js';
import InterweaveFreeHandler from '../js/InterweaveFreeHandler.js';

// IPFS integration
import IpfsHandler from "../js/IpfsHandler.js";

// General
import Utils from '../js/Utils.js';
import Node from '../js/Node.js';

// Viewer modules
import TheNavbar from './TheNavbar.js';
import ExploreArea from './ExploreArea.js';
import BuildArea from './BuildArea.js';
import ListNodes from './ListNodes.js';
import ModalInfo from './ModalInfo.js';

// Format modules
import SimpleText from '../../formods/1/SimpleText.js';

/**
 * The App Vue module. Represents the Interweave Free frontend browser application.
 */
export default {
  name: 'App',
  template: `
    <div id="app">
      <the-navbar
        v-bind:currentNodeKey="currentNodeKey"
        v-bind:nodes="nodes"
        v-bind:showBuildTools="showBuildTools"
        v-bind:currentView="currentView"
        v-bind:account="account"
        v-on:viewNodeClick="viewNodeClick($event)"
        v-on:editNodeClick="editNodeClick($event)"
        v-on:myNodesClick="myNodesClick()"
        v-on:myEdgeProposalsClick="myEdgeProposalsClick()"
        v-on:buildClick="buildClick()"
        v-on:edgeClick="edgeStart($event); edgeBoundary();">
      </the-navbar>
      <explore-area
        v-bind:currentNodeKey="currentNodeKey"
        v-bind:previousNodeKey="previousNodeKey"
        v-bind:nextNodeKey="nextNodeKey"
        v-bind:nodes="nodes"
        v-bind:formats="formats"
        v-on:edgeStart="edgeStart($event)"
        v-on:edgeBoundary="edgeBoundary()"
        v-show="currentView === 'explore'">
      </explore-area>
      <build-area
        v-bind:ipfsHandler="ipfsHandler"
        v-bind:ipfsNodePresent="ipfsNodePresent"
        v-bind:ipfsNodeError="ipfsNodeError"
        v-bind:formats="formats"
        v-bind:currentNodeKey="currentNodeKey"
        v-bind:nodes="nodes"
        v-bind:account="account"
        v-if="currentView === 'editnode'">
      </build-area>
      <list-nodes
        v-if="currentView === 'mynodes'"
        v-bind:currentNodeKey="currentNodeKey"
        v-bind:myNodeKeys="myNodeKeys"
        v-bind:nodes="nodes"
        v-bind:account="account"
        v-on:pagedToTheseNodeKeys="updateNodes($event)"
        v-on:myNodesViewClick="myNodesViewClick($event)"
        v-on:editNodeClick="editNodeClick($event)"
        v-on:deleteNodeClick="deleteNodeClick($event)"
        v-on:addNodeClick="addNodeClick()">
      </list-nodes>
      <modal-info v-if="false"></modal-info>
    </div>
  `,
  components: {
    TheNavbar,
    ExploreArea,
    BuildArea,
    ListNodes,
    ModalInfo,
    Node
  },
  data: function() {
    return {
      // Blockchain stuff
      web3Handler: undefined,
      contract: undefined,
      accountPending: false, // Requested account access, don't have it yet.
      account: undefined,
      
      // IPFS stuff
      ipfsHandler: undefined,
      ipfsNodePresent: false,
      ipfsNodeError: undefined,
      
      // Formods
      formats: {
        "simpletext": new SimpleText()
      },
      defaultFormat: "simpletext",
      
      // Navigation
      initialNodeKey: "4802423149786398712975601635277375780486398097217997509586637249159306333648",
      currentNodeKey: undefined,
      previousNodeKey: undefined,
      nextNodeKey: undefined, // For when an edge transition is in progress.
      
      // Nodes
      myDeployedNodeKeys: [],
      myDraftNodeKeys: [],
      nodes: {},
      
      // Deployed edge (proposals)
      myEdgeProposalKeys: [],
      myDraftEdgeProposalKeys: [],
      edgeProposals: {},
      
      // Build-related DApp state
      showBuildTools: false,
      currentView: "explore"
    }
  },
  computed: {
    myNodeKeys: function() {
      return this.myDeployedNodeKeys.concat(this.myDraftNodeKeys);
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
        // Get our Web3Handler set up.
        this.web3Handler = new Web3Handler();
        await this.web3Handler.initialize();
        
        // Need to know when we get ethereum account info from the web3Handler.
        this.web3Handler.registerListener("accountChanged", (oldAccount, newAccount) => {
          this.account = newAccount;
          
          if (newAccount !== undefined && this.accountPending) {
            this.accountPending = false;
            this.showBuildTools = true;
          }
          this.$forceUpdate(); // external event.
        });
        
        // Get our Interweave Free contract handler set up.
        this.contract = new InterweaveFreeHandler();
        await this.contract.initialize(this.web3Handler);
        
        // Get our IPFS handler set up.
        this.ipfsHandler = new IpfsHandler();
        this.ipfsHandler.initialize(); // No need to await.
        
        // We care about whether there's a node present.
        this.ipfsHandler.registerListener("nodePresentChanged", (oldNodePresent, newNodePresent) => {
          this.ipfsNodePresent = newNodePresent;
          this.$forceUpdate();
        });
        this.ipfsHandler.registerListener("nodeErrorChanged", (oldNodeError, newNodeError) => {
          console.log(typeof newNodeError);
          this.ipfsNodeError = newNodeError;
          this.$forceUpdate();
        });
        
        // For console access.
        window.web3Handler = this.web3Handler;
        window.interweaveContract = this.contract;
        window.ipfsHandler = this.ipfsHandler;
        
        // Grab starting node data.
        await this.setCurrentNode(this.initialNodeKey);
      }
      catch (error) {
        console.log("App init: " + error);
      }
    },
    initializeNode: function(nodeKey, type, force) {
      
      // If not forcing, don't overwrite existing Node.
      if (!force && this.nodes[nodeKey] !== undefined) {
        return;
      }
      
      this.$set(this.nodes, nodeKey, new Node(nodeKey, type));
    },
    /**
     * Update the nodes object to contain the latest blockchain data for the given Node key.
     * @param nodeKey The key of the Node to update.
     * @param force Whether to force-update, even if it's already loaded.
     */
    updateNodeBlockchain: async function(nodeKey, force) {
      let node = this.nodes[nodeKey];
      
      if (node === undefined) {
        return;
      }
      
      // If not forcing, don't overwrite existing blockchain data.
      if (!force && node.bStatus !== "init") {
        return;
      }
      
      // Pending...
      node.setBlockchainState("pending", undefined, undefined);
      this.$set(this.nodes, nodeKey, node); // Let child components know it changed.
      
      let blockchainData = undefined;
      try {
        blockchainData = await this.contract.getNode(nodeKey);
        
        // TEMP
        if (blockchainData.ipfs === "QmWSEucjdTRcCbrx4FLTuNEAv6XrJrUVTzY1Lh9bFCoUfV") {
          blockchainData.ipfs = "QmTTfMB5ZVZnJ9k76c8oTrwVBG4zvtD2WYw2HNGtMonKq5";
        }
        if (blockchainData.ipfs === "QmbFwA929KA1waxL95uQ5VQGJc4MtQUPVzLnLHrg2WF8Ei") {
          blockchainData.ipfs = "QmVNLqAe4F6bqSZiXQafsmDxpRQkFnULyFkEE8kCMXdwaV";
        }
        
        node.setBlockchainState("successful", blockchainData, undefined);
      }
      catch (error) {
        console.log("App updateNodeBlockchain: load failed: " + error);
        
        node.setBlockchainState("failed", undefined, "Node blockchain load failed: " + error);
      }
      this.$set(this.nodes, nodeKey, node); // Reactively detect object property change.
    },
    /**
     * Update the ipfsData object to contain the latest IPFS data for the given Node key.
     * @param nodeKey The key of the Node to update.
     * @param force Whether to force-update, even if it's already loaded.
     */
    updateNodeIpfs: async function(nodeKey, force) {
      
      let node = this.nodes[nodeKey];
      
      // Make sure we've loaded the Node's blockchain data first.
      if (node === undefined || node.bStatus !== "successful") {
        return;
      }
      
      // If not forcing, don't overwrite existing IPFS data.
      if (!force && node.iStatus !== "init") {
        return;
      }
      
      node.setIPFSState("pending", undefined, undefined);
      this.$set(this.nodes, nodeKey, node);
      
      // Load IFPS JSON data from the Node's ipfs hash.
      let parsedNodeIpfsJson = undefined;
      try {
        parsedNodeIpfsJson = JSON.parse(await this.ipfsHandler.getFile(node.bData.ipfs));
      }
      catch (error) {
        console.log("App updateNodeIpfs: ipfs data load failed: " + error);
        
        node.setIPFSState("failed", undefined, "Node IPFS load failed: " + error);
        this.$set(this.nodes, nodeKey, node);
        return;
      }
      
      try {
        node.name = parsedNodeIpfsJson.name;
        node.format = parsedNodeIpfsJson.format;
        node.formatVersion = parsedNodeIpfsJson.formatVersion;
        let content = this.formats[node.format].validateAndImportContent(
          node.formatVersion,
          parsedNodeIpfsJson.content
        );
        node.setIPFSState("successful", content, undefined);
        this.$set(this.nodes, nodeKey, node);
      }
      catch (error) {
        console.log("App updateNodeIpfs: ipfs data import failed: " + error);
        node.setIPFSState("failed", undefined, "Node IPFS import failed: " + error);
        this.$set(this.nodes, nodeKey, node);
        return;
      }
    },
    /**
     * Update the Node blockchain and ipfs data for the given Node key.
    * @param nodeKey The key of the Node to update.
    * @param force Whether to force-update if it's already loaded.
    */
    updateNode: async function(nodeKey, force) {
      // Don't update draft Nodes.
      if (this.nodes[nodeKey] !== undefined && this.nodes[nodeKey].type === "draft") {
        return;
      }
      
            this.initializeNode      (nodeKey, "deployed", force);
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
      
      // Update previous and current nodeKey values.
      if (this.currentNodeKey !== undefined) {
        this.previousNodeKey = this.currentNodeKey;
      }
      this.currentNodeKey = nodeKey;
      
      // Initialize the Node if needed (if it doesn't already exist, it's a deployed Node we're referencing here.)
      let node = this.nodes[nodeKey];
      if (node === undefined) {
        this.initializeNode(nodeKey, "deployed", false);
        node = this.nodes[nodeKey];
      }
      
      // If it's a draft Node, nothing else needs to be done.
      if (node.type === "draft") {
        return;
      }
      
      // Load blockchain data first (rather than just doing updateNode) so we can start updating the edge Nodes as needed.
      await this.updateNodeBlockchain(nodeKey, false);
      if (node.bStatus !== "successful") {
        return;
      }
      
      // Now get the current Node's ipfs data, and also simultaneously load all its edge Nodes, so we can be ready for edge transitions.
      let promises = [];
      promises.push(this.updateNodeIpfs(nodeKey, false));
      
      let adjacentNodeKeys = node.bData.edgeNodeKeys
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
    updateMyDeployedNodeKeys: async function() {
      try {
        this.myDeployedNodeKeys = await this.contract.getNodesBelongingTo(this.web3Handler.account);
      }
      catch (error) {
        this.myDeployedNodeKeys = [];
        console.log("App updateMyDeployedNodeKeys: " + error);
      }
    },
    /**
     * Begin a standard transition between Nodes.
     * @param event An Object containing a slot value, indicating which Node edge to follow.
     */
    edgeStart: function(event) {
      
      // Make sure current Node's blockchain data has loaded.
      let currentNode = this.nodes[this.currentNodeKey];
      if (currentNode === undefined || currentNode.bStatus !== "successful") {
        console.log("App edgeStart: current Node not loaded, so cannot transition away from it.");
        return;
      }
      
      // Make sure the Node's outgoing slot has been set to another Node key.
      let edgeNodeKey = currentNode.bData.edgeNodeKeys[event.slot];
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
          await this.updateMyDeployedNodeKeys();
        }
      }
    },
    /**
     * When a Node in the My Nodes list has its 'view' button clicked.
     * @param nodeKey The key of the Node clicked.
     */
    myNodesViewClick: function(nodeKey) {
      
      if (this.currentNodeKey !== nodeKey) {
        this.setCurrentNode(nodeKey);
        this.previousNodeKey = undefined;
        this.nextNodeKey = undefined;
      }

      this.currentView = "explore";
    },
    viewNodeClick: function(nodeKey) {
      
      if (this.currentNodeKey !== nodeKey) {
        this.setCurrentNode(nodeKey);
        this.previousNodeKey = undefined;
        this.nextNodeKey = undefined;
      }
      this.currentView = "explore";
    },
    /**
     * When a Node (in the My Nodes list or directly) has its 'edit' button clicked.
     * @param nodeKey The key of the Node clicked.
     */
    editNodeClick: function(nodeKey) {
      
      if (this.currentNodeKey !== nodeKey) {
        this.setCurrentNode(nodeKey);
        this.previousNodeKey = undefined;
        this.nextNodeKey = undefined;
      }
      
      this.currentView = "editnode";
    },
    myEdgeProposalsClick: async function() {
      // TODO
    },
    addNodeClick: async function() {
      
      // Create a new draft Node, without any content yet.
      let draftNodeKey = "draft" + (Math.random() * 10E16);
      this.myDraftNodeKeys.push(draftNodeKey);
      this.initializeNode(draftNodeKey, "draft");
      let newNode = this.nodes[draftNodeKey];

      // Set up fake blockchain data for the draft Node..
      let fakeBlockchain = {
        key: this.currentNodeKey,
        ownerAddr: this.account,
        ipfs: undefined,
        edgeNodeKeys: ["0", "0", "0", "0", "0", "0"]
      };
      newNode.setBlockchainState("successful", fakeBlockchain, undefined);
      
      // Set up its general IPFS data.
      let defaultFormod = this.formats[this.defaultFormat];
      newNode.name = "New Node";
      newNode.format = this.defaultFormat;
      newNode.formatVersion = defaultFormod.latestVersion();
      
      // Now set up its format-specific IPFS data (using default values for that formod).
      let content = defaultFormod.validateAndImportContent(
        defaultFormod.latestVersion(),
        defaultFormod.defaultData()
      );
      newNode.setIPFSState("successful", content, undefined);
    },
    deleteNodeClick: async function(nodeKey) {
      console.log("Deleting " + nodeKey);
      let node = this.nodes[nodeKey];
      if (node === undefined) {
        return;
      }
      if (node.type === "deployed") {
        if (
          node.bStatus === "successful"
          && node.bData.edgeNodeKeys.reduce((accumulator, val) => accumulator && val === "0", true)
          && this.account !== undefined
        ) {
          console.log("Deployed and deletable.");
          this.contract.deleteNode(nodeKey, this.account);
        }
        else {
          console.log("Deployed but not deletable.");
        }
      }
      else if (node.type === "draft") {
        if (node.bStatus === "successful" && node.bData.edgeNodeKeys.reduce((accumulator, val) => accumulator && val === "0", true)) {
          console.log("Draft and deletable.");
          if (this.currentNodeKey === nodeKey) {
            this.setCurrentNode(this.initialNodeKey);
            this.previousNodeKey = undefined;
          }
          // Remove from myNodeKeys
          this.myDraftNodeKeys.splice(this.myDraftNodeKeys.indexOf(nodeKey), 1);
          // Delete the entry in nodes
          this.$set(this.nodes, nodeKey, undefined);
        }
        else {
          console.log("Draft but not deletable.");
        }
      }
    }
  },
  created: function() {
    this.init();
  }
};
