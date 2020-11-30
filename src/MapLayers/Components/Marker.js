import React from 'react';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import NavigationIcon from '@material-ui/icons/Navigation';
import CenterFocusStrongIcon from '@material-ui/icons/CenterFocusStrong';
import { makeStyles } from '@material-ui/core/styles';

import { getDistance, getRhumbLineBearing, convertDistance } from "geolib";
import ReactDOM from "react-dom";
import L from "leaflet";

import { AirportSVG } from "./Icons.js";
import AirportIcon from "./AirportIcon.js";

const useStyles = makeStyles(theme => ({
  striked: {
    display: 'inline-block',
    marginRight: theme.spacing(1),
    textDecoration: 'line-through',
    textDecorationStyle: 'double',
    fontWeight: 300
  },
  icao: {
    display: 'flex',
    alignItems: 'center',
    background: theme.palette.primary.main,
    color: '#fff',
    padding: '3px 32px 3px 8px',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    margin: '-14px -14px 8px -14px'
  },
  icon: {
    display: 'inline-flex',
    marginRight: theme.spacing(1)
  },
  toFSE: {
    display: 'inline-flex',
    alignItems: 'center',
    marginLeft: theme.spacing(1),
    color: 'rgba(255, 255, 255, 0.5) !important',
    fontSize: '0.8em',
    '&:hover': {
      color: '#fff !important'
    }
  },
  sim: {
    background: theme.palette.primary.main,
    padding: '8px 8px',
    color: 'rgba(255, 255, 255, 0.5)',
    margin: '-12px -14px 8px -14px !important',
    lineHeight: '1'
  },
  simLabel: {
    fontSize: '0.7em',
    display: 'block',
    marginBottom: theme.spacing(0.5)
  },
  simIcao: {
    display: 'inline-block',
    marginRight: theme.spacing(0.5)
  },
  plane: {
    display: 'flex',
    alignItems: 'center'
  },
  planeHome: {
    marginTop: '-10px !important',
    marginLeft: theme.spacing(2)+'px !important',
    fontSize: '0.7rem',
    color: '#aaa',
    display: 'flex',
    alignItems: 'center'
  },
  planeSearch: {
    display: 'inline-flex',
    alignItems: 'center',
    marginLeft: theme.spacing(0.5),
    marginRight: theme.spacing(0.5),
    '&:hover': {
      textDecoration: 'none'
    }
  },
  toFSEPlane: {
    display: 'inline-flex',
    alignItems: 'center',
    marginRight: theme.spacing(0.2),
    marginLeft: theme.spacing(0.2)
  },
}));

const SVGs = new AirportSVG('#fff', '#3f51b5', 20);


function PlaneHome({plane, icaodata, icao, actions}) {
  const classes = useStyles();

  if (plane.home === icao) {
    return (
      <Typography variant="body2" className={classes.plane}>
        {plane.reg}
        <Link href={"https://server.fseconomy.net//aircraftlog.jsp?id="+plane.id} target="fse" className={classes.toFSEPlane} title="Go to FSE">
          <OpenInNewIcon fontSize="inherit" />
        </Link>
        : ${plane.dry}/${plane.wet} (${plane.bonus})
      </Typography>
    );
  }

  const fr = { latitude: icaodata[icao].lat, longitude: icaodata[icao].lon };
  const to = { latitude: icaodata[plane.home].lat, longitude: icaodata[plane.home].lon };
  const dir = Math.round(getRhumbLineBearing(fr, to));
  const dist = Math.round(convertDistance(getDistance(fr, to), 'sm'));

  const handleClick = (evt) => {
    evt.preventDefault();
    actions.current.goTo(plane.home);
  }

  return (
    <React.Fragment>
      <Typography variant="body2" className={classes.plane}>
        {plane.reg}
        <Link href={"https://server.fseconomy.net//aircraftlog.jsp?id="+plane.id} target="fse" className={classes.toFSEPlane} title="Go to FSE">
          <OpenInNewIcon fontSize="inherit" />
        </Link>
        : ${plane.dry}/${plane.wet} (${plane.bonus}<NavigationIcon fontSize="inherit" style={{marginLeft: 3, transform: 'rotate('+dir+'deg)'}} />)
      </Typography>
      <Typography variant="body2" className={classes.planeHome}>
        Home:
        <Link href="#" onClick={handleClick} className={classes.planeSearch} title="Go to home location">
          <CenterFocusStrongIcon fontSize="inherit" />
          {plane.home}
        </Link>
        ({dir}° {dist}NM)
      </Typography>
    </React.Fragment>
  );
}

function Popup(props) {
  const {icao, icaodata, planes, siminfo} = props;
  const classes = useStyles();

  const iconRef = React.useRef(null);
  React.useEffect(() => {
    iconRef.current.innerHTML = SVGs.get(icaodata[icao].type, icaodata[icao].size);
  }, [icaodata, icao]);

  return (
    <React.Fragment>
      <Typography variant="h5" className={classes.icao}>
        <span ref={iconRef} className={classes.icon}></span>
        {
          icaodata[icao][siminfo][0] === icao ?
            icao
          :
            <React.Fragment>
              <span className={classes.striked}>{icao}</span>{icaodata[icao][siminfo][0]}
            </React.Fragment>
        }
        <Link href={"https://server.fseconomy.net/airport.jsp?icao="+icao} target="fse" className={classes.toFSE} title="Go to FSE">
          <OpenInNewIcon fontSize="inherit" />
        </Link>
      </Typography>
      {
        icaodata[icao][siminfo].length > 1 &&
          <Typography variant="body2" className={classes.sim}>
            <span className={classes.simLabel}>Other possible landing spots:</span>
            {icaodata[icao][siminfo].slice(1).map(elm => <span key={elm} className={classes.simIcao}>{elm}</span>)}
          </Typography>
      }
      {
        planes && planes.map(plane => <PlaneHome key={plane.reg} plane={plane} {...props} />)
      }
    </React.Fragment>
  );
}

function Marker({position, size, color, sim, id, ...props}) {
  let type = 'default';
  if (!sim || (props.icaodata[props.icao] && props.icaodata[props.icao][sim][0] === props.icao)) {
    const a = props.icaodata[props.icao];
    type = a.type + (a.size >= 3500 ? 3 : a.size >= 1000 ? 2 : 1);
  }
  return new AirportIcon(
    position,
    {
      radius: parseInt(size)/2,
      color: '#fff',
      fillColor: color,
      type: type,
      id: id
    }
  )
    .bindPopup(() => {
      var div = document.createElement('div');
      if (sim) {
        ReactDOM.render(<Typography variant="h5">{props.icao}</Typography>, div);
      }
      else {
        ReactDOM.render(<Popup {...props} />, div);
      }
      return div;
    })
    .on('contextmenu', (evt) => {
      L.DomEvent.stopPropagation(evt);
      const actions = [];
      if (!sim) {
        actions.push({
          name: 'Open in FSE',
          onClick: () => {
            let w = window.open('https://server.fseconomy.net/airport.jsp?icao='+props.icao, 'fse');
            w.focus();
          }
        });
        const isFromIcao = props.actions.current.isFromIcao(props.icao);
        const isToIcao = props.actions.current.isToIcao(props.icao);
        if (isFromIcao) {
          actions.push({
            name: 'Cancel jobs radiating FROM',
            onClick: () => props.actions.current.fromIcao('')
          });
        }
        else {
          actions.push({
            name: 'Jobs radiating FROM',
            onClick: () => {
              if (isToIcao) {
                props.actions.current.toIcao('');
              }
              props.actions.current.fromIcao(props.icao);
            }
          });
        }
        if (isToIcao) {
          actions.push({
            name: 'Cancel jobs radiating To',
            onClick: () => props.actions.current.toIcao('')
          });
        }
        else {
          actions.push({
            name: 'Jobs radiating To',
            onClick: () => {
              if (isFromIcao) {
                props.actions.current.fromIcao('');
              }
              props.actions.current.toIcao(props.icao);
            }
          });
        }
        if (props.actions.current.isInCustom(props.icao)) {
          actions.push({
            name: 'Remove from Customs Markers',
            onClick: () => props.actions.current.removeCustom(props.icao)
          });
        }
        else {
          actions.push({
            name: 'Add to Customs Markers',
            onClick: () => props.actions.current.addCustom(props.icao)
          });
        }
      }
      props.actions.current.contextMenu({
        mouseX: evt.originalEvent.clientX,
        mouseY: evt.originalEvent.clientY,
        title: props.icao,
        actions: actions
      });
    });
}


export default Marker;