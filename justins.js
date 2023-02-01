// loading csv to icebreaker table
const AWS = require('aws-sdk');
const csv = require('csvtojson');

const csvFilePath = process.argv[2];
const tableName = process.argv[3];
const myCredentials = {
    accessKeyId: process.argv[4],
    secretAccessKey: process.argv[5]
};

// console.log(csvFilePath,"\n",tableName,"\n",myCredentials);

AWS.config = new AWS.Config({
    credentials: myCredentials, region: 'us-east-1'
});

// var dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});
var dynamodb = new AWS.DynamoDB.DocumentClient();

async function batchWrite(data, tableName) {
    const RequestItems = {};
    RequestItems[tableName] = data;
    const params = {
      RequestItems: RequestItems
    }
    
//     await dynamodb.batchWriteItem(params).promise();
    await dynamodb.batchWrite(params, function(err,data) {
        if (err) console.log(err);
        else console.log("Wrote:",data);
    });
}

async function addQuestions(csvFilePath) {
    // Allows us to convert the csv file to JSON, which is later converted
    // to DynamoDB compatible JSON.
    // csv()
    // .fromFile(csvFilePath)
    // .then((jsonObj) => {
    //     // Shows what the JSON file looks like after the conversion.
    //     console.log(jsonObj);
    // })
    // let string = 'dquotesAlpha and the Omegadquotes';
    // string = string.replaceAll('dquotes','\\"');
    // console.log(string)

    // Async / await usage
    const csvArray = await csv().fromFile(csvFilePath);
    parsedCsvArray = [];
    for (i = 0; i < csvArray.length; i++) {
        const rowObj = JSON.parse(csvArray[i].json)
        for (key in rowObj) {
            switch(typeof rowObj[key]) {
                case 'string':
                    rowObj[key] = rowObj[key].replaceAll('dquotes','\"')
                    break;
                case 'object':
                    const newArray = rowObj[key].map(element => element.replaceAll('dquotes','\"'));
                    rowObj[key] = newArray;
                    break;
            }
        }
        parsedCsvArray[i] = rowObj
        // console.log(rowObj);
    }
    console.log("Rows Loaded:" + parsedCsvArray.length);
    // console.log(parsedCsvArray[55]);
    // console.log(parsedCsvArray);

    let n = 0;
    let timeOut = null;
    let maximum_backOff = 32
    for (let j = 0; j < parsedCsvArray.length; j+= 25) {
        timeOut = Math.floor(Math.random() * 1000) + 1;
        setTimeout(async () => {
            const questionsArray = [];
            for (let i = j; i < j+25; i++) {
                console.log(i+' '+j);
                console.log(parsedCsvArray[i])
                if (parsedCsvArray[i]) {
                    // const parsedQuestions = JSON.parse(csvArray[i].json);
                    questionsArray.push({
                        PutRequest: {
                            Item: {
                                ...parsedCsvArray[i]
                            }
                        }
                    })
                }
                if(questionsArray[i-j]) {console.log(questionsArray[i-j])};
            }
            // console.log(questionsArray)
            try {
                if (questionsArray.length > 0) {
                    console.log(questionsArray.length)
                    await batchWrite(questionsArray, tableName);
                }
            } catch(error) {
                console.log("ERROR", error)
            }
        }, Math.min((Math.exp(2, n) + timeOut), maximum_backOff));
        n += 1;
    }

}

addQuestions(csvFilePath);