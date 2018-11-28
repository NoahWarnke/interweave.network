
export default {
  template: `
    <div class="tag-holder">
      <div
        v-if="selected"
        class="tag"
        v-bind:class="getClass(dataParent[dataKey])"
        v-on:keyup.esc="doneKey()"
        v-on:keyup.enter="doneKey()">
        <textarea v-model="dataParent[dataKey]" ref="entry"></textarea>
      </div>
      <button v-if="selected" v-on:click="doneKey()">Done</button>
      <span
        v-on:click="selectKey()"
        v-if="!selected"
        class="tag"
        v-bind:class="getClass(dataParent[dataKey])">
        {{shorten(dataParent[dataKey])}}
      </span>
      <button v-if="deletable" v-on:click="deleteKey()">Delete</button>
    </div>
  `,
  props: {
    type: String,
    selected: Boolean,
    dataParent: Object,
    dataKey: String
  },
  computed: {
    deletable: function() {
      return this.type === "result";
    }
  },
  methods: {
    shorten: function(result) {
      return (result.length < 32
        ? result
        : result.substr(0, 32) + "..."
      );
    },
    selectKey: function() {
      this.$emit("selectKey")
    },
    deleteKey: function() {
      this.$emit("deleteKey");
    },
    doneKey: function() {
      this.$emit("doneKey");
    },
    getClass: function(result) {
      if (this.type === "result") {
        if (result.indexOf("edge") === 0 && result.length === 5) {
          return 'edge-tag';
        }
        return 'result-tag';
      }
      return this.type + "-tag";
    }
  },
  watch: {
    selected: function(val, oldVal) {
      if (val) {
        // Focus the textarea so you can start typing right away, and 'esc' key presses stop the editing.
        this.$nextTick(function() {
          this.$refs.entry.focus();
        });
      }
    }
  }
}
