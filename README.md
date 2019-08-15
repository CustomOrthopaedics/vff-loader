# three-vff-loader [![Build Status](https://travis-ci.org/CustomOrthopaedics/vff-loader.svg?branch=master)](https://travis-ci.org/CustomOrthopaedics/vff-loader)
three.js VFF loader

## Installation

```sh
npm install three-vff-loader
```

## Usage

```js
import * as THREE from 'three';
import VFFLoader from 'three-vff-loader';

const loader = new VFFLoader();
const geom = loader.parse(vffData);
```
