const _ = require('lodash');

module.exports.getDynamoTableRecords = async (tableName, dynamodb) => {

    let ddbData
    var params = {
        TableName: tableName
    }

    try {
        let data = await dynamodb.scan(params).promise().then(response => {
            ddbData = response.Items
        });
        
      }
    catch (err) {
      console.log(err);
    } 
   return ddbData

  };

  module.exports.updateDynamoDb = async (itemsToProcess, tableName, dynamodb) => {
    
 
    let arrayOfRequests = _.chunk(itemsToProcess, 25);
    
    for (const requestArray of arrayOfRequests) {

        let obj = {};
        obj = requestArray;

        const RequestItems = {};
        RequestItems[tableName] = obj;
        const params = {};
        params.RequestItems = RequestItems;


        try {
            let res = await dynamodb.batchWrite(params).promise()
            let data = res;
            console.log('Processed: ', JSON.stringify(obj, null, 3))
        } catch(err) {
            console.log(err)
        }
    } 
}