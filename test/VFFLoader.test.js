import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

import * as THREE from 'three';
import 'three/examples/js/exporters/PLYExporter'; // exports THREE.PLYExporter
import 'three/examples/js/loaders/PLYLoader'; // exports THREE.PLYLoader

import VFFLoader from '../src/VFFLoader';

const readFileAsync = promisify(fs.readFile);
async function fixture(name, ...args) {
  return readFileAsync(path.join(__dirname, 'fixtures', name), ...args);
}

describe('VFFLoader', () => {
  it('should be a constructor', () => {
    const loader = new VFFLoader();
    expect(loader).toBeInstanceOf(VFFLoader);
  });

  it('should parse a geometry from a .vff', async () => {
    const loader = new VFFLoader();

    const geom = loader.parse(await fixture('airway.vff'));
    expect(geom).toBeInstanceOf(THREE.Geometry);
    expect(geom.vertices).toHaveLength(36785);

    const exportBufGeom = new THREE.BufferGeometry().setFromObject(new THREE.Points(geom));
    const exportMesh = new THREE.Mesh(exportBufGeom);
    const plyData = await fixture('airway.vff.ply');
    expect(new THREE.PLYExporter().parse(exportMesh))
      .toEqual(plyData.toString('utf8'));

    const plyGeom = new THREE.PLYLoader().parse(plyData);
    expect(plyGeom.getAttribute('position').count)
      .toEqual(geom.vertices.length);
  });
});
