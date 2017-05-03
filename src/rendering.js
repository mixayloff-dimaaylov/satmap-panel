import _ from 'lodash';
import $ from 'jquery';
import './leaflet'
import './leaflet.css!';
import './MultiOptionsPolyline'

export default function link(scope, elem, attrs, ctrl) {
  var data, panel, map;
  elem = elem.find('.piechart-panel');
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
      ctrl.map = L.map(elem[0]).setView([45.0451232, 41.9260474], 3);
      ctrl.markers = L.featureGroup();
      
      L.tileLayer('http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(ctrl.map);
      
      ctrl.markers.addTo(ctrl.map);
    }
    
    ctrl.map.invalidateSize();
    ctrl.markers.clearLayers();
    
    _.each(data, (sat) => {
      if (_.isEmpty(sat.data)) {
        return;
      }
      
      if (ctrl.panel.trace) {
        // var points = _.map(sat.data, (pos) => L.latLng(pos[0], pos[1]));
        
        var line = new L.multiOptionsPolyline(sat.data, {
          multiOptions: {
              optionIdxFn: function (latLng, prevLatLng, index) {
                var i, value = latLng.value, thresholds = [0.2, 0.3, 0.335];
                
                for (i = 0; i < thresholds.length; ++i) {
                  if (value <= thresholds[i]) {
                      return i;
                  }
                }

                return thresholds.length;
              },

              options: [
                  {color: '#5b94ff'},
                  {color: '#58ef5b'},
                  {color: '#fff882'},
                  {color: '#ff5b5b'}
              ]
          },
          color: sat.color,
          weight: 3,
          opacity: 0.8,
          lineCap: 'butt',
          smoothFactor: 1
        });
        
        line.bindPopup(sat.sat);
        line.addTo(ctrl.markers);
        line.on('mouseover', function (e) { this.openPopup(); });  
      }
      
      var marker = L.circleMarker(_.last(sat.data), {
        radius: 6,
        color: sat.color,
        fillOpacity: 1,
        sat: sat.sat
      });
      
      if (ctrl.panel.legendType == "На карте") {
        L.marker(_.last(sat.data), {
          icon: L.divIcon({html: '<div style="padding: 2px">' + sat.sat + '</div>', iconSize: 'auto', iconAnchor: L.point(-6, -6)})
        }).addTo(ctrl.markers);
      }
      
      marker.bindPopup(sat.sat);
      marker.addTo(ctrl.markers);
      marker.on('mouseover', function (e) { this.openPopup(); });
    });
  }

  function render() {
    if (!ctrl.data) { return; }

    data = ctrl.data;
    panel = ctrl.panel;

    if (setElementHeight()) {
      addMap();
    }
  }
}

