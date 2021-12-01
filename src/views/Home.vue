<template>
  <div class="home" :style="{height:Height}">
    111
    <!-- <div class="chat-content" :style="{height:380+'px',display:'inline-block','overflow-y':'scroll'}">
    
    <span v-for="(itemc, indexc) in recordContent" :key="indexc">
      <span class="word" v-if="itemc.name!='忽忽'">
        <img :src="itemc.headUrl" />
        <span class="info">
          <p class="time">{{ itemc.name }} {{ itemc.timestamp }}</p>
          <span class="info-content">{{ itemc.content }}</span>
        </span>
      </span>
      <span class="word-my" v-else>
        <span class="info">
          <p class="time">{{ itemc.name }} {{ itemc.timestamp }}</p>
          <span class="info-content">{{ itemc.content }}</span>
        </span>
        <img :src="itemc.headUrl" />
      </span>
    </span>
    
  </div> -->
    <!-- <img alt="Vue logo" src="../assets/logo.png"> -->
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
    Height:window.innerHeight
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
        });}
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
