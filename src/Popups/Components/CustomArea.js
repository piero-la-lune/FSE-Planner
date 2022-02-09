import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import CloseIcon from '@mui/icons-material/Close';
import L from "leaflet";
import "leaflet-path-transform";


function Map({mapCenter, bounds, setBounds}) {

  const mapRef = React.useRef(null);
  const rectangleRef = React.useRef(null);

  // Initialize map and center on bounds
  React.useEffect(() => {
    const newBounds = bounds || L.latLngBounds([[51.310, 8.496], [42.200, -5.065]]);
    setBounds(newBounds);
    if (!mapRef.current) {
      // Create map
      mapRef.current = L.map('customArea', {
        minZoom: 3,
        bounds: newBounds,
        boundsOptions: { animate:false },
        attributionControl: false,
      });
      mapRef.current.fitBounds(newBounds);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapRef.current);
      // Create draggable and resizable rectangle
      rectangleRef.current = L.rectangle(newBounds, {transform: true, draggable: true});
      rectangleRef.current.addTo(mapRef.current);
      rectangleRef.current.transform.enable({rotation: false, scaling: true, uniformScaling: false});
      rectangleRef.current.dragging.enable();
      rectangleRef.current.on('transformed', () => setBounds(rectangleRef.current.getBounds()));
    }
    else {
      mapRef.current.fitBounds(newBounds);
      rectangleRef.current.setBounds(newBounds);
    }
  }, [bounds, setBounds]);

  // Update max bounds
  React.useEffect(() => {
    mapRef.current.setMaxBounds([[-90, mapCenter-180], [90, mapCenter+180]]);
  }, [mapCenter]);

  return (<div id="customArea"></div>);
}



function CustomAreaPopup(props) {

  const [bounds, setBounds] = React.useState(null);

  return (
    <Dialog
      onClose={props.handleClose}
      open={props.open}
      fullWidth={true}
      maxWidth="lg"
      sx={{
        '& .MuiPaper-root': {
          height: '90vh'
        }
      }}
    >
      <DialogTitle>
        Select custom area
        <IconButton
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'grey[500]',
          }}
          onClick={props.handleClose}
          size="large"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ display: 'flex' }}>
        <Map
          mapCenter={props.settings.display.map.center}
          bounds={props.bounds}
          setBounds={setBounds}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={props.handleClose} color="primary">
          Cancel
        </Button>
        <Button onClick={() => {props.setArea(bounds); props.handleClose();}} color="primary" variant="contained">
          Add selected area
        </Button>
      </DialogActions>
    </Dialog>
  );

}

export default CustomAreaPopup;
