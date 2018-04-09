'use strict';

System.register(['lodash', './satmap_ctrl'], function (_export, _context) {
  "use strict";

  var _, SatMapCtrl;

  return {
    setters: [function (_lodash) {
      _ = _lodash.default;
    }, function (_satmap_ctrl) {
      SatMapCtrl = _satmap_ctrl.SatMapCtrl;
    }],
    execute: function () {
      _export('PanelCtrl', SatMapCtrl);
    }
  };
});
//# sourceMappingURL=module.js.map
