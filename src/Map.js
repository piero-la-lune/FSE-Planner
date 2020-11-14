import React from 'react';

import { Map, TileLayer, LayersControl } from "react-leaflet";
import { getBounds } from "geolib";
import L from "leaflet";

import JobsLayer from "./MapLayers/Jobs.js";
import ZonesLayer from "./MapLayers/Zones.js";
import AirportsLayer from "./MapLayers/Airports.js";
import Marker from "./MapLayers/Components/Marker.js";
import AirportIcons from "./MapLayers/Components/Icons.js";

import msfs from "./data/msfs.json";
const msfsIcaos = Object.keys(msfs);

const FSEMap = React.memo(function FSEMap(props) {

  const s = props.options.settings;
  const mapRef = React.useRef();

  // Display search marker
  const searchRef = React.useRef(null);
  const prevSearchRef = React.useRef(null);
  React.useEffect(() => {

    // If marker already exists remove it
    if (searchRef.current) {
      searchRef.current.remove();
      searchRef.current = null;
    }

    // Only draw marker if search is not empty
    if (props.search) {
      const marker = props.search.icao;
      const icons = new AirportIcons(s.display.markers.colors.selected, s.display.markers.sizes.selected);
      searchRef.current = Marker({
        position: [props.options.icaodata[marker].lat, props.options.icaodata[marker].lon],
        icon: icons.get(props.options.icaodata[marker].type, props.options.icaodata[marker].size),
        icao: marker,
        planes: props.options.planes[marker],
        icaodata: props.options.icaodata,
        siminfo: s.display.sim
      })
        .addTo(mapRef.current.leafletElement);
      // Only zoom to marker if search ICAO has changed
      if (prevSearchRef.current !== props.search) {
        mapRef.current.leafletElement.flyTo([props.search.lat, props.search.lon], 8);
        searchRef.current.openPopup();
      }
      prevSearchRef.current = props.search;
    }
  }, [props.search, props.options.icaodata, props.options.planes, s.display.sim, s.display.markers.colors.selected, s.display.markers.sizes.selected]);

  // Set search marker on top at each render
  React.useEffect(() => {
    if (searchRef.current) {
      searchRef.current.setZIndexOffset(100000);
    }
  }, [props.options])


  // Auto zoom map on jobs
  React.useEffect(() => {
    const icaos = new Set();
    Object.keys(props.options.jobs).forEach(key => icaos.add(key.split('-')[0]));
    const points = [...icaos].map(elm => props.options.icaodata[elm]);
    if (points.length > 4) {
      const b = getBounds(points);
      mapRef.current.leafletElement.fitBounds([[b.minLat, b.minLng], [b.maxLat, b.maxLng]], {animate:false});
    }
  }, [props.options.jobs, props.options.icaodata]);


  // Change icon size on map zoom
  const [aRadius, setARadius] = React.useState(1);
  const handleZoom = () => {
    const zoom = mapRef.current.leafletElement.getZoom();
    let z = 1;
    if (zoom > 11) { z = 6; }
    else if (zoom > 8) { z = 3; }
    setARadius(z);
  };

  const canvasRendererRef = React.useRef(L.canvas({ padding: 0.5 }));
  const maxBounds=[[-90, s.display.map.center-180], [90, s.display.map.center+180]];

  return (
    <Map center={[46.5344, 3.42167]} zoom={6} ref={mapRef} maxBounds={maxBounds} onZoomEnd={handleZoom} attributionControl={false}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LayersControl position="topleft">
        <LayersControl.Overlay name="FSE airports" checked={true}>
          <AirportsLayer
            icaos={props.icaos}
            icaodata={props.options.icaodata}
            fseicaodata={props.options.icaodata}
            renderer={canvasRendererRef.current}
            color={s.display.markers.colors.base}
            radius={aRadius}
            siminfo={s.display.sim}
          />
        </LayersControl.Overlay>
        <LayersControl.Overlay name="MSFS airports" checked={false}>
          <AirportsLayer
            icaos={msfsIcaos}
            icaodata={msfs}
            fseicaodata={props.options.icaodata}
            renderer={canvasRendererRef.current}
            color={s.display.markers.colors.rentable}
            radius={aRadius}
            siminfo={s.display.sim}
            sim="msfs"
          />
        </LayersControl.Overlay>
        <LayersControl.Overlay name="FSE airports landing area" checked={false}>
          <ZonesLayer icaos={props.icaos} icaodata={props.options.icaodata} renderer={canvasRendererRef.current} color={s.display.markers.colors.base} />
        </LayersControl.Overlay>
        <LayersControl.Overlay name="Job & plane search" checked={true}>
          <JobsLayer options={props.options} renderer={canvasRendererRef.current} />
        </LayersControl.Overlay>
      </LayersControl>
    </Map>
  );

});

export default FSEMap;
