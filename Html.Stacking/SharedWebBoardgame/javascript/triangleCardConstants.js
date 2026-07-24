define([
  "sharedJavascript/debugLog",
  "sharedJavascript/genericUtils",
  "dojo/domReady!",
], function (debugLogModule, genericUtils) {
  var debugLog = debugLogModule.debugLog;

  // Both squares and triangles have four sectors.
  // Triangle sectors are indexed like so:
  //                 0
  //                 2
  //               1    3
  const gNumSectorsPerCard = 4;
  const gTriangleMiddleSectorIndex = 2;

  const gMaxPlayers = 4;

  const gSectorType_Colored = "colored";
  const gSectorType_Buffer = "buffer";

  const gSectorTypes = {
    Colored: gSectorType_Colored,
    Buffer: gSectorType_Buffer,
  };

  const gSectorTypesArray = [gSectorTypes.Colored, gSectorTypes.Buffer];
  const gNumSectorTypes = gSectorTypesArray.length;

  const gSectorColor_Red = "red";
  const gSectorColor_Green = "green";
  const gSectorColor_Blue = "blue";
  const gSectorColor_Yellow = "yellow";
  const gSectorColor_Purple = "purple";
  const gSectorColor_Orange = "orange";
  const gSectorColor_Cyan = "cyan";

  const gSectorColors = {
    Red: gSectorColor_Red,
    Green: gSectorColor_Green,
    Blue: gSectorColor_Blue,
    Yellow: gSectorColor_Yellow,
    Purple: gSectorColor_Purple,
    Orange: gSectorColor_Orange,
    Cyan: gSectorColor_Cyan,
  };

  // Add or remove colors as needed.
  const gSectorColorsArray = [
    gSectorColors.Red,
    gSectorColors.Green,
    gSectorColors.Blue,
    gSectorColors.Yellow,
    gSectorColors.Purple,
    gSectorColors.Orange,
    gSectorColors.Cyan,
  ];

  const gNumSectorColors = gSectorColorsArray.length;

  var getRandomZeroToOne =
    genericUtils.createSeededGetZeroToOneRandomFunction(83743874);

  const gTriangleSides = [0, 1, 2];

  return {
    numSectorsPerCard: gNumSectorsPerCard,
    triangleMiddleSectorIndex: gTriangleMiddleSectorIndex,

    sectorTypes: gSectorTypes,
    sectorTypesArray: gSectorTypesArray,
    numSectorTypes: gNumSectorTypes,

    sectorColors: gSectorColors,
    sectorColorsArray: gSectorColorsArray,
    numSectorColors: gNumSectorColors,

    getRandomZeroToOne: getRandomZeroToOne,
    triangleSides: gTriangleSides,
  };
});
