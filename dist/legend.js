'use strict';

System.register(['angular', 'lodash', 'app/core/utils/kbn', 'jquery', 'jquery.flot', 'jquery.flot.time'], function (_export, _context) {
  "use strict";

  var angular, _, kbn, $;

  return {
    setters: [function (_angular) {
      angular = _angular.default;
    }, function (_lodash) {
      _ = _lodash.default;
    }, function (_appCoreUtilsKbn) {
      kbn = _appCoreUtilsKbn.default;
    }, function (_jquery) {
      $ = _jquery.default;
    }, function (_jqueryFlot) {}, function (_jqueryFlotTime) {}],
    execute: function () {

      angular.module('grafana.directives').directive('piechartLegend', function (popoverSrv, $timeout) {
        return {
          link: function link(scope, elem) {
            var $container = $('<section class="graph-legend"></section>');
            var firstRender = true;
            var ctrl = scope.ctrl;
            var panel = ctrl.panel;
            var data;
            var seriesList;
            var i;

            ctrl.events.on('render', function () {
              data = ctrl.series;
              if (data) {
                for (var i in data) {
                  data[i].color = ctrl.data[i].color;
                  data[i].sat = ctrl.data[i].sat;
                }
                render();
              }
            });

            function getSeriesIndexForElement(el) {
              return el.parents('[data-series-index]').data('series-index');
            }

            function toggleSeries(e) {
              var el = $(e.currentTarget);
              var index = getSeriesIndexForElement(el);
              var seriesInfo = seriesList[index];
              ctrl.toggleSeries(seriesInfo, e);
            }

            function openColorSelector(e) {
              // if we clicked inside poup container ignore click
              if ($(e.target).parents('.popover').length) {
                return;
              }

              var el = $(e.currentTarget).find('.fa-minus');
              var index = getSeriesIndexForElement(el);
              var series = seriesList[index];

              $timeout(function () {
                popoverSrv.show({
                  element: el[0],
                  position: 'bottom center',
                  template: '<gf-color-picker></gf-color-picker>',
                  model: {
                    series: series,
                    toggleAxis: function toggleAxis() {},
                    colorSelected: function colorSelected(color) {
                      ctrl.changeSeriesColor(series, color);
                    }
                  }
                });
              });
            }

            function render() {
              if (panel.legendType === 'На карте') {
                $container.empty();
                return;
              }

              if (firstRender) {
                elem.append($container);
                $container.on('click', '.graph-legend-icon', openColorSelector);
                $container.on('click', '.graph-legend-alias', toggleSeries);
                firstRender = false;
              }

              seriesList = data;

              $container.empty();

              for (i = 0; i < seriesList.length; i++) {
                var series = seriesList[i];

                // ignore empty series
                if (panel.legend.hideEmpty && series.allIsNull) {
                  continue;
                }
                // ignore series excluded via override
                if (!series.legend) {
                  continue;
                }

                var html = '<div class="graph-legend-series';
                html += '" data-series-index="' + i + '">';
                html += '<span class="graph-legend-icon" style="float:none;">';
                html += '<i class="fa fa-minus fa-rocket pointer" style="color:' + series.color + '"></i>';
                html += '</span>';

                html += '<span class="graph-legend-alias" style="float:none;">';
                html += '<a>' + series.sat + '</a>';
                html += '</span>';
                html += '</div>';
                $container.append($(html));
              }
            }
          }
        };
      });
    }
  };
});
//# sourceMappingURL=legend.js.map
