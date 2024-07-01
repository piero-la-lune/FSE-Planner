import React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';
import InputBase from '@mui/material/InputBase';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import IconButton from '@mui/material/IconButton';
import Popper from '@mui/material/Popper';
import UpdateIcon from '@mui/icons-material/Update';
import CloseIcon from '@mui/icons-material/Close';
import TuneIcon from '@mui/icons-material/Tune';
import DirectionsIcon from '@mui/icons-material/Directions';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import TableViewIcon from '@mui/icons-material/TableView';
import MapIcon from '@mui/icons-material/Map';

import { default as _clone } from 'lodash/cloneDeep';
import { default as _mergeWith } from 'lodash/mergeWith';
import { default as _isArray } from 'lodash/isArray';
import { useOrientation, useWindowSize } from 'react-use';
import { matchSorter } from 'match-sorter';

import FSEMap from './Map.js';
import Routing from './Routing/Routing.js';
import Table from './Table/Table.js';
import UpdatePopup from './Popups/Update.js';
import SettingsPopup from './Popups/Settings.js';
import CreditsPopup from './Popups/Credits.js';
import Tour from './Tour.js';
import Storage from './Storage.js';
import Filters from './Filters';
import log from './util/logger.js';
import { wrap, formatGPSCoord, toLatLngs } from './util/utility.js';

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
        sim: 'darkslateblue'
      },
      sizes: {
        base: '13',
        rentable: '20',
        selected: '25',
        fse: '3',
        sim: '3'
      }
    },
    legs: {
      colors: {
        passengers: '#3f51b5',
        highlight: 'yellow',
        flight: 'darkred'
      },
      weights: {
        base: '1.2',
        passengers: '8',
        flight: '5'
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
  airport: {
    size: [0, 23500],
    surface: [1, 2, 3, 4, 5, 6, 7, 8],
    runway: [0, 30000],
    onlySim: false,
    onlySimAlternative: false,
    onlyILS: false,
    excludeMilitary: false
  },
  routeFinder: {
    maxHops: 5,
    maxStops: 1,
    minLoad: 80,
    maxBadLegs: 2,
    maxEmptyLeg: 20,
    idleTime: 2,
    fees: ['Ground', 'Booking', 'Rental', 'Fuel'],
    jobsType: ['pax-sys', 'pax-trip', 'pax-vip', 'cargo-sys', 'cargo-vip'],
    overheadLength: 0,
    approachLength: 10,
    memory: 'normal',
    pdfImage: null,
    returnLeg: false
  },
  update: {
    direction: 'from',
    jobsPlanes: 'around',
    jobsPlanesRequests: 1,
    jobsPlanesMax: 10,
    express: true,
    persist: false,
    expiration: ''
  },
  filters: {
    type: 'Trip-Only',
    cargo: ['passengers'],
    fromIcao: null,
    toIcao: null,
    minPax: '',
    minKg: '',
    maxPax: '',
    maxKg: '',
    minDist: '',
    maxDist: '',
    minJobPay: '',
    minLegPay: '',
    percentPay: '',
    direction: ''
  }
};


const icaos = Object.keys(icaodataSrc);


const PopperMy = function (props) {
  return (<Popper {...props} style={{ width: 400 }} placement='bottom-start' />)
}

const styles = {
  menuBtn: {
    '& .MuiButton-startIcon': {
      color: "rgba(255, 255, 255, 0.5)"
    },
    '&:hover .MuiButton-startIcon': {
      color: "#fff"
    },
    color: "#fff",
    marginLeft: {
      sm: 1,
      md: 2,
    },
    py: {
      xs: 0,
      sm: 0
    }
  },
  inputSearch: {
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    color: "#fff",
    borderRadius: 1,
    paddingLeft: 1,
    paddingTop: 0.5,
    paddingBottom: 0.5,
    width: {
      xs: "100px",
      lg: "300px",
      xl: "400px"
    }
  }
}




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
  const jobs = {};
  for (const frIcao of Object.keys(j)) {
    for (const toIcao of Object.keys(j[frIcao])) {
      const key = frIcao+'-'+toIcao;
      const leg = j[frIcao][toIcao];
      jobs[key] = {
        direction: leg[0],
        distance: leg[1]
      }
      for (const [txt, arr] of Object.entries(leg[2])) {
        const pax = txt[0] === 'p' ? true : false;
        const type = (txt[1] === 'p' || txt[1] === 't') ? 'Trip-Only' : (txt[1] === 'v' ? 'VIP' : 'All-In');
        if (!jobs[key].hasOwnProperty(type)) {
          jobs[key][type] = [];
        }
        for (const [nb, pay, id, aid] of arr) {
          const obj = {
            pax: pax ? nb : 0,
            kg: pax ? nb*77 : nb,
            pay: pay,
            id: id
          };
          if (aid) {
            obj.aid = aid;
          }
          if (txt[1] === 'p') {
            obj.PT = true;
          }
          jobs[key][type].push(obj);
        }
      }
    }
  }
  return jobs;
}

const storage = new Storage();


function App() {

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

  const [filtersBar, setFiltersBar] = React.useState(false)
  const [filters, setFilters] = React.useState(settings.filters);
  const [table, setTable] = React.useState(false);
  const [updatePopup, setUpdatePopup] = React.useState(false);
  const [settingsPopup, setSettingsPopup] = React.useState(false);
  const [creditsPopup, setCreditsPopup] = React.useState(false);
  const [jobs, setJobs] = React.useState(() => {
    return transformJobs(storage.get('jobs', {}, true));
  });
  const [planes, setPlanes] = React.useState(() => {
    return transformPlanes(storage.get('planes', {}));
  });
  const [flight, setFlight] = React.useState(() => {
    return transformJobs(storage.get('flight', {}));
  });
  const [search, setSearch] = React.useState(null);
  const [searchDest, setSearchDest] = React.useState(null);
  const [searchInput, setSearchInput] = React.useState('');
  const [searchHistory, setSearchHistory] = React.useState(storage.get('searchHistory', []));
  const [searchGps, setSearchGps] = React.useState(null);
  const [icaodata, setIcaodata] = React.useState(icaodataSrc);
  const [isTourOpen, setIsTourOpen] = React.useState(storage.get('tutorial') === null);
  const [routeFinder, setRouteFinder] = React.useState(false);
  const [route, setRoute] = React.useState(null);
  const [searchOptions, setSearchOptions] = React.useState([]);
  const mapRef = React.useRef();
  const searchDestRef = React.useRef(null);
  const orientation = useOrientation();
  const windowSize = useWindowSize();

  const options = React.useMemo(() => ({
    jobs: jobs,
    planes: planes,
    flight: flight,
    settings: settings,
    icaodata: icaodata,
    ...filters
  }), [jobs, planes, flight, settings, icaodata, filters]);

  React.useEffect(() => {
    // Update icao coordiates to fit in new map center
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

  React.useEffect(() => {
    // Set search if query string in URL
    const urlParams = new URLSearchParams(window.location.search);
    const icao = urlParams.get('icao');
    if (icao) {
      setSearch(icao);
    }
  }, []);

  // Create goTo function, to allow panning to given ICAO
  // Cannot just use setSearch, because need to pan even if the ICAO was already in search var
  const goToRef = React.useRef(null);
  const goTo = React.useCallback((icao, from = null) => {
    if (icao) {
      if (from) {
        searchDestRef.current = {...icaodataSrc[icao], from: from};
        setSearchDest(icao);
        setSearch(from);
        setSearchGps(null);
        setSearchOptions([searchDestRef.current]);
        setSearchHistory(prevList => {
          const list = [...(new Set([icao, from, ...prevList]))].slice(0, 5);
          storage.set('searchHistory', list);
          return list;
        });
        window.history.replaceState({icao:from}, '', '?icao='+from);
      }
      else {
        setSearch(prevIcao => prevIcao === icao ? null : icao);
        setSearchDest(null);
        setSearchGps(null);
        setSearchOptions([icaodataSrc[icao]]);
        goToRef.current = icao;
        setSearchHistory(prevList => {
          const list = [...(new Set([icao, ...prevList]))].slice(0, 5);
          storage.set('searchHistory', list);
          return list;
        });
        window.history.replaceState({icao:icao}, '', '?icao='+icao);
      }
    }
    else {
      setSearch(null);
      window.history.replaceState(null, '', '?');
    }
  }, []);
  React.useEffect(() => {
    if (goToRef.current) {
      const icao = goToRef.current;
      goToRef.current = null;
      setSearch(icao);
    }
  }, [search]);
  const goToGps = React.useCallback((lat, lng) => {
    const coord = formatGPSCoord(lat, lng);
    const option = {lat: lat, lng: lng, gps: true};
    setSearch(null);
    setSearchDest(null);
    setSearchGps(option);
    setSearchOptions([option]);
    window.history.replaceState({gps:coord}, '', '?gps='+coord);
  }, []);

  // Invalidate map size when routing toogled
  React.useEffect(() => {
    if (!mapRef.current) { return; }
    if (window.scrollY !== 0) {
      window.scrollTo(0, 0);
    }
    mapRef.current.invalidateSize({pan:false});
  }, [routeFinder, filters, orientation, table, windowSize.width, windowSize.height]);

  // Actions
  const actions = React.useRef(null);
  const setActions = () => {
    actions.current = {
      goTo: goTo,
      fromIcao: (icao) => setFilters(prev => {
        const f = {...prev};
        f.fromIcao = icao;
        return f;
      }),
      isFromIcao: (icao) => filters.fromIcao === icao,
      isToIcao: (icao) => filters.toIcao === icao,
      toIcao: (icao) => setFilters(prev => {
        const f = {...prev};
        f.toIcao = icao;
        return f;
      }),
      contextMenu: (actions.current && actions.current.contextMenu) ? actions.current.contextMenu : undefined,
      measureDistance: () => null,
      openTable: () => { setRouteFinder(false); setTable(true); },
      getCustomLayers: (icao) => [],
      addToCustomLayer: () => null,
      removeFromCustomLayer: () => null,
      addToFlight: (fr, to, id) => {
        const j = storage.get('jobs', {}, true);
        const f = storage.get('flight', {});
        if (!(fr in f)) { f[fr] = {} }
        if (!(to in f[fr])) { f[fr][to] = [j[fr][to][0], j[fr][to][1], {}] }
        for (const jobtype of Object.keys(j[fr][to][2])) {
          for (const elm of j[fr][to][2][jobtype]) {
            if (elm[2] === id) {
              if (!(jobtype in f[fr][to][2])) { f[fr][to][2][jobtype] = []; }
              f[fr][to][2][jobtype].push(elm);
              j[fr][to][2][jobtype] = j[fr][to][2][jobtype].filter(e => e[2] !== id);
              break;
            }
          }
        }
        storage.set('jobs', j, true);
        storage.set('flight', f);
        setJobs(transformJobs(j));
        setFlight(transformJobs(f));
      },
      markAsFlown: (fr, to, id) => {
        const j = storage.get('jobs', {}, true);
        const f = storage.get('flight', {});
        if (fr in j && to in j[fr]) {
          for (const jobtype of Object.keys(j[fr][to][2])) {
            j[fr][to][2][jobtype] = j[fr][to][2][jobtype].filter(e => e[2] !== id);
          }
        }
        if (fr in f && to in f[fr]) {
          for (const jobtype of Object.keys(f[fr][to][2])) {
            f[fr][to][2][jobtype] = f[fr][to][2][jobtype].filter(e => e[2] !== id);
            if (f[fr][to][2][jobtype].length === 0) {
              delete f[fr][to][2][jobtype];
            }
          }
          if (Object.keys(f[fr][to][2]).length === 0) {
            delete f[fr][to];
            if (Object.keys(f[fr]).length === 0) {
              delete f[fr];
            }
          }
        }
        storage.set('jobs', j, true);
        storage.set('flight', f);
        setJobs(transformJobs(j));
        setFlight(transformJobs(f));
      }
    };
  }
  if (!actions.current) { setActions(); }
  React.useEffect(setActions, [goTo, filters.fromIcao, filters.toIcao]);

  React.useEffect(() => {
    const inputs = searchInput.split(/\s*[><]+\s*/g);
    // Should not be more than 2 ICAOS long
    if (inputs.length > 2) { return setSearchOptions([]); }
    // If typing a second ICAO, the first one should be valid
    if (inputs.length > 1 && !icaodataSrc.hasOwnProperty(inputs[0])) { return setSearchOptions([]); }
    const input = inputs[inputs.length-1];

    let filtered = [];
    // If input is empty and search history is not, display search history
    if (!input && searchHistory.length > 0) {
      filtered = searchHistory.map(icao => icaodataSrc[icao]);
    }
    else {
      filtered = matchSorter(icaodataSrcArr, input, {
        keys: [{threshold: matchSorter.rankings.STARTS_WITH, key: 'icao'}, 'name', 'city'],
      }).slice(0, 5);
    }
    // If destination is set, change options to add departing icao
    if (inputs.length === 2) {
      filtered = filtered.map(elm => { return {...elm, from: inputs[0]} });
    }
    // If not many ICAOs match, search for GPS coordinates instead
    if (filtered.length < 5) {
      const o = toLatLngs(searchInput);
      if (o !== null) {
        filtered.push({lat: o.lat, lng: o.lng, gps: true});
      }
    }
    // Need to add an extra option, when current search input does not match the current search
    // (otherwise MUI complains, because no option match the current search / searchDst)
    if (search) {
      if (searchDest) {
        const exist = filtered.reduce((acc, elm) => acc || (elm.icao === searchDest && elm.from === search), false);
        if (!exist) { filtered.push({...icaodataSrc[searchDest], from: search}) }
      }
      else {
        const exist = filtered.reduce((acc, elm) => acc || (elm.icao === search && !elm.from), false);
        if (!exist) { filtered.push(icaodataSrc[search]) }
      }
    }
    if (searchGps) {
      const exist = filtered.reduce((acc, elm) => acc || (elm.lat === searchGps.lat && elm.lng === searchGps.lng), false);
      if (!exist) { filtered.push(searchGps) }
    }
    setSearchOptions(filtered);
  }, [searchInput, searchHistory, search, searchDest, searchGps]);

  // Set searchGps if query string in URL.
  // Needs to be positionned after previous UseEffect, otherwise searchOptions
  // is overwritten
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const gps = urlParams.get('gps');
    if (gps) {
      const o = toLatLngs(gps);
      if (o !== null) {
        const option = {lat: o.lat, lng: o.lng, gps: true};
        setSearchOptions(arr => [...arr, option]);
        setSearchGps(option);
      }
    }
  }, []);


  return (
    <Box
      sx={{
        display: "flex",
        flexFlow: "column",
        height: "100%"
      }}
    >
      <AppBar position="static">
        <Toolbar>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-end',
              flexWrap: 'wrap'
            }}
          >
            <Typography variant="h6" sx={{ lineHeight: 1, py: 0.4 }}>
              FSE Planner
            </Typography>
            <Tooltip title="Changelog & credits">
              <Button
                sx={{
                  marginLeft: 1,
                  paddingLeft: '2px',
                  paddingRight: '2px',
                  px: 0.5,
                  py: 0,
                  fontWeight: 'normal',
                  color: '#fff',
                  letterSpacing: 'normal',
                  textTransform: 'none',
                  minWidth: 'auto'
                }}
                onClick={() => setCreditsPopup(true)}
                data-tour="Step10"
                size="small"
              >
                v{process.env.REACT_APP_VERSION}
              </Button>
            </Tooltip>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              ml: 1,
              flexGrow: 2
            }}
          >
            <Button
              sx={styles.menuBtn}
              onClick={() => setUpdatePopup(true)}
              data-tour="Step2"
              startIcon={<UpdateIcon />}
            >
              Load data
            </Button>
            <Button
              sx={styles.menuBtn}
              onClick={() => {
                if (!table) {
                  setRouteFinder(false);
                }
                setTable(!table);
              }}
              startIcon={table ? <MapIcon /> : <TableViewIcon />}
            >
              {table ? "Map" : "Table" }
            </Button>
            <Button
              sx={{
                ...styles.menuBtn,
                ...(filtersBar && {
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  }
                })
              }}
              onClick={() => setFiltersBar(!filtersBar)}
              data-tour="Step7"
              startIcon={<FilterAltIcon />}
            >
              Filters
            </Button>
            <Button
              sx={{
                ...styles.menuBtn,
                ...(routeFinder && {
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  }
                })
              }}
              onClick={() => {
                if (table) {
                  setTable(false);
                  setRouteFinder(true);
                }
                else {
                    setRouteFinder(!routeFinder)
                }
              }}
              data-tour="Step9"
              startIcon={<DirectionsIcon />}
            >
              Route finder
            </Button>
            <Button
              sx={styles.menuBtn}
              onClick={() => setSettingsPopup(true)}
              startIcon={<TuneIcon />}
            >
              Settings
            </Button>
          </Box>
          <Box
            sx={{
              display: 'flex',
              ml: 2
            }}
          >
            <Autocomplete
              options={searchOptions}
              getOptionLabel={(a) => a.icao ? (a.from ? a.from + ' > ' + a.icao : a.icao) : a.gps ? formatGPSCoord(a.lat, a.lng) : ''}
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
                    {a.icao &&
                      <React.Fragment>
                        {a.from &&
                          <React.Fragment>
                            <Box
                              component="b"
                              sx={{
                                minWidth: '40px',
                                textAlign: 'center'
                              }}
                            >
                              {a.from}
                            </Box>
                            <Box
                              component="span"
                              sx={{ px: 1}}
                            >
                              &gt;
                            </Box>
                          </React.Fragment>
                        }
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
                      </React.Fragment>
                    }
                    {a.gps &&
                      <React.Fragment>
                        <Box>GPS coordinates:&nbsp;</Box>
                        <Box component="b">
                          {formatGPSCoord(a.lat, a.lng)}
                        </Box>
                      </React.Fragment>
                    }
                  </Box>
                </li>
              }
              filterOptions={x => x}
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
                          setSearchDest(null);
                          setSearch(null);
                          setSearchGps(null);
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
              isOptionEqualToValue={(option, value) => {
                if (option.icao) { return (option.icao === value.icao && option.from === value.from); }
                else { return (option.lat === value.lat && option.lng === value.lng); }
              }}
              PopperComponent={PopperMy}
              onChange={(evt, value) => {
                if (value) {
                  if (value.icao) { goTo(value.icao, value.from); }
                  if (value.gps) { goToGps(value.lat, value.lng); }
                }
              }}
              value={search ? (searchDest ? searchDestRef.current : icaodataSrc[search]) : searchGps ? searchGps : null}
              inputValue={searchInput}
              onInputChange={(evt, value) => setSearchInput(value)}
              autoHighlight={true}
              selectOnFocus={false}
            />
          </Box>
        </Toolbar>
        {filtersBar &&
          <Filters
            filters={filters}
            setFilters={setFilters}
            icaodata={icaodata}
            actions={actions}
            setSettingsPopup={setSettingsPopup}
            clear={() => setFilters(settings.filters)}
          />
        }
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
          searchDest={searchDest}
          searchGps={searchGps}
          icaos={icaos}
          route={route}
          mapRef={mapRef}
          actions={actions}
          hidden={table}
        />
        <Table
          options={options}
          hidden={!table}
          actions={actions}
          search={search}
          searchDest={searchDest}
        />
      </Box>
      <UpdatePopup
        open={updatePopup}
        setUpdatePopup={setUpdatePopup}
        setJobs={(jobs) => setJobs(transformJobs(jobs))}
        setPlanes={(planes) => setPlanes(transformPlanes(planes))}
        setFlight={(flight) => setFlight(transformJobs(flight))}
        icaodata={icaodata}
        icaos={icaos}
        settings={settings}
      />
      <SettingsPopup
        open={settingsPopup}
        handleClose={() => setSettingsPopup(false)}
        settings={settings}
        setSettings={setSettings}
        defaultSettings={defaultSettings}
      />
      <CreditsPopup
        open={creditsPopup}
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
  );
}

export default App;
