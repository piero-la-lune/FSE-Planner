import React from 'react';
import Typography from '@material-ui/core/Typography';
import NavigationIcon from '@material-ui/icons/Navigation';
import { makeStyles } from '@material-ui/core/styles';

import { Tooltip } from "react-leaflet";
import PolylineDecorator from "./PolylineDecorator.js";
import { getDistance, getRhumbLineBearing, convertDistance } from "geolib";

import { CivilIcon, MilitaryIcon, WaterIcon } from "./Icons.js";
import Marker from "./Marker.js";

function cleanLegs(jobs, opts) {
  let ids = Object.keys(jobs);
  let markers = new Set();
  let legs = {};
  let tmpLegs = {};
  let max = 0;
  // Add markers where a plane can be rented
  Object.keys(opts.planes).forEach(elm => markers.add(elm));
  // Add markers in filtering options
  if (opts.fromIcao) { markers.add(opts.fromIcao); }
  if (opts.toIcao) { markers.add(opts.toIcao); }
  if (opts.search) { markers.add(opts.search.icao); }
  // Get legs
  for (var i = ids.length - 1; i >= 0; i--) {
    const job = jobs[ids[i]];
    const fr = { latitude: opts.icaodata[job.Location].lat, longitude: opts.icaodata[job.Location].lon };
    const to = { latitude: opts.icaodata[job.ToIcao].lat, longitude: opts.icaodata[job.ToIcao].lon };
    // Filter out non paying jobs
    if (!job.Pay) { continue; }
    // Filter out jobs of wrong type
    if (opts.type !== job.Type) { continue; }
    // Filter out jobs with wrong cargo
    if (opts.cargo !== job.UnitType) { continue; }
    // Filter out jobs too big for plane
    if (opts.max && job.Amount > opts.max) { continue; }
    // Filter out jobs with wrong direction
    if (opts.fromIcao) {
      const fromIcao = { latitude: opts.icaodata[opts.fromIcao].lat, longitude: opts.icaodata[opts.fromIcao].lon };
      if (opts.settings.from.distCoef !== '') {
        if (getDistance(fromIcao, to)/getDistance(fromIcao, fr) < parseFloat(opts.settings.from.distCoef)) { continue; }
      }
      if (opts.settings.from.maxDist !== '') {
        if (convertDistance(getDistance(fromIcao, fr), 'sm') > parseFloat(opts.settings.from.maxDist)) { continue; }
      }
      if (opts.settings.from.angle !== '') {
        if (opts.fromIcao !== job.Location && 180 - Math.abs(Math.abs(getRhumbLineBearing(fr, to) - getRhumbLineBearing(fromIcao, fr)) - 180) > parseInt(opts.settings.from.angle)) { continue; }
      }
    }
    if (opts.toIcao) {
      const toIcao = { latitude: opts.icaodata[opts.toIcao].lat, longitude: opts.icaodata[opts.toIcao].lon };
      if (opts.settings.to.distCoef !== '') {
        if (getDistance(toIcao, fr)/getDistance(toIcao, to) < parseFloat(opts.settings.to.distCoef)) { continue; }
      }
      if (opts.settings.to.maxDist !== '') {
        if (convertDistance(getDistance(toIcao, to), 'sm') > parseFloat(opts.settings.to.maxDist)) { continue; }
      }
      if (opts.settings.to.angle !== '') {
        if (opts.toIcao !== job.ToIcao && 180 - Math.abs(Math.abs(getRhumbLineBearing(fr, to) - getRhumbLineBearing(to, toIcao)) - 180) > parseInt(opts.settings.to.angle)) { continue; }
      }
    }
    if (opts.direction) {
      const direction = getRhumbLineBearing(fr, to);
      if (180 - Math.abs(Math.abs(direction - opts.direction) - 180) > parseInt(opts.settings.direction.angle)) { continue; }
    }
    if (opts.minDist || opts.maxDist) {
      const distance = convertDistance(getDistance(fr, to), 'sm');
      if (opts.minDist && distance < opts.minDist) { continue; }
      if (opts.maxDist && distance > opts.maxDist) { continue; }
    }
    // Create source FBO
    let key = job.Location+"-"+job.ToIcao;
    if (!legs.hasOwnProperty(key)) {
      if (!tmpLegs.hasOwnProperty(key)) {
        tmpLegs[key] = {
          amount: 0,
          pay: 0,
          direction: Math.round(getRhumbLineBearing(fr, to)),
          distance: Math.round(convertDistance(getDistance(fr, to), 'sm'))
        };
      }
      tmpLegs[key].amount += job.Amount;
      tmpLegs[key].pay += job.Pay;
      if (!opts.min || tmpLegs[key].amount >= opts.min) {
        legs[key] = tmpLegs[key];
        delete tmpLegs[key];
        max = Math.max(max, legs[key].amount);
        markers.add(job.Location);
        markers.add(job.ToIcao);
      }
    }
    else {
      legs[key].amount += job.Amount;
      legs[key].pay += job.Pay;
      max = Math.max(max, legs[key].amount);
    }
  }
  return [[...markers], legs, max];
}
function addFlight(markers, legs, jobs, opts) {
  let m = new Set(markers);
  for (const job of Object.values(jobs)) {
    const fr = { latitude: opts.icaodata[job.Location].lat, longitude: opts.icaodata[job.Location].lon };
    const to = { latitude: opts.icaodata[job.Destination].lat, longitude: opts.icaodata[job.Destination].lon };
    // Create source FBO
    let key = job.Location+"-"+job.Destination;
    if (!legs.hasOwnProperty(key)) {
      legs[key] = {
        amount: 0,
        pay: 0,
        direction: Math.round(getRhumbLineBearing(fr, to)),
        distance: Math.round(convertDistance(getDistance(fr, to), 'sm'))
      }
    }
    if (!legs[key].hasOwnProperty('flight')) {
      legs[key].flight = {
        passengers: 0,
        kg: 0,
        pay: 0,
      }
    }
    m.add(job.Location);
    m.add(job.Destination);
    legs[key].flight[job.Units] += job.Amount;
    legs[key].flight.pay += job.Pay;
  }
  return [[...m], legs];
}


const useStyles = makeStyles(theme => ({
  leg: {
    display: 'flex',
    alignItems: 'center'
  },
  flight: {
    marginTop: theme.spacing(2)
  }
}));

function Leg(props) {
  const classes = useStyles();
  const text = [];
  if (props.passengers) { text.push(props.passengers+' passengers'); }
  if (props.kg) { text.push(props.kg+' kg'); }
  if (text.length === 0) { return null; }
  return (
    <Typography variant="body2" className={classes.leg}>
      <NavigationIcon style={{transform: 'rotate('+props.direction+'deg)'}} fontSize='inherit' /><span>&nbsp;{text.join(', ')}&nbsp;(${props.pay})</span>
    </Typography>
  );
}

const MapContent = React.memo(function MapContent(props) {

  const s = props.options.settings;
  let [markers, legs, max] = cleanLegs(props.options.jobs, props.options);
  [markers, legs] = addFlight(markers, legs, props.options.flight, props.options);
  const classes = useStyles();

  const icons = {
    civil1: CivilIcon(s.display.markers.colors.base, s.display.markers.sizes.base),
    military1: MilitaryIcon(s.display.markers.colors.base, s.display.markers.sizes.base),
    water1: WaterIcon(s.display.markers.colors.base, s.display.markers.sizes.base),
    civil2: CivilIcon(s.display.markers.colors.rentable, s.display.markers.sizes.rentable),
    military2: MilitaryIcon(s.display.markers.colors.rentable, s.display.markers.sizes.rentable),
    water2: WaterIcon(s.display.markers.colors.rentable, s.display.markers.sizes.rentable),
    civil3: CivilIcon(s.display.markers.colors.selected, s.display.markers.sizes.selected),
    military3: MilitaryIcon(s.display.markers.colors.selected, s.display.markers.sizes.selected),
    water3: WaterIcon(s.display.markers.colors.selected, s.display.markers.sizes.selected),
  }

  return (
    <React.Fragment>
      {markers.map(marker => {
        let color = '1';
        if (props.options.planes[marker]) { color = '2'; }
        if (marker === props.options.fromIcao || marker === props.options.toIcao) { color = '3'; }
        return (
          <Marker
            position={[props.options.icaodata[marker].lat, props.options.icaodata[marker].lon]}
            key={marker}
            icon={icons[props.options.icaodata[marker].type+color]}
            icao={marker}
            planes={props.options.planes[marker]}
            icaodata={props.options.icaodata}
          />
        );
      })}
      {Object.entries(legs).map(([key, leg]) => {
        const icaos = key.split('-');
        const rleg = legs[icaos[1]+'-'+icaos[0]];
        // Ensure only one line for both way legs
        if (rleg && icaos[0] > icaos[1]) { return null; }
        if (props.options.cargo === 'passengers') {
          const mw = parseFloat(s.display.legs.weights.passengers);
          const min = props.options.min || 1;
          const amount = rleg ? Math.max(leg.amount, rleg.amount) : leg.amount;
          let weight = parseFloat(s.display.legs.weights.base);
          if (mw) {
            weight = ((amount-min) / (max-min)) * (mw - weight) + weight;
          }
          let color = s.display.legs.colors.passengers;
          if (leg.flight || (rleg && rleg.flight)) {
            color = s.display.legs.colors.flight;
            weight = parseFloat(s.display.legs.weights.flight);
          }
          return (
            <PolylineDecorator
              color={color}
              highlight={s.display.legs.colors.highlight}
              key={key}
              weight={weight}
              positions={[[props.options.icaodata[icaos[0]].lat, props.options.icaodata[icaos[0]].lon], [props.options.icaodata[icaos[1]].lat, props.options.icaodata[icaos[1]].lon]]}
              reverse={rleg !== undefined}
            >
              <Tooltip sticky={true}>
                <Typography variant="body1"><b>{leg.distance}NM</b></Typography>
                <Leg passengers={leg.amount} direction={leg.direction} pay={leg.pay} />
                {rleg &&
                  <Leg passengers={rleg.amount} direction={rleg.direction} pay={rleg.pay} />
                }
                {(leg.flight || (rleg && rleg.flight)) &&
                  <React.Fragment>
                    <Typography variant="body1" className={classes.flight}><b>My flight</b></Typography>
                    {leg.flight &&
                      <Leg passengers={leg.flight.passengers} kg={leg.flight.kg} direction={leg.direction} pay={leg.flight.pay} />
                    }
                    {rleg && rleg.flight &&
                      <Leg passengers={rleg.flight.passengers} kg={rleg.flight.kg} direction={rleg.direction} pay={rleg.flight.pay} />
                    }
                  </React.Fragment>
                }
              </Tooltip>
            </PolylineDecorator>
          )
        }
        else {
          const mw = parseFloat(s.display.legs.weights.cargo);
          const min = props.options.min || 1;
          const amount = rleg ? Math.max(leg.amount, rleg.amount) : leg.amount;
          let weight = parseFloat(s.display.legs.weights.base);
          if (mw) {
            weight = ((amount-min) / (max-min)) * (mw - weight) + weight;
          }
          let color = s.display.legs.colors.cargo;
          if (leg.flight || (rleg && rleg.flight)) {
            color = s.display.legs.colors.flight;
            weight = parseFloat(s.display.legs.weights.flight);
          }
          return (
            <PolylineDecorator
              color={color}
              highlight={s.display.legs.colors.highlight}
              key={key}
              weight={weight}
              positions={[[props.options.icaodata[icaos[0]].lat, props.options.icaodata[icaos[0]].lon], [props.options.icaodata[icaos[1]].lat, props.options.icaodata[icaos[1]].lon]]}
              reverse={rleg !== undefined}
            >
              <Tooltip sticky={true}>
                <Typography variant="body1"><b>{leg.distance}NM</b></Typography>
                <Leg kg={leg.amount} direction={leg.direction} pay={leg.pay} />
                {rleg &&
                  <Leg kg={rleg.amount} direction={rleg.direction} pay={rleg.pay} />
                }
                {(leg.flight || (rleg && rleg.flight)) &&
                  <React.Fragment>
                    <Typography variant="body1" className={classes.flight}><b>My flight</b></Typography>
                    {leg.flight &&
                      <Leg passengers={leg.flight.passengers} kg={leg.flight.kg} direction={leg.direction} pay={leg.flight.pay} />
                    }
                    {rleg && rleg.flight &&
                      <Leg passengers={rleg.flight.passengers} kg={rleg.flight.kg} direction={rleg.direction} pay={rleg.flight.pay} />
                    }
                  </React.Fragment>
                }
              </Tooltip>
            </PolylineDecorator>
          )
        }
      })}
    </React.Fragment>
  );
});

export default MapContent;
