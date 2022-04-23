import React from 'react';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import { default as MuiTable } from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import TableSortLabel from '@mui/material/TableSortLabel';
import Paper from '@mui/material/Paper';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import NavigationIcon from '@mui/icons-material/Navigation';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Link from '@mui/material/Link';

import { cleanLegs, maximizeTripOnly } from "../util/utility.js";
import AddToFlight from './AddToFlight.js';

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function downloadCSV(rows) {
  let csv = "id,from,to,type,amount,pay,PT\n";
  for (const row of rows) {
    for (const job of row.filteredJobs) {
      csv += job.id+','+row.fr+','+row.to+','+(row.pax > 0 ? 'passengers' : 'kg')+','+(row.pax > 0 ? row.pax : row.kg)+','+job.pay+','+(job.PT ? 1 : 0)+"\n";
    }
  }
  const blob = new Blob([csv], {type: 'text/csv'});
  const a = document.createElement('a');
  a.download = 'jobs.csv';
  a.href = window.URL.createObjectURL(blob)
  a.dataset.downloadurl =  ['text/csv', a.download, a.href].join(':');
  a.click();
}

const type = {
  'Trip-Only': 'Trip Only',
  'VIP': 'VIP',
  'All-In': 'All In'
};

const Row = React.memo(function Row(props) {
  const { row, setSelected } = props;
  const selected = props.selected || [];
  const flight = props.flight || [];
  const [open, setOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const handleClose = () => setAnchorEl(null);
  return (
    <React.Fragment>
      <TableRow sx={{ '& > .MuiTableCell-root': { borderBottom: 'unset' } }}>
        <TableCell sx={{ p: 0, pl: 1 }}>
          <IconButton
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>
          <Link href="#" onClick={(evt) => props.goTo(evt, row.fr)} title="Open in map">
            {row.fr}
          </Link>
        </TableCell>
        <TableCell>
          <Link href="#" onClick={(evt) => props.goTo(evt, row.to)} title="Open in map">
            {row.to}
          </Link>
        </TableCell>
        <TableCell>
          {row.pax > 0 &&
            <span>{row.pax} passenger{row.pax > 1 && 's'}</span>
          }
          {row.pax > 0 && row.kg > 0 && <br />}
          {row.kg > 0 &&
            <span>Cargo {row.kg} kg</span>
          }
        </TableCell>
        <TableCell>
          <NavigationIcon fontSize="inherit" sx={{ transform: 'rotate('+row.direction+'deg)', mr: 0.5, verticalAlign: 'text-top' }} />
          {row.direction}°
        </TableCell>
        <TableCell>{row.distance} NM</TableCell>
        <TableCell>${row.pay}</TableCell>
        { props.allIn && (
          row.plane ?
            <TableCell>{row.plane.model}<br />{row.plane.reg}</TableCell>
          :
            <TableCell>?</TableCell>
        )}
        <TableCell sx={{px: 0.5, py: 0}}>
          <IconButton
            onClick={(evt) => setAnchorEl(evt.currentTarget)}
            sx={{ ml: 1 }}
          >
            <MoreVertIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem component={Link} href={"https://server.fseconomy.net/airport.jsp?icao="+row.fr} target="fse" onClick={handleClose}>
              Open {row.fr} in FSE
            </MenuItem>
            <MenuItem component={Link} href={"https://server.fseconomy.net/airport.jsp?icao="+row.to} target="fse" onClick={handleClose}>
              Open {row.to} in FSE
            </MenuItem>
          </Menu>
        </TableCell>
        <TableCell  sx={{px: 0.5, py: 0}}>
          { row.filteredJobs.length === flight.length ?
            <IconButton disabled>
              <CheckCircleIcon sx={{color: 'green'}} />
            </IconButton>
          :
            <Checkbox
              checked={selected.length === row.filteredJobs.length}
              indeterminate={selected.length !== 0 && selected.length !== row.filteredJobs.length}
              onChange={() => {
                if (selected.length === row.filteredJobs.length) {
                  setSelected(row.id, []);
                }
                else {
                  setSelected(row.id, [...row.filteredJobs]);
                }
              }}
            />
          }
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell sx={{ py: 0 }} colSpan={props.allIn ? 10 : 9}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Card
              variant="outlined"
              sx={{
                maxWidth: 300,
                mb: 2,
                mx: 'auto'
              }}
            >
              <MuiTable size="small" >
                <TableBody>
                  { row.filteredJobs.map((elm, i) =>
                    <TableRow
                      key={elm.id}
                      sx={{
                        ...(i === row.filteredJobs.length-1 && {
                          '& > .MuiTableCell-root': { borderBottom: 'unset' }
                        })
                      }}
                    >
                      {elm.pax > 0 ?
                        <TableCell sx={elm.PT && {color: 'green'}}>{elm.pax} passenger{elm.pax > 1 && 's'}</TableCell>
                      :
                        <TableCell>Cargo {elm.kg} kg</TableCell>
                      }
                      <TableCell>${elm.pay}</TableCell>
                      <TableCell padding="checkbox">
                        { flight.includes(elm.id) ?
                          <IconButton disabled>
                            <CheckCircleIcon sx={{color: 'green'}} />
                          </IconButton>
                        :
                          <Checkbox
                            checked={selected.reduce((acc, e) => acc || e.id === elm.id, false)}
                            onChange={evt => {
                              if (evt.target.checked) {
                                setSelected(row.id, [elm, ...selected]);
                              }
                              else {
                                setSelected(row.id, selected.filter(e => e.id !== elm.id));
                              }
                            }}
                          />
                        }
                      </TableCell>
                    </TableRow>
                  ) }
                </TableBody>
              </MuiTable>
            </Card>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
});

function Table(props) {
  const [rows, setRows] = React.useState([]);
  const [pageRows, setPageRows] = React.useState([]);
  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('fr');
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(25);
  const [selected, setSelected] = React.useState({});
  const [flight, setFlight] = React.useState([]);
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Update rows when data has changed
  React.useEffect(() => {
    if (props.hidden) { return; }

    let legs = cleanLegs(props.options.jobs, props.options)[0];
    const arr = [];
    if (props.options.type === 'Trip-Only') {
      for (const [id, leg] of Object.entries(legs)) {
        const [fr, to] = id.split('-');
        if (props.search && props.search !== fr) { continue; }
        if (props.searchDest && props.searchDest !== to) { continue; }
        if (props.options.maxPax || props.options.maxKg) {
          const maxPax = props.options.maxPax ? props.options.maxPax : 10000;
          const maxKg = props.options.maxKg ? props.options.maxKg : 1000000;
          let remain = leg.filteredJobs;
          while (remain.length) {
            const [pay, pax, kg, jobs, r] = maximizeTripOnly(remain.length, remain, maxPax, maxKg);
            if (props.options.minPax && pax < props.options.minPax) { break; }
            if (props.options.minKg && kg < props.options.minKg) { break; }
            arr.push({
              id: id+'-'+remain.length,
              fr: fr,
              to: to,
              pax: pax,
              kg: jobs.reduce((acc, job) => acc+(job.pax > 0 ? 0 : job.kg), 0),
              amount: kg,
              pay: pay,
              distance: leg.distance,
              direction: leg.direction,
              filteredJobs: jobs
            });
            remain = r;
          }
        }
        else {
          arr.push({
            id: id,
            fr: fr,
            to: to,
            pax: leg.filteredJobs.reduce((acc, job) => acc+job.pax, 0),
            kg: leg.filteredJobs.reduce((acc, job) => acc+(job.pax > 0 ? 0 : job.kg), 0),
            ...leg
          });
        }
      }
    }
    else {
      for (const [id, leg] of Object.entries(legs)) {
        const [fr, to] = id.split('-');
        if (props.search && props.search !== fr) { continue; }
        for (const job of leg.filteredJobs) {
          const obj = {
            id: job.id,
            fr: fr,
            to: to,
            pax: job.pax,
            kg: job.pax ? 0 : job.kg,
            amount: job.kg,
            pay: job.pay,
            distance: leg.distance,
            direction: leg.direction,
            filteredJobs: [job],
            planeModel: '-'
          };
          if (props.options.type === 'All-In') {
            const planes = props.options.planes[fr] || [];
            for (const plane of planes) {
              if (plane.id === job.aid) {
                obj.plane = plane;
                obj.planeModel = plane.model;
                break;
              }
            }
          }
          arr.push(obj);
        }
      }
    }
    setRows(arr);
    setPage(0);
    setSelected({});
  }, [props.options, props.search, props.searchDest, props.hidden]);

  React.useEffect(() => {
    const ids = {};
    for (const [id, leg] of Object.entries(props.options.flight)) {
      const arr = [];
      if (leg.passengers) {
        for (const type of Object.keys(leg.passengers)) {
          for (const j of leg.passengers[type]) {
            arr.push(j.id);
          }
        }
      }
      if (leg.kg) {
        for (const type of Object.keys(leg.kg)) {
          for (const j of leg.kg[type]) {
            arr.push(j.id);
          }
        }
      }
      if (arr.length) {
        ids[id] = arr;
      }
    }
    setFlight(ids);
  }, [props.options.flight])

  // Update displayed rows when a variable has changed
  React.useEffect(() => {
    setPageRows(rows.slice().sort(getComparator(order, orderBy)).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage));
  }, [rows, order, orderBy, page, rowsPerPage]);

  const setSelectedRow = React.useCallback((id, list) => setSelected(s => {return {...s, [id]: list}}), []);

  const amountPax = Object.values(selected).reduce((acc, list) => acc + list.reduce((acc, e) => acc + e.pax, 0), 0);
  const amountKg = Object.values(selected).reduce((acc, list) => acc + list.reduce((acc, e) => acc + (e.pax > 0 ? 0 : e.kg), 0), 0);
  const pay = Object.values(selected).reduce((acc, list) => acc + list.reduce((acc, e) => acc + e.pay, 0), 0);

  const goTo = React.useCallback((evt, icao) => {
    evt.preventDefault();
    props.actions.current.goTo(icao);
  }, [props.actions]);

  return (
    <Box
      sx={{
        display: props.hidden ? 'none' : 'flex',
        flex: '1 1 auto',
        position: 'relative',
        background: '#eee',
        padding: 2,
        justifyContent: 'center',
        maxWidth: '100%',
        boxSizing: 'border-box'
      }}
    >
      <Paper
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: 1000,
          maxWidth: '100%'
        }}>
        <Toolbar
          sx={{
            flexShrink: 0
          }}
        >
          { amountKg > 0 || amountPax > 0 ?
            <React.Fragment>
              <Typography
                sx={{ flexGrow: 1 }}
                color="inherit"
                variant="subtitle1"
                component="div"
              >
                {amountPax > 0 &&
                  amountPax + ' passenger' + (amountPax > 1 ? 's' : '') + (amountKg > 0 ? ' & ' : '')
                }
                {amountKg > 0 &&
                  'Cargo ' + amountKg + ' kg'
                }
                &nbsp;(${pay}) selected
              </Typography>
              <AddToFlight
                style={{ flexShrink: 1, display: 'flex' }}
                onSubmit={(evt) => {
                  setTimeout(() => {
                    const ids = {...flight};
                    for (const [id, leg] of Object.entries(selected)) {
                      const arr = [];
                      for (const job of leg) {
                        arr.push(job.id);
                      }
                      if (arr.length) {
                        if (!ids[id]) { ids[id] = []; }
                        ids[id] = [...new Set([...ids[id], ...arr])];
                      }
                    }
                    setFlight(ids);
                    setSelected({});
                  }, 1000);
                }}
                ids={Object.values(selected).reduce((acc, list) => [...acc, ...list.map(elm => elm.id)], [])}
              >
                <Button color="secondary" onClick={() => setSelected({})} sx={{ mr: 1 }}>
                  Clear
                </Button>
              </AddToFlight>
            </React.Fragment>
          :
            <React.Fragment>
              <Typography
                sx={{ flexGrow: 1 }}
                variant="h6"
                component="div"
              >
                {props.search && <span>{props.search}{props.searchDest ? ' > '+props.searchDest : ''}</span>} Assignments ({type[props.options.type]})
                <IconButton
                  onClick={(evt) => setAnchorEl(evt.currentTarget)}
                  sx={{ ml: 1 }}
                >
                  <MoreVertIcon />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={() => setAnchorEl(null)}
                >
                  <MenuItem onClick={() => { setAnchorEl(null); props.setTable('planes') }}>Aircrafts table</MenuItem>
                </Menu>
              </Typography>
              <Button onClick={() => downloadCSV(rows)}>Download CSV</Button>
            </React.Fragment>
          }

        </Toolbar>
        <TableContainer sx={{ flexGrow: 1 }}>
          <MuiTable stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell sortDirection={orderBy === 'fr' ? order : false}>
                  <TableSortLabel
                    active={orderBy === 'fr'}
                    direction={order}
                    onClick={() => handleRequestSort('fr')}
                  >
                    From
                  </TableSortLabel>
                </TableCell>
                <TableCell sortDirection={orderBy === 'to' ? order : false}>
                  <TableSortLabel
                    active={orderBy === 'to'}
                    direction={order}
                    onClick={() => handleRequestSort('to')}
                  >
                    To
                  </TableSortLabel>
                </TableCell>
                <TableCell sortDirection={orderBy === 'amount' ? order : false}>
                  <TableSortLabel
                    active={orderBy === 'amount'}
                    direction={order}
                    onClick={() => handleRequestSort('amount')}
                  >
                    Cargo
                  </TableSortLabel>
                </TableCell>
                <TableCell sortDirection={orderBy === 'direction' ? order : false}>
                  <TableSortLabel
                    active={orderBy === 'direction'}
                    direction={order}
                    onClick={() => handleRequestSort('direction')}
                  >
                    Bearing
                  </TableSortLabel>
                </TableCell>
                <TableCell sortDirection={orderBy === 'distance' ? order : false}>
                  <TableSortLabel
                    active={orderBy === 'distance'}
                    direction={order}
                    onClick={() => handleRequestSort('distance')}
                  >
                    Distance
                  </TableSortLabel>
                </TableCell>
                <TableCell sortDirection={orderBy === 'pay' ? order : false}>
                  <TableSortLabel
                    active={orderBy === 'pay'}
                    direction={order}
                    onClick={() => handleRequestSort('pay')}
                  >
                    Pay
                  </TableSortLabel>
                </TableCell>
                { props.options.type === 'All-In' &&
                  <TableCell sortDirection={orderBy === 'planeModel' ? order : false}>
                    <TableSortLabel
                      active={orderBy === 'planeModel'}
                      direction={order}
                      onClick={() => handleRequestSort('planeModel')}
                    >
                      Plane
                    </TableSortLabel>
                  </TableCell>
                }
                <TableCell />
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {pageRows.map(row => (
                <Row
                  key={row.id}
                  row={row}
                  allIn={props.options.type === 'All-In'}
                  selected={selected[row.id]}
                  setSelected={setSelectedRow}
                  flight={flight[row.id]}
                  goTo={goTo}
                />
              ))}
            </TableBody>
          </MuiTable>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            flexShrink: 0,
            borderTop: '1px solid rgba(224, 224, 224, 1)'
          }}
        />
      </Paper>
    </Box>
  );
}

export default Table;
