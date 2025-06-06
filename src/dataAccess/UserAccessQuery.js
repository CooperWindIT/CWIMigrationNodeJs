const VMSDBContext = require('../dataContext/VMSDBContext');


class exeQuery {

    GetMenu(JsonData, callback) {
        /*const sqlQuery = `
            SELECT *
        FROM V_RoleMenu
        WHERE RoleId = ${JsonData.RoleId} AND (OrgId = ${JsonData.OrgId} OR OrgId = 9333);
        `;*/
        const sqlQuery = `SELECT * FROM V_RoleMenu WHERE RoleId = ${JsonData.RoleId} AND OrgId = ${JsonData.OrgId} AND IsActive = 1 
        AND EXISTS (SELECT 1 FROM RoleMenu WHERE OrgId =  ${JsonData.OrgId} AND RoleId = ${JsonData.RoleId})
        UNION ALL
        SELECT * FROM V_RoleMenu WHERE RoleId = ${JsonData.RoleId}  AND OrgId = 9333 AND IsActive = 1
        AND NOT EXISTS (SELECT 1 FROM RoleMenu WHERE OrgId =  ${JsonData.OrgId} AND RoleId = ${JsonData.RoleId}) ORDER BY SortOrder;`;
        //console.log(sqlQuery);
        VMSDBContext.executeQuery2(sqlQuery)
            .then(results => callback(null, results))
            .catch(callback);
    }



   
  GetMenuNodes(results, callback) {
    //console.log("Raw results:", results);

    const menuItems = results?.recordset;

    if (!Array.isArray(menuItems) || menuItems.length === 0) {
        return callback(new Error('Invalid or empty results'));
    }

    try {
        const menuNodes = this.buildMenuHierarchy(menuItems);
        callback(null, menuNodes);
    } catch (error) {
        callback(error);
    }
}


    // Function to build menu hierarchy supporting multiple sublevels
  buildMenuHierarchy(menuItems) {
    // ✅ Check if menuItems is a valid array
    if (!Array.isArray(menuItems)) {
        throw new Error("menuItems is not an array");
    }

    const menuLookup = {};
    menuItems.forEach(menu => {
        menuLookup[menu.AppMenuId] = { 
            AppMenuId: menu.AppMenuId, 
            ReportId: menu.ReportId,
            MenuName: menu.MenuName,
            MenuPath: menu.MenuPath,
            IconName: menu.IconName,
            SubItems: []
        };
    });

    const rootMenus = [];

    menuItems.forEach(menu => {
        if (menu.ParentId === 0) {
            rootMenus.push(menuLookup[menu.AppMenuId]);
        } else {
            if (menuLookup[menu.ParentId]) {
                menuLookup[menu.ParentId].SubItems.push(menuLookup[menu.AppMenuId]);
            }
        }
    });

    return rootMenus;
}

    SpSetRoleSecurity(TotJson, callback) {
        if (!TotJson) {
            return callback(new Error('RoleSecurity is undefined'));
        }
        const { orgid, RoleId, MenuId, IsChecked, CanWrite, CanDelete, CanExport, IsActive, UpdatedBy } = TotJson;
        //console.log(TotJson);

        const sqlQuery = `
            EXEC [dbo].[SP_SetRoleSecurity]
            @orgid = '${orgid}',
            @RoleId = '${RoleId}',
            @MenuId = '${MenuId}',
            @IsChecked = '${IsChecked}',
            @CanWrite = '${CanWrite}',
            @CanDelete = '${CanDelete}',
            @CanExport = '${CanExport}',
            @IsActive =  '${IsActive}',
            @UpdatedBy = '${UpdatedBy}'
        `;

        //console.log('sqlQuery:', sqlQuery);

        VMSDBContext.executeQuery1(sqlQuery)
            .then(results => callback(null, results))
            .catch(callback);
    }


}

module.exports = new exeQuery();
