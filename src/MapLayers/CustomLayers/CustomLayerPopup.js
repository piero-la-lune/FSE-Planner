import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LocalAirportIcon from '@mui/icons-material/LocalAirport';
import RoomIcon from '@mui/icons-material/Room';
import ExpandCircleDownIcon from '@mui/icons-material/ExpandCircleDown';
import PeopleIcon from '@mui/icons-material/People';
import MenuItem from '@mui/material/MenuItem';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import { HexColorPicker, HexColorInput } from "react-colorful";

import Storage from '../../Storage.js';
import { apiHits } from "../../util/utility";
import CommunityPopup from './CommunityPopup.js';
import AreaPicker from './Components/AreaPicker.js';
import SizePicker from './Components/SizePicker.js';
import LengthPicker from './Components/LengthPicker.js';
import SurfacePicker from './Components/SurfacePicker.js';
import PricePicker from './Components/PricePicker.js';
import { usePapaParse } from 'react-papaparse';

const storage = new Storage();

function BtnBox ({selected, onClick, children}) {
  return (
    <Box
      sx={{
        width: 150,
        cursor: 'pointer',
        padding: 2,
        textAlign: 'center',
        transition: 'all .1s ease-in',
        '&:hover': {
          backgroundColor: selected ? 'primary.main' : 'rgba(63, 81, 181, 0.04)'
        },
        backgroundColor: selected ? 'primary.main' : null,
        color: selected ? '#fff' : 'primary.main',
        border: '1px solid',
        borderColor: 'primary.main',
        borderRadius: 1
      }}
      onClick={onClick}
    >
      {children}
    </Box>
  )
}

const styles = {
  divSwitch: {
    marginTop: 2
  },
  iconType: {
    fontSize: '3em'
  }
};


const sizes = [
  ['3', 'Very small'],
  ['8', 'Small'],
  ['13', 'Medium'],
  ['20', 'Large'],
  ['25', 'Very large']
];

const weights = [
  ['1', 'Very thin'],
  ['2', 'Thin'],
  ['3', 'Medium'],
  ['5', 'Thick'],
  ['10', 'Very thick']
]


function AirportIcon ({size, color}) {
  return <svg width={size} height={size} viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" fill={color}/><path d="M4.343,14.243 L14.642,3.944 L16.056,5.358 L5.757,15.657 L4.343,14.243 Z" fill="#fff"/></svg>
}


function CustomLayerPopup(props) {

  const { layer } = props;
  const [open, setOpen] = React.useState(props.open);
  const [type, setType] = React.useState(layer.type);
  const [name, setName] = React.useState(layer.display.name);
  const [desc, setDesc] = React.useState(layer.display.desc);
  const [color, setColor] = React.useState(layer.display.color);
  const [iconSize, setIconSize] = React.useState(layer.display.size);
  const [weight, setWeight] = React.useState(layer.display.weight ?? parseInt(weights[3][0]));
  const [size, setSize] = React.useState(layer.filters.size);
  const [length, setLength] = React.useState(layer.filters.runway);
  const [surface, setSurface] = React.useState(layer.filters.surface);
  const [onlySim, setOnlySim] = React.useState(layer.filters.onlySim);
  const [onlySimAlternative, setOnlySimAlternative] = React.useState(layer.filters.onlySimAlternative);
  const [onlyBM, setOnlyBM] = React.useState(layer.filters.onlyBM);
  const [onlyILS, setOnlyILS] = React.useState(layer.filters.onlyILS);
  const [excludeMilitary, setExcludeMilitary] = React.useState(layer.filters.excludeMilitary);
  const [price, setPrice] = React.useState(layer.filters.price);
  const [area, setArea] = React.useState(undefined);
  const [step, setStep] = React.useState(0);
  const [customIcaosVal, setCustomIcaosVal] = React.useState(layer.data.icaos.join("\n"));
  const [customConnectionsVal, setCustomConnectionsVal] = React.useState(layer.data.connections.map(elm => elm.join(' ')).join("\n"));
  const [customIcaos, setCustomIcaos] = React.useState(layer.data.icaos);
  const [customConnections, setCustomConnections] = React.useState(layer.data.connections);
  const [gpsPointsVal, setGpsPointsVal] = React.useState(layer.data.points.map(elm => elm.join(",")).join("\n"));
  const [gpsConnectionsVal, setGpsConnectionsVal] = React.useState(layer.data.connections.map(elm => elm.join(',')).join("\n"));
  const [gpsPoints, setGpsPoints] = React.useState(layer.data.points);
  const [gpsConnections, setGpsConnections] = React.useState(layer.data.connections);
  const [key, setKey] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const { readString } = usePapaParse();

  React.useEffect(() => {
    if (props.open) {
      if (props.layer.type === null) {
        setStep(0);
      }
      else if (['custom', 'gps', 'community'].includes(props.layer.type)) {
        setStep(1);
      }
      else {
        setStep(2);
      }
      setType(props.layer.type);
      setName(props.layer.display.name);
      setDesc(props.layer.display.desc);
      setColor(props.layer.display.color);
      setIconSize(props.layer.display.size);
      setWeight(props.layer.display.weight ?? parseInt(weights[3][0]));
      setSize(props.layer.filters.size);
      setLength(props.layer.filters.runway);
      setSurface(props.layer.filters.surface);
      setOnlySim(props.layer.filters.onlySim);
      setOnlySimAlternative(props.layer.filters.onlySimAlternative);
      setOnlyBM(props.layer.filters.onlyBM);
      setOnlyILS(props.layer.filters.onlyILS);
      setExcludeMilitary(props.layer.filters.excludeMilitary);
      setPrice(props.layer.filters.price);
      setArea(props.layer.filters.area);
      setCustomIcaos(props.layer.data.icaos);
      setCustomIcaosVal(props.layer.data.icaos.join("\n"));
      setCustomConnections(props.layer.data.connections);
      setCustomConnectionsVal(props.layer.data.connections.map(elm => elm.join(' ')).join("\n"));
      setGpsPointsVal(props.layer.data.points.map(elm => elm.join(",")).join("\n"));
      setGpsConnectionsVal(props.layer.data.connections.map(elm => elm.join(',')).join("\n"));
      setGpsPoints(props.layer.data.points);
      setGpsConnections(props.layer.data.connections);
      setKey('');
      setOpen(true);
    }
    else {
      setOpen(false);
    }
  }, [props.open, props.layer]);

  // When clicking the next button
  const handleNext = () => {
    if (step === 0) {
      // Change default layer name
      if (type === 'forsale') {
        setName('FBOs for sale');
      }
      else if (type === 'unbuilt') {
        setName('FBOs with unbuilt lots');
      }
      // Skip Step 1 if type is not "custom" or "gps"
      if (['custom', 'gps', 'community'].includes(type)) { setStep(1); }
      else { setStep(2); }
    }
    else if (step === 1) {
      // If custom, check and clean inputs to keep only valid FSE icaos
      if (type === 'custom') {
        const elms = customIcaosVal.toUpperCase().split(/[ ,\n\t]+/);
        // Keep only valid FSE ICAOs
        const icaos = [...new Set(elms.filter(elm => props.icaos.includes(elm)))];
        setCustomIcaos(icaos);
        const arr = customConnectionsVal.toUpperCase().split(/\n+/);
        const connections = [];
        // Keep only valid connections
        for (const elm of arr) {
          const c = elm.split(/[ ,\t]+/);
          if (c.length === 2 && icaos.includes(c[0]) && icaos.includes(c[1])) {
            connections.push([c[0], c[1]]);
          }
        }
        setCustomConnections(connections);
        setStep(2);
      }
      // Of GPS, check GPS data inputs
      else {
        const elms = gpsPointsVal.split(/\n+/);
        const points = [];
        // Keep only valid GPS points
        for (const elm of elms) {
          const arr = elm.split(/[,\t]/);
          if (arr.length < 2) { continue; }
          const latitude = parseFloat(arr[0]);
          const longitude = parseFloat(arr[1]);
          if (isNaN(latitude) || latitude < -90 || latitude > 90 ||
              isNaN(longitude) || longitude < -180 || longitude > 180) { continue; }
          const label = arr.length === 3 ? arr[2] : 'Point #'+points.length
          points.push([latitude, longitude, label]);
        }
        setGpsPoints(points);
        const arr = gpsConnectionsVal.toUpperCase().split(/\n+/);
        const connections = [];
        // Keep only valids connections
        for (const elm of arr) {
          const c = elm.split(/[ ,\t]+/);
          if (c.length !== 2) { continue; }
          const fr = parseInt(c[0]);
          const to = parseInt(c[1]);
          if (isNaN(fr) || fr < 0 || fr >= points.length || isNaN(to) || to < 0 || to >= points.length) { continue; }
          connections.push([fr, to]);
        }
        setGpsConnections(connections);
        // Skip step 2
        setStep(3);
      }
    }
    else if (step === 2) { setStep(3); }
    else {
      props.handleSave(
        {
          type: type,
          filters: {
            size: size,
            surface: surface,
            runway: length,
            onlySim: onlySim,
            onlySimAlternative: onlySimAlternative,
            onlyBM: onlyBM,
            onlyILS: onlyILS,
            excludeMilitary: excludeMilitary,
            price: price,
            area: area
          },
          display: {
            name: name,
            color: color,
            size: iconSize,
            weight: weight,
            desc: desc
          },
          data: {
            icaos: customIcaos,
            connections: type === 'gps' ? gpsConnections : customConnections,
            points: gpsPoints,
          }
        }
      );
    }
  }

  // When loading user FBOs from a read access key
  const loadUserFBOs = () => {
    setLoading(true);
    const userkey = storage.get('key', '');
    if (!userkey) {
      alert('You need to first enter your Read Access Key in the "Load Data" screen');
      setLoading(false);
    }
    const url = 'data?userkey='+userkey+'&format=csv&query=Facilities&search=key&readaccesskey='+key;
    // Fetch facilities
    fetch(process.env.REACT_APP_PROXY+url)
    .then(function(response) {
      if (!response.ok) {
        throw new Error('An error occurred, please check the key and/or try again later');
      }
      return response.text();
    })
    .then(function(csv) {
      // Parse CSV
      const parse = readString(csv, {header: true, skipEmptyLines: 'greedy'});
      if (parse.errors.length > 0) {
        const found = csv.match(/<Error>(.*)<\/Error>/i);
        throw new Error(found === null ? 'An error occurred, please check the key and/or try again later' : found[1]);
      }
      const icaos = [];
      const conn = new Set();
      for (const obj of parse.data) {
        icaos.push(obj.Icao);
        const destinations = obj.Destinations.split(', ');
        for (const dest of destinations) {
          conn.add(obj.Icao + ' ' + dest);
          conn.add(dest + ' ' + obj.Icao);
        }
      }
      setCustomIcaosVal(icaos.join("\n"));
      setCustomConnectionsVal([...conn].join("\n"));
      setLoading(false);
    })
    .catch(function(error) {
      alert(error);
      setLoading(false);
    })
    .finally(() => {
      apiHits()
    });
  }

  // When importing a community layer
  const handleImport = (e) => {
    props.handleSave(e.info);
  }

  // Stop event propagation when clicking the color picker
  const stopPropagation = (e) => {
    e.stopPropagation();
    return false;
  }

  return (
    <Dialog open={open} fullWidth={true} maxWidth="md">
      <DialogTitle>
        { step === 0 && 'Select layer type' }
        { step === 1 && 'Step 1: Import data' }
        { step === 2 && 'Step 2: Filters' }
        { step === 3 && 'Step 3: Display options' }
      </DialogTitle>
      <DialogContent dividers sx={{paddingTop: 3}}>
        { step === 0 &&
          <Box>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                gap: 2
              }}
            >
              <BtnBox selected={['all', 'unbuilt', 'forsale', 'custom'].includes(type)} onClick={() => setType('all')}>
                <LocalAirportIcon sx={styles.iconType} />
                <Typography variant="body1">FSE Airports</Typography>
              </BtnBox>
              <BtnBox selected={type === 'gps'} onClick={() => setType('gps')}>
                <RoomIcon sx={styles.iconType} />
                <Typography variant="body1">GPS coordinates</Typography>
              </BtnBox>
              <BtnBox selected={type === 'community'} onClick={() => setType('community')}>
                <PeopleIcon sx={styles.iconType} />
                <Typography variant="body1">Community layers</Typography>
              </BtnBox>
            </Box>
            { ['all', 'unbuilt', 'forsale', 'custom'].includes(type) &&
              <Box
                sx={{
                  width: '100%',
                  maxWidth: 584,
                  border: '1px solid',
                  borderColor: 'primary.main',
                  borderRadius: 1,
                  padding: 2,
                  mx: 'auto',
                  mt: 1,
                  boxSizing: 'border-box'
                }}>
                <RadioGroup
                  value={type}
                  onChange={e => setType(e.target.value)}
                >
                  <FormControlLabel value="all" control={<Radio />} label="All FSE airports" />
                  <FormControlLabel value="unbuilt" control={<Radio />} label="FBOs with unbuilt lots*" />
                  <FormControlLabel value="forsale" control={<Radio />} label="FBOs for sale*" />
                  <FormControlLabel value="custom" control={<Radio />} label="Owned FBOs or manual list" />
                </RadioGroup>
                <Typography
                  variant="body2"
                  sx={{
                    fontStyle: 'italic',
                    color: 'rgba(0, 0, 0, 0.54)',
                    marginTop: 2
                  }}
                >
                  *Data is updated every 6 hours (02:00, 08:00, 14:00 and 20:00 GMT).
                </Typography>
              </Box>
            }
          </Box>
        }
        { step === 1 && type === 'community' &&
          <CommunityPopup
            handleCancel={props.handleCancel}
            handleImport={handleImport}
          />
        }
        { step === 1 && type === 'gps' &&
          <Box>
            <Grid container spacing={3}>
              <Grid item xs={6}>
                <Typography variant="h6">GPS points</Typography>
                <Typography variant="body2">Enter in the field below the GPS points you would like to display on the map. For each point, you need to specify its latitude, its longitude, and an optional label.</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="h6">Connections</Typography>
                <Typography variant="body2">Enter in the field below the connections between two GPS points you would like to display on the map (to draw a route). Only IDs (first GPS point has ID 0, second has ID 1, etc.) of GPS points specified on the left field are accepted.</Typography>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="GPS points"
                  multiline
                  rows={8}
                  variant="outlined"
                  fullWidth
                  placeholder="35.092,-106.655,Albuquerque
33.459,-112.082,Phoenix
36.164,-115.169,Las Vegas
[...]"
                  helperText="One GPS point per line with the CSV format (coma or tab separator): latitude, longitude, label."
                  value={gpsPointsVal}
                  onChange={(evt) => {
                    setGpsPointsVal(evt.target.value);
                  }}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="List of connections"
                  multiline
                  rows={8}
                  variant="outlined"
                  fullWidth
                  placeholder="0 1
1 2
[...]"
                  helperText="One connection per line. Each line must contain the starting ID and arrival ID separated by a white space or coma"
                  value={gpsConnectionsVal}
                  onChange={(evt) => {
                    setGpsConnectionsVal(evt.target.value);
                  }}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </Box>
        }
        { step === 1 && type === "custom" &&
          <Box>
            <Typography variant="body1">
              Either enter a group/user Read Access Key to automatically import all FBOs belonging to this group/user, or manually enter the ICAOs in the text fields below.
            </Typography>
            <Box sx={{mt: 3, mb: 3, display: 'flex', justifyContent: 'center'}}>
              <TextField
                label="Read Access Key (user or group)"
                variant="outlined"
                size="small"
                placeholder="key"
                value={key}
                onChange={(evt) => {
                  setKey(evt.target.value);
                }}
                InputLabelProps={{ shrink: true }}
              />
              <Button
                onClick={loadUserFBOs}
                color="primary"
                endIcon={<ExpandCircleDownIcon />}
                sx={{ ml: 1 }}
                disabled={!key || loading}
              >
                Auto fill
              </Button>
            </Box>
            <Grid container spacing={3}>
              <Grid item xs={6}>
                <Typography variant="h6">FSE Airports</Typography>
                <Typography variant="body2">Enter in the field below the airport ICAOs you would like to display on the map. Only valid FSE ICAOs are accepted.</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="h6">Connections</Typography>
                <Typography variant="body2">Enter in the field below the connections between two airports you would like to display on the map (to draw a route or a FBO network for instance). Only valid FSE ICAOs are accepted.</Typography>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="List of FSE ICAOs"
                  multiline
                  rows={8}
                  variant="outlined"
                  fullWidth
                  placeholder="LFLY
LFPO
EGLL
[...]"
                  helperText="ICAOs can be seperated by a white space, a coma or a new line."
                  value={customIcaosVal}
                  onChange={(evt) => {
                    setCustomIcaosVal(evt.target.value);
                  }}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="List of connections"
                  multiline
                  rows={8}
                  variant="outlined"
                  fullWidth
                  placeholder="EGLL LFLY
EGLL LFPO
[...]"
                  helperText="One connection per line. Each line must contain the starting and arrival ICAO, separated by a white space or coma"
                  value={customConnectionsVal}
                  onChange={(evt) => {
                    setCustomConnectionsVal(evt.target.value);
                  }}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </Box>
        }
        { step === 2 &&
          <Box>
            <AreaPicker area={area} setArea={setArea} settings={props.settings} />
            { type === 'forsale' && <PricePicker price={price} setPrice={setPrice} />}
            <SizePicker size={size} setSize={setSize} />
            <LengthPicker length={length} setLength={setLength} />
            <SurfacePicker surface={surface} setSurface={setSurface} />
            <Box sx={styles.divSwitch}>
              <FormControlLabel
                control={
                  <Switch
                    checked={onlySim}
                    onChange={(evt, value) => { setOnlySim(value); }}
                    color="primary"
                  />
                }
                label="Only display simulator compatible airports"
              />
            </Box>
            <Box sx={styles.divSwitch}>
              <FormControlLabel
                control={
                  <Switch
                    checked={onlySimAlternative}
                    onChange={(evt, value) => { setOnlySimAlternative(value); }}
                    color="primary"
                    disabled={!onlySim}
                  />
                }
                label="Include non-compatible airports that have at least one alternative in your simulator"
              />
            </Box>
            <Box sx={styles.divSwitch}>
              <FormControlLabel
                control={
                  <Switch
                    checked={onlyBM}
                    onChange={(evt, value) => { setOnlyBM(value); }}
                    color="primary"
                  />
                }
                label="Only display airports that sell building materials"
              />
            </Box>
            <Box sx={styles.divSwitch}>
              <FormControlLabel
                control={
                  <Switch
                    checked={onlyILS}
                    onChange={(evt, value) => { setOnlyILS(value); }}
                    color="primary"
                  />
                }
                label="Only display airports with an ILS approach (MSFS)"
              />
            </Box>
            <Box sx={styles.divSwitch}>
              <FormControlLabel
                control={
                  <Switch
                    checked={excludeMilitary}
                    onChange={(evt, value) => { setExcludeMilitary(value); }}
                    color="primary"
                  />
                }
                label="Exclude military airbases"
              />
            </Box>
          </Box>
        }
        { step === 3 &&
          <Box>
            <TextField
              autoFocus
              variant="outlined"
              label="Layer name"
              value={name}
              onChange={evt => setName(evt.target.value)}
              fullWidth
              inputProps={{ maxLength: 60 }}
            />
            <Box sx={{ display: 'flex', mt: 3, alignItems: 'center' }}>
              <TextField
                label="Icon color"
                variant="outlined"
                select
                sx={{ width: 234, minWidth: 234 }}
                SelectProps={{
                  renderValue: value => <Box sx={{ backgroundColor: color, color: color }}>{color}</Box>,
                  displayEmpty: true,
                  MenuProps: {
                    sx: {
                      '& .MuiPaper-root': {
                        border: '1px solid #ccc',
                        padding: 2,
                        boxSizing: 'border-box'
                      },
                      '& .MuiList-root': {
                        padding: 0
                      },
                      '& input': {
                        font: 'inherit',
                        letterSpacing: 'inherit',
                        color: 'inherit',
                        border: '1px solid',
                        borderColor: 'rgba(0, 0, 0, 0.23)',
                        borderRadius: '4px',
                        paddingX: 2,
                        paddingY: 1,
                        marginRight: 1,
                        flex: 1,
                        minWidth: 0,
                      },
                      '& input:hover': {
                        borderColor: 'rgba(0, 0, 0, 0.87)'
                      },
                      '& input:focus': {
                        outline: '2px solid',
                        outlineColor: (theme) => theme.palette.primary.main,
                        borderColor: '#fff'
                      }
                    }
                  }
                }}
                InputLabelProps={{
                  shrink: true
                }}
              >
                <HexColorPicker color={color} onChange={setColor} />
                <Box
                  onClick={stopPropagation}
                  sx={{
                    marginTop: 2,
                    display: 'flex'
                  }}
                >
                  <HexColorInput color={color} onChange={setColor} onClick={stopPropagation} />
                  <Button variant="contained" sx={{flex: '0 1 auto'}}>Ok</Button>
                </Box>
              </TextField>
              <TextField
                label="Icon size"
                variant="outlined"
                fullWidth
                value={iconSize}
                select
                sx={{ ml: 2 }}
                onChange={(evt) => {
                  setIconSize(parseInt(evt.target.value));
                }}
              >
                { sizes.map(([value, label]) =>
                  <MenuItem
                    key={value}
                    value={value}
                  >
                    <Box sx={{ display: 'flex' }}>
                      <Box sx={{ mr: 1, display: 'flex', alignItems: 'center', maxHeight: 20, overflow: 'visible' }}>
                        <AirportIcon size={value} color={color} />
                      </Box>
                      {label}
                    </Box>
                  </MenuItem>
                ) }
              </TextField>
              <TextField
                label="Line thickness"
                variant="outlined"
                fullWidth
                value={weight}
                select
                sx={{ ml: 2 }}
                onChange={(evt) => {
                  setWeight(parseInt(evt.target.value));
                }}
              >
                { weights.map(([value, label]) =>
                  <MenuItem
                    key={value}
                    value={value}
                  >
                    <Box sx={{ display: 'flex' }}>
                      <Box sx={{ mr: 1, display: 'flex', alignItems: 'center', maxHeight: 20, overflow: 'visible' }}>
                        <Box sx={{
                          background: color,
                          height: value+'px',
                          width: 30
                        }} />
                      </Box>
                      {label}
                    </Box>
                  </MenuItem>
                ) }
              </TextField>
            </Box>
            <TextField
              variant="outlined"
              label="Description"
              value={desc}
              onChange={evt => setDesc(evt.target.value)}
              fullWidth
              inputProps={{ maxLength: 3000 }}
              multiline
              rows={6}
              sx={{ mt: 3 }}
            />
          </Box>
        }
      </DialogContent>
      <DialogActions>
        <Button
          onClick={props.handleCancel}
          color="secondary"
        >
          Cancel
        </Button>
        <Button
          onClick={handleNext}
          color="primary"
          variant="contained"
          disabled={step === 0 && type === null}
        >
          { step < 3 ? "Next" : "Save" }
        </Button>
      </DialogActions>
    </Dialog>
  );

}

export default CustomLayerPopup;
