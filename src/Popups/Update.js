import React from 'react';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import CloseIcon from '@mui/icons-material/Close';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Tooltip from '@mui/material/Tooltip';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import AspectRatioIcon from '@mui/icons-material/AspectRatio';
import AirplanemodeActiveIcon from '@mui/icons-material/AirplanemodeActive';
import Alert from '@mui/material/Alert';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

import { usePapaParse } from 'react-papaparse';
import { isPointInPolygon } from "geolib";
import L from "leaflet";
import { getDistance, getRhumbLineBearing, convertDistance } from "geolib";
import he from 'he';

import CustomAreaPopup from './Components/CustomArea.js';
import Storage from '../Storage.js';
import log from '../util/logger.js';
import { hideAirport } from "../util/utility.js";

import aircrafts from "../data/aircraft.json";

const storage = new Storage();

function NetworkError(code) {
  this.code = code;
}
function ParsingError(text) {
  const found = text.match(/<Error>(.*)<\/Error>/i);
  if (found !== null) {
    this.msg = found[1];
  }
}
function updateAlert(error) {
  if (error instanceof NetworkError) {
    if (error.code === 503) {
      alert('Could not get data: FSEconomy is in maintenance, try again later.');
    }
    else {
      alert('Could not get data: FSEconomy is down, try again later');
    }
  }
  else if (error instanceof ParsingError && error.msg) {
    alert('Could not get data: '+error.msg);
  }
  else {
    alert('Could not get data. Try again or file a bug report.');
  }
}

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
  return ["Custom area", "Around planes", ...[...a].sort()];
}

// Get the list of all airports within the selected countries and custom area
function getIcaoList(countries, bounds, layers, icaodata, icaos, settings) {
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
      else {
        for (const layer of layers) {
          if (layer.icaos.includes(icao)) {
            i.push(icao);
            break;
          }
        }
      }
    }
  }
  // If around planes, get ICAOs
  if (countries.includes('Around planes')) {
    let set = new Set();
    // Get plane locations
    const planes = storage.get('planes', {});
    for (const model of Object.keys(planes)) {
      for (const icao of Object.keys(planes[model])) {
        set.add(icao);
      }
    }
    set = [...set];
    // If we need to search around these airports
    if (settings.update.jobsPlanes !== "strict") {
      // If there is too many location, restrict to lower rent planes
      if (set.length > settings.update.jobsPlanesMax) {
        let list = {};
        for (const model of Object.keys(planes)) {
          for (const icao of Object.keys(planes[model])) {
            for (const plane of planes[model][icao]) {
              if (!plane.wet && !plane.dry) {
                list[icao] = 0;
              }
              if (!plane.dry) { continue; }
              if (list[icao]) {
                list[icao] = Math.min(set[icao], plane.dry);
              }
              else {
                list[icao] = plane.dry;
              }
            }
          }
        }
        list = Object.entries(list).sort((a, b) => a[1] - b[1]);
        set = list.slice(0, settings.update.jobsPlanesMax).map(elm => elm[0]);
      }
      // Sort all icaos per distance
      const list = [];
      for (const icao of icaos) {
        let min = 100000000;
        for (const planeLocation of set) {
          const fr = { latitude: icaodata[planeLocation].lat, longitude: icaodata[planeLocation].lon };
          const to = { latitude: icaodata[icao].lat, longitude: icaodata[icao].lon };
          min = Math.min(min, getDistance(fr, to));
        }
        list.push([icao, min]);
      }
      list.sort((a, b) => a[1] - b[1]);
      set = list.slice(0, 1600*settings.update.jobsPlanesRequests).map(elm => elm[0]);
    }
    i = [...new Set([...i, ...set])];
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
  return [i, list];
}


function cleanPlanes(list, username, rentable = true) {
  const planes = {};
  for (const obj of list) {
    // Exclude broken airplanes
    if (obj.NeedsRepair === '1') { continue; }
    // Rented planes discarded, unless rented by current user
    if (obj.RentedBy !== 'Not rented.' && obj.RentedBy !== username) { continue; }
    // If searching for rentable planes, discard planes without
    // dry and web rental price (except planes owned by FSE, because
    // those are reserved for All-In jobs)
    if (rentable && !parseInt(obj.RentalDry) && !parseInt(obj.RentalWet)) {
      if (obj.Owner !== 'Bank of FSE') { continue; }
    }
    // Planes with fee owned are discarded
    if (parseInt(obj.FeeOwed)) { continue; }
    // Planes in flight are discarded
    if (obj.Location === 'In Flight') { continue; }

    // Ensure location exist in planes object
    if (!planes.hasOwnProperty(obj.MakeModel)) { planes[obj.MakeModel] = {}; }
    if (!planes[obj.MakeModel].hasOwnProperty(obj.Location)) { planes[obj.MakeModel][obj.Location] = []; }

    planes[obj.MakeModel][obj.Location].push({
      id: parseInt(obj.SerialNumber),
      reg: obj.Registration,
      home: obj.Home,
      wet: parseInt(obj.RentalWet),
      dry: parseInt(obj.RentalDry),
      bonus: parseInt(obj.Bonus)
    });
  }
  return planes;
}

function cleanJobs(list, icaodata, icaos = null) {
  const jobs = {};
  for (const job of list) {
    // Do not keep non paying jobs
    if (!parseInt(job.Pay)) { continue; }
    // Because Airport jobs and My assignments datafeeds do not use the same property names...
    const toIcao = job.ToIcao ? job.ToIcao : job.Destination;
    const unit = job.UnitType ? job.UnitType : job.Units;

    const key = job.Location+"-"+toIcao;

    // Do not keep jobs in the wrong direction
    if (icaos !== null && !icaos.includes(toIcao)) { continue; }

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
    const type = job.PtAssignment === 'true' ? 'PT' : job.Type;
    if (!jobs[key][unit][type]) {
      jobs[key][unit][type] = [];
    }
    jobs[key][unit][type].push({
      nb: parseInt(job.Amount),
      pay: parseInt(job.Pay)
    });
  }
  return jobs;
}


const styles = {
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: '-12px',
    marginLeft: '-12px',
  },
  accSummary: {
    '& .MuiAccordionSummary-content': {
      alignItems: 'center',
      mr: 2
    }
  },
  accDetails: {
    flexDirection: 'column'
  },
  title: {
    flexGrow: 1
  }
};

const filter = createFilterOptions();
const filter10 = createFilterOptions({limit: 10});



function AddButton (props) {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState('');
  const [key, setKey] = React.useState('');

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setName('');
    setKey('');
    setOpen(false);
  };

  const handleSave = () => {
    handleClose();
    props.onAdd([name, key]);
  }

  return (
    <div>
      <Button onClick={handleClickOpen} sx={{mt: 1}}>
        Add group
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Group information</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="Group name"
            fullWidth
            value={name}
            onChange={evt => setName(evt.target.value)}
            margin="normal"
          />
          <TextField
            label="Group read access key"
            fullWidth
            value={key}
            onChange={evt => setKey(evt.target.value)}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={!name || !key}>Add group</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

function UpdatePopup(props) {

  const [key, setKey] = React.useState(storage.get('key', ''));
  const [jobsAreas, setJobsAreas] = React.useState(storage.get('jobsAreas', []));
  const [jobsCustom, setJobsCustom] = React.useState(() => {
    const b = storage.get('jobsCustom', {});
    if (b && b._southWest) { return L.latLngBounds(b._southWest, b._northEast); }
    return null;
  });
  const [jobsTime, setJobsTime] = React.useState(storage.get('jobsTime'));
  const [jobsRequests, setJobsRequests] = React.useState(() => getIcaoList(jobsAreas, jobsCustom, [], props.icaodata, props.icaos, props.settings)[1].length);
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
  const [assignmentKeys, setAssignmentKeys] = React.useState(storage.get('assignmentKeys', [{name: 'Personal assignments', enabled: true}]));
  const [layersOptions, setLayersOptions] = React.useState([]);
  const [jobsLayers, setJobsLayers] = React.useState([]);
  const { readString } = usePapaParse();

  const areas = React.useState(() => getAreas(props.icaodata, props.icaos))[0];

  // Update available custom layers when opening the popup
  React.useEffect(() => {
    if (!props.open) { return false; }
    const arr = storage.get('layers', []);
    const l = [];
    for (const layer of arr) {
      if (layer.info && layer.info.type === 'all') {
        l.push({name: layer.info.display.name, id: layer.id, icaos: props.icaos.filter(icao => !hideAirport(icao, layer.info.filters, props.settings.display.sim))});
      }
      if (layer.info && layer.info.type === 'custom') {
        l.push({name: layer.info.display.name, id: layer.id, icaos: layer.info.data.icaos.filter(icao => !hideAirport(icao, layer.info.filters, props.settings.display.sim))});
      }
    }
    const jl = storage.get('jobsLayers', []);
    const layers = l.filter(elm => jl.includes(elm.id));
    setLayersOptions(l);
    setJobsLayers(layers);
  }, [props.open, props.icaos, props.icaodata, props.settings.display.sim]);

  // Update the number of request for loading jobs each time one input changes
  React.useEffect(() => {
    setJobsRequests(getIcaoList(jobsAreas, jobsCustom, jobsLayers, props.icaodata, props.icaos, props.settings)[1].length);
  }, [jobsAreas, jobsCustom, jobsLayers, props.icaodata, props.icaos, props.settings]);

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
    const dir = props.settings.update.direction === 'to' ? 'jobsto' : 'jobsfrom';
    const url = 'data?userkey='+key+'&format=csv&query=icao&search='+dir+'&icaos='+icaosList.pop();
    // Fetch job list
    fetch(process.env.REACT_APP_PROXY+url)
    .then(function(response) {
      if (!response.ok) {
        throw new NetworkError(response.status);
      }
      return response.text();
    })
    .then(function(csv) {
      // Parse CSV
      const parse = readString(csv, {header: true, skipEmptyLines: 'greedy'});
      if (parse.errors.length > 0) {
        throw new ParsingError(csv);
      }
      updateJobsRequest(icaosList, [...jobs, ...parse.data], callback);
    })
    .catch(function(error) {
      log.error("Error while updating Jobs", error);
      updateAlert(error);
      setLoading(false);
    });
  }
  // Jobs Update button clicked
  const updateJobs = (evt) => {
    evt.stopPropagation();
    setLoading('panel2');
    // Compute ICAO list
    const [icaos, icaosList] = getIcaoList(jobsAreas, jobsCustom, jobsLayers, props.icaodata, props.icaos, props.settings);
    updateJobsRequest(icaosList, [], (list) => {
      const jobs = cleanJobs(list, props.icaodata, props.settings.update.direction === 'both' ? icaos : null);
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
      storage.set('jobsLayers', jobsLayers.map(elm => elm.id));
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
        throw new NetworkError(response.status);
      }
      return response.text();
    })
    .then(function(csv) {
      // Parse CSV
      const parse = readString(csv, {header: true, skipEmptyLines: 'greedy'});
      if (parse.errors.length > 0) {
        throw new ParsingError(csv);
      }
      // Convert array to object
      updateRentablePlanesRequest(models, [...planes, ...parse.data], callback);
    })
    .catch(function(error) {
      log.error("Error while updating Rentable Planes", error);
      updateAlert(error);
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
        throw new NetworkError(response.status);
      }
      return response.text();
    })
    .then(function(csv) {
      // Parse CSV
      const parse = readString(csv, {header: true, skipEmptyLines: 'greedy'});
      if (parse.errors.length > 0) {
        throw new ParsingError(csv);
      }
      // Convert array to object
      updateOwnedPlanesRequest(usernames, [...planes, ...parse.data], callback);
    })
    .catch(function(error) {
      log.error("Error while updating User Planes", error);
      updateAlert(error);
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

  // Loop function to get assignments from FSE
  const updateFlightRequest = (groups, results, callback) => {
    if (!groups.length) {
      callback(results);
      return;
    }
    const group = groups.pop();
    // Check if the group is enabled
    if (!group.enabled) {
      updateFlightRequest(groups, results, callback);
      return;
    }
    // If no group key, it is personal assignments
    const groupKey = group.key ? group.key : key;
    // Build URL
    const url = 'data?userkey='+key+'&format=csv&query=assignments&search=key&readaccesskey='+groupKey
    // Fetch job list
    fetch(process.env.REACT_APP_PROXY+url)
    .then(function(response) {
      if (!response.ok) {
        throw new NetworkError(response.status);
      }
      return response.text();
    })
    .then(function(csv) {
      // Parse CSV
      const parse = readString(csv, {header: true, skipEmptyLines: 'greedy'});
      if (parse.errors.length > 0) {
        throw new ParsingError(csv);
      }
      updateFlightRequest(groups, [...results, ...parse.data], callback);
    })
    .catch(function(error) {
      log.error("Error while updating assignments", error);
      updateAlert(error);
      setLoading(false);
    });
  }

  // My assignments Update button clicked
  const updateFlight = (evt) => {
    evt.stopPropagation();
    setLoading('panel4');
    updateFlightRequest([...assignmentKeys], [], arr => {
      const jobs = cleanJobs(arr, props.icaodata);
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
    });
  }
  // My assignments Clear button clicked
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

  const labelAroundPlanes = () => {
    if (props.settings.update.jobsPlanes === 'strict') {
      return 'Airports with an available plane';
    }
    return 'Top '+props.settings.update.jobsPlanesMax+' areas with an available plane';
  }

  return (
    <Dialog onClose={handleClose} open={props.open} fullWidth={true} maxWidth="sm">
      <DialogTitle>
        Load data from FSE
        <IconButton
          onClick={handleClose}
          size="large"
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'grey[500]',
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 3 }}>

        <Alert severity="warning" sx={{ mb: 2 }}>You are limited to 40 requests every 6 hours (~1 request every 10 minutes).</Alert>

        <Box>
          <Accordion expanded={expanded === 'panel1'} onChange={panelChange('panel1')} data-tour="Step4">
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>FSE information</Typography>
            </AccordionSummary>
            <AccordionDetails sx={styles.accDetails}>
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
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={styles.accSummary}>
              <Typography sx={styles.title}>Jobs</Typography>
              <Button color="secondary" onClick={clearJobs}>
                Clear
              </Button>
              &nbsp;
              <Tooltip title={<span>Last update : {jobsTime ? ((new Date(jobsTime)).toLocaleString()) : "never"}</span>}>
                <span>
                  <Button variant="contained" color="primary" onClick={updateJobs} disabled={loading !== false || !key || (!jobsAreas.length && !jobsLayers.length) || jobsRequests > 10}>
                    Update
                    {loading === 'panel2' && <CircularProgress size={24} sx={styles.buttonProgress} />}
                  </Button>
                </span>
              </Tooltip>
            </AccordionSummary>
            <AccordionDetails sx={styles.accDetails}>
              <Autocomplete
                multiple
                limitTags={2}
                options={areas}
                renderInput={(params) => (
                  <TextField {...params} label='Load from geographical area' variant='outlined' margin="normal" />
                )}
                onChange={(evt, value) => {
                  if (value.includes('Custom area') && !jobsAreas.includes('Custom area')) {
                    setOpenCustom(true);
                  }
                  else {
                    setJobsAreas(value);
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
                renderOption={(props, option) => (
                  <li {...props}>
                    { option === 'Custom area' ?
                      <Box
                        component="span"
                        sx={{
                          display: 'flex',
                          fontWeight: 'bold'
                        }}
                      >
                        <AspectRatioIcon />&nbsp;Select custom area on map
                      </Box>
                    : option === 'Around planes' ?
                      <Box
                        component="span"
                        sx={{
                          display: 'flex',
                          fontWeight: 'bold'
                        }}
                      >
                        <AirplanemodeActiveIcon />&nbsp;{labelAroundPlanes()}
                      </Box>
                    :
                      option
                    }
                  </li>
                )}
                getOptionLabel={option => {
                  if (option === 'Around planes') {
                    return labelAroundPlanes();
                  }
                  return option;
                }}
              />
              <CustomAreaPopup
                open={openCustom}
                handleClose={() => setOpenCustom(false)}
                setArea={(bounds) => {
                  const a = [...jobsAreas, 'Custom area'];
                  setJobsCustom(bounds);
                  setJobsAreas(a);
                }}
                bounds={jobsCustom}
                settings={props.settings}
              />
              <Autocomplete
                multiple
                options={layersOptions}
                renderInput={(params) => (
                  <TextField {...params} label='Load from custom layers' variant='outlined' margin="normal" />
                )}
                onChange={(evt, values) => {
                  setJobsLayers(values);
                }}
                value={jobsLayers}
                selectOnFocus
                clearOnBlur
                handleHomeEndKeys
                getOptionLabel={option => option.name}
                noOptionsText="No custom layer"
                margin="normal"
              />
              { jobsRequests >= 2 && jobsRequests < 10 && <Alert severity="warning" sx={{ mt: 1 }}>Selected area is very large, it will require {jobsRequests} requests (10 max).</Alert> }
              { jobsRequests >= 10 && <Alert severity="error" sx={{ mt: 1 }}>Selected area is too big.</Alert> }
            </AccordionDetails>
          </Accordion>

          <Accordion expanded={expanded === 'panel3'} onChange={panelChange('panel3')} data-tour="Step6">
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={styles.accSummary}>
              <Typography sx={styles.title}>Available planes</Typography>
              <Button color="secondary" onClick={clearPlanes}>
                Clear
              </Button>
              &nbsp;
              <Tooltip title={<span>Last update : {planesTime ? ((new Date(planesTime)).toLocaleString()) : "never"}</span>}>
                <span>
                  <Button variant="contained" color="primary" onClick={updatePlanes} disabled={loading !== false || !key || (!planeModel.length && !planeUser.length) || rentablePlanesRequests + ownedPlanesRequests > 10}>
                    Update
                    {loading === 'panel3' && <CircularProgress size={24} sx={styles.buttonProgress} />}
                  </Button>
                </span>
              </Tooltip>
            </AccordionSummary>
            <AccordionDetails sx={styles.accDetails}>
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
                sx={{ mt: 2 }}
              />
            </AccordionDetails>
          </Accordion>

          <Accordion expanded={expanded === 'panel4'} onChange={panelChange('panel4')}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={styles.accSummary}>
              <Typography sx={styles.title}>My assignments</Typography>
              <Button color="secondary" onClick={clearFlight}>
                Clear
              </Button>
              &nbsp;
              <Tooltip title={<span>Last update : {flightTime ? ((new Date(flightTime)).toLocaleString()) : "never"}</span>}>
                <span>
                  <Button variant="contained" color="primary" onClick={updateFlight} disabled={loading !== false || !key}>
                    Update
                    {loading === 'panel4' && <CircularProgress size={24} sx={styles.buttonProgress} />}
                  </Button>
                </span>
              </Tooltip>
            </AccordionSummary>
            <AccordionDetails>
              <Stack direction="row" spacing={1}>
                { assignmentKeys.map((elm, id) => (
                  <Chip
                    label={elm.name}
                    onClick={() => {
                      const arr = [...assignmentKeys];
                      arr[id].enabled = !arr[id].enabled;
                      setAssignmentKeys(arr);
                      storage.set('assignmentKeys', arr);
                    }}
                    onDelete={id === 0 ? null : (() => {
                      const arr = [...assignmentKeys];
                      arr.splice(id, 1);
                      setAssignmentKeys(arr);
                      storage.set('assignmentKeys', arr);
                    })}
                    icon={elm.enabled ? <RadioButtonCheckedIcon /> : <RadioButtonUncheckedIcon />}
                    key={elm.name+elm.id}
                  />
                )) }
              </Stack>
              <AddButton
                onAdd={([name, key]) => {
                  const arr = [...assignmentKeys];
                  arr.push({name: name, key: key, enabled: true})
                  setAssignmentKeys(arr);
                  storage.set('assignmentKeys', arr);
                }}
              />
            </AccordionDetails>
          </Accordion>

          <Accordion expanded={expanded === 'panel5'} onChange={panelChange('panel5')}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={styles.accSummary}>
              <Typography sx={styles.title}>Custom markers</Typography>
              <Button color="secondary" onClick={clearCustom}>
                Clear
              </Button>
              &nbsp;
              <span>
                <Button variant="contained" color="primary" onClick={updateCustom} disabled={loading !== false}>
                  Apply
                  {loading === 'panel5' && <CircularProgress size={24} sx={styles.buttonProgress} />}
                </Button>
              </span>
            </AccordionSummary>
            <AccordionDetails sx={styles.accDetails}>
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
        </Box>

      </DialogContent>
    </Dialog>
  );
}

export default UpdatePopup;
