<template>
    <div class="wts-container">
        <div class="do-exercise">
            <div style="width: 75%;border:1px solid #ccc;">
                <!-- <div class="exercise-up-page" @click="previousPage"><a-icon type="rollback" style="margin-right: 5px;"/>返回上一页</div> -->
                <div class="exercise-center">
                    <!--题目信息-->
                    <div style="height: 30px">
                        <el-row>
                            <!-- <el-col :span="2" style="padding-left: 40px;">
                                <div style="width: 56px;height: 56px;background-color: aqua"></div>
                            </el-col> -->
                            <el-col :span="22" style="padding-top: 2px; padding-left: 16px">
                                <!-- <el-row>
                                    <el-col :span="5">题目类型：<span class="topic-style">{{topicTypes}}</span></el-col>
                                    <el-col :span="4">题库分类：<span class="topic-style">{{topicClassify}}</span></el-col>
                                </el-row> -->
                                <el-row class="topic-information">
                                    <!-- <el-col :span="5">答题时间：{{publishTime}}</el-col> -->
                                    <el-col :span="8">答题人：{{username}}</el-col>
                                </el-row>
                            </el-col>
                        </el-row>
                    </div>
                    <!--具体题目内容-->
                    <template class="topicContent" >
                        <!--单选题-->
                        <div v-if="subObj.type==`2`&&subObj " :key="subObj.id" class="radio-type">
                            <div style="padding-bottom: 5px;">{{indexNow+1}}.{{subObj.problem_con}}</div>
                            <el-radio-group @change="sendAnswer(subObj)"   v-model="topicContent.radioItem" >
                                <el-radio  v-for="item in subObj.extend" :label="item.id" :key="item.id" >{{item.option_con}}</el-radio>
                            </el-radio-group>
                        </div>
                        <!--多选题-->
                        <div v-if="subObj.type==`3`&&subObj " :key="subObj.id" class="checkbox-type">
                        
                            <div style="padding-bottom: 5px;">{{indexNow+1}}.{{subObj.problem_con}}</div>
                            <el-checkbox-group @change="sendAnswer(subObj)" v-model="topicContent.checkedItem">
                                <el-checkbox v-for="item1 in subObj.extend" :label="item1.option_con" :key="item1.id" :value="item1.option_con"></el-checkbox>
                            </el-checkbox-group>
                            
                        </div>
                        <!--简答题-->
                        <div v-if="subObj.type=='1' " :key="subObj.id" class="answer-type">
                            <div style="padding-bottom: 5px;"> {{indexNow+1}}.{{subObj.problem_con}}</div>
                            <el-input type="textarea" @input="sendAnswer()" :autosize="{ minRows: 5, maxRows: 5}" placeholder="请输入..." v-model="topicContent.answerItem" style="padding-top: 10px"></el-input>
                        </div>
                        <!--复合题-->
                        <div v-if="subObj.type==`4`&&subObj " :key="subObj.id" class="radio-type">
                            <div style="padding-bottom: 5px;">{{indexNow+1}}.{{subObj.problem_con}}</div>
                            <el-radio-group @change="sendAnswer()"   v-model="topicContent.radioItem" >
                                <el-radio  v-for="item in subObj.extend" :label="item.id" :key="item.id" >{{item.option_con}}</el-radio>
                            </el-radio-group>
                            <div  v-if="topicContent.radioItem==subObj.extend[0].id" style="padding-top: 15px;">
                                {{subObj.remarks}}
                                <el-input v-model="remark"  @input="sendAnswer()" placeholder=""></el-input>
                            </div>
                        </div>
                    </template>
                    <!--按钮-->
                    <div class="button-style">
                        <el-button size="small" type="primary" @click="preTopic">上一题</el-button>
                        <!-- <el-button size="small" type="primary" @click="handleSubmit">提交</el-button> -->
                        <el-button size="small" type="primary" @click="nextTopic">下一题</el-button>
                    </div>
                </div>
            </div>
            <div class="num-box" >
                <span v-for="(item,index) in testList"  @click="getData(index),sendTest()" :class="index==indexNow?'checked':''" :key="item.problem_con" style="display:inline-blocek;margin:5px;padding:5px 10px;border:1px solid #ccc"> 
                    <span >{{index+1}}</span>
                </span>
            </div>
        </div>
        <!-- <result-model ref="DialogModel" @nextTopic="nextTopic"/>
        <comment-model ref="commentModel"/> -->
    </div>
</template>

<script>
    import bus from '@/bus'
    export default {
        name: "test",
        data() {
            return {
                meetNum: 'test01', // 当前会议号
                username:'25',
                timer:null,
                remark:'',
                testList:[],
                topicTypes:undefined, // 题目类型
                topicClassify:undefined, // 题库分类
                // 需要展示的题目类型
                subjectType:[
                    {type:"2",value:false},
                    {type:"3",value:false},
                    // {type:"isBlank",value:false},
                    {type:"1",value:false},
                ], // 需要展示的题目类型
                subObj:{},
                publishTime:"2021-3-11 16:28",
                authorName:"小明",
                score:10, // 题的分值
                // 答案内容
                topicContent:{
                    radioItem:undefined, // 默认选项（单选题）
                    checkedItem:[], // 默认选项（多选题）(必须是空数组形式，否则报错)
                    resultContent:undefined, // 填空题答案
                    answerItem:undefined, // 简答题内容
                },
                collectNum:1, // 收藏数
                isCollect:false, // 是否收藏
                praiseNum:2, // 赞个数
                isPraise:false, // 是否点赞
                // 评论内容
                commentList:[
                ],
                listUrl:"http://218.17.161.34:8095/meeting_api/answer/list",
                reUrl:'http://218.17.161.34:8095/meeting_api/answer/answerReset',
                ASRws:'http://218.17.161.34:8095/meeting_api/answer/historicalAsr',
                sendSocket_url:'ws://218.17.161.34:8484',
                getAnswerUrl:'http://218.17.161.34:8095/meeting_api/answer/answerQuery',
                getAsrUrl:'http://218.17.161.34:8095/meeting_api/answer/historicalAsr',

            }
        },
        components:{
            // ResultModel,
            // CommentModel
        },
        mounted(){
            // 从接口中获取数据
            this.initList()
            
        },
        computed:{
            // 评论数
            commentNum(){
                // return this.commentList.length;
            }
        },
        methods:{
            initList(){
                let that =this
                this.axios
                .post(this.listUrl, {
                    })
                    .then((res) => {
                        if (res.data.code == 200) {
                            //正常登录
                            that.testList = res.data.data;
                            that.getData(0);
                            that.openSendSocket()
                            that.getAnswer()
                        } else {
                        }
                });
            },
            openSendSocket: function() { // 语音记录socke
                var that = this
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
                    that.sendWs.onmessage=(data)=>{
                        if(JSON.parse(data.data).identification=='questionAnswer'){
                            that.traAnswer(JSON.parse(data.data).data.answer_con,JSON.parse(data.data).data.remarks)
                            console.log('-----------------asr',JSON.parse(data.data),JSON.parse(data.data).answer_con,JSON.parse(data.data).remarks)
                        }
                        if(JSON.parse(data.data).identification=='synchronization'){
                            console.log(data.data)
                            that.getData(JSON.parse(data.data).data)
                        }
                        bus.$emit('send',data.data)
                    };
                    that.heartbeatFun()
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
            sendAnswer(){
                let answer;
                switch (this.subObj.type) {
                    case 1:
                        answer = this.topicContent.answerItem;
                        break;
                    case 2:
                        answer = this.topicContent.radioItem;
                        break;
                    case 3:
                        answer = this.topicContent.checkedItem.join('&&');
                        break;
                    case 4:
                        answer = this.topicContent.radioItem;
                        break;
                    default:
                        break;
                }
                let obj =JSON.stringify({"action": "answerInfo",
                    "params": {
                        "meeting_number": this.meetNum,
                        "problem_id": this.subObj.id,
                        "answer_con":answer,
                        "type":this.subObj.type,
                        "remarks":this.remark
                      },
                })
                 this.sendWs.send(obj)
            },
            getAnswer(){
                let that = this;
                let answer;
                let remarks;
                this.axios
                .post(this.getAnswerUrl, {meeting_number:that.meetNum,problem_id:this.subObj.id,type:1
                    })
                    .then((res) => {
                    if (res.data.code == 200) {
                        if(res.data.data!=null){
                            answer = res.data.data.answer_con
                            remarks = res.data.data.remarks
                        }else{
                            answer=false
                        }
                        this.traAnswer(answer,remarks)
                    } else {
                        
                    }
                });
            },
            traAnswer(answer,remarks){//答案处理
                switch (this.testList[this.indexNow].type) {
                    case 1:
                        this.topicContent.answerItem = !answer?'':answer;
                        break;
                    case 2:
                        this.topicContent.radioItem = !answer?-1:parseInt(answer);
                        break;
                    case 3:
                        this.topicContent.checkedItem =!answer?'':answer.split('&&');
                        break;
                    case 4:
                        this.topicContent.radioItem = !answer?-1:parseInt(answer);
                        this.remark = remarks
                        break;
                    default:
                        break;
                }   
            },
            // 从接口中获取数据，具体情况根据接口来
            getData(data){
                this.indexNow = data
                this.subObj = this.testList[data]
                this.getAnswer()
                this.getAsr()

            },
            getAsr(){
                this.axios
                .post(this.getAsrUrl, {meeting_number:this.meetNum,problem_id:this.subObj.id})
                    .then((res) => {

                    if (res.data.code == 200) {
                        console.log('aaaaaaa',res.data.data)
                        if(res.data.data!=null){
                            bus.$emit('asr',res.data.data)
                        }else{
                        }
                    } else {
                        
                    }
                });
            },
            // 提交
            handleSubmit(){
                let record = {
                    title:"答案结果",
                    isError:false, // 结果
                    isResult:true, // 是否显示结果界面
                    isAnalysis:false, // 是否显示解析界面
                };
                this.$refs.DialogModel.show(record);
            },
            // 下一题
            preTopic(){
                if(this.indexNow==0){
                    this.$message.success("已经是第一题");
                    return false
                }
                this.indexNow--
                this.sendTest()
                this.getData(this.indexNow);
            },
            // 下一题
            nextTopic(){
                if(this.indexNow==this.testList.length){
                    this.$message.success("已经是最后题");
                    return false

                }
                this.indexNow++
                this.sendTest()
                this.getData(this.indexNow);
            },
            sendTest(){
                let obj = JSON.stringify({
                    "action": "synchronization",
                    "params": {
                        "meeting_number": this.meetNum,
                        "number":this.indexNow, // 当前题序号
                        // "answer_con":this.answerNow,
                        // "type":3,
                    }
                    })
                this.sendWs.send(obj)
            },
            // 返回上一页
            previousPage(){
                this.$router.push("/wts/personalCenter");
            }
        }
    }
</script>

<style scoped >
    .do-exercise{
        display: flex;
        /* flex-direction: column; */
        align-items: center;
        /* background: #F2F3F5; */  
    }
    .num-box{
        width:25%;display:inline-flex;;justify-content: center;
        flex-wrap:wrap;
        /* display: grid;
        grid-gap: 1rem;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); */
    }
    /*返回上一级*/
    .exercise-up-page{
        padding-top: 16px;
        font-size: 14px;
        font-weight: 400;
        color: #999999;;
        line-height: 22px;
        cursor:pointer
    }
    .exercise-center{
            background-color: #FFFFFF;
            height: 270px;
            margin-top: 16px;
            padding-top: 22px;
            /*题目信息*/
           
        }
     .topic-style{
                font-size: 16px;
                font-weight: 600;
                color: #333333;
                line-height: 22px;
            }
    .topic-information{
        font-size: 14px;
        font-weight: 400;
        color: #999999;
        line-height: 20px;
        padding-top: 8px;
    }
    /*题目内容*/
    .radio-type{
        height: 145px;
        border-top: solid 1px #e6e6e6;
        padding: 15px 40px;
        
    }
     .radio-type .el-radio-group{
            display: block;
            padding: 5px 15px;
        }
    .checkbox-type{
        height: 184px;
        border-top: solid 1px #e6e6e6;
        padding: 15px 40px;
        .el-checkbox{
            width: 100%;
            padding: 5px 15px;
        }
    }
    .blank-type{
        height: 184px;
        border-top: solid 1px #e6e6e6;
        padding: 15px 40px;
    }
    .answer-type{
        height: 184px;
        border-top: solid 1px #e6e6e6;
        padding: 15px 40px;
    }
    /*按钮样式*/
    .button-style{
        display: flex;
        justify-content: center;
        padding-top: 20px;
        border-top: dotted 1px #e6e6e6;
    }
    .checked{
        background: #409EFF;
        color: #FFFFFF;
    }
</style>
