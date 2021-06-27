import React from 'react';
import { Map, TileLayer, } from "react-leaflet";
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import CloseIcon from '@material-ui/icons/Close';
import { makeStyles } from '@material-ui/core/styles';
import L from "leaflet";

import RectangleTransform from "./RectangleTransform.js";


const useStyles = makeStyles(theme => ({
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
  popup: {
    height: '90vh'
  },
  popupContent: {
    display: 'flex'
  }
}));
const boundsOptions = {animate:false};

function CustomAreaPopup(props) {

  const startBounds = props.bounds || L.latLngBounds([[51.310, 8.496], [42.200, -5.065]]);

  const handleClose = () => {
    setBounds(startBounds);
    props.handleClose();
  }

  const classes = useStyles();
  const [bounds, setBounds] = React.useState(() => startBounds);

  const maxBounds = React.useMemo(() => 
    [[-90, props.settings.display.map.center-180], [90, props.settings.display.map.center+180]]
  , [props.settings.display.map.center]);

  const mapRef = React.useCallback(node => {
    if (node !== null) {
      node.leafletElement.setMinZoom(node.leafletElement.getBoundsZoom(maxBounds, true));
    }
  }, [maxBounds]);

  return (

    <Dialog onClose={handleClose} open={props.open} fullWidth={true} maxWidth="lg" classes={{paper: classes.popup}}>
      <DialogTitle>
        Select custom area
        <IconButton className={classes.closeButton} onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent className={classes.popupContent}>
        <Map ref={mapRef} bounds={startBounds} boundsOptions={boundsOptions} maxBounds={maxBounds} minZoom={2}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <RectangleTransform bounds={bounds} onUpdate={(bounds) => setBounds(bounds)} />
        </Map>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
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