import React from 'react';

import { Map, TileLayer, LayersControl } from "react-leaflet";
import { getBounds } from "geolib";
import L from "leaflet";

import AirportIcons from "./Icons.js";
import MapContent from "./MapContent.js";
import Marker from "./Marker.js";
import ZonesLayer from "./MapLayers/Zones.js";
import AirportsLayer from "./MapLayers/Airports.js";

const FSEMap = React.memo(function FSEMap(props) {

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


  // Change icon size on map zoom
  const [aRadius, setARadius] = React.useState(1);
  const handleZoom = (zoom) => {
    let z = 1;
    if (zoom > 11) { z = 6; }
    else if (zoom > 8) { z = 3; }
    setARadius(z);
  };

  const canvasRendererRef = React.useRef(L.canvas({ padding: 0.5 }));

  return (
    <Map center={[46.5344, 3.42167]} zoom={6} ref={mapRef} maxBounds={maxBounds} onZoomEnd={evt => handleZoom(mapRef.current.leafletElement.getZoom())} attributionControl={false}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LayersControl position="topleft">
        <LayersControl.Overlay name="FSE airports" checked={true}>
          <AirportsLayer icaos={props.icaos} icaodata={props.options.icaodata} renderer={canvasRendererRef.current} color={s.display.markers.colors.base} radius={aRadius} />
        </LayersControl.Overlay>
        <LayersControl.Overlay name="FSE airports landing area" checked={false}>
          <ZonesLayer icaos={props.icaos} icaodata={props.options.icaodata} renderer={canvasRendererRef.current} color={s.display.markers.colors.base} />
        </LayersControl.Overlay>
      </LayersControl>
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

});

export default FSEMap;
