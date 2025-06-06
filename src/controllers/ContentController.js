const express = require('express');
//const router = express.Router();
const { handleRecord } = require('../utils/recordHandler.js');
const { OperationEnums } = require('../utils/utilityEnum.js');
const SqlDbContext = require('../dataContext/CWIDBContext');




// Common response handler function
const handleRequest = async (req, res, serviceMethod) => {
    try {
        const Data = req.body || req.query;
        const result = await serviceMethod(Data);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const GetContentByTypes = async (req, res) => {
    const data = req.query;
    //console.log(data);
    handleRecord(req, res, data, OperationEnums().GETCNTNTBYTYPE);
};

const GetProducts = async (req, res) => {
    const data = req.query;
    handleRecord(req, res, data, OperationEnums().GETPRDTS);
};




module.exports = {
    GetContentByTypes,GetProducts
}




// const POSTUsers = async (req, res) => {
//     const data = req.body;
//     handleRecord(req, res, data, OperationEnums().ADDUSER);
// });



// const GetContentTypes = async (req, res) => {
//     const data = { OrgId: req.params.orgId };
//     handleRecord(req, res, data, OperationEnums().GETCONTENTTYPES);
// };


// const GetContents = async (req, res) => {
//     const data = {
//         OrgId: req.params.orgId,
//         ContentTypeId: req.params.contentTypeId
//     };
//     handleRecord(req, res, data, OperationEnums().GETCONTENTS);
// };
