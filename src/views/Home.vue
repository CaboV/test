<template>
  <div class="home" :style="{height:Height}">
    
     <button @click='trackSetQueryDeviceList()'>重新获取音频设备</button>
    <select name="trackSet_device" class="trackSet_device" id=""></select>
    <button @click="begin()">开始会议</button>
    <RecordTransfer  />
    <!-- <hello-world></hello-world> -->
  </div>
</template>

<script>
// @ is an alias to /src
import RecordTransfer from '@/components/recordTransferNew.vue'
// import HelloWorld from '../components/HelloWorld.vue'

export default {
  name: 'Home',
  components: {
    RecordTransfer,
    // HelloWorld
  },
  data(){
    return{
      meetNum:'',
      Height:window.innerHeight,
      DeviceList:[],
    }
  },
  
  methods:{
    begin(){
      var rand = ''
      for (var i = 0; i < 8; i++) {
        rand += Math.floor(Math.random() * 10)
      }
      this.axios
        .post("http://192.168.0.79:8095/voip-yy-api/meeting/createMeeting", {
          meeting_name: 'testmeeting',
          meeting_number: Number(rand)
        })
        .then((stu) => {
          if (obj.code == 200) {
            //正常登录
            this.meetNum = obj.data.token;
          } else {
            alert("获取token失败!");
          }
          return false;
        });
    },
    devicesFun(){
      api.getAvailableDevices().then(devices => {
        console.log("音频设备",devices)
      })
    },
    trackSetQueryDeviceList(){
      var end=function(list,err){
        DeviceList=list;
        
        var opts=['<option value="">'+(list.length?'不设置':err)+'</option>'];
        for(var i=0;i<list.length;i++){
          var o=list[i];
          if(o.deviceId && o.kind=="audioinput"){
            var name=o.label||((i+1)+"# 无名称，可能是因为从来没有打开过录音");
            opts.push('<option value="'+i+'">'+name+'</option>');
          }
        }
        document.querySelector(".trackSet_device").innerHTML=opts.join(" ")
      };
      if(navigator.mediaDevices && navigator.mediaDevices.enumerateDevices){
        navigator.mediaDevices.enumerateDevices().then(end)["catch"](function(e){
          end([],"拉取失败："+e.message);
        });
      }else{
        end([],"此浏览器不支持拉取设备列表");
      }
    },
  }
}
</script>
<style scoped>
.home{
  /* height: calc(100%); */
  display: flex;
  flex-wrap: wrap;
}
.chat-content {
}
.word {
  display: flex;
  text-align :left;
  width: 100%;
  margin-bottom: 20px;
  float: left;
}
img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}
.word .info {
  margin-left: 10px;
  text-align :left;

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
  padding: 10px;
  font-size: 14px;
  float: left;
  background: #a3c3f6;
  position: relative;
  margin-top: 8px;
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
  margin-bottom: 20px;
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
  padding: 10px;
  font-size: 14px;
  float: right;
  margin-right: 10px;
  position: relative;
  margin-top: 8px;
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
