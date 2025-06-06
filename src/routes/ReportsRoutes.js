const express = require('express');
const router = express.Router();
const axios = require('axios');
const { VMShandleRecord } = require('../utils/recordHandler.js');
const { OperationEnums } = require('../utils/VMSutilityEnum.js');
//const { headertoRptHeader } = require('../helpers/utilityFunctions.js');
//const dbUtility = require('../helpers/dbUtility');
const VMSDBContext = require('../dataContext/VMSDBContext');

// Middleware
router.use(express.json());

//#region Helper: Execute Report Stored Procedure
const executeReport = (rptJson, callback) => {
    if (!rptJson) {
        return callback(new Error('Report parameters are undefined.'));
    }

    const { OrgId, UserId, ReportId, ReportCriteria } = rptJson;
    const safeCriteria = JSON.stringify(ReportCriteria || {}).replace(/'/g, "''");

    const sqlQuery = `
        EXEC [dbo].[Sp_GenerateReport]
        @OrgId = '${OrgId}',
        @Userid = '${UserId}',
        @ReportId = '${ReportId}',
        @ReportCritieria = N'${safeCriteria}'
    `;

    console.log('Executing SQL Query:\n', sqlQuery);

    VMSDBContext.executeForMultipleDS(sqlQuery)
        .then(results => callback(null, results))
        .catch(callback);
};
function headertoRptHeader(jsondata)
{
    const headerinfo = jsondata.map(row => Object.values(row));
    const columnHeaderString = headerinfo[0][0];
    // Split the string into an array of values
    const headers = columnHeaderString.split(',');
    console.log(headers);
    return headers;
}
//#endregion

//#region Route: Get Report Header
router.get('/getreporthead', (req, res) => {
    const { OrgId, UserId, ReportId } = req.query;

    if (!OrgId || !UserId || !ReportId) {
        return res.status(400).json({ error: 'Missing required query parameters' });
    }

    const data = { OrgId, UserId, ReportId };
    VMShandleRecord(req, res, data, OperationEnums().GETREPORTHEAD);
});
//#endregion

//#region Route: Generate Report
router.post('/getreport', (req, res) => {
    const reportBody = req.body;

    executeReport(reportBody, (error, results) => {
        if (error) {
            console.error('Report generation error:', error);
            return res.status(400).json({ error: error.message });
        }

        try {
            results.headers = headertoRptHeader(results.headers);
            res.status(200).json(results);
        } catch (parseError) {
            console.error('Header parsing error:', parseError);
            res.status(500).json({ error: 'Failed to process report headers' });
        }
    });
});
//#endregion

module.exports = router;
