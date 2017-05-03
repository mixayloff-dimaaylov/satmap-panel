import {MetricsPanelCtrl} from 'app/plugins/sdk';
import _ from 'lodash';
import kbn from 'app/core/utils/kbn';
import TimeSeries from 'app/core/time_series';
import rendering from './rendering';
import legend from './legend';
import geohash from './geohash'

export class PieChartCtrl extends MetricsPanelCtrl {

  constructor($scope, $injector, $rootScope) {
    super($scope, $injector);
    this.$rootScope = $rootScope;

    var panelDefaults = {
      legend: {
        show: true, // disable/enable legend
      },
      links: [],
      datasource: null,
      maxDataPoints: 3,
      interval: null,
      targets: [{}],
      cacheTimeout: null,
      nullPointMode: 'connected',
      legendType: 'Под картой',
      aliasColors: {},
      fontSize: '80%',
      satTag: "sat",
      trace: true
    };

    _.defaults(this.panel, panelDefaults);
    _.defaults(this.panel.legend, panelDefaults.legend);

    this.events.on('render', this.onRender.bind(this));
    this.events.on('data-received', this.onDataReceived.bind(this));
    this.events.on('data-error', this.onDataError.bind(this));
    this.events.on('data-snapshot-load', this.onDataReceived.bind(this));
    this.events.on('init-edit-mode', this.onInitEditMode.bind(this));
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

  onRender() {
    this.data = this.parseSeries(this.series);
  }

  parseSeries(series) {
    return _.map(this.series, (serie, i) => {
      return {
        label: serie.alias,
        sat: serie.sat,
        data: _(serie.datapoints).map(point => point[0]).value(),
        color: this.panel.aliasColors[serie.alias] || this.$rootScope.colors[i]
      };
    });
  }

  onDataReceived(dataList) {
    var satRe = new RegExp(this.panel.satTag + "=(\\w+)");

    this.series = _.chain(dataList.map(this.seriesHandler.bind(this)))
      .groupBy(data => _.last(data.alias.match(satRe))).map((group, sat) => {
          _.first(group).datapoints.forEach(point => {
            var coord = geohash.decode_int(point[0]);
            point[0] = L.latLng(coord.latitude, coord.longitude);

            if (group.length > 1) {
              var delta = group[1].stats.timeStep / 2;
              var value = _.find(group[1].datapoints, d => (d[1] >= point[1] - delta) && (d[1] <= point[1] + delta));
              if (value !== undefined) point[0].value = value[0];
            }
          });
        
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

PieChartCtrl.templateUrl = 'module.html';
