import L from "leaflet";


const AirportIcon = L.CircleMarker.extend({

  options: {
    type: 'default',
    id: 'default'
  },

  initialize: function(latlng, options) {
    L.CircleMarker.prototype.initialize.call(this, latlng, options);
  },

  _updatePath: function() {
    const radius = this._renderer._updateAirportIcon(this);
    if (radius) {
      this._radius = radius;
    }
  },

  setRadius: undefined,
  getRadius: undefined,
  setStyle: undefined

});
export default AirportIcon;