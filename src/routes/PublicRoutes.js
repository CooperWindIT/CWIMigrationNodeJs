const express = require('express');

const cwifileUploadApi = require('../controllers/CWIUploadController');
const CWIController = require('../controllers/CWIController');

const router = express.Router();

//#region Organization

router.post('/SignIn', cwifileUploadApi.SignIn);
router.get('/SendEmailQueues', CWIController.SendEmailQueues);
router.get('/SendDailyCheckinSummary', CWIController.SendDailyCheckinsSummary);
router.get('/PendingCheckOuts', CWIController.PendingCheckOuts);

// router.post('/EditMachines', cwifileUploadApi.EditMachines);

//#end region Organization


module.exports = router;