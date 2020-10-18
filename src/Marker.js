import React from 'react';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import Tooltip from '@material-ui/core/Tooltip';
import NavigationIcon from '@material-ui/icons/Navigation';
import { makeStyles } from '@material-ui/core/styles';

import { Marker as LMarker, Popup } from "react-leaflet";
import { getDistance, getRhumbLineBearing, convertDistance } from "geolib";


function bonus(icao, plane, icaodata) {
  if (icao === plane.Home) { return ''; }
  const fr = { latitude: icaodata[icao].lat, longitude: icaodata[icao].lon };
  const to = { latitude: icaodata[plane.Home].lat, longitude: icaodata[plane.Home].lon };
  const dir = Math.round(getRhumbLineBearing(fr, to));
  const dist = Math.round(convertDistance(getDistance(fr, to), 'sm'));
  return (
    <React.Fragment>
      &nbsp;
      <Tooltip title={plane.Home+' ('+dir+'° '+dist+'NM)'}>
        <NavigationIcon style={{transform: 'rotate('+dir+'deg)'}} fontSize='inherit' />
      </Tooltip>
    </React.Fragment>
  )
}


const useStyles = makeStyles(theme => ({
  p: {
    display: 'flex',
    alignItems: 'center'
  }
}));


function Marker({openPopup, position, icon, icao, planes, icaodata, ...props}) {
  const markerRef = React.useRef();
  const classes = useStyles();

  React.useEffect(() => {
    if (openPopup) {
      markerRef.current.leafletElement.openPopup();
    }
  }, [openPopup])

  return (

    <LMarker position={position} icon={icon} ref={markerRef}>
      <Popup>
        <Typography variant="h6"><Link href={"https://server.fseconomy.net/airport.jsp?icao="+icao} target="_blank">{icao}</Link></Typography>
        { planes ?
          planes.map(plane =>
            <Typography variant="body2" className={classes.p} key={plane.Registration}>{plane.Registration} : ${plane.RentalDry}/${plane.RentalWet} (${plane.Bonus}{bonus(icao, plane, icaodata)})</Typography>
          )
        :
          null
        }
      </Popup>
    </LMarker>

  );
}

export default Marker;