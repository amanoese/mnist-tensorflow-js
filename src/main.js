 /* eslint-disable */
import Vue from 'vue'
import App from './App.vue'

import * as tf from '@tensorflow/tfjs';
import { loadImage } from 'canvas'

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
