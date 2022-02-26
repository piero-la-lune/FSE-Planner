import React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';
import InputBase from '@mui/material/InputBase';
import Typography from '@mui/material/Typography';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import IconButton from '@mui/material/IconButton';
import Popper from '@mui/material/Popper';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import StarIcon from '@mui/icons-material/Star';
import EmojiPeopleIcon from '@mui/icons-material/EmojiPeople';
import FlightIcon from '@mui/icons-material/Flight';
import PeopleIcon from '@mui/icons-material/People';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import FlightLandIcon from '@mui/icons-material/FlightLand';
import ExploreIcon from '@mui/icons-material/Explore';
import UpdateIcon from '@mui/icons-material/Update';
import SettingsEthernetIcon from '@mui/icons-material/SettingsEthernet';
import CloseIcon from '@mui/icons-material/Close';
import TuneIcon from '@mui/icons-material/Tune';
import DirectionsIcon from '@mui/icons-material/Directions';

import { default as _clone } from 'lodash/cloneDeep';
import { default as _mergeWith } from 'lodash/mergeWith';
import { default as _isArray } from 'lodash/isArray';

import FSEMap from './Map.js';
import Routing from './Routing.js';
import UpdatePopup from './Popups/Update.js';
import SettingsPopup from './Popups/Settings.js';
import CreditsPopup from './Popups/Credits.js';
import ErrorBoundary from './ErrorBoundary.js';
import Tour from './Tour.js';
import Storage from './Storage.js';
import log from './util/logger.js';
import {wrap} from './util/utility.js';

import icaodataSrc from "./data/icaodata.json";
const icaodataSrcArr = Object.values(icaodataSrc);


const defaultSettings = {
  display: {
    markers: {
      colors: {
        base: 'black',
        rentable: 'red',
        selected: 'darkred',
        fse: 'black',
        sim: 'darkslateblue',
        custom: 'darkcyan'
      },
      sizes: {
        base: '13',
        rentable: '20',
        selected: '25',
        fse: '3',
        sim: '3',
        custom: '20'
      }
    },
    legs: {
      colors: {
        passengers: '#3f51b5',
        cargo: '#3f51b5',
        highlight: 'yellow',
        flight: 'darkred'
      },
      weights: {
        base: '1.2',
        passengers: '8',
        cargo: '8',
        flight: '5'
      },
      display: {
        custom: true
      }
    },
    map: {
      center: 0,
      basemap: 0
    },
    sim: 'msfs'
  },
  from: {
    distCoef: '',
    angle: '30',
    maxDist: ''
  },
  to: {
    distCoef: '',
    angle: '30',
    maxDist: ''
  },
  direction: {
    angle: '30'
  },
  pay: {
    min_job: '',
    min_leg: '',
    top: '',
  },
  airport: {
    size: [0, 23500],
    surface: [1, 2, 3, 4, 5, 6, 7, 8],
    runway: [0, 30000],
    onlySim: false,
    onlyILS: false,
    excludeMilitary: false
  },
  routeFinder: {
    maxHops: 4,
    maxStops: 1,
    minLoad: 80,
    maxBadLegs: 2,
    maxEmptyLeg: 20,
    idleTime: 2,
    fees: ['Ground', 'Booking', 'Rental', 'Fuel'],
    overheadLength: 0,
    approachLength: 10,
    memory: 'normal'
  },
  update: {
    direction: 'from'
  }
};

const icaos = Object.keys(icaodataSrc);


const filter = createFilterOptions({limit: 5});
const PopperMy = function (props) {
  return (<Popper {...props} style={{ width: 400 }} placement='bottom-start' />)
}

const styles = {
  tgBtn: {
    color: "rgba(255, 255, 255, 0.5)",
    borderColor: "rgba(255, 255, 255, 0.5)",
    '&.Mui-selected': {
      color: "rgba(255, 255, 255, 1) !important"
    }
  },
  tooltip: {
    backgroundColor: 'primary.dark',
    border: '1px solid #fff',
    fontSize: '0.9em',
    fontWeight: 'normal',
    marginTop: '5px',
    '& .MuiTooltip-arrow': {
      color: 'primary.dark',
      "&:before": {
        border: '1px solid #fff'
      }
    }
  },
  box: {
    marginLeft: 2,
    marginTop: 0.5,
    marginBottom: 0.5,
  },
  boxBorder: {
    borderRadius: 1,
    border: '1px solid',
    borderColor: "rgba(255, 255, 255, 0.5)",
    paddingLeft: 1,
    paddingRight: 1,
    paddingTop: '7px',
    paddingBottom: '7px',
    marginLeft: 2,
    marginTop: 0.5,
    marginBottom: 0.5,
    display: 'flex',
    alignItems: 'center'
  },
  icon: {
    color: "rgba(255, 255, 255, 0.5)",
    "&:hover": {
      color: "#fff"
    },
    marginTop: 1,
    marginBottom: 1,
    marginLeft: 2,
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    color: "#fff",
    borderRadius: 1,
    paddingLeft: 1,
    paddingRight: 1,
    width: "60px"
  },
  inputNb: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    color: "#fff",
    borderRadius: 1,
    paddingLeft: 1,
    paddingRight: 1,
    width: "50px"
  },
  inputSearch: {
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    color: "#fff",
    borderRadius: 1,
    paddingLeft: 1,
    paddingTop: 1,
    paddingBottom: 1,
    width: "120px"
  }
}

const MyTooltip = ({ children, ...props}) => (
  <Tooltip componentsProps={{ tooltip: { sx: styles.tooltip }}} arrow {...props}>
    {children}
  </Tooltip>
);

const TooltipToggleButton = ({ children, title, ...props }) => (
  <MyTooltip title={title}>
    <ToggleButton sx={styles.tgBtn} {...props}>{children}</ToggleButton>
  </MyTooltip>
);


function transformPlanes(p) {
  const planes = {};
  for (const model of Object.keys(p)) {
    for (const icao of Object.keys(p[model])) {
      if (!planes[icao]) { planes[icao] = []; }
      for (const plane of p[model][icao]) {
        plane.model = model
        planes[icao].push(plane);
      }
    }
  }
  return planes;
}
function transformJobs(j) {
  const jobs = _clone(j);
  for (const key of Object.keys(jobs)) {
    if (jobs[key].passengers && jobs[key].passengers.PT) {
      if (!jobs[key].passengers['Trip-Only']) {
        jobs[key].passengers['Trip-Only'] = [];
      }
      for (const p of jobs[key].passengers.PT) {
        p.PT = true;
        jobs[key].passengers['Trip-Only'].push(p);
      }
      delete jobs[key].passengers.PT;
    }
  }
  return jobs;
}

const storage = new Storage();


function App() {

  const [type, setType] = React.useState('Trip-Only');
  const [cargo, setCargo] = React.useState('passengers');
  const [fromIcaoInput, setFromIcaoInput] = React.useState('');
  const [fromIcao, setFromIcao] = React.useState(null);
  const [toIcaoInput, setToIcaoInput] = React.useState('');
  const [toIcao, setToIcao] = React.useState(null);
  const [minPax, setMinPax] = React.useState('');
  const [minKg, setMinKg] = React.useState('');
  const [maxPax, setMaxPax] = React.useState('');
  const [maxKg, setMaxKg] = React.useState('');
  const [minDist, setMinDist] = React.useState('');
  const [maxDist, setMaxDist] = React.useState('');
  const [direction, setDirection] = React.useState('');
  const [updatePopup, setUpdatePopup] = React.useState(false);
  const [settingsPopop, setSettingsPopup] = React.useState(false);
  const [creditsPopop, setCreditsPopup] = React.useState(false);
  const [jobs, setJobs] = React.useState(() => {
    return transformJobs(storage.get('jobs', {}));
  });
  const [planes, setPlanes] = React.useState(() => {
    return transformPlanes(storage.get('planes', {}));
  });
  const [flight, setFlight] = React.useState(() => {
    return transformJobs(storage.get('flight', {}));
  });
  const [settings, setSettings] = React.useState(() => {
    const obj = {};
    // Cannot use _defaultsDeep, because it messes up with array
    [defaultSettings, storage.get('settings', {})].forEach(item => {
      _mergeWith(obj, item, (objectValue, sourceValue) => {
        return _isArray(sourceValue) ? sourceValue : undefined;
      });
    });
    return obj;
  });
  const [search, setSearch] = React.useState(null);
  const [searchInput, setSearchInput] = React.useState('');
  const [searchHistory, setSearchHistory] = React.useState(storage.get('searchHistory', []));
  const [icaodata, setIcaodata] = React.useState(icaodataSrc);
  const [isTourOpen, setIsTourOpen] = React.useState(storage.get('tutorial') === null);
  const [customIcaos, setCustomIcaos] = React.useState(storage.get('customIcaos', []));
  const [routeFinder, setRouteFinder] = React.useState(false);
  const [route, setRoute] = React.useState(null);
  const mapRef = React.useRef();

  const options = React.useMemo(() => ({
    min: cargo === 'passengers' ? minPax : minKg,
    max: cargo === 'passengers' ? maxPax : maxKg,
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
  }), [type, cargo, fromIcao, toIcao, minPax, minKg, maxPax, maxKg, minDist, maxDist, direction, jobs, planes, flight, settings, icaodata]);

  React.useEffect(() => {
    const obj = _clone(icaodataSrc);
    icaos.forEach((icao) => {
      const nb = wrap(obj[icao].lon, settings.display.map.center);
      obj[icao].lon += nb;
    });
    setIcaodata(obj);
  }, [settings.display.map.center]);

  React.useEffect(() => {
    // Display changelog if new version
    const last = storage.get('tutorial');
    if (last && last !== process.env.REACT_APP_VERSION) {
      setCreditsPopup(true);
      storage.set('tutorial', process.env.REACT_APP_VERSION);
    }

    // Set search if query string in URL
    const urlParams = new URLSearchParams(window.location.search);
    const icao = urlParams.get('icao');
    if (icao) {
      setSearch(icao);
    }

    // Register error logging
    window.onerror = (message, file, line, column, errorObject) => {
      // We do not use ErrorBoundary component for logging, because it does
      // not detect errors in event handlers, and we need to log these errors too
      log.error(message, {
        file: file,
        line: line,
        column: column,
        obj: errorObject,
      });
    }

  }, []);

  // Create goTo function, to allow panning to given ICAO
  // Cannot just use setSearch, because need to pan even if the ICAO was already in search var
  const goToRef = React.useRef(null);
  const goTo = React.useCallback((icao) => {
    setSearch(prevIcao => prevIcao === icao ? null : icao);
    goToRef.current = icao;
    window.history.replaceState({icao:icao}, '', '?icao='+icao);
  }, []);
  React.useEffect(() => {
    if (goToRef.current) {
      const icao = goToRef.current;
      goToRef.current = null;
      setSearch(icao);
    }
  }, [search]);

  // Invalidate map size when routing toogled
  React.useEffect(() => {
    if (!mapRef.current) { return; }
    mapRef.current.invalidateSize({pan:false});
  }, [routeFinder]);

  const setFrom = React.useCallback((icao) => {
    icao = icao.toUpperCase();
    setFromIcaoInput(icao);
    if (icaodata.hasOwnProperty(icao)) {
      setFromIcao(icao);
    }
    else {
      setFromIcao(null)
    }
  }, [icaodata]);
  const isFromIcao = React.useCallback((icao) => fromIcao === icao, [fromIcao]);
  const setTo = React.useCallback((icao) => {
    icao = icao.toUpperCase();
    setToIcaoInput(icao);
    if (icaodata.hasOwnProperty(icao)) {
      setToIcao(icao);
    }
    else {
      setToIcao(null)
    }
  }, [icaodata]);
  const isToIcao = React.useCallback((icao) => toIcao === icao, [toIcao]);
  const isInCustom = React.useCallback((icao) => customIcaos.includes(icao), [customIcaos]);
  React.useEffect(() => {
    storage.set('customIcaos', customIcaos);
  }, [customIcaos]);

  // Actions
  const actions = React.useRef(null);
  const setActions = () => {
    actions.current = {
      goTo: goTo,
      fromIcao: setFrom,
      isFromIcao: isFromIcao,
      isToIcao: isToIcao,
      toIcao: setTo,
      addCustom: (icao) => setCustomIcaos(prev => [...prev, icao]),
      removeCustom: (icao) => setCustomIcaos(prev => prev.filter(elm => elm !== icao)),
      isInCustom: isInCustom,
      contextMenu: (actions.current && actions.current.contextMenu) ? actions.current.contextMenu : undefined
    };
  }
  if (!actions.current) { setActions(); }
  React.useEffect(setActions, [goTo, setFrom, isFromIcao, setTo, isToIcao, isInCustom]);


  return (
    <ErrorBoundary>
      <Box
        sx={{
          display: "flex",
          flexFlow: "column",
          height: ["100vh", "-webkit-fill-available"]
        }}
      >
        <AppBar position="static">
          <Toolbar>
            <Box
              sx={{
                flexGrow: 1,
                display: 'flex',
                alignItems: 'baseline',
                flexWrap: 'wrap'
              }}
            >
              <Typography variant="h6" sx={{ lineHeight: 1 }}>
                FSE Planner
              </Typography>
              <Tooltip title="Changelog & credits">
                <Button
                  sx={{
                    marginLeft: 1,
                    paddingLeft: '2px',
                    paddingRight: '2px',
                    paddingTop: 0.5,
                    paddingBottom: 0.5,
                    fontWeight: 'normal',
                    color: '#fff',
                    letterSpacing: 'normal',
                    textTransform: 'none',
                    minWidth: 'auto'
                  }}
                  onClick={() => setCreditsPopup(true)}
                  data-tour="Step9"
                  size="small"
                >
                  v{process.env.REACT_APP_VERSION}
                </Button>
              </Tooltip>
            </Box>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                margin: 0.5,
                justifyContent: 'flex-end'
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <Autocomplete
                  options={icaodataSrcArr}
                  getOptionLabel={(a) => a.icao ? a.icao : ''}
                  renderOption={(props, a) =>
                    <li {...props}>
                      <Box
                        component="span"
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          overflow: 'hidden'
                        }}
                      >
                        <Box
                          component="b"
                          sx={{
                            minWidth: '40px',
                            textAlign: 'center'
                          }}
                        >
                          {a.icao}
                        </Box>
                        <Box
                          component="span"
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            marginLeft: 2,
                            overflow: 'hidden',
                          }}
                        >
                          <Box
                            component="span"
                            sx={{
                              textOverflow: 'ellipsis',
                              overflow: 'hidden',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {a.name}
                          </Box>
                          <Typography
                            variant="caption"
                            sx={{
                              textOverflow: 'ellipsis',
                              overflow: 'hidden',
                              whiteSpace: 'nowrap',
                              color: '#aaa'
                            }}
                          >
                            {a.city}, {a.state ? a.state+', ' : ''}{a.country}
                          </Typography>
                        </Box>
                      </Box>
                    </li>
                  }
                  filterOptions={(options, params) => {
                    // If input is empty and search history is not, display search history
                    if (!searchInput && searchHistory.length > 0) {
                      return searchHistory.map(icao => icaodata[icao]);
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
                      sx={styles.inputSearch}
                      ref={params.InputProps.ref}
                      inputProps={params.inputProps}
                      endAdornment={params.inputProps.value ?
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSearch(null);
                              setSearchInput('');
                              window.history.replaceState(null, '', '?');
                            }}
                          >
                            <CloseIcon />
                          </IconButton>
                        :
                          null
                      }
                    />
                  }
                  PopperComponent={PopperMy}
                  onChange={(evt, value) => {
                    if (value) {
                      setSearch(value.icao);
                      const list = [...(new Set([value.icao, ...searchHistory]))].slice(0, 5);
                      setSearchHistory(list);
                      storage.set('searchHistory', list);
                      window.history.replaceState({icao:value.icao}, '', '?icao='+value.icao);
                    }
                    else {
                      setSearch(null);
                      window.history.replaceState(null, '', '?');
                    }
                  }}
                  value={search ? icaodataSrc[search] : null}
                  inputValue={searchInput}
                  onInputChange={(evt, value) => setSearchInput(value)}
                  autoHighlight={true}
                  selectOnFocus={false}
                />
              </Box>
              <MyTooltip title='Jobs radiating FROM this airport'>
                <Box sx={styles.boxBorder} data-tour="Step7">
                  <FlightTakeoffIcon sx={fromIcao === null ? styles.tgBtn : null}/>
                  &nbsp;&nbsp;
                  <InputBase
                    placeholder="ICAO"
                    sx={styles.input}
                    inputProps={{maxLength:4}}
                    value={fromIcaoInput}
                    onChange={evt => setFrom(evt.target.value)}
                  />
                </Box>
              </MyTooltip>
              <MyTooltip title='Jobs radiating TO this airport'>
                <Box sx={styles.boxBorder}>
                  <FlightLandIcon sx={toIcao === null ? styles.tgBtn : null} />
                  &nbsp;&nbsp;
                  <InputBase
                    placeholder="ICAO"
                    sx={styles.input}
                    inputProps={{maxLength:4}}
                    value={toIcaoInput}
                    onChange={evt => setTo(evt.target.value)}
                  />
                </Box>
              </MyTooltip>
              <MyTooltip title='Jobs going in this direction (+/- 30°)'>
                <Box sx={styles.boxBorder}>
                  <ExploreIcon sx={direction === '' ? styles.tgBtn : null}/>
                  &nbsp;&nbsp;
                  <InputBase
                    placeholder="145°"
                    sx={styles.input}
                    inputProps={{maxLength:3}}
                    value={direction}
                    onChange={evt => { setDirection(evt.target.value); }}
                  />
                </Box>
              </MyTooltip>
              <ToggleButtonGroup value={type} onChange={(evt, val) => {setType(val)}} sx={styles.box} exclusive>
                <TooltipToggleButton value="Trip-Only" title="Trip Only">
                  <EmojiPeopleIcon />
                </TooltipToggleButton>
                <TooltipToggleButton value="VIP" title="VIP">
                  <StarIcon />
                </TooltipToggleButton>
                <TooltipToggleButton value="All-In" title="All In">
                  <FlightIcon />
                </TooltipToggleButton>
              </ToggleButtonGroup>
              <ToggleButtonGroup value={cargo} onChange={(evt, val) => setCargo(val)} sx={styles.box} exclusive>
                <TooltipToggleButton value="passengers" title="Passengers">
                  <PeopleIcon />
                </TooltipToggleButton>
                <TooltipToggleButton value="kg" title="Cargo">
                  <BusinessCenterIcon />
                </TooltipToggleButton>
              </ToggleButtonGroup>
              <Box sx={styles.boxBorder}>
                {cargo === 'passengers' ?
                  <React.Fragment>
                    <PeopleIcon sx={minPax === '' && maxPax === '' ? styles.tgBtn : null} />
                    &nbsp;
                    <MyTooltip title={cargo === 'passengers' ? "Minimum number of passengers per segment" : "Minimum weight per segment"}>
                      <InputBase
                        placeholder="min"
                        sx={styles.inputNb}
                        value={minPax}
                        onChange={evt => { let nb = parseInt(evt.target.value) || ''; setMinPax(nb); }}
                      />
                    </MyTooltip>
                    -
                    <MyTooltip title={cargo === 'passengers' ? "Maximum number of passengers per job" : "Maximum weight per job"}>
                      <InputBase
                        placeholder="max"
                        sx={styles.inputNb}
                        value={maxPax}
                        onChange={evt => { let nb = parseInt(evt.target.value) || ''; setMaxPax(nb); }}
                      />
                    </MyTooltip>
                  </React.Fragment>
                :
                  <React.Fragment>
                    <BusinessCenterIcon sx={minKg === '' && maxKg === '' ? styles.tgBtn : null} />
                    &nbsp;
                    <MyTooltip title={cargo === 'passengers' ? "Minimum number of passengers per segment" : "Minimum weight per segment"}>
                      <InputBase
                        placeholder="min"
                        sx={styles.inputNb}
                        value={minKg}
                        onChange={evt => { let nb = parseInt(evt.target.value) || ''; setMinKg(nb); }}
                      />
                    </MyTooltip>
                    -
                    <MyTooltip title={cargo === 'passengers' ? "Maximum number of passengers per job" : "Maximum weight per job"}>
                      <InputBase
                        placeholder="max"
                        sx={styles.inputNb}
                        value={maxKg}
                        onChange={evt => { let nb = parseInt(evt.target.value) || ''; setMaxKg(nb); }}
                      />
                    </MyTooltip>
                  </React.Fragment>
                }

              </Box>
              <Box sx={styles.boxBorder}>
                <SettingsEthernetIcon sx={minDist === '' && maxDist === '' ? styles.tgBtn : null} />
                &nbsp;
                <MyTooltip title='Minimum job distance in NM'>
                  <InputBase
                    placeholder="min"
                    sx={styles.inputNb}
                    value={minDist}
                    onChange={evt => { let nb = parseInt(evt.target.value) || ''; setMinDist(nb); }}
                  />
                </MyTooltip>
                -
                <MyTooltip title='Maximum job distance in NM'>
                  <InputBase
                    placeholder="max"
                    sx={styles.inputNb}
                    value={maxDist}
                    onChange={evt => { let nb = parseInt(evt.target.value) || ''; setMaxDist(nb); }}
                  />
                </MyTooltip>
              </Box>
              <IconButton sx={styles.icon} size="small" onClick={() => setSettingsPopup(true)} data-tour="Step8">
                <Tooltip title="More options">
                  <TuneIcon />
                </Tooltip>
              </IconButton>
              <IconButton sx={styles.icon} size="small" onClick={() => setRouteFinder(!routeFinder)} data-tour="Step8b">
                <Tooltip title="Route finder">
                  <DirectionsIcon />
                </Tooltip>
              </IconButton>
              <IconButton sx={styles.icon} size="small" onClick={() => setUpdatePopup(true)} data-tour="Step2">
                <Tooltip title="Load data from FSE">
                  <UpdateIcon />
                </Tooltip>
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'nowrap',
            flexGrow: '1',
            overflow: 'hidden'
          }}
        >
          <Routing
            options={options}
            setRoute={setRoute}
            hidden={!routeFinder}
            mapRef={mapRef}
            close={() => setRouteFinder(false)}
            actions={actions}
          />
          <FSEMap
            options={options}
            search={search}
            icaos={icaos}
            customIcaos={customIcaos}
            route={route}
            mapRef={mapRef}
            actions={actions}
          />
        </Box>
        <UpdatePopup
          open={updatePopup}
          setUpdatePopup={setUpdatePopup}
          setJobs={(jobs) => setJobs(transformJobs(jobs))}
          setPlanes={(planes) => setPlanes(transformPlanes(planes))}
          setFlight={setFlight}
          icaodata={icaodata}
          icaos={icaos}
          settings={settings}
          customIcaos={customIcaos}
          setCustomIcaos={setCustomIcaos}
        />
        <SettingsPopup
          open={settingsPopop}
          handleClose={() => setSettingsPopup(false)}
          settings={settings}
          setSettings={setSettings}
          defaultSettings={defaultSettings}
        />
        <CreditsPopup
          open={creditsPopop}
          handleClose={() => setCreditsPopup(false)}
          openTutorial={() => setIsTourOpen(true)}
        />
        <Tour
          isTourOpen={isTourOpen}
          setIsTourOpen={setIsTourOpen}
          updatePopup={updatePopup}
          setUpdatePopup={setUpdatePopup}
        />
      </Box>
    </ErrorBoundary>
  );
}

export default App;
