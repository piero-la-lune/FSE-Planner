import React from 'react';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';

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

function SurfacePicker(props) {
  return (
    <Box sx={{marginTop: 3}}>
      <TextField
        label="Airport surface"
        variant="outlined"
        fullWidth
        value={props.surface}
        select
        SelectProps={{multiple: true}}
        onChange={(evt) => {
          props.setSurface(evt.target.value);
        }}
      >
        { surfaceOptions.map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>) }
      </TextField>
    </Box>
  )
}

export default SurfacePicker;
