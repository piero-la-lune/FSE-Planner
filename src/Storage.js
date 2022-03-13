import uid from "./util/uid.js";

import LZString from "lz-string";
import semver from "semver";

class Storage {

  constructor() {
    const version = process.env.REACT_APP_VERSION;
    const oldVersion = localStorage.getItem('version');
    // Update older version of storage
    if (!oldVersion) {
      localStorage.setItem('version', version);
    }
    else if (version !== oldVersion) {
      if (semver.lt(oldVersion, '1.0.0')) {
        const planeModel = this.get('planeModel', '');
        if (planeModel) {
          this.set('planeModel', [planeModel]);
        }
      }
      if (semver.lt(oldVersion, '1.1.0')) {
        this.remove('settings');
      }
      if (semver.lt(oldVersion, '1.7.0')) {
        const settings = this.get('settings', {});
        delete settings.airport;
        this.set('settings', settings);
      }
      if (semver.lt(oldVersion, '1.8.1')) {
        const layers = this.get('layers');
        for (const layer of layers) {
          if (layer.info) {
            layer.id = uid();
          }
        }
        this.set('layers', layers);
      }
      if (semver.lt(oldVersion, '1.10.1')) {
        this.remove('planes');
      }
      if (semver.lt(oldVersion, '1.10.2')) {
        this.remove('jobs');
        this.remove('flight');
      }
      if (semver.lt(oldVersion, '1.11.0-alpha.0')) {
        const icaos = this.get('customIcaos', []);
        const layers = this.get('layers', [{"visible":true},{"visible":false},{"visible":false},{"visible":true},{"visible":true},{"visible":true}]);
        let layersOrder = this.get('layersOrder', [0, 1, 2, 3, 4, 5]);
        if (icaos.length > 0) {
          const connections = [];
          const settings = this.get('settings', {});
          if (settings.display && settings.display.legs && settings.display.legs.display && settings.display.legs.display.custom) {
            for (let i = 0; i < icaos.length - 1; i++) {
              connections.push([icaos[i], icaos[i+1]]);
            }
          }
          layers.push({
            visible: true,
            info: {
              type: 'custom',
              filters: {
                size: [0, 23500],
                surface: [1, 2, 3, 4, 5, 6, 7, 8],
                runway: [0, 30000],
                onlySim: false,
                onlyBM: false,
                onlyILS: false,
                excludeMilitary: false,
                price: [0, 0]
              },
              display: {
                name: "Custom markers",
                color: "#2980b9",
                size: 20
              },
              data: {
                icaos: icaos,
                connections: connections,
                points: []
              }
            },
            id: uid()
          });
          layersOrder.push(layers.length - 1);
        }
        layers.splice(5, 1);
        layersOrder = layersOrder.filter(elm => elm !== 5);
        layersOrder = layersOrder.map(elm => elm > 5 ? elm-1 : elm);
        this.set('layers', layers);
        this.set('layersOrder', layersOrder);
      }
      localStorage.setItem('version', version);
    }
  }

  get(item, defaultValue = null, compressed = false) {
    let value = localStorage.getItem(item);
    if (value === null) { return defaultValue; }
    if (compressed) {
      value = LZString.decompressFromUTF16(value);
    }
    if (typeof defaultValue === 'object' && defaultValue !== null) {
      return JSON.parse(value);
    }
    return value;
  }

  set(item, value, compress = false) {
    try {
      let data = typeof value === 'object' ? JSON.stringify(value) : value;
      if (compress) {
        data = LZString.compressToUTF16(data);
      }
      localStorage.setItem(item, data);
      return true;
    }
    catch(error) {
      alert('Unable to save data for later usage: local storage is full.');
      return false;
    }
  }

  remove(item) {
    localStorage.removeItem(item)
  }

}

export default Storage;
