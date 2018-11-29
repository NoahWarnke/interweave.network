
import SimpleTextUtils from './SimpleTextUtils.js';
import SimpleTextEditableField from './SimpleTextEditableField.js';

export default {
  template: `
    <div id="simple-text-build">
      <p>Enter a short description for the Node. Explorers will see it when they first arrive.</p>
      <textarea v-model="content.shortDesc"></textarea>
      
      <div v-if="verbKey === undefined">
        <p>Now start creating bindings: verb-object-result combos. For example, 'examine cat' could produce 'A fluffy kitty that is purring on the floor.</p>
        <select v-model="verbKey">
          <option disabled value="undefined">Select verb</option>
          <option
            v-for="(binding, vKey) of verbs"
            v-bind:value="vKey">
            {{verbNameFromKey(vKey) + "(" + numVerbBindings(vKey) + ")"}}
          </option>
        </select>
      </div>
      
      <div v-if="verbKey !== undefined && targetSetKey === undefined">
        <span class="tag verb-tag">{{verbNameFromKey(verbKey)}}</span>
        <hr>
        <p>Synonyms for this verb: </p>
        <span class="tag verb-tag" v-for="(verb, index) of verbsFromKey(verbKey)">{{verb}}</span>
        
        <p>Pick a target that the verb will apply to.</p>
        <select v-model="targetSetKey">
          <option disabled value="undefined">Select target</option>
          <option
            v-for="(targetSet, tKey) of content.targets"
            v-bind:value="tKey">
            {{targetNameFromKey(tKey)}}
          </option>
        </select>
        <p>Or add a new target.</p>
        <input v-model="newTarget" v-on:keyup.stop.prevent.enter="addTargetSet" v-on:keyup.esc="addTargetSet"></input>
      </div>
      
      <div v-if="targetSetKey !== undefined && resultKey === undefined">
        <span class="tag verb-tag">{{verbNameFromKey(verbKey)}}</span>
        <span class="tag target-tag">{{targetNameFromKey(targetSetKey)}}</span>
        <hr>
        <p>Synonyms for this target: </p>
        <span class="tag target-tag" v-for="(target, index) of targetsFromKey(targetSetKey)">{{target}}</span>
        <p>Pick the result of applying the verb to the target.</p>
        <select v-model="resultKey">
          <option disabled value="undefined">Select result</option>
          <option
            v-for="(result, rKey) of content.results"
            v-bind:value="rKey">
            {{shorten(result)}}
          </option>
        </select>
        <p>Or add a new result.</p>
        <textarea v-model="newResult" v-on:keyup.stop.prevent.enter="addResult" v-on:keyup.esc="addResult"></textarea>
      </div>
      
      <div v-if="resultKey !== undefined">
        <span class="tag verb-tag">{{verbNameFromKey(verbKey)}}</span>
        <span class="tag target-tag">{{targetNameFromKey(targetSetKey)}}</span>:
        <span class="tag result-tag">{{content.results[resultKey]}}</span>
        <button v-on:click="doneBinding">Finish this binding!</button>
      </div>
      
      
      
      <!--
      <div>
        <button v-on:click="setView('description')">Description</button>
        <button v-on:click="setView('edges')">Edges</button>
        <button v-on:click="setView('targets')">Target Sets</button>
        <button v-on:click="setView('results')">Results</button>
        <button v-on:click="setView('bindings')">Bindings</button>
      </div>
      <div v-if="view === 'description'">
        <p>Enter a short description for the Node. Explorers will see it when they first arrive.</p>
        <textarea v-model="content.shortDesc"></textarea>
      </div>
      <div v-if="view === 'edges'">
        <p>Edit the incoming/outgoing text for edges, and add or remove them.</p>
        <ul>
          <li v-for="slot of slots">
            <span class="tag edge-tag">edge{{slot}}</span>:
            
            <simple-text-editable-field
              v-if="content.edges[slot] !== undefined"
              v-on:selectKey="selectKey(slot + 'enterDesc')"
              v-on:doneKey="doneKey"
              v-on:deleteKey="deleteKey"
              v-bind:type="'edge'"
              v-bind:selected="editingKey === slot + 'enterDesc'"
              v-bind:dataParent="content.edges[slot]"
              v-bind:dataKey="'enterDesc'">
            </simple-text-editable-field>
            
            <simple-text-editable-field
              v-if="content.edges[slot] !== undefined"
              v-on:selectKey="selectKey(slot + 'leaveDesc')"
              v-on:doneKey="doneKey"
              v-on:deleteKey="deleteKey"
              v-bind:type="'edge'"
              v-bind:selected="editingKey === slot + 'leaveDesc'"
              v-bind:dataParent="content.edges[slot]"
              v-bind:dataKey="'leaveDesc'">
            </simple-text-editable-field>
            
            <button v-on:click="deleteKeyEdge(slot)" v-if="content.edges[slot] !== undefined">Delete</button>
            <button v-on:click="addEdge(slot)" v-if="content.edges[slot] === undefined">Add</button>
            <hr>
          </li>
        </ul>
      </div>
      <div v-if="view === 'targets'">
        <p>
          Edit the target sets. Each of these is a set of names that are treated as one possible 'target' for an explorer to apply a verb to.
        </p>
        <ul>
          <li v-for="target of content.targets">
            <span class="tag target-tag" v-for="name of target" v-html="name === '' ? '&nbsp;' : name"></span>
            <hr>
          </li>
        </ul>
      </div>
      <div v-if="view === 'results'">
        <p>
          Edit the results (text strings that the explorer will see in their console when they do various things.)
        </p>
        <ul>
          <li v-for="(result, resultKey) of content.results">
            <simple-text-editable-field
              v-on:selectKey="selectKey(resultKey)"
              v-on:doneKey="doneKey"
              v-on:deleteKey="editingKey = resultKey; deleteKey();"
              v-bind:type="'result'"
              v-bind:selected="editingKey === resultKey"
              v-bind:dataParent="content.results"
              v-bind:dataKey="resultKey">
            </simple-text-editable-field>
          </li>
          <li>
            <span>Add a new result! Hit esc when you're done.</span>
            <div v-on:keyup.esc="doneKey()" v-on:keyup.enter="doneKey()">
              <textarea v-model="newEntry"></textarea>
            </div>
          </li>
        </ul>
      </div>
      <div v-if="view === 'bindings'">
        <p>
          Edit the bindings (which results the explorer will see when they apply a given verbset to a given targetset).
        </p>
        <ul>
          <li v-for="(binding, bindingKey) of bindingsByVerb">
            <div v-if="Object.keys(binding).length === 0">
              <span class="tag verb-tag">{{bindingKey}}</span>
            </div>
            <div v-for="(resultKey, targetKey) of binding">
              <span class="tag verb-tag">{{bindingKey}}</span>
              <span class="tag target-tag" v-html="firstNonEmptyTarget(content.targets[targetKey])"></span> =>
              <simple-text-editable-field
                v-bind:type="'result'"
                v-bind:selected="false"
                v-bind:dataParent="content.results"
                v-bind:dataKey="resultKey">
              </simple-text-editable-field>
            </div>
            <hr>
          </li>
        </ul>
      </div>
      -->
    </div>
  `,
  components: {
    SimpleTextEditableField
  },
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
      /*
      view: "description",
      editingKey: undefined,
      newEntry: "",
      slots: [0, 1, 2, 3, 4, 5]
      */
    }
  },
  computed: {
    slot: function() {
      if (resultKey === undefined) {
        return undefined;
      }
      let result = this.content.results[resultKey];
      if (result.indexOf('edge' === 0 && result.length === 5)) {
        let slot = parseInt(result.substr(4, 5));
        if (slot >= 0 && slot < 6) {
          return slot;
        }
        return undefined;
      }
    },
    /*
    bindingsByVerb: function() {
      let verbs = SimpleTextUtils.verbs;
      
      let result = {};
      for (var verbKey in verbs) {
        let bindings = this.content.bindings[verbKey] ? this.content.bindings[verbKey] : [];
        result[verbs[verbKey][0]] = bindings;
      }
      return result;
    }
    */
  },
  methods: {
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
    doneBinding: function() {
      if (this.verbKey === undefined || this.targetSetKey === undefined || this.resultKey === undefined) {
        return;
      }
      
      // Create/set the new binding.
      if (this.content.bindings[this.verbKey] === undefined) {
        this.content.bindings[this.verbKey] = {};
      }
      this.content.bindings[this.verbKey][this.targetSetKey] = this.resultKey;
      
      // Clean up.
      this.verbKey = undefined;
      this.targetSetKey = undefined;
      this.resultKey = undefined;
    },
    shorten: function(result) {
      return (result.length < 32
        ? result
        : result.substr(0, 32) + "..."
      );
    }
  },
  watch: {
    targetKey: function(val, oldVal) {
      if (this.verbKey !== undefined && val !== undefined) {
        let resultKey = this.content.bindings[this.verbKey][val];
        if (resultKey !== undefined) {
          this.resultKey = resultKey;
        }
      }
    }
  }
    
    /*
    setView: function(newView) {
      this.view = newView;
      this.editingKey = undefined;
    },
    selectKey: function(key) {
      this.editingKey = key;
    },
    deleteKey: function() {
      // TODO check for bindings first.
      if (this.view === "results") {
        delete this.content.results[this.editingKey];
      }
      if (this.view === "edges") {
        delete this.content.edges[this.editingKey];
      }
      this.doneKey();
    },
    deleteKeyEdge: function(slot) {
      // TODO check for bindings first.
      this.editingKey = slot;
      this.deleteKey();
    },
    addEdge: function(slot) {
      this.$set(this.content.edges, slot, {
        enterDesc: "You arrive.",
        leaveDesc: "You leave."
      });
    },
    doneKey: function() {
      // TODO check for duplicates first.
      if (this.editingKey === undefined && this.newEntry !== "") {
        if (this.view === "results") {
          let newKey = Object.keys(this.content.results).length;
          this.content.results[newKey] = this.newEntry;
          this.newEntry = "";
        }
      }
      else {
        this.editingKey = undefined;
      }
    },
    firstNonEmptyTarget: function(target) {
      for (var key in target) {
        if (target[key].length > 0) {
          return target[key];
        }
      }
      return "&nbsp;";
    }
    
  }
  */
}
