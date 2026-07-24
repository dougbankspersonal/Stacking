define([
  "sharedJavascript/debugLog",
  "sharedJavascript/genericUtils",
  "dojo/domReady!",
], function (debugLog, genericUtils) {
  var debugLog = debugLog.debugLog;

  var getRandomZeroToOne =
    genericUtils.createSeededGetZeroToOneRandomFunction(395984009);

  const gNumCardColors = 5;
  const gMaxStories = 6;
  const gNumCopies = 4;
  const gMixExtraColorIndex = 10;
  const gWildCardPrimaryColorIndex = gMixExtraColorIndex;
  const gWildCardSecondaryColorIndex = gMixExtraColorIndex + 1;

  console.assert(
    gMixExtraColorIndex >= gNumCardColors,
    "gMixExtraColorIndex should be greater than or equal to gNumCardColors",
  );

  var gCardConfigs = [];

  const gStoryAndColorToExtraPowerClass = {
    /*
    "0_2": "extra-turn",
    "1_4": "trade",
    "2_7": "recycle",
    "3_9": "draw3",
    */
  };

  function makeStoryAndColorKey(storyIndex, colorIndex) {
    var storyValue = storyIndex + 1;
    var retVal = colorIndex.toString() + "_" + storyValue.toString();
    return retVal;
  }

  function getPermutedStoryIndices() {
    var permutedStoryIndices = [];
    for (var j = gMaxStories / 2; j < gMaxStories; j++) {
      permutedStoryIndices.push(j);
    }

    permutedStoryIndices = genericUtils.copyAndShuffleArray(
      permutedStoryIndices,
      getRandomZeroToOne,
    );
    debugLog(
      "generateCardConfigs",
      "permutedStoryIndices = " + JSON.stringify(permutedStoryIndices),
    );
    return permutedStoryIndices;
  }

  function addConfigsForColorPair(
    cardConfigs,
    primaryColorIndex,
    secondaryColorIndex,
  ) {
    var permutedStoryIndices = getPermutedStoryIndices();

    for (var storyIndex = 0; storyIndex < gMaxStories / 2; storyIndex++) {
      var primaryStoryIndex = storyIndex;
      var secondaryStoryIndex = permutedStoryIndices[storyIndex];
      debugLog(
        "generateCardConfigs",
        "primaryStoryIndex = " + primaryStoryIndex,
      );
      debugLog(
        "generateCardConfigs",
        "secondaryStoryIndex = " + secondaryStoryIndex,
      );
      console.assert(
        primaryStoryIndex !== secondaryStoryIndex,
        "primaryStoryIndex and secondaryStoryIndex should not be equal",
      );
      var cardConfig = {
        primaryColorIndex: primaryColorIndex,
        secondaryColorIndex: secondaryColorIndex,
        primaryStoryIndex: primaryStoryIndex,
        secondaryStoryIndex: secondaryStoryIndex,
      };
      cardConfigs.push(cardConfig);
    }
    return cardConfigs;
  }

  function addWildCardConfigs(cardConfigs) {
    for (var storyIndex = 0; storyIndex < gMaxStories; storyIndex++) {
      var cardConfig = {
        primaryColorIndex: gWildCardPrimaryColorIndex,
        secondaryColorIndex: gWildCardSecondaryColorIndex,
        primaryStoryIndex: storyIndex,
        secondaryStoryIndex: storyIndex,
      };
      cardConfigs.push(cardConfig);
    }
    return cardConfigs;
  }

  function addColoredCardConfigs(cardConfigs) {
    for (var k = 0; k < gNumCopies; k++) {
      debugLog("generateCardConfigs", "k = " + k.toString());
      for (var i = 0; i < gNumCardColors; i++) {
        var primaryColorIndex = i;
        for (var j = 1; j < gNumCardColors; j++) {
          var secondaryColorIndex = (j + i) % gNumCardColors;
          console.assert(
            primaryColorIndex !== secondaryColorIndex,
            "primaryColorIndex and secondaryColorIndex should not be equal",
          );

          cardConfigs = addConfigsForColorPair(
            cardConfigs,
            primaryColorIndex,
            secondaryColorIndex,
          );
        }
      }
    }
    return cardConfigs;
  }

  function generateCardConfigs() {
    var cardConfigs = [];

    cardConfigs = addColoredCardConfigs(cardConfigs);
    cardConfigs = addWildCardConfigs(cardConfigs);
    return cardConfigs;
  }

  function getCardConfigs() {
    if (gCardConfigs.length === 0) {
      gCardConfigs = generateCardConfigs();
    }
    return gCardConfigs;
  }

  function getNumCardConfigs() {
    var cardConfigs = getCardConfigs();
    return cardConfigs.length;
  }

  return {
    numColors: gNumCardColors,
    maxStories: gMaxStories,
    numCopies: gNumCopies,
    storyIndexToExtraPowerClass: gStoryAndColorToExtraPowerClass,

    getCardConfigs: getCardConfigs,
    getNumCardConfigs: getNumCardConfigs,
    makeStoryAndColorKey: makeStoryAndColorKey,
  };
});
