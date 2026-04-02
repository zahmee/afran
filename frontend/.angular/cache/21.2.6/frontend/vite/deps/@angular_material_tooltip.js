import {
  MAT_TOOLTIP_DEFAULT_OPTIONS,
  MAT_TOOLTIP_SCROLL_STRATEGY,
  MatTooltip,
  SCROLL_THROTTLE_MS,
  TOOLTIP_PANEL_CLASS,
  TooltipComponent,
  getMatTooltipInvalidPositionError
} from "./chunk-IMOARKAZ.js";
import {
  OverlayModule
} from "./chunk-BZNW4UTO.js";
import {
  CdkScrollableModule
} from "./chunk-LMOYPRBW.js";
import "./chunk-GS4F2NF3.js";
import {
  A11yModule
} from "./chunk-6W7PN4YA.js";
import "./chunk-PLJ2QXBA.js";
import "./chunk-AZNHLDYW.js";
import "./chunk-N4DOILP3.js";
import "./chunk-PGE35F3R.js";
import "./chunk-Z7NUNKKQ.js";
import "./chunk-KNZVRWYA.js";
import "./chunk-OAWLK4BH.js";
import "./chunk-GSMNOAOO.js";
import "./chunk-GUGIMSVJ.js";
import {
  BidiModule
} from "./chunk-FUHNYRY4.js";
import "./chunk-OCW4O7BS.js";
import "./chunk-VWS2DRBY.js";
import "./chunk-L7MYD4QG.js";
import "./chunk-TNYT6YU2.js";
import {
  NgModule,
  setClassMetadata,
  ɵɵdefineNgModule
} from "./chunk-ZAKR7ID6.js";
import {
  ɵɵdefineInjector
} from "./chunk-FYFODLCE.js";
import "./chunk-PJVWDKLX.js";

// node_modules/@angular/material/fesm2022/tooltip.mjs
var MatTooltipModule = class _MatTooltipModule {
  static ɵfac = function MatTooltipModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _MatTooltipModule)();
  };
  static ɵmod = ɵɵdefineNgModule({
    type: _MatTooltipModule,
    imports: [A11yModule, OverlayModule, MatTooltip, TooltipComponent],
    exports: [MatTooltip, TooltipComponent, BidiModule, CdkScrollableModule]
  });
  static ɵinj = ɵɵdefineInjector({
    imports: [A11yModule, OverlayModule, BidiModule, CdkScrollableModule]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(MatTooltipModule, [{
    type: NgModule,
    args: [{
      imports: [A11yModule, OverlayModule, MatTooltip, TooltipComponent],
      exports: [MatTooltip, TooltipComponent, BidiModule, CdkScrollableModule]
    }]
  }], null, null);
})();
export {
  MAT_TOOLTIP_DEFAULT_OPTIONS,
  MAT_TOOLTIP_SCROLL_STRATEGY,
  MatTooltip,
  MatTooltipModule,
  SCROLL_THROTTLE_MS,
  TOOLTIP_PANEL_CLASS,
  TooltipComponent,
  getMatTooltipInvalidPositionError
};
//# sourceMappingURL=@angular_material_tooltip.js.map
