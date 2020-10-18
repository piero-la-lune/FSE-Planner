import React from 'react';

import { Map, TileLayer } from "react-leaflet";
import { getBounds } from "geolib";

import { CivilIcon, MilitaryIcon, WaterIcon } from "./Icons.js";
import MapContent from "./MapContent.js";
import Marker from "./Marker.js";

import icaodata from "./data/icaodata.json";


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
    Object.values(props.options.jobs).forEach((elm) => points[elm.Location] = icaodata[elm.Location]);
    points = Object.values(points);
    if (points.length > 4) {
      const bounds = getBounds(points);
      mapRef.current.leafletElement.fitBounds([[bounds.minLat, bounds.minLng], [bounds.maxLat, bounds.maxLng]]);
    }
  }, [props.options.jobs]);

  const icons = {
    civil: CivilIcon(s.display.markers.colors.selected, s.display.markers.sizes.selected),
    military: MilitaryIcon(s.display.markers.colors.selected, s.display.markers.sizes.selected),
    water: WaterIcon(s.display.markers.colors.selected, s.display.markers.sizes.selected),
  }

  return (
    <Map center={[46.5344, 3.42167]} zoom={6} ref={mapRef} maxBounds={[[-90, -180], [90, 180]]}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        noWrap={true}
        bounds={[[-90, -180], [90, 180]]}
      />
      <MapContent options={props.options} />
      { search ?
        <Marker
          position={[icaodata[search].lat, icaodata[search].lon]}
          key={search}
          icon={icons[icaodata[search].type]}
          openPopup={true}
          icao={search}
          planes={props.options.planes[search]}
        />
      :
        null
      }
    </Map>
  );

}

export default FSEMap;
