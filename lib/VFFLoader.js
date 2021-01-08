"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

require("core-js/modules/es.symbol");

require("core-js/modules/es.array.concat");

require("core-js/modules/es.array.filter");

require("core-js/modules/es.array.for-each");

require("core-js/modules/es.array.iterator");

require("core-js/modules/es.array.reduce");

require("core-js/modules/es.array.slice");

require("core-js/modules/es.array-buffer.slice");

require("core-js/modules/es.object.get-own-property-descriptor");

require("core-js/modules/es.object.get-own-property-descriptors");

require("core-js/modules/es.object.keys");

require("core-js/modules/es.object.to-string");

require("core-js/modules/es.parse-float");

require("core-js/modules/es.parse-int");

require("core-js/modules/es.regexp.exec");

require("core-js/modules/es.string.replace");

require("core-js/modules/es.string.split");

require("core-js/modules/es.typed-array.float32-array");

require("core-js/modules/es.typed-array.uint8-array");

require("core-js/modules/es.typed-array.copy-within");

require("core-js/modules/es.typed-array.every");

require("core-js/modules/es.typed-array.fill");

require("core-js/modules/es.typed-array.filter");

require("core-js/modules/es.typed-array.find");

require("core-js/modules/es.typed-array.find-index");

require("core-js/modules/es.typed-array.for-each");

require("core-js/modules/es.typed-array.includes");

require("core-js/modules/es.typed-array.index-of");

require("core-js/modules/es.typed-array.iterator");

require("core-js/modules/es.typed-array.join");

require("core-js/modules/es.typed-array.last-index-of");

require("core-js/modules/es.typed-array.map");

require("core-js/modules/es.typed-array.reduce");

require("core-js/modules/es.typed-array.reduce-right");

require("core-js/modules/es.typed-array.reverse");

require("core-js/modules/es.typed-array.set");

require("core-js/modules/es.typed-array.slice");

require("core-js/modules/es.typed-array.some");

require("core-js/modules/es.typed-array.sort");

require("core-js/modules/es.typed-array.subarray");

require("core-js/modules/es.typed-array.to-locale-string");

require("core-js/modules/es.typed-array.to-string");

require("core-js/modules/web.dom-collections.for-each");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _three = require("three");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var VFFLoader =
/*#__PURE__*/
function () {
  function VFFLoader(useBufferGeom, manager) {
    (0, _classCallCheck2.default)(this, VFFLoader);
    this.manager = manager !== undefined ? manager : _three.DefaultLoadingManager;
    this.buffer = useBufferGeom; // use buffer geometry?

    this.loader = new _three.FileLoader(this.manager);
  }

  (0, _createClass2.default)(VFFLoader, [{
    key: "load",
    value: function load(url, onLoad, onProgress, onError) {
      var scope = this;
      scope.loader.setResponseType('arraybuffer');
      scope.loader.load(url, function (text) {
        onLoad(scope.parse(text));
      }, onProgress, onError);
    }
  }, {
    key: "parse",
    value: function parse(data) {
      var byteArray = new Uint8Array(data);

      if (!this.constructor.isVFF(byteArray)) {
        throw new Error("File is not VFF. No signature ('ncaa') was found at beginning of file. Please check file format.");
      }
      /** PARSE HEADER * */


      var _this$constructor$par = this.constructor.parseHeaderData(byteArray),
          startByteIndexParsed = _this$constructor$par.startByteIndexParsed,
          headerData = _this$constructor$par.headerData;

      var startByteIndexCalc = byteArray.length - parseInt(headerData.rawsize, 10); // verify start byte index to parse body voxel data

      if (startByteIndexParsed !== startByteIndexCalc) {
        throw new Error('Byte start index for processing voxel data in VFF file could not be determined. Please verify size/format of VFF file.');
      } // return geometry (only vertices)


      var geometry = this.parseVoxelData(byteArray, startByteIndexCalc, headerData);
      return geometry;
    }
  }, {
    key: "parseVoxelData",
    value: function parseVoxelData(byteArray, startByteIndex, headerData) {
      // var start = performance.now()
      var size = headerData.size.split(' ');
      var bytesPerLine = parseInt(size[0], 10); // width

      var linesPerSlice = parseInt(size[1], 10); // height

      var slices = parseInt(size[2], 10); // depth

      var spacing = headerData.spacing.split(' ');
      var spacingX = parseFloat(spacing[0]);
      var spacingY = parseFloat(spacing[1]);
      var spacingZ = parseFloat(spacing[2]);
      var spacingArray = [spacingX, spacingY, spacingZ]; // var spacingArray = [1, 1, 1];

      var geometry;

      if (!this.buffer) {
        geometry = new _three.Geometry(); // get 3D coordinates from linear byte index (see http://stackoverflow.com/questions/10903149/how-do-i-compute-the-linear-index-of-a-3d-coordinate-and-vice-versa)

        for (var i = startByteIndex; i < byteArray.length; i += 1) {
          var voxelGreyscaleValue = byteArray[i];

          if (voxelGreyscaleValue !== 0) {
            var colorString = "rgb(".concat(voxelGreyscaleValue, ", ").concat(voxelGreyscaleValue, ", ").concat(voxelGreyscaleValue, ")");
            var index = i - startByteIndex; // linear byte index difference

            var vertex = this.constructor.idxToVector(index, bytesPerLine, linesPerSlice, slices, spacingArray);
            geometry.vertices.push(vertex);
            geometry.colors.push(new _three.Color(colorString));
          }
        }
      } else {
        geometry = new _three.BufferGeometry(); // need to define size of position and color buffers at initialization

        var bufferSize = 0; // num of voxels with value > 0

        for (var _i = startByteIndex; _i < byteArray.length; _i += 1) {
          var _voxelGreyscaleValue = byteArray[_i];

          if (_voxelGreyscaleValue !== 0) {
            bufferSize += 1;
          }
        }

        var positions = new Float32Array(bufferSize * 3);
        var colors = new Float32Array(bufferSize * 3);
        var bufferIndex = 0; // get 3D coordinates from linear byte index (see http://stackoverflow.com/questions/10903149/how-do-i-compute-the-linear-index-of-a-3d-coordinate-and-vice-versa)

        for (var _i2 = startByteIndex; _i2 < byteArray.length; _i2 += 1) {
          var _voxelGreyscaleValue2 = byteArray[_i2];

          if (_voxelGreyscaleValue2 !== 0) {
            var _index = _i2 - startByteIndex; // linear byte index difference


            var _vertex = this.constructor.idxToVector(_index, bytesPerLine, linesPerSlice, slices, spacingArray);

            positions[bufferIndex] = _vertex.x;
            positions[bufferIndex + 1] = _vertex.y;
            positions[bufferIndex + 2] = _vertex.z;
            var colorValue = _voxelGreyscaleValue2 / 255;
            colors[bufferIndex] = colorValue;
            colors[bufferIndex + 1] = colorValue;
            colors[bufferIndex + 2] = colorValue;
            bufferIndex += 3;
          }
        }

        geometry.addAttribute('position', new _three.BufferAttribute(positions, 3));
        geometry.addAttribute('color', new _three.BufferAttribute(colors, 3));
      } // slower than calculating coordinates by providing spacingArray to coordFromLinearIndex
      // geometry.scale(spacingX, spacingY, spacingZ);
      // var end = performance.now();
      // var time = end - start;
      // console.log(time/1000);


      return geometry;
    }
  }], [{
    key: "isVFF",
    value: function isVFF(bytes) {
      // VFF files begin with signature of ASCII string 'ncaa'
      var header = String.fromCharCode.apply(String, (0, _toConsumableArray2.default)(bytes.slice(0, 5)));
      return header === 'ncaa\n';
    }
  }, {
    key: "parseHeaderData",
    value: function parseHeaderData(byteArray) {
      var strLine = '';
      var headerLines = [];
      var startByteIndexParsed;

      for (var i = 0; i < 200; i += 1) {
        var c = byteArray[i];
        c = String.fromCharCode(c);

        if (c !== '\n') {
          strLine += c;
        } else {
          if (strLine.length === 1) {
            startByteIndexParsed = i + 1;
            break;
          }

          headerLines.push(strLine);
          strLine = '';
        }
      }

      var headerData = headerLines.reduce(function (headerObject, line) {
        var lineSplit = line.split('=');
        var key = lineSplit[0];
        var value;

        if (lineSplit.length > 1) {
          var _lineSplit = (0, _slicedToArray2.default)(lineSplit, 2);

          value = _lineSplit[1];
        }

        if (value) {
          value = value.replace(/;$/, '');
          return _objectSpread({}, headerObject, (0, _defineProperty2.default)({}, key, value));
        }

        return headerObject;
      }, {});
      return {
        startByteIndexParsed: startByteIndexParsed,
        headerData: headerData
      };
    }
  }, {
    key: "idxToVector",
    value: function idxToVector(idx, maxX, maxY, maxZ, spacingArray) {
      var i = idx;
      var x = -(maxX * spacingArray[0] / 2) + spacingArray[0] * (i % maxX);
      i /= maxX;
      var y = -(maxY * spacingArray[1] / 2) + spacingArray[1] * (i % maxY);
      i /= maxY;
      var z = -(maxZ * spacingArray[2] / 2) + spacingArray[2] * i;
      return new _three.Vector3(x, y, z);
    }
  }]);
  return VFFLoader;
}();

var _default = VFFLoader;
exports.default = _default;