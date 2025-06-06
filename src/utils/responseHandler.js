function handleResponse(res, error, results) {
    //const Result = results.recordset;
    let Result = results.recordset;

    if (!Result) {
        Result = results.output;
    }

    if (error) {
        console.error('Error:', error);
        error.status = 500;
        next(error);
    } else {
        if (results.recordset==0) {
            res.status(200).json({ error: 'No records found', Status: false });
            
        } else {
            //console.log(Result);
            res.json({
                //ResultData: results.recordset,
                ResultData: Result,
                //output: results.output,
                //Status: true
            });
            
        }
    }
}

module.exports = {
    handleResponse
};
