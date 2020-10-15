import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import InputBase from '@material-ui/core/InputBase';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
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
import TuneIcon from '@material-ui/icons/Tune';
import { makeStyles } from '@material-ui/core/styles';
import { default as _defaultsDeep } from 'lodash/defaultsDeep';

import FSEMap from './Map.js';
import UpdatePopup from './Update.js';
import SettingsPopup from './Settings.js';

import './App.css';
import icaodata from "./data/icaodata.json";


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
        highlight: 'yellow'
      },
      weights: {
        base: '1.2',
        passengers: '10',
        cargo: '10'
      }
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
  }
};


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
  const [settings, setSettings] = React.useState(() => {
    const s = JSON.parse(localStorage.getItem("settings"));
    if (s) {
      return _defaultsDeep(s, defaultSettings);
    }
    return defaultSettings;
  })
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
    settings: settings
  }), [type, cargo, fromIcao, toIcao, min, max, minDist, maxDist, direction, jobs, planes, settings]);

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
              <TooltipToggleButton value="Trip-Only" title="Cargo" classes={{root: classes.tgBtn, selected: classes.tgBtnSelected}} tclasses={{tooltip: classes.tooltip, arrow: classes.tooltipArrow}}>
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
      />
      <UpdatePopup
        open={updatePopup}
        handleClose={() => setUpdatePopup(false)}
        setJobs={setJobs}
        setPlanes={(planes) => setPlanes(rentable(planes))}
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
