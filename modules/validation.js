module.exports.checkAllValues = async (csvArray, allowedKeys) => {
	let valueCheck = [];
	// let passedValueCheck;
	let validationResults = {
		// passedValueCheck: passedValueCheck,
		elementsWithMissingValues: [],
		elementsWithMissingKeys: []
	}
	// let elementsWithMissingValues = [];

	csvArray.forEach((element) => {
		const valuesArray = Object.values(element);

		if (valuesArray.includes('')) {
			valueCheck.push(false);
			validationResults.elementsWithMissingValues.push(element);
		} else {
			valueCheck.push(true);
		}

		// Check element for missing keys
		const elementKeys = Object.keys(element);
		
		let missingKeys = allowedKeys.filter(key => {
			return !elementKeys.includes(key);
		  });
		
		if (missingKeys.length > 0 ) {
			validationResults.elementsWithMissingKeys.push(element);
			valueCheck.push(false);
		} else {
			return;
		}

	});

	if (valueCheck.includes(false)) {
		validationResults.passedValueCheck = false;
		// console.log(validationResults.passedValueCheck);
	} else {
		validationResults.passedValueCheck = true;
		// console.log(validationResults.passedValueCheck);
	}

	// console.log('valueCheck: ', valueCheck);
	// console.log('passedValueCheck: ', validationResults.passedValueCheck);
	return validationResults;
};

module.exports.removeIrrelevantPropertiesFromObjects = async (csvArray, allowedProperties) => {

    let filteredCsvObjects = [];
    csvArray.forEach(
        (element, index) =>
		
          (filteredCsvObjects[index] = Object.fromEntries(
            Object.entries(element).filter((element) =>
              allowedProperties.includes(element[0])
            )
          ))
      );

     return filteredCsvObjects;
}

// module.exports.checkForMissingKeys = async (JsonArray, allowedKeys) => {

// 	let objectsWithMissingKeys = []

// 	JsonArray.forEach(element => {
// 		const elementKeys = Object.keys(element);
		
// 		let missingKeys = allowedKeys.filter(key => {
// 			return !elementKeys.includes(key);
// 		  });
		
// 		if (missingKeys.length > 0 ) {
// 			objectsWithMissingKeys.push(element);
// 		} else {
// 			return;
// 		}
// 	})
// 	return objectsWithMissingKeys;
// }