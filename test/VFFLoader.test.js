import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

import * as THREE from 'three';

import VFFLoader from '..';

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
  });
});
