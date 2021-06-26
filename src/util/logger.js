const logs = [];

const log = {
  error: (msg, obj) => logs.push({type: 'Error', msg: msg, obj: obj}),
  info: (msg, obj) => logs.push({type: 'Info', msg: msg, obj: obj}),
  export: () => logs
};

export function downloadReport() {
  const ls = {...localStorage};
  ls.key = null
  const data = JSON.stringify({logs: log.export(), localStorage: ls});
  const blob = new Blob([data], {type: 'text/json'});
  const a = document.createElement('a');
  a.download = 'debug.json';
  a.href = window.URL.createObjectURL(blob)
  a.dataset.downloadurl =  ['text/json', a.download, a.href].join(':');
  a.click();
}

export default log;