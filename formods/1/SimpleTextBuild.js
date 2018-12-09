
import SimpleTextUtils from './SimpleTextUtils.js';

export default {
  template: `
    <div id="simple-text-build">
      <h2>Set up your SimpleText Node</h2>
      
      <div>
        <button v-on:click="setView('description')">Description</button>
        <button v-on:click="setView('edges')">Edges</button>
        <button v-on:click="setView('bindings')">Bindings</button>
      </div>
      
      <div v-if="view === 'description'">
        <p>Enter a short description for the Node. Explorers will see it when they first arrive.</p>
        <textarea v-model="content.shortDesc"></textarea>
      </div>
      
      <div v-if="view === 'edges'">
        <p>Edit the incoming/outgoing text for edges, and add or remove them.</p>
        <select v-model="slot" class="tag" v-bind:class="slot !== undefined ? 'edge-tag' : 'no-tag'">
          <option disabled value="undefined" class="no-tag">Select edge slot</option>
          <option
            class="edge-tag"
            v-bind:class="content.edges[slot] !== undefined ? 'existing' : ''"
            v-for="slot of slots"
            v-bind:value="slot">
            edge{{slot}}
          </option>
        </select>
        
        <button v-if="slot !== undefined && canDeleteEdge(slot)" v-on:click="deleteEdge(slot)">Delete edge</button>
        <button v-if="slot !== undefined && content.edges[slot] === undefined" v-on:click="addEdge(slot)">Add edge</button>
        
        <div v-if="slot !== undefined && content.edges[slot] !== undefined">
          <p>Description of what happens on the half of the connection entering the Node:</p>
          <textarea v-model="content.edges[slot].enterDesc"></textarea>
          <p>Description of what happens on the half of the connection leaving the Node:</p>
          <textarea v-model="content.edges[slot].leaveDesc"></textarea>
        </div>
          
        <div v-if="slot !== undefined && content.edges[slot] === undefined">
          <p>This slot doesn't have an edge right now.</p>
        </div>
      </div>
      
      <div v-if="view === 'bindings'">
      
        <p>Create or edit verb-target-result bindings.</p>
        
        <p>
        
          <select v-model="verbKey" class="tag verb-tag">
            <option disabled value="undefined" class="no-tag">(Select verb)</option>
            <option
              v-bind:class="numVerbBindings(vKey) > 0 ? 'existing' : ''"
              v-for="(binding, vKey) of verbs"
              v-bind:value="vKey">
              {{verbNameFromKey(vKey) + " (" + numVerbBindings(vKey) + ")"}}
            </option>
          </select>
          
          <select v-model="targetSetKey" v-if="verbKey !== undefined" class="tag target-tag">
            <option v-bind:value="undefined">(Select target)</option>
            <option
              v-bind:class="verbTargetHasBinding(tKey) ? 'existing' : ''"
              v-for="(targetSet, tKey) of content.targets"
              v-bind:value="tKey">
              {{targetNameFromKey(tKey)}}
            </option>
          </select>
          
          <input
            class="tag target-tag"
            placeholder="Add a new target"
            v-if="verbKey !== undefined && targetSetKey === undefined"
            v-model="newTarget"
            v-on:keypress.stop.prevent.enter="addTargetSet"
            v-on:keypress.esc="addTargetSet">
          </input>
          
          <select
            v-model="resultKey"
            v-if="targetSetKey !== undefined"
            class="tag"
            v-bind:class="resultTagClass(content.results[resultKey])">
            <option v-bind:value="undefined" class="result-tag">(Select result)</option>
            <option
              v-for="(result, rKey) of content.results"
              v-bind:value="rKey"
              v-bind:class="resultTagClass(result)">
              {{shorten(result)}}
            </option>
          </select>
          
        </p>
        
        <p v-if="targetSetKey !== undefined">
        
          <!-- For adding a new result's first character (will create a new result when you do). -->
          <textarea
            v-bind:class="resultTagClass(newResult) + ' ' + resultInvalidClass()"
            placeholder="Add a new result"
            v-model="newResult"
            v-on:keypress.stop.prevent.enter>
          </textarea>
          
        </p>
        
        <p v-if="verbKey !== undefined">
          <span>Synonyms for this verb (not editable): </span>
          <span class="tag verb-tag" v-for="(verb, index) of verbsFromKey(verbKey)">{{verb}}</span>
        </p>
        
        <p v-if="targetSetKey !== undefined">
          <span>Synonyms for this target (click to delete): </span>
          <span
            class="tag target-tag"
            v-for="(target, index) of targetsFromKey(targetSetKey)"
            v-on:click="removeTargetFromSet(index)"
            v-html="target !== '' ? target : '&nbsp;'">
          </span>
          <input
            class="tag target-tag"
            placeholder="Add a synonym"
            v-model="newTarget"
            v-on:keypress.stop.prevent.enter="addTargetToSet"
            v-on:keypress.esc="addTargetToSet"></input>
        </p>
        
      </div>
      
    </div>
  `,
  props: {
    content: Object
  },
  data: function() {
    return {
      verbs: SimpleTextUtils.verbs,
      verbKey: undefined,
      targetSetKey: undefined,
      newTarget: "",
      resultKey: undefined,
      newResult: "",
      leaveNewResult: false, // To disambiguate between when user selects an undefined resultKey and when they type an invalid result and it gets set undefined.
      view: "description",
      slot: undefined,
      slots: [0, 1, 2, 3, 4, 5]
    }
  },
  computed: {
    newResultInvalid: function() {
      if (this.newResult === undefined || this.newResult === "") {
        console.log("result undefined or empty, so forbidden...");
        return true;
      }
      if (this.newResult.indexOf("edge") === 0 && this.newResult.length === 5) {
        let num = parseInt(this.newResult.substr(4, 5));
        if (num >= 0 && num < 6 && this.content.edges[num] === undefined) {
          return true;
        }
      }
      for (let resultKey of Object.keys(this.content.results)) {
        if (resultKey != this.resultKey && this.content.results[resultKey] === this.newResult) {
          console.log(resultKey + " versus " + this.resultKey);
          console.log("result is different result, so forbidden.");
          return true;
        }
      }
      console.log("result passes...");
      return false;
    }
  },
  methods: {
    setView: function(newView) {
      this.view = newView;
      this.restartBindingProcess();
      this.slot = undefined;
    },
    addEdge: function() {
      if (this.slot === undefined || this.content.edges[this.slot] !== undefined) {
        return;
      }
      this.$set(this.content.edges, this.slot, {
        enterDesc: "You arrive.",
        leaveDesc: "You leave."
      });
    },
    /**
     * Check if you can delete the given edge.
     * You can't if it isn't already set, or if it's used as any result.
     */
    canDeleteEdge: function(slot) {
      if (this.content.edges[slot] === undefined) {
        return false;
      }
      for (let resultKey in Object.keys(this.content.results)) {
        if (this.content.results[resultKey] == "edge" + slot) {
          return false;
        }
      }
      return true;
    },
    deleteEdge: function() {
      // Make sure it's deleteable.
      if (this.slot === undefined || !this.canDeleteEdge(this.slot)) {
        return;
      }

      this.$delete(this.content.edges, this.slot);
    },
    verbsFromKey: function(verbKey) {
      return SimpleTextUtils.verbs[verbKey];
    },
    verbNameFromKey: function(verbKey) {
      return this.verbsFromKey(verbKey)[0];
    },
    numVerbBindings: function(verbKey) {
      if (this.content.bindings[verbKey] === undefined) {
        return 0;
      }
      return Object.keys(this.content.bindings[verbKey]).length;
    },
    targetNameFromKey: function(targetKey) {
      return this.targetsFromKey(targetKey)[0];
    },
    targetsFromKey: function(targetKey) {
      return this.content.targets[targetKey];
    },
    targetExists: function(target) {
      for (let targetSetKey of Object.keys(this.content.targets)) {
        if (this.content.targets[targetSetKey].includes(target)) {
          return true;
        }
      }
      return false;
    },
    addTargetSet: function() {
      if (this.newTarget === "") {
        return;
      }
      if (this.targetExists(this.newTarget)) {
        return;
      }
      let newTargetSetKey = Object.keys(this.content.targets).length;
      let newTargetSet = [
        this.newTarget.toLowerCase().trim()
      ];
      
      this.$set(this.content.targets, newTargetSetKey, newTargetSet);
      this.newTarget = "";
      this.targetSetKey = newTargetSetKey; // Also select it.
    },
    addTargetToSet: function() {
      if (this.newTarget.trim() === "" || this.targetSetKey === undefined) {
        return;
      }
      if (this.targetExists(this.newTarget)) {
        return;
      }
      this.content.targets[this.targetSetKey].push(this.newTarget.toLowerCase().trim());
      this.newTarget = "";
    },
    removeTargetFromSet: function(index) {
      if (this.targetSetKey === undefined || this.content.targets[this.targetSetKey][index] === undefined) {
        return;
      }
      
      // Check if we deleted the last one, and remove the whole set if so.
      this.content.targets[this.targetSetKey].splice(index, 1);
      if (this.content.targets[this.targetSetKey].length === 0) {
        
        // Delete the current binding before doing anything.
        if (this.resultKey !== undefined) {
          this.deleteAllBindingsWithTargetSetKey(this.targetSetKey);
          this.deleteAllUnusedResults();
          this.resultKey = undefined;
        }
        
        delete this.content.targets[this.targetSetKey];
        this.targetSetKey = undefined;
      }
    },
    deleteAllUnusedResults: function() {
      let resultKeysUsed = Object
        .keys(this.content.results)
        .reduce(
          (acc, el) => {
            acc[el] = false;
            return acc;
          },
          {}
        )
      ;
      for (let verbKey of Object.keys(this.content.bindings)) {
        for (let targetSetKey of Object.keys(this.content.bindings[verbKey])) {
          resultKeysUsed[this.content.bindings[verbKey][targetSetKey]] = true;
        }
      }
      for (let resultKey of Object.keys(resultKeysUsed)) {
        if (!resultKeysUsed[resultKey]) {
          delete this.content.results[resultKey];
        }
      }
    },
    verbTargetHasBinding: function(targetKey) {
      if (this.verbKey === undefined) {
        return false;
      }
      if (this.content.bindings[this.verbKey] === undefined) {
        return false;
      }
      return (this.content.bindings[this.verbKey][targetKey] !== undefined);
    },
    restartBindingProcess: function() {
      this.verbKey = undefined;
      this.targetSetKey = undefined;
      this.resultKey = undefined;
    },
    saveBinding: function() {
      if (this.verbKey === undefined || this.targetSetKey === undefined || this.resultKey === undefined) {
        return;
      }
      
      // Create/set the new binding.
      if (this.content.bindings[this.verbKey] === undefined) {
        this.content.bindings[this.verbKey] = {};
      }
      this.content.bindings[this.verbKey][this.targetSetKey] = this.resultKey;
    },
    deleteBinding: function() {
      this.deleteSpecificBinding(this.verbKey, this.targetSetKey, this.resultKey);
      
      // Note, this leaves verbKey, targetSetKey, and resultKey untouched. Call restartBindingProcess if you want to clean those up.
    },
    deleteSpecificBinding: function(verbKey, targetSetKey, resultKey) {
      if (verbKey === undefined || targetSetKey === undefined || resultKey === undefined) {
        return;
      }
      
      // If binding was never set, we're done.
      if (this.content.bindings[verbKey] === undefined || this.content.bindings[verbKey][targetSetKey] === undefined) {
        return;
      }
      
      // TODO decide what to do with orphaned results and target sets.
      
      // Delete the actual binding.
      delete this.content.bindings[verbKey][targetSetKey];
      
      // Clean up the verb binding entirely if it has no targets.
      if (Object.keys(this.content.bindings[verbKey]).length === 0) {
        delete this.content.bindings[verbKey];
      }
    },
    deleteAllBindingsWithTargetSetKey(targetSetKeyToUnbind) {
      let verbKeys = Object.keys(this.content.bindings);
      for (let verbKey of verbKeys) {
        let targetSetKeys = Object.keys(this.content.bindings[verbKey]);
        for (let targetSetKey of targetSetKeys) {
          if (targetSetKey == targetSetKeyToUnbind) {
            this.deleteSpecificBinding(verbKey, targetSetKey, this.content.bindings[verbKey][targetSetKey]);
          }
        }
      }
    },
    deleteAllBindingsWithResultKey(resultKeyToUnbind) {
      let verbKeys = Object.keys(this.content.bindings);
      for (let verbKey of verbKeys) {
        let targetSetKeys = Object.keys(this.content.bindings[verbKey]);
        for (let targetSetKey of targetSetKeys) {
          let resultKey = this.content.bindings[verbKey][targetSetKey];
          if (resultKey == resultKeyToUnbind) {
            this.deleteSpecificBinding(verbKey, targetSetKey, resultKey);
          }
        }
      }
    },
    shorten: function(result) {
      return (result.length < 32
        ? result
        : result.substr(0, 32) + "..."
      );
    },
    resultTagClass: function(result) {
      if (result !== undefined && result.indexOf("edge") === 0 && result.length === 5) {
        let num = parseInt(result.substr(4, 5));
        if (num >= 0 && num < 6) {
          return "edge-tag";
        }
      }
      return "result-tag";
    },
    resultInvalidClass: function() {
      return (this.newResult !== "" && this.newResultInvalid)
        ? "invalid-result"
        : ""
      ;
    }
  },
  watch: {
    verbKey: function(val, oldVal) {
      // Changed verbKey, so reset targetSetKey and resultKey to undefined.
      this.targetSetKey = undefined;
      this.resultKey = undefined;
    },
    targetSetKey: function(val, oldVal) {
      // Set the resultKey to whatever the binding is, if there is one, or undefined otherwise.
      if ( this.verbKey !== undefined
        && this.targetSetKey !== undefined
        && this.content.bindings[this.verbKey] !== undefined
        && this.content.bindings[this.verbKey][this.targetSetKey] !== undefined
      ) {
        this.resultKey = this.content.bindings[this.verbKey][this.targetSetKey];
        this.newResult = this.content.results[this.resultKey];
      }
      else {
        this.resultKey = undefined;
        this.newResult = "";
      }
    },
    newResult: function(newResult, oldNewResult) {
      console.log("newResult changed...");
      if (this.newResultInvalid) {
        console.log("newResult forbidden.");
        if (this.resultKey !== undefined) {
          console.log("Setting resultKey undefined.");
          // We went from valid result to invalid.
          
          // If newResult being empty is the cause of the invalidity, delete all bindings using the result, and then any unused results (the result).
          if (newResult === "") {
            this.deleteAllBindingsWithResultKey(this.resultKey);
            this.deleteAllUnusedResults();
          }
          
          // Set leaveNewResult to true because we don't want newResult to get set to "" in the resultKey watcher.
          this.leaveNewResult = true;
          
          this.resultKey = undefined;
          
          // Note, the resultKey watcher will now delete the current binding, and the result too if it was not used elsewhere.
        }
      }
      else {
        console.log("newResult valid.");
        if (this.resultKey === undefined) {
          console.log("New result needed.");
          let existingResultKey = undefined;
          for (let resultKeyToCheck of Object.keys(this.content.results)) {
            if (this.content.results[resultKeyToCheck] === newResult) {
              existingResultKey = resultKeyToCheck;
            }
          }
          if (existingResultKey !== undefined) {
            // Went from invalid result to a valid, existing one, so start using the existing one.
            this.resultKey = existingResultKey;
            console.log("(existing result found)");
          }
          else {
            console.log("(creating new result)");
            // New valid result, so create it, and then use it.
            this.resultKey = Object.keys(this.content.results).length;
            while (this.content.results[this.resultKey] !== undefined) {
              this.resultKey--; // If our new resultKey is already in use, decrement until we find the 'hole' left where another one must have been deleted.
            }
            this.$set(this.content.results, this.resultKey, newResult);
          }
          
          // Note, the resultKey watcher will call saveBinding.
        }
        else {
          // An updated valid result value, so just update the current result.
          console.log("Updating existing result.");
          this.content.results[this.resultKey] = newResult;
        }
      }
    },
    /**
     * Watch resultKey for changes.
     * Usually this will be the user selecting a result in the bindings results dropdown.
     * Sometimes it will be the user entering an invalid result (nonexistant edge or duplicate result),
     * and the resultKey getting set to undefined or defined in the newResult watcher.
     */
    resultKey: function(resultKey, oldResultKey) {
      
      // Get rid of the old binding if there was a previous result key.
      if (oldResultKey !== undefined) {
        if (this.verbKey !== undefined && this.targetSetKey !== undefined) {
          this.deleteSpecificBinding(this.verbKey, this.targetSetKey, oldResultKey);
          this.deleteAllUnusedResults();
        }
      }
      
      // Update newResult (and possibly make a new binding).
      if (resultKey !== undefined) {
        
        // This is sometimes redundant, but that's fine.
        this.newResult = this.content.results[resultKey];
        
        // We have a new result selected, so save the new binding.
        // Should never be able to change resultKey if verbKey and targetSetKey are not set, but if they aren't, saveBinding does nothing.
        this.saveBinding();
      }
      else {
        // If the user selected resultKey to be undefined (the "(select result)" option), empty newResult.
        // If resultKey is undefined because newResult is an invalid value (and hence leaveNewResult is true), don't do anything.
        if (this.leaveNewResult) {
          this.leaveNewResult = false;
        }
        else {
          this.newResult = "";
        }
      }
    }
  }
}
