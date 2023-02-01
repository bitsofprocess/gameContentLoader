const csv = require("csvtojson");
const _ = require('lodash');

module.exports.csvToJson = async (csvFilePath) => {
  try {
    // const data = await csv({checkType: true, escape: "~"}).fromFile(csvFilePath);
    const data = await csv().fromFile(csvFilePath);

    // log the JSON array
    return data;
  } catch (err) {
    console.log(err);
  }
};

module.exports.getAllowedKeys = async (game_code) => {
  let column_names = [];

  switch (game_code) {
    case "CAPTIONS":
      column_names = ["id", "url"];
      break;
    case "CT":
      column_names = [
        "id",
        "answers",
        "category",
        "correct_answer",
        "prompt",
        "url",
      ];
      break;
    case "FLUS":
      column_names = ["id", "points", "question", "special"];
      break;
    case "LT":
      column_names = ["id", "answers", "correct_answer", "question", "edition"];
      break;
    case "NOW":
      column_names = ["id", "word"];
      break;
    case "PLAYDECK":
      column_names = [
        "id",
        "deck_name",
        "deck_type",
        "game_code",
        "rating",
        "safe_for_work",
        "search_term",
        "text",
        "url",
      ];
      break;
    case "PROMPTDECK":
      column_names = [
        "id",
        "deck_name",
        "deck_type",
        "game_code",
        "rating",
        "safe_for_work",
        "text",
        "url",
      ];
      break;
    case "TOT":
      column_names = ["id", "category", "word"];
      break;
    default:
      console.log("Requested game code not present.");
  }

  return column_names;
};

module.exports.extractFormattedJson = async (csvArray) => {

  parsedCsvArray = [];

  for (i = 0; i < csvArray.length; i++) {
    const rowObj = JSON.parse(csvArray[i].json);

    for (key in rowObj) {
      switch (typeof rowObj[key]) {
        case "string":
          rowObj[key] = rowObj[key].replaceAll("dquotes", '"');
          // console.log(rowObj[key]);
          break;
        case "object":
          const newArray = rowObj[key].map((element) =>
            element.replaceAll("dquotes", '"')
          );
          rowObj[key] = newArray;
          break;
      }
    }
    parsedCsvArray[i] = rowObj;
  }
  return parsedCsvArray;
};

module.exports.validateJson = async (allowedKeys, csvArray) => {
  // csvArray.forEach(element => console.log(element.json));
  // filteredJsonArray = JsonArray.map((element, index) => {
  // return JsonArray[index];

  // return JsonArray[index] = Object.fromEntries(
  //   Object.entries(element).filter((element) =>
  //     allowedKeys.includes(element[0])
  //   )
  // );

  // });
  // return filteredJsonArray;

  // VALIDATION FROM OURLT

  // let valueCheck = [];
  // let passedValueCheck;

  // csvArray.forEach((element) => {
  //   const valuesArray = Object.values(element);
  //   console.log(valuesArray);
    
  //   if (valuesArray.includes("")) {
  //     valueCheck.push(false);
  //   } else {
  //     valueCheck.push(true);
  //   }
  // });

  // if (valueCheck.includes(false)) {
  //   passedValueCheck = false;
  // } else {
  //   passedValueCheck = true;
  // }
  // console.log(valueCheck);
  // return passedValueCheck;

  let missingKeysArray = [];
  let missingValuesArray = [];
  
  // csvArray.forEach(element => {
  //   console.log(Object.keys(element));
  
  // });

  let filteredCsvObjects = [];
  formattedCsvObjects.forEach(
      (element, index) =>
        (filteredCsvObjects[index] = Object.fromEntries(
          Object.entries(element).filter((element) =>
            allowedProperties.includes(element[0])
          )
        ))
    );

   return filteredCsvObjects;
};

module.exports.getItemsToProcess = async (trimmedCsvObjects, existingRecords) => {
  try {
        
    let itemsToProcess = [];


    // adds itemsToDelete to dynamoItemsToUpdate table
    let dynamoIds = [];
    existingRecords.forEach(element => dynamoIds.push(element.id))

    let csvIds = [];
    trimmedCsvObjects.forEach(element => csvIds.push(element.id));
    
    let idsToDeleteFromDynamo = dynamoIds.filter(id => !csvIds.includes(id));

    // idsToDeleteFromDynamo.map(id => dynamoItemsToUpdate.itemsToDelete.push({DeleteRequest: {Key: {id}}}))
    idsToDeleteFromDynamo.map(id => itemsToProcess.push({DeleteRequest: {Key: {id}}}))

    // returns whole item to be deleted:

    // existingRecords.forEach(element => {
    //     if (idsToDeleteFromDynamo.includes(element.id)) {
    //         let formattedElement = { PutRequest: {Item: {element}}}
    //         dynamoItemsToUpdate.itemsToDelete.push(element)
    //     }
    // })


    // looks for matching ids, compare content, adds differing csvContent to itemsToProcess
    let recordsId 
    existingRecords.forEach((element) => {
        recordsId = element.id;
        let index = trimmedCsvObjects.findIndex(csvElement => csvElement.id === recordsId)

        if (index >= 0 && element.id === recordsId) {
            if (!_.isEqual(element, trimmedCsvObjects[index])) {
                Item = trimmedCsvObjects[index]
                let PutRequest = { PutRequest: {Item}}
                itemsToProcess.push(PutRequest);
            }
        } 
    })

    // find ids that exist in csv, but not in dynamo
    let csvIdsNotInDynamo = []
    csvIdsNotInDynamo = csvIds.filter(id => !dynamoIds.includes(id));
    
    // if id exists in csv, but not in dynamo, add object to dynamoItemsToUpdate.itemsToAddOrUpdate
    trimmedCsvObjects.forEach(element => {
        if (csvIdsNotInDynamo.includes(element.id)) {
            Item = element
            itemsToProcess.push({ PutRequest: {Item}})
        }
    })

    return itemsToProcess

} catch (ex) {
    console.error(ex);
    throw new Error(ex);
}
};
