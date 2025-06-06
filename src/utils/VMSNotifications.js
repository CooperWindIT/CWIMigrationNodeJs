const nodemailer = require("nodemailer");
const QRCode = require("qrcode");

class Notify {
    // Email function
    async sendEmail(FromEmail, ToEmails, CC, subject, text, html, attachments = []) {
        try {
            // Create transporter
            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: "info@cooperwindindia.in",//"cwiinfotest@gmail.com",//"info@cooperwindindia.in",
                    pass: "hgxv kbnt vuxp uwaz" // App Password//"tujg sfnb gewo rmkl"//"hgxv kbnt vuxp uwaz", // App Password
                },
            });

            // Ensure recipients are properly formatted
            const toEmailsFormatted = Array.isArray(ToEmails) ? ToEmails.join(",") : ToEmails;

            // Email options
            const mailOptions = {
                from: FromEmail,
                to: toEmailsFormatted,
                cc: CC,
                subject: subject,
                text: text,
                html: html,
                attachments: attachments, // Attachments array
            };

            console.log(mailOptions);

            // Send email
            const info = await transporter.sendMail(mailOptions);
            console.log("Email sent: " + info.response);
        } catch (error) {
            console.error("Error sending email:", error);
        }
    }


    async MomSubmit(data) {
        try {
            await this.sendEmail(
                data.FromEmail,
                [data.ToEmail],
                data.CC ? [data.CC] : [],
                data.Subject,
                data.Text,
                data.Html,
                data.Attachments
            );
        } catch (error) {
            console.error("Error in MailToMomSubmit:", error);
        }
    }
    

    // Function to send email to the manager
    async MailToManager(Results) {
        console.log(Results[0].NotifyEmail);
        await this.sendEmail(
            Results[0].FromEmail, 
            [Results[0].NotifyEmail],  
            Results[0].CC, 
            Results[0].Subject, 
            Results[0].Text, 
            Results[0].Html
        );
    }

    async OTPmail(Results) {
        await this.sendEmail(
            Results[0].FromEmail, 
            [Results[0].ToEmail],  
            Results[0].CC, 
            Results[0].Subject, 
            Results[0].Text, 
            Results[0].Html
        );
    }

    // Function to generate QR Code (Only Visitor ID)
    async generateQRCode(visitorId) {
        try {
            return await QRCode.toBuffer(visitorId.toString()); // Generate QR as buffer
        } catch (error) {
            console.error("Error generating QR Code:", error);
            throw error;
        }
    }

    // Function to send email to visitors with QR Code
    async CancelOrRejectMail(Results) {
    for (const record of  Results.recordset) {
        try {
            await this.sendEmail(
                record.FromEmail,
                [record.ToEmail], // Make sure it's an array
                record.CC ? [record.CC] : [], // Convert CC to array if exists
                record.Subject || 'Cancellation Notice',
                record.Text || '',
                record.Html || ''
            );
            
            console.log(`Sent to: ${record.ToEmail}`);
        } catch (error) {
            console.error(`Failed to send to ${record.ToEmail}:`, error.message);
        }
    }
}

    //cancel mail
    async MailToVisitors(Results) {
        try {
            console.log("Generating QR Code for Visitor ID:", Results.VisitorId);
            const qrCodeBuffer = await this.generateQRCode(Results.VisitorId); // Generate QR code
            const subject = `${Results.Subject} ${Results.VisitorId}`;
            await this.sendEmail(
                Results.FromEmail,
                [Results.NotifyEmail], // Convert to array
                Results.CC, // No CC in this case, provide an empty array
                subject,
                Results.Text,
                Results.Html,
                [
                    {
                        filename: `Visitor_QR_${Results.VisitorId}.png`,
                        content: qrCodeBuffer,
                        encoding: "base64",
                    },
                ]
            );
        } catch (error) {
            console.error("Error in MailToVisitors:", error);
        }
    }

    // Function to send Check-in/Check-out email
    async MailCheckInOut(Results) {
        console.log(Results[0].NotifyEmail);
        
        // Send email to the visitor
        await this.sendEmail(
            Results[0].FromEmail, 
            [Results[0].NotifyEmail],  
            Results[0].CC, 
            Results[0].Subject, 
            Results[0].Text, 
            Results[0].Html
        );
    
        // Send email to employee only if EmpSubject exists
        if (Results[0].EmpSubject) {
            await this.sendEmail(
                Results[0].FromEmail, 
                [Results[0].UserEmail],  
                Results[0].CC, 
                Results[0].EmpSubject, 
                Results[0].EmpText, 
                Results[0].EmpHtml
            );
        } else {
            console.log("Skipping employee notification as EmpSubject is missing.");
        }
    }
    
}

module.exports = new Notify();

