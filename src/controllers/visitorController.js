const express = require('express');
// const router = express.Router();
const nodemailer = require('nodemailer');
const { VMShandleRecord } = require('../utils/recordHandler.js');
const { OperationEnums } = require('../utils/VMSutilityEnum.js');
const { executeSP } = require('../utils/recordHandler.js');
const Notify = require('../utils/VMSNotifications.js');
const VMSDBContext = require('../dataContext/VMSDBContext');
const exeQuery = require('../dataAccess/VisitorQuery.js');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); 
const dbContext = require('../dataContext/VMSDBContext');
const { log } = require('winston');


//#region GET__SERVICES
const ActiveVisitorCheckIns= (req, res) => {
    const data = req.query; 
    VMShandleRecord(req, res, data, OperationEnums().VISITACTCHKINS);
};

const ActiveVisitorCheckOuts= (req, res) => {
    const data = req.query; 
    VMShandleRecord(req, res, data, OperationEnums().VISITACTCHKOUTS);
};

const TodayVisits= (req, res) => {
    const data = req.query; 
    VMShandleRecord(req, res, data, OperationEnums().TODAYVISITS);
};

const getManagers= (req, res) => {
    const data = req.query; 
    VMShandleRecord(req, res, data, OperationEnums().GETMANAGER);
};

const getReqPassByIds= (req, res) => {
    const data = req.query; 
    //console.log('HI');
    //console.log(data);
    VMShandleRecord(req, res, data, OperationEnums().GETREQPASSBYID);
};

const getReqPass= (req, res) => {
    const data = req.query; 
    VMShandleRecord(req, res, data, OperationEnums().GETREQPASS);
};

const getDepts= (req, res) => {
    const data = req.query; 
    VMShandleRecord(req, res, data, OperationEnums().GETDEPT);
};

const GetVisitorTypes= (req, res) => {
    const data = req.query; 
    VMShandleRecord(req, res, data, OperationEnums().GETVISITTYPES);
};

const getReqPasswithFilters = async (req, res) => {
    try {
        // Destructuring parameters from the request body
        const { OrgId, FromDate, ToDate, VisitorType, Status, AutoIncNo, UserId, RoleId } = req.body;

           const updateQuery = `
            UPDATE dbo.VisitorsPass
SET IsActive = 0
WHERE Status = 'APPROVED'
  AND CAST(MeetingDate AS DATE) < CAST(dbo.GetISTTime() AS DATE) AND OrgId=${OrgId};
        `;
        //console.log(updateQuery);
        
        await  dbContext.executeQuery1(updateQuery);
        // Validate OrgId
        if (!OrgId) {
            return res.status(400).json({ message: 'OrgId is required', Status: false });
        }

    
        let query = `
           SELECT 
    VP.RequestId,  
    VP.RequestDate, 
    CAST(VP.MeetingDate AS DATE) AS MeetingDate,
    ExpiryDate,
    VP.MeetingTime,
    VT.Id AS VisitorType,
    TypeName AS VisitorTypeName, 
    VP.Status, 
    VP.AutoIncNo,  
    VP.Remarks, 
    US.Name AS EmployeeName, 
    MGR.Name AS ManagerName
FROM 
    dbo.VisitorsPass VP
INNER JOIN 
    dbo.Users US ON US.Id = VP.CreatedBy
INNER JOIN dbo.VisitorTypes VT ON VT.Id = VP.VisitorType
LEFT JOIN 
    dbo.Users MGR ON MGR.Id = US.ManagerId 

            WHERE VP.OrgId = ${OrgId} 
            AND VP.IsActive = 1`;

        // Role-based filtering
        if (RoleId === 4) { // Security
            query += ` AND Status IN ('APPROVED','CHECKIN')  AND MeetingDate = CAST(GETDATE() AS DATE)`;
        } else if (RoleId === 2) { // HR
            query += ` AND Status IN ('REJECTED', 'DRAFT')`;
        } else if (RoleId === 3) { // Employee
            query += ` AND VP.CreatedBy = ${UserId}`;
        }

        // Adding optional filters dynamically
        if (FromDate != 0) {
            query += ` AND CAST(MeetingDate AS DATE) BETWEEN '${FromDate}' AND '${ToDate}'`;
        }
        if (VisitorType != 0) {
            query += ` AND VT.Id = ${VisitorType}`;
        }
        if (Status != 0) {
            query += ` AND Status = '${Status}'`;
        }
        if (AutoIncNo != 0) {
            query += ` AND AutoIncNo = '${AutoIncNo}'`;
        }

        // Append ORDER BY clause
        query += ` ORDER BY RequestId DESC`;

        // Debugging: log the constructed query
        //console.log('Generated Query:', query);

        // Execute query using the constructed query string
        const results = await  dbContext.executeQuery1(query);
        // Send response
        if (results) {
            return res.status(200).json(results);
        } else {
            return res.status(404).json({ message: 'No records found', Status: false });
        }
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ message: 'Error fetching data', Status: false });
    }
};

const SendDailyCheckinsSummary = (req, res) => {
  // Copy query parameters to req.body.query for consistency
  req.body = {
    query: {
      OrgId: req.query.OrgId
    }
  };

  // Validate required parameter
  if (!req.body.query.OrgId) {
    return res.status(400).json({ error: 'OrgId query parameter is required' });
  }

  executeSP(
    'SP_GetDailyCheckinSummary', // stored procedure name
    req,
    res,
    {
      OrgId: 'query.OrgId'  // mapping req.body.query.OrgId to stored procedure parameter @OrgId
    },
    
    async (results) => {
      res.status(200).json({ message: 'Daily check-in summary processed', status: true }); 
      if (results) {
        
        await Notify.OTPmail(results.result);
        console.log('Email sent with daily check-in summary for OrgId:', req.body.query.OrgId);
      }
    }
    
  );
};

//#end region


//#region POST__SERVICES

const AttendeInActive = (req, res) => {
    const data = req.body; 
    VMShandleRecord(req, res, data, OperationEnums().ADETAIL);
};

// const PassCheckIn = (req, res)=>{
//     const data = req.body;
//     VMShandleRecord(req, res, data, OperationEnums().PASSCHECKIN);
// };

// const PassCheckOut = (req, res)=>{
//     const data = req.body;
//     VMShandleRecord(req, res, data, OperationEnums().PASSCHECKOUT);
// };


const ManageVisitorsPass = (req, res) => executeSP(
    'sp_ManageVisitorsPass',
    req,
    res,
    {
        orgid: 'orgid',
        userid: 'userid',
        Operation: 'Operation',
        RequestPass: 'RequestPass',
        Visitors: 'Attendees'
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

const SendVisitorsPass = (req, res) => {
    // Copy query parameters to req.body temporarily
    req.body = {
        query: {
            RequestId: req.query.RequestId,
            OrgId: req.query.OrgId,
            UserId: req.query.UserId,
            VisitorId: req.query.VisitorId
        }
    };

    // Validate required parameters
    if (!req.body.query.RequestId || !req.body.query.OrgId || !req.body.query.UserId || !req.body.query.VisitorId) {
        return res.status(400).json({ error: 'Missing required query parameters' });
    }

    executeSP(
        'SP_GetNotificationDetails',
        req,
        res,
        {
            RequestId: 'query.RequestId',
            OrgId: 'query.OrgId',
            UserId: 'query.UserId',
            VisitorId: 'query.VisitorId'
        },
        async (results) => {
            //console.log('Notification Details:', results);
            res.status(200).json({success: true,data: results});
            try {
                if (results?.result?.length > 0) {
                    const matchedVisitor = results.result.find(r => 
                        String(r.VisitorId) === String(req.query.VisitorId)
                    );
                    //console.log(matchedVisitor);
                    if (matchedVisitor) {
                        
                        await Notify.MailToVisitors(matchedVisitor);
                        console.log('Email sent to visitor:', req.query.VisitorId);
                    } else {
                        console.log('No matching visitor found for VisitorId:', req.query.VisitorId);
                    }
                }
            } catch (mailError) {
                console.error('Error sending email:', mailError);
            }
        }
    );
};
// const CancelVisit = async (req, res) => {
//     try {
//         const { RequestId, UpdatedBy } = req.body;
//         const data = req.body;
//         // First update the status
//         const updateQuery = `
//             UPDATE dbo.VisitorsPass SET Status = 'CANCELED', 
//         UpdatedBy = '${UpdatedBy}', UpdatedOn = dbo.GetISTTime() WHERE RequestId = '${RequestId}';
//         `;
//         console.log(updateQuery);
//         const rowsAffected = await VMSDBContext.executeQuery1(updateQuery);
//         console.log(rowsAffected);
        
//         if (rowsAffected > 0) {
    
//     exeQuery.GetCancelNotify(data, (error, results) => {
//             if (error) {
//                 return res.status(500).json({ error: error.message });
//             }
//             console.log(results);
//             //res.status(200).send(results);
//             res.status(200).json({ message: 'Status Updated', Status: true });
//             if (results && results.length > 0) {
//                 Notify.CancelMailToVisitors(results);
//             }

          
//         });
//    }
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

const CancelVisit = async (req, res) => {
    try {
        const { RequestId, UpdatedBy } = req.body;
        
        // Validate required fields
        if (!RequestId || !UpdatedBy) {
            return res.status(400).json({ error: 'RequestId and UpdatedBy are required' });
        }

               const updateQuery = `
            UPDATE dbo.VisitorsPass SET Status = 'CANCELED', 
        UpdatedBy = '${UpdatedBy}', UpdatedOn = dbo.GetISTTime() WHERE RequestId = '${RequestId}';
        `;
        //console.log(updateQuery);
        const result = await VMSDBContext.executeQueryrowsAffected(updateQuery);
        //console.log(result);
        const rowsAffected = result?.[0] || 0;

        
        //console.log('Rows affected:', rowsAffected);
        
        if (rowsAffected > 0) {
            // Convert callback to promise for better error handling
            exeQuery.GetCancelNotify(req.body, (error, results) => {
            if (error) {
                return res.status(500).json({ error: error.message });
            }
            //console.log(results);
            //res.status(200).send(results);
            res.status(200).json({ message: 'Status Updated', Status: true });
            if (results) {
                //console.log('HI');
                Notify.CancelOrRejectMail(results);
            }

          
        });
            
        } else {
            return res.status(404).json({ 
                message: 'No records updated - RequestId not found', 
                Status: false 
            });
        }
    } catch (error) {
        console.error('CancelVisit error:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            details: error.message,
            Status: false
        });
    }
};

// Shared setup function
const setupNotificationRequest = (req) => {
    req.body = {
        query: {
            RequestId: req.query.RequestId,
            OrgId: req.query.OrgId,
            UserId: req.query.UserId,
            VisitorId: 0  // hardcoded value
        }
    };
};

const PassApproval = (req, res) => {
    setupNotificationRequest(req);

    executeSP(
        'SP_GetNotificationDetails',
        req,
        res,
        {
            RequestId: 'query.RequestId',
            OrgId: 'query.OrgId',
            UserId: 'query.UserId',
            VisitorId: 'query.VisitorId'
        },
        async (results, spError) => {
            if (spError) {
                console.error('SP Error:', spError);
                return res.status(500).json({ error: 'Failed to process approval' });
            }

            try {
                // Process emails if results exist
                //console.log(results);
                if (results) {
                       // Send success response after everything completes
                res.status(200).json({ 
                    message: 'Status Approved', 
                    Status: true,
                    emailsSent: results
                });
                    await Promise.all(results.result.map(result => Notify.MailToVisitors(result)));
                    console.log('Emails sent successfully');
                }

             
            } catch (mailError) {
                console.error('Email Error:', mailError);
                res.status(200).json({ 
                    message: 'Approved but email sending failed',
                    Status: true,
                    warning: 'Emails not sent'
                });
            }
        }
    );
};

// const MailPassApproval = (req, res) => {
//     setupNotificationRequest(req);

//     executeSP(
//         'SP_GetNotificationDetails',
//         req,
//         res,
//         {
//             RequestId: 'query.RequestId',
//             OrgId: 'query.OrgId',
//             UserId: 'query.UserId',
//             VisitorId: 'query.VisitorId'
//         },
//         async (results, spError) => {
//             let emailSuccess = false;
            
//             if (spError) {
//                 console.error('SP Error:', spError);
//                 return res.status(500).send(`
//                     <html>
//                       <body style="font-family: Arial; padding: 20px; text-align: center;">
//                         <h2 style="color: red;">Approval Processing Failed</h2>
//                         <p>Please try again or contact support.</p>
//                       </body>
//                     </html>
//                 `);
//             }

//             try {
//                 if (results) {
//                     console.log(results);
//                     await Promise.all(results.result.map(result => Notify.MailToVisitors(result)));
//                     console.log('Emails sent successfully');
//                     emailSuccess = true;
//                 }
//             } catch (mailError) {
//                 console.error('Mail Error:', mailError);
//             }

//             const htmlResponse = emailSuccess 
//                 ? `<h2>Pass Approved Successfully</h2><p>Notification emails sent.</p>`
//                 : `<h2>Pass Approved</h2><p style="color: orange;">Emails not sent.</p>`;

//             res.send(`
//                 <html>
//                   <body style="font-family: Arial; padding: 20px; text-align: center;">
//                     ${htmlResponse}
//                     <p>You can now close this tab.</p>
//                   </body>
//                 </html>
//             `);
//         }
//     );
// };


const MailPassApproval = (req, res) => {
    setupNotificationRequest(req);

    executeSP(
        'SP_GetNotificationDetails',
        req,
        res,
        {
            RequestId: 'query.RequestId',
            OrgId: 'query.OrgId',
            UserId: 'query.UserId',
            VisitorId: 'query.VisitorId'
        },
        async (results, spError) => {
            if (spError) {
                console.error('SP Error:', spError);
                return res.status(500).send(`
                    <html>
                      <body style="font-family: Arial; padding: 20px; text-align: center;">
                        <h2 style="color: red;">Approval Processing Failed</h2>
                        <p>Please try again or contact CWI IT Team.</p>
                      </body>
                    </html>
                `);
            }

            try {
                // Check if result contains only status message
              const firstItem = results.result?.[0]; // Accessing first item safely

//console.log(results);

if (firstItem?.Message) {
    return res.send(`
        <html>
          <body style="font-family: Arial; padding: 20px; text-align: center;">
            <h2 style="color: orange;">Approval Not Processed</h2>
            <p>${firstItem.Message}</p>
            <p>You can now close this tab.</p>
          </body>
        </html>
    `);
}



                // Proceed to send emails
                await Promise.all(results.result.map(result => Notify.MailToVisitors(result)));
                //console.log('Emails sent successfully');

                res.send(`
                    <html>
                      <body style="font-family: Arial; padding: 20px; text-align: center;">
                        <h2>Pass Approved Successfully</h2>
                        <p>Notification emails sent.</p>
                        <p>You can now close this tab.</p>
                      </body>
                    </html>
                `);

            } catch (mailError) {
                console.error('Mail Error:', mailError);
                res.send(`
                    <html>
                      <body style="font-family: Arial; padding: 20px; text-align: center;">
                        <h2>Pass Approved</h2>
                        <p style="color: orange;">Emails not sent.</p>
                        <p>You can now close this tab.</p>
                      </body>
                    </html>
                `);
            }
        }
    );
};

const MailRejectPass = async (req, res) => {
    try {
        const { RequestId, UpdatedBy } = req.query;

        // 1. Update the VisitorsPass status to 'REJECTED'
        const updateQuery = `
            UPDATE dbo.VisitorsPass 
            SET Status = 'REJECTED', 
                UpdatedBy = '${UpdatedBy}', 
                UpdatedOn = dbo.GetISTTime() 
            WHERE RequestId = '${RequestId}';
        `;
       
        await VMSDBContext.executeQuery1(updateQuery);
        //console.log(updateQuery);
        // 2. Send notification email after rejection
        exeQuery.GetRejectPassNotify(req.query, (error, results) => {
            if (error) {
                return res.status(500).json({ error: error.message });
            }

            if (results) {
                Notify.CancelOrRejectMail(results);
            }

            // 3. Send HTML response
            return res.send(`
              <html>
                <body style="font-family: Arial; padding: 20px; text-align: center;">
                  <h2>Pass Rejected Successfully</h2>
                  <p>Kindly close this tab.</p>
                </body>
              </html>
            `);
        });

    } catch (error) {
        console.error('RejectPass Error:', error.message);
        return res.send(`
          <html>
            <body style="font-family: Arial; padding: 20px;">
              <h2>Error</h2>
              <p>Something went wrong while rejecting the pass.</p>
            </body>
          </html>
        `);
    }
};

const RejectPass = async (req, res) => {
    try {
        const { RequestId, UpdatedBy } = req.query;

        // 1. Update the VisitorsPass status to 'REJECTED'
        const updateQuery = `
            UPDATE dbo.VisitorsPass 
            SET Status = 'REJECTED', 
                UpdatedBy = '${UpdatedBy}', 
                UpdatedOn = dbo.GetISTTime() 
            WHERE RequestId = '${RequestId}';
        `;
       
        await VMSDBContext.executeQuery1(updateQuery);
        //console.log(updateQuery);
        // 2. Send notification email after rejection
        res.status(200).json({ 
                    message: 'Status Updated', 
                    Status: true
                });
        
        exeQuery.GetRejectPassNotify(req.query, (error, results) => {
            if (error) {
                return res.status(500).json({ error: error.message });
            }
            if (results) {
                Notify.CancelOrRejectMail(results);
            }
        });

     } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ message: 'Error', Status: false });
    }
};

const QRCheckInCheckOut = (req, res) => executeSP(
    'SP_HandleVisitorCheckInOut',
    req,
    res,
    {
        OrgId: 'OrgId',
        VisitorId: 'VisitorId',
        UserId: 'UserId',
        Email: 'Email'
    },
    (results) => {
        // Send response first
        //res.status(200).send(results.result || results); // Maintain backward compatibility
        
        //console.log('CheckIn/CheckOut Results:', results);
        
        // Send email notification if FromEmail exists
        res.status(200).json({success: true,data: results});
        if (results?.result?.[0]?.FromEmail || results?.[0]?.FromEmail) {
            const emailData = results.result || results; // Handle both formats
            Notify.MailCheckInOut(emailData);
            //console.log('CheckIn/CheckOut email notification sent');
        }
    }
);

//#region
module.exports = {
    ActiveVisitorCheckIns,
    ActiveVisitorCheckOuts,
    TodayVisits,
    getReqPass,
    getReqPassByIds,
    RejectPass,
    getManagers,
    getDepts,
    AttendeInActive,
    ManageVisitorsPass,
    getReqPasswithFilters,
    PassApproval,
    MailPassApproval,
    MailRejectPass,
    SendVisitorsPass,
    CancelVisit,
    QRCheckInCheckOut,
    SendDailyCheckinsSummary,
    GetVisitorTypes
};