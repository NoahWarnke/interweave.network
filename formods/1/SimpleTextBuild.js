
import SimpleTextUtils from './SimpleTextUtils.js';

export default {
  template: `
    <div id="simple-text-build">
      <div>
        <button v-on:click="view = 'description'">Description</button>
        <button v-on:click="view = 'edges'">Edges</button>
        <button v-on:click="view = 'targets'">Target Sets</button>
        <button v-on:click="view = 'results'">Results</button>
        <button v-on:click="view = 'bindings'">Bindings</button>
      </div>
      <div v-if="view === 'description'">
        <p>Enter a short description for the Node. Explorers will see it when they first arrive.</p>
        <textarea v-model="content.shortDesc"></textarea>
      </div>
      <div v-if="view === 'edges'">
        <p>Edit the incoming/outgoing text for edges, and add or remove them.</p>
        <ul>
          <li v-for="(edge, index) of content.edges">
            <span class="tag edge-tag">edge{{index}}</span>:
            <span class="tag edge-tag">{{shorten(edge.enterDesc)}}</span>
            <span class="tag edge-tag">{{shorten(edge.leaveDesc)}}</span>
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
          <li v-for="result of content.results">
            <span class="tag" v-bind:class="resultClass(result)">{{shorten(result)}}</span>
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
              <span class="tag" v-bind:class="resultClass(content.results[resultKey])">{{shorten(content.results[resultKey])}}</span>
            </div>
            <hr>
          </li>
        </ul>
      </div>
    </div>
  `,
  props: {
    content: Object
  },
  data: function() {
    return {
      view: "description"
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
    shorten: function(result) {
      return (result.length < 32
        ? result
        : result.substr(0, 32) + "..."
      );
    },
    firstNonEmptyTarget: function(target) {
      console.log(target);
      for (var key in target) {
        if (target[key].length > 0) {
          console.log("result: " + target[key]);
          return target[key];
        }
      }
      console.log("result: " + target[key]);
      return "&nbsp;";
    },
    resultClass: function(result) {
      if (result.indexOf("edge") === 0 && result.length === 5) {
        return 'edge-tag';
      }
      return 'result-tag';
    },
    addResult: function() {
      content.result
    }
  }
}
