import React from 'react';

import { Map, TileLayer } from "react-leaflet";
import { getBounds } from "geolib";
import L from "leaflet";

import AirportIcons from "./Icons.js";
import MapContent from "./MapContent.js";
import Marker from "./Marker.js";


function FSEMap(props) {

  const s = props.options.settings;
  const mapRef = React.useRef();

  const search = (props.search) ? props.search.icao : null;
  React.useEffect(() => {
    if (props.search) {
      mapRef.current.leafletElement.flyTo([props.search.lat, props.search.lon], 8);
    }
  }, [props.search]);
  React.useEffect(() => {
    let points = {};
    Object.values(props.options.jobs).forEach((elm) => points[elm.Location] = props.options.icaodata[elm.Location]);
    points = Object.values(points);
    if (points.length > 4) {
      const b = getBounds(points);
      mapRef.current.leafletElement.fitBounds([[b.minLat, b.minLng], [b.maxLat, b.maxLng]], {animate:false});
    }
  }, [props.options.jobs, props.options.icaodata]);

  const icons = new AirportIcons(s.display.markers.colors.selected, s.display.markers.sizes.selected);

  const maxBounds=[[-90, s.display.map.center-180], [90, s.display.map.center+180]];

  const icaodataRef = React.useRef(props.options.icaodata);
  const layerMarkersRef = React.useRef(L.featureGroup());
  const iconSizeRef = React.useRef(1);
  // Display all airports on map
  React.useEffect(() => {
    layerMarkersRef.current.clearLayers();
    if (!s.display.markers.all) { return; }
    // Create a canvas renderer to improve performance
    const renderer = L.canvas({ padding: 0.5 });
    Object.keys(icaodataRef.current).forEach(icao =>
      // Create marker
      L.circleMarker(
        [icaodataRef.current[icao].lat, icaodataRef.current[icao].lon],
        {radius: iconSizeRef.current, opacity: 0, weight: 10, fillOpacity: 1, fillColor: s.display.markers.colors.base, renderer: renderer}
      )
        .addTo(layerMarkersRef.current)
        .bindPopup('<h6 class="MuiTypography-root MuiTypography-h6"><a class="MuiTypography-root MuiLink-root MuiLink-underlineHover MuiTypography-colorPrimary" href="https://server.fseconomy.net/airport.jsp?icao='+icao+'" target="_blank">'+icao+'</a></h6>')
    );
    // Add canvas to map
    layerMarkersRef.current.addTo(mapRef.current.leafletElement);
  }, [s.display.markers.colors.base, s.display.markers.all]);
  // Change icon size on map zoom
  const handleZoom = (zoom) => {
    let z = 1;
    if (zoom > 11) { z = 6; }
    else if (zoom > 8) { z = 3; }
    if (z !== iconSizeRef.current) {
      layerMarkersRef.current.eachLayer(function(layer){ layer.setRadius(z); });
      iconSizeRef.current = z;
    }
  };

  return (
    <Map center={[46.5344, 3.42167]} zoom={6} ref={mapRef} maxBounds={maxBounds} onZoomEnd={evt => handleZoom(mapRef.current.leafletElement.getZoom())}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapContent options={props.options} />
      { search ?
        <Marker
          position={[props.options.icaodata[search].lat, props.options.icaodata[search].lon]}
          key={search}
          icon={icons.get(props.options.icaodata[search].type, props.options.icaodata[search].size)}
          openPopup={true}
          icao={search}
          planes={props.options.planes[search]}
          icaodata={props.options.icaodata}
        />
      :
        null
      }
    </Map>
  );

}

export default FSEMap;
