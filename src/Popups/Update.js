import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import CloseIcon from '@material-ui/icons/Close';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import Tooltip from '@material-ui/core/Tooltip';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete';
import CircularProgress from '@material-ui/core/CircularProgress';
import AspectRatioIcon from '@material-ui/icons/AspectRatio';
import Alert from '@material-ui/lab/Alert';
import Accordion from '@material-ui/core/Accordion';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';

import { readString } from 'react-papaparse';
import { isPointInPolygon } from "geolib";
import L from "leaflet";
import { getDistance, getRhumbLineBearing, convertDistance } from "geolib";
import he from 'he';

import CustomAreaPopup from './Components/CustomArea.js';
import Storage from '../Storage.js';
import log from '../util/logger.js';

import aircrafts from "../data/aircraft.json";

const storage = new Storage();


// Generate country list
function getAreas(icaodata, icaos) {
  let a = new Set();
  for (var i = icaos.length - 1; i >= 0; i--) {
    const country = icaodata[icaos[i]].country;
    if (country === 'United States') {
      a.add('US - '+icaodata[icaos[i]].state)
    }
    a.add(country);
  }
  return ["Custom area", ...[...a].sort()];
}

// Get the list of all airports within the selected countries and custom area
function getIcaoList(countries, bounds, icaodata, icaos) {
  let points = null;
  // If custom area, compute polygon points
  if (countries.includes('Custom area')) {
    const [n, e, s, w] = [bounds.getNorth(), bounds.getEast(), bounds.getSouth(), bounds.getWest()];
    points = [
      { latitude: n, longitude: w },
      { latitude: n, longitude: e },
      { latitude: s, longitude: e },
      { latitude: s, longitude: w }
    ];
  }
  let i = [];
  for (const icao of icaos) {
    // If custom area, check if icao is inside the polygon
    if (points && isPointInPolygon({ latitude: icaodata[icao].lat, longitude: icaodata[icao].lon}, points)) {
      i.push(icao);
    }
    else {
      // For the United States, we can use states instead
      if (icaodata[icao].country === 'United States' && countries.includes('US - '+icaodata[icao].state)) {
        i.push(icao);
      }
      else if (countries.includes(icaodata[icao].country)) {
        i.push(icao);
      }
    }
  }
  let reminder = i.join('-');
  // Split list into chunks smaller than about 8000 chars
  const list = [];
  while (true) {
    let start = reminder.slice(0, 8000);
    reminder = reminder.slice(8000);
    const index = reminder.indexOf('-');
    if (index === -1) {
      list.push(start+reminder);
      break;
    }
    list.push(start+reminder.slice(0, index));
    reminder = reminder.slice(index+1);
  }
  return list;
}


function cleanPlanes(list, username, rentable = true) {
  const planes = {};
  for (const obj of list) {
    // Exclude broken airplanes
    if (obj.NeedsRepair === 1) { continue; }
    // Rented planes discarded, unless rented by current user
    if (obj.RentedBy !== 'Not rented.' && obj.RentedBy !== username) { continue; }
    // If searching for rentable planes, discard planes without
    // dry and web rental price (except planes owned by FSE, because
    // those are reserved for All-In jobs)
    if (rentable && !obj.RentalDry && !obj.RentalWet) {
      if (obj.Owner !== 'Bank of FSE') { continue; }
    }
    // Planes with fee owned are discarded
    if (obj.FeeOwed) { continue; }
    // Planes in flight are discarded
    if (obj.Location === 'In Flight') { continue; }

    // Ensure location exist in planes object
    if (!planes.hasOwnProperty(obj.MakeModel)) { planes[obj.MakeModel] = {}; }
    if (!planes[obj.MakeModel].hasOwnProperty(obj.Location)) { planes[obj.MakeModel][obj.Location] = []; }

    planes[obj.MakeModel][obj.Location].push({
      id: obj.SerialNumber,
      reg: obj.Registration,
      home: obj.Home,
      wet: obj.RentalWet,
      dry: obj.RentalDry,
      bonus: obj.Bonus
    });
  }
  return planes;
}

function cleanJobs(list, icaodata) {
  const jobs = {};
  for (const job of list) {
    // Do not keep non paying jobs
    if (!job.Pay) { continue; }
    // Because Airport jobs and My Flight datafeeds do not use the same property names...
    const toIcao = job.ToIcao ? job.ToIcao : job.Destination;
    const unit = job.UnitType ? job.UnitType : job.Units;

    const key = job.Location+"-"+toIcao;

    // Ensure leg exist in jobs object
    if (!jobs.hasOwnProperty(key)) {
      const fr = { latitude: icaodata[job.Location].lat, longitude: icaodata[job.Location].lon };
      const to = { latitude: icaodata[toIcao].lat, longitude: icaodata[toIcao].lon };
      jobs[key] = {
        direction: Math.round(getRhumbLineBearing(fr, to)),
        distance: Math.round(convertDistance(getDistance(fr, to), 'sm'))
      };
    }
    if (!jobs[key].hasOwnProperty(unit)) {
      jobs[key][unit] = {};
    }
    const type = job.PtAssignment ? 'PT' : job.Type;
    if (!jobs[key][unit][type]) {
      jobs[key][unit][type] = [];
    }
    jobs[key][unit][type].push({
      nb: job.Amount,
      pay: job.Pay
    });
  }
  return jobs;
}


const useStyles = makeStyles(theme => ({
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
  alert: {
    marginBottom: theme.spacing(2)
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
  span: {
    display: 'flex',
    fontWeight: 'bold'
  },
  divider: {
    margin: theme.spacing(3) + 'px 0'
  },
  dialog: {
    padding: theme.spacing(3)
  },
  accSummary: {
    alignItems: 'center'
  },
  accDetails: {
    flexDirection: 'column'
  },
  title: {
    flexGrow: 1
  },
  ownedPlanes: {
    marginTop: theme.spacing(2)
  }
}));

const filter = createFilterOptions();
const filter10 = createFilterOptions({limit: 10});


function UpdatePopup(props) {

  const [key, setKey] = React.useState(storage.get('key', ''));
  const [jobsAreas, setJobsAreas] = React.useState(storage.get('jobsAreas', []));
  const [jobsCustom, setJobsCustom] = React.useState(() => {
    const b = storage.get('jobsCustom', {});
    if (b && b._southWest) { return L.latLngBounds(b._southWest, b._northEast); }
    return null;
  });
  const [jobsTime, setJobsTime] = React.useState(storage.get('jobsTime'));
  const [jobsRequests, setJobsRequests] = React.useState(() => getIcaoList(jobsAreas, jobsCustom, props.icaodata, props.icaos).length);
  const [planeModel, setPlaneModel] = React.useState(storage.get('planeModel', []));
  const [planeUser, setPlaneUser] = React.useState(storage.get('planeUser', []));
  const [planesTime, setPlanesTime] = React.useState(storage.get('planesTime'));
  const [rentablePlanesRequests, setRentablePlanesRequests] = React.useState(planeModel.length);
  const [ownedPlanesRequests, setOwnedPlanesRequests] = React.useState(planeUser.length);
  const [flightTime, setFlightTime] = React.useState(storage.get('flightTime'));
  const [loading, setLoading] = React.useState(false);
  const [openCustom, setOpenCustom] = React.useState(false);
  const [expanded, setExpanded] = React.useState(key ? false : 'panel1');
  const [customIcaosVal, setCustomIcaosVal] = React.useState(props.customIcaos.join(' '));
  const [userList, setUserList] = React.useState([]);
  const [username, setUsername] = React.useState(storage.get('username', ''));
  const classes = useStyles();

  const areas = React.useState(() => getAreas(props.icaodata, props.icaos))[0];

  // Close popup
  const handleClose = () => {
    props.setUpdatePopup(false);
  }

  const setUpdatePopupRef = React.useRef(props.setUpdatePopup);
  React.useEffect(() => {
    // Open popup on loading if no FSE key
    if (!storage.get('key')) {
      setUpdatePopupRef.current(true);
    }

    // Load user and group list
    fetch(process.env.REACT_APP_DYNAMIC_DATA_URL+'users.json').then(response => {
      if (response.ok) {
        response.json().then(arr => {
          setUserList(arr.sort());
        });
      }
    });
  }, []);

  // Update Custom markers input
  React.useEffect(() => {
    setCustomIcaosVal(props.customIcaos.join(' '));
  }, [props.customIcaos]);

  // Loop function to get jobs from FSE
  const updateJobsRequest = (icaosList, jobs, callback) => {
    if (!icaosList.length) {
      callback(jobs);
      return;
    }
    const url = 'data?userkey='+key+'&format=csv&query=icao&search=jobsfrom&icaos='+icaosList.pop();
    // Fetch job list
    fetch(process.env.REACT_APP_PROXY+url)
    .then(function(response) {
      if (!response.ok) {
        throw new Error("Network error");
      }
      return response.text();
    })
    .then(function(csv) {
      // Parse CSV
      const parse = readString(csv, {header: true, skipEmptyLines: 'greedy', dynamicTyping: true});
      if (parse.errors.length > 0) {
        throw new Error("Parsing error");
      }
      updateJobsRequest(icaosList, [...jobs, ...parse.data], callback);
    })
    .catch(function(error) {
      log.error("Error while updating Jobs", error);
      console.log(error);
      alert('Could not get data. Check your read access key and ensure you have not reached your quota limit.');
      setLoading(false);
    });
  }
  // Jobs Update button clicked
  const updateJobs = (evt) => {
    evt.stopPropagation();
    setLoading('panel2');
    // Compute ICAO list
    const icaosList = getIcaoList(jobsAreas, jobsCustom, props.icaodata, props.icaos);
    updateJobsRequest(icaosList, [], (list) => {
      const jobs = cleanJobs(list, props.icaodata);
      // Update jobs
      storage.set('jobs', jobs);
      props.setJobs(jobs);
      // Update date
      let date = new Date().toString();
      storage.set('jobsTime', date);
      setJobsTime(date);
      // Update area
      storage.set('jobsAreas', jobsAreas);
      storage.set('jobsCustom', jobsCustom);
      // Close popup
      setLoading(false);
      handleClose();
    });
  }
  // Jobs Clicked button clicked
  const clearJobs = (evt) => {
    evt.stopPropagation();
    setLoading('panel2');
    // Update planes
    props.setJobs({});
    storage.remove('jobs');
    storage.remove('jobsTime');
    setJobsTime(null);
    // Close popup
    setLoading(false);
    handleClose();
  }

  // Loop function to get planes from FSE
  const updateRentablePlanesRequest = (models, planes, callback) => {
    if (!models.length) {
      callback(planes);
      return;
    }
    const url = 'data?userkey='+key+'&format=csv&query=aircraft&search=makemodel&makemodel='+encodeURIComponent(models.pop());
    // Fetch plane list
    fetch(process.env.REACT_APP_PROXY+url)
    .then(function(response) {
      if (!response.ok) {
        throw new Error("Network error");
      }
      return response.text();
    })
    .then(function(csv) {
      // Parse CSV
      const parse = readString(csv, {header: true, skipEmptyLines: 'greedy', dynamicTyping: true});
      if (parse.errors.length > 0) {
        throw new Error("Parsing error");
      }
      // Convert array to object
      updateRentablePlanesRequest(models, [...planes, ...parse.data], callback);
    })
    .catch(function(error) {
      log.error("Error while updating Rentable Planes", error);
      console.log(error);
      alert('Could not get data. Check your read access key and ensure you have not reached your quota limit.');
      setLoading(false);
    });
  }
  const updateOwnedPlanesRequest = (usernames, planes, callback) => {
    if (!usernames.length) {
      callback(planes);
      return;
    }
    const url = 'data?userkey='+key+'&format=csv&query=aircraft&search=ownername&ownername='+encodeURIComponent(usernames.pop());
    // Fetch plane list
    fetch(process.env.REACT_APP_PROXY+url)
    .then(function(response) {
      if (!response.ok) {
        throw new Error("Network error");
      }
      return response.text();
    })
    .then(function(csv) {
      // Parse CSV
      const parse = readString(csv, {header: true, skipEmptyLines: 'greedy', dynamicTyping: true});
      if (parse.errors.length > 0) {
        throw new Error("Parsing error");
      }
      // Convert array to object
      updateOwnedPlanesRequest(usernames, [...planes, ...parse.data], callback);
    })
    .catch(function(error) {
      log.error("Error while updating User Planes", error);
      console.log(error);
      alert('Could not get data.\n\nPossible cause #1: specified user or group does not exist.\n\nPossible cause #2: wrong read access key or quota limit reached.');
      setLoading(false);
    });
  }
  // Planes Update button clicked
  const updatePlanes = (evt) => {
    evt.stopPropagation();
    setLoading('panel3');
    updateRentablePlanesRequest(planeModel.slice(), [], (list1) => {
      updateOwnedPlanesRequest(planeUser.slice(), [], (list2) => {
        // Transform to object
        const planes = cleanPlanes(list1, username, true);
        const p2 = cleanPlanes(list2, username, false);
        // Merge both objects
        for (const model of Object.keys(p2)) {
          if (!planes[model]) { planes[model] = {}; }
          for (const icao of Object.keys(p2[model])) {
            if (!planes[model][icao]) { planes[model][icao] = []; }
            planes[model][icao] = planes[model][icao].concat(p2[model][icao]);
          }
        }
        // Update planes
        storage.set('planes', planes);
        props.setPlanes(planes);
        // Update date
        let date = new Date().toString();
        storage.set('planesTime', date);
        setPlanesTime(date);
        // Update model
        storage.set('planeModel', planeModel);
        storage.set('planeUser', planeUser);
        // Close popup
        setLoading(false);
        handleClose();
      });
    });
  }
  // Planes Clear button clicked
  const clearPlanes = (evt) => {
    evt.stopPropagation();
    setLoading('panel3');
    // Update planes
    props.setPlanes({});
    storage.remove('planes');
    storage.remove('planesTime');
    setPlanesTime(null);
    // Close popup
    setLoading(false);
    handleClose();
  }

  // My Flight Update button clicked
  const updateFlight = (evt) => {
    evt.stopPropagation();
    setLoading('panel4');
    // Build URL
    const url = 'data?userkey='+key+'&format=csv&query=assignments&search=key&readaccesskey='+key
    // Fetch job list
    fetch(process.env.REACT_APP_PROXY+url)
    .then(function(response) {
      if (!response.ok) {
        throw new Error("Network error");
      }
      return response.text();
    })
    .then(function(csv) {
      // Parse CSV
      const parse = readString(csv, {header: true, skipEmptyLines: 'greedy', dynamicTyping: true});
      if (parse.errors.length > 0) {
        throw new Error("Parsing error");
      }
      const jobs = cleanJobs(parse.data, props.icaodata);
      // Update flight
      storage.set('flight', jobs);
      props.setFlight(jobs);
      // Update date
      let date = new Date().toString();
      storage.set('flightTime', date);
      setFlightTime(date);
      // Close popup
      setLoading(false);
      handleClose();
    })
    .catch(function(error) {
      log.error("Error while updating My Flight", error);
      console.log(error);
      alert('Could not get data. Check your read access key.');
      setLoading(false);
    });
  }
  // My Flight Clear button clicked
  const clearFlight = (evt) => {
    evt.stopPropagation();
    setLoading('panel4');
    // Update planes
    props.setFlight({});
    storage.remove('flight');
    storage.remove('flightTime');
    setFlightTime(null);
    // Close popup
    setLoading(false);
    handleClose();
  }

  // Custom markers button clicked
  const updateCustom = (evt) => {
    evt.stopPropagation();
    setLoading('panel5');
    const elms = customIcaosVal.split(/[ ,\n]+/);
    const icaos = [];
    // Keep only existing ICAO
    for (const elm of elms) {
      if (props.icaodata[elm]) {
        icaos.push(elm);
      }
    }
    // Update var and storage
    setCustomIcaosVal(icaos.join(' '));
    props.setCustomIcaos(icaos);
    // Do not update storage, it is done in App.js
    // Close popup
    setLoading(false);
    handleClose();
  }
  const clearCustom = (evt) => {
    evt.stopPropagation();
    setLoading('panel5');
    setCustomIcaosVal('');
    props.setCustomIcaos([]);
    storage.remove('customIcaos');
    setLoading(false);
  }

  const panelChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Dialog onClose={handleClose} open={props.open} fullWidth={true} maxWidth="sm">
      <DialogTitle>
        Load data from FSE
        <IconButton className={classes.closeButton} onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers className={classes.dialog}>

        <Alert severity="warning" className={classes.alert}>You are limited to 40 requests every 6 hours (~1 request every 10 minutes).</Alert>

        <Accordion expanded={expanded === 'panel1'} onChange={panelChange('panel1')} data-tour="Step4">
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>FSE information</Typography>
          </AccordionSummary>
          <AccordionDetails className={classes.accDetails}>
            <Grid container spacing={3}>
              <Grid item xs={6}>
                <TextField
                  label="Read Access Key"
                  type="text"
                  onChange={(evt) => {
                    let k = evt.target.value;
                    setKey(k);
                    storage.set('key', k);
                  }}
                  value={key}
                  helperText={<span>Can be found <Link href="https://server.fseconomy.net/datafeeds.jsp" target="_blank">here</Link></span>}
                  variant='outlined'
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Username"
                  type="text"
                  onChange={(evt) => {
                    let u = evt.target.value;
                    setUsername(u);
                    storage.set('username', u);
                  }}
                  value={username}
                  variant='outlined'
                  fullWidth
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        <Accordion expanded={expanded === 'panel2'} onChange={panelChange('panel2')} data-tour="Step5">
          <AccordionSummary expandIcon={<ExpandMoreIcon />} classes={{content: classes.accSummary}}>
            <Typography className={classes.title}>Jobs</Typography>
            <Button color="secondary" onClick={clearJobs}>
              Clear
            </Button>
            &nbsp;
            <Tooltip title={<span>Last update : {jobsTime ? ((new Date(jobsTime)).toLocaleString()) : "never"}</span>}>
              <span>
                <Button variant="contained" color="primary" onClick={updateJobs} disabled={loading !== false || !key || !jobsAreas.length || jobsRequests > 10}>
                  Update
                  {loading === 'panel2' && <CircularProgress size={24} className={classes.buttonProgress} />}
                </Button>
              </span>
            </Tooltip>
          </AccordionSummary>
          <AccordionDetails className={classes.accDetails}>
            <Autocomplete
              multiple
              limitTags={2}
              options={areas}
              renderInput={(params) => (
                jobsRequests > 1 ?
                  <TextField {...params} label='Included countries' variant='outlined' error helperText={'Selected area is very large, it will require '+jobsRequests+' requests (10 max)'} />
                :
                  <TextField {...params} label='Included countries' variant='outlined' />
              )}
              onChange={(evt, value) => {
                if (value.includes('Custom area') && !jobsAreas.includes('Custom area')) {
                  setOpenCustom(true);
                }
                else {
                  setJobsAreas(value);
                  setJobsRequests(getIcaoList(value, jobsCustom, props.icaodata, props.icaos).length)  
                }
              }}
              value={jobsAreas}
              filterOptions={(options, params) => {
                const filtered = filter(options, params);
                if (!filtered.includes('Custom area')) {
                  filtered.unshift('Custom area');
                }
                return filtered;
              }}
              selectOnFocus
              clearOnBlur
              handleHomeEndKeys
              renderOption={option => (option === 'Custom area') ? <span className={classes.span}><AspectRatioIcon />&nbsp;Select custom area on map</span> : option}
            />
            <CustomAreaPopup
              open={openCustom}
              handleClose={() => setOpenCustom(false)}
              setArea={(bounds) => {
                const a = [...jobsAreas, 'Custom area'];
                setJobsCustom(bounds);
                setJobsAreas(a);
                setJobsRequests(getIcaoList(a, bounds, props.icaodata, props.icaos).length);
              }}
              bounds={jobsCustom}
              settings={props.settings}
            />
          </AccordionDetails>
        </Accordion>

        <Accordion expanded={expanded === 'panel3'} onChange={panelChange('panel3')} data-tour="Step6">
          <AccordionSummary expandIcon={<ExpandMoreIcon />} classes={{content: classes.accSummary}}>
            <Typography className={classes.title}>Available planes</Typography>
            <Button color="secondary" onClick={clearPlanes}>
              Clear
            </Button>
            &nbsp;
            <Tooltip title={<span>Last update : {planesTime ? ((new Date(planesTime)).toLocaleString()) : "never"}</span>}>
              <span>
                <Button variant="contained" color="primary" onClick={updatePlanes} disabled={loading !== false || !key || (!planeModel.length && !planeUser.length) || rentablePlanesRequests + ownedPlanesRequests > 10}>
                  Update
                  {loading === 'panel3' && <CircularProgress size={24} className={classes.buttonProgress} />}
                </Button>
              </span>
            </Tooltip>
          </AccordionSummary>
          <AccordionDetails className={classes.accDetails}>
            <Autocomplete
              multiple
              limitTags={2}
              options={Object.keys(aircrafts)}
              renderInput={(params) => (
                rentablePlanesRequests > 1 ?
                  <TextField {...params} label='Rentable planes: aircraft models' variant='outlined' error helperText={rentablePlanesRequests+' models selected, it will require '+rentablePlanesRequests+' requests (10 max)'} />
                :
                  <TextField {...params} label='Rentable planes: aircraft model' variant='outlined' />
              )}
              onChange={(evt, value) => {
                setPlaneModel(value);
                setRentablePlanesRequests(value.length);
              }}
              value={planeModel}
            />
            <Autocomplete
              multiple
              limitTags={2}
              options={userList}
              renderInput={(params) => (
                ownedPlanesRequests > 1 ?
                  <TextField {...params} label='Owned & leased planes: user or group names' variant='outlined' error helperText={ownedPlanesRequests+' users/groups selected, it will require '+ownedPlanesRequests+' requests (10 max)'} />
                :
                  <TextField {...params} label='Owned & leased planes: user or group name' variant='outlined' />
              )}
              onChange={(evt, value) => {
                setPlaneUser(value);
                setOwnedPlanesRequests(value.length);
              }}
              filterOptions={(options, params) => filter10(options, params)}
              getOptionLabel={option => he.decode(option)}
              value={planeUser}
              className={classes.ownedPlanes}
            />
          </AccordionDetails>
        </Accordion>

        <Accordion expanded={expanded === 'panel4'} onChange={panelChange('panel4')}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} classes={{content: classes.accSummary}}>
            <Typography className={classes.title}>My flight</Typography>
            <Button color="secondary" onClick={clearFlight}>
              Clear
            </Button>
            &nbsp;
            <Tooltip title={<span>Last update : {flightTime ? ((new Date(flightTime)).toLocaleString()) : "never"}</span>}>
              <span>
                <Button variant="contained" color="primary" onClick={updateFlight} disabled={loading !== false || !key}>
                  Update
                  {loading === 'panel4' && <CircularProgress size={24} className={classes.buttonProgress} />}
                </Button>
              </span>
            </Tooltip>
          </AccordionSummary>
        </Accordion>

        <Accordion expanded={expanded === 'panel5'} onChange={panelChange('panel5')}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} classes={{content: classes.accSummary}}>
            <Typography className={classes.title}>Custom markers</Typography>
            <Button color="secondary" onClick={clearCustom}>
              Clear
            </Button>
            &nbsp;
            <span>
              <Button variant="contained" color="primary" onClick={updateCustom} disabled={loading !== false}>
                Apply
                {loading === 'panel5' && <CircularProgress size={24} className={classes.buttonProgress} />}
              </Button>
            </span>
          </AccordionSummary>
          <AccordionDetails className={classes.accDetails}>
            <Alert severity="info" style={{marginBottom: 32}}>These airports will form an highlighted route on the map (you can hide the path to only highlight the aiports in the display settings). You may add new aiports directly on the map with a right click.</Alert>
            <TextField
              label="List of FSE ICAOs"
              multiline
              rows={4}
              variant="outlined"
              placeholder="LFLY EGLL LFPO [...]"
              helperText="ICAOs can be seperated by a white space, a new line or a coma."
              value={customIcaosVal}
              onChange={(evt) => {
                setCustomIcaosVal(evt.target.value);
              }}
            />
          </AccordionDetails>
        </Accordion>

      </DialogContent>
    </Dialog>
  );
}

export default UpdatePopup;