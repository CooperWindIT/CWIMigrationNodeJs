const express = require('express');
// const router = express.Router();
const nodemailer = require('nodemailer');
const { VMShandleRecord } = require('../utils/recordHandler.js');
const { OperationEnums } = require('../utils/VMSutilityEnum.js');
const exeQuery = require('../dataAccess/contractorRepository.js');
//const { callStoredProcedure } = require('../dataAccess/contractorRepository.js');
const { executeSP } = require('../utils/recordHandler.js');
const Notify = require('../utils/VMSNotifications.js');

const SqlDbContext = require('../dataContext/CWIDBContext');






//#region GET__SERVICES
const getAadharCheckIns = async (req, res) => {
    const data = req.query;
    VMShandleRecord(req, res, data, OperationEnums().AADHARCHECKINS);
};

const getContractors = async (req, res) => {
    const data = req.query;
    VMShandleRecord(req, res, data, OperationEnums().GETCONTRACT);
};

const getContractorQrPasses = async (req, res) => {
    const data = req.query;
    VMShandleRecord(req, res, data, OperationEnums().GETQRPASS);
};

const getShiftTimings = async (req, res) => {
    const data = req.query;
    VMShandleRecord(req, res, data, OperationEnums().GETSHFTTIMES);
};

const getCLSCountByContractorId = async (req, res) => {
    const data = req.query;
    VMShandleRecord(req, res, data, OperationEnums().GETCLS);
};

const getCLSById = async (req, res) => {
    const data = req.query;
    VMShandleRecord(req, res, data, OperationEnums().GetCLSById);
};

const ActiveLAbourCheckIns = async (req, res) => {
    const data = req.query;
    VMShandleRecord(req, res, data, OperationEnums().LBOURACTCHKINS);
};

const GetCheckInValidations = async (req, res) => {
    const data = req.query;
    VMShandleRecord(req, res, data, OperationEnums().GETCHECKINVAL);
};

const GetValidDay = async (req, res) => {
    const data = req.query;
    VMShandleRecord(req, res, data, OperationEnums().GETVALIDDAY);
};
//#end region

//#region POST__SERVICES 
const POSTContractors = async (req, res) => {
    const data = req.body;
    //console.log(data);
    VMShandleRecord(req, res, data, OperationEnums().CONTINSRT);
};

const UPDTContractors = async (req, res) => {
    const data = req.body;
    VMShandleRecord(req, res, data, OperationEnums().UPDTCONTRACT);
};

const DELTContractors = async (req, res) => {
    const data = req.body;
    VMShandleRecord(req, res, data, OperationEnums().DELTCONTRACT);
};

const InactiveCLDate = async (req, res) => {
    const data = req.body;
    VMShandleRecord(req, res, data, OperationEnums().DELTCLS);
};
//#end region


//#region PROCEDURES_POST
/**
 * Manage CL Count endpoint
 */
const ManageCLCount = (req, res) => executeSP(
    'SP_ManageCLCount',
    req,
    res,
    {
        OrgId: 'orgid',
        ContractorId: 'ContractorId',
        UserId: 'userid',
        CLCountData: 'CLCountData' // Handles JSON array automatically
    },
    (results) => {
        //console.log(results);
        res.status(200).json({success: true,data: results});
        // Only notify manager if operation was successful
        // if (results) {
        //     Notify.MailToManager(results.result);
        // }
    }
);

/**
 * Aadhar CheckIns endpoint
 */
const AadharCheckIns = (req, res) => {
    executeSP(
        'SP_AadharCheckIns',
        req,
        res,
        {
            ContractorId: 'ContractorId',
            AadharNo: 'AadharNo',
            OrgId: 'orgid',
            CreatedBy: 'userid'
        },
        
    (results) => {
        //console.log(results);
        res.status(200).json({success: true,data: results});
        // Only notify manager if operation was successful
        if (results?.result?.[0]?.Success === 1) {
            Notify.MailToManager(results.result);
        }
        
    }
    );
    //res.status(200).json({ data: recordset });
};

//#end Region ManageCLCount

//#region NotifyCLCount
const NotifyCLCount = (req, res) => {
    executeSP(
        'SP_NotifyCLCount',
        req,
        res,
        {
            UserId: 'UserId',
            OrgId: 'OrgId',
            ContractorId: 'ContractorId',
            CheckInDate: 'CheckInDate',
            IsRevised: 'IsRevised'
        },
        (results) => {
            //console.log(results);
            res.status(200).json({ success: true, data: results });
            //console.log(results.result[0].Success);
            // Notify manager if success flag is set
            if (results.result[0].Success== 1) {
                Notify.MailToManager(results.result);
            }
        }
    );
};
//#end region

// Export all functions
module.exports = {
    getAadharCheckIns,
    ManageCLCount,
    POSTContractors,
    UPDTContractors,
    getContractors,
    InactiveCLDate,
    getContractorQrPasses,
    getShiftTimings,
    getCLSCountByContractorId,
    getCLSById,
    ActiveLAbourCheckIns,
    GetCheckInValidations,
    GetValidDay,
    AadharCheckIns,
    NotifyCLCount,
    DELTContractors
};





