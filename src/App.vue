<template>
  <v-app id="app">
    <v-toolbar>
      <v-toolbar-side-icon></v-toolbar-side-icon>
      <v-toolbar-title>MNIST TensorFlow.js</v-toolbar-title>
    </v-toolbar>
    <v-container>
      <v-layout justify-center wrap>
        <v-flex xs10 md5 sm5 pa-1>
          <v-layout justify-center colmn wrap>
            <v-flex xs12 class="flex-center">
              <div class="content">
                <canvas width="28" height="28" ref="canvas"
                  @mousemove="canvasMouseMove"
                  @touchmove.stop="canvasMouseMove"
                  @touchend.stop="offedit"
                  @mouseup="offedit"
                  @touchstart.prevent="onedit"
                  @mousedown="onedit"></canvas>
                <svg viewBox="0, 0, 280, 280">
                  <rect x="40" y="40" width="200" height="200" stroke="pink" stroke-width="1" stroke-dasharray="4 4" fill="none" />
                </svg>
                <div class="flex-center column circular" v-if="!isDownLoaded">
                  <h2 v-if="downLoadPercent < 100">Downloading Model Datas ...</h2>
                  <h2 v-else>Loading Model to TensorFlow.js ...</h2>
                  <p></p>
                  <v-progress-circular
                    :rotate="360"
                    :size="150"
                    :width="15"
                    :value="downLoadPercent"
                  color="teal">
                    <h2>{{ downLoadPercent }}</h2>
                  </v-progress-circular>
                </div>
              </div>
            </v-flex>
            <v-flex xs12 class="flex-center">
              <v-btn depressed color="primary" @click="resetCanvas">Reset</v-btn>
            </v-flex>
          </v-layout>
        </v-flex>
        <v-flex xs10 md5 sm5 pa-1>
          <v-card>
            <v-list>
              <template v-for="item,index in output">

                <v-list-tile class="pink lighten-5" v-if="index === maxNum">
                  <v-list-tile-action>
                    <v-icon color="pink">star</v-icon>
                  </v-list-tile-action>
                  <v-list-tile-title v-text="index"></v-list-tile-title>
                  <v-list-tile-title v-text="item"></v-list-tile-title>
                </v-list-tile>

                <v-list-tile v-else>
                  <v-list-tile-action></v-list-tile-action>
                  <v-list-tile-title v-text="index"></v-list-tile-title>
                  <v-list-tile-title v-text="item"></v-list-tile-title>
                </v-list-tile>

              </template>
            </v-list>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>
  </v-app>
</template>

<script>
import * as tf from '@tensorflow/tfjs';
import mnistModel from '@/mnistModel.js';

export default {
  name: 'app',
  mounted(){
    this.resetCanvas();
    window.addEventListener('mouseup' ,this.offedit);

    this.graphModel = mnistModel.load(({total,loaded})=>{
      let maybeTotal = total || (2 ** 20 * 12); // if 12MiB
      this.downLoadPercent = _.min([loaded * 100 / maybeTotal, 100]).toFixed();
    });

    this.graphModel.then(model=>{
      this.downLoadPercent = 100
      return this.mnistCalcuration()
    }).then(model=>{
      console.log('initResult',model)
      this.resetCanvas()
      setTimeout(()=>{this.isDownLoaded = true},3 * 1000)
      //this.isDownLoaded = true
    });
  },
  data(){
    return {
      output: [],
      edit : false,
      lastPosX : null,
      lastPosY : null,
      downLoadPercent : 0,
      isDownLoaded : false,
      graphModel : null
    }
  },
  methods:{
    canvasMouseMove(event) {
      if(!this.edit){ return }
      let clientRect = event.target.getBoundingClientRect();
      //console.log(event,event.clientX - clientRect.left, event.clientY - clientRect.top)
      let x =  ((event.clientX || event.touches[0].clientX) - clientRect.left) * 28 / event.target.offsetWidth;
      let y =  ((event.clientY || event.touches[0].clientY) - clientRect.top ) * 28 / event.target.offsetHeight;
      //console.log(event,x,y)

      this.lastPosX = this.lastPosX || x
      this.lastPosY = this.lastPosY || y

      //console.log(list)

      let canvas = this.$refs['canvas']
      let ctx = canvas.getContext("2d");
      ctx.shadowColor = "white";
      ctx.shadowBlur = 1.5
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2
      ctx.lineCap = "round";

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
      this.output = [0,0,0,0,0,0,0,0,0,0].map(v=>v.toFixed(10))
    },
    onedit(event){
      console.log('startEdit')
      this.edit = true
    },
    offedit(){
      if(!this.edit){ return }
      console.log('endEdit')

      this.edit = false
      this.lastPosX = null
      this.lastPosY = null

      this.mnistCalcuration().then(result=>{
        this.output = result.map(v=>v.toFixed(10))
      })
    },
    mnistCalcuration(){
      return this.graphModel.then(model=>{
        let imgTensol = tf.browser.fromPixels(this.$refs['canvas'],1).reshape([1,784]).div(tf.scalar(255));
        return model.predict(imgTensol,{ batchSize : 1 })
          .flatten()
          .array()
      })
    }
  },
  computed:{
    maxNum(){
      return this.output
        .map((v,i)=>[v,i])
        .sort(([a],[b])=>a<b?1:-1)
        .filter(([v])=>v>0)
        .map(([v,i])=>i)
        .concat([NaN])[0]
    }
  }
}
</script>

<style lang="scss">

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
.flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
  &.column {
    flex-direction: column;
    flex-wrap: wrap;
 }
}
.content {
  position: relative;
  width:  100%;
  height: 100%;
  & > * {
    width:  100%;
    height: 100%;
  }
  & svg, & .circular {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
  & svg {
    pointer-events : none;
  }
  & .circular {
    background-color: rgba(255,255,255,0.9);
  }
}
</style>
