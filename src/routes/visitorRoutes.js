const express = require('express');
const visitorController = require('../controllers/visitorController');

const router = express.Router();
const multer = require('multer');
const nodemailer = require('nodemailer');
const { handleRecord } = require('../utils/recordHandler.js');
//const { OperationEnums } = require('../helpers/utilityEnum.js');
const Notify = require('../utils/VMSNotifications.js');

const dbContext = require('../dataContext/VMSDBContext');
const COntentController = require('../controllers/ContentController');


const upload = multer({ dest: 'uploads/' }); 

//#region VISITORS MODULE POST
router.post('/ManageVisitorsPass', visitorController.ManageVisitorsPass);
router.get('/SendVisitorsPass', visitorController.SendVisitorsPass);
router.post('/getReqPasswithFilters', visitorController.getReqPasswithFilters);
router.post('/AttendeInActive', visitorController.AttendeInActive);
router.post('/QRCheckInCheckOut', visitorController.QRCheckInCheckOut);
router.post('/CancelVisit', visitorController.CancelVisit);

//#region VISITORS MODULE GET
router.get('/getDepts', visitorController.getDepts);
router.get('/getReqPass', visitorController.getReqPass);
router.get('/getReqPassById', visitorController.getReqPassByIds);
router.get('/PassApproval', visitorController.PassApproval);
router.get('/RejectPass', visitorController.RejectPass);
router.get('/VisitorTypesByOrgId', visitorController.GetVisitorTypes);
router.get('/MailPassApproval', visitorController.MailPassApproval);
router.get('/MailRejectPass', visitorController.MailRejectPass);
router.get('/getManagers', visitorController.getManagers);
router.get('/ActiveVisitorCheckIns', visitorController.ActiveVisitorCheckIns);
router.get('/ActiveVisitorCheckOuts', visitorController.ActiveVisitorCheckOuts);
router.get('/TodayVisits', visitorController.TodayVisits);
router.get('/GetContentByType', COntentController.GetContentByTypes);
router.get('/daily-checkins-summary', visitorController.SendDailyCheckinsSummary);
//end region

//#region MOMSUBMIT
router.post('/MOMSubmitwithAttachment', upload.single('Attachment'), async (req, res) => {
    const { MOM, RequestId, UpdatedBy } = req.body;
    const file = req.file;
    //console.log(file);
    if (!MOM || !RequestId || !UpdatedBy) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        // Step 1: Update MOM in VisitorsPass table
        const updateMOMQuery = `
            UPDATE dbo.VisitorsPass 
            SET MOM = '${MOM}', 
                Status = 'COMPLETED', 
                UpdatedBy = '${UpdatedBy}', 
                UpdatedOn = dbo.GetISTTime()
            WHERE RequestId = '${RequestId}';
        `;
        await dbContext.executeQueryrowsAffected(updateMOMQuery);
        res.status(200).json({ message: 'MOM submitted.', Status: true });
        // Step 2: Get all visitors under this RequestId
        const GetPassQuery = `SELECT * FROM dbo.VisitorsDetails WHERE RequestId = '${RequestId}'`;
        const visitors = await dbContext.executeQuery1(GetPassQuery);

        // Step 3: Loop through all visitors and send email to each
        for (const visitor of visitors) {
            if (visitor.Email) {
                const emailData = {
                    FromEmail: 'yaswanthpg9@gmail.com',
                    ToEmail: visitor.Email,
                    CC: '', // Optional
                    Subject: `MOM Submission`,
                    Text: `MOM has been submitted.`,
                    Html: `
                        <p>Hello ${visitor.Name || ''},</p>
                        <p>The following MOM has been submitted:</p>
                        <p>${MOM}</p>
                        <p>Regards,<br>CWI Team</p>
                    `,
                    Attachments: [],
                };

                if (file) {
                  
                    emailData.Attachments.push({
                        filename: file.originalname,
                        path: file.path
                    });
                }

                await Notify.MomSubmit(emailData); // Send mail to each visitor
            }
        }
    } catch (error) {
        console.error('Error in /MOMSubmitwithAttachment:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
//end region

module.exports = router;
