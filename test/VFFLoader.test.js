import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

import * as THREE from 'three';

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
    expect(geom).toBeInstanceOf(THREE.BufferGeometry);

    const positions = geom.getAttribute('position');
    expect(positions.count).toBe(36785);
    expect(positions.getX(0)).toBeCloseTo(47.26559829711914);
    expect(positions.getY(0)).toBeCloseTo(-194.0992431640625);
    expect(positions.getZ(0)).toBeCloseTo(217.64161682128906);
  });
});
