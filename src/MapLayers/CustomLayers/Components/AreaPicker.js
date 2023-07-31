import React from 'react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

import CustomAreaPopup from '../../../Popups/Components/CustomArea.js';

function AreaPicker(props) {
  const [open, setOpen] = React.useState(false);

  return (
    <Box sx={{marginBottom: 3}}>
      <Typography variant="body2">Restrict to geographical area:</Typography>
      {props.area ?
        <Box>
          <Button color="primary" variant="contained" onClick={() => setOpen(true)}>Edit</Button>
          <Button color="secondary" onClick={() => props.setArea(undefined)}>Reset</Button>
        </Box>
      :
        <Box>
          <Button color="primary" variant="contained" onClick={() => setOpen(true)}>Set area</Button>
        </Box>
      }
      <CustomAreaPopup
        open={open}
        handleClose={() => setOpen(false)}
        setArea={(latlngs) => {
          props.setArea(latlngs.map(elm => [elm.lat, elm.lng]));
        }}
        latlngs={props.area ? props.area.map(elm => { return {lat: elm[0], lng: elm[1]} }) : undefined}
        settings={props.settings}
      />
    </Box>
  );
}

export default AreaPicker;
