'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _three = require('three');

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var VFFLoader = function () {
  function VFFLoader(useBufferGeom, manager) {
    _classCallCheck(this, VFFLoader);

    this.manager = manager !== undefined ? manager : _three.DefaultLoadingManager;
    this.buffer = useBufferGeom; // use buffer geometry?
    this.loader = new _three.FileLoader(this.manager);
  }

  _createClass(VFFLoader, [{
    key: 'load',
    value: function load(url, onLoad, onProgress, onError) {
      var scope = this;

      scope.loader.setResponseType('arraybuffer');
      scope.loader.load(url, function (text) {
        onLoad(scope.parse(text));
      }, onProgress, onError);
    }
  }, {
    key: 'parse',
    value: function parse(data) {
      var byteArray = new Uint8Array(data);

      if (!this.constructor.isVFF(byteArray)) {
        throw new Error("File is not VFF. No signature ('ncaa') was found at beginning of file. Please check file format.");
      }

      /** PARSE HEADER * */

      var _constructor$parseHea = this.constructor.parseHeaderData(byteArray),
          startByteIndexParsed = _constructor$parseHea.startByteIndexParsed,
          headerData = _constructor$parseHea.headerData;

      var startByteIndexCalc = byteArray.length - parseInt(headerData.rawsize, 10);

      // verify start byte index to parse body voxel data
      if (startByteIndexParsed !== startByteIndexCalc) {
        throw new Error('Byte start index for processing voxel data in VFF file could not be determined. Please verify size/format of VFF file.');
      }

      // return geometry (only vertices)
      var geometry = this.parseVoxelData(byteArray, startByteIndexCalc, headerData);

      return geometry;
    }
  }, {
    key: 'parseVoxelData',
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
      var spacingArray = [spacingX, spacingY, spacingZ];
      // var spacingArray = [1, 1, 1];

      var geometry = void 0;
      if (!this.buffer) {
        geometry = new _three.Geometry();

        // get 3D coordinates from linear byte index (see http://stackoverflow.com/questions/10903149/how-do-i-compute-the-linear-index-of-a-3d-coordinate-and-vice-versa)
        for (var i = startByteIndex; i < byteArray.length; i += 1) {
          var voxelGreyscaleValue = byteArray[i];
          if (voxelGreyscaleValue !== 0) {
            var colorString = 'rgb(' + voxelGreyscaleValue + ', ' + voxelGreyscaleValue + ', ' + voxelGreyscaleValue + ')';
            var index = i - startByteIndex; // linear byte index difference

            var vertex = this.constructor.idxToVector(index, bytesPerLine, linesPerSlice, slices, spacingArray);

            geometry.vertices.push(vertex);
            geometry.colors.push(new _three.Color(colorString));
          }
        }
      } else {
        geometry = new _three.BufferGeometry();

        // need to define size of position and color buffers at initialization
        var bufferSize = 0; // num of voxels with value > 0
        for (var _i = startByteIndex; _i < byteArray.length; _i += 1) {
          var _voxelGreyscaleValue = byteArray[_i];
          if (_voxelGreyscaleValue !== 0) {
            bufferSize += 1;
          }
        }

        var positions = new Float32Array(bufferSize * 3);
        var colors = new Float32Array(bufferSize * 3);

        var bufferIndex = 0;

        // get 3D coordinates from linear byte index (see http://stackoverflow.com/questions/10903149/how-do-i-compute-the-linear-index-of-a-3d-coordinate-and-vice-versa)
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
      }

      // slower than calculating coordinates by providing spacingArray to coordFromLinearIndex
      // geometry.scale(spacingX, spacingY, spacingZ);

      // var end = performance.now();
      // var time = end - start;
      // console.log(time/1000);

      return geometry;
    }
  }], [{
    key: 'isVFF',
    value: function isVFF(bytes) {
      // VFF files begin with signature of ASCII string 'ncaa'
      var header = String.fromCharCode.apply(String, _toConsumableArray(bytes.slice(0, 5)));
      return header === 'ncaa\n';
    }
  }, {
    key: 'parseHeaderData',
    value: function parseHeaderData(byteArray) {
      var strLine = '';
      var headerLines = [];
      var startByteIndexParsed = void 0;

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
        var value = void 0;
        if (lineSplit.length > 1) {
          var _lineSplit = _slicedToArray(lineSplit, 2);

          value = _lineSplit[1];
        }

        if (value) {
          value = value.replace(/;$/, '');
          return _extends({}, headerObject, _defineProperty({}, key, value));
        }
        return headerObject;
      }, {});

      return { startByteIndexParsed: startByteIndexParsed, headerData: headerData };
    }
  }, {
    key: 'idxToVector',
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

exports.default = VFFLoader;