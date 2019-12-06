import Vue from 'vue'
import VueEvents from 'vue-event-handler'
import App from './App.vue'

Vue.config.productionTip = false;
Vue.use(VueEvents);

function start(elementOrSelector = '#app') {
  new Vue({
    render: h => h(App),
  }).$mount(elementOrSelector);
}

export { start };