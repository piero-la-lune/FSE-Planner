import L from "leaflet";


const JobSegment = L.Polyline.extend({

  initialize: function(latlngs, options) {
    L.Polyline.prototype.initialize.call(this, latlngs, options);
    this.on('mouseover', () => {
      this.options.prevColor = this.options.color;
      this.setStyle({color: this.options.highlight});
    });
    this.on('mouseout', () => {
      this.setStyle({color: this.options.prevColor});
    })
  },

  _updatePath: function() {
    this._renderer._updateArrowedPath(this);
  },

  _clickTolerance: function() {
    return Math.max(this.options.weight/2, 8);
  }

});
export default JobSegment;