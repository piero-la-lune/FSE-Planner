import uid from "./util/uid.js";

var semver = require('semver');

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
        this.remove('planes');
        this.remove('jobs');
      }
      if (semver.lt(oldVersion, '1.1.0')) {
        this.remove('settings');
      }
      if (semver.lt(oldVersion, '1.5.0')) {
        this.remove('flight');
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
        this.remove('jobs');
        this.remove('flight');
        this.remove('planes');
      }
      localStorage.setItem('version', version);
    }
  }

  get(item, defaultValue = null) {
    let value = localStorage.getItem(item);
    if (value === null) { return defaultValue; }
    if (typeof defaultValue === 'object' && defaultValue !== null) {
      return JSON.parse(value);
    }
    return value;
  }

  set(item, value) {
    try {
      localStorage.setItem(item, typeof value === 'object' ? JSON.stringify(value) : value);
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
