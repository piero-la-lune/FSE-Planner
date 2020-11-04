import React from 'react';

import L from "leaflet";
import { useLeaflet } from "react-leaflet";

import { genPopup } from "./Components/Marker.js";


const AirportsLayer = React.memo(function AirportsLayer(props) {

  const groupRef = React.useRef(L.featureGroup());
  const radiusRef = React.useRef(1);
  const leaflet = React.useRef(useLeaflet());
  const rendererRef = React.useRef(props.renderer);
  const added = React.useRef(false);

  // Display all airports on map
  React.useEffect(() => {

    // Clear previous markers
    groupRef.current.clearLayers();
  
    props.icaos.forEach(icao =>

      // Create marker
      L.circleMarker(
        [props.icaodata[icao].lat, props.icaodata[icao].lon],
        {
          radius: radiusRef.current,
          opacity: 0,
          weight: 10,
          fillOpacity: 1,
          fillColor: props.color,
          renderer: rendererRef.current
      })
        .addTo(groupRef.current)
        .bindPopup(genPopup(icao, props.fseicaodata, {}, props.siminfo, props.sim))
    );

    // Add layer to map
    if (!added.current) {
      leaflet.current.layerContainer.addLayer(groupRef.current);
      added.current = true;
    }

  }, [props.color, props.icaos, props.icaodata, props.link, props.siminfo, props.sim, props.fseicaodata]);

  // Resize circles
  React.useEffect(() => {
    groupRef.current.eachLayer(function(layer){ layer.setRadius(props.radius); });
  }, [props.radius]);

  return null;

});

export default AirportsLayer;
