import React from 'react';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import CloseIcon from '@mui/icons-material/Close';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import BusinessIcon from '@mui/icons-material/Business';
import DirectionsIcon from '@mui/icons-material/Directions';
import UpdateIcon from '@mui/icons-material/Update';
import Grid from '@mui/material/Grid';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import Alert from '@mui/material/Alert';

import {default as _set} from 'lodash/set';
import {default as _clone} from 'lodash/cloneDeep';

import Storage from '../Storage.js';

const storage = new Storage();


function Setting({xs, setting, s, setS, end, ...props}) {
  return (
    <Grid item xs={xs || 6}>
      <TextField
        {...props}
        variant="outlined"
        fullWidth
        size="small"
        value={setting.split('.').reduce((a, b) => a[b], s)}
        onChange={(evt) => {
          const obj = Object.assign({}, s);
          _set(obj, setting, evt.target.value)
          setS(obj);
        }}
        InputProps={{
          endAdornment: end ? <InputAdornment position="end">{end}</InputAdornment> : null,
        }}
      />
    </Grid>
  );
}
function SettingSlider({xs, setting, s, setS, label, ...props}) {
  return (
    <Grid item xs={xs || 6}>
      <Typography variant="body2">{label}:</Typography>
      <Slider
        defaultValue={0}
        min={-180}
        max={180}
        step={10}
        marks={[{value: 0, label: 'Europe/Africa'}, {value: 100, label: 'Asia/Oceania'}, {value: -100, label: 'America'}]}
        track={false}
        value={parseInt(setting.split('.').reduce((a, b) => a[b], s))}
        valueLabelDisplay="auto"
        onChange={(evt, value) => {
          const obj = Object.assign({}, s);
          _set(obj, setting, value)
          setS(obj);
        }}
      />
    </Grid>
  );
}
function SettingSwitch({xs, setting, s, setS, label, ...props}) {
  return (
    <Grid item xs={xs || 6}>
      <FormControlLabel
        control={
          <Switch
            checked={setting.split('.').reduce((a, b) => a[b], s) === true}
            onChange={(evt, value) => {
              const obj = Object.assign({}, s);
              _set(obj, setting, value)
              setS(obj);
            }}
            color="primary"
            {...props}
          />
        }
        label={label}
      />
    </Grid>
  );
}
function SettingSlider2({xs, setting, s, setS, label, ...props}) {
  const val = setting.split('.').reduce((a, b) => a[b], s);
  const computeVal = val => val > 3500 ? 3500+(val-3500)/10 : val;
  const inverseVal = val => val > 3500 ? 3500+(val-3500)*10 : val;
  return (
    <Grid item xs={xs || 6}>
      <Typography variant="body2">{label}:</Typography>
      <Slider
        min={0}
        max={5500}
        value={[computeVal(val[0]), computeVal(val[1])]}
        valueLabelFormat={inverseVal}
        valueLabelDisplay="auto"
        onChange={(evt, value) => {
          const obj = Object.assign({}, s);
          _set(obj, setting, [inverseVal(value[0]), inverseVal(value[1])])
          setS(obj);
        }}
        marks={[{value: 0, label: '1 lot'}, {value: 1000, label: '2 lots'}, {value: 3500, label: '3 lots'}]}
      />
    </Grid>
  );
}
function SettingSlider3({xs, setting, s, setS, label, ...props}) {
  const val = setting.split('.').reduce((a, b) => a[b], s);
  const computeVal = val => val > 15000 ? 15000 : val;
  const inverseVal = val => val === 15000 ? 30000 : val;
  return (
    <Grid item xs={xs || 6}>
      <Typography variant="body2">{label}:</Typography>
      <Slider
        min={0}
        max={15000}
        value={[computeVal(val[0]), computeVal(val[1])]}
        valueLabelFormat={inverseVal}
        valueLabelDisplay="auto"
        onChange={(evt, value) => {
          const obj = Object.assign({}, s);
          _set(obj, setting, [inverseVal(value[0]), inverseVal(value[1])])
          setS(obj);
        }}
        marks={[{value: 5000, label: '5000 feet'}, {value: 10000, label: '10000 feet'}, {value: 15000, label: 'no limit'}]}
      />
    </Grid>
  );
}
function SettingSelect({xs, setting, s, setS, options, multiple, ...props}) {
  return (
    <Grid item xs={xs || 6}>
      <TextField
        {...props}
        variant="outlined"
        fullWidth
        size="small"
        value={setting.split('.').reduce((a, b) => a[b], s)}
        select
        SelectProps={{multiple: multiple}}
        onChange={(evt) => {
          const obj = Object.assign({}, s);
          _set(obj, setting, evt.target.value)
          setS(obj);
        }}
      >
        { options.map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>) }
      </TextField>
    </Grid>
  );}


function SettingsPopup(props) {

  const [expanded, setExpanded] = React.useState(false);
  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };
  const [s, setS] = React.useState(() => _clone(props.settings));

  const surfaceOptions = [
    [1, 'Asphalt'],
    [2, 'Concrete'],
    [3, 'Dirt'],
    [4, 'Grass'],
    [5, 'Gravel'],
    [6, 'Helipad'],
    [7, 'Snow'],
    [8, 'Water']
  ];
  const earningsOptions = [
    ['Ground', 'Ground crew fees'],
    ['Booking', 'Booking fees'],
    ['Rental', 'Rental cost & bonus'],
    ['Fuel', 'Fuel cost'],
  ];
  const simOptions = [
    ['msfs', 'MSFS'],
    ['xplane', 'X-Plane 11.55'],
    ['fsx', 'FSX']
  ];
  const mapOptions = [
    [0, 'Default map'],
    [1, 'Alternative map']
  ];
  const memoryOptions = [
    ['vlow', 'Very low'],
    ['low', 'Low'],
    ['normal', 'Normal'],
    ['high', 'High'],
    ['unlimited', 'No limit']
  ];
  const directionOptions = [
    ['from', 'Jobs FROM the selected area/layer'],
    ['to', 'Jobs TO the selected area/layer'],
    ['from&to', 'Jobs FROM and TO the selected area/layer'],
    ['both', 'Jobs INSIDE the selected area/layer']
  ];
  const jobsPlanesOptions = [
    ['strict', 'Strict: only load jobs from the exact airports where a plane is available'],
    ['around', 'Area: load jobs from an area around airports where a plane is available']
  ];
  const jobsTypeOptions = [
    ['Trip-Only', 'Trip Only'],
    ['VIP', 'VIP'],
    ['All-In', 'All In']
  ];
  const jobsCargoOptions = [
    ['passengers', 'Passengers'],
    ['kg', 'Cargo']
  ];

  const handleClose = () => {
    // Cancel change
    setS(_clone(props.settings));
    setExpanded(false);
    // Close popup
    props.handleClose();
  };

  React.useEffect(() => {
    if (typeof props.open !== 'boolean') {
      setExpanded(props.open);
    }
  }, [props.open]);

  return (
    <Dialog onClose={handleClose} open={props.open !== false} fullWidth={true} maxWidth="md">
      <DialogTitle>
        Settings
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
        <Accordion expanded={expanded === 'panel1'} onChange={handleChange('panel1')} TransitionProps={{ unmountOnExit: true }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Display settings</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Setting s={s} setS={setS} label="Standard airport color" setting='display.markers.colors.base' />
              <Setting s={s} setS={setS} label="Standard airport size" setting='display.markers.sizes.base' />
              <Setting s={s} setS={setS} label="Airport with available plane color" setting='display.markers.colors.rentable' />
              <Setting s={s} setS={setS} label="Airport with available plane size" setting='display.markers.sizes.rentable' />
              <Setting s={s} setS={setS} label="Highlighted airport color" setting='display.markers.colors.selected' />
              <Setting s={s} setS={setS} label="Highlighted airport size" setting='display.markers.sizes.selected' />
              <Setting s={s} setS={setS} label="FSE airport color" setting='display.markers.colors.fse' />
              <Setting s={s} setS={setS} label="FSE airport size" setting='display.markers.sizes.fse' />
              <Setting s={s} setS={setS} label="Simulator airport color" setting='display.markers.colors.sim' />
              <Setting s={s} setS={setS} label="Simulator airport size" setting='display.markers.sizes.sim' />
              <Setting s={s} setS={setS} label="Passenger leg color" setting='display.legs.colors.passengers' xs={4} />
              <Setting s={s} setS={setS} label="My assignments leg color" setting='display.legs.colors.flight' xs={4} />
              <Setting s={s} setS={setS} label="Highlighted leg color" setting='display.legs.colors.highlight' xs={4} />
              <Setting s={s} setS={setS} label="Min leg weight" setting='display.legs.weights.base' helperText="Also used when adaptative weight is disabled" xs={4} />
              <Setting s={s} setS={setS} label="Max passenger leg weight" setting='display.legs.weights.passengers' helperText="Leave empty to disable adaptative weight" xs={4} />
              <Setting s={s} setS={setS} label="My assignments leg weight" setting='display.legs.weights.flight' xs={4} />
              <SettingSelect s={s} setS={setS} label="Default map" setting='display.map.basemap' options={mapOptions} />
              <SettingSelect s={s} setS={setS} label="Simulator" setting='display.sim' options={simOptions} />
              <SettingSlider s={s} setS={setS} label="Map center" setting='display.map.center' xs={12} />
            </Grid>
          </AccordionDetails>
        </Accordion>
        <Accordion expanded={expanded === 'panel2'} onChange={handleChange('panel2')} TransitionProps={{ unmountOnExit: true }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <FilterAltIcon />&nbsp;<Typography>Filters settings</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" sx={{ mb: 2 }}>Default filters (when loading FSE Planner):</Typography>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <SettingSelect s={s} setS={setS} label="Job category" setting='filters.type' options={jobsTypeOptions} xs={6} />
              <SettingSelect s={s} setS={setS} label="Job type" setting='filters.cargo' options={jobsCargoOptions} multiple={true} xs={6} />
            </Grid>
            <Grid container spacing={3}>
              <Grid item container xs={9} sx={{ alignContent: 'flex-start '}}>
                <Typography variant="body1" sx={{ mb: 1 }}>From ICAO settings:</Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>You may use up to 3 different constraints. Leave the input empty to disable a constraint.</Typography>
                <Grid container spacing={3}>
                  <Setting s={s} setS={setS} label="Max d" setting='from.maxDist' xs={4} placeholder="20NM" />
                  <Setting s={s} setS={setS} label="Min D/d" setting='from.distCoef' xs={4} placeholder="1.5" />
                  <Setting s={s} setS={setS} label="Max α" setting='from.angle' xs={4} placeholder="30°" />
                </Grid>
              </Grid>
              <Grid item xs={3}>
                <img src="settings/helpFrom.png" alt="Schema" />
              </Grid>
            </Grid>
            <Grid container spacing={3}>
              <Grid item container xs={9} sx={{ alignContent: 'flex-start '}}>
                <Typography variant="body1" sx={{ mb: 1 }}>To ICAO settings:</Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>You may use up to 3 different constraints. Leave the input empty to disable a constraint.</Typography>
                <Grid container spacing={3}>
                  <Setting s={s} setS={setS} label="Max d" setting='to.maxDist' xs={4} placeholder="20NM" />
                  <Setting s={s} setS={setS} label="Min D/d" setting='to.distCoef' xs={4} placeholder="1.5" />
                  <Setting s={s} setS={setS} label="Max α" setting='to.angle' xs={4} placeholder="30°" />
                </Grid>
              </Grid>
              <Grid item xs={3}>
                <img src="settings/helpTo.png" alt="Schema" />
              </Grid>
            </Grid>
            <Typography variant="body1" sx={{ mb: 1.5 }}>Direction settings:</Typography>
            <Grid container spacing={3}>
              <Setting s={s} setS={setS} label="Maximum tolerance angle" setting='direction.angle' />
            </Grid>
          </AccordionDetails>
        </Accordion>
        <Accordion expanded={expanded === 'panel3'} onChange={handleChange('panel3')} TransitionProps={{ unmountOnExit: true }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <BusinessIcon />&nbsp;<Typography>Airport filtering</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item container xs={12}>
                <Alert severity="info">This is used by all default layers and by the Route Finder.</Alert>
              </Grid>
              <SettingSlider2 s={s} setS={setS} label="Airport size (combined length of all runways in meters)" setting='airport.size' xs={12} />
              <SettingSlider3 s={s} setS={setS} label="Airport longest runway (in feet)" setting="airport.runway" xs={12} />
              <SettingSelect s={s} setS={setS} label="Airport runway surface" setting="airport.surface" options={surfaceOptions} multiple={true} xs={12} />
              <SettingSwitch s={s} setS={setS} label="Only display and use simulator compatible airports" setting="airport.onlySim" xs={12} />
              <SettingSwitch s={s} setS={setS} label="Include non-compatible airports that have at least one alternative in your simulator" setting="airport.onlySimAlternative" xs={12} disabled={!s.airport.onlySim} />
              <SettingSwitch s={s} setS={setS} label="Only display and use airports with an ILS approach (MSFS)" setting="airport.onlyILS" xs={12} />
              <SettingSwitch s={s} setS={setS} label="Exclude military airbases" setting="airport.excludeMilitary" xs={12} />
            </Grid>
          </AccordionDetails>
        </Accordion>
        <Accordion expanded={expanded === 'panel4'} onChange={handleChange('panel4')} TransitionProps={{ unmountOnExit: true }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <DirectionsIcon />&nbsp;<Typography>Route Finder default parameters</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <div>
              <Alert severity="warning" sx={{ mb: 2 }}>After saving, you will need to refresh the app in order to see the changes in Route Finder.</Alert>
              <SettingSwitch s={s} setS={setS} label="Return plane to starting airport" setting="routeFinder.returnLeg" xs={12} />
              <Typography variant="body1" sx={{ my: 3 }}>Advanced algorithm parameters:</Typography>
              <Grid container spacing={3}>
                <Setting s={s} setS={setS} label="Iterations" setting='routeFinder.maxHops' xs={6} helperText="Maximum algorithm iterations. The total route legs may be more than this, due to deadhead legs and on-route stops." />
                <Setting s={s} setS={setS} label="Max stops" setting='routeFinder.maxStops' xs={6} helperText="Number of possible stops along a leg to drop passengers/cargo, in order to better fill the plane part of the leg." />
                <Setting s={s} setS={setS} label="Min plane load" setting='routeFinder.minLoad' xs={6} end="%" helperText="Try to always keep the plane at least this full." />
                <Setting s={s} setS={setS} label="Max bad legs" setting='routeFinder.maxBadLegs' xs={6} helperText="Number of possible legs bellow the minimum plane load." />
                <Setting s={s} setS={setS} label="Max empty legs" setting='routeFinder.maxEmptyLeg' xs={6} end="NM" helperText="Maximum length of entirely empty legs (no cargo/pax at all). Do not set this too high, it quickly becomes very computer intensive."/>
                <SettingSelect s={s} setS={setS} label="Memory usage" setting='routeFinder.memory' xs={6} options={memoryOptions} helperText="Adjust this setting if Route Finder is crashing" />
              </Grid>
              <Typography variant="body1" sx={{ my: 3 }}>Route parameters:</Typography>
              <Grid container spacing={3}>
                <Setting s={s} setS={setS} label="Idle and taxi time" setting='routeFinder.idleTime' end="min" xs={6} helperText="Time spent on ground at each stop (flight checks, taxi, etc.)" />
                <Setting s={s} setS={setS} label="Distance overhead" setting='routeFinder.overheadLength' end="%" xs={6} helperText="Added to the leg straight distance, to account for not straight routes." />
                <Setting s={s} setS={setS} label="Approach distance" setting='routeFinder.approachLength' end="NM" xs={6} helperText="Added to the leg straight distance, to account for approach circuits."/>
                <SettingSelect s={s} setS={setS} label="Net earnings" setting='routeFinder.fees' xs={6} options={earningsOptions} multiple={true} />
              </Grid>
              <Typography variant="body1" sx={{ my: 3 }}>PDF export image (500px * 180px):</Typography>
              <Grid container spacing={3}>
                <Grid item xs={3}>
                  <label htmlFor="pdfImage">
                    <input
                      accept="image/*"
                      id="pdfImage"
                      type="file"
                      style={{ display: 'none' }}
                      onChange={evt => {
                        const file = evt.target.files[0];
                        const fileReader = new FileReader();
                        fileReader.readAsDataURL(file);
                        fileReader.onload = () => {
                          const obj = Object.assign({}, s);
                          _set(obj, 'routeFinder.pdfImage', fileReader.result);
                          setS(obj);
                        }
                        fileReader.onerror = () => alert('Unable to load image');
                      }}
                    />
                    <Button variant="contained" component="span">
                      Upload image
                    </Button>
                  </label>
                  { s.routeFinder.pdfImage &&
                    <Button
                      color="secondary"
                      onClick={evt => {
                        const obj = Object.assign({}, s);
                        _set(obj, 'routeFinder.pdfImage', null);
                        setS(obj);
                      }}
                      sx={{ mt: 1 }}
                    >
                      Clear
                    </Button>
                  }
                </Grid>
                <Grid item xs={9}>
                  {s.routeFinder.pdfImage && <img src={s.routeFinder.pdfImage} alt="PDF export" style={{ maxWidth: '100%' }} />}
                </Grid>
              </Grid>
            </div>
          </AccordionDetails>
        </Accordion>
        <Accordion expanded={expanded === 'panel5'} onChange={handleChange('panel5')} TransitionProps={{ unmountOnExit: true }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <UpdateIcon />&nbsp;<Typography>Data update settings</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <div>
              <Grid container spacing={3}>
                <Setting s={s} setS={setS} label="Minimum job expiration (in hours)" end="H" setting='update.expiration' xs={6} helperText="Select only jobs that expires in, at least, this many hours. Leave empty to select all jobs" />
                <SettingSwitch s={s} setS={setS} label="Include Express jobs" setting='update.express' xs={6} />
              </Grid>
              <Grid container spacing={3} sx={{ mt: 2 }}>
                <SettingSelect s={s} setS={setS} label="Job direction for the selected area/layer" setting='update.direction' xs={6} options={directionOptions} />
                <SettingSwitch s={s} setS={setS} label="Keep window open after updating" setting='update.persist' xs={6} />
              </Grid>
              <Grid container spacing={3} sx={{ mt: 2 }}>
                <SettingSelect s={s} setS={setS} label="Load area around available planes" setting='update.jobsPlanes' xs={12} options={jobsPlanesOptions} />
              </Grid>
              <Typography variant="body2" sx={{ mt: 2, mb: 1 }}>If AREA is selected above:</Typography>
              <Grid container spacing={3}>
                <Setting s={s} setS={setS} label="Maximum requests" setting='update.jobsPlanesRequests' xs={6} placeholder="1" helperText="A higher number of requests means larger areas. Beware of FSE request limitations." />
                <Setting s={s} setS={setS} label="Maximum search locations" setting='update.jobsPlanesMax' xs={6} placeholder="10" helperText="Top areas are locations with the lowest airplane rental costs. Increasing this number will decrease the loaded area size." />
              </Grid>
            </div>
          </AccordionDetails>
        </Accordion>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleClose}
          color="primary"
        >
          Cancel
        </Button>
        <Button
          onClick={() => {
            if (window.confirm('Are you sure you want to reset all settings to default settings?')) {
              // Propagate change
              const newSettings = _clone(props.defaultSettings);
              props.setSettings(newSettings);
              setS(newSettings);
              // Save settings to local storage
              storage.set('settings', newSettings);
              // Close popup
              setExpanded(false);
              props.handleClose();
            }
          }}
          color="secondary"
        >
          Reset settings
        </Button>
        <Button
          onClick={() => {
            // Propagate change
            props.setSettings(s);
            // Save settings to local storage
            storage.set('settings', s);
            // Close popup
            setExpanded(false);
            props.handleClose();
          }}
          color="primary"
          variant="contained"
        >
          Save settings
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default SettingsPopup;
