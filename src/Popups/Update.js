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
import { makeStyles } from '@material-ui/core/styles';

import { readString } from 'react-papaparse';
import { isPointInPolygon } from "geolib";
import L from "leaflet";
import { getDistance, getRhumbLineBearing, convertDistance } from "geolib";

import CustomAreaPopup from './Components/CustomArea.js';
import Storage from '../Storage.js';

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


function cleanPlanes(list) {
  const planes = {};
  for (const obj of list) {
    // Exclude broken airplanes
    if (obj.NeedsRepair === 1) { continue; }
    // Ensure plane can be rented
    if (obj.Location === 'In Flight') { continue; }
    if (obj.RentedBy !== 'Not rented.') { continue; }
    if (!obj.RentalDry && !obj.RentalWet) { continue; }

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

    const key = job.Location+"-"+job.ToIcao;

    // Ensure leg exist in jobs object
    if (!jobs.hasOwnProperty(key)) {
      const fr = { latitude: icaodata[job.Location].lat, longitude: icaodata[job.Location].lon };
      const to = { latitude: icaodata[job.ToIcao].lat, longitude: icaodata[job.ToIcao].lon };
      jobs[key] = {
        direction: Math.round(getRhumbLineBearing(fr, to)),
        distance: Math.round(convertDistance(getDistance(fr, to), 'sm'))
      };
    }
    if (!jobs[key].hasOwnProperty(job.UnitType)) {
      jobs[key][job.UnitType] = {};
    }
    if (!jobs[key][job.UnitType][job.Type]) {
      jobs[key][job.UnitType][job.Type] = [];
    }

    jobs[key][job.UnitType][job.Type].push({
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
  }
}));

const filter = createFilterOptions();


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
  const [planesTime, setPlanesTime] = React.useState(storage.get('planesTime'));
  const [planesRequests, setPlanesRequests] = React.useState(planeModel.length);
  const [flightTime, setFlightTime] = React.useState(storage.get('flightTime'));
  const [loading, setLoading] = React.useState(false);
  const [openCustom, setOpenCustom] = React.useState(false);
  const [expanded, setExpanded] = React.useState(key ? false : 'panel1');
  const [customIcaosVal, setCustomIcaosVal] = React.useState(props.customIcaos.join(' '));
  const classes = useStyles();

  const areas = React.useState(() => getAreas(props.icaodata, props.icaos))[0];

  // Close popup
  const handleClose = () => {
    props.setUpdatePopup(false);
  }

  // Open popup on loading if no FSE key
  const setUpdatePopupRef = React.useRef(props.setUpdatePopup);
  React.useEffect(() => {
    if (!storage.get('key')) {
      setUpdatePopupRef.current(true);
    }
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
      console.log(error);
      alert('Could not get data. Check your read access key and ensure you have not reached your quota limit.');
      setLoading(false);
    });
  }
  // Jobs Update button clicked
  const updateJobs = (evt) => {
    evt.stopPropagation();
    setLoading(true);
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
    setLoading(true);
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
  const updatePlanesRequest = (models, planes, callback) => {
    if (!models.length) {
      callback(planes);
      return;
    }
    const url = 'data?userkey='+key+'&format=csv&query=aircraft&search=makemodel&makemodel='+encodeURI(models.pop());
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
      updatePlanesRequest(models, [...planes, ...parse.data], callback);
    })
    .catch(function(error) {
      console.log(error);
      alert('Could not get data. Check your read access key and ensure you have not reached your quota limit.');
      setLoading(false);
    });
  }
  // Planes Update button clicked
  const updatePlanes = (evt) => {
    evt.stopPropagation();
    setLoading(true);
    updatePlanesRequest(planeModel.slice(), [], (list) => {
      // Transform to object
      const planes = cleanPlanes(list);
      // Update planes
      storage.set('planes', planes);
      props.setPlanes(planes);
      // Update date
      let date = new Date().toString();
      storage.set('planesTime', date);
      setPlanesTime(date);
      // Update model
      storage.set('planeModel', planeModel);
      // Close popup
      setLoading(false);
      handleClose();
    });
  }
  // Planes Clear button clicked
  const clearPlanes = (evt) => {
    evt.stopPropagation();
    setLoading(true);
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
    setLoading(true);
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
      // Convert array to object
      let jobs = parse.data.reduce((obj, item) => {
        obj[item.Id] = item;
        return obj;
      }, {});
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
      alert('Could not get data. Check your read access key.');
      setLoading(false);
    });
  }
  // My Flight Clear button clicked
  const clearFlight = (evt) => {
    evt.stopPropagation();
    setLoading(true);
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
    setLoading(true);
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
    setLoading(true);
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
            <Typography>FSE read access key</Typography>
          </AccordionSummary>
          <AccordionDetails className={classes.accDetails}>
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
            />
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
                <Button variant="contained" color="primary" onClick={updateJobs} disabled={loading || !key || !jobsAreas.length || jobsRequests > 10}>
                  Update
                  {loading && <CircularProgress size={24} className={classes.buttonProgress} />}
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
            <Typography className={classes.title}>Rentable planes</Typography>
            <Button color="secondary" onClick={clearPlanes}>
              Clear
            </Button>
            &nbsp;
            <Tooltip title={<span>Last update : {planesTime ? ((new Date(planesTime)).toLocaleString()) : "never"}</span>}>
              <span>
                <Button variant="contained" color="primary" onClick={updatePlanes} disabled={loading || !key || !planeModel.length || planesRequests > 10}>
                  Update
                  {loading && <CircularProgress size={24} className={classes.buttonProgress} />}
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
                planesRequests > 1 ?
                  <TextField {...params} label='Aircraft model' variant='outlined' error helperText={planesRequests+' models selected, it will require '+planesRequests+' requests (10 max)'} />
                :
                  <TextField {...params} label='Aircraft model' variant='outlined' />
              )}
              onChange={(evt, value) => {
                setPlaneModel(value);
                setPlanesRequests(value.length);
              }}
              value={planeModel}
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
                <Button variant="contained" color="primary" onClick={updateFlight} disabled={loading || !key}>
                  Update
                  {loading && <CircularProgress size={24} className={classes.buttonProgress} />}
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
              <Button variant="contained" color="primary" onClick={updateCustom} disabled={loading}>
                Update
                {loading && <CircularProgress size={24} className={classes.buttonProgress} />}
              </Button>
            </span>
          </AccordionSummary>
          <AccordionDetails className={classes.accDetails}>
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