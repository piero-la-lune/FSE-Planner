import React from 'react';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Box from '@mui/material/Box';

function SizePicker(props) {
  const [min, setMin] = React.useState(0);
  const [max, setMax] = React.useState(23500);
  const [value, setValue] = React.useState(["1", "2", "3"]);
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
      setMax(3499);
    }
    else {
      setMax(999);
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
    <Box sx={{marginBottom: 3}}>
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
          size="small"
          sx={{
            maxWidth: 100,
            marginLeft: 3,
            marginTop: 1
          }}
        />
        <TextField
          label="Max size"
          variant="outlined"
          value={max}
          onChange={handleChangeMax}
          InputLabelProps={{
            shrink: true,
          }}
          size="small"
          sx={{
            maxWidth: 100,
            marginLeft: 3,
            marginTop: 1
          }}
        />
      </div>
    </Box>
  );
}

export default SizePicker;
