import React from 'react';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Popover from '@mui/material/Popover';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import SettingsEthernetIcon from '@mui/icons-material/SettingsEthernet';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FilterListIcon from '@mui/icons-material/FilterList';

import IcaoSearch from './IcaoSearch.js';

const styles = {
  icon: {
    marginRight: 0.2
  },
  gridText: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  filtersInput: {
    width: "100%",
    mb: 1
  }
};

function filterText(sortBy, result) {
  switch(sortBy) {
    case 'payNM': return '$'+Math.round(result.payNM)+'/NM';
    case 'payLeg': return '$'+Math.round(result.payLeg)+'/leg';
    case 'payTime': return '$'+Math.round(result.payTime)+'/H';
    case 'distance': return '';
    case 'pay': return '';
    default: return '$'+result.b+' bonus';
  }
}

// List of results
const List = React.memo(({results, showDetail, goTo, setRoute, nbDisplay, sortBy}) => {
  return (
    results.slice(0, nbDisplay).map(result =>
      <Box
        sx={{
          padding: 3,
          borderBottom: "1px solid #eee",
          cursor: "pointer",
          "&:hover": {
            background: "#f9f9f9"
          },
          position: "relative"
        }}
        key={result.id}
        onClick={() => showDetail(result)}
        onMouseEnter={() => setRoute(result)}
      >
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          sx={{
            '& .MuiBreadcrumbs-separator': {
              marginLeft: '1px',
              marginRight: '1px'
            }
          }}
          maxItems={5}
          itemsBeforeCollapse={3}
          onClick={(evt) => {
            // Show all ICAOs and do not display the result details when clicking the ... button
            if (evt.target.closest('button')) {
              evt.stopPropagation();
            }
          }}
        >
          {result.icaos.map((icao, i) =>
            <Link
              href="#"
              onClick={evt => {
                evt.stopPropagation();
                evt.preventDefault();
                goTo(icao)
              }}
              key={i}
            >{icao}</Link>
          )}
        </Breadcrumbs>
        <Grid container spacing={1} sx={{ mt: 1, ml: -2 }}>
          <Grid item xs={4}>
            <Typography variant="body2" sx={styles.gridText}><AttachMoneyIcon sx={styles.icon} />{result.pay}</Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="body2" sx={styles.gridText}><SettingsEthernetIcon sx={styles.icon} />{result.distance} NM</Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="body2" sx={styles.gridText}><AccessTimeIcon sx={styles.icon} />{result.time}</Typography>
          </Grid>
        </Grid>
        <Typography
          variant="body2"
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            color: "#aaa",
            fontSize: "0.8em"
          }}
        >
          {filterText(sortBy, result)}
        </Typography>
      </Box>
    )
  );
});


const sortFunctions = {
  payNM: (a, b) => b.payNM - a.payNM,
  payLeg: (a, b) => b.payLeg - a.payLeg,
  payTime: (a, b) => b.payTime - a.payTime,
  pay: (a, b) => b.pay - a.pay,
  distance: (a, b) => a.distance - b.distance,
  bonus: (a, b) => b.b - a.b,
}

const Results = React.memo((props) => {
  const [filterMenu, setFilterMenu] = React.useState(null);
  const [minDist, setMinDist] = React.useState('');
  const [maxDist, setMaxDist] = React.useState('');
  const [minPay, setMinPay] = React.useState('');
  const [maxPay, setMaxPay] = React.useState('');
  const [minTime, setMinTime] = React.useState('');
  const [maxTime, setMaxTime] = React.useState('');
  const [filterIcaos, setFilterIcaos] = React.useState([]);
  const [filterExcludeIcaos, setFilterExcludeIcaos] = React.useState([]);
  const [nbDisplay, setNbDisplay] = React.useState(20);
  const [filteredResults, setFilteredResults] = React.useState(() => props.results.sort(sortFunctions['payTime']));
  const [sortBy, setSortBy] = React.useState('payTime');
  const resultsDiv = React.useRef(null);

  const filterResults = () => {
    let minTimeNb = null;
    let maxTimeNb = null;
    if (minTime) {
      const t = minTime.split(':');
      if (t.length === 2) {
        minTimeNb = parseInt(t[0]) + parseInt(t[1])/60;
      }
      else {
        setMinTime('');
      }
    }
    if (maxTime) {
      const t = maxTime.split(':');
      if (t.length === 2) {
        maxTimeNb = parseInt(t[0]) + parseInt(t[1])/60;
      }
      else {
        setMaxTime('');
      }
    }

    const r = props.results.filter(elm => {
      return !(
           (minDist && elm.distance < minDist)
        || (maxDist && elm.distance > maxDist)
        || (minPay && elm.pay < minPay)
        || (maxPay && elm.pay > maxPay)
        || (minTimeNb && elm.timeNb < minTimeNb)
        || (maxTimeNb && elm.timeNb > maxTimeNb)
        || (filterIcaos.length && !filterIcaos.every(x => elm.icaos.includes(x.icao)))
        || (filterExcludeIcaos.length && !filterExcludeIcaos.every(x => !elm.icaos.includes(x.icao)))
      );
    })
    r.sort(sortFunctions[sortBy]);
    setFilteredResults(r);
    setFilterMenu(null);
  }

  // Scroll to top when filtering / changing sortby of results
  React.useEffect(() => {
    if (resultsDiv.current) {
      resultsDiv.current.scrollTo(0 ,0);
      setNbDisplay(20);
    }
  }, [filteredResults, resultsDiv]);

  return (
    <Box
      sx={{
        display: props.display ? 'flex' : 'none',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      <Box
        sx={{
          background: "#fff",
          display: "flex",
          alignItems: "center"
        }}
      >
        <Box
          sx={{
            cursor: "pointer",
            height: "100%",
            "&:hover": {
              background: "#f9f9f9"
            }
          }}
          onClick={props.close}
        >
          <Typography
            variant="body2"
            sx={{
              lineHeight: 0.8,
              textAlign: "center",
              py: 2,
              px: 1.5
            }}
          >
            <ArrowBackIcon /><br />New search
          </Typography>
        </Box>
        <Box sx={{ py: 2, px: 1 }}>
          <Button
            variant="contained"
            onClick={(evt) => setFilterMenu(evt.currentTarget)}
            startIcon={<FilterListIcon />}
          >
            Filters
          </Button>
          <Popover
            anchorEl={filterMenu}
            keepMounted
            open={Boolean(filterMenu)}
            onClose={filterResults}
            sx={{
              '& .MuiPaper-root': {
                maxWidth: 300,
                py: 1,
                px: 2
              }
            }}
          >
            <Typography variant="body1" sx={{ mb: 2 }}>Route filters:</Typography>
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <TextField
                  label="Min distance"
                  variant="outlined"
                  value={minDist}
                  onChange={(evt) => setMinDist(evt.target.value.replace(/[^0-9]/g, ''))}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">NM</InputAdornment>,
                  }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  size="small"
                  sx={styles.filtersInput}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Max distance"
                  variant="outlined"
                  value={maxDist}
                  onChange={(evt) => setMaxDist(evt.target.value.replace(/[^0-9]/g, ''))}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">NM</InputAdornment>,
                  }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  size="small"
                  sx={styles.filtersInput}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Min duration"
                  variant="outlined"
                  value={minTime}
                  placeholder="1:30"
                  onChange={(evt) => {
                    const val = evt.target.value;
                    if (val.match(/^[0-9:]*$/g)) {
                      setMinTime(val);
                    }
                  }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  size="small"
                  sx={styles.filtersInput}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Max duration"
                  variant="outlined"
                  value={maxTime}
                  placeholder="6:30"
                  onChange={(evt) => {
                    const val = evt.target.value;
                    if (val.match(/^[0-9:]*$/g)) {
                      setMaxTime(val);
                    }
                  }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  size="small"
                  sx={styles.filtersInput}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Min pay"
                  variant="outlined"
                  value={minPay}
                  onChange={(evt) => setMinPay(evt.target.value.replace(/[^0-9]/g, ''))}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  size="small"
                  sx={styles.filtersInput}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Max pay"
                  variant="outlined"
                  value={maxPay}
                  onChange={(evt) => setMaxPay(evt.target.value.replace(/[^0-9]/g, ''))}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  size="small"
                  sx={styles.filtersInput}
                />
              </Grid>
              <Grid item xs={12}>
                <IcaoSearch
                  options={props.icaodataArr}
                  label="Include ICAO(s)"
                  inputProps={{
                    InputLabelProps:{
                      shrink: true,
                    },
                    size:"small",
                    sx:styles.filtersInput
                  }}
                  onChange={(evt, value) => {
                    setFilterIcaos(value);
                  }}
                  onPaste={evt => {
                    // When pasting data, check if only consituted of multiple valid ICAOs
                    // If so, update filter with all these ICAOs at once
                    const arr = evt.clipboardData.getData('Text').split(/\s/).map(e => e.toUpperCase());
                    const icaos = [];
                    for (const option of props.icaodataArr) {
                      if (arr.includes(option.icao)) {
                        icaos.push(option);
                      }
                    }
                    if (arr.length !== icaos.length) {
                      return true;
                    }
                    setFilterIcaos([...filterIcaos, ...icaos]);
                    evt.preventDefault();
                    evt.stopPropagation();
                    return false;
                  }}
                  value={filterIcaos}
                  multiple
                />
              </Grid>
              <Grid item xs={12}>
                <IcaoSearch
                  options={props.icaodataArr}
                  label="Exclude ICAO(s)"
                  inputProps={{
                    InputLabelProps:{
                      shrink: true,
                    },
                    size:"small",
                    sx:styles.filtersInput
                  }}
                  onChange={(evt, value) => {
                    setFilterExcludeIcaos(value);
                  }}
                  onPaste={evt => {
                    // When pasting data, check if only consituted of multiple valid ICAOs
                    // If so, update filter with all these ICAOs at once
                    const arr = evt.clipboardData.getData('Text').split(/\s/).map(e => e.toUpperCase());
                    const icaos = [];
                    for (const option of props.icaodataArr) {
                      if (arr.includes(option.icao)) {
                        icaos.push(option);
                      }
                    }
                    if (arr.length !== icaos.length) {
                      return true;
                    }
                    setFilterExcludeIcaos([...filterExcludeIcaos, ...icaos]);
                    evt.preventDefault();
                    evt.stopPropagation();
                    return false;
                  }}
                  value={filterExcludeIcaos}
                  multiple
                />
              </Grid>
            </Grid>
            <Button variant="contained" color="primary" onClick={filterResults} sx={{ mt: 1 }}>Apply</Button>
          </Popover>
        </Box>
        <Box sx={{ py: 2, px: 1 }}>
          <TextField
            value={sortBy}
            onChange={(evt) => {
              setFilteredResults(r => {
                r.sort(sortFunctions[evt.target.value]);
                return [...r];
              });
              setSortBy(evt.target.value);
            }}
            label="Sort by"
            variant="outlined"
            size="small"
            select
            sx={{
              width: 150,
              fontSize: "0.8em"
            }}
            InputProps={{style:{fontSize:"1em"}}}
            InputLabelProps={{style:{fontSize:"1em"}}}
          >
            <MenuItem value="payNM">Pay per NM</MenuItem>
            <MenuItem value="payLeg">Pay per leg</MenuItem>
            <MenuItem value="payTime">Pay per flight time</MenuItem>
            <MenuItem value="pay">Total pay</MenuItem>
            <MenuItem value="distance">Shortest distance</MenuItem>
            {props.type === "rent" && <MenuItem value="bonus">Plane bonus</MenuItem>}
          </TextField>
        </Box>
      </Box>
      <Box
        sx={{
          background: "#fff",
          borderBottom: "1px solid #eee",
          padding: 1
        }}
      >
        {
          filteredResults.length > 0 ?
            <Typography variant="body2">{filteredResults.length} routes found.</Typography>
          :
            <Typography variant="body2">No route found.</Typography>
        }
      </Box>
      <Box
        ref={resultsDiv}
        sx={{
          overflowX: "hidden",
          overflowY: "auto",
          scrollbarWidth: "thin",
          background: "#fff"
        }}
        onScroll={() => {
          if (resultsDiv.current.scrollHeight - resultsDiv.current.scrollTop - resultsDiv.current.clientHeight < 400 && nbDisplay < filteredResults.length) {
            setNbDisplay(nbDisplay + 20);
          }
        }}
      >
        <List
          results={filteredResults}
          showDetail={props.showDetail}
          goTo={props.goTo}
          setRoute={props.setRoute}
          nbDisplay={nbDisplay}
          sortBy={sortBy}
        />
      </Box>
    </Box>
  )
});

export default Results;
