import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import InputBase from '@material-ui/core/InputBase';
import Typography from '@material-ui/core/Typography';
import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete';
import IconButton from '@material-ui/core/IconButton';
import Popper from '@material-ui/core/Popper';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import StarIcon from '@material-ui/icons/Star';
import EmojiPeopleIcon from '@material-ui/icons/EmojiPeople';
import FlightIcon from '@material-ui/icons/Flight';
import PeopleIcon from '@material-ui/icons/People';
import BusinessCenterIcon from '@material-ui/icons/BusinessCenter';
import FlightTakeoffIcon from '@material-ui/icons/FlightTakeoff';
import FlightLandIcon from '@material-ui/icons/FlightLand';
import ExploreIcon from '@material-ui/icons/Explore';
import UpdateIcon from '@material-ui/icons/Update';
import SettingsEthernetIcon from '@material-ui/icons/SettingsEthernet';
import CloseIcon from '@material-ui/icons/Close';
import TuneIcon from '@material-ui/icons/Tune';
import { makeStyles } from '@material-ui/core/styles';

import {default as _clone} from 'lodash/cloneDeep';
import { default as _defaultsDeep } from 'lodash/defaultsDeep';

import FSEMap from './Map.js';
import UpdatePopup from './Update.js';
import SettingsPopup from './Settings.js';

import './App.css';
import icaodataSrc from "./data/icaodata.json";


const defaultSettings = {
  display: {
    markers: {
      colors: {
        base: 'black',
        rentable: 'red',
        selected: 'green'   
      },
      sizes: {
        base: '17',
        rentable: '20',
        selected: '25'
      }
    },
    legs: {
      colors: {
        passengers: '#3f51b5',
        cargo: '#3f51b5',
        highlight: 'yellow',
        flight: '#3087A8'
      },
      weights: {
        base: '1.2',
        passengers: '10',
        cargo: '10',
        flight: '10'
      }
    },
    map: {
      center: 0
    }
  },
  from: {
    distCoef: '1.5',
    angle: '',
    maxDist: ''
  },
  to: {
    distCoef: '1.5',
    angle: '',
    maxDist: ''
  },
  direction: {
    angle: '30'
  },
  pay: {
    min_job: '',
    min_leg: '',
    top: '',
  }
};


Object.keys(icaodataSrc).forEach(icao => icaodataSrc[icao].icao = icao);

const filter = createFilterOptions({limit: 5});
const PopperMy = function (props) {
  return (<Popper {...props} style={{ width: 400 }} placement='bottom-start' />)
}

function wrap(num, center) {
  if (num < center-180) { return num+360; }
  if (num >= center+180) { return num-360; }
  return num;
}

const useStyles = makeStyles(theme => ({
  tgBtn: {
    color: "rgba(255, 255, 255, 0.5)",
    borderColor: "rgba(255, 255, 255, 0.5)"
  },
  tgBtnSelected: {
    color: "rgba(255, 255, 255, 1) !important"
  },
  box: {
    marginLeft: theme.spacing(2),
    marginTop: theme.spacing(1)/2,
    marginBottom: theme.spacing(1)/2,
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    color: "#fff",
    borderRadius: theme.shape.borderRadius,
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    width: "60px"
  },
  inputNb: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    color: "#fff",
    borderRadius: theme.shape.borderRadius,
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    width: "50px"
  },
  inputSearch: {
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    color: "#fff",
    borderRadius: theme.shape.borderRadius,
    paddingLeft: theme.spacing(1),
    width: "120px"
  },
  boxBorder: {
    borderRadius: theme.shape.borderRadius,
    border: '1px solid',
    borderColor: "rgba(255, 255, 255, 0.5)",
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    paddingTop: '7px',
    paddingBottom: '7px',
    marginLeft: theme.spacing(2),
    marginTop: theme.spacing(1)/2,
    marginBottom: theme.spacing(1)/2,
    display: 'flex',
    alignItems: 'center'
  },
  icon: {
    color: "rgba(255, 255, 255, 0.5)",
    "&:hover": {
      color: "#fff"
    },
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2)
  },
  popover: {
    padding: theme.spacing(2),
    marginTop: '24px'
  },
  tooltip: {
    backgroundColor: theme.palette.primary.dark,
    border: '1px solid #fff',
    fontSize: '0.9em',
    fontWeight: 'normal',
    marginTop: '5px'
  },
  tooltipArrow: {
    color: theme.palette.primary.dark,
    "&:before": {
      border: '1px solid #fff'
    }
  },
  title: {
    flexGrow: 1,
    display: 'flex',
    alignItems: 'baseline',
    flexWrap: 'wrap'
  },
  h6: {
    lineHeight: 1
  },
  version: {
    marginLeft: theme.spacing(1)
  },
  filters: {
    display: 'flex',
    flexWrap: 'wrap',
    margin: theme.spacing(1)/2,
    justifyContent: 'flex-end'
  },
  search: {
    display: 'flex',
    alignItems: 'center'
  },
  searchOption: {
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden'
  },
  searchInfos: {
    display: 'flex',
    flexDirection: 'column',
    marginLeft: theme.spacing(2),
    overflow: 'hidden',
  },
  searchLocation: {
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    color: '#aaa'
  },
  searchName: {
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap'
  },
  searchIcao: {
    minWidth: 40,
    textAlign: 'center'
  }
}));

const TooltipToggleButton = ({ children, title, tclasses, ...props }) => (
  <Tooltip title={title} classes={tclasses} arrow>
    <ToggleButton {...props}>{children}</ToggleButton>
  </Tooltip>
)


function rentable(planes) {
  const rentable = {};
  for (const obj of Object.values(planes)) {
    // Exclude broken airplanes
    if (obj.NeedsRepair === 1) { continue; }
    // Ensure plane can be rented
    if (obj.Location === 'In Flight') { continue; }
    if (obj.RentedBy !== 'Not rented.') { continue; }
    if (!obj.RentalDry && !obj.RentalWet) { continue; }
    // Add to rentable list
    if (!rentable.hasOwnProperty(obj.Location)) { rentable[obj.Location] = []; }
    rentable[obj.Location].push(obj);
  }
  return rentable;
}


function App() {

  const [type, setType] = React.useState('Trip-Only');
  const [cargo, setCargo] = React.useState('passengers');
  const [fromIcaoInput, setFromIcaoInput] = React.useState('');
  const [fromIcao, setFromIcao] = React.useState(null);
  const [toIcaoInput, setToIcaoInput] = React.useState('');
  const [toIcao, setToIcao] = React.useState(null);
  const [min, setMin] = React.useState('');
  const [max, setMax] = React.useState('');
  const [minDist, setMinDist] = React.useState('');
  const [maxDist, setMaxDist] = React.useState('');
  const [direction, setDirection] = React.useState('');
  const [updatePopup, setUpdatePopup] = React.useState(false);
  const [settingsPopop, setSettingsPopup] = React.useState(false);
  const [jobs, setJobs] = React.useState(JSON.parse(localStorage.getItem("jobs")) || {});
  const [planes, setPlanes] = React.useState(() => {
    const p = JSON.parse(localStorage.getItem("planes"));
    if (p) { return rentable(p); }
    return {};
  });
  const [flight, setFlight] = React.useState(JSON.parse(localStorage.getItem("flight")) || {});
  const [settings, setSettings] = React.useState(() => {
    const s = JSON.parse(localStorage.getItem("settings"));
    if (s) {
      return _defaultsDeep(s, defaultSettings);
    }
    return defaultSettings;
  });
  const [search, setSearch] = React.useState('');
  const [searchInput, setSearchInput] = React.useState('');
  const [searchHistory, setSearchHistory] = React.useState(JSON.parse(localStorage.getItem("searchHistory")) || []);
  const [icaodata, setIcaodata] = React.useState(icaodataSrc);
  const classes = useStyles();

  const options = React.useMemo(() => ({
    min: min,
    max: max,
    minDist: minDist,
    maxDist: maxDist,
    direction: direction,
    type: type,
    cargo: cargo,
    fromIcao: fromIcao,
    toIcao: toIcao,
    jobs: jobs,
    planes: planes,
    flight: flight,
    settings: settings,
    icaodata: icaodata
  }), [type, cargo, fromIcao, toIcao, min, max, minDist, maxDist, direction, jobs, planes, flight, settings, icaodata]);

  React.useEffect(() => {
    const obj = _clone(icaodataSrc);
    Object.keys(obj).forEach((icao) => {
      obj[icao].lon = wrap(obj[icao].lon, settings.display.map.center);
    });
    setIcaodata(obj);
  }, [settings.display.map.center]);


  return (
    <div style={{
      display: "flex",
      flexFlow: "column",
      height: "100vh",
    }}>
      <AppBar position="static">
        <Toolbar>
          <div className={classes.title}>
            <Typography variant="h6" className={classes.h6}>
              FSE Planner
            </Typography>
            <Typography variant="caption" className={classes.version}>
              v{process.env.REACT_APP_VERSION}
            </Typography>
          </div>
          <div className={classes.filters}>
            <div className={classes.search}>
              <Autocomplete
                options={Object.values(icaodata)}
                getOptionLabel={(a) => a.icao ? a.icao : ''}
                renderOption={(a) =>
                  <span className={classes.searchOption}>
                    <b className={classes.searchIcao}>{a.icao}</b>
                    <span className={classes.searchInfos}>
                      <span className={classes.searchName}>{a.name}</span>
                      <Typography variant="caption" className={classes.searchLocation}>{a.city}, {a.state ? a.state+', ' : ''}{a.country}</Typography>
                    </span>
                  </span>
                }
                filterOptions={(options, params) => {
                  // If input is empty and search history is not, display search history
                  if (!searchInput && searchHistory.length > 0) {
                    return options.filter(elm => searchHistory.includes(elm.icao));
                  }
                  // Search for ICAO
                  let filtered = filter(options, { inputValue: searchInput, getOptionLabel: (a) => a.icao });
                  // If not enough results, search for city name
                  if (filtered.length < 5) {
                    const add = filter(options, { inputValue: searchInput, getOptionLabel: (a) => a.name });
                    filtered = filtered.concat(add.slice(0, 5-filtered.length));
                  }
                  return filtered;
                }}
                renderInput={(params) =>
                  <InputBase
                    placeholder="Search..."
                    className={classes.inputSearch}
                    ref={params.InputProps.ref}
                    inputProps={params.inputProps}
                    endAdornment={params.inputProps.value ? <IconButton size="small" onClick={() => {setSearch(''); setSearchInput('');}}><CloseIcon /></IconButton> : null}
                  />
                }
                PopperComponent={PopperMy}
                onChange={(evt, value) => {
                  setSearch(value);
                  if (value) {
                    const list = [...(new Set([value.icao, ...searchHistory]))].slice(0, 5);
                    setSearchHistory(list);
                    localStorage.setItem('searchHistory', JSON.stringify(list));
                  }
                }}
                value={search || null}
                inputValue={searchInput}
                onInputChange={(evt, value) => setSearchInput(value)}
                autoHighlight={true}
                selectOnFocus={false}
              />
            </div>
            <Tooltip title='Jobs radiating FROM this airport' classes={{tooltip: classes.tooltip, arrow: classes.tooltipArrow}} arrow>
              <div className={classes.boxBorder}>
                <FlightTakeoffIcon className={fromIcao === null ? classes.tgBtn : null}/>
                &nbsp;&nbsp;
                <InputBase
                  placeholder="ICAO"
                  className={classes.input}
                  inputProps={{maxLength:4}}
                  value={fromIcaoInput}
                  onChange={evt => {
                    let val = evt.target.value.toUpperCase();
                    setFromIcaoInput(val);
                    if (icaodata.hasOwnProperty(val)) {
                      setFromIcao(val);
                    }
                    else {
                      setFromIcao(null)
                    }
                  }}
                />
              </div>
            </Tooltip>
            <Tooltip title='Jobs radiating TO this airport' classes={{tooltip: classes.tooltip, arrow: classes.tooltipArrow}} arrow>
              <div className={classes.boxBorder}>
                <FlightLandIcon className={toIcao === null ? classes.tgBtn : null} />
                &nbsp;&nbsp;
                <InputBase
                  placeholder="ICAO"
                  className={classes.input}
                  inputProps={{maxLength:4}}
                  value={toIcaoInput}
                  onChange={evt => {
                    let val = evt.target.value.toUpperCase();
                    setToIcaoInput(val);
                    if (icaodata.hasOwnProperty(val)) {
                      setToIcao(val);
                    }
                    else {
                      setToIcao(null)
                    }
                  }}
                />
              </div>
            </Tooltip>
            <Tooltip title='Jobs going in this direction (+/- 30°)' classes={{tooltip: classes.tooltip, arrow: classes.tooltipArrow}} arrow>
              <div className={classes.boxBorder}>
                <ExploreIcon className={direction === '' ? classes.tgBtn : null}/>
                &nbsp;&nbsp;
                <InputBase
                  placeholder="145°"
                  className={classes.input}
                  inputProps={{maxLength:3}}
                  value={direction}
                  onChange={evt => { setDirection(evt.target.value); }}
                />
              </div>
            </Tooltip>
            <ToggleButtonGroup value={type} onChange={(evt, val) => {setType(val)}} className={classes.box} exclusive>
              <TooltipToggleButton value="Trip-Only" title="Trip only" classes={{root: classes.tgBtn, selected: classes.tgBtnSelected}} tclasses={{tooltip: classes.tooltip, arrow: classes.tooltipArrow}}>
                <EmojiPeopleIcon />
              </TooltipToggleButton>
              <TooltipToggleButton value="VIP" title="VIP" classes={{root: classes.tgBtn, selected: classes.tgBtnSelected}} tclasses={{tooltip: classes.tooltip, arrow: classes.tooltipArrow}}>
                <StarIcon />
              </TooltipToggleButton>
              <TooltipToggleButton value="All-In" title="All in" classes={{root: classes.tgBtn, selected: classes.tgBtnSelected}} tclasses={{tooltip: classes.tooltip, arrow: classes.tooltipArrow}}>
                <FlightIcon />
              </TooltipToggleButton>
            </ToggleButtonGroup>
            <ToggleButtonGroup value={cargo} onChange={(evt, val) => {setCargo(val);setMin('');setMax('');}} className={classes.box} exclusive>
              <TooltipToggleButton value="passengers" title="Passengers" classes={{root: classes.tgBtn, selected: classes.tgBtnSelected}} tclasses={{tooltip: classes.tooltip, arrow: classes.tooltipArrow}}>
                <PeopleIcon />
              </TooltipToggleButton>
              <TooltipToggleButton value="kg" title="Cargo" classes={{root: classes.tgBtn, selected: classes.tgBtnSelected}} tclasses={{tooltip: classes.tooltip, arrow: classes.tooltipArrow}}>
                <BusinessCenterIcon />
              </TooltipToggleButton>
            </ToggleButtonGroup>
            <div className={classes.boxBorder}>
              {cargo === 'passengers' ?
                <PeopleIcon className={min === '' && max === '' ? classes.tgBtn : null}/>
              :
                <BusinessCenterIcon className={min === '' && max === '' ? classes.tgBtn : null} />
              }
              &nbsp;
              <Tooltip title={cargo === 'passengers' ? "Minimum number of passengers per segment" : "Minimum weight per segment"} classes={{tooltip: classes.tooltip, arrow: classes.tooltipArrow}} arrow>
                <InputBase
                  placeholder="min"
                  className={classes.inputNb}
                  value={min}
                  onChange={evt => { let nb = parseInt(evt.target.value) || ''; setMin(nb); }}
                />
              </Tooltip>
              -
              <Tooltip title={cargo === 'passengers' ? "Maximum number of passengers per job" : "Maximum weight per job"} classes={{tooltip: classes.tooltip, arrow: classes.tooltipArrow}} arrow>
                <InputBase
                  placeholder="max"
                  className={classes.inputNb}
                  value={max}
                  onChange={evt => { let nb = parseInt(evt.target.value) || ''; setMax(nb); }}
                />
              </Tooltip>
            </div>
            <div className={classes.boxBorder}>
              <SettingsEthernetIcon className={minDist === '' && maxDist === '' ? classes.tgBtn : null} />
              &nbsp;
              <Tooltip title='Minimum job distance in NM' classes={{tooltip: classes.tooltip, arrow: classes.tooltipArrow}} arrow>
                <InputBase
                  placeholder="min"
                  className={classes.inputNb}
                  value={minDist}
                  onChange={evt => { let nb = parseInt(evt.target.value) || ''; setMinDist(nb); }}
                />
              </Tooltip>
              -
              <Tooltip title='Maximum job distance in NM' classes={{tooltip: classes.tooltip, arrow: classes.tooltipArrow}} arrow>
                <InputBase
                  placeholder="max"
                  className={classes.inputNb}
                  value={maxDist}
                  onChange={evt => { let nb = parseInt(evt.target.value) || ''; setMaxDist(nb); }}
                />
              </Tooltip>
            </div>
            <IconButton className={classes.icon+' '+classes.box} size="small" onClick={() => setSettingsPopup(true)}>
              <Tooltip title="More options">
                <TuneIcon />
              </Tooltip>
            </IconButton>
            <IconButton className={classes.icon+' '+classes.box} size="small" onClick={() => setUpdatePopup(true)}>
              <Tooltip title="Update data">
                <UpdateIcon />
              </Tooltip>
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>
      <FSEMap
        options={options}
        search={search}
      />
      <UpdatePopup
        open={updatePopup}
        handleClose={() => setUpdatePopup(false)}
        setJobs={setJobs}
        setPlanes={(planes) => setPlanes(rentable(planes))}
        setFlight={setFlight}
        icaodata={icaodata}
        settings={settings}
      />
      <SettingsPopup
        open={settingsPopop}
        handleClose={() => setSettingsPopup(false)}
        settings={settings}
        setSettings={setSettings}
        defaultSettings={defaultSettings}
      />
    </div>
  );
}

export default App;
