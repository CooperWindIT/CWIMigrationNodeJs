//LITE = 101 to 200
//Standard =  1 to 100
//Premium = 201 to 300
function OperationEnums() {
    const Operations = {
        ADDUSER:10,
        QRCHECKIN:17,
        TODAYVISITS:41,
        ADDFORM:42,
        INSRTCTYPE:43,
        UPDTCTYPE:44,
        INSRTCNTNT:45,
        UPDTCNTNT:46,
        GETCNTNTBYTYPE:47,
        ADDPRDTS:48,
        UPDTPRDTS:49,
        GETPRDTS:50,
        ADDCATS:51,
        UPDTCATS:52,
        DDLITEMS:53,
        INS_ORG:54,
        UPD_ORG:55

    };

    return Operations;
}

module.exports = {
    OperationEnums
};
