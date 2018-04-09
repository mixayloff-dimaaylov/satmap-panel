import angular from 'angular';
import _ from  'lodash';
import kbn from 'app/core/utils/kbn';
import $ from  'jquery';
import 'jquery.flot';
import 'jquery.flot.time';

angular.module('grafana.directives').directive('satmapLegend', function(popoverSrv, $timeout) {
  return {
    link: function(scope, elem) {
      var $container = $('<section class="graph-legend"></section>');
      var firstRender = true;
      var ctrl = scope.ctrl;
      var panel = ctrl.panel;
      var data;
      var seriesList;
      var i;

      ctrl.events.on('render', function() {
        data = ctrl.series;
        if (data) {
          for(var i in data) {
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

        $timeout(function() {
          popoverSrv.show({
            element: el[0],
            position: 'bottom center',
            template: '<gf-color-picker></gf-color-picker>',
            model: {
              series: series,
              toggleAxis: function() {},
              colorSelected: function(color) {
                ctrl.changeSeriesColor(series, color);
              }
            },
          });
        });
      }

      function render() {
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


