<template>
  <div>
    <input v-model="username"/>
    <div
      class="chat-content"
      :style="{
        height: '280px',
        padding: '20px',
        display: 'inline-block',
        'overflow-y': 'scroll',
      }"
    >
      <!-- recordContent 聊天记录数组-->
      <span v-for="(itemc, indexc) in recordContent" :key="indexc">
        <!-- 对方 -->
        <span class="word" v-if="itemc.username != username&&itemc.status==1" style="position:relative;">
          <span class="img" style="background-color:rgb(99,179,187)">
              {{itemc.username}}
            </span>
          <span class="info">
            <span class="info-content">{{ itemc.content }}</span>
          </span>
        </span>
        <!-- 我的 -->
        <span class="word-my" v-if='itemc.username == username&&itemc.status==1' style="position:relative;">
          <span class="info">
            <span class="info-content">{{ itemc.content }}</span>
          </span>
          <span class="img" style="background-color:rgb(229,204,111);">
            我
          </span>
        </span>
      </span>

      <!-- <span v-if="newContent.length > 0">
        <span v-for="item in newContent" :key="item.id"> -->
      <span v-if="recordContent.length > 0">
        <span v-for="item in recordContent" :key="item.id">
          <span class="word" v-if="username != item.username&&item.status==0">
          <span class="img" style="background-color:rgb(99,179,187)">
              {{item.username}}
            </span>
            <span class="info">
              <span class="info-content">{{ item.content }}</span>
            </span>
          </span>
          <!-- 我的 -->
          <span class="word-my" v-if='username == item.username&&item.status==0'>
            <span class="info">
              <span class="info-content">{{ item.content }}</span>
            </span>
            <span class="img" style="background-color:rgb(229,204,111)">
              我
            </span>
            
          </span>
        </span>
      </span>
    </div>
  </div>
</template>
<script>
import JitsiMeetExternalAPI from "@/assets/js/jitsi";
import SoundRecognizer from "@/assets/js/SoundRecognizer";
import Recorder from "@/assets/js/recorder/recorder-core";
import wav from "@/assets/js/recorder/engine/wav";

export default {
  name: "HelloWorld",
  props: {
    msg: String,
  },
  data() {
    return {
      username: "qq1",//当前用户
      meetNum:'20190202',//当前会议号
      oldScrollTop: 0,
      wenetWs: null, //RTC
      sendWs: null, //发送数据
      result: "",
      resultsArr: [],
      timeLoop: null,
      session_id: "",
      token_val: "",
      //var this.WebSocket_url = 'ws://192.168.0.50:8001/recognize';
      api_key: "ZemZs39d",
      api_secret: "4tdbgu6qZQGAQijmjRvbZKnhryqeoQvg",
      WebSocket_url: "wss://ting.raisound.com:9443/recognize",//转写
      // WebSocket_url: "wss://192.168.0.50:19999/recognize",//转写
      // sendSocket_url: "ws://1.14.48.90:8484/",//获取语音转写记录
      sendSocket_url: "ws://192.168.0.79:8484/",//获取语音转写记录
      newContent: [],
      recordContent: [
        // {
        //   mineMsg: "123",
        //   headUrl: "http://4eyes.cn/UploadedFile/525859866428224.jpg",
        //   username: "忽忽",
        //   content: "yiyyy",
        // },
        // {
        //   mineMsg: "123",
        //   headUrl: "http://4eyes.cn/UploadedFile/525859866428224.jpg",
        //   username: "忽忽",
        //   content: "WWEWEWEW",
        // },
        // {
        //   mineMsg: false,
        //   headUrl:
        //     "https://www.xtra.com.my/wp-content/uploads/2019/07/Four-Ears-Cat_Featured-Image.jpg",
        //   username: "YY",
        //   content: "WWEWEWEW",
        // },
        // {
        //   mineMsg: false,
        //   headUrl:
        //     "https://www.xtra.com.my/wp-content/uploads/2019/07/Four-Ears-Cat_Featured-Image.jpg",
        //   username: "YY",
        //   content: "WWEWEWEW",
        // },{
        //   mineMsg: "123",
        //   headUrl: "http://4eyes.cn/UploadedFile/525859866428224.jpg",
        //   username: "忽忽",
        //   content: "WWEWEWEW",
        // },{
        //   mineMsg: "123",
        //   headUrl: "http://4eyes.cn/UploadedFile/525859866428224.jpg",
        //   username: "忽忽",
        //   content: "WWEWEWEW",
        // },
      ],
    };
  },
  mounted() {
    this.getKey();
    this.startRecording();//开始实时传输音频
    this.to_footer();
    this.openSendSocket()
  },
  destroyed(){
    this.sendWs.onclose=function(){
      
    }
  },
  methods: {
    getKey: function () {//获取转写KEY
      this.axios
        .post("https://ting.raisound.com:8443/v3/auth/login", {
          api_key: "zU71GELn",
          api_secret: "eWrf3rvZhoF9YTFOLfAuzjXkGb3oqdom",
        })
        .then((stu) => {
          var obj = JSON.parse(stu);
          if (obj.code == 200) {
            //正常登录
            this.token_val = obj.data.token;
          } else {
            alert("获取token失败!");
          }
          return false;
        });
    },
    openSendSocket: function () {//语音记录socke
      var that = this;
      this.sendWs = new WebSocket(this.sendSocket_url); //语音记录
      this.sendWs.onopen = function () {
        console.log("Websocket 连接成功，开始发送");
        that.sendWs.send(
          JSON.stringify({
            action: "login",
            params: {
              username: that.username,
              meeting_number: that.meetNum,
            },
          })
        );
      };
      that.sendWs.onmessage = (res) => {
        if (JSON.parse(res.data).code == 200) {
          that.update()
        }
      };
    },

    openWebSocket: function (url) {//转写socke
      var that = this;
      this.result = "";
      if ("WebSocket" in window) {
        this.wenetWs = new WebSocket(url); //初步转写
        // this.openSendSocket();
        this.wenetWs.onopen = function () {
          console.log("Websocket 连接成功，开始识别");
          that.wenetWs.send(
            JSON.stringify({
              action: "InitStreamingASR",
              devid: "test_202004211132",
              scene: "tongyong",
              token: this.token_val,
              codec: "pcm",
              sample_rate: 16000,
              meeting_id: "test02_68_20200421185308",
            })
          );
        };
        this.wenetWs.onmessage = function (_msg) {
          if(_msg.data=='Welcome'||_msg.data==''){
            return
          }
          var obj = JSON.parse(_msg.data);
          if ((obj.code = 200)) {
            that.session_id = obj.session_id;
          }
          that.parseResult(_msg.data);
        };
        this.wenetWs.onclose = function () {
          console.log("WebSocket 连接断开");
        };
        this.wenetWs.onerror = function () {
          console.log("WebSocket 连接失败");
        };
      }
    },
    transform:function(results,flag){//格式处理
            let newobj = {};
            let temp = {};
            newobj.action = 'results'; //语音记录临时结果标识
            temp.content = results; //转写结果
            temp.meeting_number = this.meetNum//传入会议号
            temp.username = this.username //传入当前登录人
            temp.type = flag //传入当前登录人
            newobj.params = temp
            return newobj
    },
    parseResult: function (data) {//转写结果处理
      var that = this;
      var obj = JSON.parse(data);
      if (obj.code == 200) {
        obj.results = obj.results == undefined ? "" : obj.results;
        if (obj.results != "" && obj.results != undefined) {

          if (this.sendWs.readyState == 1&&obj.is_final != 1) {//临时结果
            var data = that.transform(obj.results,0)
            this.sendWs.send(JSON.stringify(data)); //发送临时转写结果
            this.update(); //更新语音记录数据
          } else if (this.sendWs.readyState == 3) {
            // this.openSendSocket()
          }
          if (obj.is_final == 1) {
            obj.result = "";
            obj.result += obj.results;

            var data = that.transform(obj.result,1)
            if (this.sendWs.readyState == 1) {
              this.sendWs.send(JSON.stringify(data)); //发送转写结果
              this.update(); //更新语音记录数据
            } else if (this.sendWs.readyState == 3) {
              // this.openSendSocket()
            }
            this.to_footer();
          } else {
            if (obj.results == undefined) {
              obj.results = "";
            }
          }
        }
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
    arrayBufferToBase64: function (buffer) {
      var binary = "";
      var bytes = new Uint8Array(buffer);
      var tmparr = bytes.slice(44); //wav 转pcm
      var len = tmparr.byteLength;
      for (var i = 0; i < len; i++) {
        binary += String.fromCharCode(tmparr[i]);
      }
      return window.btoa(binary);
    },
    TransferUpload: function (number, blobOrNull, duration, blobRec, isClose) {
      var that = this;
      // TransferUpload:function(number, blobOrNull) {
      if (blobOrNull) {
        var blob = blobOrNull;
        // var encTime = blob.encTime
        var reader = new FileReader();
        reader.onloadend = function (e) {
          var outbuffer = e.target.result;
          var Base64_test = that.arrayBufferToBase64(outbuffer);
          var text = JSON.stringify({
            action: "StreamingASR",
            session_id: that.session_id,
            end_flag: 0,
            audio_data: Base64_test,
          });
          if (that.wenetWs.readyState === 3) {
            that.openWebSocket(that.WebSocket_url);
          } else if (that.wenetWs.readyState === 1) {
            that.wenetWs.send(text);
          }
        };
        reader.readAsArrayBuffer(blob);
      }
    },

    startRecording: function () {
      // Check socket url
      var socketUrl = this.WebSocket_url;
      // init recorder
      SoundRecognizer.init({
        soundType: "wav",
        sampleRate: 16000,
        // recwaveElm: '.recwave',
        translerCallBack: this.TransferUpload,
      });
      this.openWebSocket(socketUrl);
    },

    stopRecording: function () {
      var text = JSON.stringify({
        action: "RelStreamingASR",
        session_id: this.session_id,
      });
      this.wenetWs.send(text);
      SoundRecognizer.recordClose();
      clearInterval(this.timeLoop);
    },

    to_footer: function () {
      var div = document.querySelector(".chat-content");
      div.scrollTop = div.scrollHeight;
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.chat-content {
  height: 100%;
}
.word {
  display: flex;
  text-align: left;
  width: 100%;
  margin-bottom: 10px;
  float: left;
}
.img {
  width: 40px;
  height: 40px;
  line-height: 40px;
  color: #ffffff;
  font-size: 1rem;
  font-weight: 700;
  text-align: center;
  border-radius: 50%;
}
.word .info {
  margin-left: 10px;
  text-align: left;
}
.time {
  font-size: 12px;
  color: rgba(51, 51, 51, 0.8);
  margin: 0;
  height: 20px;
  line-height: 20px;
  margin-top: -5px;
}
.word .info-content {
  padding: 6px;
  font-size: 14px;
  float: left;
  background: #a3c3f6;
  position: relative;
  margin-top: 5px;
}
/* //小三角形 */
.word .info-content::before {
  position: absolute;
  left: -8px;
  top: 8px;
  content: "";
  border-right: 10px solid #a3c3f6;
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
}

.word-my {
  display: flex;
  width: 100%;
  justify-content: flex-end;
  margin-bottom: 10px;
}
img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}
.info {
  width: 90%;
  margin-left: 10px;
  text-align: right;
}
.time {
  font-size: 12px;
  color: rgba(51, 51, 51, 0.8);
  margin: 0;
  height: 20px;
  line-height: 20px;
  margin-top: -5px;
  margin-right: 10px;
}
.word-my .info-content {
  max-width: 70%;
  padding: 6px;
  font-size: 14px;
  float: right;
  margin-right: 10px;
  position: relative;
  margin-top: 5px;
  background: #a3c3f6;
  text-align: left;
}
/* //小三角形 */
.word-my .info-content::after {
  position: absolute;
  right: -8px;
  top: 8px;
  content: "";
  border-left: 10px solid #a3c3f6;
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
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
