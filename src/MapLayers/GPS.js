import React from 'react';
import JobSegment from "./Components/JobSegment.js";
import Typography from '@material-ui/core/Typography';

import ReactDOM from "react-dom";

import L from "leaflet";
import { getDistance, getRhumbLineBearing, convertDistance } from "geolib";

import Marker from "./Components/Marker.js";

function GPSLayer(props) {

  const group = L.featureGroup();

  // Create lines if needed
  if (props.connections) {
    let legs = {};
    for (const c of props.connections) {
      const [frID, toID] = c;

      const fr = { latitude: props.points[frID][0], longitude: props.points[frID][1] };
      const to = { latitude: props.points[toID][0], longitude: props.points[toID][1] };

      let key = frID+"-"+toID;
      if (!legs.hasOwnProperty(key)) {
        legs[key] = {
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

      new JobSegment([[props.points[fr][0], props.points[fr][1]], [props.points[to][0], props.points[to][1]]], {
        weight: props.weight,
        color: props.color,
        highlight: props.highlight,
        bothWays: rleg
      })
        .bindTooltip(() => {
          var div = document.createElement('div');
          ReactDOM.render(<Typography variant="body1"><b>{leg.distance} NM</b></Typography>, div);
          return div;
        }, {sticky: true})
        .addTo(group);
    }
  }

  // Create markers
  for (const [latitude, longitude, label] of props.points) {
    Marker({
      position: [latitude, longitude],
      size: props.size,
      color: props.color,
      icao: label,
      icaodata: props.fseicaodata,
      actions: props.actions,
      sim: 'gps',
      id: 'gps'+props.id
    })
      .addTo(group);
  }

  return group;

}

export default GPSLayer;
