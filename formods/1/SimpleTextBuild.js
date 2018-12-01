
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
        <select v-model="slot">
          <option disabled value="undefined">Select edge slot</option>
          <option
            v-for="slot of slots"
            v-bind:value="slot">
            {{slot + (content.edges[slot] === undefined ? '' : ' (existing)')}}
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
        <select v-model="verbKey" class="tag verb-tag">
          <option disabled value="undefined">Select verb</option>
          <option
            v-for="(binding, vKey) of verbs"
            v-bind:value="vKey">
            {{verbNameFromKey(vKey) + "(" + numVerbBindings(vKey) + ")"}}
          </option>
        </select>
        <select v-model="targetSetKey" v-if="verbKey !== undefined" class="tag target-tag">
          <option disabled value="undefined">Select target</option>
          <option
            v-for="(targetSet, tKey) of content.targets"
            v-bind:value="tKey">
            {{targetNameFromKey(tKey) + (verbTargetHasBinding(tKey) ? ' (existing)' : '')}}
          </option>
        </select>
        <select v-model="resultKey" v-if="targetSetKey !== undefined" class="tag result-tag">
          <option disabled value="undefined">Select result</option>
          <option
            v-for="(result, rKey) of content.results"
            v-bind:value="rKey">
            {{shorten(result)}}
          </option>
        </select>
        
        
        <div v-if="verbKey !== undefined && targetSetKey === undefined">
          <p>Synonyms for this verb: </p>
          <span class="tag verb-tag" v-for="(verb, index) of verbsFromKey(verbKey)">{{verb}}</span>
          <button v-on:click="verbKey = undefined">Deselect this verb</button>
          <p>Pick a target that the verb will apply to.</p>
        
          <p>Or add a new target.</p>
          <input v-model="newTarget" v-on:keyup.stop.prevent.enter="addTargetSet" v-on:keyup.esc="addTargetSet"></input>
        </div>
        
        <div v-if="targetSetKey !== undefined && resultKey === undefined">
          <button v-on:click="targetSetKey = undefined">Deselect this target</button>
          <p>Synonyms for this target: </p>
          <span class="tag target-tag" v-for="(target, index) of targetsFromKey(targetSetKey)">{{target}}</span>
          <p>Pick the result of applying the verb to the target.</p>
          
          <p>Or add a new result.</p>
          <textarea v-model="newResult" v-on:keyup.stop.prevent.enter="addResult" v-on:keyup.esc="addResult"></textarea>
        </div>
        
        <div v-if="resultKey !== undefined">
          <button v-on:click="resultKey = undefined">Deselect this result</button>
          <!-- cancel, save (new binding), delete (existing binding), update (existing binding that is different) -->
          <button v-on:click="restartBindingProcess">Cancel changes</button>
          <button v-if="showSave()" v-on:click="saveBinding">Save new binding</button>
          <button v-if="showUpdate()" v-on:click="saveBinding">Update binding</button>
          <button v-if="showDelete()" v-on:click="deleteBinding">Delete binding</button>
        </div>
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
        this.newTarget.toLowerCase()
      ];
      // TODO verify it's unique
      this.$set(this.content.targets, newTargetSetKey, newTargetSet);
      this.newTarget = "";
      this.targetSetKey = newTargetSetKey; // Also select it.
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
    }
  },
  watch: {
    targetSetKey: function(val, oldVal) {
      if (this.verbKey !== undefined && val !== undefined && this.content.bindings[this.verbKey] !== undefined) {
        let resultKey = this.content.bindings[this.verbKey][val];
        if (resultKey !== undefined) {
          this.resultKey = resultKey;
        }
      }
    }
  }
  
}
