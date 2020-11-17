import React from 'react';

import L from "leaflet";
import { useLeaflet } from "react-leaflet";

import Marker from "./Components/Marker.js";


const AirportsLayer = React.memo(function AirportsLayer(props) {

  const groupRef = React.useRef(L.featureGroup());
  const leaflet = React.useRef(useLeaflet());
  const added = React.useRef(false);

  // Display all airports on map
  React.useEffect(() => {

    // Clear previous markers
    groupRef.current.clearLayers();

    props.icaos.forEach(icao =>
      // Create marker
      Marker({
        position: [props.icaodata[icao].lat, props.icaodata[icao].lon],
        size: props.size,
        color: props.color,
        icao: icao,
        icaodata: props.fseicaodata,
        goTo: props.goTo,
        siminfo: props.siminfo,
        sim: props.sim,
        id: 'sim'+props.sim
      })
        .addTo(groupRef.current)
    );

    // Add layer to map
    if (!added.current) {
      leaflet.current.layerContainer.addLayer(groupRef.current);
      added.current = true;
    }

  }, [props.color, props.size, props.icaos, props.icaodata, props.link, props.siminfo, props.sim, props.fseicaodata, props.goTo]);

  return null;

});

export default AirportsLayer;
