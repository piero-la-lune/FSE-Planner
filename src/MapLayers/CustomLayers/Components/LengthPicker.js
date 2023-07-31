import React from 'react';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';
import Box from '@mui/material/Box';

function LengthPicker(props) {
  const computeVal = val => val > 15000 ? 15000 : val;
  const inverseVal = val => val === 15000 ? 30000 : val;
  return (
    <Box sx={{marginBottom: 3}}>
      <Typography variant="body2">Airport longest runway (in feet):</Typography>
      <Box sx={{margin: '0 20px'}}>
        <Slider
          min={0}
          max={15000}
          value={[computeVal(props.length[0]), computeVal(props.length[1])]}
          valueLabelFormat={inverseVal}
          valueLabelDisplay="auto"
          onChange={(evt, value) => props.setLength([inverseVal(value[0]), inverseVal(value[1])])}
          marks={[{value: 5000, label: '5000 feet'}, {value: 10000, label: '10000 feet'}, {value: 15000, label: 'no limit'}]}
        />
      </Box>
    </Box>
  );
}

export default LengthPicker;
