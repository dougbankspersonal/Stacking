//
// Model for setting system configs as we generate this or that page.
// Custom this boardgame module: the allowed configs have to do with questions of
// card size, how we print things, etc.
define([
  "sharedJavascript/debugLog",
  "sharedJavascript/genericMeasurements",
  "sharedJavascript/genericUtils",
  "dojo/domReady!",
], function (debugLogModule, genericMeasurements, genericUtils) {
  var debugLog = debugLogModule.debugLog;

  var _systemConfigs = {};

  var validSystemConfigKeys = {
    //---------------------------
    //
    // Vars for cards
    //
    //---------------------------
    isCards: true,
    // How many cards before we add a page break?
    cardsPerPage: true,
    // Alt size of cards.
    cardWidthPx: true,
    cardHeightPx: true,
    cardBackFontSize: true,
    // Do all card fronts separate from backs: we are not gonna print double sided,
    // we print fronts and backs and then stick em together.
    separateBacks: true,
    // Sometimes we just want one of each type of card, no dups.
    singleCardInstance: true,
    // Do not render card backs.
    skipCardBacks: true,
    // For cards, no margin around them.
    cardsNoMargin: true,
    // Should be able to figure out cards per row based on card width and page width but
    // somehow it's off and I'm too lazy to fix.
    cardsPerRow: true,

    //---------------------------
    //
    // Vars for boards
    //
    //---------------------------
    maxRowsPerPage: true,
    maxColumnsPerPage: true,

    //---------------------------
    //
    // Other stuff.
    //
    //---------------------------
    // Thing is pageless, we don't want boundaries on size or page breaks.
    pageless: true,
    // This is a demo game board (demo meaning it's an image of a game board, not
    // the board broken into pieces across pages for printing)
    demoBoard: true,
    // Can override page width.
    explicitPageWidth: true,

    // Extra class to apply to page-of-items div.
    extraClassesForPageOfItemsContents: true,

    gridGap: true,

    // Print landscape.
    landscape: true,

    pageOfItemsContentsPaddingPx: true,

    // Add page numbers to bottom corner of page.
    addPageNumbers: true,
  };

  function sanityCheckConfigs(configs) {
    genericUtils.sanityCheckTable(configs, validSystemConfigKeys);
  }

  // This and all "Add" functions:
  // Take in optional default: this is what you start with.
  // Apply some values.
  // Use some standard value unless an override is passed in, then use that.
  function addCardSystemConfigs(opt_defaultSc, opt_overrides) {
    debugLog(
      "addCardSystemConfigs",
      "opt_defaultSc = " + JSON.stringify(opt_defaultSc),
    );
    debugLog(
      "addCardSystemConfigs",
      "opt_overrides = " + JSON.stringify(opt_overrides),
    );
    var defaultSc = opt_defaultSc ? opt_defaultSc : {};
    var overrides = opt_overrides ? opt_overrides : {};

    var cardWidthPx =
      overrides.cardWidthPx !== undefined
        ? overrides.cardWidthPx
        : genericMeasurements.standardCardWidthPx;
    var cardHeightPx = overrides.cardHeightPx
      ? overrides.cardHeightPx
      : genericMeasurements.standardCardHeightPx;

    var cardsPerPage =
      Math.floor(genericMeasurements.adjustedPageWidth / cardWidthPx) *
      Math.floor(genericMeasurements.adjustedPageHeight / cardHeightPx);

    var cardsPerRow = overrides.cardsPerRow
      ? overrides.cardsPerRow
      : Math.floor(genericMeasurements.adjustedPageWidth / cardWidthPx);

    var outputSc = structuredClone(defaultSc);

    outputSc.cardsPerPage = cardsPerPage;
    outputSc.cardWidthPx = cardWidthPx;
    outputSc.cardHeightPx = cardHeightPx;
    outputSc.cardsPerRow = cardsPerRow;
    outputSc.cardBackFontSize = overrides.cardBackFontSize;
    outputSc.gridGap = genericMeasurements.standardPageGap;
    outputSc.isCards = true;
    debugLog(
      "addCardSystemConfigs",
      "addCardSystemConfigs outputSc = " + JSON.stringify(outputSc),
    );

    return outputSc;
  }

  function addSmallCardSystemConfigs(opt_defaultSc, opt_overrides) {
    var defaultSc = opt_defaultSc ? opt_defaultSc : {};
    var overrides = opt_overrides ? opt_overrides : {};

    overrides.cardWidthPx =
      overrides.cardWidthPx !== undefined
        ? overrides.cardWidthPx
        : genericMeasurements.smallCardWidthPx;

    overrides.cardHeightPx =
      overrides.cardHeightPx !== undefined
        ? overrides.cardHeightPx
        : genericMeasurements.smallCardHeightPx;

    return addCardSystemConfigs(defaultSc, overrides);
  }

  function addLandscapeSystemConfigs(opt_defaultSc, opt_overrides) {
    var defaultSc = opt_defaultSc ? opt_defaultSc : {};
    var overrides = opt_overrides ? opt_overrides : {};

    var outputSc = structuredClone(defaultSc);

    outputSc.landscape =
      overrides.landscape !== undefined ? overrides.landscape : true;

    return outputSc;
  }

  function addScreentopCardSystemConfigs(opt_defaultSc, opt_overrides) {
    var defaultSc = opt_defaultSc ? opt_defaultSc : {};
    var overrides = opt_overrides ? opt_overrides : {};

    var outputSc = addCardSystemConfigs(defaultSc, overrides);
    debugLog(
      "addScreentopCardSystemConfigs",
      "outputSc = " + JSON.stringify(outputSc),
    );

    // Apply tweaks.
    debugLog(
      "addScreentopCardSystemConfigs",
      "overrides = " + JSON.stringify(overrides),
    );
    outputSc.cardsPerRow = overrides.cardsPerRow
      ? overrides.cardsPerRow
      : genericMeasurements.screentopCardsPerRow;
    outputSc.pageless = true;
    outputSc.explicitPageWidth = overrides.cardsPerRow * outputSc.cardWidthPx;
    outputSc.skipCardBacks = true;
    outputSc.extraClassesForPageOfItemsContents = ["screentop"];
    outputSc.gridGap = 0;
    outputSc.addPageNumbers = false;
    debugLog(
      "SystemConfigs",
      "addScreentopCardSystemConfigs outputSc = " + JSON.stringify(outputSc),
    );

    outputSc.cardsPerPage =
      overrides.cardsPerPage !== undefined
        ? overrides.cardsPerPage
        : genericMeasurements.screentopCardsPerPage;
    return outputSc;
  }

  function addScreentopSmallCardSystemConfigs(opt_defaultSc, opt_overrides) {
    var defaultSc = opt_defaultSc ? opt_defaultSc : {};
    var overrides = opt_overrides ? opt_overrides : {};

    overrides.cardWidthPx =
      overrides.cardWidthPx !== undefined
        ? overrides.cardWidthPx
        : genericMeasurements.smallCardWidthPx;
    overrides.cardHeightPx =
      overrides.cardHeightPx !== undefined
        ? overrides.cardHeightPx
        : genericMeasurements.smallCardHeightPx;
    overrides.cardsPerRow =
      overrides.cardsPerRow !== undefined
        ? overrides.cardsPerRow
        : genericMeasurements.screentopCardsPerRow;
    overrides.cardBackFontSize =
      overrides.cardBackFontSize !== undefined
        ? overrides.cardBackFontSize
        : genericMeasurements.smallCardBackFontSize;

    return addScreentopCardSystemConfigs(defaultSc, overrides);
  }

  function addScreentopDieSystemConfigs(opt_defaultSc, opt_overrides) {
    var defaultSc = opt_defaultSc ? opt_defaultSc : {};
    var overrides = opt_overrides ? opt_overrides : {};

    var outputSc = structuredClone(defaultSc);
    outputSc.pageless =
      overrides.pageless !== undefined ? overrides.pageless : true;
    outputSc.gridGap = overrides.gridGap !== undefined ? overrides.gridGap : 0;
    outputSc.isCards =
      overrides.isCards !== undefined ? overrides.isCards : false;

    return outputSc;
  }

  function addTileSystemConfigs(opt_defaultSc, opt_overrides) {
    var defaultSc = opt_defaultSc ? opt_defaultSc : {};
    var overrides = opt_overrides ? opt_overrides : {};

    var outputSc = structuredClone(defaultSc);
    outputSc.isCards =
      overrides.isCards !== undefined ? overrides.isCards : false;
    debugLog(
      "SystemConfigs",
      "addTileSystemConfigs: outputSc = " + JSON.stringify(outputSc),
    );
    return outputSc;
  }

  function setSystemConfigs(opt_sc) {
    var sc = opt_sc ? opt_sc : {};
    sanityCheckConfigs(sc);
    _systemConfigs = sc;
    debugLog(
      "SystemConfigs",
      "_systemConfigs = " + JSON.stringify(_systemConfigs),
    );
  }

  function getSystemConfigs() {
    return _systemConfigs;
  }

  function getCardSystemConfigs(opt_overrides) {
    var queryParams = genericUtils.getCommonQueryParams();

    var sc;
    if (queryParams.isScreentop) {
      debugLog("SystemConfigs", "getCardSystemConfigs: isScreentop = true");
      debugLog(
        "SystemConfigs",
        "calling addScreentopCardSystemConfigs with opt_overrides  = " +
          JSON.stringify(opt_overrides),
      );

      sc = addScreentopCardSystemConfigs(null, opt_overrides);
    } else {
      sc = addCardSystemConfigs(null, opt_overrides);
      sc.skipCardBacks = queryParams.skipCardBacks;
    }
    sc.singleCardInstance = queryParams.singleCardInstance;
    return sc;
  }

  function getSmallCardSystemConfigs() {
    var queryParams = genericUtils.getCommonQueryParams();

    var sc;
    if (queryParams.isScreentop) {
      sc = addScreentopSmallCardSystemConfigs();
    } else {
      sc = addSmallCardSystemConfigs();
      sc.skipCardBacks = queryParams.skipCardBacks;
    }
    sc.singleCardInstance = queryParams.singleCardInstance;
    return sc;
  }

  // This returned object becomes the defined value of this module
  return {
    setSystemConfigs: setSystemConfigs,
    getSystemConfigs: getSystemConfigs,
    addCardSystemConfigs: addCardSystemConfigs,
    addSmallCardSystemConfigs: addSmallCardSystemConfigs,
    addScreentopCardSystemConfigs: addScreentopCardSystemConfigs,
    addScreentopSmallCardSystemConfigs: addScreentopSmallCardSystemConfigs,
    addScreentopDieSystemConfigs: addScreentopDieSystemConfigs,
    addTileSystemConfigs: addTileSystemConfigs,
    addLandscapeSystemConfigs: addLandscapeSystemConfigs,
    getCardSystemConfigs: getCardSystemConfigs,
    getSmallCardSystemConfigs: getSmallCardSystemConfigs,
  };
});
