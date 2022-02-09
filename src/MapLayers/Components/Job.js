import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import Box from '@mui/material/Box';
import JobSegment from "./JobSegment.js";
import Typography from '@mui/material/Typography';
import NavigationIcon from '@mui/icons-material/Navigation';
import Theme from '../../Theme.js';

import ReactDOM from "react-dom";
import L from "leaflet";


// Generate amount p
function Cargo({cargo, pay, dir}) {
  return (
    <Typography
      variant="body2"
      sx={{
        display: 'flex',
        alignItems: 'center'
      }}
    >
      <NavigationIcon fontSize="inherit" style={{transform: 'rotate('+dir+'deg'}} />
      {cargo.passengers > 0 && <span>&nbsp;{cargo.passengers} passengers</span>}
      {cargo.kg > 0 && <span>&nbsp;{cargo.kg} kg</span>}
      &nbsp;(${pay})
    </Typography>
  );
}

// Generate tooltip
function Tooltip({leg, type, rleg, fromIcao, toIcao}) {
  return (
    <div>
      <Typography variant="body1"><b>{leg.distance} NM</b><Box component="span" sx={{ fontSize: '0.8em', paddingLeft: 1 }}>{fromIcao} - {toIcao}</Box></Typography>
      { leg.amount > 0 && <Cargo cargo={{[type]: leg.amount}} pay={leg.pay} dir={leg.direction} /> }
      { rleg && rleg.amount > 0 && <Cargo cargo={{[type]: rleg.amount}} pay={rleg.pay} dir={rleg.direction} /> }
      { (leg.flight || (rleg && rleg.flight)) &&
        <div>
          <Typography variant="body1" sx={{ marginTop: 2 }}><b>My flight</b></Typography>
          {leg.flight && <Cargo cargo={leg.flight} pay={leg.flight.pay} dir={leg.direction} />}
          {rleg && rleg.flight && <Cargo cargo={rleg.flight} pay={rleg.flight.pay} dir={rleg.direction} />}
        </div>
      }
    </div>
  );
}


// Generate all components to render leg
function Job(props) {

  // Add line
  return new JobSegment(props.positions, {
    weight: props.weight,
    color: props.color,
    highlight: props.highlight,
    bothWays: props.rleg
  })
    .bindTooltip(() => {
      var div = document.createElement('div');
      ReactDOM.render((
        <ThemeProvider theme={Theme}>
          <Tooltip {...props} />
        </ThemeProvider>
      ), div);
      return div;
    }, {sticky: true})
    .on('contextmenu', (evt) => {
      L.DomEvent.stopPropagation(evt);
      const actions = [
        {
          name: <span>Open {props.fromIcao} in FSE</span>,
          onClick: () => {
            let w = window.open('https://server.fseconomy.net/airport.jsp?icao='+props.fromIcao, 'fse');
            w.focus();
          }
        },
        {
          name: <span>Open {props.toIcao} in FSE</span>,
          onClick: () => {
            let w = window.open('https://server.fseconomy.net/airport.jsp?icao='+props.toIcao, 'fse');
            w.focus();
          }
        }
      ];
      props.actions.current.contextMenu({
        mouseX: evt.originalEvent.clientX,
        mouseY: evt.originalEvent.clientY,
        title: <span>{props.fromIcao} - {props.toIcao} <NavigationIcon fontSize="inherit" style={{transform: 'rotate('+props.leg.direction+'deg'}} /></span>,
        actions: actions
      });
    });

}


export default Job;
