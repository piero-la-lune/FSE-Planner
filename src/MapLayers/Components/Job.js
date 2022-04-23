import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import Box from '@mui/material/Box';
import JobSegment from "./JobSegment.js";
import Typography from '@mui/material/Typography';
import NavigationIcon from '@mui/icons-material/Navigation';
import Theme from '../../Theme.js';

import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import L from "leaflet";

import { maximizeTripOnly } from '../../util/utility.js';


// Generate amount p
function Cargo({pax, kg, pay, dir}) {
  return (
    <Typography
      variant="body2"
      sx={{
        display: 'flex',
        alignItems: 'center'
      }}
    >
      <NavigationIcon fontSize="inherit" style={{transform: 'rotate('+dir+'deg'}} />
      {pax > 0 ?
        <span>&nbsp;{pax} passenger{pax > 1 ? 's' : ''}{kg > 0 ? ' & '+kg+' kg' : ''}</span>
      :
        <span>&nbsp;{kg} kg</span>
      }
      &nbsp;(${pay})
    </Typography>
  );
}

// Generate multiple cargo
function MultipleCargo({jobs, options, ...props}) {
  if (options.type !== 'Trip-Only') {
    // For VIP and All-In jobs, display individual jobs
    return (
      <React.Fragment>
        {jobs.map((job, i) => <Cargo key={i} pax={job.pax} kg={job.pax > 0 ? 0 : job.kg} pay={job.pay} dir={props.dir} />)}
      </React.Fragment>
    );
  }
  if (!options.maxPax && !options.maxKg) {
    return (
      <React.Fragment>
        <Cargo
          pax={jobs.reduce((acc, job) => acc+job.pax, 0)}
          kg={jobs.reduce((acc, job) => acc+(job.pax > 0 ? 0 : job.kg), 0)}
          pay={jobs.reduce((acc, job) => acc+job.pay, 0)}
          dir={props.dir}
        />
      </React.Fragment>
    );
  }
  const maxPax = options.maxPax ? options.maxPax : 10000;
  const maxKg = options.maxKg ? options.maxKg : 1000000;
  const res = [];
  let remain = jobs;
  while (remain.length) {
    const [pay, pax, kg, found, r] = maximizeTripOnly(remain.length, remain, maxPax, maxKg);
    if (options.minPax && pax < options.minPax) { break; }
    if (options.minKg && kg < options.minKg) { break; }
    res.push(<Cargo
      pax={pax}
      kg={found.reduce((acc, job) => acc+(job.pax > 0 ? 0 : job.kg), 0)}
      pay={pay}
      dir={props.dir}
      key={res.length}
    />);
    remain = r;
  }
  return (
    <React.Fragment>
      {res}
    </React.Fragment>
  );
}

// Generate tooltip
function Tooltip({leg, rleg, fromIcao, toIcao, options}) {
  return (
    <div>
      <Typography variant="body1">
        <b>{leg.distance} NM</b>
        <Box component="span" sx={{ fontSize: '0.8em', paddingLeft: 1 }}>{fromIcao} - {toIcao}</Box>
      </Typography>
      { leg.amount > 0 &&
        <Box sx={{mt: 1}}>
          <MultipleCargo dir={leg.direction} options={options} jobs={leg.filteredJobs} />
        </Box>
      }
      { rleg && rleg.amount > 0 &&
        <Box sx={{mt: 1}}>
          <MultipleCargo dir={rleg.direction} options={options} jobs={rleg.filteredJobs} />
        </Box>
      }
      { (leg.flight || (rleg && rleg.flight)) &&
        <div>
          <Typography variant="body1" sx={{ marginTop: 2 }}><b>My assignments</b></Typography>
          {leg.flight &&
            <Cargo pax={leg.flight.pax} kg={leg.flight.kg} pay={leg.flight.pay} dir={leg.direction} />
          }
          {rleg && rleg.flight &&
            <Cargo pax={rleg.flight.pax} kg={rleg.flight.kg} pay={rleg.flight.pay} dir={rleg.direction} />
          }
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
      const root = createRoot(div);
      flushSync(() => {
        root.render((
          <ThemeProvider theme={Theme}>
            <Tooltip {...props} />
          </ThemeProvider>
        ));
      });
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
        },
        {
          name: <span>View jobs <NavigationIcon fontSize="inherit" sx={{transform: 'rotate('+props.leg.direction+'deg)', verticalAlign: 'text-top'}} /></span>,
          onClick: () => {
            props.actions.current.openTable();
            props.actions.current.goTo(props.toIcao, props.fromIcao);
          }
        }
      ];
      if (props.rleg) {
        actions.push({
          name: <span>View jobs <NavigationIcon fontSize="inherit" sx={{transform: 'rotate('+(props.leg.direction+180)+'deg)', verticalAlign: 'text-top'}} /></span>,
          onClick: () => {
            props.actions.current.openTable();
            props.actions.current.goTo(props.fromIcao, props.toIcao);
          }
        })
      }
      props.actions.current.contextMenu({
        mouseX: evt.originalEvent.clientX,
        mouseY: evt.originalEvent.clientY,
        title: <span>{props.fromIcao} - {props.toIcao} <NavigationIcon fontSize="inherit" sx={{transform: 'rotate('+props.leg.direction+'deg)', verticalAlign: 'text-top'}} /></span>,
        actions: actions
      });
    });

}


export default Job;
