const { VMShandleRecord } = require('../utils/recordHandler');
const { OperationEnums } = require('../utils/VMSutilityEnum');
const exeQuery = require('../dataAccess/UserAccessQuery');
const VMSDBContext = require('../dataContext/VMSDBContext');
const { executeSP } = require('../utils/recordHandler.js');
const Notify = require('../utils/VMSNotifications.js');

module.exports = {
    // #region Departments
    getDepartments: (req, res) => {
        VMShandleRecord(req, res, req.query, OperationEnums().GETDEPT);
    },
    // #endregion

    // #region Menu
    getUserPermissions: (req, res) => {
        const { OrgId, RoleId, ModuleId } = req.query;
        const data = { OrgId, RoleId, ModuleId };
        VMShandleRecord(req, res, data, OperationEnums().RSECURSEL);
    },
    getMenu: (req, res) => {
        const { OrgId, RoleId } = req.query;
        const JsonData = { OrgId, RoleId };
        exeQuery.GetMenu(JsonData, (error, results) => {
            if (error) return res.status(500).json({ error: error.message });
            exeQuery.GetMenuNodes(results, (err, MenuList) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ ResultData: MenuList, Status: true });
            });
        });
    },
    // updateUserMenu: (req, res) => {
    //     exeQuery.SpSetRoleSecurity(req.body, (error, results) => {
    //         if (error) return res.status(400).send({ error: error.message });
    //         res.status(200).send(results);
    //     });
    // },
    inactiveRoleMenu: (req, res) => {
        VMShandleRecord(req, res, req.body, OperationEnums().DELTROLMNU);
    },
    // #endregion

    // #region Authentication
    signIn: (req, res) => {
        try {
            VMShandleRecord(req, res, req.query, OperationEnums().SIGNIN);
        } catch (error) {
            res.status(500).json({ error: 'Error While SIGNIN' });
        }
    },
    logIn: (req, res) => {
        VMShandleRecord(req, res, req.query, OperationEnums().LOGIN);
    },
    logOut: (req, res) => {
        const data = req.body;
        //console.log(data);
        VMShandleRecord(req, res, req.body, OperationEnums().LOGOUT);
    },
    changePassword: (req, res) => {
        VMShandleRecord(req, res, req.body, OperationEnums().CHNGPSWD);
    },
    // #endregion

    // #region Users
    addUser: (req, res) => {
        VMShandleRecord(req, res, req.body, OperationEnums().ADDUSER);
    },
    updateUser: (req, res) => {
        VMShandleRecord(req, res, req.body, OperationEnums().UPDTUSER);
    },
    getUsers: (req, res) => {
        VMShandleRecord(req, res, req.query, OperationEnums().GETUSERS);
    },
    inactiveUser: (req, res) => {
        VMShandleRecord(req, res, req.body, OperationEnums().DELTUSER);
    },
    // #endregion

    // #region Roles
    getRoles: (req, res) => {
        VMShandleRecord(req, res, req.query, OperationEnums().GETROLES);
    },
    // #endregion

    ForgotPassword: (req, res) => executeSP(
    'SP_ForgotPassword',
    req,
    res,
    {
        Email: 'Email'
    },
    
    (results) => {
        //console.log(results);
        // Only send OTP if results were returned
        res.status(200).json({Status: true,data: results});
        if (results) {
            Notify.OTPmail(results.result);
        }
    }),
    ConfirmOTP: async (req, res) => {
         const { Email, OTP } = req.body;

    if (!Email || !OTP) {
        return res.status(400).json({ error: 'Email and OTP are required' });
    }

    try {
        // Parameterized query to prevent SQL Injection
        const getQuery = `
            SELECT * FROM dbo.Users 
            WHERE Email = '${Email}' AND LastOtpLogin = '${OTP}'
        `;

        const results = await VMSDBContext.executeQuery1(getQuery);
        //console.log(getQuery);
        //console.log(results);
        if (results[0]) {
            return res.status(200).json({ message: 'OTP Matched', Status:true });
        } else {
            return res.status(400).json({ error: 'Invalid OTP' });
        }
    } catch (error) {
        console.error('Error confirming OTP:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
    },



    // #region Dashboard
    getVMSDashboard: async (req, res) => {
        try {
            const { OrgId } = req.query;
            const [
                TodayActiveLaborCheckIns,
                TodayVisitorsCounts,
                TodayActiveVisitorsCheckIns,
                ContractorCount,
                MonthWiseVisitorsCount,
                MonthWiseCLsCount,
                TodayActiveVisitorsCheckOuts,
                TodayCLSCounts
            ] = await Promise.all([
                VMSDBContext.executeQuery1(`SELECT count(*) AS TodayActiveLaborCheckins FROM dbo.Roles`),
                VMSDBContext.executeQuery1(`SELECT COUNT(VD.RequestId) AS TodayVisitorsCountQUery FROM dbo.VisitorsPass VP INNER JOIN dbo.VisitorsDetails VD ON VD.RequestId = VP.RequestId WHERE VP.OrgId = ${OrgId} AND 
                    VP.Status = 'APPROVED' AND CAST(MeetingDate AS DATE) = CAST(GETDATE() AS DATE) AND VP.IsActive = 1 AND VD.IsActive = 1`),
                VMSDBContext.executeQuery1(`SELECT COUNT(VD.RequestId) AS TodayActiveVisitorsCheckins FROM dbo.VisitorsPass VP INNER JOIN dbo.VisitorsDetails VD ON VD.RequestId = VP.RequestId WHERE VP.OrgId = ${OrgId} AND CAST(MeetingDate AS DATE) = CAST(GETDATE() AS DATE) AND CheckInTime IS NOT NULL AND CheckOutTime IS NULL`),
                VMSDBContext.executeQuery1(`SELECT COUNT(*) AS ContractorCount FROM dbo.Contractor WHERE OrgId = ${OrgId} AND IsActive = 1`),
                VMSDBContext.executeQuery1(`SELECT DATENAME(MONTH, MeetingDate) AS [MonthName], COUNT(VD.RequestId) AS [VisitorCount] FROM dbo.VisitorsPass VP INNER JOIN dbo.VisitorsDetails VD ON VD.RequestId = VP.RequestId WHERE VP.OrgId = ${OrgId} AND YEAR(MeetingDate) = YEAR(GETDATE()) GROUP BY DATENAME(MONTH, MeetingDate), MONTH(MeetingDate) ORDER BY MONTH(MeetingDate)`),
                VMSDBContext.executeQuery1(`SELECT COUNT(CLCheckIns) AS CLsCount
                FROM dbo.CLCount
                WHERE OrgId = ${OrgId} AND MONTH(ChecKInDate) = MONTH(GETDATE())
            AND YEAR(ChecKInDate) = YEAR(GETDATE()) AND IsActive = 1`),
                VMSDBContext.executeQuery1(`SELECT COUNT(VD.RequestId) AS TodayActiveVisitorsCheckins FROM dbo.VisitorsPass VP INNER JOIN dbo.VisitorsDetails VD ON VD.RequestId = VP.RequestId WHERE VP.OrgId = ${OrgId} AND CAST(MeetingDate AS DATE) = CAST(GETDATE() AS DATE) AND CheckInTime IS NOT NULL AND CheckOutTime IS NOT NULL`),
                VMSDBContext.executeQuery1(`SELECT SUM(CLCount) AS TotalAllowedCLs, SUM(CLCheckIns) AS TotalDoneCheckIns FROM dbo.CLCount WHERE CheckInDate = CAST(dbo.GetISTTime() AS DATE) AND IsActive = 1 AND OrgId = ${OrgId}`)
            ]);

            res.json({
                TodayActiveLaborCheckIns, TodayVisitorsCounts,
                TodayActiveVisitorsCheckIns, ContractorCount,
                MonthWiseVisitorsCount, MonthWiseCLsCount,
                TodayActiveVisitorsCheckOuts, TodayCLSCounts
            });
            console.log(res.json);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    // #endregion
};



//_______________________________________________________________________________________________-





















// //#region Dashboard

// router.get('/VMSDashboard', async (req, res) => {
//     try {
//         const { OrgId } = req.query;
        
//         const TodayActiveLaborCheckInsQuery= 
//         `
//         SELECT count(*) AS TodayActiveLaborCheckins FROM dbo.LaborQRPass 
//          WHERE  OrgId = ${OrgId} AND Date = CAST(GETDATE() AS DATE) AND CheckIn IS NOT NULL AND CheckOut IS NULL;
//         `;
//         //console.log(TodayActiveLaborCheckInsQuery);
//         const TodayActiveVisitorsCheckInsQuery = `
//         SELECT COUNT(VD.RequestId) AS TodayActiveVisitorsCheckins  FROM dbo.VisitorsPass VP 
//  INNER JOIN dbo.VisitorsDetails VD ON VD.RequestId = VP.RequestId
//         WHERE VP.OrgId = ${OrgId} AND CAST(MeetingDate AS DATE) = CAST(GETDATE() AS DATE) 
//         AND CheckInTime IS NOT NULL AND CheckOutTime IS NULL;`;
//         //console.log(TodayActiveVisitorsCheckInsQuery);
//          const TodayVisitorsCountsQuery = `
//                  SELECT COUNT(VD.RequestId) AS  TodayVisitorsCountQUery   FROM dbo.VisitorsPass VP 
//  INNER JOIN dbo.VisitorsDetails VD ON VD.RequestId = VP.RequestId
//         WHERE VP.OrgId = ${OrgId} AND VP.Status = 'APPROVED' AND CAST(MeetingDate AS DATE) = CAST(GETDATE() AS DATE) 
//        `;
//         const ContractorCountQuery = `
//         select COUNT(*) AS ContractorCount from dbo.Contractor where OrgId = ${OrgId} AND IsActive = 1
//         `;
//         const MonthWiseVisitorsCountQuery = `
//         SELECT DATENAME(MONTH, MeetingDate) AS [MonthName],COUNT(VD.RequestId) AS [VisitorCount]
//        FROM dbo.VisitorsPass VP 
//  INNER JOIN dbo.VisitorsDetails VD ON VD.RequestId = VP.RequestId
//         WHERE VP.OrgId = ${OrgId} AND YEAR(MeetingDate) = YEAR(GETDATE()) 
//         GROUP BY DATENAME(MONTH, MeetingDate), MONTH(MeetingDate) 
//         ORDER BY MONTH(MeetingDate); 
//         `;
//         const MonthWiseCLsCountQuery = `
//         SELECT DATENAME(MONTH, [Date]) AS [MonthName],COUNT(Id) AS [CLsCount]
//         FROM [dbo].[LaborQRPass] WHERE OrgId = ${OrgId} AND YEAR(Date) = YEAR(GETDATE()) 
//         GROUP BY DATENAME(MONTH, Date), MONTH(Date) 
//         ORDER BY MONTH(Date); 
//         `;
//         const TodayActiveVisitorsCheckOutsQuery = `
//         SELECT COUNT(VD.RequestId) AS TodayActiveVisitorsCheckins  FROM dbo.VisitorsPass VP 
//  INNER JOIN dbo.VisitorsDetails VD ON VD.RequestId = VP.RequestId
//         WHERE VP.OrgId = ${OrgId} AND CAST(MeetingDate AS DATE) = CAST(GETDATE() AS DATE) 
//         AND CheckInTime IS NOT NULL AND CheckOutTime IS NOT NULL;`;
//         const TodayCLSCountQuery = `
//         SELECT     SUM(CLCount) AS TotalAllowedCLs,
//     SUM(CLCheckIns) AS TotalDoneCheckIns
//         FROM dbo.CLCount
//         WHERE CheckInDate = CAST(dbo.GetISTTime() AS DATE) AND IsActive = 1 AND OrgId = ${OrgId};
//         `;

       
       
//         const [
          
//             TodayActiveLaborCheckIns,TodayVisitorsCounts,
//             TodayActiveVisitorsCheckIns,ContractorCount,
//             MonthWiseVisitorsCount,MonthWiseCLsCount,
//             TodayActiveVisitorsCheckOuts,TodayCLSCounts
//         ] = await Promise.all([ 
//             VMSDBContext.executeQuery1(TodayActiveLaborCheckInsQuery),
//             VMSDBContext.executeQuery1(TodayVisitorsCountsQuery),
//             VMSDBContext.executeQuery1(TodayActiveVisitorsCheckInsQuery ),
//             VMSDBContext.executeQuery1(ContractorCountQuery),
//             VMSDBContext.executeQuery1(MonthWiseVisitorsCountQuery),
//             VMSDBContext.executeQuery1(MonthWiseCLsCountQuery),
//             VMSDBContext.executeQuery1(TodayActiveVisitorsCheckOutsQuery),
//             VMSDBContext.executeQuery1( TodayCLSCountQuery)
           
//         ]);
//         res.json({
//             TodayActiveLaborCheckIns, TodayVisitorsCounts,
//             TodayActiveVisitorsCheckIns,ContractorCount,
//             MonthWiseVisitorsCount,MonthWiseCLsCount,
//             TodayActiveVisitorsCheckOuts,TodayCLSCounts
//         });
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });

