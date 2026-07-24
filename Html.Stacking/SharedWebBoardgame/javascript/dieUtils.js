define([
  "dojo/dom",
  "dojo/dom-style",
  "sharedJavascript/debugLog",
  "sharedJavascript/genericMeasurements",
  "sharedJavascript/htmlUtils",
  "sharedJavascript/systemConfigs",
  "dojo/domReady!",
], function (
  dom,
  domStyle,
  debugLogModule,
  genericMeasurements,
  htmlUtils,
  systemConfigs
) {
  var debugLog = debugLogModule.debugLog;

  const DieType_D6 = "d6";
  const DieType_D8 = "d8";

  const DieTypes = {
    d6: DieType_D6,
    d8: DieType_D8,
  };

  function addDieFace(parent, options) {
    var options = options ? options : {};
    var text = options.text;
    var classes = ["die_face"];
    if (options.classes) {
      classes = classes.concat(options.classes);
    }
    var dieFace = htmlUtils.addDiv(parent, classes, "dieFace", text);
    domStyle.set(dieFace, {
      height: genericMeasurements.dieHeightPx + "px",
      width: genericMeasurements.dieWidthPx + "px",
    });

    var imagesWithStyling = options.imagesWithStyling
      ? options.imagesWithStyling
      : [];
    for (var imageWithStyling of imagesWithStyling) {
      var image = htmlUtils.addImage(
        dieFace,
        ["die_image"],
        "dieImage",
        imageWithStyling.img
      );
      domStyle.set(image, imageWithStyling.styling);
    }
    return dieFace;
  }

  var wrapperIdCount = 0;
  function createDieTemplate(
    parent,
    wrapperClasses,
    dieType,
    addNthFaceCallback
  ) {
    var wrapperId = "dieWrapper" + wrapperIdCount;
    wrapperIdCount++;
    wrapperClasses.push(dieType);
    wrapperClasses.push("die_wrapper");
    var wrapper = htmlUtils.addDiv(parent, wrapperClasses, wrapperId);

    if (dieType == DieType_D6) {
      // Three rows of 3 each, first ignored.
      for (var i = 0; i < 3; i++) {
        addDieFace(wrapper);
      }
      for (var i = 0; i < 6; i++) {
        addNthFaceCallback(wrapper, i);
      }
    }
    if (dieType == DieType_D8) {
      // Four rows of 4 each.
      for (var i = 0; i < 8; i++) {
        addNthFaceCallback(wrapper, i);
      }
    }

    return wrapper;
  }

  return {
    createDieTemplate: createDieTemplate,
    addDieFace: addDieFace,
    DieTypes: DieTypes,
  };
});
