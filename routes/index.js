var express = require('express');
var db = require("../model/db.js");
var moment = require('moment');
var router = express.Router();
var md5 = require("../model/md5.js");
var ObjectID = require('mongodb').ObjectID; 

/* GET home page. */
router.get('/', function (req, res, next) {
  res.redirect("/index");
});
router.get('/index', function (req, res, next) {
  var user = req.session.user;
  if (user) {
    res.render('index', { title: 'Hello, I\'m Echi'});
  } else {
    res.render('login', { title: '欢迎登录' });
  }
});

// 获取用户信息
router.get("/getUser", function(req, res, next){
  var user = req.session.user;
  if (user && user._id !== "") {
    db.find("db_user", { _id: ObjectID(user._id) }, function (f_err, f_res) {
      if (f_err) throw f_err;
      res.send({
        status: 1,
        msg: "获取用户数据成功",
        user: f_res[0]
      });
    });
  }
});

router.post("/updateUser", function(req, res, next){
  var id = req.body.id;
  var updateUser = {
    job: req.body.job,
    email: req.body.email,
    QQ: req.body.QQ
  };
  db.updateMany("db_user", { _id: ObjectID(id) },
    { $set: updateUser }, function (u_err, u_res) {
      if (u_err) throw u_err;
      res.send({
        status: 1,
        msg: "更改成功"
      });
    });
});

// GET logout
router.get('/logout', function (req, res, next) {
  var user = req.session.user;
  db.updateMany("db_user", { _id: ObjectID(user.id)},
    { $set: { last_login_time: new Date() } }, function (u_err, u_res) {
      if (u_err) throw err;
    });
  req.session.user = null;
  res.redirect('/login');
});

/* GET login */
router.get('/login', function (req, res, next) {
  if (req.session.user) {
    res.redirect('/index');
  } else {
    res.render('login', { title: '欢迎登录' });
  }
});

/* POST login */
router.post('/login', function (req, res, next) {
  var userName = req.body.name;
  var password = req.body.password;
  if (userName === "") {
    res.send({
      status: 0,
      msg: "请输入用户名"
    });
    return false;
  }
  if (password === "") {
    res.send({
      status: 0,
      msg: "请输入密码"
    });
    return false;
  }
  var newUser = {
    name: userName,
    password: md5(password),
    email: "",
    QQ: "",
    desc: "",
    job: "",
    avatar: "",
    create_time: new Date(),
    last_login_time: new Date()
  };
  db.find("db_user", { name: userName }, function (f_err, f_res) {
    if (f_err) throw f_err;
    if (f_res.length) {
      if (f_res[0].password === newUser.password) {
        req.session.user = f_res[0];
        db.updateMany("db_user", { _id: f_res[0]._id}, 
          { $set: { last_login_time: new Date() } }, function (u_err, u_res){
          if(u_err) throw err;
        });
        res.send({
          status: 1,
          msg: "欢迎回来," + userName,
          url: "/index"
        });
      } else {
        res.send({
          status: 0,
          msg: "您的密码不正确"
        });
      }
    } else {
      db.insertOne("db_user", newUser, function (c_err, c_res) {
        if (c_err) throw c_err;
        req.session.user = c_res[0];
        res.send({
          status: 1,
          msg: "已经为您自动创建账户,即将登录",
          url: "/index"
        });
      });
    }
  });
});

router.get('/setting', function (req, res, next) {
  var user = req.session.user;
  if (user) {
    res.render('setting', { title: 'Hello, I\'m Echi'});
  } else {
    res.render('login', { title: '欢迎登录' });
  }
});

/* GET pub */
router.get('/pub', function (req, res, next) {
  var user = req.session.user;
  if (user) {
    res.render('pub', { title: 'Hello, I\'m Echi'});
  } else {
    res.render('login', { title: '欢迎登录' });
  }
});
/* POST pub artical */
router.post('/artical', function (req, res, next) {
  var user = req.session.user;
  var _body = req.body;
  if (_body.title === "") {
    res.send({
      status: 0,
      msg: "请输入文章标题"
    });
    return false;
  }
  if (_body.desc === "") {
    res.send({
      status: 0,
      msg: "请输入文章摘要"
    });
    return false;
  }
  var newArtical = {
    author: user.name,
    title: _body.title,
    cover: _body.cover,
    desc: _body.desc,
    content: _body.content,
    create_time: new Date(),
    modified_time: new Date()
  };
  if (user) {
    db.insertOne("db_artical", newArtical, function (u_err, u_res) {
      if (u_err) throw u_err;
    });
    res.send({
      status: 1,
      msg: "添加成功"
    });
  } else {
    res.render('login', { title: '欢迎登录' });
  }
});

/* GET setting */
router.get('/artical', function (req, res, next) {
  var user = req.session.user;
  if (user) {
    db.find("db_artical", { author: user.name}, function(f_err, f_res){
      if (f_err) throw f_err;
      f_res.forEach(function(ele){
        ele.time = moment(ele.create_time).format('YYYY-MM-DD hh:mm');
      });
      res.render('artical', { title: 'Hello, I\'m Echi', artical: f_res});
    });
  } else {
    res.render('login', { title: '欢迎登录' });
  }
});

module.exports = router;