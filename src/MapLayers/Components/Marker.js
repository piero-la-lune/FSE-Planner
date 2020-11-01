import L from "leaflet";
import { getDistance, getRhumbLineBearing, convertDistance } from "geolib";


function arrow(plane, icao, icaodata) {
  if (icao === plane.Home) { return ')'; }
  const fr = { latitude: icaodata[icao].lat, longitude: icaodata[icao].lon };
  const to = { latitude: icaodata[plane.Home].lat, longitude: icaodata[plane.Home].lon };
  const dir = Math.round(getRhumbLineBearing(fr, to));
  const dist = Math.round(convertDistance(getDistance(fr, to), 'sm'));
  return `
    <svg class="MuiSvgIcon-root MuiSvgIcon-fontSizeInherit" style="margin-left: 3px; transform: rotate(${dir}deg)" focusable="false" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"></path>
    </svg>)
    </p><p class="MuiTypography-root MuiTypography-body2" style="margin-top: -10px; margin-left: 18px; font-size: 0.7rem; color: #aaa">Home : ${plane.Home} (${dir}° ${dist}NM)
  `;
}

function genPlanes(planes, icao, icaodata) {
  if (!planes) { return ''; }
  let p = '';
  for (var i = 0; i < planes.length; i++) {
    const plane = planes[i];
    p += `
      <p class="MuiTypography-root MuiTypography-body2" style="display: flex; align-items: center">
        ${plane.Registration} : $${plane.RentalDry}/$${plane.RentalWet}
        ($${plane.Bonus}${arrow(plane, icao, icaodata)}
      </p>
    `
  }
  return p;
}

function Marker({position, icon, icao, planes, icaodata}) {
  return L.marker(
    position,
    {
      icon: icon
    }
  ).bindPopup(`
    <h6 class="MuiTypography-root MuiTypography-h6">
      <a class="MuiTypography-root MuiLink-root MuiLink-underlineHover MuiTypography-colorPrimary" href="https://server.fseconomy.net/airport.jsp?icao=${icao}" target="_blank">
        ${icao}
      </a>
    </h6>
    ${genPlanes(planes, icao, icaodata)}
  `);
}

export default Marker;