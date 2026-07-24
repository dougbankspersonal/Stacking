export default function (variant, index) {
  const gExtraLightenedSeatColors = [
    "#f5cdcd",
    "#d7f7d7",
    "#f5f3ea",
    "#d4dbf7",
    "#f5dfd3",
    "#e6cef1",
  ];

  var zeroBasedIndex = index - 1;
  var colorIndex = zeroBasedIndex % 6;
  var tokenIndex = Math.floor(zeroBasedIndex / 6);
  return {
    frontFillColor: gExtraLightenedSeatColors[colorIndex],
    frontAssetIndex: tokenIndex + 1,
  };
}
