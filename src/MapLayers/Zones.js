import L from "leaflet";

function ZonesLayer(props) {

  const group = L.layerGroup();
  
  Object.keys(props.zones).forEach(icao => {

    // Create lines
    L.polyline(
      props.zones[icao],
      {
        weight: 1,
        color: '#888',
        interactive: false,
        fill: false
    })
      .addTo(group);
    L.polyline(
      props.zones[icao].map(elm => [elm[0], elm[1]+360]),
      {
        weight: 1,
        color: '#888',
        interactive: false,
        fill: false
    })
      .addTo(group);
    L.polyline(
      props.zones[icao].map(elm => [elm[0], elm[1]-360]),
      {
        weight: 1,
        color: '#888',
        interactive: false,
        fill: false
    })
      .addTo(group);
  });

  return group;

};

export default ZonesLayer;
