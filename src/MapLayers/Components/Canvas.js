import L from "leaflet";


const Canvas = L.Canvas.extend({

  _icons: {},

  clearCache: function(id = null) {
    if (!id) {
      this._icons = {};
    }
    else {
      delete this._icons[id];
    }
    if (!this._map) { return; }
    this._redraw();
  },

  _updateAirportIcon: function (layer) {
    if (!this._drawing || layer._empty()) { return; }

    const zoom = this._map._zoom;
    const minZoom = this._map.options.minZoom;
    const maxZoom = this._map.options.maxZoom;
    const color = layer.options.color;
    const fillColor = layer.options.fillColor;
    const radius = layer.options.radius;
    const type = layer.options.type;
    const id = 'ID'+radius+'-'+color+'-'+fillColor;
    const p = layer._point;

    // Build the image if does not exists yet
    if (!this._icons[id]) {
      this._icons[id] = {
        civil1: {},
        civil2: {},
        civil3: {},
        water1: {},
        water2: {},
        water3: {},
        military1: {},
        military2: {},
        military3: {},
        default: {}
      }
    }
    if (!this._icons[id][type][zoom]) {
      const offscreen = document.createElement("canvas");
      const octx = offscreen.getContext("2d");

      let r = null;
      if (zoom <= 7) {
        r = (radius - 0.5)/(7 - minZoom)*(zoom - minZoom) + 0.5;
      }
      else {
        const maxRadius = Math.max(radius, 15);
        r = (maxRadius - radius)/(maxZoom - 7)*(zoom - 7) + radius;
      }

      octx.scale(r/10, r/10);

      // Draw out circle
      octx.beginPath();
      octx.arc(10, 10, 10, 0, (2*Math.PI));
      octx.fillStyle = fillColor;
      octx.fill();
      octx.closePath();

      // Draw inside pattern
      octx.beginPath();
      switch(type) {
        case "civil1":
          octx.arc(10, 10, 8, 0, (2*Math.PI));
          break;
        case "civil2":
          octx.moveTo(4.343, 14.243);
          octx.lineTo(14.642, 3.944);
          octx.lineTo(16.056, 5.358);
          octx.lineTo(5.757, 15.657);
          octx.lineTo(4.343, 14.243);
          break;
        case "civil3":
          octx.moveTo(2.649, 10.645);
          octx.lineTo(14.774, 3.645);
          octx.lineTo(15.774, 5.377);
          octx.lineTo(3.649, 12.377);
          octx.lineTo(2.649, 10.645);
          octx.moveTo(9.219, 3.438);
          octx.lineTo(16.219, 15.562);
          octx.lineTo(14.487, 16.562);
          octx.lineTo(7.487, 4.438);
          octx.lineTo(9.219, 3.438);
          break;
        case "water1":
        case "water2":
        case "water3":
          octx.arc(10, 10, 6.5, 0+0.5, Math.PI-0.5);
          octx.strokeStyle = color;
          octx.lineWidth = 1.5;
          octx.stroke();
          octx.closePath();
          octx.beginPath();
          octx.rect(9, 4, 2, 13);
          octx.moveTo(5.000, 8.000);
          octx.lineTo(5.000, 7.000);
          octx.lineTo(15.000, 7.000);
          octx.lineTo(15.000, 8.000);
          octx.lineTo(5.000, 8.000);
          octx.moveTo(4.000, 12.000);
          break;
        case "military1":
        case "military2":
        case "military3":
          octx.moveTo(12.706, 5.462);
          octx.lineTo(11.814, 5.462);
          octx.lineTo(9.796, 11.888);
          octx.lineTo(7.732, 5.462);
          octx.lineTo(6.833, 5.462);
          octx.lineTo(4.913, 15.007);
          octx.lineTo(6.547, 15.007);
          octx.lineTo(7.576, 9.863);
          octx.lineTo(9.496, 15.130);
          octx.lineTo(10.102, 15.130);
          octx.lineTo(12.022, 9.863);
          octx.lineTo(13.012, 15.007);
          octx.lineTo(14.653, 15.007);
          octx.lineTo(12.706, 5.462);
          break;
        default:
          break;
      }
      octx.fillStyle = color;
      octx.fill();
      octx.closePath();

      octx.setTransform(1, 0, 0, 1, 0, 0);

      this._icons[id][type][zoom] = {r: r, canvas: offscreen};
    }

    const {r, canvas} = this._icons[id][type][zoom];
    this._ctx.globalAlpha = 1;
    this._ctx.drawImage(canvas, p.x - r, p.y - r);

    return r;

  },

  _updateArrowedPath: function(layer) {
    if (!layer._parts.length) { return; }

    const zoom = this._map._zoom;
    const minZoom = this._map.options.minZoom;
    const maxZoom = this._map.options.maxZoom;
    let ratio;
    if (zoom <= 7) {
      ratio = (1 - 0.05)/(7 - minZoom)*(zoom - minZoom) + 0.05;
    }
    else {
      ratio = (2 - 1)/(maxZoom - 7)*(zoom - 7) + 1;
    }

    const p1 = layer._parts[0][0];
    const p2 = layer._parts[0][1];
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    const norm = Math.sqrt(dx*dx+dy*dy);
    const udx = dx/norm;
    const udy = dy/norm;

    const ax = udx * Math.sqrt(3)/2 - udy * 1/2;
    const ay = udx * 1/2 + udy * Math.sqrt(3)/2;
    const bx = udx * Math.sqrt(3)/2 + udy * 1/2;
    const by =  - udx * 1/2 + udy * Math.sqrt(3)/2;

    this._ctx.beginPath();

    this._ctx.moveTo(p1.x, p1.y);
    this._ctx.lineTo(p2.x, p2.y);

    const l = 20*ratio;

    this._ctx.moveTo(p1.x - dx/2 + l * ax, p1.y - dy/2 + l * ay);
    this._ctx.lineTo(p1.x - dx/2, p1.y - dy/2);
    this._ctx.lineTo(p1.x - dx/2 + l * bx, p1.y - dy/2 + l * by);

    if (layer.options.bothWays) {
      this._ctx.moveTo(p1.x - dx/2 - l * ax, p1.y - dy/2 - l * ay);
      this._ctx.lineTo(p1.x - dx/2, p1.y - dy/2);
      this._ctx.lineTo(p1.x - dx/2 - l * bx, p1.y - dy/2 - l * by);
    }

    this._ctx.globalAlpha = layer.options.opacity;
    this._ctx.strokeStyle = layer.options.color;
    this._ctx.lineWidth = layer.options.weight*ratio;
    this._ctx.stroke();
    this._ctx.closePath();
  }

});
export default Canvas;
