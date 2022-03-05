import React from 'react';

import JobsTable from './Table/JobsTable.js';
import PlanesTable from './Table/PlanesTable.js';

function Table(props) {
  const [table, setTable] = React.useState('jobs');

  return (
    table === 'planes' ?
      <PlanesTable setTable={setTable} {...props} />
    :
      <JobsTable setTable={setTable} {...props} />
  );
}

export default Table;
