import {
  DefaultLoadingManager,
  FileLoader,
  Vector3,
  BufferGeometry,
  BufferAttribute,
} from 'three';

class VFFLoader {
  constructor(manager) {
    this.manager = (manager !== undefined) ? manager : DefaultLoadingManager;
    this.loader = new FileLoader(this.manager);
  }

  load(url, onLoad, onProgress, onError) {
    const scope = this;

    scope.loader.setResponseType('arraybuffer');
    scope.loader.load(url, (text) => {
      onLoad(scope.parse(text));
    }, onProgress, onError);
  }

  static isVFF(bytes) {
    // VFF files begin with signature of ASCII string 'ncaa'
    const header = String.fromCharCode(...bytes.slice(0, 5));
    return header === 'ncaa\n';
  }

  static parseHeaderData(byteArray) {
    let strLine = '';
    const headerLines = [];
    let startByteIndexParsed;

    for (let i = 0; i < 200; i += 1) {
      let c = byteArray[i];
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

    const headerData = headerLines.reduce((headerObject, line) => {
      const lineSplit = line.split('=');

      const key = lineSplit[0];
      let value;
      if (lineSplit.length > 1) {
        [, value] = lineSplit;
      }

      if (value) {
        value = value.replace(/;$/, '');
        return { ...headerObject, [key]: value };
      }
      return headerObject;
    }, {});

    return { startByteIndexParsed, headerData };
  }

  static idxToVector(idx, maxX, maxY, maxZ, spacingArray) {
    let i = idx;
    const x = -((maxX * spacingArray[0]) / 2) + (spacingArray[0] * (i % maxX));
    i /= maxX;
    const y = -((maxY * spacingArray[1]) / 2) + (spacingArray[1] * (i % maxY));
    i /= maxY;
    const z = -((maxZ * spacingArray[2]) / 2) + (spacingArray[2] * i);
    return new Vector3(x, y, z);
  }

  parse(data) {
    const byteArray = new Uint8Array(data);

    if (!this.constructor.isVFF(byteArray)) {
      throw new Error("File is not VFF. No signature ('ncaa') was found at beginning of file. Please check file format.");
    }

    /** PARSE HEADER * */
    const { startByteIndexParsed, headerData } = this.constructor.parseHeaderData(byteArray);

    const startByteIndexCalc = byteArray.length - parseInt(headerData.rawsize, 10);

    // verify start byte index to parse body voxel data
    if (startByteIndexParsed !== startByteIndexCalc) {
      throw new Error('Byte start index for processing voxel data in VFF file could not be determined. Please verify size/format of VFF file.');
    }

    // return geometry (only vertices)
    const geometry = this.parseVoxelData(byteArray, startByteIndexCalc, headerData);

    return geometry;
  }

  parseVoxelData(byteArray, startByteIndex, headerData) {
    // var start = performance.now()

    const size = headerData.size.split(' ');
    const bytesPerLine = parseInt(size[0], 10); // width
    const linesPerSlice = parseInt(size[1], 10); // height
    const slices = parseInt(size[2], 10); // depth

    const spacing = headerData.spacing.split(' ');
    const spacingX = parseFloat(spacing[0]);
    const spacingY = parseFloat(spacing[1]);
    const spacingZ = parseFloat(spacing[2]);
    const spacingArray = [spacingX, spacingY, spacingZ];
    // var spacingArray = [1, 1, 1];

    const origin = new Vector3(...headerData.origin.split(' ').map(Number));

    const geometry = new BufferGeometry();

    // need to define size of position and color buffers at initialization
    let bufferSize = 0; // num of voxels with value > 0
    for (let i = startByteIndex; i < byteArray.length; i += 1) {
      const voxelGreyscaleValue = byteArray[i];
      if (voxelGreyscaleValue !== 0) {
        bufferSize += 1;
      }
    }

    const positions = new Float32Array(bufferSize * 3);
    const colors = new Float32Array(bufferSize * 3);

    let bufferIndex = 0;

    // get 3D coordinates from linear byte index (see http://stackoverflow.com/questions/10903149/how-do-i-compute-the-linear-index-of-a-3d-coordinate-and-vice-versa)
    for (let i = startByteIndex; i < byteArray.length; i += 1) {
      const voxelGreyscaleValue = byteArray[i];
      if (voxelGreyscaleValue !== 0) {
        const index = i - startByteIndex; // linear byte index difference

        const vertex = this.constructor.idxToVector(
          index,
          bytesPerLine,
          linesPerSlice,
          slices,
          spacingArray,
        );

        positions[bufferIndex] = vertex.x + origin.x;
        positions[bufferIndex + 1] = vertex.y + origin.y;
        positions[bufferIndex + 2] = vertex.z + origin.z;

        const colorValue = voxelGreyscaleValue / 255;

        colors[bufferIndex] = colorValue;
        colors[bufferIndex + 1] = colorValue;
        colors[bufferIndex + 2] = colorValue;

        bufferIndex += 3;
      }
    }

    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    geometry.setAttribute('color', new BufferAttribute(colors, 3));

    // slower than calculating coordinates by providing spacingArray to coordFromLinearIndex
    // geometry.scale(spacingX, spacingY, spacingZ);

    // var end = performance.now();
    // var time = end - start;
    // console.log(time/1000);

    return geometry;
  }
}

export default VFFLoader;
