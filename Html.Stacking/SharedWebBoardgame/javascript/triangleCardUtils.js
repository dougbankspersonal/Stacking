define([
  "dojo/dom-style",
  "sharedJavascript/cards",
  "sharedJavascript/debugLog",
  "sharedJavascript/htmlUtils",
  "sharedJavascript/triangleCardConstants",
  "dojo/domReady!",
], function (
  domStyle,
  cards,
  debugLogModule,
  htmlUtils,
  triangleCardConstants
) {
  var debugLog = debugLogModule.debugLog;

  const gSymbolToSpriteSheetGridSize = {
    //   [triangleCardConstants.symbolTypes.Relationships]: [4, 5],
    /* [triangleCardConstants.symbolTypes.Purpose]: [
      triangleCardConstants.purposeSpriteColumns,
      triangleCardConstants.purposeSpriteRows,
    ],*/
  };

  // Tracks all symbols added ever.
  var gSymbolToGlobalSymbolCount = {};

  function configureSymbolNode(
    symbolNode,
    symbolIndexInSector,
    symbolsThisSector,
    configs
  ) {
    debugLog(
      "configureSymbolNode",
      "symbolsThisSector = ",
      JSON.stringify(symbolsThisSector)
    );
    debugLog(
      "configureSymbolNode",
      "symbolIndexInSector = ",
      JSON.stringify(symbolIndexInSector)
    );
    debugLog("configureSymbolNode", "configs = ", JSON.stringify(configs));

    var symbolXPixels =
      configs.symbolXPxBySymbolCountAndIndex[symbolsThisSector][
        symbolIndexInSector
      ];
    var symbolYPixels =
      configs.symbolYPxBySymbolCountAndIndex[symbolsThisSector][
        symbolIndexInSector
      ];
    var symbolSizePx = configs.symbolSizePxBySymbolCount[symbolsThisSector];
    var symbolRotationDeg = configs.symbolRotationDeg
      ? configs.symbolRotationDeg
      : 0;

    debugLog(
      "Positioning",
      "symbolIndexInSector = ",
      JSON.stringify(symbolIndexInSector)
    );
    debugLog("Positioning", "symbolXPixels = ", JSON.stringify(symbolXPixels));
    debugLog("Positioning", "symbolYPixels = ", JSON.stringify(symbolYPixels));
    debugLog("Positioning", "symbolSizePx = ", JSON.stringify(symbolSizePx));
    debugLog(
      "Positioning",
      "symbolRotationDeg = ",
      JSON.stringify(symbolRotationDeg)
    );

    domStyle.set(symbolNode, {
      width: symbolSizePx + "px",
      height: symbolSizePx + "px",
      transform: `translate(${symbolXPixels}px, ${symbolYPixels}px) rotate(${symbolRotationDeg}deg)`,
    });
  }

  function addNumberForSymbol(
    symbolNode,
    symbolIndex,
    numbersForSymbol,
    symbolSizePx
  ) {
    console.assert(symbolIndex < numbersForSymbol.length);
    debugLog(
      "addNumberForSymbol",
      "symbolIndex = ",
      JSON.stringify(symbolIndex)
    );
    debugLog(
      "addNumberForSymbol",
      "numbersForSymbol = ",
      JSON.stringify(numbersForSymbol)
    );
    var number = numbersForSymbol[symbolIndex];
    var numberNode = htmlUtils.addDiv(
      symbolNode,
      ["symbol-number"],
      "symbol-number",
      number.toString()
    );
    domStyle.set(numberNode, {
      "font-size": symbolSizePx * 0.6 + "px",
    });
    return numberNode;
  }

  function addSpriteSheetInfo(symbolNode, symbolType, indexIntoSpriteSheet) {
    // Get the sprite info on this symbol type.
    var spriteSheetGridSize = gSymbolToSpriteSheetGridSize[symbolType];
    console.assert(spriteSheetGridSize, "spriteSheetGridSize is null");

    var numColumns = spriteSheetGridSize[0];
    var numRows = spriteSheetGridSize[1];

    var thisColumn = indexIntoSpriteSheet % numColumns; // 0..columns-1
    var thisRow = Math.floor(indexIntoSpriteSheet / numColumns) % numRows; // 0..rows-1

    // I think of cells like
    // [0, 0], [1, 0], [2, 0]
    // [0, 1], [1, 1], [2, 1
    // etc.
    // For background position w percents, you are sliding the sheet around: to get to the second
    // row slide up (negative) by 1 row height.
    var xPercentPosition = (100 * thisColumn) / (numColumns - 1);
    var yPercentPosition = (100 * thisRow) / (numRows - 1);

    domStyle.set(symbolNode, {
      "background-size": `${numColumns * 100}% ${numRows * 100}%`,
      "background-position": `${xPercentPosition}% ${yPercentPosition}%`,
    });
  }

  function addNSymbols(
    sectorNode, // Node to add symbols too.
    sectorIndex, // Which sector are we talking about.
    symbolType, // Which symbol.
    thisSymbolCount, // How many to add?
    numSymbolsPreviouslyAdded, // How many symbols already added to this sector?
    totalSymbolsInThisSector, // How many total symbols will there be in this sector?
    numbersBySymbolType, // Map from symbol type to numbers to use to config the symbol.
    configs
  ) {
    debugLog("addNSymbols", "sectorIndex = ", JSON.stringify(sectorIndex));
    debugLog("addNSymbols", "symbolType = ", JSON.stringify(symbolType));
    debugLog("addNSymbols", "thisSymbolCount =", thisSymbolCount);
    debugLog(
      "addNSymbols",
      "numSymbolsPreviouslyAdded =",
      numSymbolsPreviouslyAdded
    );
    debugLog(
      "addNSymbols",
      "totalSymbolsInThisSector =",
      totalSymbolsInThisSector
    );
    debugLog(
      "addNSymbols",
      "numbersBySymbolType = ",
      JSON.stringify(numbersBySymbolType)
    );
    debugLog("addNSymbols", "configs = ", JSON.stringify(configs));

    var numbersForSymbol = null;
    if (numbersBySymbolType && numbersBySymbolType[symbolType]) {
      numbersForSymbol = numbersBySymbolType[symbolType];
    }

    for (var i = 0; i < thisSymbolCount; i++) {
      var usesSpriteSheet = gSymbolToSpriteSheetGridSize[symbolType] != null;
      var cssClasses = ["symbol-image", symbolType];

      if (usesSpriteSheet) {
        cssClasses.push("uses-sprite-sheet");
      }
      var globalSymbolCount = gSymbolToGlobalSymbolCount[symbolType] || 0;

      var symbolNode = htmlUtils.addImage(
        sectorNode,
        cssClasses,
        "symbol-image-" + symbolType + "-" + i
      );

      configureSymbolNode(
        symbolNode,
        numSymbolsPreviouslyAdded + i,
        totalSymbolsInThisSector,
        configs
      );

      // Numbers, sprite sheet: numbers are index into sprite sheet.
      // No numbers, sprite sheet: use global symbol count as index into sprite sheet.
      // Numbers, no sprite sheet: write number over symbol.
      // No number, no sprite sheet: nothing to do.
      if (usesSpriteSheet) {
        var indexIntoSpriteSheet;
        if (numbersForSymbol) {
          indexIntoSpriteSheet = numbersForSymbol[i];
        } else {
          indexIntoSpriteSheet = globalSymbolCount;
        }
        addSpriteSheetInfo(symbolNode, symbolType, indexIntoSpriteSheet);
      } else {
        if (numbersForSymbol) {
          var symbolSizePx =
            configs.symbolSizePxBySymbolCount[totalSymbolsInThisSector];
          addNumberForSymbol(symbolNode, i, numbersForSymbol, symbolSizePx);
        }
      }

      // Keep a global count.
      if (!gSymbolToGlobalSymbolCount[symbolType]) {
        gSymbolToGlobalSymbolCount[symbolType] = 0;
      }
      gSymbolToGlobalSymbolCount[symbolType]++;
    }
  }

  function addNthSector(parentNode, sectorIndex, classes, opt_styling) {
    debugLog("addNthSector", "parentNode = ", parentNode);
    debugLog("addNthSector", "sectorIndex = ", sectorIndex);

    var finalClasses = classes.slice();
    finalClasses.push("sector");
    finalClasses.push("sector-index-" + sectorIndex);

    var sectorNode = htmlUtils.addDiv(
      parentNode,
      finalClasses,
      "sector-index-" + sectorIndex
    );

    if (opt_styling) {
      domStyle.set(sectorNode, opt_styling);
    }

    return sectorNode;
  }

  function addCardFrontAndWrapper(parentNode, cardConfig, index) {
    debugLog(
      "triangleCards",
      "in addCardFront i == " +
        index +
        " cardConfig = " +
        JSON.stringify(cardConfig)
    );
    var id = "triangle-" + index;
    var classes = cardConfig.classes ? cardConfig.classes.slice() : [];
    classes.push("triangle");
    var cardFrontNode = cards.addCardFront(parentNode, classes, id);

    var classes = ["front-wrapper"];
    if (cardConfig.isStarterCard) {
      classes.push("starter");
    }
    if (cardConfig.season) {
      classes.push("season-" + cardConfig.season);
    }
    var frontWrapperNode = htmlUtils.addDiv(
      cardFrontNode,
      classes,
      "front-wrapper"
    );
    return [cardFrontNode, frontWrapperNode];
  }

  var seasonNames = [null, "Spring", "Summer", "Autumn", "Winter"];
  function getSeasonName(season) {
    console.assert(seasonNames[season] !== null, "Invalid season " + season);
    return seasonNames[season];
  }

  // This returned object becomes the defined value of this module
  return {
    addNthSector: addNthSector,
    addCardFrontAndWrapper: addCardFrontAndWrapper,
    getSeasonName: getSeasonName,
  };
});
