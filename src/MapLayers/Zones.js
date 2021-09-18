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
  
    props.icaos.forEach(icao =>

      // Create marker
      L.polyline(
        props.icaodata[icao].zone,
        {
          weight: 1,
          color: '#888',
          interactive: false,
          fill: false
      })
        .addTo(groupRef.current)
    );

    // Add layer to map
    if (!added.current) {
      context.current.layerContainer.addLayer(groupRef.current);
      added.current = true;
    }

  }, [props.color, props.icaos, props.icaodata]);


  return null;


});

export default ZonesLayer;
