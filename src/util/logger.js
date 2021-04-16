const logs = [];

const log = {
  error: (msg, obj) => logs.push({type: 'Error', msg: msg, obj: obj}),
  info: (msg, obj) => logs.push({type: 'Info', msg: msg, obj: obj}),
  export: () => logs
};

export default log;