import React from 'react';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

function PricePicker(props) {
  return (
    <Box sx={{marginBottom: 3}}>
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
          size="small"
          sx={{
            maxWidth: 150,
            marginRight: 3,
            marginTop: 1
          }}
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
          size="small"
          sx={{
            maxWidth: 150,
            marginRight: 3,
            marginTop: 1
          }}
        />
      </div>
    </Box>
  )
}

export default PricePicker;
