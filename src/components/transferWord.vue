<template>
  <div style="box">
   <div class="voice-container">
       <h3>转写</h3>
        <div class="voice-input">
        <div class="start-voice">
            {{result}}
        </div>
        </div>
        <div class="voice">
        <div class="result-text" id="resultPanel">{{resultFinal}}</div>
        </div>
    </div>
  <div class="img">

  </div>
</div>
</template>
<script>
import SoundRecognizer from "@/assets/js/SoundRecognizer";
import Recorder from "@/assets/js/recorder/recorder-core";
import wav from "@/assets/js/recorder/engine/wav";
import bus from '@/bus'

export default {
  name: "transferWord",
  props: {
    msg: String,
  },
  data() {
    return {
      oldScrollTop: 0,
      resultFinal:'',
      newContent: [],
      result:'',
    };
  },
  mounted() {
    bus.$on('send',(data)=>{
      // console.log('trans',data)
      this.parseResult(data)
    })
    bus.$on('asr',(data)=>{
      // console.log('trans',data)
      let arr =[]
      data.forEach(e => {
        arr.push(e.asr_con);
      });
      this.resultFinal = arr.join()
    })
  },
  destroyed(){
  },
  methods: {
    stop(){

    },
    
    parseResult: function (data) {//转写结果处理
      var that = this;
      var obj = JSON.parse(data);
      if (obj.code == 200) {
        obj.data = obj.data == undefined ? "" : obj.data;
        if (obj.data != "" && obj.data != undefined) {
          if (obj.identification == 'final_result') {//临时结果
               this.resultFinal += JSON.parse(data).data
              }else if(obj.identification == 'provisional'){
                this.result=JSON.parse(data).data
              }
          } 
            this.to_footer();
          }
    },
    update: function () {
      let that = this;
      this.sendWs.onmessage = function (_msg) {
        //接收语音记录
        if (JSON.parse(_msg.data).identification == "results") {
          that.recordContent = JSON.parse(_msg.data).data; //记录数据更新
        } 
        // if (JSON.parse(_msg.data).identification == "final_result") {
        //   that.recordContent = JSON.parse(_msg.data).data; //记录数据更新
        // } else if (JSON.parse(_msg.data).identification == "provisional") {
        //   that.newContent = JSON.parse(_msg.data).data;
        // }
      };
      that.to_footer()
    },

    to_footer: function () {
      var div = document.querySelector(".chat-content");
      if(div){
        div.scrollTop = div.scrollHeight;
      }
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.box {
    display: grid;
    grid-template-columns: minmax(150px, 25%) 1fr;
  /* display:flex;
  align-items: center;
  border: 1px solid ; */
}
.voice-container{
    width:75%;
    padding: 10px 0 0 0;
}
.start-voice {
    background: #ebedee;
    padding: 15px;
}
.result-text{
  font-size: 1.2rem;
    text-align:left; 
    text-indent:2em;
    height: 20rem;
    overflow: auto;
}
.img{
    height: 100%;
    width: 25%;
    background: #ccc;
}
::-webkit-scrollbar {
  width: 7px;
  height: 7px;
  background-color: #f5f5f5;
}

/*定义滚动条轨道 内阴影+圆角*/
::-webkit-scrollbar-track {
  box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
  -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
  border-radius: 10px;
  background-color: #f5f5f5;
}

/*定义滑块 内阴影+圆角*/
::-webkit-scrollbar-thumb {
  border-radius: 10px;
  box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.1);
  -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.1);
  background-color: #c8c8c8;
}
</style>
