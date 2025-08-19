const VMSDBContext = require('../dataContext/VMSDBContext');


class exeQuery {

    



   GetPendingEmails(JsonData, callback) {
    const query = `
        SELECT Id, FromEmail, ToEmails AS ToEmail, CC, Subject, HtmlBody AS Html, Attachments, Replacements, ProcessingStatus,
        OrgId
        FROM dbo.EmailQueue
        WHERE OrgId = ${JsonData.OrgId} AND ProcessingStatus != 'SENT' AND IsActive = 1
    `;
        console.log(query);
    VMSDBContext.executeQuery2(query).then(res => callback(null, res)).catch(callback);
}

GetSMTPDetails(OrgId, callback) {
    const query = `
        SELECT SMTPUser, SMTPPass, EmailId
        FROM dbo.Organizations
        WHERE OrgId = ${OrgId}
    `;
    console.log(query);
    VMSDBContext.executeQuery2(query).then(res => callback(null, res)).catch(callback);
}


// 3️⃣ Get Visitors Data
GetVisitors(JsonData, callback) {
    const query = `
        SELECT Name,  CompanyName, CheckInTime, CheckOutTime
        FROM dbo.VisitorsDetails AS VD INNER JOIN dbo.VisitorsPass VP ON VP.RequestId = VD.RequestId
        WHERE CAST(CheckInTime AS DATE) = CAST(dbo.GetISTTime() AS DATE) AND OrgId = ${JsonData.OrgId} ;
    `;
    console.log(query);
    VMSDBContext.executeQuery2(query)
        .then(res => callback(null, res))
        .catch(callback);
} 

// 1️⃣ Get Email Config (Subject, Html, FromEmail, ToEmail, CC)
GetEmailConfig(JsonData, callback) {
    const query = `
     SELECT  
            N.Subject,
            N.Html,
            (SELECT EmailId FROM dbo.Organizations WHERE OrgId =  ${JsonData.OrgId}) AS FromEmail,
            (SELECT Email FROM dbo.Users WHERE OrgId =  ${JsonData.OrgId} AND RoleId = 2) AS ToEmail
        FROM dbo.NotifyConfig N
        WHERE N.NotifyName = 'MISSEDCHECKOUTS';
    `;
    console.log(query);
    VMSDBContext.executeQuery2(query)
        .then(res => callback(null, res))
        .catch(callback);
}

// 2️⃣ Get CL CheckIns Data (Shift-wise)
GetPendingCLCheckOuts(JsonData, callback) {
    const query = `
        select C.ContractorName,AC.Aadharno As AadharNo, ST.ShiftName, 
        CONVERT(varchar(16), AC.CheckIn, 120) AS CheckIn
        from dbo.AadharCheckIns AS AC INNER JOIN dbo.Contractor AS C ON C.Id = AC.ContractorId
	  INNER JOIN dbo.ShiftTimings AS ST ON ST.Id = AC.ShiftTypeId
	   where CAST(AC.CreatedOn AS DATE) = CAST(DATEADD(DAY, -1, dbo.GetISTTime()) AS DATE)
	  AND CheckOut IS NULL  AND AC.OrgId =  ${JsonData.OrgId}
    `;
    console.log(query);
    VMSDBContext.executeQuery2(query)
        .then(res => callback(null, res))
        .catch(callback);
}




}

module.exports = new exeQuery();
