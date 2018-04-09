import angular from 'angular';
import _ from  'lodash';
import kbn from 'app/core/utils/kbn';

angular.module('grafana.directives').directive('arrayList', function() {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function(scope, elem, attr, ngModel) {
      function fromList(text) {
          return _.filter(text.split(',').map(e => parseFloat(e.trim())));
      }

      function toList(array) {
          return array.join(', ');
      }

      ngModel.$parsers.push(fromList);
      ngModel.$formatters.push(toList);
    }
  };
});


