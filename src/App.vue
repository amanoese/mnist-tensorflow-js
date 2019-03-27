<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png" @click="resetCanvas">
    <br>
    <div class="flex-center">
      <canvas width="28" height="28" ref="canvas" @mousemove="canvasMouseMove" @mouseup="offedit" @mousedown="onedit"  style="width: 280px; height: 280px;"></canvas>
      <ul>
        <li v-for="v,index in output">
          <span v-if="index===maxNum" style="background-color:yellow">{{ index }} : {{ v }}</span>
          <span v-else>{{ index }} : {{ v }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import HelloWorld from '@/../web_model/model.json'
import * as tf from '@tensorflow/tfjs';

export default {
  name: 'app',
  mounted(){
    this.resetCanvas()
    window.addEventListener('mouseup' ,this.offedit)
  },
  data(){
    return {
      graphModel : tf.loadGraphModel('/api/model.json'),
      output: [0,0,0,0,0,0,0,0,0,0],
      edit : false,
      lastPosX : null,
      lastPosY : null,
    }
  },
  methods:{
    canvasMouseMove(event) {
      if(!this.edit){ return }
      let clientRect = event.target.getBoundingClientRect();
      //console.log(event,event.clientX - clientRect.left, event.clientY - clientRect.top)
      //console.log(clientRect)
      let x =  (event.clientX - clientRect.left) / 10;
      let y =  (event.clientY - clientRect.top ) / 10;

      this.lastPosX = this.lastPosX || x
      this.lastPosY = this.lastPosY || y

      //console.log(list)

      let canvas = this.$refs['canvas']
      let ctx = canvas.getContext("2d");
      ctx.shadowColor = "white";
      //ctx.shadowBlur = 3
      ctx.strokeStyle = "white";
      ctx.lineWidth = 3

      ctx.beginPath();
      ctx.moveTo(this.lastPosX, this.lastPosY);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.closePath();

      this.lastPosX = x
      this.lastPosY = y
    },
    resetCanvas(){
      let canvas = this.$refs['canvas']
      var ctx = canvas.getContext("2d");
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    },
    onedit(event){
      this.edit = true
    },
    offedit(){
      if(!this.edit){ return }
      console.log('endEdit')

      this.edit = false
      this.lastPosX = null
      this.lastPosY = null

      this.mnistCalcuration()
    },
    mnistCalcuration(){
      this.graphModel.then(model=>{
        let imgTensol = tf.browser.fromPixels(this.$refs['canvas'],1).reshape([-1,28,28]).div(tf.scalar(255));
        imgTensol.print();

        return model.predict(imgTensol.reshape([-1,784]))
          .flatten()
          .array()
      }).then(result=>{
        this.output = result.map(v=>v.toFixed(10))
      })
    }
  },
  computed:{
    maxNum(){
      return this.output
        .map((v,i)=>[v,i])
        .sort(([a],[b])=>a<b?1:-1)
        .map(([v,i])=>i)[0]
    }
  },
  components: {
    HelloWorld
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
.flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
