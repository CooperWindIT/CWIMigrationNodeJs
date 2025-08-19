const exeQuery = require("../dataAccess/CWIRepository");
//const JobNotify = require('../utils/JobNotifications');
const Notify = require('../utils/VMSNotifications.js');
const VMSDBContext = require('../dataContext/VMSDBContext');
const { executeSP } = require('../utils/recordHandler.js');
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle } = require("docx");

const SendEmailQueues = async (req, res) => {
    try {
        exeQuery.GetPendingEmails(req.query, async (error, results) => {
            if (error) return res.status(500).json({ error: error.message });

            const emails = results.recordset || results;
            if (!emails || emails.length === 0) {
                return res.status(200).json({ message: 'No pending emails', Status: true });
            }

            for (const email of emails) {
                try {
                    // ✅ Convert Attachments JSON → Array
                    let attachments = [];
                    if (email.Attachments) {
                        try {
                            attachments = JSON.parse(email.Attachments).map(file => ({
                                filename: file.split("/").pop(),
                                path: file
                            }));
                        } catch {
                            // if single file string (fallback)
                            attachments = [{
                                filename: email.Attachments.split("/").pop(),
                                path: email.Attachments
                            }];
                        }
                    }

                    // ✅ Send email
                    await JobNotify.sendEmail(
                        email.OrgId,
                        email.FromEmail,
                        email.ToEmail,
                        email.CC,
                        email.Subject,
                        null,
                        email.Html,
                        attachments
                    );

                    // ✅ Mark as Sent
                    await VMSDBContext.executeQuery2(`
                        UPDATE EmailQueue 
                        SET ProcessingStatus = 'SENT', UpdatedOn = GETDATE()
                        WHERE Id = ${email.Id}
                    `);

                } catch (err) {
                    console.error(`❌ Failed to send email to: ${email.ToEmail}`, err);

                    // Mark as Failed
                    await VMSDBContext.executeQuery2(`
                        UPDATE EmailQueue 
                        SET ProcessingStatus = 'Failed', UpdatedOn = GETDATE()
                        WHERE Id = ${email.Id}
                    `);
                }
            }

            return res.status(200).json({ message: 'Emails processed successfully', Status: true });
        });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ message: 'Error processing emails', Status: false });
    }
};

// ---------- Helper: Create Table ----------
function createTable(rows, columns, tableName) {
    return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
            new TableRow({
                children: columns.map(col =>
                    new TableCell({
                        children: [new Paragraph({ text: col, bold: true })],
                        borders: {
                            top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                            bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                            left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                            right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                        },
                    })
                ),
            }),
            ...rows.map(row =>
                new TableRow({
                    children: columns.map(col =>
                        new TableCell({
                            children: [new Paragraph(row[col] ? row[col].toString() : "-")],
                            borders: {
                                top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                            },
                        })
                    ),
                })
            ),
        ],
    });
}

// ---------- Generate DOCX ----------
async function generateDoc(visitors, reportDate) {
    const visitorsHeading = new Paragraph({
        children: [new TextRun({ text: `Visitors CheckIns : Dt: ${reportDate}`, bold: true })],
    });

    const visitorsTable = createTable(visitors, ["Name", "CompanyName", "CheckInTime", "CheckOutTime"], "Visitors");

    const doc = new Document({
        sections: [
            {
                children: [
                    visitorsHeading,
                    visitorsTable
                ],
            },
        ],
    });

    const buffer = await Packer.toBuffer(doc);
    return buffer;
}

// ---------- Generate DOCX Attachments ----------
const DocCheckinSummary = async (OrgId) => {
    // const currentDate = new Date().toLocaleDateString("en-GB", {
    //     day: "2-digit", month: "short", year: "numeric"
    // });
    
        const formattedDate = yesterday.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });

        console.log("Yesterday Date:", formattedDate);
    // Visitors
    const visitors = await new Promise((resolve, reject) => {
        exeQuery.GetVisitors({ OrgId }, (err, result) => {
            if (err) return reject(err);
            const mapped = result.recordset.map(v => ({
                Name: v.Name,
                CompanyName: v.CompanyName || "-",
                CheckInTime: v.CheckInTime ? new Date(v.CheckInTime).toLocaleString() : "-",
                CheckOutTime: v.CheckOutTime ? new Date(v.CheckOutTime).toLocaleString() : "-"
              
            }));
            resolve(mapped);
        });
    });

    // Generate DOCX
    const buffer = await generateDoc(visitors, formattedDate);

    // Attachments
    return [
        { filename: `DailyCheckInReport_${formattedDate}.docx`, content: buffer }
    ];
};

// ---------- Controller ----------
const SendDailyCheckinsSummary = (req, res) => {
    req.body = {
        query: { OrgId: req.query.OrgId }
    };

    if (!req.body.query.OrgId) {
        return res.status(400).json({ error: 'OrgId query parameter is required' });
    }

    executeSP(
        'SP_GetDailyCheckinSummary',
        req,
        res,
        { OrgId: 'query.OrgId' },
        async (results) => {
            res.status(200).json({ message: 'Daily check-in summary processed', status: true });
            console.log(results.result[0].VisitorsCheckIns);
          const visitorsCheckInsCount = parseInt(results.result[0].VisitorsCheckIns, 10) || 0;

            console.log("Count:", visitorsCheckInsCount);
            console.log("Is greater than 10:", visitorsCheckInsCount > 10);


            if (results) {
                if (visitorsCheckInsCount > 10) {
                    results.result[0].Attachments = await DocCheckinSummary(req.body.query.OrgId);
                }

                await Notify.MailwithAttachment(results.result);
                console.log('✅ Email sent with daily check-in summary for OrgId:', req.body.query.OrgId);
            }
        }
    );
};



async function generateCheckOutsDoc(clCheckOuts, reportDate) {
    const MissedCheckOutsHeading = new Paragraph({
        children: [new TextRun({ text: `Missed CheckOuts : Dt: ${reportDate}`, bold: true })],
    });

    const MissedCheckOutsTable = createTable(clCheckOuts, ["ContractorName", "AadharNo", "ShiftName", "CheckIn"], "MissedCheckOuts");

    const doc = new Document({
        sections: [
            {
                children: [
                    MissedCheckOutsHeading,
                    MissedCheckOutsTable
                ],
            },
        ],
    });

    const buffer = await Packer.toBuffer(doc);
    return buffer;
}

// ---------- Controller ----------
const PendingCheckOuts = async (req, res) => {
    try {
        const OrgId = req.query.OrgId || 8523;
        console.log("OrgId:", OrgId);

        // const currentDate = new Date().toLocaleDateString("en-GB", {
        //     day: "2-digit", month: "short", year: "numeric"
        // });
        // console.log("Current Date:", currentDate);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const formattedDate = yesterday.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });

        console.log("Yesterday Date:", formattedDate);


        // Email Config
        const emailConfig = await new Promise((resolve, reject) => {
            exeQuery.GetEmailConfig({ OrgId }, (err, result) => {
                if (err) return reject(err);
                console.log("Email Config fetched:", result.recordset[0]);
                resolve(result.recordset[0]);
            });
        });

        // CL CheckIns
        const clCheckOuts = await new Promise((resolve, reject) => {
            exeQuery.GetPendingCLCheckOuts({ OrgId }, (err, result) => {
                if (err) return reject(err);
                console.log("PendingCLCheckOuts fetched:", result.recordset);
                resolve(result.recordset);
            });
        });

        // Generate DOCX
        const buffer = await generateCheckOutsDoc(clCheckOuts, formattedDate);

        // Attachments
        const attachments = [
            { filename: `MissingCheck-outsReport_${formattedDate}.docx`, content: buffer }
        ];

        // Send Email
        console.log("Sending email...");
        //   await JobNotify.sendEmail(
        //                 OrgId,
               
        //                 emailConfig.ToEmail,
                
        //                 emailConfig.Subject,
                    
        //                 emailConfig.Html,
                    
        //             );
        await Notify.sendEmail(
            emailConfig.FromEmail,
            emailConfig.ToEmail,
            emailConfig.CC,
            emailConfig.Subject,
            null,
            emailConfig.Html,
            attachments
        );

        console.log("✅ Missing Check-outs Report sent successfully.");
        return res.status(200).json({ message: 'Missing Check-outs report sent successfully', Status: true });

    } catch (error) {
        console.error("❌ Error in SendMissing Check-outsSummary:", error);
        return res.status(500).json({ message: 'Error', Status: false, error: error.message });
    }
};


module.exports = { SendEmailQueues, SendDailyCheckinsSummary, PendingCheckOuts };





