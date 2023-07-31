import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import DialogContentText from '@mui/material/DialogContentText';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import CloseIcon from '@mui/icons-material/Close';
import L from "leaflet";

import "@geoman-io/leaflet-geoman-free";
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
L.PM.setOptIn(true);

function Map({mapCenter, latlngs, setLatlngs}) {

  const mapRef = React.useRef(null);
  const rectangleRef = React.useRef(null);

  // Initialize map and center on bounds
  React.useEffect(() => {
    const newlatlngs = latlngs || [{lat:51.310, lng:8.496}, {lat:42.200, lng:8.496}, {lat:42.200, lng:-5.065}, {lat:51.310, lng:-5.065}];
    setLatlngs(newlatlngs);
    if (!mapRef.current) {
      // Create map
      mapRef.current = L.map('customArea', {
        minZoom: 3,
        bounds: L.polygon(newlatlngs).getBounds(),
        boundsOptions: { animate: false },
        attributionControl: false,
        pmIgnore: false
      });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapRef.current);
      // Create draggable and resizable rectangle
      rectangleRef.current = L.polygon(newlatlngs, { pmIgnore: false });
      rectangleRef.current.addTo(mapRef.current);
      // Does not work right away. Why?
      setTimeout(() => {
        rectangleRef.current.pm.enableLayerDrag();
        rectangleRef.current.pm.enable({
          allowSelfIntersection: false,
          removeVertexValidation: (layer) => rectangleRef.current.getLatLngs()[0].length > 3
        });
      }, 300);
      //rectangleRef.current.pm.enable({ hideMiddleMarkers: true, preventMarkerRemoval: true });
      rectangleRef.current.on('pm:markerdragend', () => setLatlngs(rectangleRef.current.getLatLngs()[0]));
      rectangleRef.current.on('pm:dragend', () => setLatlngs(rectangleRef.current.getLatLngs()[0]));
      rectangleRef.current.on('pm:drag', () => {
        rectangleRef.current.pm._initMarkers();
        rectangleRef.current.pm.applyOptions();
      });
      mapRef.current.fitBounds(rectangleRef.current.getBounds());
    }
    else {
      rectangleRef.current.setLatLngs(newlatlngs);
      mapRef.current.fitBounds(rectangleRef.current.getBounds());
    }
  }, [latlngs, setLatlngs]);

  // Update max bounds
  React.useEffect(() => {
    mapRef.current.setMaxBounds([[-90, mapCenter-180], [90, mapCenter+180]]);
  }, [mapCenter]);

  return (<div id="customArea"></div>);
}


function Plus(props) {
  return (
    <Box
      sx={{
        display: 'inline-block',
        color: "white",
        fontWeight: "bold",
        background: "green",
        width: 18,
        height: 18,
        borderRadius: 10,
        lineHeight: "18px",
        textAlign: "center"
      }}
      component="span"
    >
       +
    </Box>
  );
}


function CustomAreaPopup(props) {

  const [latlngs, setLatlngs] = React.useState(null);

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
      <DialogContent sx={{ display: 'flex', flexDirection: 'column' }}>
        <DialogContentText sx={{ mb: 1 }}>
          New vertice: drag a <Plus /> icon. Remove vertice: rigth-click the vertice.
        </DialogContentText>
        <Map
          mapCenter={props.settings.display.map.center}
          latlngs={props.latlngs}
          setLatlngs={setLatlngs}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={props.handleClose} color="primary">
          Cancel
        </Button>
        <Button onClick={() => {props.setArea(latlngs); props.handleClose();}} color="primary" variant="contained">
          Add selected area
        </Button>
      </DialogActions>
    </Dialog>
  );

}

export default CustomAreaPopup;
