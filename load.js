"use strict";

const test = require("./modules/test/processingTest");

//imports
const { csvToJson } = require("./modules/processing");
const { extractFormattedJson } = require("./modules/processing");
const {
  removeIrrelevantPropertiesFromObjects,
  checkForMissingIds,
} = require("./modules/validation");
const { checkAllValues } = require("./modules/validation");
const { getAllowedKeys } = require("./modules/processing");
const { getDynamoTableRecords } = require("./modules/aws");
const { getItemsToProcess } = require("./modules/processing");
const { updateDynamoDb } = require("./modules/aws");

// Load the AWS SDK for Node.js
const AWS = require("aws-sdk");

// args
const csvFilePath = process.argv[2];
const game_code = process.argv[3];
const tableName = process.argv[4];
const myCredentials = {
  accessKeyId: process.argv[5],
  secretAccessKey: process.argv[6],
};
// Set the region
AWS.config = new AWS.Config({
  credentials: myCredentials,
  region: "us-east-1",
});

// Create DynamoDB service object
const dynamodb = new AWS.DynamoDB.DocumentClient();

const load = async () => {
  try {
    // convert csv to JSON
    const csvArray = await csvToJson(csvFilePath);
    // console.log('csvArray: ', csvArray);

    // get allowed keys
    const allowedKeys = await getAllowedKeys(game_code);
    // console.log('allowedKeys: ', allowedKeys);

    // parse JSON
    const JsonArray = await extractFormattedJson(csvArray);
    // console.log('JsonArray: ', JsonArray);

    // Check that values and keys present
    const {
      passedValueCheck,
      elementsWithMissingValues,
      elementsWithMissingKeys,
    } = await checkAllValues(JsonArray, allowedKeys); // RETURNS OBJECT SHOWING IF VALUE CHECKED PASS AND IDs MISSING
    if (!passedValueCheck) {
      console.log(
        `VALIDATION FAILED! \n \n -- ELEMENTS WITH MISSING KEYS -- ${JSON.stringify(
          elementsWithMissingKeys
        )}\n \n-- ELEMENTS WITH MISSING VALUES-- ${JSON.stringify(
          elementsWithMissingValues
        )}`
      );
    } else {
      // Delete unnecessary keys
      const trimmedObjectArray = await removeIrrelevantPropertiesFromObjects(
        JsonArray,
        allowedKeys
      );
      console.log('trimmedObjectArray: ', trimmedObjectArray);

      // get existing records
      const existingRecords = await getDynamoTableRecords(tableName, dynamodb);
      // console.log('existingRecords: ', existingRecords)

      // // compare csv content to existing records
      const itemsToProcess = await getItemsToProcess(trimmedObjectArray, existingRecords);
      // console.log(itemsToProcess);

      // batchWrite to dynamo
      const DynamoTableResponse = await updateDynamoDb(itemsToProcess, tableName, dynamodb);
    }
  } catch (err) {
    console.error(err);
    // throw new Error(err);
  }
};


