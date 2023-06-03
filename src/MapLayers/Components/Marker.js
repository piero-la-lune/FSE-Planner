import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import NavigationIcon from '@mui/icons-material/Navigation';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import TableViewIcon from '@mui/icons-material/TableView';
import IconButton from '@mui/material/IconButton';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Theme from '../../Theme.js';

import { getDistance, getRhumbLineBearing, convertDistance } from "geolib";
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import L from "leaflet";

import { AirportSVG } from "./Icons.js";
import AirportIcon from "./AirportIcon.js";
import { airportSurface, simName } from "../../util/utility.js"


const styles = {
  popupPart: {
    padding: '6px 8px 12px 8px'
  },
  popupLabel: {
    margin: '8px 0 0 0 !important'
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
    marginLeft: 0.5,
    marginRight: 0.5,
    '&:hover': {
      textDecoration: 'none'
    }
  },
  toFSEPlane: {
    display: 'inline-flex',
    alignItems: 'center',
    marginRight: 0.2,
    marginLeft: 0.2
  },
}

const SVGs = new AirportSVG('#fff', '#3f51b5', 20);


function PlaneHome({plane, icaodata, icao, actions}) {
  if (plane.home === icao) {
    return (
      <Typography variant="body2" sx={styles.plane}>
        {plane.reg}
        <Link href={"https://server.fseconomy.net//aircraftlog.jsp?id="+plane.id} target="fse" sx={styles.toFSEPlane} title="Go to FSE">
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
      <Typography variant="body2" sx={styles.plane}>
        {plane.reg}
        <Link href={"https://server.fseconomy.net//aircraftlog.jsp?id="+plane.id} target="fse" sx={styles.toFSEPlane} title="Go to FSE">
          <OpenInNewIcon fontSize="inherit" />
        </Link>
        : {plane.dry ? '$'+plane.dry : '-'}/{plane.wet ? '$'+plane.wet : '-'} (${plane.bonus}<NavigationIcon fontSize="inherit" style={{marginLeft: 3, transform: 'rotate('+dir+'deg)'}} />)
      </Typography>
      <Typography variant="body2" sx={styles.planeHome}>
        Home:
        <Link href="#" onClick={handleClick} sx={styles.planeSearch} title="Go to home location">
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
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: '#fff',
          padding: '3px 32px 6px 8px',
          borderTopLeftRadius: 3,
          borderTopRightRadius: 3
        }}
      >
        <Typography
          variant="h5"
          sx={{
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <Box
            component="span"
            ref={iconRef}
            sx={{
              display: 'inline-flex',
              marginRight: 1
            }}
          />
          {
            icaodata[icao][siminfo][0] === icao ?
              icao
            :
              <React.Fragment>
                <Box
                  component="span"
                  sx={{
                    display: 'inline-block',
                    marginRight: 1,
                    textDecoration: 'line-through',
                    textDecorationStyle: 'double',
                    fontWeight: 300
                  }}
                >
                  {icao}
                </Box>
                {icaodata[icao][siminfo][0]}
              </React.Fragment>
          }
          {
            icaodata[icao].ils &&
            <Box
              component="span"
              sx={{
                bgcolor: '#fff',
                color: 'primary.main',
                fontSize: '0.5em',
                fontWeight: 'bold',
                marginLeft: 1,
                padding: '0px 3px'
              }}
            >
              ILS
            </Box>
          }
          <IconButton
            onClick={() => { props.actions.current.openTable(); props.actions.current.goTo(icao); }}
            sx={{
              p: 0.5,
              my: 0.5,
              ml: 1,
              color: 'rgba(255, 255, 255, 0.5)',
              '&:hover': {
                color: '#fff'
              }
            }}
            title="Table view"
          >
            <TableViewIcon />
          </IconButton>
          <IconButton
            sx={{
              p: 0.5,
              my: 0.5,
              color: 'rgba(255, 255, 255, 0.5) !important',
              '&:hover': {
                color: '#fff !important'
              }
            }}
            href={"https://server.fseconomy.net/airport.jsp?icao="+icao}
            target="fse"
            title="Go to FSE"
          >
            <OpenInNewIcon sx={{ fontSize: '0.9em' }} />
          </IconButton>
        </Typography>
        <Typography
          variant="body2"
          sx={{
            margin: '0 0 0 28px !important',
            fontWeight: 300,
          }}
        >
          {icaodata[icao].name}
        </Typography>
      </Box>
      <Box sx={styles.popupPart}>
        <Typography variant="body2" sx={styles.popupLabel}>Position: {Math.abs(icaodata[icao].lat)}{icaodata[icao].lat >= 0 ? 'N' : 'S'} {Math.abs(icaodata[icao].lon)}{icaodata[icao].lon >= 0 ? 'E' : 'W'}, {icaodata[icao].elev} feet</Typography>
        <Typography variant="body2" sx={styles.popupLabel}>Runway: {icaodata[icao].runway} feet of {airportSurface(icaodata[icao].surface)}</Typography>
        { props.forsale &&
          <Typography variant="body2" sx={styles.popupLabel}>For sale: ${props.forsale.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</Typography>
        }
        {
          icaodata[icao][siminfo].length > 1 &&
            <React.Fragment>
              <Typography variant="body2" sx={styles.popupLabel}>{ simName(siminfo) } alternatives:</Typography>
              <Breadcrumbs
                separator={null}
                maxItems={4}
                itemsBeforeCollapse={4}
                itemsAfterCollapse={0}
                sx={{
                  '& .MuiBreadcrumbs-separator': {
                    display: 'none'
                  },
                  '& .MuiBreadcrumbs-ol': {
                    columnGap: '10px'
                  }
                }}
                component='span'
                onClick={e => { e.stopPropagation(); return false; }}
              >
                {icaodata[icao][siminfo].slice(1).sort().map(elm => <span key={elm}>{elm}</span>)}
              </Breadcrumbs>
            </React.Fragment>
        }
      </Box>
      {
        planes && Object.entries(models).map(([model, planes]) =>
          <Box sx={styles.popupPart} key={model}>
            <Typography
              variant="body1"
              sx={{
                bgcolor: 'primary.light',
                color: '#fff',
                margin: '0 !important',
                padding: '2px 4px',
                borderRadius: 1
              }}
            >
              {model}
            </Typography>
            {planes.map(plane => <PlaneHome key={plane.reg} plane={plane} {...props} />)}
          </Box>
        )
      }
    </React.Fragment>
  );
}

function Marker({position, size, color, sim, allJobs, ...props}) {
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
      allJobs: allJobs,
    }
  )
    .bindPopup(() => {
      var div = document.createElement('div');
      const root = createRoot(div);
      if (sim) {
        flushSync(() => {
          root.render((
            <ThemeProvider theme={Theme}>
              <Typography variant="h5" style={{padding:'3px 24px 3px 8px'}}>{props.icao}</Typography>
            </ThemeProvider>
          ));
        });
      }
      else {
        flushSync(() => {
          root.render((
            <ThemeProvider theme={Theme}>
              <Popup {...props} />
            </ThemeProvider>
          ));
        });
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
        actions.push({
          name: 'View jobs',
          onClick: () => {
            props.actions.current.openTable();
            props.actions.current.goTo(props.icao);
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
        actions.push({
          name: 'Mesure distance from this point',
          onClick: () => props.actions.current.measureDistance(evt.latlng)
        });
        // Custom layers action
        const layers = props.actions.current.getCustomLayers(props.icao);
        if (layers.length) {
          actions.push({
            divider: true
          });
          for (const [id, name, exist] of layers) {
            if (!exist) {
              actions.push({
                name: 'Add to layer "'+name+'"',
                onClick: () => props.actions.current.addToCustomLayer(id, props.icao)
              });
            }
            else {
              actions.push({
                name: 'Remove from layer "'+name+'"',
                onClick: () => props.actions.current.removeFromCustomLayer(id, props.icao)
              });
            }
          }
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
