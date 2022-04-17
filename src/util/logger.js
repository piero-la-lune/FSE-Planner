import Storage from '../Storage.js';

const logs = [];
const storage = new Storage();

const log = {
  error: (msg, obj) => logs.push({type: 'Error', msg: msg, obj: obj}),
  info: (msg, obj) => logs.push({type: 'Info', msg: msg, obj: obj}),
  export: () => logs
};

export function downloadReport() {
  const ls = {...localStorage};
  delete ls.key;
  const jobs = storage.get('jobs', {}, true);
  ls.jobs = jobs;
  const data = JSON.stringify({logs: log.export(), localStorage: ls});
  const blob = new Blob([data], {type: 'text/json'});
  const a = document.createElement('a');
  a.download = 'debug.json';
  a.href = window.URL.createObjectURL(blob)
  a.dataset.downloadurl =  ['text/json', a.download, a.href].join(':');
  a.click();
}
export function uploadReport(evt) {
  const file = evt.target.files[0];
  const fileReader = new FileReader();
  fileReader.readAsText(file);
  fileReader.onload = () => {
    var data = JSON.parse(fileReader.result);
    Object.keys(data.localStorage).forEach(function (k) {
      if (k === 'jobs') {
          storage.set('jobs', data.localStorage[k], true);
      }
      else {
        localStorage.setItem(k, data.localStorage[k]);
      }
    });
  }
  fileReader.onerror = () => alert('Unable to load JSON file');
}
/* To reinject localstorage in browser
var data = JSON.parse(String.raw`MYDATA`);
Object.keys(data.localStorage).forEach(function (k) {
  localStorage.setItem(k, data.localStorage[k]);
});
*/

export default log;
