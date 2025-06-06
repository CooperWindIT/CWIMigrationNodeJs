const VMSDBContext = require('../dataContext/VMSDBContext');


class exeQuery {

    



    GetCancelNotify(JsonData, callback) {
        /*const sqlQuery = `
            SELECT *
        FROM V_RoleMenu
        WHERE RoleId = ${JsonData.RoleId} AND (OrgId = ${JsonData.OrgId} OR OrgId = 9333);
        `;*/
        const sqlQuery = `SELECT 
    o.EmailId AS FromEmail, 
    v.Email AS ToEmail, 
    nc.Subject AS Subject, 
    nc.Text AS Text, 
    nc.Html AS Html 
FROM dbo.Organizations o
JOIN dbo.VisitorsDetails v ON v.RequestId = ${JsonData.RequestId} 
JOIN dbo.NotifyConfig nc ON 1 = 1  -- No direct relation, using cross join  
WHERE o.OrgId = ${JsonData.OrgId} AND NotifyName = 'MeetCanceled' AND v.IsActive = 1`;
        //console.log(sqlQuery);
        VMSDBContext.executeQuery2(sqlQuery)
            .then(results => callback(null, results))
            .catch(callback);
    }

    GetRejectPassNotify(JsonData, callback) {
    const sqlQuery = `
        SELECT 
    O.EmailId AS FromEmail,
    VP.AutoIncNo,
    VP.CreatedBy,
    U.Email AS ToEmail,
    NC.Subject + ' ' + CAST(VP.AutoIncNo AS VARCHAR) AS Subject,
    NC.Text,
    NC.Html
FROM dbo.VisitorsPass VP
JOIN dbo.Organizations O ON O.OrgId = ${JsonData.OrgId} AND O.IsActive = 1
JOIN dbo.Users U ON U.Id = VP.CreatedBy
CROSS JOIN dbo.NotifyConfig NC
WHERE VP.RequestId = ${JsonData.RequestId} AND VP.OrgId = ${JsonData.OrgId}
AND NC.NotifyName = 'PASSREJECT';
    `;
    
    //console.log(sqlQuery);
    
    VMSDBContext.executeQuery2(sqlQuery)
        .then(results => callback(null, results))
        .catch(callback);
    }

 


}

module.exports = new exeQuery();
