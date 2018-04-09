import _ from 'lodash';
import $ from 'jquery';
import './leaflet'
import './leaflet.css!';
import './MultiOptionsPolyline'
import PolarMap from './polar_map'

export default function link(scope, elem, attrs, ctrl) {
  var data, panel, map;
  elem = elem.find('.satmap-panel');
  var $tooltip = $('<div id="tooltip">');

  ctrl.events.on('render', function() {
    render();
    ctrl.renderingCompleted();
  });

  function setElementHeight() {
    try {
      var height = ctrl.height || panel.height || ctrl.row.height;
      if (_.isString(height)) {
        height = parseInt(height.replace('px', ''), 10);
      }

      height -= 5; // padding
      height -= panel.title ? 24 : 9; // subtract panel title bar

      elem.css('height', height + 'px');

      return true;
    } catch(e) { // IE throws errors sometimes
      return false;
    }
  }

  function addMap() {
    var $panelContainer = elem.parents('.panel-container');
    var backgroundColor = $panelContainer.css('background-color');

    if (!ctrl.map) {
      while(elem[0].firstChild){
        elem[0].removeChild(elem[0].firstChild);
      }

      ctrl.map = L.map(elem[0]).setView([45.0451232, 41.9260474], 3);
      ctrl.hovers = L.featureGroup();
      ctrl.markers = L.featureGroup();

      L.tileLayer('http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(ctrl.map);

      ctrl.markers.addTo(ctrl.map);
      ctrl.hovers.addTo(ctrl.map);
    }

    ctrl.map.invalidateSize();
    ctrl.markers.clearLayers();

    _.each(data, (sat) => {
      if (_.isEmpty(sat.data)) {
        return;
      }

      if (ctrl.panel.trace) {
        var options = {
          color: sat.color,
          weight: 3,
          opacity: 0.8,
          lineCap: 'butt',
          smoothFactor: 1
        };

        if (panel.colorize) {
          options.multiOptions = {
            optionIdxFn: function (latLng, prevLatLng, index) {
              var i, value = latLng.value || 0, thresholds = panel.thresholds;

              if (!_.isFinite(value)) {
                return 0;
              }

              for (i = 0; i < thresholds.length; ++i) {
                if (value <= thresholds[i]) {
                    return i;
                }
              }

              return thresholds.length;
            },

            options: panel.colors.map(c => { return { color: c }; })
          };
        }
        else {
          options.multiOptions = {
            optionIdxFn: function() { return 0; },
            options: [{color: sat.color}]
          }
        }

        var groupIdx = 0;
        sat.data[0].groupIdx = groupIdx;

        _.reduce(sat.data, (prev, cur) => {
            cur.groupIdx = (cur.timestamp - prev.timestamp) < sat.timeStep * 20 ? groupIdx : ++groupIdx;
            return cur;
        });

        _(sat.data).groupBy('groupIdx').forEach((group, idx) => {
          var line = new L.multiOptionsPolyline(group, options);
          line.bindPopup(sat.sat);
          line.addTo(ctrl.markers);
          line.on('mouseover', function (e) { this.openPopup(); });

          if (idx !== groupIdx) {
            L.circleMarker(_.last(group), {
              radius: 4,
              color: sat.color,
              fillOpacity: 1
            }).addTo(ctrl.markers);
          }
        });
      }

      var marker = L.circleMarker(_.last(sat.data), {
        radius: 6,
        color: sat.color,
        fillOpacity: 1,
        sat: sat.sat
      });

      if (ctrl.panel.legendOnMap) {
        L.marker(_.last(sat.data), {
          icon: L.divIcon({html: '<div style="padding: 2px">' + sat.sat + '</div>', iconSize: 'auto', iconAnchor: L.point(-6, -6)})
        }).addTo(ctrl.markers);
      }

      marker.bindPopup(sat.sat);
      marker.addTo(ctrl.markers);
      marker.on('mouseover', function (e) { this.openPopup(); });
    });

    if (data.length > 0) {
      ctrl.map.fitBounds(ctrl.markers.getBounds());
    }
  }

  function render() {
    if (!ctrl.data) { return; }

    data = ctrl.data;
    panel = ctrl.panel;

    if (setElementHeight()) {
      if (panel.polar) {
        var canvas = document.createElement("canvas");
        canvas.style.display = 'block';
        canvas.style.margin = '0 auto';
        canvas.height = elem[0].offsetHeight;
        canvas.width = elem[0].offsetWidth;

        if (ctrl.map) {
          ctrl.map.remove();
          ctrl.hovers = ctrl.markers = ctrl.map = null;
        }

        while(elem[0].firstChild){
          elem[0].removeChild(elem[0].firstChild);
        }

        elem[0].className = 'satmap-panel';
        elem[0].appendChild(canvas);

        var polarMap = new PolarMap(canvas, {
          center: panel.polarCenter,
          drawLabels: panel.legendOnMap,
          drawTracks: panel.trace,
          colorizeTracks: panel.colorize,
          thresholds: panel.thresholds,
          colors: panel.colors
        });

        polarMap.draw(data);
      }
      else {
        addMap();
      }
    }
  }
}

