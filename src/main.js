 /* eslint-disable */
import Vue from 'vue'
import App from './App.vue'

import * as tf from '@tensorflow/tfjs';

Vue.config.productionTip = false

tf.loadGraphModel('/api/model.json')
  .then((...args)=>console.log(args))
  .catch((...args)=>console.log(args))

const image = new ImageData(1, 1);
image.data[0] = 100;
image.data[1] = 150;
image.data[2] = 200;
image.data[3] = 255;

tf.browser.fromPixels(image).print();

new Vue({
  render: h => h(App),
}).$mount('#app')
