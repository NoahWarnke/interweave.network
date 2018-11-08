export default {
  template: `
    <div id="list-nodes">
      <ul>
        <li v-for="nodeKey of myNodes">
          {{nodeKey}}
        </li>
      </ul>
    </div>
  `,
  props: {
    myNodes: Array
  }
}
