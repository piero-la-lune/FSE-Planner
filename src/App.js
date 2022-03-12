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
    memory: 'normal',
    pdfImage: null
  },
  update: {
    direction: 'from',
    jobsPlanes: 'around',
    jobsPlanesRequests: 1,
    jobsPlanesMax: 10,
    express: true,
    expiration: ''
  }
};

const icaos = Object.keys(icaodataSrc);


const filter = createFilterOptions({limit: 5});
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

  const [filtersBar, setFiltersBar] = React.useState(false)
  const [filters, setFilters] = React.useState({
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
  });
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
  const [routeFinder, setRouteFinder] = React.useState(false);
  const [route, setRoute] = React.useState(null);
  const mapRef = React.useRef();
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
    if (icao) {
      setSearch(prevIcao => prevIcao === icao ? null : icao);
      goToRef.current = icao;
      setSearchHistory(prevList => {
        const list = [...(new Set([icao, ...prevList]))].slice(0, 5);
        storage.set('searchHistory', list);
        return list;
      });
      window.history.replaceState({icao:icao}, '', '?icao='+icao);
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

  // Invalidate map size when routing toogled
  React.useEffect(() => {
    if (!mapRef.current) { return; }
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
      markerClick: () => null,
      openTable: () => { setRouteFinder(false); setTable(true); }
    };
  }
  if (!actions.current) { setActions(); }
  React.useEffect(setActions, [goTo, filters.fromIcao, filters.toIcao]);


  return (
    <Box
      sx={{
        display: "flex",
        flexFlow: "column",
        height: "100vh"
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
              onChange={(evt, value) => value && goTo(value.icao)}
              value={search ? icaodataSrc[search] : null}
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
