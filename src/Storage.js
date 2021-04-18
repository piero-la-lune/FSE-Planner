class Storage {

  constructor() {
    const version = process.env.REACT_APP_VERSION;
    const oldVersion = localStorage.getItem('version');
    // Update older version of storage
    if (version !== oldVersion) {
      if (!oldVersion || oldVersion < '1.0.0') {
        const planeModel = this.get('planeModel', '');
        if (planeModel) {
          this.set('planeModel', [planeModel]);
        }
        this.remove('planes');
        this.remove('jobs');
      }
      if (oldVersion < '1.1.0') {
        this.remove('settings');
      }
      if (oldVersion < '1.5.0') {
        this.remove('flight');
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