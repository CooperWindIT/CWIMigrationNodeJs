const express = require('express');


const ContractorController = require('../controllers/ContractorController');

const router = express.Router();

//#region COntractor MODULE POST
router.post('/ManageCLCount', ContractorController.ManageCLCount);
router.post('/POSTContractors', ContractorController.POSTContractors);
router.post('/UPDTContractors', ContractorController.UPDTContractors);
router.post('/InactiveCLDate', ContractorController.InactiveCLDate);
router.post('/AadharCheckIns', ContractorController.AadharCheckIns);
router.post('/NotifyCLCount', ContractorController.NotifyCLCount);
router.post('/InactiveContractors', ContractorController.DELTContractors);
//#end Region

//#region COntractor MODULE GET
router.get('/getContractorQrPasses', ContractorController.getContractorQrPasses);
router.get('/getShiftTimings', ContractorController. getShiftTimings);
router.get('/getCLSCountByContractorId', ContractorController.getCLSCountByContractorId);
router.get('/getCLSById', ContractorController.getCLSById);
router.get('/ActiveLAbourCheckIns', ContractorController.ActiveLAbourCheckIns);
router.get('/GetCheckInValidations', ContractorController.GetCheckInValidations);
router.get('/GetValidDay', ContractorController.GetValidDay);
router.get('/getContractors', ContractorController.getContractors);
router.get('/getAadharCheckIns', ContractorController.getAadharCheckIns);
//#end Region






module.exports = router;


