import TheNavbar from './TheNavbar.js';
import TheRenderArea from './TheRenderArea.js';
import ModalInfo from './ModalInfo.js';

export default {
  name: 'App',
  template: `
    <div id="app">
      <link rel="stylesheet" href="css/App.css">
      <the-navbar></the-navbar>
      <the-render-area></the-render-area>
      <modal-info v-if="false"></modal-info>
    </div>
  `,
  components: {
    TheNavbar,
    TheRenderArea,
    ModalInfo
  }
};
