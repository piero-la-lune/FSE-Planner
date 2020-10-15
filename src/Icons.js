import L from "leaflet";

// SVG icon for normal airports
function civilSVG(color, size) {
  return '<svg width="'+size+'" height="'+size+'" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" class="cls-1" fill="'+color+'"/><path d="M4.369,13.557 L13.604,4.322 L15.913,6.631 L6.677,15.866 L4.369,13.557 Z" fill="#fff"/></svg>';
}

// SVG icon for military airports
function militarySVG(color, size) {
  return '<svg width="'+size+'" height="'+size+'" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" class="cls-1" fill="'+color+'"/><path d="M12.706,5.462 L11.814,5.462 L9.796,11.888 L7.732,5.462 L6.833,5.462 L4.913,15.007 L6.547,15.007 L7.576,9.863 L9.496,15.130 L10.102,15.130 L12.022,9.863 L13.012,15.007 L14.653,15.007 L12.706,5.462 Z" fill="#fff"/></svg>';
}

// SVG icon for marine airports
function waterSVG(color, size) {
  return '<svg width="'+size+'" height="'+size+'" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" class="cls-1" fill="'+color+'"/><rect x="9" y="4" width="2" height="13" fill="#fff"/><path d="M5.000,8.000 L5.000,7.000 L15.000,7.000 L15.000,8.000 L5.000,8.000 Z" fill="#fff"/><path d="M4.000,12.000 C4.000,12.000 7.038,15.066 10.000,15.000 C12.763,14.938 15.000,12.000 15.000,12.000 " fill="#fff"/></svg>';
}

// Build leaflet icon
const Icon = (html, size) => {
  return L.divIcon({
    html: html,
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
    popupAnchor: [0, -size/2],
    className: ''
  });
}


const CivilIcon = (color, size = 20) => {
  return Icon(civilSVG(color, size), size);
}
const MilitaryIcon = (color, size = 20) => {
  return Icon(militarySVG(color, size), size);
}
const WaterIcon = (color, size = 20) => {
  return Icon(waterSVG(color, size), size);
}


export { CivilIcon, MilitaryIcon, WaterIcon };