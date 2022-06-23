import pool from '../configs/connectDB';
const csv = require('fast-csv');
const multer = require('multer')
var path = require('path');
var bodyParser = require('body-parser');
var Json2csvParser = require('json2csv').Parser;
const fs = require('fs');

const passport = require('passport');
const passportfb = require('passport-facebook').Strategy;

const getHomePage = async (req, res) => {
    const [rows, fields] = await pool.execute('SELECT * FROM `trangthai` ORDER BY `timestatus` DESC');
    // const [count, fields] = await pool.execute('SELECT COUNT(*) AS `count` FROM `trangthai` WHERE status = "open" UNION SELECT COUNT(*) AS `countclose` FROM `trangthai` WHERE status = "close" UNION SELECT COUNT(*) AS `counterror` FROM `trangthai` WHERE status = "error"');
    if (req.session.daDangNhap) {
        // console.log(req.session.fullname);
        return res.render('index.ejs', { data: rows });
    }
    else {       
        res.redirect("/sign-in");
    }
}

const getEditProfile = async (req, res) => {
    const [rows, fields] = await pool.execute(`SELECT * FROM user WHERE username = '${req.session.username}'`);
        return res.render('edit-profile.ejs', { data: rows });
}

const getAddProfile = async (req, res) => {
    return res.render('add-user.ejs');
}

const getControllPanelPage = async (req, res) => {
    var sess = req.session;
    const [rows, fields] = await pool.execute('SELECT * FROM `trangthai` ORDER BY `timestatus` DESC');
    const [rows1 ,fields1] = await pool.execute(`SELECT * FROM user WHERE username ='${req.session.username}'`);
    if (req.session.daDangNhap){
        console.log(req.session);
        // console.log(rows1);
        return res.render('controllPanel.ejs',{ data: rows, data1: rows1 });
    }
    else {       
        res.redirect("/sign-in");
    }
}

const postDeleteStatus = async (req, res) => {
    // console.log("Check request: ", req.body);
    await pool.execute(`DELETE FROM trangthai WHERE id = ${req.body.statusId}`)
    return res.redirect('/controll-panel');
}

const postDeleteUser = async (req, res) => {
    // console.log("Check request: ", req.body);
    await pool.execute(`DELETE FROM user WHERE id = ${req.body.userId}`)
    return res.redirect('/user-management');
}

const editUser = async (req, res) => {
    if (req.session.daDangNhap){
        await pool.execute(`UPDATE user SET username = '${req.body.username}',tendaydu = '${req.body.fullname}',password='${req.body.password}' WHERE username = '${req.session.username}'`)
        return res.redirect('/sign-in');
    }
    else {       
        res.redirect("/sign-in");
    }
}

const addUser = async (req, res) => {
    if (req.session.daDangNhap){
        await pool.execute(`INSERT INTO user (username,password,tendaydu,email) VALUES ('${req.body.username}','${req.body.password}','${req.body.fullname}','${req.body.email}')`)
        return res.redirect('/user-management');
    }
    else {       
        res.redirect("/sign-in");
    }
}

const users = async (req, res) => {
    if (req.session.daDangNhap){
        const [rows, fields] = await pool.execute(`SELECT * FROM user WHERE username = '${req.session.username}'`);
        return res.render('users.ejs', { data: rows });
    }
    else {       
        res.redirect("/sign-in");
    }
}

const userManagement = async (req, res) => {
    const [rows, fields] = await pool.execute(`SELECT * FROM user`);
    if (req.session.username == 'admin'){
        return res.render('user-management.ejs', { data: rows });
    }else{
        res.redirect("/user");
    }
 
}

const postHomeData = async (req, res) => {
    // console.log("Check request: ", req.body);
    const [rows, fields] = await pool.execute(`SELECT * FROM trangthai WHERE timestatus BETWEEN '${req.body.date_start}' AND DATE_ADD('${req.body.date_end}', INTERVAL 1 DAY)`);
    const [rows1 ,fields1] = await pool.execute(`SELECT * FROM user WHERE username ='${req.session.username}'`);
    if (req.session.daDangNhap){
        return res.render('homedata.ejs', { data: rows, data1: rows1 });
    }else {       
        res.redirect("/sign-in");
    }
}

const showSigninForm = async (req, res) => {
    res.render('signin.ejs');
}
const signin = async (req, res) => {
    const [rows, fields]  = await pool.execute(`SELECT * FROM user`);
    // console.log(rows);
    var sess = req.session;
    for(let i=0; i<rows.length; i++){
        if(req.body.username == rows[i].username && req.body.password == rows[i].password){
            sess.daDangNhap = true;
            // sess.id = rows[i].id;
            sess.username = rows[i].username;  
            sess.password = rows[i].password;
            sess.fullname = rows[i].tendaydu;
        }
    }
    if (sess.daDangNhap){
        return res.redirect('/controll-panel');
    }
    else{
        return res.redirect('/sign-in'); 
    }
}

const showRegisterForm = async (req, res) => {
    res.render('register.ejs');
}
const register = async (req, res) => {
    await pool.execute(`INSERT INTO user (username,password,tendaydu) VALUES ('${req.body.username}','${req.body.password}','${req.body.fullname}')`);
    return res.redirect('/sign-in');
}
const postAPI = async(req,res) => {
    console.log(req.session.passport.user._json);
    var sess = req.session.passport.user._json;
    req.session.daDangNhap = true;
    req.session.username = sess.name;  
    req.session.password = 1;
    req.session.fullname = sess.name;
    const [rows, fields] = await pool.execute(`SELECT * FROM user WHERE username = '${req.session.username}'`);
    return res.render('users.ejs', { data: rows });
}
const exportCSV = async(req,res) => {
    const [rows, fields] = await pool.execute("SELECT * FROM user") 
    const jsonUsers = JSON.parse(JSON.stringify(rows));
    console.log(jsonUsers);
    // -> Convert JSON to CSV data
    const csvFields = ['id', 'username', 'email', 'tendaydu', 'age', 'gender'];
    const json2csvParser = new Json2csvParser({ csvFields });
    const csv = json2csvParser.parse(jsonUsers);
    
    console.log(csv);
    
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment; filename=data.csv");
    
        res.status(200).end(csv);
    // -> Check 'customer.csv' file in root project folder
      
}

const exportUserCSV = async(req,res) => {
    const [rows, fields] = await pool.execute(`SELECT * FROM user WHERE id = ${req.body.userId}`) 
    const jsonUsers = JSON.parse(JSON.stringify(rows));
    console.log(jsonUsers);
    // -> Convert JSON to CSV data
    const csvFields = ['id', 'username', 'email', 'tendaydu', 'age', 'gender'];
    const json2csvParser = new Json2csvParser({ csvFields });
    const csv = json2csvParser.parse(jsonUsers);
    
    console.log(csv);
    
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment; filename='user.csv");
    
        res.status(200).end(csv);
    // -> Check 'customer.csv' file in root project folder
      
}
module.exports = {
    getHomePage,
    postHomeData,
    getControllPanelPage,
    postDeleteStatus,
    showSigninForm,
    signin,
    showRegisterForm,
    register,
    users,
    editUser,
    getEditProfile,
    userManagement,
    postDeleteUser,
    addUser,
    getAddProfile,postAPI,
    exportCSV,
    exportUserCSV
}