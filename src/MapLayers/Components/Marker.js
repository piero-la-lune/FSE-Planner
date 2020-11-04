import L from "leaflet";
import { getDistance, getRhumbLineBearing, convertDistance } from "geolib";


function arrow(plane, icao, icaodata) {
  if (icao === plane.home) { return ')'; }
  const fr = { latitude: icaodata[icao].lat, longitude: icaodata[icao].lon };
  const to = { latitude: icaodata[plane.home].lat, longitude: icaodata[plane.home].lon };
  const dir = Math.round(getRhumbLineBearing(fr, to));
  const dist = Math.round(convertDistance(getDistance(fr, to), 'sm'));
  return `
    <svg class="MuiSvgIcon-root MuiSvgIcon-fontSizeInherit" style="margin-left: 3px; transform: rotate(${dir}deg)" focusable="false" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"></path>
    </svg>)
    </p><p class="MuiTypography-root MuiTypography-body2" style="margin-top: -10px; margin-left: 18px; font-size: 0.7rem; color: #aaa">Home : ${plane.home} (${dir}° ${dist}NM)
  `;
}

function genPlanes(planes, icao, icaodata) {
  if (!planes) { return ''; }
  let p = '';
  for (var i = 0; i < planes.length; i++) {
    const plane = planes[i];
    p += `
      <p class="MuiTypography-root MuiTypography-body2" style="display: flex; align-items: center">
        ${plane.reg} : $${plane.dry}/$${plane.wet}
        ($${plane.bonus}${arrow(plane, icao, icaodata)}
      </p>
    `
  }
  return p;
}

export function genPopup(icao, icaodata, planes = {}, siminfo = 'msfs', sim = null) {
  return () => {
    if (sim) {
      return `<div class="MuiTypography-root MuiTypography-h6">${icao}</div>`;
    }
    let icaoTxt = icao;
    let simTxt = '';
    if (icaodata[icao][siminfo][0] !== icao) {
      icaoTxt = '<span class="striked">'+icao+'</span>';
      if (icaodata[icao][siminfo][0] !== null) {
        icaoTxt += '&nbsp;'+icaodata[icao][siminfo][0]
      }
    }
    if (icaodata[icao][siminfo].length > 1) {
      simTxt = '<div class="MuiTypography-body2 sim"><span>Other possible landing spots:</span><br />'+icaodata[icao][siminfo].slice(1).join('&nbsp;&nbsp;')+'</div>';
    }
    return `
      <div class="MuiTypography-root MuiTypography-h5 icao">
        ${icaoTxt}
        <a href="https://server.fseconomy.net/airport.jsp?icao=${icao}" target="fse" title="Go to FSE">
          <svg class="MuiSvgIcon-root" viewBox="0 0 24 24" aria-hidden="true"><path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"></path></svg>
        </a>
      </div>
      ${simTxt}
      ${genPlanes(planes, icao, icaodata)}
    `;
  }
}

function Marker({position, icon, icao, planes, icaodata}) {
  return L.marker(
    position,
    {
      icon: icon
    }
  ).bindPopup(genPopup(icao, icaodata, planes));
}

export default Marker;