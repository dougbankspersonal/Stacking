define(["sharedJavascript/debugLog", "dojo/domReady!"], function (
  debugLogModule,
) {
  var debugLog = debugLogModule.debugLog;
  // validKeys maps keys to "true".
  // Passes if every key in table is in validKeys.
  // Does not check types.
  // Does not check the inverse: table may be missing some validKeys.
  function sanityCheckTable(table, validKeys) {
    for (var key in table) {
      if (!validKeys[key]) {
        console.assert(false, "sanityCheckTable: invalid key: " + key);
        return false;
      }
    }
    return true;
  }

  function getIndexOfFirstInstanceInArray(orderedRowTypes, thisRowType) {
    for (var i = 0; i < orderedRowTypes.length; i++) {
      var rowType = orderedRowTypes[i];
      if (rowType == thisRowType) {
        return i;
      }
    }
    return null;
  }

  function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

  function createSeededGetZeroToOneRandomFunction(seed) {
    let currentSeed = seed;

    // Simple linear congruential generator (LCG)
    return function () {
      currentSeed = (currentSeed * 9301 + 49297) % 233280;
      return currentSeed / 233280;
    };
  }

  // Note max is INCLUDED: range is [min, max]
  function getRandomIntInRange(min, max, getRandomZeroToOne) {
    return Math.floor(min + getRandomZeroToOne() * (1 + max - min));
  }

  // This gives back elements at n uniuqe instances in the array.
  function getRandomNonRepeatingArrayElements(
    array,
    numElements,
    getRandomZeroToOne,
  ) {
    var shuffled = array.slice(0),
      i = array.length,
      min = i - numElements,
      temp,
      index;
    while (i-- > min) {
      index = Math.floor((i + 1) * getRandomZeroToOne());
      temp = shuffled[index];
      shuffled[index] = shuffled[i];
      shuffled[i] = temp;
    }
    return shuffled.slice(min);
  }

  // Pick an element from the array.
  // All elements have same chance.
  function getRandomArrayElement(array, getRandomZeroToOne) {
    debugLog(
      "getRandomArrayElement",
      "getRandomArrayElement: array = " + array,
    );
    return getRandomNonRepeatingArrayElements(array, 1, getRandomZeroToOne)[0];
  }

  // Pick an element from the array.
  // Each element has a weight.  Weight = extra ticket in the raffle.
  // So if I pass in [1, 2, 3] and [10, 1, 1], then 1 is 10x more likely to be picked than 2 or 3.
  function getRandomArrayElementWeighted(array, weights, getRandomZeroToOne) {
    debugLog(
      "getRandomArrayElementWeighted",
      "getRandomArrayElementWeighted: array = " + array,
    );
    var totalWeight = weights.reduce((a, b) => a + b, 0);
    var randomValue = getRandomZeroToOne() * totalWeight;
    for (var i = 0; i < array.length; i++) {
      if (randomValue < weights[i]) {
        return array[i];
      }
      randomValue -= weights[i];
    }
    return array[array.length - 1]; // Fallback
  }

  // Histogram maps key to int.
  // Int is relative "weight" of that key.
  // Return a key, randomly selected according to weights.
  function getRandomKeyFromHistogram(histogram, getRandomZeroToOne) {
    var keys = Object.keys(histogram);
    var weights = keys.map((key) => histogram[key]);
    return getRandomArrayElementWeighted(keys, weights, getRandomZeroToOne);
  }

  function getRandomMaybeRepeatingArrayElements(
    array,
    numElements,
    getRandomZeroToOne,
  ) {
    var result = [];
    for (var i = 0; i < numElements; i++) {
      result.push(getRandomArrayElement(array, getRandomZeroToOne));
    }
    return result;
  }

  function getRandomArrayElementNotMatching(
    array,
    skippedValues,
    getRandomZeroToOne,
  ) {
    while (1) {
      var element = getRandomArrayElement(array, getRandomZeroToOne);
      if (!skippedValues.includes(element)) {
        return element;
      }
    }
  }

  function isString(value) {
    return typeof value === "string";
  }

  // opt_stringArray is array of strings or null.
  // If null treat like empty array.
  // addedStringOrStrings is string or array of strings.
  // If addedStringOrStrings is a string, add to opt_stringArray.
  // If addedStringOrStrings is an array, concatenate to opt_stringArray.
  function growOptStringArray(opt_existingStringArray, addedStringOrStrings) {
    var existingStringArray = opt_existingStringArray
      ? opt_existingStringArray
      : [];
    console.assert(
      typeof existingStringArray === "object",
      "existingStringArray is not an object",
    );
    if (isString(addedStringOrStrings)) {
      existingStringArray.push(addedStringOrStrings);
      return existingStringArray;
    } else {
      // must be an array
      var newStringArray = existingStringArray.concat(addedStringOrStrings);
      return newStringArray;
    }
  }

  function stringToBoolean(str, opt_defaultValue) {
    if (typeof str !== "string") {
      return opt_defaultValue !== undefined ? opt_defaultValue : false;
    }
    return str === "true";
  }

  function getCommonQueryParams() {
    var queryString = window.location.search;
    // Create a URLSearchParams object
    var params = new URLSearchParams(queryString);
    // Get individual parameters
    // screentop defaults to true.
    var isScreentop = stringToBoolean(params.get("isScreentop"), true);
    var skipCardBacks = stringToBoolean(params.get("skipCardBacks"));
    var singleCardInstance = stringToBoolean(params.get("singleCardInstance"));
    var debugLogFlagsString = params.get("debugLogFlags");
    // Assume this is a comma separated string of strings.  Parse to an array of strings.
    var debugLogFlagsArray = debugLogFlagsString
      ? debugLogFlagsString.split(",")
      : [];
    // Just set it now:
    console.log("debugLogFlagsArray = ", JSON.stringify(debugLogFlagsArray));

    debugLogModule.setEnabledFlags(debugLogFlagsArray);
    return {
      isScreentop: isScreentop,
      skipCardBacks: skipCardBacks,
      singleCardInstance: singleCardInstance,
      debugFlags: debugLogFlagsArray,
    };
  }

  // We given some array where each element is unique value.
  // We are going to randomlys select an element from the array n times.
  // The result is expressed as a histogram mapping array member to count.
  function randomHistogramFromArray(count, array, getRandomZeroToOne) {
    var histogram = {};
    for (var i = 0; i < count; i++) {
      var element = getRandomArrayElement(array, getRandomZeroToOne);
      if (histogram[element]) {
        histogram[element]++;
      } else {
        histogram[element] = 1;
      }
    }
    return histogram;
  }

  // Given two js tables are they the same: both keys and contents, recursively.
  function tablesMatch(table1, table2) {
    if (Object.keys(table1).length !== Object.keys(table2).length) {
      return false;
    }
    for (var key in table1) {
      if (!table2.hasOwnProperty(key)) {
        return false;
      }
      var value1 = table1[key];
      var value2 = table2[key];
      if (typeof value1 === "object" && typeof value2 === "object") {
        if (!tablesMatch(value1, value2)) {
          return false;
        }
      } else if (value1 !== value2) {
        return false;
      }
    }
    return true;
  }

  // Call randomHistogramFromArray on the given inputs: note that result.
  // Do it again until the second result is different from the first.
  // Return array of two histograms.
  function generateNonMatchingHistograms(count, array, getRandomZeroToOne) {
    var histograms;
    debugLog("CardConfigs", "generateNonMatchingHistograms");

    var firstHistogram = randomHistogramFromArray(
      count,
      array,
      getRandomZeroToOne,
    );
    for (var z = 0; z < 1000; z++) {
      var secondHistogram = randomHistogramFromArray(
        count,
        array,
        getRandomZeroToOne,
      );
      if (!tablesMatch(firstHistogram, secondHistogram)) {
        histograms = [firstHistogram, secondHistogram];
        debugLog(
          "CardConfigs",
          "generateNonMatchingHistograms returning histograms = " +
            JSON.stringify(histograms),
        );
        return histograms;
      }
    }
    console.assert(false, "Early exit from generateNonMatchingHistograms");
  }

  function sumHistogram(opt_histogram) {
    var histogram = opt_histogram ? opt_histogram : {};
    var sum = 0;
    for (var key in histogram) {
      sum += histogram[key];
    }
    return sum;
  }

  function copyAndShuffleArray(array, getRandomZeroToOne) {
    debugLog(
      "copyAndShuffleArray",
      "copyAndShuffleArray: array = " + JSON.stringify(array),
    );
    var shuffled = array.slice(0),
      i = array.length,
      temp,
      index;
    while (i--) {
      index = Math.floor((i + 1) * getRandomZeroToOne());
      temp = shuffled[index];
      shuffled[index] = shuffled[i];
      shuffled[i] = temp;
    }
    return shuffled;
  }

  // Given:
  // - array of possible values.
  // - count of how many values we want.
  // - a map from value type to number: in the result, each value can appear at most this many times.
  // - a map from value type to number: how many times can each value appear ever, across multiple calls to this function.
  // - a map from value type to number: how many times was this value selected in previous calls to the function.
  // - zero to one randomizing function.
  //
  // Hand back an array of values randomly selected from the array, respecting the above requirements.
  const gMaxDeltaAsFractionOfMax = 0.07;
  function getRandomsFromArrayWithControls(
    arrayOfValues,
    requestedCount,
    maxCountThisCallByValue,
    maxCountEverByValue,
    historicCountByValue,
    getRandomZeroToOne,
  ) {
    debugLog(
      "getRandomsFromArrayWithControls",
      "getRandomsFromArrayWithControls arrayOfValues = ",
      JSON.stringify(arrayOfValues),
    );
    debugLog(
      "getRandomsFromArrayWithControls",
      "getRandomsFromArrayWithControls requestedCount = ",
      JSON.stringify(requestedCount),
    );
    debugLog(
      "getRandomsFromArrayWithControls",
      "getRandomsFromArrayWithControls maxCountThisCallByValue = ",
      JSON.stringify(maxCountThisCallByValue),
    );
    debugLog(
      "getRandomsFromArrayWithControls",
      "getRandomsFromArrayWithControls maxCountEverByValue = ",
      JSON.stringify(maxCountEverByValue),
    );
    debugLog(
      "getRandomsFromArrayWithControls",
      "getRandomsFromArrayWithControls historicCountByValue = ",
      JSON.stringify(historicCountByValue),
    );

    // Some of this mahy be inefficient overkill, don't care.
    var retVal = [];
    var usesThisCallByValue = {};

    // Little helper function: this value that came in as part of arrayOfValues: should we consider it?
    function isValidCandidate(candidateValue) {
      // This is not eligibile if it's been used too much this call.
      var usesThisCall = usesThisCallByValue[candidateValue] || 0;
      if (usesThisCall >= maxCountThisCallByValue[candidateValue]) {
        return false;
      }

      // Not eligible if at or over the max allowed for this value.
      var maxCountEver = maxCountEverByValue[candidateValue] || 0;
      var historicCount = historicCountByValue[candidateValue] || 0;
      if (historicCount >= maxCountEver) {
        return false;
      }

      // We don't want any one value to get too far ahead of the others.
      var fractionConsumedByValue = {};
      for (var i = 0; i < arrayOfValues.length; i++) {
        var arrayValue = arrayOfValues[i];
        var historicCount = historicCountByValue[arrayValue] || 0;
        var maxCountEver = maxCountEverByValue[arrayValue] || 0;
        fractionConsumedByValue[arrayValue] = historicCount / maxCountEver;
      }

      debugLog(
        "getRandomsFromArrayWithControls",
        "fractionConsumedByValue = ",
        JSON.stringify(fractionConsumedByValue),
      );

      // This value should not be max fraction above next highest.
      var thisFraction = fractionConsumedByValue[candidateValue] || 0;
      for (var fValue in fractionConsumedByValue) {
        if (fValue !== candidateValue) {
          var otherFraction = fractionConsumedByValue[fValue] || 0;
          if (thisFraction > otherFraction + gMaxDeltaAsFractionOfMax) {
            return false;
          }
        }
      }
      return true;
    }

    for (var i = 0; i < requestedCount; i++) {
      // Make a new copy of arrayOfValues, including only choices that are still valid.
      var modifiedArrayOfValues = [];
      for (var j = 0; j < arrayOfValues.length; j++) {
        var candidateValue = arrayOfValues[j];
        if (isValidCandidate(candidateValue)) {
          modifiedArrayOfValues.push(candidateValue);
        }
      }

      // If this is empty, we don't have any possible choices: freak out and return null.
      if (modifiedArrayOfValues.length == 0) {
        console.assert(false, "modifiedArrayOfValues is empty");
        return null;
      }

      // Pick a random element from the modified array.
      var selectedValue = getRandomArrayElement(
        modifiedArrayOfValues,
        getRandomZeroToOne,
      );
      retVal.push(selectedValue);

      // Updated our usage counts.
      usesThisCallByValue[selectedValue] =
        (usesThisCallByValue[selectedValue] || 0) + 1;
      historicCountByValue[selectedValue] =
        (historicCountByValue[selectedValue] || 0) + 1;
    }

    // Return the array of selected values.

    debugLog(
      "getRandomsFromArrayWithControls",
      "retVal = ",
      JSON.stringify(retVal),
    );

    // Hackery, remove.
    var matches = 0;
    if (retVal.length == 3) {
      for (var i = 0; i < retVal.length - 1; i++) {
        for (var j = i + 1; j < retVal.length; j++) {
          if (retVal[i] == retVal[j]) {
            ++matches;
          }
        }
      }
    }
    if (matches == 3) {
      debugLog("getRandomsFromArrayWithControls", "TRIPLE MATCH");
      debugLog("getRandomsFromArrayWithControls", "TRIPLE MATCH");
      debugLog("getRandomsFromArrayWithControls", "TRIPLE MATCH");
      debugLog("getRandomsFromArrayWithControls", "TRIPLE MATCH");
      debugLog("getRandomsFromArrayWithControls", "TRIPLE MATCH");
      debugLog("getRandomsFromArrayWithControls", "TRIPLE MATCH");
    }

    return retVal;
  }

  // This should be a number with a sane value.
  function assertIsNumber(value, varName) {
    if (typeof value !== "number" || isNaN(value)) {
      console.assert(
        false,
        'Expected "' +
          varName +
          '" to be a number, got : ' +
          typeof value +
          " with value = " +
          value,
      );
    }
  }

  function generateRandomizedArray(array, getRandomZeroToOne) {
    var shuffled = array.slice(0),
      i = array.length,
      temp,
      index;

    while (i > 0) {
      index = Math.floor(getRandomZeroToOne() * i);
      i -= 1;
      temp = shuffled[i];
      shuffled[i] = shuffled[index];
      shuffled[index] = temp;
    }

    return shuffled;
  }

  return {
    assertIsNumber: assertIsNumber,
    sanityCheckTable: sanityCheckTable,
    getIndexOfFirstInstanceInArray: getIndexOfFirstInstanceInArray,
    getRandomInt: getRandomInt,
    createSeededGetZeroToOneRandomFunction:
      createSeededGetZeroToOneRandomFunction,
    getRandomIntInRange: getRandomIntInRange,
    getRandomArrayElement: getRandomArrayElement,
    getRandomArrayElementNotMatching: getRandomArrayElementNotMatching,
    getRandomNonRepeatingArrayElements: getRandomNonRepeatingArrayElements,
    getRandomMaybeRepeatingArrayElements: getRandomMaybeRepeatingArrayElements,
    getRandomArrayElementWeighted: getRandomArrayElementWeighted,
    getRandomKeyFromHistogram: getRandomKeyFromHistogram,
    growOptStringArray: growOptStringArray,
    stringToBoolean: stringToBoolean,
    getCommonQueryParams: getCommonQueryParams,
    generateNonMatchingHistograms: generateNonMatchingHistograms,
    tablesMatch: tablesMatch,
    randomHistogramFromArray: randomHistogramFromArray,
    sumHistogram: sumHistogram,
    copyAndShuffleArray: copyAndShuffleArray,
    getRandomsFromArrayWithControls: getRandomsFromArrayWithControls,
    generateRandomizedArray: generateRandomizedArray,
  };
});
