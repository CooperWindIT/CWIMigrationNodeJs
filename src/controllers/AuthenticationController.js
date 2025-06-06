const express = require('express');
// const router = express.Router();
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
    handleRecord(req, res, data, OperationEnums().GETCNTNTBYTYPE);
};







module.exports = {
    GetContentByTypes
}

// const POSTUsers = async (req, res) => {
//     const data = req.body;
//     handleRecord(req, res, data, OperationEnums().ADDUSER);
// });
