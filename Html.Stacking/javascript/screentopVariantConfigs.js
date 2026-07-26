// Tokens
export default function (variant, index) {
  const gExtraLightenedSeatColors = [
    "#f5cdcd",
    "#d7f7d7",
    "#f5f3ea",
    "#d4dbf7",
    "#f5dfd3",
    "#e6cef1",
  ];

  var gNumSeatColors = 6;

  var zeroBasedIndex = index - 1;
  var colorIndex = zeroBasedIndex % gNumSeatColors;
  var tokenIndex = Math.floor(zeroBasedIndex / gNumSeatColors);

  return {
    frontFillColor: gExtraLightenedSeatColors[colorIndex],
    frontAssetIndex:  tokenIndex + 1
  };
}

// Cards
export default function(variant, index) {
  return {
    frontAssetIndex: index + 1,
  };
}