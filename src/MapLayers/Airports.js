import L from "leaflet";
import { getDistance, getRhumbLineBearing, convertDistance } from "geolib";

import Marker from "./Components/Marker.js";
import Job from "./Components/Job.js";
import { hideAirport, wrap as iWrap } from "../util/utility.js";

function AirportsLayer(props) {

  const s = props.settings;
  const group = L.featureGroup();
  const forsale = props.forsale || {};
  const wrap = num => num+iWrap(num, s.display.map.center);

  // Create lines if needed
  if (props.weight && props.connections) {
    let legs = {};
    for (const c of props.connections) {
      const [prevIcao, icao] = c;
      if (hideAirport(prevIcao, props.airportFilter, s.display.sim)) { continue; }
      if (hideAirport(icao, props.airportFilter, s.display.sim)) { continue; }

      const fr = { latitude: props.icaodata[prevIcao].lat, longitude: wrap(props.icaodata[prevIcao].lon) };
      const to = { latitude: props.icaodata[icao].lat, longitude: wrap(props.icaodata[icao].lon) };
      let key = prevIcao+"-"+icao;
      if (!legs.hasOwnProperty(key)) {
        legs[key] = {
          amount: 0,
          pay: 0,
          direction: Math.round(getRhumbLineBearing(fr, to)),
          distance: Math.round(convertDistance(getDistance(fr, to), 'sm')),
        }
      }
    }

    const legsKeys = Object.keys(legs);

    for (var i = 0; i < legsKeys.length; i++) {
      const [fr, to] = legsKeys[i].split('-');
      const leg = legs[legsKeys[i]];
      const rleg = legs[to+'-'+fr]

      // Ensure only one line for both way legs
      if (rleg && fr > to) { continue; }

      Job({
        positions: [[props.icaodata[fr].lat, wrap(props.icaodata[fr].lon)], [props.icaodata[to].lat, wrap(props.icaodata[to].lon)]],
        color: props.color,
        highlight: props.highlight,
        weight: parseFloat(props.weight),
        leg: leg,
        rleg: rleg,
        actions: props.actions,
        fromIcao: fr,
        toIcao: to
      })
        .addTo(group);
    }
  }

  // Create markers
  for (const icao of props.icaos) {
    if (hideAirport(icao, props.airportFilter, s.display.sim)) { continue; }
    Marker({
      position: [props.icaodata[icao].lat, wrap(props.icaodata[icao].lon)],
      size: props.size,
      color: props.planes && props.planes[icao] ? props.colorPlanes : props.color,
      icao: icao,
      icaodata: props.fseicaodata,
      actions: props.actions,
      siminfo: s.display.sim,
      sim: props.sim,
      forsale: forsale[icao],
      planes: props.planes && props.planes[icao]
    })
      .addTo(group);
  }

  return group;

}

export default AirportsLayer;
