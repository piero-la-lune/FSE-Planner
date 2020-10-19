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

import CustomAreaPopup from './CustomArea.js';

import aircrafts from "./data/aircraft.json";




function getAreas(icaodata) {
  let a = new Set();
  let icaos = Object.keys(icaodata);
  for (var i = icaos.length - 1; i >= 0; i--) {
    const country = icaodata[icaos[i]].country;
    if (country === 'United States') {
      a.add('US - '+icaodata[icaos[i]].state)
    }
    else {
      a.add(country);
    }
  }
  return [...a].sort();
}


function getIcaoList(countries, bounds, icaodata) {
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
  let icaos = [];
  for (const [icao, obj] of Object.entries(icaodata)) {
    // If custom area, check if icao is inside the polygon
    if (points && isPointInPolygon({ latitude: obj.lat, longitude: obj.lon}, points)) {
      icaos.push(icao);
    }
    else {
      // For the United States, we use states instead
      if (obj.country === 'United States') {
        if (countries.includes('US - '+obj.state)) {
          icaos.push(icao);
        }
      }
      else {
        if (countries.includes(obj.country)) {
          icaos.push(icao);
        }
      }
    }
  }
  return icaos.join('-');
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

  const [key, setKey] = React.useState(localStorage.getItem("key") || '');
  const [jobsAreas, setJobsAreas] = React.useState(() => JSON.parse(localStorage.getItem("jobsAreas")) || []);
  const [jobsCustom, setJobsCustom] = React.useState(() => {
    const b = JSON.parse(localStorage.getItem("jobsCustom"))
    if (b) { return L.latLngBounds(b._southWest, b._northEast); }
    return null;
  });
  const [jobsTime, setJobsTime] = React.useState(localStorage.getItem("jobsTime") || null);
  const [jobsError, setJobsError] = React.useState(false);
  const [planeModel, setPlaneModel] = React.useState(localStorage.getItem("planeModel") || '');
  const [planesTime, setPlanesTime] = React.useState(localStorage.getItem("planesTime") || null);
  const [flightTime, setFlightTime] = React.useState(localStorage.getItem("flightTime") || null);
  const [loading, setLoading] = React.useState(false);
  const [openCustom, setOpenCustom] = React.useState(false);
  const [expanded, setExpanded] = React.useState(localStorage.getItem("key") ? false : 'panel1');
  const classes = useStyles();

  const areas = getAreas(props.icaodata);
  areas.unshift('Custom area');

  const updateJobs = (evt) => {
    evt.stopPropagation();
    setLoading(true);
    // Compute ICAO list
    const icaos = getIcaoList(jobsAreas, jobsCustom, props.icaodata);
    const url = 'https://server.fseconomy.net/data?userkey='+key+'&format=csv&query=icao&search=jobsfrom&icaos='+icaos;
    // Fetch job list
    fetch('https://cors-anywhere.herokuapp.com/'+url)
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
      // Update jobs
      props.setJobs(jobs);
      localStorage.setItem('jobs', JSON.stringify(jobs));
      // Update date
      let date = new Date();
      localStorage.setItem('jobsTime', date);
      setJobsTime(localStorage.getItem("jobsTime"));
      // Update area
      localStorage.setItem("jobsAreas", JSON.stringify(jobsAreas));
      localStorage.setItem("jobsCustom", JSON.stringify(jobsCustom));
      // Close popup
      setLoading(false);
      props.handleClose();
    })
    .catch(function(error) {
      alert('Could not get data. Check your read access key.');
      setLoading(false);
    });
  }

  const clearJobs = (evt) => {
    evt.stopPropagation();
    setLoading(true);
    // Update planes
    props.setJobs({});
    localStorage.removeItem('jobs');
    localStorage.removeItem('jobsTime');
    setJobsTime(null);
    // Close popup
    setLoading(false);
    props.handleClose();
  }

  const updatePlanes = (evt) => {
    evt.stopPropagation();
    setLoading(true);
    // Build URL
    const url = 'https://server.fseconomy.net/data?userkey='+key+'&format=csv&query=aircraft&search=makemodel&makemodel='+encodeURI(planeModel);
    // Fetch planes list
    fetch('https://cors-anywhere.herokuapp.com/'+url)
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
      let planes = parse.data.reduce((obj, item) => {
        obj[item.SerialNumber] = item;
        return obj;
      }, {});
      // Update planes
      props.setPlanes(planes);
      localStorage.setItem('planes', JSON.stringify(planes));
      // Update date
      let date = new Date();
      localStorage.setItem('planesTime', date);
      setPlanesTime(localStorage.getItem("planesTime"));
      // Update model
      localStorage.setItem("planeModel", planeModel);
      // Close popup
      setLoading(false);
      props.handleClose();
    })
    .catch(function(error) {
      alert('Could not get data. Check your read access key.');
      setLoading(false);
    });
  }

  const clearPlanes = (evt) => {
    evt.stopPropagation();
    setLoading(true);
    // Update planes
    props.setPlanes({});
    localStorage.removeItem('planes');
    localStorage.removeItem('planesTime');
    setPlanesTime(null);
    // Close popup
    setLoading(false);
    props.handleClose();
  }

  const updateFlight = (evt) => {
    evt.stopPropagation();
    setLoading(true);
    // Build URL
    const url = 'https://server.fseconomy.net/data?userkey='+key+'&format=csv&query=assignments&search=key&readaccesskey='+key
    // Fetch job list
    fetch('https://cors-anywhere.herokuapp.com/'+url)
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
      props.setFlight(jobs);
      localStorage.setItem('flight', JSON.stringify(jobs));
      // Update date
      let date = new Date();
      localStorage.setItem('flightTime', date);
      setFlightTime(localStorage.getItem("flightTime"));
      // Close popup
      setLoading(false);
      props.handleClose();
    })
    .catch(function(error) {
      alert('Could not get data. Check your read access key.');
      setLoading(false);
    });
  }

  const clearFlight = (evt) => {
    evt.stopPropagation();
    setLoading(true);
    // Update planes
    props.setFlight({});
    localStorage.removeItem('flight');
    localStorage.removeItem('flightTime');
    setFlightTime(null);
    // Close popup
    setLoading(false);
    props.handleClose();
  }

  const panelChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Dialog onClose={props.handleClose} open={props.open} fullWidth={true} maxWidth="sm">
      <DialogTitle>
        Update data
        <IconButton className={classes.closeButton} onClick={props.handleClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers className={classes.dialog}>

        <Alert severity="warning" className={classes.alert}>Each update below is 1 request to the FSE servers. You are limited to 40 requests every 6 hours (~1 request every 10 minutes).</Alert>

        <Accordion expanded={expanded === 'panel1'} onChange={panelChange('panel1')}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Read access key</Typography>
          </AccordionSummary>
          <AccordionDetails className={classes.accDetails}>
            <TextField
              label="Read Access Key"
              type="text"
              onChange={(evt) => {
                let k = evt.target.value;
                setKey(k);
                localStorage.setItem("key", k);
              }}
              value={key}
              helperText={<span>Can be found <Link href="https://server.fseconomy.net/datafeeds.jsp" target="_blank">here</Link></span>}
              variant='outlined'
              fullWidth
            />
          </AccordionDetails>
        </Accordion>

        <Accordion expanded={expanded === 'panel2'} onChange={panelChange('panel2')}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} classes={{content: classes.accSummary}}>
            <Typography className={classes.title}>Jobs</Typography>
            <Button color="secondary" onClick={clearJobs}>
              Clear
            </Button>
            &nbsp;
            <Tooltip title={<span>Last update : {jobsTime ? ((new Date(jobsTime)).toLocaleString()) : "never"}</span>}>
              <span>
                <Button variant="contained" color="primary" onClick={updateJobs} disabled={loading || !key || jobsError || !jobsAreas.length}>
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
                jobsError ?
                  <TextField {...params} label='Included countries' variant='outlined' error helperText='Selected area is too big' />
                :
                  <TextField {...params} label='Included countries' variant='outlined' />
              )}
              onChange={(evt, value) => {
                if (value.includes('Custom area') && !jobsAreas.includes('Custom area')) {
                  setOpenCustom(true);
                }
                else {
                  setJobsAreas(value);
                  setJobsError(getIcaoList(value, jobsCustom, props.icaodata).length > 8000)  
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
                setJobsError(getIcaoList(a, bounds, props.icaodata).length > 8000);
              }}
              bounds={jobsCustom}
              settings={props.settings}
            />
          </AccordionDetails>
        </Accordion>

        <Accordion expanded={expanded === 'panel3'} onChange={panelChange('panel3')}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} classes={{content: classes.accSummary}}>
            <Typography className={classes.title}>Rentable planes</Typography>
            <Button color="secondary" onClick={clearPlanes}>
              Clear
            </Button>
            &nbsp;
            <Tooltip title={<span>Last update : {planesTime ? ((new Date(planesTime)).toLocaleString()) : "never"}</span>}>
              <span>
                <Button variant="contained" color="primary" onClick={updatePlanes} disabled={loading || !key || !planeModel}>
                  Update
                  {loading && <CircularProgress size={24} className={classes.buttonProgress} />}
                </Button>
              </span>
            </Tooltip>
          </AccordionSummary>
          <AccordionDetails className={classes.accDetails}>
            <Autocomplete
              options={Object.keys(aircrafts)}
              renderInput={(params) => (
                <TextField {...params} label="Aircraft model" variant='outlined' />
              )}
              onChange={(evt, value) => {
                setPlaneModel(value);
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

      </DialogContent>
    </Dialog>
  );
}

export default UpdatePopup;