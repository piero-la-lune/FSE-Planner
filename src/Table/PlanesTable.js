import React from 'react';
import Box from '@mui/material/Box';
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
import NavigationIcon from '@mui/icons-material/Navigation';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AdjustIcon from '@mui/icons-material/Adjust';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Link from '@mui/material/Link';
import Tooltip from '@mui/material/Tooltip';

import { getDistance, getRhumbLineBearing, convertDistance } from "geolib";

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

function downloadCSV(rows, cargo) {
  let csv = "id,location,model,registration,home,bonus,dry,wet\n";
  for (const row of rows) {
    csv += row.id+','+row.location+','+row.model+','+row.reg+','+row.home+','+row.bonus+','+row.dry+','+row.wet+"\n";
  }
  const blob = new Blob([csv], {type: 'text/csv'});
  const a = document.createElement('a');
  a.download = 'aircrafts.csv';
  a.href = window.URL.createObjectURL(blob)
  a.dataset.downloadurl =  ['text/csv', a.download, a.href].join(':');
  a.click();
}

const Row = React.memo(function Row(props) {
  const { row } = props;
  const [anchorEl, setAnchorEl] = React.useState(null);
  const handleClose = () => setAnchorEl(null);
  const dryFormRef = React.useRef(null);
  const wetFormRef = React.useRef(null);
  return (
    <TableRow>
      <TableCell>
        <Link href="#" onClick={(evt) => props.goTo(evt, row.location)}>
          {row.location}
        </Link>
      </TableCell>
      <TableCell>{row.model}</TableCell>
      <TableCell>{row.reg}</TableCell>
      <TableCell>
        <Link href="#" onClick={(evt) => props.goTo(evt, row.home)}>
          {row.home}
        </Link>
      </TableCell>
      <TableCell>
        {row.bonus !== 0 &&
          <React.Fragment>
            { row.dir === null ?
              <AdjustIcon fontSize="inherit" sx={{ mr: 0.5, verticalAlign: 'text-top' }} />
            :
              <Tooltip title={row.dir+'° '+row.dist+' NM'}>
                <NavigationIcon fontSize="inherit" sx={{ transform: 'rotate('+row.dir+'deg)', mr: 0.5, verticalAlign: 'text-top' }} />
              </Tooltip>
            }
            ${row.bonus}
          </React.Fragment>
        }
      </TableCell>
      <TableCell>
        {row.dry !== 0 ?
          <React.Fragment>
            ${row.dry}
          </React.Fragment>
        :
          '-'
        }
      </TableCell>
      <TableCell>
        {row.wet !== 0 ?
          <React.Fragment>
            ${row.wet}
          </React.Fragment>
        :
          '-'
        }
      </TableCell>
      <TableCell sx={{px: 1, py: 0}}>
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
          <MenuItem component={Link} href={"https://server.fseconomy.net/aircraftlog.jsp?id="+row.id} target="fse" onClick={handleClose}>
            Open {row.reg} in FSE
          </MenuItem>
          <MenuItem component={Link} href={"https://server.fseconomy.net/airport.jsp?icao="+row.location} target="fse" onClick={handleClose}>
            Open {row.location} in FSE
          </MenuItem>
          {(row.dry !== 0 || row.wet === 0) &&
            <MenuItem onClick={() => { dryFormRef.current.submit(); handleClose(); }}>
              Rent dry
            </MenuItem>
          }
          {row.wet !== 0 &&
            <MenuItem onClick={() => { wetFormRef.current.submit(); handleClose(); }}>
              Rent wet
            </MenuItem>
          }
        </Menu>
        <form
          action="https://server.fseconomy.net/userctl"
          method="post"
          style={{ display: 'none' }}
          target="fse"
          ref={dryFormRef}
        >
          <input type="hidden" name="event" value="Aircraft" />
          <input type="hidden" name="type" value="add" />
          <input type="hidden" name="rentalType" value="dry" />
          <input type="hidden" name="id" value={row.id} />
          <input type="hidden" name="returnpage" value="/myflight_v2.jsp" />
        </form>
        <form
          action="https://server.fseconomy.net/userctl"
          method="post"
          style={{ display: 'none' }}
          target="fse"
          ref={wetFormRef}
        >
          <input type="hidden" name="event" value="Aircraft" />
          <input type="hidden" name="type" value="add" />
          <input type="hidden" name="rentalType" value="wet" />
          <input type="hidden" name="id" value={row.id} />
          <input type="hidden" name="returnpage" value="/myflight_v2.jsp" />
        </form>
      </TableCell>
    </TableRow>
  );
});

function Table(props) {
  const [rows, setRows] = React.useState([]);
  const [pageRows, setPageRows] = React.useState([]);
  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('location');
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(25);
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
    if (props.hidden) { return false; }

    const planes = [];
    let lookup = Object.entries(props.options.planes);
    if (props.search) {
      if (props.options.planes[props.search]) {
        lookup = [[props.search, props.options.planes[props.search]]];
      }
      else {
        lookup = [];
      }
    }
    for (const [location, arr] of lookup) {
      for (const plane of arr) {
        const fr = { latitude: props.options.icaodata[location].lat, longitude: props.options.icaodata[location].lon };
        const to = { latitude: props.options.icaodata[plane.home].lat, longitude: props.options.icaodata[plane.home].lon };
        const dir = Math.round(getRhumbLineBearing(fr, to));
        const dist = Math.round(convertDistance(getDistance(fr, to), 'sm'));
        planes.push({location: location, dir: location === plane.home ? null : dir, dist: dist, ...plane});
      }
    }
    setRows(planes);
    setPage(0);
  }, [props.options, props.search, props.hidden]);

  // Update displayed rows when a variable has changed
  React.useEffect(() => {
    setPageRows(rows.slice().sort(getComparator(order, orderBy)).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage));
  }, [rows, order, orderBy, page, rowsPerPage]);

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
          <Typography
            sx={{ flexGrow: 1 }}
            variant="h6"
            component="div"
          >
            {props.search && <span>{props.search}</span>} Aircrafts
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
              <MenuItem onClick={() => { setAnchorEl(null); props.setTable('jobs') }}>Assignments table</MenuItem>
            </Menu>
          </Typography>
          <Button onClick={() => downloadCSV(rows)}>Download CSV</Button>
        </Toolbar>
        <TableContainer sx={{ flexGrow: 1 }}>
          <MuiTable stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sortDirection={orderBy === 'location' ? order : false}>
                  <TableSortLabel
                    active={orderBy === 'location'}
                    direction={order}
                    onClick={() => handleRequestSort('location')}
                  >
                    Location
                  </TableSortLabel>
                </TableCell>
                <TableCell sortDirection={orderBy === 'model' ? order : false}>
                  <TableSortLabel
                    active={orderBy === 'model'}
                    direction={order}
                    onClick={() => handleRequestSort('model')}
                  >
                    Model
                  </TableSortLabel>
                </TableCell>
                <TableCell sortDirection={orderBy === 'reg' ? order : false}>
                  <TableSortLabel
                    active={orderBy === 'reg'}
                    direction={order}
                    onClick={() => handleRequestSort('reg')}
                  >
                    Registration
                  </TableSortLabel>
                </TableCell>
                <TableCell sortDirection={orderBy === 'home' ? order : false}>
                  <TableSortLabel
                    active={orderBy === 'home'}
                    direction={order}
                    onClick={() => handleRequestSort('home')}
                  >
                    Home
                  </TableSortLabel>
                </TableCell>
                <TableCell sortDirection={orderBy === 'bonus' ? order : false}>
                  <TableSortLabel
                    active={orderBy === 'bonus'}
                    direction={order}
                    onClick={() => handleRequestSort('bonus')}
                  >
                    Bonus
                  </TableSortLabel>
                </TableCell>
                <TableCell sortDirection={orderBy === 'dry' ? order : false}>
                  <TableSortLabel
                    active={orderBy === 'dry'}
                    direction={order}
                    onClick={() => handleRequestSort('dry')}
                  >
                    Dry rental
                  </TableSortLabel>
                </TableCell>
                <TableCell sortDirection={orderBy === 'wet' ? order : false}>
                  <TableSortLabel
                    active={orderBy === 'wet'}
                    direction={order}
                    onClick={() => handleRequestSort('wet')}
                  >
                    Wet rental
                  </TableSortLabel>
                </TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {pageRows.map(row => (
                <Row
                  key={row.id}
                  row={row}
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
