import L from "leaflet";
import "leaflet-polylinedecorator";


// Generate arrows
function Arrow(polyline, {color, weight, rleg, renderer}) {
  const patterns = [{
    offset: '10%',
    endOffset: '10%',
    repeat: 800,
    symbol: L.Symbol.arrowHead({
      pixelSize: 15,
      polygon: false,
      pathOptions: {
        interactive: false,
        stroke: true,
        color: color,
        weight: weight,
        renderer: renderer
      }
    })
  }];

  // If both way leg, add return arrow
  if (rleg) {
    patterns.push({
      offset: '10%',
      endOffset: '10%',
      repeat: 800,
      symbol: L.Symbol.arrowHead({
        headAngle: 300,
        pixelSize: 15,
        polygon: false,
        pathOptions: {
          interactive: false,
          stroke: true,
          color: color,
          weight: weight,
          renderer: renderer
        }
      })
    });
  }

  return L.polylineDecorator(polyline, {
      patterns: patterns
  });
}


// Generate cargo text
function cargo(cargo, pay, direction) {
  const c = [];
  if (cargo.passengers) { c.push(`${cargo.passengers} passengers`); }
  if (cargo.kg) { c.push(`${cargo.kg} kg`); }
  return `
    <p class="MuiTypography-root MuiTypography-body2" style="display: flex; align-items: center">
      <svg class="MuiSvgIcon-root MuiSvgIcon-fontSizeInherit" focusable="false" viewBox="0 0 24 24" aria-hidden="true" style="transform: rotate(${direction}deg);">
        <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"></path>
      </svg>
      <span>&nbsp;${c.join(', ')}&nbsp;($${pay})</span>
    </p>
  `;
}

// Generate tooltip
function tooltip({leg, type, rleg}) {
  let t = '';
  if (leg.amount || (rleg && rleg.amount)) {
    t += `
      <p class="MuiTypography-root MuiTypography-body1">
        <b>${leg.distance}NM</b>
      </p>
    `;
    if (leg.amount) { t += cargo({[type]: leg.amount}, leg.pay, leg.direction); }
    if (rleg && rleg.amount) { t += cargo({[type]: rleg.amount}, rleg.pay, rleg.direction); }
  }
  if (leg.flight || (rleg && rleg.flight )) {
    t += `
      <p class="MuiTypography-root MuiTypography-body1" style="margin-top: 8px">
        <b>My flight</b>
      </p>
    `;
    if (leg.flight) { t += cargo(leg.flight, leg.flight.pay, leg.direction); }
    if (rleg && rleg.flight) { t += cargo(rleg.flight, rleg.flight.pay, rleg.direction); }
  }
  return t;
}


// Generate all components to render leg
function Job(props) {
  const layer = L.layerGroup();

  // Add line
  const polyline = L.polyline(props.positions, {
    weight: props.weight,
    color: props.color,
    renderer: props.renderer
  }).addTo(layer);

  // Add line arrow
  const arrow = Arrow(polyline, props).addTo(layer);

  // Add line used for mouse focus
  L.polyline(props.positions, {
    weight: Math.max(props.weight, 20),
    color: props.color,
    opacity: 0,
    renderer: props.renderer
  })
    .bindTooltip(tooltip(props), {sticky: true})
    .addTo(layer)
    .on('mouseover', () => {
      polyline.setStyle({ color: props.highlight });
      arrow.setStyle({ color: props.highlight });
    })
    .on('mouseout', () => {
      polyline.setStyle({ color: props.color });
      arrow.setStyle({ color: props.color });
    });

  return layer
}


export default Job;