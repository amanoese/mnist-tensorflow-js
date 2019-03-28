 /* eslint-disable */
import Vue from 'vue'
import './plugins/axios'
import './plugins/vuetify'
import App from './App.vue'

import * as tf from '@tensorflow/tfjs';
import { loadImage } from 'canvas'

new Vue({
  render: h => h(App),
}).$mount('#app')
