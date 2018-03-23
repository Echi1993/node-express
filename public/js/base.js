/** created by Echi 2018-02-18 */

var vm = new Vue({
    el: "#echi",
    data: {
        user: {
            name: "",
            password: ""
        },
        userInfo: {},
        pubData: {
            title: "",
            cover: "",
            desc: "",
            content: ""
        },
        iframeSrc: "/artical"
    },
    mounted: function(){
        this.getUserInfo();
    },
    methods: {
        validateLogin: function(){
            if (this.user.name === "") {
                this.$message({
                    message: '请输入用户名',
                    type: 'warning'
                });
                return false;
            }
            if (this.user.password === "") {
                this.$message({
                    message: '请输入密码',
                    type: 'warning'
                });
                return false;
            }
            return true;
        },
        login: function(){
            var self = this;
            if (!this.validateLogin()) return false;
            if (this.isSubmit) return false;
            this.isSubmit = true;
            axios.post("/login", this.user).then(function(res){
                var data = res.data;
                self.isSubmit = false;
                if(data.status){
                    self.$message({
                        message: data.msg,
                        type: 'success'
                    });
                    setTimeout(function(){
                        location.href = data.url;
                    },2000);
                }else{
                    self.$message({
                        message: data.msg,
                        type: 'warning'
                    });
                }
            });
        },
        getUserInfo: function(){
            var self = this;
            axios.get("/getUser").then(function(res){
                if(res.data.status){
                    self.userInfo = res.data.user;
                }
            });
        },
        handlePubSuccess: function(res, file) {
            this.pubData.cover = res.url;
        },
        handleAvatarSuccess: function(res, file) {
            this.userInfo.avatar = res.url;
        },
        beforeAvatarUpload: function(file) {
            var isJPG = file.type === 'image/jpeg' || file.type === 'image/png';
            var isLt2M = file.size / 1024 / 1024 < 2;

            if (!isJPG) {
                this.$message.error('上传头像图片只支持png和jpg格式图片!');
            }
            if (!isLt2M) {
                this.$message.error('上传头像图片大小不能超过 2MB!');
            }
            return isJPG && isLt2M;
        },
        updateUserInfo: function(){
            var self = this;
            var user = {
                id: this.userInfo._id,
                name: this.userInfo.name,
                job: this.userInfo.job,
                email: this.userInfo.email,
                QQ: this.userInfo.QQ
            };
            axios.post("/updateUser",user).then(function(res){
                if(!res.data.status) {
                    self.$message({
                        message: res.data.msg,
                        type: 'error'
                    });
                }
            });
        },
        pubContent: function() {
            var self = this;
            var pub = this.pubData;
            if (pub.title.trim() === ""){
                this.$message({
                    message: "标题不能为空",
                    type: 'error'
                });
                return;
            }
            if (pub.desc.trim() === "") {
                this.$message({
                    message: "描述不能为空",
                    type: 'error'
                });
                return;
            }
            pub.content = UE.getEditor('pub_editor').getContent().trim();
            axios.post("/artical", this.pubData).then(function(res){
                self.$message({
                    message: res.data.msg,
                    type: res.data.status?'success':'error'
                });
                self.pubData = {
                    title: "",
                    cover: "",
                    desc: "",
                    content: ""
                };
                UE.getEditor('pub_editor').setContent('');
            });
        }
    }
});