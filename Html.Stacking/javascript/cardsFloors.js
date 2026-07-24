define([
  "sharedJavascript/cards",
  "sharedJavascript/debugLog",
  "sharedJavascript/htmlUtils",
  "sharedJavascript/genericUtils",
  "javascript/cardsData",
  "dojo/domReady!",
], function (cards, debugLog, htmlUtils, genericUtils, cardsData) {
  var debugLog = debugLog.debugLog;

  var getRandomZeroToOne =
    genericUtils.createSeededGetZeroToOneRandomFunction(83743874);

  function maybeAddExtraPowers(parent, colorIndex, storyIndex) {
    var key = cardsData.makeStoryAndColorKey(storyIndex, colorIndex);
    var extraPowerClass = cardsData.storyIndexToExtraPowerClass[key];
    if (extraPowerClass) {
      var classes = ["extra-power", extraPowerClass];
      return htmlUtils.addImage(parent, classes, "extra-power-" + key);
    }
    return null;
  }

  function addZoneDetails(parent, arity, colorIndex, storyIndex) {
    var zoneNode = htmlUtils.addDiv(parent, [
      "zone",
      arity,
      "color-" + colorIndex,
    ]);

    var storyNumberNode = htmlUtils.addDiv(
      zoneNode,
      ["story-number"],
      "story-number-" + storyIndex,
      storyIndex + 1,
    );

    maybeAddExtraPowers(zoneNode, colorIndex, storyIndex);
    return zoneNode;
  }

  function addNthCard(parent, index) {
    debugLog("addNthCard", "index = " + index.toString());

    var cardConfigs = cardsData.getCardConfigs();
    var cardConfig = cardConfigs[index];

    var classes = ["story"];
    var cardFront = cards.addCardFront(parent, classes, "card-" + index);

    addZoneDetails(
      cardFront,
      "primary",
      cardConfig.primaryColorIndex,
      cardConfig.primaryStoryIndex,
    );
    addZoneDetails(
      cardFront,
      "secondary",
      cardConfig.secondaryColorIndex,
      cardConfig.secondaryStoryIndex,
    );

    return cardFront;
  }

  function addCardBack(parent) {
    var cardBackNode = htmlUtils.addDiv(parent, ["card", "back", "story"]);
    var titleNode = htmlUtils.addDiv(
      cardBackNode,
      ["title"],
      "card-back-title",
    );
    var subNode = htmlUtils.addDiv(titleNode, ["sub"], "card-back-sub", "Top");
    var mainNode = htmlUtils.addDiv(
      titleNode,
      ["main"],
      "card-back-main",
      "Floor",
    );
    return cardBackNode;
  }

  return {
    addNthCard: addNthCard,
    addCardBack: addCardBack,
  };
});
