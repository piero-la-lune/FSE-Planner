import React from 'react';

import L from "leaflet";
import { useLeaflet } from "react-leaflet";


const ZonesLayer = React.memo(function ZonesLayer(props) {

  const groupRef = React.useRef(L.layerGroup());
  const leaflet = React.useRef(useLeaflet());
  const rendererRef = React.useRef(props.renderer);
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
          opacity: 0.5,
          weight: 1,
          color: props.color,
          interactive: false,
          renderer: rendererRef.current
      })
        .addTo(groupRef.current)
    );

    // Add layer to map
    if (!added.current) {
      leaflet.current.layerContainer.addLayer(groupRef.current);
      added.current = true;
    }

  }, [props.color, props.icaos, props.icaodata]);


  return null;


});

export default ZonesLayer;
