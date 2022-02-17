import { getDistance, getRhumbLineBearing, convertDistance } from "geolib";
import L from "leaflet";

import Marker from "./Components/Marker.js";
import Job from "./Components/Job.js";


function Route(props) {

  const s = props.options.settings;
  const group = L.layerGroup();

  const route = props.route;

  if (!route) {
    return group;
  }

  // Create legs
  const legs = {};
  for (var i = 1; i < route.icaos.length; i++) {
    const toIcao = route.icaos[i];
    const fromIcao = route.icaos[i-1];
    const fr = { latitude: props.options.icaodata[fromIcao].lat, longitude: props.options.icaodata[fromIcao].lon };
    const to = { latitude: props.options.icaodata[toIcao].lat, longitude: props.options.icaodata[toIcao].lon };
    let key = fromIcao+"-"+toIcao;
    if (!legs.hasOwnProperty(key)) {
      legs[key] = {
        amount: 0,
        pay: 0,
        direction: Math.round(getRhumbLineBearing(fr, to)),
        distance: Math.round(convertDistance(getDistance(fr, to), 'sm')),
        flight: {
          passengers: 0,
          kg: 0,
          pay: 0
        }
      }
    }
    legs[key].flight.kg += route.cargos[i-1].TripOnly.reduce((acc, elm) => acc + elm.kg, 0);
    legs[key].flight.kg += route.cargos[i-1].VIP.reduce((acc, elm) => acc + elm.kg, 0);
    legs[key].flight.passengers += route.cargos[i-1].TripOnly.reduce((acc, elm) => acc + elm.pax, 0);
    legs[key].flight.passengers += route.cargos[i-1].VIP.reduce((acc, elm) => acc + elm.pax, 0);
    legs[key].flight.pay += route.cargos[i-1].TripOnly.reduce((acc, elm) => acc + elm.pay, 0);
    legs[key].flight.pay += route.cargos[i-1].VIP.reduce((acc, elm) => acc + elm.pay, 0);
  }

  // Add jobs to map
  const legsKeys = Object.keys(legs);
  for (i = 0; i < legsKeys.length; i++) {
    const [fr, to] = legsKeys[i].split('-');
    const leg = legs[legsKeys[i]];
    const rleg = legs[to+'-'+fr]

    // Ensure only one line for both way legs
    if (rleg && fr > to) { continue; }

    Job({
      positions: [[props.options.icaodata[fr].lat, props.options.icaodata[fr].lon], [props.options.icaodata[to].lat, props.options.icaodata[to].lon]],
      color: s.display.legs.colors.flight,
      highlight: s.display.legs.colors.highlight,
      weight: parseFloat(s.display.legs.weights.flight),
      leg: leg,
      rleg: rleg,
      actions: props.actions,
      fromIcao: fr,
      toIcao: to
    })
      .addTo(group);
  }

  // Add markers to map
  for (i = 0; i < route.icaos.length; i++) {
    const icao = route.icaos[i];
    Marker({
      position: [props.options.icaodata[icao].lat, props.options.icaodata[icao].lon],
      size: s.display.markers.sizes.selected,
      color: s.display.markers.colors.selected,
      icao: icao,
      icaodata: props.options.icaodata,
      planes: props.options.planes[icao],
      siminfo: s.display.sim,
      actions: props.actions
    })
      .addTo(group);
  }

  return group;

};

export default Route;
