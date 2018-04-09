"use strict";

System.register([], function (_export, _context) {
  "use strict";

  function circulus(canvas, centerOrigin) {
    if (!canvas) throw "Circulus: You didn't define a canvas!";
    var ctx = canvas.getContext("2d");
    if (centerOrigin !== false) ctx.translate(canvas.width / 2, canvas.height / 2);

    var save = function save() {
      return ctx.save.call(ctx, arguments);
    };

    var restore = function restore() {
      return ctx.restore.apply(ctx, arguments);
    };

    var drawImage = function drawImage(image, angle, r, w, h) {
      var x = Math.cos(angle) * r;
      var y = Math.sin(angle) * r;
      return ctx.drawImage(image, x, y, w, h);
    };

    var createLinearGradient = function createLinearGradient(angle1, r1, angle2, r2) {
      var x1 = Math.cos(angle1) * r1;
      var y1 = Math.sin(angle1) * r1;
      var x2 = Math.cos(angle2) * r2;
      var y2 = Math.sin(angle2) * r2;
      return ctx.createLinearGradient(x1, y1, x2, y2);
    };

    var createRadialGradient = function createRadialGradient(angle1, r1, radius1, angle2, r2, radius2) {
      var x1 = Math.cos(angle1) * r1;
      var y1 = Math.sin(angle1) * r1;
      var x2 = Math.cos(angle2) * r2;
      var y2 = Math.sin(angle2) * r2;
      return ctx.createRadialGradient(x1, y1, radius1, x2, y2, radius2);
    };

    var createPattern = function createPattern() {
      return ctx.createPattern.apply(ctx, arguments);
    };

    var moveTo = function moveTo(angle, r) {
      var x = Math.cos(angle) * r;
      var y = Math.sin(angle) * r;
      return ctx.moveTo(x, y);
    };

    var lineTo = function lineTo(angle, r) {
      var x = Math.cos(angle) * r;
      var y = Math.sin(angle) * r;
      return ctx.lineTo(x, y);
    };

    var quadraticCurveTo = function quadraticCurveTo(cpAngle, cpR, angle, r) {
      var cpX = Math.cos(angle) * cpR;
      var cpY = Math.sin(angle) * cpR;
      var x = Math.cos(angle) * r;
      var y = Math.sin(angle) * r;
      return ctx.quadraticCurveTo(cpX, cpY, x, y);
    };

    var bezierCurveTo = function bezierCurveTo(cp1Angle, cp1R, cp2Angle, cp2R, angle, r) {
      var cp1x = Math.cos(angle) * cp1R;
      var cp1y = Math.sin(angle) * cp1R;
      var cp2x = Math.cos(angle) * cp2R;
      var cp2y = Math.sin(angle) * cp2R;
      var x = Math.cos(angle) * r;
      var y = Math.sin(angle) * r;
      return ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
    };

    var arcTo = function arcTo(angle1, r1, angle2, r2, radius) {
      var x1 = Math.cos(angle1) * r1;
      var y1 = Math.sin(angle1) * r1;
      var x2 = Math.cos(angle2) * r2;
      var y2 = Math.sin(angle2) * r2;
      return ctx.arcTo(x1, y1, x2, y2, radius);
    };

    var arc = function arc(angle, r, radius, startAngle, endAngle, anticlockwise) {
      var x = Math.cos(angle) * r;
      var y = Math.sin(angle) * r;
      return ctx.arc(x, y, radius, startAngle, endAngle, anticlockwise);
    };

    var rect = function rect(angle, r, w, h) {
      var x = Math.cos(angle) * r;
      var y = Math.sin(angle) * r;
      return ctx.rect(x, y, w, h);
    };

    var isPointInPath = function isPointInPath(angle, r) {
      var x = Math.cos(angle) * r;
      var y = Math.sin(angle) * r;
      return ctx.isPointInPath(x, y);
    };

    var fillTextCentered = function fillTextCentered(text, angle, r, offset, maxWidth) {
      var x = Math.cos(angle) * r;
      var y = Math.sin(angle) * r;
      var m = this.measureText(text);
      return ctx.fillText(text, x - m.width / 2, y + (offset || 0), maxWidth);
    };

    var fillText = function fillText(text, angle, r, maxWidth) {
      var x = Math.cos(angle) * r;
      var y = Math.sin(angle) * r;
      return ctx.fillText(text, x, y, maxWidth);
    };

    var strokeText = function strokeText(text, angle, r, maxWidth) {
      var x = Math.cos(angle) * r;
      var y = Math.sin(angle) * r;
      return ctx.strokeText(text, x, y, maxWidth);
    };

    var clearRect = function clearRect(angle, r, w, h) {
      var x = Math.cos(angle) * r;
      var y = Math.sin(angle) * r;
      return ctx.clearRect(x, y, w, h);
    };

    var fillRectCentered = function fillRectCentered(angle, r, width, height) {
      var x = Math.cos(angle) * r;
      var y = Math.sin(angle) * r;
      return ctx.fillRect(x - width / 2, y - height / 2, width, height);
    };

    var fillRect = function fillRect(angle, r, width, height) {
      var x = Math.cos(angle) * r;
      var y = Math.sin(angle) * r;
      return ctx.fillRect(x, y, width, height);
    };

    var strokeRect = function strokeRect(angle, r, width, height) {
      var x = Math.cos(angle) * r;
      var y = Math.sin(angle) * r;
      return ctx.strokeRect(x, y, width, height);
    };

    var getImageData = function getImageData(angle, r, width, height) {
      var x = Math.cos(angle) * r;
      var y = Math.sin(angle) * r;
      return ctx.getImageData(x, y, width, height);
    };

    var putImageData = function putImageData(imageData, angle, r, dirtyAngle, dirtyR, dirtyWidth, dirtyHeight) {
      var x = Math.cos(angle) * r;
      var y = Math.sin(angle) * r;
      var dirtyX = Math.cos(dirtyAngle) * dirtyR;
      var dirtyY = Math.sin(dirtyAngle) * dirtyR;
      return ctx.putImageData(imageData, x, y, dirtyX, dirtyY, dirtyWidth, dirtyHeight);
    };

    var clearCanvas = function clearCanvas() {
      // Thanks to http://stackoverflow.com/questions/2142535/how-to-clear-the-canvas-for-redrawing
      // Store the current transformation matrix
      ctx.save();

      // Use the identity matrix while clearing the canvas
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Restore the transform
      ctx.restore();
    };

    var beginPath = function beginPath() {
      return ctx.beginPath.apply(ctx, arguments);
    };

    var closePath = function closePath() {
      return ctx.closePath.apply(ctx, arguments);
    };

    var fill = function fill() {
      return ctx.fill.apply(ctx, arguments);
    };

    var stroke = function stroke() {
      return ctx.stroke.apply(ctx, arguments);
    };

    var clip = function clip() {
      return ctx.clip.apply(ctx, arguments);
    };

    var measureText = function measureText() {
      return ctx.measureText.apply(ctx, arguments);
    };

    var createImageData = function createImageData() {
      return ctx.createImageData.apply(ctx, arguments);
    };

    var degToRad = function degToRad(deg) {
      return deg * (Math.PI / 180);
    };

    var radToDeg = function radToDeg(rad) {
      return rad * (180 / Math.PI);
    };

    return {
      save: save,
      restore: restore,

      canvas: ctx.canvas,

      drawImage: drawImage,

      createLinearGradient: createLinearGradient,
      createRadialGradient: createRadialGradient,
      createPattern: ctx.createPattern,

      beginPath: beginPath,
      closePath: closePath,

      fill: fill,
      stroke: stroke,
      clip: clip,

      moveTo: moveTo,
      lineTo: lineTo,
      quadraticCurveTo: quadraticCurveTo,
      bezierCurveTo: bezierCurveTo,
      arcTo: arcTo,
      arc: arc,
      rect: rect,
      isPointInPath: isPointInPath,

      font: ctx.font,
      textAlign: ctx.textAlign,
      textBaseline: ctx.textBaseline,

      fillTextCentered: fillTextCentered,
      fillText: fillText,
      strokeText: strokeText,
      measureText: measureText,

      clearRect: clearRect,
      fillRectCentered: fillRectCentered,
      fillRect: fillRect,
      strokeRect: strokeRect,

      createImageData: createImageData,
      getImageData: getImageData,
      putImageData: putImageData,

      context: ctx,
      degToRad: degToRad,
      radToDeg: radToDeg,
      clearCanvas: clearCanvas
    };
  }
  _export("default", circulus);

  return {
    setters: [],
    execute: function () {
      ;
    }
  };
});
//# sourceMappingURL=circulus.js.map
