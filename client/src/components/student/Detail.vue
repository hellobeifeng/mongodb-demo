<template>
  <div class="detail">
    <el-button type="success" class="goback" icon="el-icon-arrow-left" @click="goback">返回上一页</el-button>
    <p class="heroName">个人信息：{{name}} ~ {{age}} ~ {{sex | sexDesc}}</p>
    <p class="heroName">地址：{{address}}</p>
  </div>
</template>

<script>
export default {
  name:"studentdetail",
  data:function(){
      return {
          title:"学生详情",
          name:"",
          age:"",
          sex:"",
          address: ''
      }
  },
  filters: {
    sexDesc: function(sex) {
      if (sex == "man") {
        return "汉子";
      } else if (sex == "woman") {
        return "妹子";
      } else {
        return "";
      }
    }
  },
  methods:{
    getMessage(id){
      this.$http.get(`/api2/student/${id}`).then(function(response) {
        this.name = response.body.name;
        this.age = response.body.age;
        this.sex = response.body.sex;
        this.address = response.body.address
      });
    },
    goback(){
      this.$router.go(-1)
    }
  },
  mounted:function(){
    this.getMessage(this.$route.params.name)
  }
}
</script>

<style scoped>
.detail{
    width: 80%;
    margin: 50px auto;
}
.imgClass{
    width: 100%;
}
.heroName{
    text-align: center;
    font-size: 20px;
    font-weight: bold;
    font-style: italic;
}
.goback{
    margin-bottom: 30px;
}
</style>


