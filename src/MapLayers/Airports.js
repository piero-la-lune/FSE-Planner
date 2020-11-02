import React from 'react';

import L from "leaflet";
import { useLeaflet } from "react-leaflet";


function genPopup(icao, link = true) {
  if (link) {
    return `
      <h6 class="MuiTypography-root MuiTypography-h6">
        <a class="MuiTypography-root MuiLink-root MuiLink-underlineHover MuiTypography-colorPrimary" href="https://server.fseconomy.net/airport.jsp?icao=${icao}" target="_blank">${icao}</a>
      </h6>
    `;
  }
  return `
    <h6 class="MuiTypography-root MuiTypography-h6">
      ${icao}
    </h6>
  `;
}


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
        .bindPopup(genPopup(icao, props.link !== false))
    );

    // Add layer to map
    if (!added.current) {
      leaflet.current.layerContainer.addLayer(groupRef.current);
      added.current = true;
    }

  }, [props.color, props.icaos, props.icaodata, props.link]);

  // Resize circles
  React.useEffect(() => {
    groupRef.current.eachLayer(function(layer){ layer.setRadius(props.radius); });
  }, [props.radius]);

  return null;

});

export default AirportsLayer;
