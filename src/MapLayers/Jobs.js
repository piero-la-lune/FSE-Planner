import React from 'react';

import { getDistance, getRhumbLineBearing, convertDistance } from "geolib";
import L from "leaflet";
import { useLeaflet } from "react-leaflet";

import AirportIcons from "./Components/Icons.js";
import Marker from "./Components/Marker.js";
import Job from "./Components/Job.js";


function cleanLegs(jobs, opts) {
  const keys = Object.keys(jobs);
  let legs = {};
  let max = 0;
  // Get legs
  for (var i = keys.length - 1; i >= 0; i--) {
    const leg = jobs[keys[i]];
    const [frIcao, toIcao] = keys[i].split('-');
    const fr = { latitude: opts.icaodata[frIcao].lat, longitude: opts.icaodata[frIcao].lon };
    const to = { latitude: opts.icaodata[toIcao].lat, longitude: opts.icaodata[toIcao].lon };

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
        if (opts.fromIcao !== frIcao && 180 - Math.abs(Math.abs(getRhumbLineBearing(fr, to) - getRhumbLineBearing(fromIcao, fr)) - 180) > parseInt(opts.settings.from.angle)) { continue; }
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
        if (opts.toIcao !== toIcao && 180 - Math.abs(Math.abs(getRhumbLineBearing(fr, to) - getRhumbLineBearing(to, toIcao)) - 180) > parseInt(opts.settings.to.angle)) { continue; }
      }
    }
    if (opts.direction) {
      if (180 - Math.abs(Math.abs(leg.direction - opts.direction) - 180) > parseInt(opts.settings.direction.angle)) { continue; }
    }

    // Filter out jobs based on distance
    if (opts.minDist && leg.distance < opts.minDist) { continue; }
    if (opts.maxDist && leg.distance > opts.maxDist) { continue; }

    const filteredJobs = leg[opts.cargo].filter(job => {
      // Filter out bad payed jobs
      if (opts.settings.pay.min_job && job.pay < opts.settings.pay.min_job) { return false; }
      // Filter out jobs of wrong type
      if (opts.type !== job.type) { return false; }
      // Filter out jobs too big for plane
      if (opts.max && job.nb > opts.max) { return false; }
      return true;
    });
    if (filteredJobs.length < 1) { continue; }

    // Compute total amount and pay
    const [amount, pay] = filteredJobs.reduce(([amount, pay], job) => [amount+job.nb, pay+job.pay], [0, 0]);

    // Filter out bad payed legs
    if (opts.settings.pay.min_leg && pay < opts.settings.pay.min_leg) { continue; }
    // Filter out legs with not enougth pax/kg
    if (opts.min && amount < opts.min) { continue; }
    
    legs[keys[i]] = {
      amount: amount,
      pay: pay,
      direction: leg.direction,
      distance: leg.distance
    };

    max = Math.max(max, amount);
  }
  // Only keep top x% paying jobs
  if (opts.settings.pay.top) {
    const values = [];
    // Compute each leg pay / amount / distance
    Object.values(legs).forEach(leg => {
      leg.pay_r = leg.pay/leg.amount/leg.distance
      values.push(leg.pay_r);
    });
    values.sort((a, b) => a - b);
    // Get values index
    const index = Math.floor(values.length*(1-parseInt(opts.settings.pay.top)/100)) - 1;
    // Get min pay
    const min_pay = values[Math.min(Math.max(index, 0), values.length-1)];
    // Filter out jobs
    Object.keys(legs).filter(icao => legs[icao].pay_r < min_pay).forEach(icao => delete legs[icao]);
  }
  return [legs, max];
}
function addFlight(legs, jobs, opts) {
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
    legs[key].flight[job.Units] += job.Amount;
    legs[key].flight.pay += job.Pay;
  }
  return legs;
}
function getMarkers(legs, opts) {
  let markers = new Set();
  // Add markers where a plane can be rented
  Object.keys(opts.planes).forEach(elm => markers.add(elm));
  // Add markers in filtering options
  if (opts.fromIcao) { markers.add(opts.fromIcao); }
  if (opts.toIcao) { markers.add(opts.toIcao); }
  if (opts.search) { markers.add(opts.search.icao); }
  // Add markers in legs
  Object.keys(legs).forEach((key) => {
    let arr = key.split('-');
    markers.add(arr[0]);
    markers.add(arr[1]);
  });
  return [...markers];
}



const Jobs = React.memo(function Jobs(props) {

  const s = props.options.settings;

  const icons = [
    new AirportIcons(s.display.markers.colors.base, s.display.markers.sizes.base),
    new AirportIcons(s.display.markers.colors.rentable, s.display.markers.sizes.rentable),
    new AirportIcons(s.display.markers.colors.selected, s.display.markers.sizes.selected)
  ];

  const groupRef = React.useRef(L.layerGroup());
  const leaflet = React.useRef(useLeaflet());
  const rendererRef = React.useRef(props.renderer);
  const added = React.useRef(false);

  React.useEffect(() => {

    let [legs, max] = cleanLegs(props.options.jobs, props.options);
    legs = addFlight(legs, props.options.flight, props.options);
    const markers = getMarkers(legs, props.options);

    // Clear previous markers and legs
    groupRef.current.clearLayers();
    
    // Add Markers
    for (var i = 0; i < markers.length; i++) {
      const marker = markers[i];

      // Compute marker color
      let color = 0;
      if (props.options.planes[marker]) { color = 1; }
      if (marker === props.options.fromIcao || marker === props.options.toIcao) { color = 2; }

      // Create marker
      Marker({
        position: [props.options.icaodata[marker].lat, props.options.icaodata[marker].lon],
        icon: icons[color].get(props.options.icaodata[marker].type, props.options.icaodata[marker].size),
        icao: marker,
        planes: props.options.planes[marker],
        icaodata: props.options.icaodata
      })
        .addTo(groupRef.current)

    }

    // Add Jobs
    const legsKeys = Object.keys(legs);
    for (i = 0; i < legsKeys.length; i++) {
      const [fr, to] = legsKeys[i].split('-');
      const leg = legs[legsKeys[i]];
      const rleg = legs[to+'-'+fr]

      // Ensure only one line for both way legs
      if (rleg && fr > to) { continue; }

      // Compute line weight
      const mw = parseFloat(s.display.legs.weights[props.options.cargo === 'passengers' ? 'passengers' : 'cargo']);
      const min = props.options.min || 1;
      const amount = rleg ? Math.max(leg.amount, rleg.amount) : leg.amount;
      let weight = parseFloat(s.display.legs.weights.base);
      if (mw) {
        weight = ((amount-min) / (max-min)) * (mw - weight) + weight;
      }

      // Compute color
      let color = s.display.legs.colors[props.options.cargo === 'passengers' ? 'passengers' : 'cargo'];

      // Special color and weight if My Flight
      if (leg.flight || (rleg && rleg.flight)) {
        color = s.display.legs.colors.flight;
        weight = parseFloat(s.display.legs.weights.flight);
      }

      Job({
        positions: [[props.options.icaodata[fr].lat, props.options.icaodata[fr].lon], [props.options.icaodata[to].lat, props.options.icaodata[to].lon]],
        color: color,
        highlight: s.display.legs.colors.highlight,
        weight: weight,
        leg: leg,
        rleg: rleg,
        type: props.options.cargo,
        renderer: rendererRef.current
      })
        .addTo(groupRef.current);
    }

    // Add layer to map
    if (!added.current) {
      leaflet.current.layerContainer.addLayer(groupRef.current);
      added.current = true;
    }
  }, [props, s, icons]);

  return null;

});

export default Jobs;
