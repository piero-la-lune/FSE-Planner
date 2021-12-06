import React from 'react';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import NavigationIcon from '@material-ui/icons/Navigation';
import CenterFocusStrongIcon from '@material-ui/icons/CenterFocusStrong';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import { makeStyles } from '@material-ui/core/styles';

import { getDistance, getRhumbLineBearing, convertDistance } from "geolib";
import ReactDOM from "react-dom";
import L from "leaflet";

import { AirportSVG } from "./Icons.js";
import AirportIcon from "./AirportIcon.js";
import { airportSurface, simName } from "../../utility.js"

const useStyles = makeStyles(theme => ({
  striked: {
    display: 'inline-block',
    marginRight: theme.spacing(1),
    textDecoration: 'line-through',
    textDecorationStyle: 'double',
    fontWeight: 300
  },
  popupHeader: {
    background: theme.palette.primary.main,
    color: '#fff',
    padding: '3px 32px 6px 8px',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3
  },
  popupPart: {
    padding: '6px 8px 12px 8px'
  },
  popupLabel: {
    margin: '8px 0 0 0 !important'
  },
  icao: {
    display: 'flex',
    alignItems: 'center'
  },
  icon: {
    display: 'inline-flex',
    marginRight: theme.spacing(1)
  },
  toFSE: {
    display: 'inline-flex',
    alignItems: 'center',
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(2),
    color: 'rgba(255, 255, 255, 0.5) !important',
    fontSize: '0.8em',
    '&:hover': {
      color: '#fff !important'
    }
  },
  name: {
    margin: '0 0 0 28px !important',
    fontWeight: 300,
  },
  simSeparator: {
    marginLeft: 4,
    marginRight: 4
  },
  model: {
    background: theme.palette.primary.light,
    color: '#fff',
    margin: '0 !important',
    padding: '2px 4px',
    borderRadius: 3
  },
  plane: {
    display: 'flex',
    alignItems: 'center',
    margin: '6px 0 0 12px !important'
  },
  planeHome: {
    margin: '0 0 0 24px !important',
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
  ils: {
    background: '#fff',
    color: theme.palette.primary.main,
    fontSize: '0.5em',
    fontWeight: 'bold',
    marginLeft: theme.spacing(1),
    padding: '0px 3px'
  }
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
        : {plane.dry ? '$'+plane.dry : '-'}/{plane.wet ? '$'+plane.wet : '-'} (${plane.bonus})
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
        : {plane.dry ? '$'+plane.dry : '-'}/{plane.wet ? '$'+plane.wet : '-'} (${plane.bonus}<NavigationIcon fontSize="inherit" style={{marginLeft: 3, transform: 'rotate('+dir+'deg)'}} />)
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

  const models = {}
  if (planes) {
    for (const plane of planes) {
      if (!models[plane.model]) { models[plane.model] = []; }
      models[plane.model].push(plane);
    }
  }

  return (
    <React.Fragment>
      <div className={classes.popupHeader}>
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
          {
            icaodata[icao].ils && <span className={classes.ils}>ILS</span>
          }
          <Link href={"https://server.fseconomy.net/airport.jsp?icao="+icao} target="fse" className={classes.toFSE} title="Go to FSE">
            <OpenInNewIcon fontSize="inherit" />
          </Link>
        </Typography>
        <Typography variant="body2" className={classes.name}>{icaodata[icao].name}</Typography>
      </div>
      <div className={classes.popupPart}>
        <Typography variant="body2" className={classes.popupLabel}>Position: {Math.abs(icaodata[icao].lat)}{icaodata[icao].lat >= 0 ? 'N' : 'S'} {Math.abs(icaodata[icao].lon)}{icaodata[icao].lon >= 0 ? 'E' : 'W'}, {icaodata[icao].elev} feet</Typography>
        <Typography variant="body2" className={classes.popupLabel}>Runway: {icaodata[icao].runway} feet of {airportSurface(icaodata[icao].surface)}</Typography>
        { props.forsale &&
          <Typography variant="body2" className={classes.popupLabel}>For sale: ${props.forsale.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</Typography>
        }
        {
          icaodata[icao][siminfo].length > 1 &&
            <React.Fragment>
              <Typography variant="body2" className={classes.popupLabel}>{ simName(siminfo) } alternatives:</Typography>
              <Breadcrumbs
                separator={null}
                maxItems={4}
                itemsBeforeCollapse={4}
                itemsAfterCollapse={0}
                classes={{separator: classes.simSeparator}}
                component='span'
              >
                {icaodata[icao][siminfo].slice(1).map(elm => <span key={elm}>{elm}</span>)}
              </Breadcrumbs>
            </React.Fragment>
        }
      </div>
      {
        planes && Object.entries(models).map(([model, planes]) =>
          <div className={classes.popupPart} key={model}>
            <Typography variant="body1" className={classes.model}>{model}</Typography>
            {planes.map(plane => <PlaneHome key={plane.reg} plane={plane} {...props} />)}
          </div>
        )
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
        ReactDOM.render(<Typography variant="h5" style={{padding:'3px 24px 3px 8px'}}>{props.icao}</Typography>, div);
      }
      else {
        ReactDOM.render(<Popup {...props} />, div);
      }
      return div;
    }, {
      autoPanPadding: new L.Point(30, 30),
      minWidth: sim ? 50 : Math.min(250, window.innerWidth-10),
      maxWidth: Math.max(600, window.innerWidth-10)
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
            name: 'Cancel jobs radiating TO',
            onClick: () => props.actions.current.toIcao('')
          });
        }
        else {
          actions.push({
            name: 'Jobs radiating TO',
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
        // Chart links
        actions.push({
          divider: true
        });
        actions.push({
          name: 'Charts on ChartFox',
          onClick: () => window.open(`https://chartfox.org/${props.icao}`, '_blank')
        });
        actions.push({
          name: 'Airport on SkyVector',
          onClick: () => window.open(`https://skyvector.com/airport/${props.icao}`, '_blank')
        });
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