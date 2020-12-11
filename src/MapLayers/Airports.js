import React from 'react';

import L from "leaflet";
import { useLeaflet } from "react-leaflet";
import { getDistance, getRhumbLineBearing, convertDistance } from "geolib";

import Marker from "./Components/Marker.js";
import Job from "./Components/Job.js";
import { hideAirport } from "../utility.js";

const AirportsLayer = React.memo(function AirportsLayer(props) {

  const groupRef = React.useRef(L.featureGroup());
  const leaflet = React.useRef(useLeaflet());
  const added = React.useRef(false);

  // Display all airports on map
  React.useEffect(() => {

    // Clear previous markers
    groupRef.current.clearLayers();

    // Create lines if needed
    if (props.weight) {
      let prevIcao = null;
      let legs = {};
      for (const icao of props.icaos) {
        if (prevIcao) {
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
        prevIcao = icao;
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
          .addTo(groupRef.current);
      }
    }

    // Create markers
    for (const icao of props.icaos) {
      if (hideAirport(icao, props.airportFilter)) { continue; }
      Marker({
        position: [props.icaodata[icao].lat, props.icaodata[icao].lon],
        size: props.size,
        color: props.color,
        icao: icao,
        icaodata: props.fseicaodata,
        actions: props.actions,
        siminfo: props.siminfo,
        sim: props.sim,
        id: 'sim'+props.id
      })
        .addTo(groupRef.current);
    }

    // Add layer to map
    if (!added.current) {
      leaflet.current.layerContainer.addLayer(groupRef.current);
      added.current = true;
    }

  }, [
    props.color,
    props.size,
    props.icaos,
    props.icaodata,
    props.link,
    props.siminfo,
    props.sim,
    props.fseicaodata,
    props.actions,
    props.id,
    props.weight,
    props.highlight,
    props.airportFilter
  ]);

  return null;

});

export default AirportsLayer;
