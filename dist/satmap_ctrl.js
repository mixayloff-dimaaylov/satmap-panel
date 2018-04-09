'use strict';

System.register(['app/plugins/sdk', './leaflet', 'lodash', 'app/core/utils/kbn', 'app/core/core', 'app/core/time_series', './rendering', './legend', './array_list', './geohash'], function (_export, _context) {
  "use strict";

  var MetricsPanelCtrl, _, kbn, core, TimeSeries, rendering, legend, arrayList, geohash, _createClass, SatMapCtrl;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  return {
    setters: [function (_appPluginsSdk) {
      MetricsPanelCtrl = _appPluginsSdk.MetricsPanelCtrl;
    }, function (_leaflet) {}, function (_lodash) {
      _ = _lodash.default;
    }, function (_appCoreUtilsKbn) {
      kbn = _appCoreUtilsKbn.default;
    }, function (_appCoreCore) {
      core = _appCoreCore.default;
    }, function (_appCoreTime_series) {
      TimeSeries = _appCoreTime_series.default;
    }, function (_rendering) {
      rendering = _rendering.default;
    }, function (_legend) {
      legend = _legend.default;
    }, function (_array_list) {
      arrayList = _array_list.default;
    }, function (_geohash) {
      geohash = _geohash.default;
    }],
    execute: function () {
      _createClass = function () {
        function defineProperties(target, props) {
          for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
          }
        }

        return function (Constructor, protoProps, staticProps) {
          if (protoProps) defineProperties(Constructor.prototype, protoProps);
          if (staticProps) defineProperties(Constructor, staticProps);
          return Constructor;
        };
      }();

      _export('SatMapCtrl', SatMapCtrl = function (_MetricsPanelCtrl) {
        _inherits(SatMapCtrl, _MetricsPanelCtrl);

        function SatMapCtrl($scope, $injector, $rootScope) {
          _classCallCheck(this, SatMapCtrl);

          var _this = _possibleConstructorReturn(this, (SatMapCtrl.__proto__ || Object.getPrototypeOf(SatMapCtrl)).call(this, $scope, $injector));

          _this.$rootScope = $rootScope;

          var panelDefaults = {
            legend: {
              show: true // disable/enable legend
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
            polarCenter: { lat: 45.040638, lng: 41.910311 },
            colorize: false
          };

          _.defaults(_this.panel, panelDefaults);
          _.defaults(_this.panel.legend, panelDefaults.legend);

          _this.events.on('render', _this.onRender.bind(_this));
          _this.events.on('data-received', _this.onDataReceived.bind(_this));
          _this.events.on('data-error', _this.onDataError.bind(_this));
          _this.events.on('data-snapshot-load', _this.onDataReceived.bind(_this));
          _this.events.on('init-edit-mode', _this.onInitEditMode.bind(_this));

          core.appEvents.on('graph-hover', function (evt) {
            // ignore other graph hover events if shared tooltip is disabled
            if (!_this.dashboard.sharedTooltipModeEnabled()) {
              return;
            }

            // ignore if we are the emitter
            if (evt.panel.id === _this.panel.id || _this.otherPanelInFullscreenMode() || !_this.hovers) {
              return;
            }

            _this.hovers.clearLayers();
            _.forEach(_this.nearestPoints(evt.pos.x), function (p) {
              var marker = L.circleMarker(p, {
                radius: 2,
                color: '#000',
                fillOpacity: 1
              });

              marker.addTo(_this.hovers);
            });
          });

          core.appEvents.on('graph-hover-clear', function (event, info) {
            if (_this.hovers) {
              _this.hovers.clearLayers();
            }
          });
          return _this;
        }

        _createClass(SatMapCtrl, [{
          key: 'onInitEditMode',
          value: function onInitEditMode() {
            this.addEditorTab('Options', 'public/plugins/satmap-panel/editor.html', 2);
            this.unitFormats = kbn.getUnitFormats();
          }
        }, {
          key: 'setUnitFormat',
          value: function setUnitFormat(subItem) {
            this.panel.format = subItem.value;
            this.render();
          }
        }, {
          key: 'onDataError',
          value: function onDataError() {
            this.series = [];
            this.render();
          }
        }, {
          key: 'changeSeriesColor',
          value: function changeSeriesColor(series, color) {
            series.color = color;
            this.panel.aliasColors[series.alias] = series.color;
            this.render();
          }
        }, {
          key: 'nearestPoints',
          value: function nearestPoints(time) {
            var _binSearch = function _binSearch(series) {
              var idx,
                  mindiff = null;

              for (idx = 0; idx < series.data.length; idx++) {
                var diff = Math.abs(series.data[idx].timestamp - time);

                if (mindiff === null || diff < mindiff) {
                  mindiff = diff;
                } else {
                  break;
                }
              }

              return series.data[idx];
            };

            return _(this.data).map(_binSearch).filter().value();
          }
        }, {
          key: 'onRender',
          value: function onRender() {
            this.data = this.parseSeries(this.series);
          }
        }, {
          key: 'parseSeries',
          value: function parseSeries(series) {
            var _this2 = this;

            return _.map(this.series, function (serie, i) {
              return {
                label: serie.alias,
                sat: serie.sat,
                data: _(serie.flotpairs).map(function (point) {
                  return point[1];
                }).value(),
                color: _this2.panel.aliasColors[serie.alias] || _this2.$rootScope.colors[i],
                timeStep: serie.stats.timeStep || 1
              };
            });
          }
        }, {
          key: 'onDataReceived',
          value: function onDataReceived(dataList) {
            var satRe = new RegExp(this.panel.satTag + "=(\\w+)");

            this.series = _.chain(dataList.map(this.seriesHandler.bind(this))).groupBy(function (data) {
              return _.last(data.alias.match(satRe));
            }).map(function (group, sat) {
              _.first(group).flotpairs.forEach(function (point) {
                var coord = geohash.decode_int(point[1]);
                point[1] = L.latLng(coord.latitude, coord.longitude);
                point[1].timestamp = point[0];

                if (group.length > 1) {
                  var delta = group[1].stats.timeStep / 2;
                  var value = _.find(group[1].flotpairs, function (d) {
                    return d[0] >= point[0] - delta && d[0] <= point[0] + delta;
                  });
                  if (value !== undefined) point[1].value = value[1];
                }
              });

              group[0].sat = sat;
              return group[0];
            }).value();

            this.data = this.parseSeries(this.series);
            this.render(this.data);
          }
        }, {
          key: 'seriesHandler',
          value: function seriesHandler(seriesData) {
            var series = new TimeSeries({
              datapoints: seriesData.datapoints,
              alias: seriesData.target
            });

            series.flotpairs = series.getFlotPairs(this.panel.nullPointMode);
            return series;
          }
        }, {
          key: 'formatValue',
          value: function formatValue(value) {
            return value;
          }
        }, {
          key: 'toggleSeries',
          value: function toggleSeries(seriesInfo, e) {
            var map = this.map;

            this.markers.eachLayer(function (marker) {
              if (_.get(marker, 'options.sat') == seriesInfo.sat) {
                map.setView(marker.getLatLng());
                marker.openPopup();
                return;
              }
            });
          }
        }, {
          key: 'link',
          value: function link(scope, elem, attrs, ctrl) {
            rendering(scope, elem, attrs, ctrl);
          }
        }]);

        return SatMapCtrl;
      }(MetricsPanelCtrl));

      _export('SatMapCtrl', SatMapCtrl);

      SatMapCtrl.templateUrl = 'module.html';
    }
  };
});
//# sourceMappingURL=satmap_ctrl.js.map
