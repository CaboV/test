<template>
  <div class="chat-main" style="height:280px;padding-top:2px">
        <button size="mini" type="primary" @click="getMeetNum()">开始转写</button>
    <div class="chat-content"  @scroll="scrollEvent" style="display:block;height:220px;padding-top:2px">
      <!-- 
      <span v-for="(itemc, indexc) in recordContent" :key="indexc" class="recordItem">
        <span v-if="itemc.username != username" class="word" style="position:relative;">
          <span class="img" style="background-color:rgb(99,179,187)">
            {{ itemc.username }}
          </span>
          <span class="info">
            <span class="info-content">{{ itemc.content }}</span>
          </span>
        </span>
        <span v-else class="word-my" style="position:relative;">
          <span class="info">
            <span class="info-content">{{ itemc.content }}</span>
          </span>
          <span class="img" style="background-color:rgb(229,204,111);">
            我
          </span>
        </span>
      </span>
       -->
      <!-- recordContent 聊天记录数组-->
      <span v-for="(itemc, indexc) in recordContent" :key="indexc" class="recordItem">
        <!-- 对方 -->
        <span v-if="itemc.username != username" class="word" style="position:relative;">
          <span class="img" style="background-color:rgb(99,179,187)">
            {{ itemc.username }}
          </span>
          <span class="info">
            <span class="info-content">{{ itemc.content }}</span>
          </span>
        </span>
        <!-- 我的 -->
        <span v-else class="word-my" style="position:relative;">
          <span class="info">
            <span class="info-content">{{ itemc.content }}</span>
          </span>
          <span class="img" style="background-color:rgb(229,204,111);">
            我
          </span>
        </span>
      </span>

      <!-- <span v-if="newContent.length > 0">
        <span v-for="item in newContent" :key="item.id">
          <span v-if="username != item.username" class="word">
            <span class="img" style="background-color:rgb(99,179,187)">
              {{ item.username }}
            </span>
            <span class="info">
              <span class="info-content">{{ item.content }}</span>
            </span>
          </span>
          <span v-else class="word-my">
            <span class="info">
              <span class="info-content">{{ item.content }}</span>
            </span>
            <span class="img" style="background-color:rgb(229,204,111)">
              我
            </span>

          </span>
        </span>
      </span> -->
    
    </div>
    <br style="clear:both;"/>
    <div style="background-color:#fff;margin-top:60px">
          <span class="word_temp">
            <span class="img" style="background-color:rgb(99,179,187);height:30px;width:30px" v-text="othercpntent.username=(othercpntent&&othercpntent!=null)?othercpntent.username:'其他'">
              {{ othercpntent.username }}
            </span>
            <!-- <span class="info"> -->
              <span class="info-content" v-text="othercpntent.content=(othercpntent&&othercpntent!=null)?othercpntent.content:'其他'">{{ othercpntent.content }}</span>
            <!-- </span> -->
          </span>
          <span class="word_temp">
            <span class="img" style="background-color:rgb(229,204,111);height:30px;width:30px">
              我
            </span>
            <!-- <span class="info"> -->
              <span class="info-content">{{ mycontent.content }}</span>
            <!-- </span> -->
          </span>
    </div>
    <!-- 临时结果 -->
    <!-- <span style="display:block">
        
        </span>
      </span> -->
    <!-- <div id="box" class="box" v-if="">
        <div class="box-in"></div>
    </div>     -->
  </div>
  
</template>
<script>
// eslint-disable-next-line no-unused-vars
import JitsiMeetExternalAPI from '@/assets/js/jitsi'
import SoundRecognizer from '@/assets/js/SoundRecognizer'
// eslint-disable-next-line no-unused-vars
import Recorder from '@/assets/js/recorder/recorder-core'
// eslint-disable-next-line no-unused-vars
import wav from '@/assets/js/recorder/engine/wav'
// import { createMeeting_api, getKey_api } from '@/api/recordTransfer'

export default {
  name: 'RecordTransfer',
  // props: {
  //   msg: String
  // },
  data() {
    return {
      i:5,
      meetNum: '77777', // 当前会议号
      username:'23',
      oldScrollTop: 0,
      wenetWs: null, // RTC
      sendWs: null, // 发送数据
      result: '',
      resultsArr: [],
      timeLoop: null,
      session_id: '',
      token_val: '',
      api_key: 'ZemZs39d',
      api_secret: '4tdbgu6qZQGAQijmjRvbZKnhryqeoQvg',
      newContent: [{
        username:'23',
        content:'11111'
      },{
        username:'213',
        content:'11111'
      }],
      recordContent: [],
      pageData:{
        current_page: 1,//当前
        // next_page: 2,//下一页
        // previous_page: 0,//上一页
        last_page:2,
        total: 1,//总条数
      },
      rows:20,
      sendFlag:false,
      oldScrollTop:0,
      timeout: 28*1000,//30秒一次心跳
      serverTimeoutObj: null,//心跳倒计时
      lockReconnect:false,
      timeoutnum: null,//断开 重连倒计时
      mycontent:{},
      othercpntent:{},
      // history_url:'http://192.168.0.79:8095/voip-yy-api/meeting/pageData',//https://voiptest.raisound.com/meeting/meeting/createMeeting
      history_url:'https://voiptest.raisound.com/meeting/meeting/pageData',


      // WebSocket_url: "wss://ting.raisound.com:9443/recognize",//转写
      WebSocket_url: "wss://voiptest.raisound.com/recognize_wss",//转写
      // WebSocket_url: "wss://192.168.0.50:19999/recognize",//转写
      // sendSocket_url: "ws://1.14.48.90:8484/",//获取语音转写记录
      //sendSocket_url: "ws://192.168.0.79:8484/",//获取语音转写记录
      sendSocket_url: "wss://voiptest.raisound.com/meeting_wss",//获取语音转写记录
      chatData:{meeting_id:'77777'}
    }
  },
  mounted() {
    this.to_footer()
    
    // addEventListener('scroll',this.scrollEvent)
  },
  beforeDestroy() {
  },
  destroyed(){
    if(this.sendWs){
      this.sendWs.onclose=function(){}
    }
  },
  methods: {
    getHistory(){
      this.axios
        .post(this.history_url, {
        limit: this.rows,
        page:this.pageData.current_page,
        meeting_number: this.meetNum
      }).then(res => {
        if(res.data.code==200){
          if(res.data.data.data&&res.data.data.data.length>0){
            this.recordContent = res.data.data.data
            this.pageData.total = res.data.data.total
            this.pageData.last_page = res.data.data.last_page
            this.pageData.current_page = res.data.data.current_page
          }
          
        }
        // that.meetNum = res.meeting_number
      }).catch((err) => {
        console.log(err)
      })
    },
    getMeetNum() {
      // var rand = ''
      // for (var i = 0; i < 8; i++) {
      //   rand += Math.floor(Math.random() * 10)
      // }
      // if (!this.chatData.meeting_id || this.chatData.meeting_id == '') {
      //   this.$message.warning('开始失败,请重新开始转写')
      //   return
      // }
      const that = this
      // this.axios
      //   .post("https://voiptest.raisound.com/ting_v3/v3/auth/createMeeting", {
      //   meeting_name: 'testmeeting',
      //   meeting_number: this.meetNum
      // }).then(res => {
      //   // that.meetNum = res.meeting_number
      // }).catch((err) => {
      //   console.log(err)
      // })
      this.getHistory()
      that.startRecording()// 开始实时传输音频
      that.openSendSocket()
      that.to_footer()

      if(this.sendWs&&this.sendWs.readyState==1){
        this.heartbeat=setInterval(this.heartbeatFun(),300)
      }
    },
    getKey: function() { 
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
    openSendSocket: function() { // 语音记录socke
      var that = this
      // that.username='213'
      that.serverTimeoutObj && clearTimeout(that.serverTimeoutObj);
      this.sendWs = new WebSocket(this.sendSocket_url) // 语音记录
      this.sendWs.onopen = function() {
        console.log('Websocket 连接成功，开始发送')
        that.sendWs.send(
          JSON.stringify({
            action: 'login',
            params: {
              is:1,
              username: that.username,
              meeting_number: that.meetNum
            }
          })
        )
        that.heartbeatFun()
      }
      
      that.sendWs.onmessage = (res) => {
        if (JSON.parse(res.data).code == 200) {
          this.sendFlag = true
          that.update()
        }
        if(JSON.parse(res.data).code==-1){
          this.sendFlag = false
        }
      }
      that.sendWs.onclose =(e)=>{
        console.log('--------------------------------------------------------meeting-WS------关闭-------------------------------------------------------------------------')
        console.log('+++++++++++++++++++++++++++++++--------------------------------------******************websocket 断开: ' + e.code + ' ' + e.reason + ' ' + e.wasClean)
        console.log('+++++++++++++++++++++++++++++++--------------------------------------******************',e,'+++++++++++++++++++++++++++++++--------------------------------------******************')
        if(!that.reFlag){
          // that.reconnect()
        }
      }
      that.wenetWs.onerror=(err)=>{
        console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@错误原因！！！！！！！！',err,'@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@')
        if(!that.reFlag){
          // that.reconnect()
        }
      }
    },
    heartbeatFun(){//心跳
        var that = this;
            that.timeoutObj && clearTimeout(that.timeoutObj);
            that.serverTimeoutObj && clearTimeout(that.serverTimeoutObj);
            that.timeoutObj = setTimeout(function(){
                //这里发送一个心跳，后端收到后，返回一个心跳消息，
                if (that.sendWs.readyState == 1) {//如果连接正常
                    var data = JSON.stringify({
                      "action": "heartbeat",
                      "params": {
                          "username": that.username,
                        },
                    })
                    that.sendWs.send(data);
                }else{//否则重连
                    that.reconnect();
                }
                // that.serverTimeoutObj = setTimeout(function() {
                    //超时关闭
                    // that.sendWs.close();
                // }, that.timeout);

            }, that.timeout)
    },

    scrollEvent(e){// 滚动条到顶事件
      let that =this
        if (e.srcElement.scrollTop  == 0 ) {
          console.log(that.pageData.current_page<that.pageData.total,that.pageData.current_page,that.pageData.total)
          if(that.pageData.current_page<that.pageData.last_page){
            that.pageData.current_page++;
            this.getHistory()
            if(that.sendWs.readyState==1){
                // that.sendWs.send(JSON.stringify({
                //   action: 'pagingResult',
                //   params: {
                //     username:that.username,
                //     meeting_number:that.meetNum,
                //     page: that.pageData.current_page,
                //     limit: that.rows,
                //     order:1
                //   }
                // }))
            }
          }
        }
    },
    openWebSocket: function(url) { // 转写socke
      var that = this
      this.result = ''
      if ('WebSocket' in window) {
        this.wenetWs = new WebSocket(url) // 初步转写
        this.wenetWs.onopen = function() {
          console.log('Websocket 连接成功，开始识别')
          that.wenetWs.send(
            JSON.stringify({
              action: 'InitStreamingASR',
              devid: 'test_202004211132',
              scene: 'tongyong',
              token: this.token_val,
              codec: 'pcm',
              sample_rate: 16000,
              meeting_id: 'test02_68_20200421185308'
            })
          )
        }
        this.wenetWs.onmessage = function(_msg) {
          if (_msg.data == 'Welcome' || _msg.data == '') {
            return
          }
          var obj = JSON.parse(_msg.data)
          if (obj.code == 200) {
            that.session_id = obj.session_id
          }
          that.parseResult(_msg.data)
        }
        this.wenetWs.onclose = function() {
          console.log('WebSocket 连接断开')
        }
        this.wenetWs.onerror = function() {
          console.log('WebSocket 连接失败')
        }
      }
    },
    reconnect() {//重新连接
        var that = this;
        if(that.lockReconnect) {
            return;
        };
        that.lockReconnect = true;
        //没连接上会一直重连，设置延迟避免请求过多
        that.timeoutnum && clearTimeout(that.timeoutnum);
        that.timeoutnum = setTimeout(function () {
            //新连接
            // alert('正在重连')
            that.openSendSocket();
            that.lockReconnect = false;
        },500);
    },
    transform: function(results, flag) { // 格式处理
      const newobj = {}
      const temp = {}
      newobj.action = 'results' // 语音记录临时结果标识
      temp.content = results // 转写结果
      temp.meeting_number = this.meetNum// 传入会议号
      temp.username = this.username // 传入当前登录人
      temp.type = flag // 传入当前登录人
      // temp.limit = this.rows //请求条数
      // temp.order = 1;
      // temp.page = 1
      newobj.params = temp
      return newobj
    },
    parseResult: function(data) { // 转写结果处理
      var that = this
      var obj = JSON.parse(data)
      if (obj.code == 200) {
        obj.results = obj.results == undefined ? '' : obj.results
        if (obj.results != '' && obj.results != undefined) {
          if (this.sendWs.readyState == 1 && obj.is_final != 1&&this.sendFlag) { // 临时结果
            this.i--
            if (this.i == 0) {
              this.i = 5
            // that.serverTimeoutObj=setTimeout(()=>{
              const data = that.transform(obj.results, 0)
              console.log('*-*-*-*-*-*-*-*-*-*-*-*-*-99999999*-*-*-*-*-*-*-*-*-*-')
              this.sendWs.send(JSON.stringify(data)) // 发送临时转写结果
            // },500)
            }
            this.update() // 更新语音记录数据

          } else if (this.sendWs.readyState == 3) {
            // this.openSendSocket()
          }
          if (obj.is_final == 1) {
            obj.result = ''
            obj.result += obj.results

            const data = that.transform(obj.result, 1)
            if (this.sendWs.readyState == 1) {
              this.sendWs.send(JSON.stringify(data)) // 发送转写结果
              this.update() // 更新语音记录数据
            } else if (this.sendWs.readyState == 3) {
              // alert('连接异常')
              // that.reconnect()
            }
            this.to_footer()
          } else {
            if (obj.results == undefined) {
              obj.results = ''
            }
          }
        }
      }
    },
    update: function() {
      const that = this
      this.sendWs.onmessage = function(_msg) {
        // that.recordContent=JSON.parse(_msg.data).data // 记录数据更新
        console.log(that.recordContent)
        /**
         * 
         * that.recordContent.push(JSON.parse(_msg.data).data) // 记录数据更新
            that.pageData = JSON.parse(_msg.data).data.page
         */
        if (JSON.parse(_msg.data).identification == 'results'){
          that.recordContent = JSON.parse(_msg.data).data
          // that.recordContent.push(JSON.parse(_msg.data).data)
        }
        if (JSON.parse(_msg.data).identification == 'temporary'){
          if(that.username==JSON.parse(_msg.data).data.username){
            that.mycontent = JSON.parse(_msg.data).data
          }else{
            that.othercpntent= JSON.parse(_msg.data).data
          }
        }
        // 接收语音记录
        // if (JSON.parse(_msg.data).identification == 'historicalData'||JSON.parse(_msg.data).identification == 'results') {
        //   if(JSON.parse(_msg.data).data.data){

        //     that.recordContent = JSON.parse(_msg.data).data.data.reverse() // 记录数据更新
        //     that.pageData = JSON.parse(_msg.data).data.page
        //   }
        // }else if(JSON.parse(_msg.data).identification == 'pagingResult'){
        //   let arr =JSON.parse(_msg.data).data.data.reverse()
        //   arr.push(...that.recordContent)
        //   that.recordContent=arr
        //   that.pageData = JSON.parse(_msg.data).data.page

        // }
      }
      that.to_footer()
    },
    arrayBufferToBase64: function(buffer) {
      var binary = ''
      var bytes = new Uint8Array(buffer)
      var tmparr = bytes.slice(44) // wav 转pcm
      var len = tmparr.byteLength
      for (var i = 0; i < len; i++) {
        binary += String.fromCharCode(tmparr[i])
      }
      return window.btoa(binary)
    },
    TransferUpload: function(number, blobOrNull, duration, blobRec, isClose) {
      var that = this
      // TransferUpload:function(number, blobOrNull) {
      if (blobOrNull) {
        var blob = blobOrNull
        // var encTime = blob.encTime
        var reader = new FileReader()
        reader.onloadend = function(e) {
          var outbuffer = e.target.result
          var Base64_test = that.arrayBufferToBase64(outbuffer)
          var text = JSON.stringify({
            action: 'StreamingASR',
            session_id: that.session_id,
            end_flag: 0,
            audio_data: Base64_test
          })
          if (that.wenetWs.readyState === 3) {
            that.openWebSocket(that.WebSocket_url)
          } else if (that.wenetWs.readyState === 1) {
            that.wenetWs.send(text)
          }
        }
        reader.readAsArrayBuffer(blob)
      }
    },

    startRecording: function() {
      // Check socket url
      var socketUrl = this.WebSocket_url
      // init recorder
      SoundRecognizer.init({
        soundType: 'wav',
        sampleRate: 16000,
        // recwaveElm: '.recwave',
        translerCallBack: this.TransferUpload
      })
      this.openWebSocket(socketUrl)
    },

    stopRecording: function() {
      var text = JSON.stringify({
        action: 'RelStreamingASR',
        session_id: this.session_id
      })
      this.wenetWs.send(text)
      SoundRecognizer.recordClose()
      clearInterval(this.timeLoop)
    },

    to_footer: function() {
      this.$nextTick(() => {
        var container = this.$el.querySelector('.chat-content>.recordItem:last-child')
        if(container){
          container.scrollIntoView()
        }
      })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.chat-main{
  width: 100%;
  height: 100%;
}
.chat-content {
  height: 100%;
  padding-top: 20px;
  overflow-y: auto;
}

.btn{
  display: flex;
  justify-content: center;
  align-items: center;
}
.word {
  display: flex;
  text-align: left;
  width: 100%;
  margin-bottom: 10px;
  float: left;
}
.img {
  -webkit-user-select: none;
  cursor: default;
  pointer-events: none;
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
.word_temp{
  display: flex;
  text-align: left;
  width: 100%;
  margin-bottom: 10px;
  float: left;
}
.word_temp .info-content {
  padding: 6px;
  font-size: 14px;
  display: block;
  float: left;
  line-height: 15px;
  width: 90%;
  background: #a3c3f6;
  position: relative;
  /* margin-top: 5px; */
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
.box{
    position:fixed;
    right:10px;
    bottom: 10px;
    height:30px;
    width: 50px;    
    text-align:center;
    padding:10px 5px;    
    background-color: lightblue;
    border-radius: 20%;
    overflow: hidden;
}
.box:hover:before{
    top:50%
}
.box:hover .box-in{
    visibility: hidden;
}
.box:before{
    position: absolute;
    top: -50%;
    left: 50%;
    transform: translate(-50%,-50%);
    content:'新消息';
    width: 40px;
    color:rgb(252, 217, 152);
    font-weight:bold;

}    
.box-in{
    visibility: visible;
    display:inline-block;
    height:20px;
    width: 20px;
    border: 3px solid black;
    border-color: white transparent transparent white;
    transform:rotate(225deg);
}
</style>
