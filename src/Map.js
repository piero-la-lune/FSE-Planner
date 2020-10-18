import React from 'react';

import { Map, TileLayer } from "react-leaflet";
import { getBounds } from "geolib";

import { CivilIcon, MilitaryIcon, WaterIcon } from "./Icons.js";
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
      const bounds = getBounds(points);
      mapRef.current.leafletElement.fitBounds([[bounds.minLat, bounds.minLng], [bounds.maxLat, bounds.maxLng]]);
    }
  }, [props.options.jobs, props.options.icaodata]);

  const icons = {
    civil: CivilIcon(s.display.markers.colors.selected, s.display.markers.sizes.selected),
    military: MilitaryIcon(s.display.markers.colors.selected, s.display.markers.sizes.selected),
    water: WaterIcon(s.display.markers.colors.selected, s.display.markers.sizes.selected),
  }

  const bounds=[[-90, s.display.map.center-180], [90, s.display.map.center+180]];

  return (
    <Map center={[46.5344, 3.42167]} zoom={6} ref={mapRef} maxBounds={bounds}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapContent options={props.options} />
      { search ?
        <Marker
          position={[props.options.icaodata[search].lat, props.options.icaodata[search].lon]}
          key={search}
          icon={icons[props.options.icaodata[search].type]}
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
