
import SimpleTextUtils from './SimpleTextUtils.js';
import SimpleTextEditableField from './SimpleTextEditableField.js';

export default {
  template: `
    <div id="simple-text-build">
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
      view: "description",
      editingKey: undefined,
      newEntry: "",
      slots: [0, 1, 2, 3, 4, 5]
    }
  },
  computed: {
    bindingsByVerb: function() {
      let verbs = SimpleTextUtils.verbs;
      
      let result = {};
      for (var verbKey in verbs) {
        let bindings = this.content.bindings[verbKey] ? this.content.bindings[verbKey] : [];
        result[verbs[verbKey][0]] = bindings;
      }
      return result;
    }
  },
  methods: {
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
}
