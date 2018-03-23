var express = require('express');
var db = require("../model/db.js");
var router = express.Router();
var formidable = require('formidable'),
    fs = require('fs'),
    AVATAR_UPLOAD_FOLDER = '/images/upload/';

/* 图片上传路由 */
router.post('/uploader', function (req, res) {
    var query = req.query;
    var form = new formidable.IncomingForm();   //创建上传表单
    form.encoding = 'utf-8';        //设置编辑
    form.uploadDir = 'public' + AVATAR_UPLOAD_FOLDER;     //设置上传目录
    form.keepExtensions = true;     //保留后缀
    form.maxFieldsSize = 2 * 1024 * 1024;   //文件大小
    form.parse(req, function (err, fields, files) {
        if (err) {
            res.locals.error = err;
            res.json({
                status: 0,
                msg: "图片上传出错"
            });
            return;
        }
        var extName = '';  //后缀名
        switch (files.up_img.type) {
            case 'image/pjpeg':
                extName = 'jpg';
                break;
            case 'image/jpeg':
                extName = 'jpg';
                break;
            case 'image/png':
                extName = 'png';
                break;
            case 'image/x-png':
                extName = 'png';
                break;
        }

        if (extName.length == 0) {
            res.locals.error = '只支持png和jpg格式图片';
            res.json({
                status: 0,
                msg: "只支持png和jpg格式图片"
            });
            return;
        }

        var avatarName = Math.random() + '.' + extName;
        //图片写入地址；
        var newPath = form.uploadDir + avatarName;
        //显示地址；
        if (query && query.type === "avatat"){
            var findName = { name: req.session.user.name };
            var setUrl = { $set: { avatar: AVATAR_UPLOAD_FOLDER + avatarName } };
            db.updateMany("db_user", findName, setUrl, function (u_err, u_res) {
                if (u_err) throw err;
            });
        }
        fs.renameSync(files.up_img.path, newPath);  //重命名
        res.json({
            status: 1,
            msg: "图片上传成功",
            url: AVATAR_UPLOAD_FOLDER + avatarName
        });
    });
});

module.exports = router;
