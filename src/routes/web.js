import express from "express";
// import passport from "passport";
import homeController from '../controller/homeController';
const session = require('express-session');
const passport = require('passport');
const passportfb = require('passport-facebook').Strategy;
let router = express.Router();

const initWebRouter = (app) => {
    app.use(session({
        resave: true, 
        saveUninitialized: true, 
        secret: 'somesecret', 
        cookie: { maxAge: 60000 }}));
    router.get('/', homeController.getHomePage);
    router.get('/home', homeController.getHomePage);
    router.get('/edit-profile', homeController.getEditProfile);
    router.post('/home-data', homeController.postHomeData);
    router.get('/controll-panel', homeController.getControllPanelPage);
    router.post('/delete-status', homeController.postDeleteStatus);
    router.post('/delete-user', homeController.postDeleteUser);
    router.post('/edit-user', homeController.editUser);
    router.get('/user', homeController.users);
    router.get('/user-management', homeController.userManagement);
    router.get('/sign-in', homeController.showSigninForm);
    router.get('/sign-up', homeController.showRegisterForm);
    router.post('/login', homeController.signin);
    router.post('/register', homeController.register);
    router.post('/add-user', homeController.addUser);
    router.get('/add-profile', homeController.getAddProfile);
    router.get('/user-api', homeController.postAPI);
    router.get('/export-csv', homeController.exportCSV);
    router.post('/exportuser-csv', homeController.exportUserCSV);
    return app.use('/', router);
}
export default initWebRouter;