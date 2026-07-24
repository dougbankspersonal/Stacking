// Doug

define([
  "dojo/string",
  "dojo/dom",
  "dojo/dom-style",
  "sharedJavascript/debugLog",
  "sharedJavascript/genericMeasurements",
  "sharedJavascript/genericUtils",
  "sharedJavascript/htmlUtils",
  "sharedJavascript/systemConfigs",
  "dojo/domReady!",
], function (
  string,
  dom,
  domStyle,
  debugLogModule,
  genericMeasurements,
  genericUtils,
  htmlUtils,
  systemConfigs,
) {
  var debugLog = debugLogModule.debugLog;

  function setCardSize(node) {
    var sc = systemConfigs.getSystemConfigs();
    debugLog("CardSize", "setCardSize sc.cardHeightPx = ", sc.cardHeightPx);
    debugLog("CardSize", "setCardSize sc.cardWidthPx = ", sc.cardWidthPx);
    var cardWidthPx = sc.cardWidthPx
      ? sc.cardWidthPx
      : genericMeasurements.standardCardWidthPx;
    var cardHeightPx = sc.cardHeightPx
      ? sc.cardHeightPx
      : genericMeasurements.standardCardHeightPx;

    domStyle.set(node, {
      width: `${cardWidthPx}px`,
      height: `${cardHeightPx}px`,
    });
  }

  function addPageOfCards(parent, opt_classArray) {
    var classes = genericUtils.growOptStringArray(
      opt_classArray,
      "page_of_cards",
    );
    var [_, pageOfItemsContents] = htmlUtils.addPageOfItemsAndContents(
      parent,
      classes,
    );
    return pageOfItemsContents;
  }

  function addRowOfCards(parent) {
    var classes = ["row_of_cards"];
    return htmlUtils.addDiv(parent, classes, "rowOfCards");
  }

  function maybeAddCardBackColor(cardBackNode, backConfig) {
    if (backConfig.hexColorString) {
      var otherColor = htmlUtils.blendHexColors(
        backConfig.hexColorString,
        "#ffffff",
      );
      var gradient = string.substitute(
        "radial-gradient(${color1}, ${color2})",
        {
          color1: otherColor,
          color2: backConfig.hexColorString,
        },
      );
      domStyle.set(cardBackNode, "background", gradient);
    }
  }

  function maybeAddCardBackTitle(cardBackNode, backConfig) {
    var titleNode;
    if (backConfig.title) {
      titleNode = htmlUtils.addDiv(
        cardBackNode,
        ["title"],
        "title",
        backConfig.title,
      );
    }
    return titleNode;
  }

  function addCardBack(parent, index, backConfig) {
    debugLog("addCardBack", "backConfig = " + JSON.stringify(backConfig));

    var cardsPerRow = systemConfigs.getSystemConfigs().cardsPerRow;
    debugLog("addCardBack", "cardsPerRow = " + cardsPerRow);
    debugLog("addCardBack", "index = " + index);

    if (backConfig.callback) {
      debugLog("addCardBack", "has callback");
      console.assert(
        typeof backConfig.callback === "function",
        "Expected backConfig.callback function",
      );
      var backNode = backConfig.callback(parent, index);
      setCardSize(backNode);
      return backNode;
    }
    debugLog("addCardBack", "no callback");

    debugLog(
      "addCardBack",
      "backConfig.classes = " + JSON.stringify(backConfig.classes),
    );

    var classes = backConfig.classes ? backConfig.classes : [];
    classes = classes.slice();
    classes.push("back");

    debugLog("addCardBack", "classes = " + JSON.stringify(classes));

    var cardBackNode = htmlUtils.addCard(parent, classes, "back");
    setCardSize(cardBackNode);

    maybeAddCardBackColor(cardBackNode, backConfig);

    maybeAddCardBackTitle(cardBackNode, backConfig);

    return cardBackNode;
  }

  function addCardFront(parent, classArray, id) {
    console.assert(parent, "parent is null");
    classArray.push("front");
    var node = htmlUtils.addCard(parent, classArray, id);
    setCardSize(node);

    return node;
  }

  function maybeNewPage(parent, currentPage, index) {
    debugLog("maybeNewPage", "maybeNewPage index = " + index.toString());
    var cardsPerPage = systemConfigs.getSystemConfigs().cardsPerPage;
    debugLog("maybeNewPage", "cardsPerPage = " + cardsPerPage);
    var needNew = index % cardsPerPage;
    debugLog("maybeNewPage", "needNew = " + needNew);
    if (needNew == 0) {
      debugLog("maybeNewPage", "new page for index = " + index.toString());
      return addPageOfCards(parent);
    }
    return currentPage;
  }

  function maybeNewRow(parent, currentRow, index) {
    var cardsPerRow = systemConfigs.getSystemConfigs().cardsPerRow;
    var needNew = index % cardsPerRow;
    if (needNew == 0) {
      debugLog(
        "Cards",
        "NewCardFu adding new row for index = " + index.toString(),
      );
      return addRowOfCards(parent);
    }
    return currentRow;
  }

  function addNthCard(
    bodyNode,
    pageOfCards,
    rowOfCards,
    addNthCardCallback,
    cardCount,
    configIndex,
  ) {
    debugLog("Cards", "addNthCard cardCount = " + cardCount.toString());
    debugLog("Cards", "addNthCard configIndex = " + configIndex.toString());
    pageOfCards = maybeNewPage(bodyNode, pageOfCards, cardCount);
    console.assert(pageOfCards, "pageOfCards is null");
    rowOfCards = maybeNewRow(pageOfCards, rowOfCards, cardCount);
    console.assert(rowOfCards, "rowOfCards is null");
    addNthCardCallback(rowOfCards, configIndex);
    return [pageOfCards, rowOfCards];
  }

  function addCards(numCards, frontCallback, backConfigs) {
    console.assert(
      Array.isArray(backConfigs),
      "Expected an array for backConfigs",
    );
    var sc = systemConfigs.getSystemConfigs();

    debugLog("Cards", "addCards: sc = " + JSON.stringify(sc));
    debugLog("Cards", "addCards: numCards = " + numCards);

    // Better be in cards mode.
    console.assert(sc.isCards, "Not in cards mode");

    var bodyNode = dom.byId("body");

    var pageOfCards;
    var rowOfCards;
    var cardCount = 0;

    for (var i = 0; i < backConfigs.length; i++) {
      var backConfig = backConfigs[i];
      debugLog(
        "addCards",
        "calling addNthCard for backConfig index = " + i.toString(),
      );
      [pageOfCards, rowOfCards] = addNthCard(
        bodyNode,
        pageOfCards,
        rowOfCards,
        function (rowOfCards, index) {
          debugLog(
            "addCards",
            "calling addCardBack for backConfig index = " +
              i.toString() +
              ", card index = " +
              index.toString(),
          );
          addCardBack(rowOfCards, index, backConfig);
          cardCount++;
        },
        cardCount,
        cardCount,
      );
    }

    for (let index = 0; index < numCards; index++) {
      debugLog("addCards", "addCards 001 i = " + index.toString());
      [pageOfCards, rowOfCards] = addNthCard(
        bodyNode,
        pageOfCards,
        rowOfCards,
        frontCallback,
        cardCount,
        index,
      );
      cardCount++;
    }

    debugLog("addCards", "backConfigs = ", JSON.stringify(backConfigs));
  }

  // Look for a "count" field.
  // If it's nil, it's assumed to be 1.
  // If it's explicitly 0, it's 0.
  // Else it's the given count.
  function getInstanceCountFromConfig(cardConfigs, index) {
    var config = cardConfigs[index];
    if (!config.hasOwnProperty("count")) {
      return 1;
    } else {
      return config.count ? config.count : 0;
    }
  }

  function getNumCardsFromConfigs(cardConfigs) {
    console.assert(cardConfigs, "cardConfigs is null");
    debugLog(
      "getNumCardsFromConfigs",
      "cardConfigs = " + JSON.stringify(cardConfigs),
    );
    debugLog(
      "getNumCardsFromConfigs",
      "cardConfigs.length = " + JSON.stringify(cardConfigs.length),
    );

    // If we are doing single-instance of each card config, rewrite the array.
    var sc = systemConfigs.getSystemConfigs();
    if (sc.singleCardInstance) {
      for (var i = 0; i < cardConfigs.length; i++) {
        cardConfigs[i].count = 1;
      }
      debugLog(
        "getNumCardsFromConfigs",
        "singleCardInstance is true: cardConfigs = " +
          JSON.stringify(cardConfigs),
      );
    }

    // Now count.
    var numCards = 0;
    for (var i = 0; i < cardConfigs.length; i++) {
      var instanceCount = getInstanceCountFromConfig(cardConfigs, i);
      numCards = numCards + instanceCount;
    }

    debugLog("getNumCardsFromConfigs", "initial numCards = " + numCards);
    debugLog("CardCount", "final numCards = " + numCards);
    return numCards;
  }

  // Card configs is ordered list of card descriptions (configs).
  // Each config must have a count field.
  // If the count field is missing or 0, we skip this config.
  function getCardConfigAtIndex(cardConfigs, index) {
    debugLog(
      "Cards",
      "getCardConfigAtIndex: cardConfigs = " + JSON.stringify(cardConfigs),
    );
    for (var i = 0; i < cardConfigs.length; i++) {
      var instanceCount = getInstanceCountFromConfig(cardConfigs, i);
      if (index < instanceCount) {
        return cardConfigs[i];
      }
      index -= instanceCount;
    }
    return null;
  }

  function getIndexWithinConfig(cardConfigs, index) {
    debugLog(
      "Cards",
      "getIndexWithinConfig: cardConfigs = " + JSON.stringify(cardConfigs),
    );
    debugLog("Cards", "getIndexWithinConfig: index = " + index);
    for (var i = 0; i < cardConfigs.length; i++) {
      var instanceCount = getInstanceCountFromConfig(cardConfigs, i);
      if (index < instanceCount) {
        return index;
      }
      index -= instanceCount;
    }
    return -1; // Not found.
  }

  function addFormattedCardFront(parent, index, className, configs) {
    var config = getCardConfigAtIndex(configs, index);

    var idElements = [className, index.toString()];
    var id = idElements.join(".");
    var classArray = [className];
    var frontNode = addCardFront(parent, classArray, id);

    var wrapper = htmlUtils.addDiv(
      frontNode,
      ["formatted-wrapper"],
      "formatted-wrapper",
    );
    if (config.title) {
      htmlUtils.addDiv(wrapper, ["title"], "title", config.title);
    }
    if (config.subtitle) {
      htmlUtils.addDiv(wrapper, ["subtitle"], "subtitle", config.subtitle);
    }
    if (config.rulesText) {
      var rulesTextNode = htmlUtils.addDiv(
        wrapper,
        ["rules_text"],
        "rulesText",
      );
      rulesTextNode.innerHTML = config.rulesText;
    }
  }

  // This returned object becomes the defined value of this module
  return {
    getCardConfigAtIndex: getCardConfigAtIndex,
    getIndexWithinConfig: getIndexWithinConfig,
    addFormattedCardFront: addFormattedCardFront,
    getNumCardsFromConfigs: getNumCardsFromConfigs,
    getInstanceCountFromConfig: getInstanceCountFromConfig,
    addCardFront: addCardFront,
    addCards: addCards,
    setCardSize: setCardSize,
    addCardBack: addCardBack,
  };
});
