import React from 'react';

import L from "leaflet";
import { useLeafletContext } from "@react-leaflet/core";


const ZonesLayer = React.memo(function ZonesLayer(props) {

  const groupRef = React.useRef(L.layerGroup());
  const context = React.useRef(useLeafletContext());
  const added = React.useRef(false);

  // Display all airports on map
  React.useEffect(() => {

    // Clear previous markers
    groupRef.current.clearLayers();
  
    Object.keys(props.zones).forEach(icao => {

      // Create lines
      L.polyline(
        props.zones[icao],
        {
          weight: 1,
          color: '#888',
          interactive: false,
          fill: false
      })
        .addTo(groupRef.current);
      L.polyline(
        props.zones[icao].map(elm => [elm[0], elm[1]+360]),
        {
          weight: 1,
          color: '#888',
          interactive: false,
          fill: false
      })
        .addTo(groupRef.current);
      L.polyline(
        props.zones[icao].map(elm => [elm[0], elm[1]-360]),
        {
          weight: 1,
          color: '#888',
          interactive: false,
          fill: false
      })
        .addTo(groupRef.current);
    });

    // Add layer to map
    if (!added.current) {
      context.current.layerContainer.addLayer(groupRef.current);
      added.current = true;
    }

  }, [props.color, props.zones]);


  return null;


});

export default ZonesLayer;
