import {MetricsPanelCtrl} from 'app/plugins/sdk';
import './leaflet'
import _ from 'lodash';
import kbn from 'app/core/utils/kbn';
import core from 'app/core/core';
import TimeSeries from 'app/core/time_series';
import rendering from './rendering';
import legend from './legend';
import arrayList from './array_list';
import geohash from './geohash'

export class SatMapCtrl extends MetricsPanelCtrl {

  constructor($scope, $injector, $rootScope) {
    super($scope, $injector);
    this.$rootScope = $rootScope;

    var panelDefaults = {
      legend: {
        show: true, // disable/enable legend
      },
      links: [],
      datasource: null,
      maxDataPoints: 2,
      interval: null,
      targets: [{}],
      cacheTimeout: null,
      nullPointMode: 'connected',
      legendOnMap: true,
      aliasColors: {},
      fontSize: '80%',
      satTag: "sat",
      trace: true,
      thresholds: [0.2, 0.3, 0.4],
      colors: ['#5b94ff', '#58ef5b', '#fff882', '#ff5b5b'],
      polar: false,
      polarCenter: {lat: 45.040638, lng: 41.910311},
      colorize: false
    };

    _.defaults(this.panel, panelDefaults);
    _.defaults(this.panel.legend, panelDefaults.legend);

    this.events.on('render', this.onRender.bind(this));
    this.events.on('data-received', this.onDataReceived.bind(this));
    this.events.on('data-error', this.onDataError.bind(this));
    this.events.on('data-snapshot-load', this.onDataReceived.bind(this));
    this.events.on('init-edit-mode', this.onInitEditMode.bind(this));

    core.appEvents.on('graph-hover', evt => {
        // ignore other graph hover events if shared tooltip is disabled
        if (!this.dashboard.sharedTooltipModeEnabled()) {
          return;
        }

        // ignore if we are the emitter
        if (evt.panel.id === this.panel.id || this.otherPanelInFullscreenMode() || !this.hovers) {
          return;
        }

        this.hovers.clearLayers();
        _.forEach(this.nearestPoints(evt.pos.x), p => {
          var marker = L.circleMarker(p, {
            radius: 2,
            color: '#000',
            fillOpacity: 1,
          });

          marker.addTo(this.hovers);
        });
      }
    );

    core.appEvents.on('graph-hover-clear', (event, info) => {
        if (this.hovers) {
          this.hovers.clearLayers();
        }
      }
    );
  }

  onInitEditMode() {
    this.addEditorTab('Options', 'public/plugins/satmap-panel/editor.html', 2);
    this.unitFormats = kbn.getUnitFormats();
  }

  setUnitFormat(subItem) {
    this.panel.format = subItem.value;
    this.render();
  }

  onDataError() {
    this.series = [];
    this.render();
  }

  changeSeriesColor(series, color) {
    series.color = color;
    this.panel.aliasColors[series.alias] = series.color;
    this.render();
  }

  nearestPoints(time) {
    var _binSearch = (series) => {
      var idx, mindiff = null;

      for (idx = 0; idx < series.data.length; idx++) {
          var diff = Math.abs(series.data[idx].timestamp - time);

          if (mindiff === null || diff < mindiff) {
              mindiff = diff;
          } else {
              break;
          }
      }

      return series.data[idx];
    }

    return _(this.data).map(_binSearch).filter().value();
}

  onRender() {
    this.data = this.parseSeries(this.series);
  }

  parseSeries(series) {
    var green = '#013220';
    var blue = '#00FF00';
    
    return _.map(this.series, (serie, i) => {
      return {
        label: serie.alias,
        sat: serie.sat,
        lastMetrics: serie.lastMetrics,
        data: _(serie.flotpairs).map(point => point[1]).value(),
        color: (serie.sat.startsWith('GLONASS') ? green : blue),
        timeStep: serie.stats.timeStep || 1
      };
    });
  }

  onDataReceived(dataList) {
    var satRe = new RegExp(this.panel.satTag + "=(\\w+)");

    this.series = _.chain(dataList.map(this.seriesHandler.bind(this)))
      .groupBy(data => _.last(data.alias.match(satRe))).map((group, sat) => {
          _.first(group).flotpairs.forEach(point => {
            var coord = geohash.decode_int(point[1]);
            point[1] = L.latLng(coord.latitude, coord.longitude);
            point[1].timestamp = point[0];

            if (group.length > 1) {
              var delta = group[1].stats.timeStep / 2;
              var value = _.find(group[1].flotpairs, d => (d[0] >= point[0] - delta) && (d[0] <= point[0] + delta));
              if (value !== undefined) point[1].value = value[1];
            }
          });

      
        group[0].lastMetrics = _.chain(group)
          .slice(1)
          .map(function(g) { 
            return { 
              label: g.label, 
              value: _.last(g.flotpairs)[1] 
            }; 
          }).value();
      
        group[0].sat = sat;
        return group[0];
      })
      .value()


    this.data = this.parseSeries(this.series);
    this.render(this.data);
  }

  seriesHandler(seriesData) {
    var series = new TimeSeries({
      datapoints: seriesData.datapoints,
      alias: seriesData.target
    });

    series.flotpairs = series.getFlotPairs(this.panel.nullPointMode);
    return series;
  }

  formatValue(value) {
    return value;
  }

  toggleSeries(seriesInfo, e) {
    var map = this.map;

    this.markers.eachLayer(function (marker) {
      if (_.get(marker, 'options.sat') == seriesInfo.sat) {
        map.setView(marker.getLatLng());
        marker.openPopup();
        return;
      }
    });
  }

  link(scope, elem, attrs, ctrl) {
    rendering(scope, elem, attrs, ctrl);
  }
}

SatMapCtrl.templateUrl = 'module.html';
