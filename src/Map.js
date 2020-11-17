import React from 'react';

import { Map, TileLayer, LayersControl } from "react-leaflet";
import { getBounds } from "geolib";

import Canvas from "./MapLayers/Components/Canvas.js";
import JobsLayer from "./MapLayers/Jobs.js";
import ZonesLayer from "./MapLayers/Zones.js";
import AirportsLayer from "./MapLayers/Airports.js";
import Marker from "./MapLayers/Components/Marker.js";

import msfs from "./data/msfs.json";
const msfsIcaos = Object.keys(msfs);

const FSEMap = React.memo(function FSEMap(props) {

  const s = props.options.settings;
  const mapRef = React.useRef();
  const canvasRendererRef = React.useRef(new Canvas({ padding: 0.5 }));
  const maxBounds=[[-90, s.display.map.center-180], [90, s.display.map.center+180]];

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
      searchRef.current = Marker({
        position: [props.options.icaodata[props.search].lat, props.options.icaodata[props.search].lon],
        size: s.display.markers.sizes.selected,
        color: s.display.markers.colors.selected,
        icao: props.search,
        icaodata: props.options.icaodata,
        planes: props.options.planes[props.search],
        siminfo: s.display.sim,
        goTo: props.goTo,
        id: 'search'
      })
        .addTo(mapRef.current.leafletElement);
      // Only open popup if search ICAO has changed
      if (prevSearchRef.current !== props.search) {
        setTimeout(() => { searchRef.current && searchRef.current.openPopup() }, 10);
      }
    }

    prevSearchRef.current = props.search;
  }, [
    props.search,
    props.options.icaodata,
    props.options.planes,
    s.display.sim,
    s.display.markers.colors.selected,
    s.display.markers.sizes.selected,
    props.goTo
  ]);

  // Set search marker on top at each render
  React.useEffect(() => {
    if (searchRef.current) {
      searchRef.current.setZIndexOffset(100000);
    }
  }, [props.options]);

  // Clear canvas cache on settings change
  React.useEffect(() => {
    canvasRendererRef.current.clearCache();
  }, [s]);


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


  return (
    <Map
      center={[46.5344, 3.42167]}
      zoom={6}
      ref={mapRef}
      maxBounds={maxBounds}
      attributionControl={false}
      minZoom={2}
      maxZoom={12}
      renderer={canvasRendererRef.current}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LayersControl position="topleft">
        <LayersControl.Overlay name="FSE airports" checked={true}>
          <AirportsLayer
            icaos={props.icaos}
            icaodata={props.options.icaodata}
            fseicaodata={props.options.icaodata}
            color={s.display.markers.colors.fse}
            size={s.display.markers.sizes.fse}
            siminfo={s.display.sim}
            goTo={props.goTo}
          />
        </LayersControl.Overlay>
        <LayersControl.Overlay name="MSFS airports" checked={false}>
          <AirportsLayer
            icaos={msfsIcaos}
            icaodata={msfs}
            fseicaodata={props.options.icaodata}
            color={s.display.markers.colors.msfs}
            size={s.display.markers.sizes.msfs}
            siminfo={s.display.sim}
            sim="msfs"
            goTo={props.goTo}
          />
        </LayersControl.Overlay>
        <LayersControl.Overlay name="FSE airports landing area" checked={false}>
          <ZonesLayer
            icaos={props.icaos}
            icaodata={props.options.icaodata}
            renderer={canvasRendererRef.current}
            color={s.display.markers.colors.base}
          />
        </LayersControl.Overlay>
        <LayersControl.Overlay name="Job & plane search" checked={true}>
          <JobsLayer
            options={props.options}
            renderer={canvasRendererRef.current}
            goTo={props.goTo}
          />
        </LayersControl.Overlay>
      </LayersControl>
    </Map>
  );

});

export default FSEMap;
