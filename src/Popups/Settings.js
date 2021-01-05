import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import CloseIcon from '@material-ui/icons/Close';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Typography from '@material-ui/core/Typography';
import Slider from '@material-ui/core/Slider';
import Accordion from '@material-ui/core/Accordion';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import FlightTakeoffIcon from '@material-ui/icons/FlightTakeoff';
import FlightLandIcon from '@material-ui/icons/FlightLand';
import ExploreIcon from '@material-ui/icons/Explore';
import MonetizationOnIcon from '@material-ui/icons/MonetizationOn';
import BusinessIcon from '@material-ui/icons/Business';
import Grid from '@material-ui/core/Grid';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import MenuItem from '@material-ui/core/MenuItem';
import { makeStyles } from '@material-ui/core/styles';

import {default as _set} from 'lodash/set';
import {default as _clone} from 'lodash/cloneDeep';

import Storage from '../Storage.js';

const storage = new Storage();


const useStyles = makeStyles(theme => ({
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
  dialog: {
    padding: theme.spacing(3)
  }
}));


function Setting({xs, setting, s, setS, ...props}) {
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
function SettingSelect({xs, setting, s, setS, ...props}) {
  return (
    <Grid item xs={xs || 6}>
      <TextField
        {...props}
        variant="outlined"
        fullWidth
        size="small"
        value={setting.split('.').reduce((a, b) => a[b], s)}
        select
        SelectProps={{multiple: true}}
        onChange={(evt) => {
          const obj = Object.assign({}, s);
          _set(obj, setting, evt.target.value)
          setS(obj);
        }}
      >
        <MenuItem value={1}>Asphalt</MenuItem>
        <MenuItem value={2}>Concrete</MenuItem>
        <MenuItem value={3}>Coral</MenuItem>
        <MenuItem value={4}>Dirt</MenuItem>
        <MenuItem value={5}>Grass</MenuItem>
        <MenuItem value={6}>Gravel</MenuItem>
        <MenuItem value={7}>Helipad</MenuItem>
        <MenuItem value={8}>Oil Treated</MenuItem>
        <MenuItem value={9}>Snow</MenuItem>
        <MenuItem value={10}>Steel Mats</MenuItem>
        <MenuItem value={11}>Water</MenuItem>
      </TextField>
    </Grid>
  );}


function SettingsPopup(props) {

  const [expanded, setExpanded] = React.useState(false);
  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };
  const [s, setS] = React.useState(() => _clone(props.settings));
  const classes = useStyles();

  const handleClose = () => {
    // Cancel change
    setS(_clone(props.settings));
    setExpanded(false);
    // Close popup
    props.handleClose();
  };

  return (
    <Dialog onClose={handleClose} open={props.open} fullWidth={true} maxWidth="md">
      <DialogTitle>
        Settings
        <IconButton className={classes.closeButton} onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers className={classes.dialog}>
        <Accordion expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Display settings</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Setting s={s} setS={setS} label="Standard airport color" setting='display.markers.colors.base' />
              <Setting s={s} setS={setS} label="Standard airport size" setting='display.markers.sizes.base' />
              <Setting s={s} setS={setS} label="Airport with rentable plane color" setting='display.markers.colors.rentable' />
              <Setting s={s} setS={setS} label="Airport with rentable plane size" setting='display.markers.sizes.rentable' />
              <Setting s={s} setS={setS} label="Highlighted airport color" setting='display.markers.colors.selected' />
              <Setting s={s} setS={setS} label="Highlighted airport size" setting='display.markers.sizes.selected' />
              <Setting s={s} setS={setS} label="FSE airport color" setting='display.markers.colors.fse' />
              <Setting s={s} setS={setS} label="FSE airport size" setting='display.markers.sizes.fse' />
              <Setting s={s} setS={setS} label="MSFS airport color" setting='display.markers.colors.msfs' />
              <Setting s={s} setS={setS} label="MSFS airport size" setting='display.markers.sizes.msfs' />
              <Setting s={s} setS={setS} label="Custom marker airport color" setting='display.markers.colors.custom' />
              <Setting s={s} setS={setS} label="Custom marker airport size" setting='display.markers.sizes.custom' />
              <Setting s={s} setS={setS} label="Passenger leg color" setting='display.legs.colors.passengers' xs={4} />
              <Setting s={s} setS={setS} label="Cargo leg color" setting='display.legs.colors.cargo' xs={4} />
              <Setting s={s} setS={setS} label="My Flight leg color" setting='display.legs.colors.flight' xs={4} />
              <Setting s={s} setS={setS} label="Max passenger leg weight" setting='display.legs.weights.passengers' helperText="Leave empty to disable adaptative weight" xs={4} />
              <Setting s={s} setS={setS} label="Max cargo leg weight" setting='display.legs.weights.cargo' helperText="Leave empty to disable adaptative weight" xs={4} />
              <Setting s={s} setS={setS} label="My Flight leg weight" setting='display.legs.weights.flight' xs={4} />
              <Setting s={s} setS={setS} label="Highlighted leg color" setting='display.legs.colors.highlight' />
              <Setting s={s} setS={setS} label="Min leg weight" setting='display.legs.weights.base' helperText="Also used when adaptative weight is disabled" />
              <SettingSlider s={s} setS={setS} label="Map center" setting='display.map.center' xs={12} />
              <SettingSwitch s={s} setS={setS} label="Join Custom markers with a line to form a route" setting="display.legs.display.custom" xs={12} />
            </Grid>
          </AccordionDetails>
        </Accordion>
        <Accordion expanded={expanded === 'panel2'} onChange={handleChange('panel2')}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <FlightTakeoffIcon />&nbsp;<Typography>From ICAO settings</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item container xs={9}>
                <Typography variant="body2">You may use up to 3 different constraints. Leave the input empty to disable a constraint.</Typography>
                <Setting s={s} setS={setS} label="Max d" setting='from.maxDist' xs={12} placeholder="20NM" />
                <Setting s={s} setS={setS} label="Min D/d" setting='from.distCoef' xs={12} placeholder="1.5" />
                <Setting s={s} setS={setS} label="Max α" setting='from.angle' xs={12} placeholder="30°" />
              </Grid>
              <Grid item xs={3}>
                <img src="settings/helpFrom.png" alt="Schema" />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
        <Accordion expanded={expanded === 'panel3'} onChange={handleChange('panel3')}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <FlightLandIcon />&nbsp;<Typography>To ICAO settings</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item container xs={9}>
                <Typography variant="body2">You may use up to 3 different constraints. Leave the input empty to disable a constraint.</Typography>
                <Setting s={s} setS={setS} label="Max d" setting='to.maxDist' xs={12} placeholder="20NM" />
                <Setting s={s} setS={setS} label="Min D/d" setting='to.distCoef' xs={12} placeholder="1.5" />
                <Setting s={s} setS={setS} label="Max α" setting='to.angle' xs={12} placeholder="30°" />
              </Grid>
              <Grid item xs={3}>
                <img src="settings/helpTo.png" alt="Schema" />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
        <Accordion expanded={expanded === 'panel4'} onChange={handleChange('panel4')}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <ExploreIcon />&nbsp;<Typography>Direction settings</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Setting s={s} setS={setS} label="Maximum tolerance angle" setting='direction.angle' />
            </Grid>
          </AccordionDetails>
        </Accordion>
        <Accordion expanded={expanded === 'panel5'} onChange={handleChange('panel5')}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <MonetizationOnIcon />&nbsp;<Typography>Pay settings</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Setting s={s} setS={setS} label="Minimum job pay (in $)" setting='pay.min_job' xs={4} />
              <Setting s={s} setS={setS} label="Minimum leg pay (in $)" setting='pay.min_leg' xs={4} />
              <Setting s={s} setS={setS} label="Top paying jobs (in percent)" setting='pay.top' xs={4} />
            </Grid>
          </AccordionDetails>
        </Accordion>
        <Accordion expanded={expanded === 'panel6'} onChange={handleChange('panel6')}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <BusinessIcon />&nbsp;<Typography>Airport filtering</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <SettingSlider2 s={s} setS={(s) => {s.airport = _clone(s.airport); setS(s)}} label="Airport size (combined length of all runways in meters)" setting='airport.size' xs={12} />
              <SettingSlider3 s={s} setS={(s) => {s.airport = _clone(s.airport); setS(s)}} label="Airport longest runway (in feet)" setting="airport.runway" xs={12} />
              <SettingSelect s={s} setS={(s) => {s.airport = _clone(s.airport); setS(s)}} label="Airport runway surface" setting="airport.surface" xs={12} />
              <SettingSwitch s={s} setS={(s) => {s.airport = _clone(s.airport); setS(s)}} label="Only display and use MSFS compatible airports" setting="airport.onlyMSFS" xs={12} />
            </Grid>
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
              props.setSettings(props.defaultSettings);
              setS(props.defaultSettings);
              // Save settings to local storage
              storage.set('settings', props.defaultSettings);
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