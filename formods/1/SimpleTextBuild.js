
import SimpleTextUtils from './SimpleTextUtils.js';

export default {
  template: `
    <div id="simple-text-build">
      <h1>Set up your new SimpleText Node!</h1>
      
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
        
        <button v-if="slot !== undefined && content.edges[slot] !== undefined" v-on:click="deleteEdge(slot)">Delete edge</button>
        <button v-if="slot !== undefined && content.edges[slot] === undefined" v-on:click="addEdge(slot)">Add edge</button>
        
        <div v-if="slot !== undefined && content.edges[slot] !== undefined">
          <p>Description of what happens on the half of the connection entering the Node:</p>
          <textarea v-model="content.edges[slot].enterDesc"></textarea>
          <p>Description of what happens on the half of the connection leaving the Node:</p>
          <textarea v-model="content.edges[slot].leaveDesc"></textarea>
        </div>
          
        <div v-if="content.edges[slot] === undefined">
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
            v-bind:class="resultClass(content.results[resultKey])">
            <option v-bind:value="undefined" class="result-tag">(Select result)</option>
            <option
              v-for="(result, rKey) of content.results"
              v-bind:value="rKey"
              v-bind:class="resultClass(result)">
              {{shorten(result)}}
            </option>
          </select>
          
        </p>
        
        <p v-if="targetSetKey !== undefined">
        
          <!-- For adding a new result's first character (will create a new result when you do). -->
          <textarea
            v-if="resultKey === undefined"
            v-bind:class="resultClass(newResult)"
            placeholder="Add a new result"
            v-model="newResult"
            v-on:keypress.stop.prevent.enter>
          </textarea>
          
          <!-- For editing an existing result. -->
          <textarea
            ref="existingresulttextarea"
            v-if="resultKey !== undefined"
            v-bind:class="resultClass(content.results[resultKey])"
            v-model="content.results[resultKey]"
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
      view: "description",
      slot: undefined,
      slots: [0, 1, 2, 3, 4, 5],
      oldEditingResult: undefined
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
    deleteEdge: function() {
      if (this.slot === undefined || this.content.edges[this.slot] === undefined) {
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
          // TODO delete all newly-unused results.
          this.resultKey = undefined;
        }
        
        delete this.content.targets[this.targetSetKey];
        this.targetSetKey = undefined;
      }
    },
    addResult: async function() {
      if (this.newResult === "") {
        return;
      }
      let newResultKey = Object.keys(this.content.results).length;
      // TODO verify it's unique
      this.$set(this.content.results, newResultKey, this.newResult);
      this.newResult = "";
      this.resultKey = newResultKey; // Also select it.
      
      this.saveBinding(); // Also save it.
      
      await Vue.nextTick();
      this.$refs.existingresulttextarea.focus();
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
    resultClass: function(result) {
      if (result !== undefined && result.indexOf("edge") === 0 && result.length === 5) {
        let num = parseInt(result.substr(4, 5));
        if (num >= 0 && num < 6) {
          return 'edge-tag';
        }
      }
      return 'result-tag';
    },
    isForbiddenEdge: function(str) {
      if (str !== undefined && str.indexOf("edge") === 0 && str.length === 5) {
        let num = parseInt(str.substr(4, 5));
        if (num >= 0 && num < 6) {
          if (this.content.edges[num] === undefined) {
            return true;
          }
        }
      }
      return false;
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
      this.resultKey = undefined;
      if ( this.verbKey !== undefined
        && this.targetSetKey !== undefined
        && this.content.bindings[this.verbKey] !== undefined
      ) {
        this.resultKey = this.content.bindings[this.verbKey][this.targetSetKey];
      }
    },
    newResult: function(newResult, oldNewResult) {
      // Add results immediately.
      if (newResult !== undefined && newResult !== "") {
        this.addResult();
      }
    },
    resultKey: function(resultKey, oldResultKey) {
      if (resultKey !== undefined) {
        // Save result as old result in case it gets edited to an invalid state.
        this.oldEditingResult = this.content.results[resultKey];
        
        // Update the binding (the function will not do anything if a binding can't be saved.)
        this.saveBinding();
      }
      else if (oldResultKey !== undefined) {
        // Unbind if you set a result key back to undefined.
        if (this.verbKey !== undefined && this.targetSetKey !== undefined) {
          this.deleteSpecificBinding(this.verbKey, this.targetSetKey, oldResultKey);
        }
      }
    },
    content: {
      immediate: true,
      deep: true,
      handler: function(content, oldContent) {
        if (this.resultKey !== undefined) {
          
          // Prevent forbidden inputs ('edge0', for example, when there is no edge 0).
          if (this.isForbiddenEdge(content.results[this.resultKey])) {
            content.results[this.resultKey] = this.oldEditingResult; // Note, we have 'oldEditingResult' because there's no way to know the old result value.
          }
          else {
            this.oldEditingResult = content.results[this.resultKey];
          }
          
          // Also, notice if the result went empty and delete the result/binding if so.
          if (content.results[this.resultKey] === "") {
            delete content.results[this.resultKey];
            this.deleteAllBindingsWithResultKey(this.resultKey);
            
            // Unset the result key, but leave verbKey and targetSetKey behind.
            this.resultKey = undefined;
          }
        }
      }
    }
  }
}
