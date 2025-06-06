const express = require('express');
const router = express.Router();
const UserAccessController = require('../controllers/UserAccessController');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

//#region Departments
router.get('/getDepts', UserAccessController.getDepartments);
//#endregion

//#region Menu
router.get('/UserPermissions', UserAccessController.getUserPermissions);
router.get('/getmenu', UserAccessController.getMenu);
router.post('/InactiveRoleMenu', UserAccessController.inactiveRoleMenu);
//#endregion

//#region Authentication
router.get('/SignIn', UserAccessController.signIn);
router.post('/LogOut', UserAccessController.logOut);
router.post('/ChangePassword', UserAccessController.changePassword);
router.post('/ForgotPassword', UserAccessController.ForgotPassword);
router.post('/ConfirmOTP', UserAccessController.ConfirmOTP);
//#endregion

//#region Users
router.post('/POSTUsers', UserAccessController.addUser);
router.post('/UPDTUsers', UserAccessController.updateUser);
router.get('/getUsers', UserAccessController.getUsers);
router.post('/UsersInActive', UserAccessController.inactiveUser);
//#endregion

//#region Roles
router.get('/getRoles', UserAccessController.getRoles);
//#endregion

//#region Dashboard
router.get('/VMSDashboard', UserAccessController.getVMSDashboard);
//#endregion

module.exports = router;
