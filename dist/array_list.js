'use strict';

System.register(['angular', 'lodash', 'app/core/utils/kbn'], function (_export, _context) {
  "use strict";

  var angular, _, kbn;

  return {
    setters: [function (_angular) {
      angular = _angular.default;
    }, function (_lodash) {
      _ = _lodash.default;
    }, function (_appCoreUtilsKbn) {
      kbn = _appCoreUtilsKbn.default;
    }],
    execute: function () {

      angular.module('grafana.directives').directive('arrayList', function () {
        return {
          restrict: 'A',
          require: 'ngModel',
          link: function link(scope, elem, attr, ngModel) {
            function fromList(text) {
              return _.filter(text.split(',').map(function (e) {
                return parseFloat(e.trim());
              }));
            }

            function toList(array) {
              return array.join(', ');
            }

            ngModel.$parsers.push(fromList);
            ngModel.$formatters.push(toList);
          }
        };
      });
    }
  };
});
//# sourceMappingURL=array_list.js.map
