class Storage {

  constructor() {
    const version = process.env.REACT_APP_VERSION;
    this.updated = version !== localStorage.getItem('version');
    // Update older version of storage
    if (this.updated) {
      localStorage.setItem('version', version)
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