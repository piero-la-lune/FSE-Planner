import L from "leaflet";
import { getDistance, getRhumbLineBearing, convertDistance } from "geolib";

import Marker from "./Components/Marker.js";
import Job from "./Components/Job.js";
import { hideAirport } from "../utility.js";

function AirportsLayer(props) {

  const group = L.featureGroup();
  const forsale = props.forsale || {};

  // Create lines if needed
  if (props.weight && props.connections) {
    let legs = {};
    for (const c of props.connections) {
      const [prevIcao, icao] = c;
      if (hideAirport(prevIcao, props.airportFilter, props.siminfo)) { continue; }
      if (hideAirport(icao, props.airportFilter, props.siminfo)) { continue; }

      const fr = { latitude: props.icaodata[prevIcao].lat, longitude: props.icaodata[prevIcao].lon };
      const to = { latitude: props.icaodata[icao].lat, longitude: props.icaodata[icao].lon };
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
        positions: [[props.icaodata[fr].lat, props.icaodata[fr].lon], [props.icaodata[to].lat, props.icaodata[to].lon]],
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
    if (hideAirport(icao, props.airportFilter, props.siminfo)) { continue; }
    Marker({
      position: [props.icaodata[icao].lat, props.icaodata[icao].lon],
      size: props.size,
      color: props.planes && props.planes[icao] ? props.colorPlanes : props.color,
      icao: icao,
      icaodata: props.fseicaodata,
      actions: props.actions,
      siminfo: props.siminfo,
      sim: props.sim,
      forsale: forsale[icao],
      planes: props.planes && props.planes[icao]
    })
      .addTo(group);
  }

  return group;

}

export default AirportsLayer;
