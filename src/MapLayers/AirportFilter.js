import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import LocalAirportIcon from '@material-ui/icons/LocalAirport';
import AttachMoneyIcon from '@material-ui/icons/AttachMoney';
import BusinessIcon from '@material-ui/icons/Business';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import Slider from '@material-ui/core/Slider';
import MenuItem from '@material-ui/core/MenuItem';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import { makeStyles } from '@material-ui/core/styles';

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

const sizePickerStyles = makeStyles(theme => ({
  input: {
    maxWidth: 100,
    marginLeft: theme.spacing(3)
  }
}));

function SizePicker(props) {
  const [min, setMin] = React.useState(0);
  const [max, setMax] = React.useState(23500);
  const [value, setValue] = React.useState(["1", "2", "3"]);
  const classes = sizePickerStyles();
  const { size, setSize } = props;

  const handleChange = (evt, newValue) => {
    if (!newValue.length) {
      setMin(23500);
      setMax(23500);
      setValue([]);
      return;
    }
    if (newValue.includes("1") && newValue.includes("3") && !newValue.includes("2")) {
      if (value.length === 3) {
        setMin(3500);
        setMax(23500);
        setValue(["3"]);
      }
      else {
        setMin(0);
        setMax(23500);
        setValue(["1", "2", "3"]);
      }
      return;
    }
    if (newValue.includes("1")) {
      setMin(0);
    }
    else if (newValue.includes("2")) {
      setMin(1000);
    }
    else {
      setMin(3500);
    }
    if (newValue.includes("3")) {
      setMax(23500);
    }
    else if (newValue.includes("2")) {
      setMax(3500);
    }
    else {
      setMax(1000);
    }
    setValue(newValue);
  };
  const computeValue = (min, max) => {
    let arr = [];
    if (min < 1000 && max > 1) {
      arr.push("1");
    }
    if (min < 3500 && max >= 1000) {
      arr.push("2");
    }
    if (min < 23500 && max >= 3500) {
      arr.push("3");
    }
    return arr;
  }
  const handleChangeMin = (evt) => {
    let val = evt.target.value.replace(/[^0-9]/g, '');
    if (val !== "") {
      val = parseInt(val);
    }
    else { 
      val = 0;
    }
    setValue(computeValue(val, max));
    setMin(val);
  }
  const handleChangeMax = (evt) => {
    let val = evt.target.value.replace(/[^0-9]/g, '');
    if (val !== "") {
      val = parseInt(val);
    }
    else { 
      val = 0;
    }
    setValue(computeValue(min, val));
    setMax(val);
  }
  React.useEffect(() => {
    setSize([min, max]);
  }, [min, max, setSize]);
  React.useState(() => {
    setMin(size[0]);
    setMax(size[1]);
    setValue(computeValue(size[0], size[1]));
  }, [size]);

  return (
    <div>
      <Typography variant="body2">Airport size (combined length of all runways in meters):</Typography>
      <div>
        <ToggleButtonGroup value={value} onChange={handleChange} >
          <ToggleButton value="1">
            1 lot
          </ToggleButton>
          <ToggleButton value="2">
            2 lots
          </ToggleButton>
          <ToggleButton value="3">
            3 lots
          </ToggleButton>
        </ToggleButtonGroup>
        <TextField
          label="Min size"
          variant="outlined"
          value={min}
          onChange={handleChangeMin}
          InputLabelProps={{
            shrink: true,
          }}
          margin="dense"
          className={classes.input}
        />
        <TextField
          label="Max size"
          variant="outlined"
          value={max}
          onChange={handleChangeMax}
          InputLabelProps={{
            shrink: true,
          }}
          margin="dense"
          className={classes.input}
        />
      </div>
    </div>
  );
}

const lengthPickerStyles = makeStyles(theme => ({
  div: {
    marginTop: theme.spacing(3)
  },
  input: {
    margin: '0 20px'
  }
}));

function LengthPicker(props) {
  const classes = lengthPickerStyles();
  const computeVal = val => val > 15000 ? 15000 : val;
  const inverseVal = val => val === 15000 ? 30000 : val;
  return (
    <div className={classes.div}>
      <Typography variant="body2">Airport longest runway (in feet):</Typography>
      <div className={classes.input}>
        <Slider
          min={0}
          max={15000}
          value={[computeVal(props.length[0]), computeVal(props.length[1])]}
          valueLabelFormat={inverseVal}
          valueLabelDisplay="auto"
          onChange={(evt, value) => props.setLength([inverseVal(value[0]), inverseVal(value[1])])}
          marks={[{value: 5000, label: '5000 feet'}, {value: 10000, label: '10000 feet'}, {value: 15000, label: 'no limit'}]}
        />
      </div>
    </div>
  );
}

const surfacePickerStyles = makeStyles(theme => ({
  div: {
    marginTop: theme.spacing(3)
  }
}));

function SurfacePicker(props) {
  const classes = surfacePickerStyles();
  return (
    <div className={classes.div}>
      <TextField
        label="Airport surface"
        variant="outlined"
        fullWidth
        margin="dense"
        value={props.surface}
        select
        SelectProps={{multiple: true}}
        onChange={(evt) => {
          props.setSurface(evt.target.value);
        }}
      >
        { surfaceOptions.map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>) }
      </TextField>
    </div>
  )
}

const pricePickerStyles = makeStyles(theme => ({
  div: {
    marginBottom: theme.spacing(3)
  },
  input: {
    maxWidth: 150,
    marginRight: theme.spacing(3)
  }
}));

function PricePicker(props) {
  const classes = pricePickerStyles();
  return (
    <div className={classes.div}>
      <Typography variant="body2">Price range:</Typography>
      <div>
        <TextField
          label="Min price"
          variant="outlined"
          value={props.price[0] ? props.price[0] : ''}
          onChange={evt => {
            props.setPrice([parseInt(evt.target.value) || 0, props.price[1]]);
          }}
          InputLabelProps={{
            shrink: true,
          }}
          margin="dense"
          className={classes.input}
        />
        <TextField
          label="Max price"
          variant="outlined"
          value={props.price[1] ? props.price[1] : ''}
          onChange={evt => {
            props.setPrice([props.price[0], parseInt(evt.target.value) || 0]);
          }}
          InputLabelProps={{
            shrink: true,
          }}
          margin="dense"
          className={classes.input}
        />
      </div>
    </div>
  )
}

const useStyles = makeStyles(theme => ({
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
  popup: {

  },
  dialog: {
    paddingTop: theme.spacing(3)
  },
  divPickType: {
    display: 'flex',
    justifyContent: 'center',
    gap: 24
  },
  divType: {
    width: 150,
    cursor: 'pointer',
    padding: theme.spacing(2),
    textAlign: 'center',
    transition: 'all .1s ease-in',
    '&:hover': {
      background: '#eee'
    }
  },
  divSwitch: {
    marginTop: theme.spacing(2)
  },
  iconType: {
    fontSize: '3em'
  },
  inputIconSize: {
    marginTop: theme.spacing(3)
  },
  color: {
    color: '#fff',
    padding: '2px 8px'
  }
}));


const sizes = [
  ['3', 'Very small'],
  ['8', 'Small'],
  ['13', 'Medium'],
  ['20', 'Large'],
  ['25', 'Very large']
];

const colors = [
  '#c0392b',
  '#8e44ad',
  '#2980b9',
  '#1abc9c',
  '#229954',
  '#d4ac0d',
  '#d68910',
  '#ba4a00',
  '#a6acaf',
  '#707b7c',
  '#273746'
];


function AirportFilter(props) {

  const classes = useStyles();
  const { layer } = props;
  const [type, setType] = React.useState(layer.type);
  const [name, setName] = React.useState(layer.display.name);
  const [color, setColor] = React.useState(layer.display.color);
  const [iconSize, setIconSize] = React.useState(layer.display.size);
  const [size, setSize] = React.useState(layer.filters.size);
  const [length, setLength] = React.useState(layer.filters.runway);
  const [surface, setSurface] = React.useState(layer.filters.surface);
  const [onlySim, setOnlySim] = React.useState(layer.filters.onlySim);
  const [onlyBM, setOnlyBM] = React.useState(layer.filters.onlyBM);
  const [onlyILS, setOnlyILS] = React.useState(layer.filters.onlyILS);
  const [price, setPrice] = React.useState(layer.filters.price);
  const [step, setStep] = React.useState(layer.type ? 1 : 0);

  React.useEffect(() => {
    if (type !== null && step === 0) {
      setStep(1);
      if (name === 'My custom layer') {
        if (type === 'forsale') {
          setName('FBOs for sale');
        }
        else if (type === 'unbuilt') {
          setName('FBOs with unbuilt lots');
        }
      }
    }
  }, [type, name, step]);

  React.useEffect(() => {
    if (props.open) {
      setStep(props.layer.type ? 1 : 0);
      setType(props.layer.type);
      setName(props.layer.display.name);
      setColor(props.layer.display.color);
      setIconSize(props.layer.display.size);
      setSize(props.layer.filters.size);
      setLength(props.layer.filters.runway);
      setSurface(props.layer.filters.surface);
      setOnlySim(props.layer.filters.onlySim);
      setOnlyBM(props.layer.filters.onlyBM);
      setOnlyILS(props.layer.filters.onlyILS);
      setPrice(props.layer.filters.price);
    }
  }, [props.open, props.layer]);

  return (
    <Dialog open={props.open} fullWidth={true} maxWidth="md" classes={{paper: classes.popup}}>
      <DialogTitle>
        { step === 0 && 'Step 1: Layer type' }
        { step === 1 && 'Step 2: Filters' }
        { step === 2 && 'Step 3: Display options' }
      </DialogTitle>
      <DialogContent dividers className={classes.dialog}>
        { step === 0 &&
          <div>
            <DialogContentText>Choose the type of layer:</DialogContentText>
            <div className={classes.divPickType}>
              <Paper className={classes.divType} onClick={() => setType('all')}>
                <LocalAirportIcon className={classes.iconType} />
                <Typography variant="body1">All airports</Typography>
              </Paper>
              <Paper className={classes.divType} onClick={() => setType('forsale')}>
                <AttachMoneyIcon className={classes.iconType} />
                <Typography variant="body1">Airports with FBOs for sale</Typography>
              </Paper>
              <Paper className={classes.divType} onClick={() => setType('unbuilt')}>
                <BusinessIcon className={classes.iconType} />
                <Typography variant="body1">Airports with unbuilt FBO lots</Typography>
              </Paper>
            </div>
          </div>
        }
        { step === 1 &&
          <div>
            { type === 'forsale' && <PricePicker price={price} setPrice={setPrice} />}
            <SizePicker size={size} setSize={setSize} />
            <LengthPicker length={length} setLength={setLength} />
            <SurfacePicker surface={surface} setSurface={setSurface} />
            <div className={classes.divSwitch}>
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
            </div>
            <div className={classes.divSwitch}>
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
            </div>
            <div className={classes.divSwitch}>
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
            </div>
          </div>
        }
        { step === 2 &&
          <div>
            <TextField
              autoFocus
              margin="dense"
              variant="outlined"
              label="Layer name"
              value={name}
              onChange={evt => setName(evt.target.value)}
              fullWidth
            />
            <TextField
              label="Icon size"
              variant="outlined"
              fullWidth
              margin="dense"
              value={iconSize}
              select
              className={classes.inputIconSize}
              onChange={(evt) => {
                setIconSize(parseInt(evt.target.value));
              }}
            >
              { sizes.map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>) }
            </TextField>
            <TextField
              label="Icon color"
              variant="outlined"
              fullWidth
              margin="dense"
              value={color}
              select
              className={classes.inputIconSize}
              onChange={(evt) => {
                setColor(evt.target.value);
              }}
            >
              { colors.map(elm => <MenuItem key={elm} value={elm}><span className={classes.color} style={{backgroundColor:elm}}>{elm}</span></MenuItem>) }
            </TextField>
          </div>
        }
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            props.handleCancel();
          }}
          color="secondary"
        >
          Cancel
        </Button>
        <Button
          onClick={() => {
            if (step < 2) { setStep(step+1); }
            else {
              props.handleSave(
                {
                  type: type,
                  filters: {
                    size: size,
                    surface: surface,
                    runway: length,
                    onlySim: onlySim,
                    onlyBM: onlyBM,
                    onlyILS: onlyILS,
                    price: price
                  },
                  display: {
                    name: name,
                    color: color,
                    size: iconSize
                  }
                }
              );
            }
          }}
          color="primary"
          variant="contained"
          disabled={step === 0}
        >
          { step < 2 ? "Next" : "Save" }
        </Button>
      </DialogActions>
    </Dialog>
  );

}

export default AirportFilter;