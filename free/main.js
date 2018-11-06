import App from './components/App.js';

window.interweaveApp = new Vue({
  el: '#app',
  render: (createElement) => {
    return createElement(App);
  }
});
