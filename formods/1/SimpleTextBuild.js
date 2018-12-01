
import SimpleTextUtils from './SimpleTextUtils.js';

export default {
  template: `
    <div id="simple-text-build">
      
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
            v-for="slot of slots"
            v-bind:value="slot">
            edge{{slot + (content.edges[slot] === undefined ? '' : ' (existing)')}}
          </option>
        </select>
        
        <div v-if="slot !== undefined">
          <div v-if="content.edges[slot] !== undefined">
            <button v-on:click="deleteEdge(slot)">Delete edge</button>
            <p>Description of what happens on the half of the connection entering the Node:</p>
            <textarea v-model="content.edges[slot].enterDesc"></textarea>
            <p>Description of what happens on the half of the connection leaving the Node:</p>
            <textarea v-model="content.edges[slot].leaveDesc"></textarea>
          </div>
          
          <div v-if="content.edges[slot] === undefined">
            <p>This slot doesn't have an edge right now.</p>
            <button v-on:click="addEdge(slot)">Add edge</button>
          </div>
        </div>
      </div>
      
      <div v-if="view === 'bindings'">
      
        <p>Create or edit a verb-target-result binding:</p>
        
        <p>
        
          <select v-model="verbKey" class="tag verb-tag">
            <option disabled value="undefined" class="no-tag">Select verb</option>
            <option
              v-for="(binding, vKey) of verbs"
              v-bind:value="vKey">
              {{verbNameFromKey(vKey) + " (" + numVerbBindings(vKey) + ")"}}
            </option>
          </select>
          
          <select v-model="targetSetKey" v-if="verbKey !== undefined" class="tag target-tag">
            <option v-bind:value="undefined">Select target</option>
            <option
              v-for="(targetSet, tKey) of content.targets"
              v-bind:value="tKey">
              {{targetNameFromKey(tKey) + (verbTargetHasBinding(tKey) ? ' (existing)' : '')}}
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
            <option v-bind:value="undefined">Select result</option>
            <option
              v-for="(result, rKey) of content.results"
              v-bind:value="rKey"
              v-bind:class="resultClass(result)">
              {{shorten(result)}}
            </option>
          </select>
          
        </p>
        
        <p v-if="targetSetKey !== undefined">
        
          <!-- For adding a new result. -->
          <textarea
            v-if="resultKey === undefined"
            class="tag"
            v-bind:class="resultClass(newResult)"
            placeholder="Add a new result"
            v-model="newResult"
            v-on:keypress.stop.prevent.enter="addResult"
            v-on:keypress.esc="addResult">
          </textarea>
          
          <!-- For editing an existing result. -->
          <textarea
            v-if="resultKey !== undefined"
            class="tag"
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
            v-on:click="removeTargetFromSet(index)">
            {{target}}
          </span>
          <input
            class="tag target-tag"
            placeholder="Add a synonym"
            v-model="newTarget"
            v-on:keypress.stop.prevent.enter="addTargetToSet"
            v-on:keypress.esc="addTargetToSet"></input>
        </p>
          
        <p v-if="resultKey !== undefined">
          <button v-if="showSave()" v-on:click="saveBinding">Save new binding</button>
          <button v-if="showUpdate()" v-on:click="saveBinding">Update binding</button>
          <button v-if="showDelete()" v-on:click="deleteBinding">Delete binding</button>
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
      slots: [0, 1, 2, 3, 4, 5]
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
    addTargetSet: function() {
      if (this.newTarget === "") {
        return;
      }
      let newTargetSetKey = Object.keys(this.content.targets).length;
      let newTargetSet = [
        this.newTarget.toLowerCase().trim()
      ];
      // TODO verify it's unique
      this.$set(this.content.targets, newTargetSetKey, newTargetSet);
      this.newTarget = "";
      this.targetSetKey = newTargetSetKey; // Also select it.
    },
    addTargetToSet: function() {
      if (this.newTarget === "" || this.targetSetKey === undefined) {
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
        delete this.content.targets[this.targetSetKey];
        this.targetSetKey = undefined;
      }
    },
    addResult: function() {
      if (this.newResult === "") {
        return;
      }
      let newResultKey = Object.keys(this.content.results).length;
      // TODO verify it's unique
      this.$set(this.content.results, newResultKey, this.newResult);
      this.newResult = "";
      this.resultKey = newResultKey; // Also select it.
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
    getCurrentBindingResult: function() {
      if (this.verbKey === undefined || this.targetSetKey === undefined || this.resultKey === undefined) {
        return undefined;
      }
      if (this.content.bindings[this.verbKey] === undefined) {
        return undefined;
      }
      return this.content.bindings[this.verbKey][this.targetSetKey];
    },
    fullBindingIsSet: function() {
      return this.getCurrentBindingResult() !== undefined;
    },
    showSave: function() {
      return !this.fullBindingIsSet();
    },
    showUpdate: function() {
      return this.fullBindingIsSet() && this.getCurrentBindingResult() !== this.resultKey;
    },
    showDelete: function() {
      return this.fullBindingIsSet() && this.getCurrentBindingResult() === this.resultKey; // Can't delete a binding if a different change is proposed.
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
      
      this.restartBindingProcess();
    },
    deleteBinding: function() {
      if (this.verbKey === undefined || this.targetSetKey === undefined || this.resultKey === undefined) {
        return;
      }
      
      // If binding was never set, we're done.
      if (this.content.bindings[this.verbKey] === undefined || this.content.bindings[this.verbKey][this.targetSetKey] === undefined) {
        return;
      }
      
      // TODO decide what to do with orphaned results and target sets.
      
      // Delete the actual binding.
      delete this.content.bindings[this.verbKey][this.targetSetKey];
      
      // Clean up the verb binding entirely if it has no targets.
      if (Object.keys(this.content.bindings[this.verbKey]).length === 0) {
        delete this.content.bindings[this.verbKey];
      }
      
      // Clean up.
      this.restartBindingProcess();
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
    }
  }
}
