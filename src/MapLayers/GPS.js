import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import JobSegment from "./Components/JobSegment.js";
import Typography from '@mui/material/Typography';
import Theme from '../Theme.js';

import ReactDOM from "react-dom";

import L from "leaflet";
import { getDistance, getRhumbLineBearing, convertDistance } from "geolib";

import Marker from "./Components/Marker.js";
import { wrap as iWrap } from "../util/utility.js";

function GPSLayer(props) {

  const s = props.settings;
  const group = L.featureGroup();
  const wrap = num => num+iWrap(num, s.display.map.center);

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

      new JobSegment([[props.points[fr][0], wrap(props.points[fr][1])], [props.points[to][0], wrap(props.points[to][1])]], {
        weight: props.weight,
        color: props.color,
        highlight: props.highlight,
        bothWays: rleg
      })
        .bindTooltip(() => {
          var div = document.createElement('div');
          ReactDOM.render((
            <ThemeProvider theme={Theme}>
              <Typography variant="body1"><b>{leg.distance} NM</b></Typography>
            </ThemeProvider>
          ), div);
          return div;
        }, {sticky: true})
        .addTo(group);
    }
  }

  // Create markers
  for (const [latitude, longitude, label] of props.points) {
    Marker({
      position: [latitude, wrap(longitude)],
      size: props.size,
      color: props.color,
      icao: label,
      icaodata: props.fseicaodata,
      actions: props.actions,
      sim: 'gps'
    })
      .addTo(group);
  }

  return group;

}

export default GPSLayer;
