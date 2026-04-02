import "./chunk-J6G5YPDY.js";
import {
  zindexutils
} from "./chunk-3WXT4SWY.js";
import {
  animate,
  animation,
  style,
  transition,
  trigger,
  useAnimation
} from "./chunk-6N5WGMKH.js";
import {
  Button
} from "./chunk-KUF3X7EP.js";
import "./chunk-M5DWCW6E.js";
import {
  TimesIcon,
  WindowMaximizeIcon,
  WindowMinimizeIcon
} from "./chunk-NV26V4KB.js";
import "./chunk-ZMT3DRKC.js";
import {
  DomHandler
} from "./chunk-GSMZXMC2.js";
import {
  BaseComponent
} from "./chunk-UABGZUPI.js";
import {
  BaseStyle
} from "./chunk-5XTIT4KK.js";
import {
  PrimeTemplate,
  SharedModule,
  TranslationKeys,
  addClass,
  appendChild,
  blockBodyScroll,
  createElement,
  focus,
  getFirstFocusableElement,
  getLastFocusableElement,
  getOuterHeight,
  getOuterWidth,
  getViewport,
  hasClass,
  removeClass,
  setAttribute,
  unblockBodyScroll,
  uuid
} from "./chunk-KRMXQP7P.js";
import {
  CommonModule,
  NgClass,
  NgComponentOutlet,
  NgIf,
  NgStyle,
  NgTemplateOutlet,
  isPlatformBrowser
} from "./chunk-OUMZPQBU.js";
import "./chunk-BNAG7P7A.js";
import {
  ApplicationRef,
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  ContentChildren,
  Directive,
  Inject,
  Injectable,
  Input,
  NgModule,
  Optional,
  Output,
  PLATFORM_ID,
  Renderer2,
  SkipSelf,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation,
  booleanAttribute,
  createComponent,
  numberAttribute,
  setClassMetadata,
  ɵɵInheritDefinitionFeature,
  ɵɵNgOnChangesFeature,
  ɵɵProvidersFeature,
  ɵɵadvance,
  ɵɵattribute,
  ɵɵclassMap,
  ɵɵcontentQuery,
  ɵɵdefineComponent,
  ɵɵdefineDirective,
  ɵɵdefineNgModule,
  ɵɵdirectiveInject,
  ɵɵelement,
  ɵɵelementContainer,
  ɵɵelementContainerEnd,
  ɵɵelementContainerStart,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵgetCurrentView,
  ɵɵgetInheritedFactory,
  ɵɵlistener,
  ɵɵloadQuery,
  ɵɵnextContext,
  ɵɵprojection,
  ɵɵprojectionDef,
  ɵɵproperty,
  ɵɵpureFunction0,
  ɵɵpureFunction1,
  ɵɵpureFunction2,
  ɵɵpureFunction3,
  ɵɵqueryRefresh,
  ɵɵreference,
  ɵɵstyleMap,
  ɵɵstyleProp,
  ɵɵtemplate,
  ɵɵtemplateRefExtractor,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate1,
  ɵɵviewQuery
} from "./chunk-RQ5LYYK7.js";
import {
  DOCUMENT,
  EventEmitter,
  Injector,
  NgZone,
  inject,
  ɵɵdefineInjectable,
  ɵɵdefineInjector,
  ɵɵinject,
  ɵɵresetView,
  ɵɵrestoreView
} from "./chunk-3T2IMU35.js";
import "./chunk-NGWI62ZP.js";
import "./chunk-LQKJR2HS.js";
import {
  Subject
} from "./chunk-73FCWE6J.js";
import {
  __spreadValues
} from "./chunk-GOMI4DH3.js";

// node_modules/primeng/fesm2022/primeng-focustrap.mjs
var FocusTrap = class _FocusTrap extends BaseComponent {
  /**
   * When set as true, focus wouldn't be managed.
   * @group Props
   */
  pFocusTrapDisabled = false;
  platformId = inject(PLATFORM_ID);
  document = inject(DOCUMENT);
  firstHiddenFocusableElement;
  lastHiddenFocusableElement;
  ngOnInit() {
    super.ngOnInit();
    if (isPlatformBrowser(this.platformId) && !this.pFocusTrapDisabled) {
      !this.firstHiddenFocusableElement && !this.lastHiddenFocusableElement && this.createHiddenFocusableElements();
    }
  }
  ngOnChanges(changes) {
    super.ngOnChanges(changes);
    if (changes.pFocusTrapDisabled && isPlatformBrowser(this.platformId)) {
      if (changes.pFocusTrapDisabled.currentValue) {
        this.removeHiddenFocusableElements();
      } else {
        this.createHiddenFocusableElements();
      }
    }
  }
  removeHiddenFocusableElements() {
    if (this.firstHiddenFocusableElement && this.firstHiddenFocusableElement.parentNode) {
      this.firstHiddenFocusableElement.parentNode.removeChild(this.firstHiddenFocusableElement);
    }
    if (this.lastHiddenFocusableElement && this.lastHiddenFocusableElement.parentNode) {
      this.lastHiddenFocusableElement.parentNode.removeChild(this.lastHiddenFocusableElement);
    }
  }
  getComputedSelector(selector) {
    return `:not(.p-hidden-focusable):not([data-p-hidden-focusable="true"])${selector ?? ""}`;
  }
  createHiddenFocusableElements() {
    const tabindex = "0";
    const createFocusableElement = (onFocus) => {
      return createElement("span", {
        class: "p-hidden-accessible p-hidden-focusable",
        tabindex,
        role: "presentation",
        "aria-hidden": true,
        "data-p-hidden-accessible": true,
        "data-p-hidden-focusable": true,
        onFocus: onFocus?.bind(this)
      });
    };
    this.firstHiddenFocusableElement = createFocusableElement(this.onFirstHiddenElementFocus);
    this.lastHiddenFocusableElement = createFocusableElement(this.onLastHiddenElementFocus);
    this.firstHiddenFocusableElement.setAttribute("data-pc-section", "firstfocusableelement");
    this.lastHiddenFocusableElement.setAttribute("data-pc-section", "lastfocusableelement");
    this.el.nativeElement.prepend(this.firstHiddenFocusableElement);
    this.el.nativeElement.append(this.lastHiddenFocusableElement);
  }
  onFirstHiddenElementFocus(event) {
    const {
      currentTarget,
      relatedTarget
    } = event;
    const focusableElement = relatedTarget === this.lastHiddenFocusableElement || !this.el.nativeElement?.contains(relatedTarget) ? getFirstFocusableElement(currentTarget.parentElement, ":not(.p-hidden-focusable)") : this.lastHiddenFocusableElement;
    focus(focusableElement);
  }
  onLastHiddenElementFocus(event) {
    const {
      currentTarget,
      relatedTarget
    } = event;
    const focusableElement = relatedTarget === this.firstHiddenFocusableElement || !this.el.nativeElement?.contains(relatedTarget) ? getLastFocusableElement(currentTarget.parentElement, ":not(.p-hidden-focusable)") : this.firstHiddenFocusableElement;
    focus(focusableElement);
  }
  static ɵfac = /* @__PURE__ */ (() => {
    let ɵFocusTrap_BaseFactory;
    return function FocusTrap_Factory(__ngFactoryType__) {
      return (ɵFocusTrap_BaseFactory || (ɵFocusTrap_BaseFactory = ɵɵgetInheritedFactory(_FocusTrap)))(__ngFactoryType__ || _FocusTrap);
    };
  })();
  static ɵdir = ɵɵdefineDirective({
    type: _FocusTrap,
    selectors: [["", "pFocusTrap", ""]],
    inputs: {
      pFocusTrapDisabled: [2, "pFocusTrapDisabled", "pFocusTrapDisabled", booleanAttribute]
    },
    features: [ɵɵInheritDefinitionFeature, ɵɵNgOnChangesFeature]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(FocusTrap, [{
    type: Directive,
    args: [{
      selector: "[pFocusTrap]",
      standalone: true
    }]
  }], null, {
    pFocusTrapDisabled: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }]
  });
})();
var FocusTrapModule = class _FocusTrapModule {
  static ɵfac = function FocusTrapModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _FocusTrapModule)();
  };
  static ɵmod = ɵɵdefineNgModule({
    type: _FocusTrapModule,
    imports: [FocusTrap],
    exports: [FocusTrap]
  });
  static ɵinj = ɵɵdefineInjector({});
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(FocusTrapModule, [{
    type: NgModule,
    args: [{
      imports: [FocusTrap],
      exports: [FocusTrap]
    }]
  }], null, null);
})();

// node_modules/primeng/fesm2022/primeng-dialog.mjs
var _c0 = ["header"];
var _c1 = ["content"];
var _c2 = ["footer"];
var _c3 = ["closeicon"];
var _c4 = ["maximizeicon"];
var _c5 = ["minimizeicon"];
var _c6 = ["headless"];
var _c7 = ["titlebar"];
var _c8 = ["*", [["p-footer"]]];
var _c9 = ["*", "p-footer"];
var _c10 = (a0, a1, a2) => ({
  position: "fixed",
  height: "100%",
  width: "100%",
  left: 0,
  top: 0,
  display: "flex",
  "justify-content": a0,
  "align-items": a1,
  "pointer-events": a2
});
var _c11 = (a0) => ({
  "p-dialog p-component": true,
  "p-dialog-maximized": a0
});
var _c12 = () => ({
  display: "flex",
  "flex-direction": "column",
  "pointer-events": "auto"
});
var _c13 = (a0, a1) => ({
  transform: a0,
  transition: a1
});
var _c14 = (a0) => ({
  value: "visible",
  params: a0
});
function Dialog_div_0_div_1_ng_container_2_ng_container_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementContainer(0);
  }
}
function Dialog_div_0_div_1_ng_container_2_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementContainerStart(0);
    ɵɵtemplate(1, Dialog_div_0_div_1_ng_container_2_ng_container_1_Template, 1, 0, "ng-container", 11);
    ɵɵelementContainerEnd();
  }
  if (rf & 2) {
    const ctx_r1 = ɵɵnextContext(3);
    ɵɵadvance();
    ɵɵproperty("ngTemplateOutlet", ctx_r1._headlessTemplate || ctx_r1.headlessTemplate || ctx_r1.headlessT);
  }
}
function Dialog_div_0_div_1_ng_template_3_div_0_Template(rf, ctx) {
  if (rf & 1) {
    const _r3 = ɵɵgetCurrentView();
    ɵɵelementStart(0, "div", 15);
    ɵɵlistener("mousedown", function Dialog_div_0_div_1_ng_template_3_div_0_Template_div_mousedown_0_listener($event) {
      ɵɵrestoreView(_r3);
      const ctx_r1 = ɵɵnextContext(4);
      return ɵɵresetView(ctx_r1.initResize($event));
    });
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = ɵɵnextContext(4);
    ɵɵproperty("ngClass", ctx_r1.cx("resizeHandle"));
  }
}
function Dialog_div_0_div_1_ng_template_3_div_1_span_2_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "span", 21);
    ɵɵtext(1);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = ɵɵnextContext(5);
    ɵɵproperty("id", ctx_r1.ariaLabelledBy)("ngClass", ctx_r1.cx("title"));
    ɵɵadvance();
    ɵɵtextInterpolate(ctx_r1.header);
  }
}
function Dialog_div_0_div_1_ng_template_3_div_1_ng_container_3_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementContainer(0);
  }
}
function Dialog_div_0_div_1_ng_template_3_div_1_p_button_5_span_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelement(0, "span", 18);
  }
  if (rf & 2) {
    const ctx_r1 = ɵɵnextContext(6);
    ɵɵproperty("ngClass", ctx_r1.maximized ? ctx_r1.minimizeIcon : ctx_r1.maximizeIcon);
  }
}
function Dialog_div_0_div_1_ng_template_3_div_1_p_button_5_ng_container_2_WindowMaximizeIcon_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelement(0, "WindowMaximizeIcon");
  }
}
function Dialog_div_0_div_1_ng_template_3_div_1_p_button_5_ng_container_2_WindowMinimizeIcon_2_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelement(0, "WindowMinimizeIcon");
  }
}
function Dialog_div_0_div_1_ng_template_3_div_1_p_button_5_ng_container_2_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementContainerStart(0);
    ɵɵtemplate(1, Dialog_div_0_div_1_ng_template_3_div_1_p_button_5_ng_container_2_WindowMaximizeIcon_1_Template, 1, 0, "WindowMaximizeIcon", 23)(2, Dialog_div_0_div_1_ng_template_3_div_1_p_button_5_ng_container_2_WindowMinimizeIcon_2_Template, 1, 0, "WindowMinimizeIcon", 23);
    ɵɵelementContainerEnd();
  }
  if (rf & 2) {
    const ctx_r1 = ɵɵnextContext(6);
    ɵɵadvance();
    ɵɵproperty("ngIf", !ctx_r1.maximized && !ctx_r1._maximizeiconTemplate && !ctx_r1.maximizeIconTemplate && !ctx_r1.maximizeIconT);
    ɵɵadvance();
    ɵɵproperty("ngIf", ctx_r1.maximized && !ctx_r1._minimizeiconTemplate && !ctx_r1.minimizeIconTemplate && !ctx_r1.minimizeIconT);
  }
}
function Dialog_div_0_div_1_ng_template_3_div_1_p_button_5_ng_container_3_1_ng_template_0_Template(rf, ctx) {
}
function Dialog_div_0_div_1_ng_template_3_div_1_p_button_5_ng_container_3_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵtemplate(0, Dialog_div_0_div_1_ng_template_3_div_1_p_button_5_ng_container_3_1_ng_template_0_Template, 0, 0, "ng-template");
  }
}
function Dialog_div_0_div_1_ng_template_3_div_1_p_button_5_ng_container_3_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementContainerStart(0);
    ɵɵtemplate(1, Dialog_div_0_div_1_ng_template_3_div_1_p_button_5_ng_container_3_1_Template, 1, 0, null, 11);
    ɵɵelementContainerEnd();
  }
  if (rf & 2) {
    const ctx_r1 = ɵɵnextContext(6);
    ɵɵadvance();
    ɵɵproperty("ngTemplateOutlet", ctx_r1._maximizeiconTemplate || ctx_r1.maximizeIconTemplate || ctx_r1.maximizeIconT);
  }
}
function Dialog_div_0_div_1_ng_template_3_div_1_p_button_5_ng_container_4_1_ng_template_0_Template(rf, ctx) {
}
function Dialog_div_0_div_1_ng_template_3_div_1_p_button_5_ng_container_4_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵtemplate(0, Dialog_div_0_div_1_ng_template_3_div_1_p_button_5_ng_container_4_1_ng_template_0_Template, 0, 0, "ng-template");
  }
}
function Dialog_div_0_div_1_ng_template_3_div_1_p_button_5_ng_container_4_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementContainerStart(0);
    ɵɵtemplate(1, Dialog_div_0_div_1_ng_template_3_div_1_p_button_5_ng_container_4_1_Template, 1, 0, null, 11);
    ɵɵelementContainerEnd();
  }
  if (rf & 2) {
    const ctx_r1 = ɵɵnextContext(6);
    ɵɵadvance();
    ɵɵproperty("ngTemplateOutlet", ctx_r1._minimizeiconTemplate || ctx_r1.minimizeIconTemplate || ctx_r1.minimizeIconT);
  }
}
function Dialog_div_0_div_1_ng_template_3_div_1_p_button_5_Template(rf, ctx) {
  if (rf & 1) {
    const _r5 = ɵɵgetCurrentView();
    ɵɵelementStart(0, "p-button", 22);
    ɵɵlistener("onClick", function Dialog_div_0_div_1_ng_template_3_div_1_p_button_5_Template_p_button_onClick_0_listener() {
      ɵɵrestoreView(_r5);
      const ctx_r1 = ɵɵnextContext(5);
      return ɵɵresetView(ctx_r1.maximize());
    })("keydown.enter", function Dialog_div_0_div_1_ng_template_3_div_1_p_button_5_Template_p_button_keydown_enter_0_listener() {
      ɵɵrestoreView(_r5);
      const ctx_r1 = ɵɵnextContext(5);
      return ɵɵresetView(ctx_r1.maximize());
    });
    ɵɵtemplate(1, Dialog_div_0_div_1_ng_template_3_div_1_p_button_5_span_1_Template, 1, 1, "span", 14)(2, Dialog_div_0_div_1_ng_template_3_div_1_p_button_5_ng_container_2_Template, 3, 2, "ng-container", 23)(3, Dialog_div_0_div_1_ng_template_3_div_1_p_button_5_ng_container_3_Template, 2, 1, "ng-container", 23)(4, Dialog_div_0_div_1_ng_template_3_div_1_p_button_5_ng_container_4_Template, 2, 1, "ng-container", 23);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = ɵɵnextContext(5);
    ɵɵproperty("styleClass", ctx_r1.cx("pcMaximizeButton"))("tabindex", ctx_r1.maximizable ? "0" : "-1")("ariaLabel", ctx_r1.maximizeLabel)("buttonProps", ctx_r1.maximizeButtonProps);
    ɵɵadvance();
    ɵɵproperty("ngIf", ctx_r1.maximizeIcon && !ctx_r1._maximizeiconTemplate && !ctx_r1._minimizeiconTemplate);
    ɵɵadvance();
    ɵɵproperty("ngIf", !ctx_r1.maximizeIcon && !(ctx_r1.maximizeButtonProps == null ? null : ctx_r1.maximizeButtonProps.icon));
    ɵɵadvance();
    ɵɵproperty("ngIf", !ctx_r1.maximized);
    ɵɵadvance();
    ɵɵproperty("ngIf", ctx_r1.maximized);
  }
}
function Dialog_div_0_div_1_ng_template_3_div_1_p_button_6_ng_template_1_ng_container_0_span_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelement(0, "span", 18);
  }
  if (rf & 2) {
    const ctx_r1 = ɵɵnextContext(8);
    ɵɵproperty("ngClass", ctx_r1.closeIcon);
  }
}
function Dialog_div_0_div_1_ng_template_3_div_1_p_button_6_ng_template_1_ng_container_0_TimesIcon_2_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelement(0, "TimesIcon");
  }
}
function Dialog_div_0_div_1_ng_template_3_div_1_p_button_6_ng_template_1_ng_container_0_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementContainerStart(0);
    ɵɵtemplate(1, Dialog_div_0_div_1_ng_template_3_div_1_p_button_6_ng_template_1_ng_container_0_span_1_Template, 1, 1, "span", 14)(2, Dialog_div_0_div_1_ng_template_3_div_1_p_button_6_ng_template_1_ng_container_0_TimesIcon_2_Template, 1, 0, "TimesIcon", 23);
    ɵɵelementContainerEnd();
  }
  if (rf & 2) {
    const ctx_r1 = ɵɵnextContext(7);
    ɵɵadvance();
    ɵɵproperty("ngIf", ctx_r1.closeIcon);
    ɵɵadvance();
    ɵɵproperty("ngIf", !ctx_r1.closeIcon);
  }
}
function Dialog_div_0_div_1_ng_template_3_div_1_p_button_6_ng_template_1_span_1_1_ng_template_0_Template(rf, ctx) {
}
function Dialog_div_0_div_1_ng_template_3_div_1_p_button_6_ng_template_1_span_1_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵtemplate(0, Dialog_div_0_div_1_ng_template_3_div_1_p_button_6_ng_template_1_span_1_1_ng_template_0_Template, 0, 0, "ng-template");
  }
}
function Dialog_div_0_div_1_ng_template_3_div_1_p_button_6_ng_template_1_span_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "span");
    ɵɵtemplate(1, Dialog_div_0_div_1_ng_template_3_div_1_p_button_6_ng_template_1_span_1_1_Template, 1, 0, null, 11);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = ɵɵnextContext(7);
    ɵɵadvance();
    ɵɵproperty("ngTemplateOutlet", ctx_r1._closeiconTemplate || ctx_r1.closeIconTemplate || ctx_r1.closeIconT);
  }
}
function Dialog_div_0_div_1_ng_template_3_div_1_p_button_6_ng_template_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵtemplate(0, Dialog_div_0_div_1_ng_template_3_div_1_p_button_6_ng_template_1_ng_container_0_Template, 3, 2, "ng-container", 23)(1, Dialog_div_0_div_1_ng_template_3_div_1_p_button_6_ng_template_1_span_1_Template, 2, 1, "span", 23);
  }
  if (rf & 2) {
    const ctx_r1 = ɵɵnextContext(6);
    ɵɵproperty("ngIf", !ctx_r1._closeiconTemplate && !ctx_r1.closeIconTemplate && !ctx_r1.closeIconT && !(ctx_r1.closeButtonProps == null ? null : ctx_r1.closeButtonProps.icon));
    ɵɵadvance();
    ɵɵproperty("ngIf", ctx_r1._closeiconTemplate || ctx_r1.closeIconTemplate || ctx_r1.closeIconT);
  }
}
function Dialog_div_0_div_1_ng_template_3_div_1_p_button_6_Template(rf, ctx) {
  if (rf & 1) {
    const _r6 = ɵɵgetCurrentView();
    ɵɵelementStart(0, "p-button", 24);
    ɵɵlistener("onClick", function Dialog_div_0_div_1_ng_template_3_div_1_p_button_6_Template_p_button_onClick_0_listener($event) {
      ɵɵrestoreView(_r6);
      const ctx_r1 = ɵɵnextContext(5);
      return ɵɵresetView(ctx_r1.close($event));
    })("keydown.enter", function Dialog_div_0_div_1_ng_template_3_div_1_p_button_6_Template_p_button_keydown_enter_0_listener($event) {
      ɵɵrestoreView(_r6);
      const ctx_r1 = ɵɵnextContext(5);
      return ɵɵresetView(ctx_r1.close($event));
    });
    ɵɵtemplate(1, Dialog_div_0_div_1_ng_template_3_div_1_p_button_6_ng_template_1_Template, 2, 2, "ng-template", null, 4, ɵɵtemplateRefExtractor);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = ɵɵnextContext(5);
    ɵɵproperty("styleClass", ctx_r1.cx("pcCloseButton"))("ariaLabel", ctx_r1.closeAriaLabel)("tabindex", ctx_r1.closeTabindex)("buttonProps", ctx_r1.closeButtonProps);
  }
}
function Dialog_div_0_div_1_ng_template_3_div_1_Template(rf, ctx) {
  if (rf & 1) {
    const _r4 = ɵɵgetCurrentView();
    ɵɵelementStart(0, "div", 16, 3);
    ɵɵlistener("mousedown", function Dialog_div_0_div_1_ng_template_3_div_1_Template_div_mousedown_0_listener($event) {
      ɵɵrestoreView(_r4);
      const ctx_r1 = ɵɵnextContext(4);
      return ɵɵresetView(ctx_r1.initDrag($event));
    });
    ɵɵtemplate(2, Dialog_div_0_div_1_ng_template_3_div_1_span_2_Template, 2, 3, "span", 17)(3, Dialog_div_0_div_1_ng_template_3_div_1_ng_container_3_Template, 1, 0, "ng-container", 11);
    ɵɵelementStart(4, "div", 18);
    ɵɵtemplate(5, Dialog_div_0_div_1_ng_template_3_div_1_p_button_5_Template, 5, 8, "p-button", 19)(6, Dialog_div_0_div_1_ng_template_3_div_1_p_button_6_Template, 3, 4, "p-button", 20);
    ɵɵelementEnd()();
  }
  if (rf & 2) {
    const ctx_r1 = ɵɵnextContext(4);
    ɵɵproperty("ngClass", ctx_r1.cx("header"));
    ɵɵadvance(2);
    ɵɵproperty("ngIf", !ctx_r1._headerTemplate && !ctx_r1.headerTemplate && !ctx_r1.headerT);
    ɵɵadvance();
    ɵɵproperty("ngTemplateOutlet", ctx_r1._headerTemplate || ctx_r1.headerTemplate || ctx_r1.headerT);
    ɵɵadvance();
    ɵɵproperty("ngClass", ctx_r1.cx("headerActions"));
    ɵɵadvance();
    ɵɵproperty("ngIf", ctx_r1.maximizable);
    ɵɵadvance();
    ɵɵproperty("ngIf", ctx_r1.closable);
  }
}
function Dialog_div_0_div_1_ng_template_3_ng_container_5_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementContainer(0);
  }
}
function Dialog_div_0_div_1_ng_template_3_div_6_ng_container_3_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementContainer(0);
  }
}
function Dialog_div_0_div_1_ng_template_3_div_6_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "div", 18, 5);
    ɵɵprojection(2, 1);
    ɵɵtemplate(3, Dialog_div_0_div_1_ng_template_3_div_6_ng_container_3_Template, 1, 0, "ng-container", 11);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = ɵɵnextContext(4);
    ɵɵproperty("ngClass", ctx_r1.cx("footer"));
    ɵɵadvance(3);
    ɵɵproperty("ngTemplateOutlet", ctx_r1._footerTemplate || ctx_r1.footerTemplate || ctx_r1.footerT);
  }
}
function Dialog_div_0_div_1_ng_template_3_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵtemplate(0, Dialog_div_0_div_1_ng_template_3_div_0_Template, 1, 1, "div", 12)(1, Dialog_div_0_div_1_ng_template_3_div_1_Template, 7, 6, "div", 13);
    ɵɵelementStart(2, "div", 7, 2);
    ɵɵprojection(4);
    ɵɵtemplate(5, Dialog_div_0_div_1_ng_template_3_ng_container_5_Template, 1, 0, "ng-container", 11);
    ɵɵelementEnd();
    ɵɵtemplate(6, Dialog_div_0_div_1_ng_template_3_div_6_Template, 4, 2, "div", 14);
  }
  if (rf & 2) {
    const ctx_r1 = ɵɵnextContext(3);
    ɵɵproperty("ngIf", ctx_r1.resizable);
    ɵɵadvance();
    ɵɵproperty("ngIf", ctx_r1.showHeader);
    ɵɵadvance();
    ɵɵclassMap(ctx_r1.contentStyleClass);
    ɵɵproperty("ngClass", ctx_r1.cx("content"))("ngStyle", ctx_r1.contentStyle);
    ɵɵattribute("data-pc-section", "content");
    ɵɵadvance(3);
    ɵɵproperty("ngTemplateOutlet", ctx_r1._contentTemplate || ctx_r1.contentTemplate || ctx_r1.contentT);
    ɵɵadvance();
    ɵɵproperty("ngIf", ctx_r1._footerTemplate || ctx_r1.footerTemplate || ctx_r1.footerT);
  }
}
function Dialog_div_0_div_1_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = ɵɵgetCurrentView();
    ɵɵelementStart(0, "div", 9, 0);
    ɵɵlistener("@animation.start", function Dialog_div_0_div_1_Template_div_animation_animation_start_0_listener($event) {
      ɵɵrestoreView(_r1);
      const ctx_r1 = ɵɵnextContext(2);
      return ɵɵresetView(ctx_r1.onAnimationStart($event));
    })("@animation.done", function Dialog_div_0_div_1_Template_div_animation_animation_done_0_listener($event) {
      ɵɵrestoreView(_r1);
      const ctx_r1 = ɵɵnextContext(2);
      return ɵɵresetView(ctx_r1.onAnimationEnd($event));
    });
    ɵɵtemplate(2, Dialog_div_0_div_1_ng_container_2_Template, 2, 1, "ng-container", 10)(3, Dialog_div_0_div_1_ng_template_3_Template, 7, 9, "ng-template", null, 1, ɵɵtemplateRefExtractor);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const notHeadless_r7 = ɵɵreference(4);
    const ctx_r1 = ɵɵnextContext(2);
    ɵɵstyleMap(ctx_r1.style);
    ɵɵclassMap(ctx_r1.styleClass);
    ɵɵproperty("ngClass", ɵɵpureFunction1(13, _c11, ctx_r1.maximizable && ctx_r1.maximized))("ngStyle", ɵɵpureFunction0(15, _c12))("pFocusTrapDisabled", ctx_r1.focusTrap === false)("@animation", ɵɵpureFunction1(19, _c14, ɵɵpureFunction2(16, _c13, ctx_r1.transformOptions, ctx_r1.transitionOptions)));
    ɵɵattribute("role", ctx_r1.role)("aria-labelledby", ctx_r1.ariaLabelledBy)("aria-modal", true);
    ɵɵadvance(2);
    ɵɵproperty("ngIf", ctx_r1._headlessTemplate || ctx_r1.headlessTemplate || ctx_r1.headlessT)("ngIfElse", notHeadless_r7);
  }
}
function Dialog_div_0_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "div", 7);
    ɵɵtemplate(1, Dialog_div_0_div_1_Template, 5, 21, "div", 8);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = ɵɵnextContext();
    ɵɵstyleMap(ctx_r1.maskStyle);
    ɵɵclassMap(ctx_r1.maskStyleClass);
    ɵɵproperty("ngClass", ctx_r1.maskClass)("ngStyle", ɵɵpureFunction3(7, _c10, ctx_r1.position === "left" || ctx_r1.position === "topleft" || ctx_r1.position === "bottomleft" ? "flex-start" : ctx_r1.position === "right" || ctx_r1.position === "topright" || ctx_r1.position === "bottomright" ? "flex-end" : "center", ctx_r1.position === "top" || ctx_r1.position === "topleft" || ctx_r1.position === "topright" ? "flex-start" : ctx_r1.position === "bottom" || ctx_r1.position === "bottomleft" || ctx_r1.position === "bottomright" ? "flex-end" : "center", ctx_r1.modal ? "auto" : "none"));
    ɵɵadvance();
    ɵɵproperty("ngIf", ctx_r1.visible);
  }
}
var theme = ({
  dt
}) => `
.p-dialog {
    max-height: 90%;
    transform: scale(1);
    border-radius: ${dt("dialog.border.radius")};
    box-shadow: ${dt("dialog.shadow")};
    background: ${dt("dialog.background")};
    border: 1px solid ${dt("dialog.border.color")};
    color: ${dt("dialog.color")};
    display: flex;
    flex-direction: column;
    pointer-events: auto
}

.p-dialog-content {
    overflow-y: auto;
    padding: ${dt("dialog.content.padding")};
    flex-grow: 1;
}

.p-dialog-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
    padding: ${dt("dialog.header.padding")};
}

.p-dialog-title {
    font-weight: ${dt("dialog.title.font.weight")};
    font-size: ${dt("dialog.title.font.size")};
}

.p-dialog-footer {
    flex-shrink: 0;
    padding: ${dt("dialog.footer.padding")};
    display: flex;
    justify-content: flex-end;
    gap: ${dt("dialog.footer.gap")};
}

.p-dialog-header-actions {
    display: flex;
    align-items: center;
    gap: ${dt("dialog.header.gap")};
}

.p-dialog-enter-active {
    transition: all 150ms cubic-bezier(0, 0, 0.2, 1);
}

.p-dialog-leave-active {
    transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.p-dialog-enter-from,
.p-dialog-leave-to {
    opacity: 0;
    transform: scale(0.7);
}

.p-dialog-top .p-dialog,
.p-dialog-bottom .p-dialog,
.p-dialog-left .p-dialog,
.p-dialog-right .p-dialog,
.p-dialog-topleft .p-dialog,
.p-dialog-topright .p-dialog,
.p-dialog-bottomleft .p-dialog,
.p-dialog-bottomright .p-dialog {
    margin: 0.75rem;
    transform: translate3d(0px, 0px, 0px);
}

.p-dialog-top .p-dialog-enter-active,
.p-dialog-top .p-dialog-leave-active,
.p-dialog-bottom .p-dialog-enter-active,
.p-dialog-bottom .p-dialog-leave-active,
.p-dialog-left .p-dialog-enter-active,
.p-dialog-left .p-dialog-leave-active,
.p-dialog-right .p-dialog-enter-active,
.p-dialog-right .p-dialog-leave-active,
.p-dialog-topleft .p-dialog-enter-active,
.p-dialog-topleft .p-dialog-leave-active,
.p-dialog-topright .p-dialog-enter-active,
.p-dialog-topright .p-dialog-leave-active,
.p-dialog-bottomleft .p-dialog-enter-active,
.p-dialog-bottomleft .p-dialog-leave-active,
.p-dialog-bottomright .p-dialog-enter-active,
.p-dialog-bottomright .p-dialog-leave-active {
    transition: all 0.3s ease-out;
}

.p-dialog-top .p-dialog-enter-from,
.p-dialog-top .p-dialog-leave-to {
    transform: translate3d(0px, -100%, 0px);
}

.p-dialog-bottom .p-dialog-enter-from,
.p-dialog-bottom .p-dialog-leave-to {
    transform: translate3d(0px, 100%, 0px);
}

.p-dialog-left .p-dialog-enter-from,
.p-dialog-left .p-dialog-leave-to,
.p-dialog-topleft .p-dialog-enter-from,
.p-dialog-topleft .p-dialog-leave-to,
.p-dialog-bottomleft .p-dialog-enter-from,
.p-dialog-bottomleft .p-dialog-leave-to {
    transform: translate3d(-100%, 0px, 0px);
}

.p-dialog-right .p-dialog-enter-from,
.p-dialog-right .p-dialog-leave-to,
.p-dialog-topright .p-dialog-enter-from,
.p-dialog-topright .p-dialog-leave-to,
.p-dialog-bottomright .p-dialog-enter-from,
.p-dialog-bottomright .p-dialog-leave-to {
    transform: translate3d(100%, 0px, 0px);
}

.p-dialog-left:dir(rtl) .p-dialog-enter-from,
.p-dialog-left:dir(rtl) .p-dialog-leave-to,
.p-dialog-topleft:dir(rtl) .p-dialog-enter-from,
.p-dialog-topleft:dir(rtl) .p-dialog-leave-to,
.p-dialog-bottomleft:dir(rtl) .p-dialog-enter-from,
.p-dialog-bottomleft:dir(rtl) .p-dialog-leave-to {
    transform: translate3d(100%, 0px, 0px);
}

.p-dialog-right:dir(rtl) .p-dialog-enter-from,
.p-dialog-right:dir(rtl) .p-dialog-leave-to,
.p-dialog-topright:dir(rtl) .p-dialog-enter-from,
.p-dialog-topright:dir(rtl) .p-dialog-leave-to,
.p-dialog-bottomright:dir(rtl) .p-dialog-enter-from,
.p-dialog-bottomright:dir(rtl) .p-dialog-leave-to {
    transform: translate3d(-100%, 0px, 0px);
}

.p-dialog-maximized {
    width: 100vw !important;
    height: 100vh !important;
    top: 0px !important;
    left: 0px !important;
    max-height: 100%;
    height: 100%;
    border-radius: 0;
}

.p-dialog-maximized .p-dialog-content {
    flex-grow: 1;
}

.p-overlay-mask:dir(rtl) {
    flex-direction: row-reverse;
}

/* For PrimeNG */

.p-dialog .p-resizable-handle {
    position: absolute;
    font-size: 0.1px;
    display: block;
    cursor: se-resize;
    width: 12px;
    height: 12px;
    right: 1px;
    bottom: 1px;
}

.p-confirm-dialog .p-dialog-content {
    display: flex;
    align-items: center;
}
`;
var inlineStyles = {
  mask: ({
    instance
  }) => ({
    position: "fixed",
    height: "100%",
    width: "100%",
    left: 0,
    top: 0,
    display: "flex",
    justifyContent: instance.position === "left" || instance.position === "topleft" || instance.position === "bottomleft" ? "flex-start" : instance.position === "right" || instance.position === "topright" || instance.position === "bottomright" ? "flex-end" : "center",
    alignItems: instance.position === "top" || instance.position === "topleft" || instance.position === "topright" ? "flex-start" : instance.position === "bottom" || instance.position === "bottomleft" || instance.position === "bottomright" ? "flex-end" : "center",
    pointerEvents: instance.modal ? "auto" : "none"
  }),
  root: {
    display: "flex",
    flexDirection: "column",
    pointerEvents: "auto"
  }
};
var classes = {
  mask: ({
    instance
  }) => {
    const positions = ["left", "right", "top", "topleft", "topright", "bottom", "bottomleft", "bottomright"];
    const pos = positions.find((item) => item === instance.position);
    return {
      "p-dialog-mask": true,
      "p-overlay-mask p-overlay-mask-enter": instance.modal,
      [`p-dialog-${pos}`]: pos
    };
  },
  root: ({
    instance
  }) => ({
    "p-dialog p-component": true,
    "p-dialog-maximized": instance.maximizable && instance.maximized
  }),
  header: "p-dialog-header",
  title: "p-dialog-title",
  resizeHandle: "p-resizable-handle",
  headerActions: "p-dialog-header-actions",
  pcMaximizeButton: "p-dialog-maximize-button",
  pcCloseButton: "p-dialog-close-button",
  content: "p-dialog-content",
  footer: "p-dialog-footer"
};
var DialogStyle = class _DialogStyle extends BaseStyle {
  name = "dialog";
  theme = theme;
  classes = classes;
  inlineStyles = inlineStyles;
  static ɵfac = /* @__PURE__ */ (() => {
    let ɵDialogStyle_BaseFactory;
    return function DialogStyle_Factory(__ngFactoryType__) {
      return (ɵDialogStyle_BaseFactory || (ɵDialogStyle_BaseFactory = ɵɵgetInheritedFactory(_DialogStyle)))(__ngFactoryType__ || _DialogStyle);
    };
  })();
  static ɵprov = ɵɵdefineInjectable({
    token: _DialogStyle,
    factory: _DialogStyle.ɵfac
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(DialogStyle, [{
    type: Injectable
  }], null, null);
})();
var DialogClasses;
(function(DialogClasses2) {
  DialogClasses2["mask"] = "p-dialog-mask";
  DialogClasses2["root"] = "p-dialog";
  DialogClasses2["header"] = "p-dialog-header";
  DialogClasses2["title"] = "p-dialog-title";
  DialogClasses2["headerActions"] = "p-dialog-header-actions";
  DialogClasses2["pcMaximizeButton"] = "p-dialog-maximize-button";
  DialogClasses2["pcCloseButton"] = "p-dialog-close-button";
  DialogClasses2["content"] = "p-dialog-content";
  DialogClasses2["footer"] = "p-dialog-footer";
})(DialogClasses || (DialogClasses = {}));
var showAnimation = animation([style({
  transform: "{{transform}}",
  opacity: 0
}), animate("{{transition}}")]);
var hideAnimation = animation([animate("{{transition}}", style({
  transform: "{{transform}}",
  opacity: 0
}))]);
var Dialog = class _Dialog extends BaseComponent {
  /**
   * Title text of the dialog.
   * @group Props
   */
  header;
  /**
   * Enables dragging to change the position using header.
   * @group Props
   */
  draggable = true;
  /**
   * Enables resizing of the content.
   * @group Props
   */
  resizable = true;
  /**
   * Defines the left offset of dialog.
   * @group Props
   * @deprecated positionLeft property is deprecated.
   */
  get positionLeft() {
    return 0;
  }
  set positionLeft(_positionLeft) {
    console.log("positionLeft property is deprecated.");
  }
  /**
   * Defines the top offset of dialog.
   * @group Props
   * @deprecated positionTop property is deprecated.
   */
  get positionTop() {
    return 0;
  }
  set positionTop(_positionTop) {
    console.log("positionTop property is deprecated.");
  }
  /**
   * Style of the content section.
   * @group Props
   */
  contentStyle;
  /**
   * Style class of the content.
   * @group Props
   */
  contentStyleClass;
  /**
   * Defines if background should be blocked when dialog is displayed.
   * @group Props
   */
  modal = false;
  /**
   * Specifies if pressing escape key should hide the dialog.
   * @group Props
   */
  closeOnEscape = true;
  /**
   * Specifies if clicking the modal background should hide the dialog.
   * @group Props
   */
  dismissableMask = false;
  /**
   * When enabled dialog is displayed in RTL direction.
   * @group Props
   */
  rtl = false;
  /**
   * Adds a close icon to the header to hide the dialog.
   * @group Props
   */
  closable = true;
  /**
   * Defines if the component is responsive.
   * @group Props
   * @deprecated Responsive property is deprecated.
   */
  get responsive() {
    return false;
  }
  set responsive(_responsive) {
    console.log("Responsive property is deprecated.");
  }
  /**
   * Target element to attach the dialog, valid values are "body" or a local ng-template variable of another element (note: use binding with brackets for template variables, e.g. [appendTo]="mydiv" for a div element having #mydiv as variable name).
   * @group Props
   */
  appendTo;
  /**
   * Object literal to define widths per screen size.
   * @group Props
   */
  breakpoints;
  /**
   * Style class of the component.
   * @group Props
   */
  styleClass;
  /**
   * Style class of the mask.
   * @group Props
   */
  maskStyleClass;
  /**
   * Style of the mask.
   * @group Props
   */
  maskStyle;
  /**
   * Whether to show the header or not.
   * @group Props
   */
  showHeader = true;
  /**
   * Defines the breakpoint of the component responsive.
   * @group Props
   * @deprecated Breakpoint property is not utilized and deprecated. Use breakpoints or CSS media queries instead.
   */
  get breakpoint() {
    return 649;
  }
  set breakpoint(_breakpoint) {
    console.log("Breakpoint property is not utilized and deprecated, use breakpoints or CSS media queries instead.");
  }
  /**
   * Whether background scroll should be blocked when dialog is visible.
   * @group Props
   */
  blockScroll = false;
  /**
   * Whether to automatically manage layering.
   * @group Props
   */
  autoZIndex = true;
  /**
   * Base zIndex value to use in layering.
   * @group Props
   */
  baseZIndex = 0;
  /**
   * Minimum value for the left coordinate of dialog in dragging.
   * @group Props
   */
  minX = 0;
  /**
   * Minimum value for the top coordinate of dialog in dragging.
   * @group Props
   */
  minY = 0;
  /**
   * When enabled, first focusable element receives focus on show.
   * @group Props
   */
  focusOnShow = true;
  /**
   * Whether the dialog can be displayed full screen.
   * @group Props
   */
  maximizable = false;
  /**
   * Keeps dialog in the viewport.
   * @group Props
   */
  keepInViewport = true;
  /**
   * When enabled, can only focus on elements inside the dialog.
   * @group Props
   */
  focusTrap = true;
  /**
   * Transition options of the animation.
   * @group Props
   */
  transitionOptions = "150ms cubic-bezier(0, 0, 0.2, 1)";
  /**
   * Name of the close icon.
   * @group Props
   */
  closeIcon;
  /**
   * Defines a string that labels the close button for accessibility.
   * @group Props
   */
  closeAriaLabel;
  /**
   * Index of the close button in tabbing order.
   * @group Props
   */
  closeTabindex = "0";
  /**
   * Name of the minimize icon.
   * @group Props
   */
  minimizeIcon;
  /**
   * Name of the maximize icon.
   * @group Props
   */
  maximizeIcon;
  /**
   * Used to pass all properties of the ButtonProps to the Button component.
   * @group Props
   */
  closeButtonProps = {
    severity: "secondary",
    text: true,
    rounded: true
  };
  /**
   * Used to pass all properties of the ButtonProps to the Button component.
   * @group Props
   */
  maximizeButtonProps = {
    severity: "secondary",
    text: true,
    rounded: true
  };
  /**
   * Specifies the visibility of the dialog.
   * @group Props
   */
  get visible() {
    return this._visible;
  }
  set visible(value) {
    this._visible = value;
    if (this._visible && !this.maskVisible) {
      this.maskVisible = true;
    }
  }
  /**
   * Inline style of the component.
   * @group Props
   */
  get style() {
    return this._style;
  }
  set style(value) {
    if (value) {
      this._style = __spreadValues({}, value);
      this.originalStyle = value;
    }
  }
  /**
   * Position of the dialog.
   * @group Props
   */
  get position() {
    return this._position;
  }
  set position(value) {
    this._position = value;
    switch (value) {
      case "topleft":
      case "bottomleft":
      case "left":
        this.transformOptions = "translate3d(-100%, 0px, 0px)";
        break;
      case "topright":
      case "bottomright":
      case "right":
        this.transformOptions = "translate3d(100%, 0px, 0px)";
        break;
      case "bottom":
        this.transformOptions = "translate3d(0px, 100%, 0px)";
        break;
      case "top":
        this.transformOptions = "translate3d(0px, -100%, 0px)";
        break;
      default:
        this.transformOptions = "scale(0.7)";
        break;
    }
  }
  /**
   * Role attribute of html element.
   * @group Emits
   */
  role = "dialog";
  /**
   * Callback to invoke when dialog is shown.
   * @group Emits
   */
  onShow = new EventEmitter();
  /**
   * Callback to invoke when dialog is hidden.
   * @group Emits
   */
  onHide = new EventEmitter();
  /**
   * This EventEmitter is used to notify changes in the visibility state of a component.
   * @param {boolean} value - New value.
   * @group Emits
   */
  visibleChange = new EventEmitter();
  /**
   * Callback to invoke when dialog resizing is initiated.
   * @param {MouseEvent} event - Mouse event.
   * @group Emits
   */
  onResizeInit = new EventEmitter();
  /**
   * Callback to invoke when dialog resizing is completed.
   * @param {MouseEvent} event - Mouse event.
   * @group Emits
   */
  onResizeEnd = new EventEmitter();
  /**
   * Callback to invoke when dialog dragging is completed.
   * @param {DragEvent} event - Drag event.
   * @group Emits
   */
  onDragEnd = new EventEmitter();
  /**
   * Callback to invoke when dialog maximized or unmaximized.
   * @group Emits
   */
  onMaximize = new EventEmitter();
  headerViewChild;
  contentViewChild;
  footerViewChild;
  /**
   * Header template.
   * @group Props
   */
  headerTemplate;
  /**
   * Content template.
   * @group Props
   */
  contentTemplate;
  /**
   * Footer template.
   * @group Props
   */
  footerTemplate;
  /**
   * Close icon template.
   * @group Props
   */
  closeIconTemplate;
  /**
   * Maximize icon template.
   * @group Props
   */
  maximizeIconTemplate;
  /**
   * Minimize icon template.
   * @group Props
   */
  minimizeIconTemplate;
  /**
   * Headless template.
   * @group Props
   */
  headlessTemplate;
  _headerTemplate;
  _contentTemplate;
  _footerTemplate;
  _closeiconTemplate;
  _maximizeiconTemplate;
  _minimizeiconTemplate;
  _headlessTemplate;
  _visible = false;
  maskVisible;
  container;
  wrapper;
  dragging;
  ariaLabelledBy = this.getAriaLabelledBy();
  documentDragListener;
  documentDragEndListener;
  resizing;
  documentResizeListener;
  documentResizeEndListener;
  documentEscapeListener;
  maskClickListener;
  lastPageX;
  lastPageY;
  preventVisibleChangePropagation;
  maximized;
  preMaximizeContentHeight;
  preMaximizeContainerWidth;
  preMaximizeContainerHeight;
  preMaximizePageX;
  preMaximizePageY;
  id = uuid("pn_id_");
  _style = {};
  _position = "center";
  originalStyle;
  transformOptions = "scale(0.7)";
  styleElement;
  window;
  _componentStyle = inject(DialogStyle);
  headerT;
  contentT;
  footerT;
  closeIconT;
  maximizeIconT;
  minimizeIconT;
  headlessT;
  get maximizeLabel() {
    return this.config.getTranslation(TranslationKeys.ARIA)["maximizeLabel"];
  }
  zone = inject(NgZone);
  get maskClass() {
    const positions = ["left", "right", "top", "topleft", "topright", "bottom", "bottomleft", "bottomright"];
    const pos = positions.find((item) => item === this.position);
    return {
      "p-dialog-mask": true,
      "p-overlay-mask p-overlay-mask-enter": this.modal || this.dismissableMask,
      [`p-dialog-${pos}`]: pos
    };
  }
  ngOnInit() {
    super.ngOnInit();
    if (this.breakpoints) {
      this.createStyle();
    }
  }
  templates;
  ngAfterContentInit() {
    this.templates?.forEach((item) => {
      switch (item.getType()) {
        case "header":
          this.headerT = item.template;
          break;
        case "content":
          this.contentT = item.template;
          break;
        case "footer":
          this.footerT = item.template;
          break;
        case "closeicon":
          this.closeIconT = item.template;
          break;
        case "maximizeicon":
          this.maximizeIconT = item.template;
          break;
        case "minimizeicon":
          this.minimizeIconT = item.template;
          break;
        case "headless":
          this.headlessT = item.template;
          break;
        default:
          this.contentT = item.template;
          break;
      }
    });
  }
  getAriaLabelledBy() {
    return this.header !== null ? uuid("pn_id_") + "_header" : null;
  }
  parseDurationToMilliseconds(durationString) {
    const transitionTimeRegex = /([\d\.]+)(ms|s)\b/g;
    let totalMilliseconds = 0;
    let match;
    while ((match = transitionTimeRegex.exec(durationString)) !== null) {
      const value = parseFloat(match[1]);
      const unit = match[2];
      if (unit === "ms") {
        totalMilliseconds += value;
      } else if (unit === "s") {
        totalMilliseconds += value * 1e3;
      }
    }
    if (totalMilliseconds === 0) {
      return void 0;
    }
    return totalMilliseconds;
  }
  _focus(focusParentElement) {
    if (focusParentElement) {
      const timeoutDuration = this.parseDurationToMilliseconds(this.transitionOptions);
      let _focusableElements = DomHandler.getFocusableElements(focusParentElement);
      if (_focusableElements && _focusableElements.length > 0) {
        this.zone.runOutsideAngular(() => {
          setTimeout(() => _focusableElements[0].focus(), timeoutDuration || 5);
        });
        return true;
      }
    }
    return false;
  }
  focus(focusParentElement) {
    let focused = this._focus(focusParentElement);
    if (!focused) {
      focused = this._focus(this.footerViewChild?.nativeElement);
      if (!focused) {
        focused = this._focus(this.headerViewChild?.nativeElement);
        if (!focused) {
          this._focus(this.contentViewChild?.nativeElement);
        }
      }
    }
  }
  close(event) {
    this.visibleChange.emit(false);
    event.preventDefault();
  }
  enableModality() {
    if (this.closable && this.dismissableMask) {
      this.maskClickListener = this.renderer.listen(this.wrapper, "mousedown", (event) => {
        if (this.wrapper && this.wrapper.isSameNode(event.target)) {
          this.close(event);
        }
      });
    }
    if (this.modal) {
      blockBodyScroll();
    }
  }
  disableModality() {
    if (this.wrapper) {
      if (this.dismissableMask) {
        this.unbindMaskClickListener();
      }
      const scrollBlockers = document.querySelectorAll(".p-dialog-mask-scrollblocker");
      if (this.modal && scrollBlockers && scrollBlockers.length == 1) {
        unblockBodyScroll();
      }
      if (!this.cd.destroyed) {
        this.cd.detectChanges();
      }
    }
  }
  maximize() {
    this.maximized = !this.maximized;
    if (!this.modal && !this.blockScroll) {
      if (this.maximized) {
        blockBodyScroll();
      } else {
        unblockBodyScroll();
      }
    }
    this.onMaximize.emit({
      maximized: this.maximized
    });
  }
  unbindMaskClickListener() {
    if (this.maskClickListener) {
      this.maskClickListener();
      this.maskClickListener = null;
    }
  }
  moveOnTop() {
    if (this.autoZIndex) {
      zindexutils.set("modal", this.container, this.baseZIndex + this.config.zIndex.modal);
      this.wrapper.style.zIndex = String(parseInt(this.container.style.zIndex, 10) - 1);
    }
  }
  createStyle() {
    if (isPlatformBrowser(this.platformId)) {
      if (!this.styleElement) {
        this.styleElement = this.renderer.createElement("style");
        this.styleElement.type = "text/css";
        this.renderer.appendChild(this.document.head, this.styleElement);
        let innerHTML = "";
        for (let breakpoint in this.breakpoints) {
          innerHTML += `
                        @media screen and (max-width: ${breakpoint}) {
                            .p-dialog[${this.id}]:not(.p-dialog-maximized) {
                                width: ${this.breakpoints[breakpoint]} !important;
                            }
                        }
                    `;
        }
        this.renderer.setProperty(this.styleElement, "innerHTML", innerHTML);
        setAttribute(this.styleElement, "nonce", this.config?.csp()?.nonce);
      }
    }
  }
  initDrag(event) {
    if (hasClass(event.target, "p-dialog-maximize-icon") || hasClass(event.target, "p-dialog-header-close-icon") || hasClass(event.target.parentElement, "p-dialog-header-icon")) {
      return;
    }
    if (this.draggable) {
      this.dragging = true;
      this.lastPageX = event.pageX;
      this.lastPageY = event.pageY;
      this.container.style.margin = "0";
      addClass(this.document.body, "p-unselectable-text");
    }
  }
  onDrag(event) {
    if (this.dragging) {
      const containerWidth = getOuterWidth(this.container);
      const containerHeight = getOuterHeight(this.container);
      const deltaX = event.pageX - this.lastPageX;
      const deltaY = event.pageY - this.lastPageY;
      const offset = this.container.getBoundingClientRect();
      const containerComputedStyle = getComputedStyle(this.container);
      const leftMargin = parseFloat(containerComputedStyle.marginLeft);
      const topMargin = parseFloat(containerComputedStyle.marginTop);
      const leftPos = offset.left + deltaX - leftMargin;
      const topPos = offset.top + deltaY - topMargin;
      const viewport = getViewport();
      this.container.style.position = "fixed";
      if (this.keepInViewport) {
        if (leftPos >= this.minX && leftPos + containerWidth < viewport.width) {
          this._style.left = `${leftPos}px`;
          this.lastPageX = event.pageX;
          this.container.style.left = `${leftPos}px`;
        }
        if (topPos >= this.minY && topPos + containerHeight < viewport.height) {
          this._style.top = `${topPos}px`;
          this.lastPageY = event.pageY;
          this.container.style.top = `${topPos}px`;
        }
      } else {
        this.lastPageX = event.pageX;
        this.container.style.left = `${leftPos}px`;
        this.lastPageY = event.pageY;
        this.container.style.top = `${topPos}px`;
      }
    }
  }
  endDrag(event) {
    if (this.dragging) {
      this.dragging = false;
      removeClass(this.document.body, "p-unselectable-text");
      this.cd.detectChanges();
      this.onDragEnd.emit(event);
    }
  }
  resetPosition() {
    this.container.style.position = "";
    this.container.style.left = "";
    this.container.style.top = "";
    this.container.style.margin = "";
  }
  //backward compatibility
  center() {
    this.resetPosition();
  }
  initResize(event) {
    if (this.resizable) {
      this.resizing = true;
      this.lastPageX = event.pageX;
      this.lastPageY = event.pageY;
      addClass(this.document.body, "p-unselectable-text");
      this.onResizeInit.emit(event);
    }
  }
  onResize(event) {
    if (this.resizing) {
      let deltaX = event.pageX - this.lastPageX;
      let deltaY = event.pageY - this.lastPageY;
      let containerWidth = getOuterWidth(this.container);
      let containerHeight = getOuterHeight(this.container);
      let contentHeight = getOuterHeight(this.contentViewChild?.nativeElement);
      let newWidth = containerWidth + deltaX;
      let newHeight = containerHeight + deltaY;
      let minWidth = this.container.style.minWidth;
      let minHeight = this.container.style.minHeight;
      let offset = this.container.getBoundingClientRect();
      let viewport = getViewport();
      let hasBeenDragged = !parseInt(this.container.style.top) || !parseInt(this.container.style.left);
      if (hasBeenDragged) {
        newWidth += deltaX;
        newHeight += deltaY;
      }
      if ((!minWidth || newWidth > parseInt(minWidth)) && offset.left + newWidth < viewport.width) {
        this._style.width = newWidth + "px";
        this.container.style.width = this._style.width;
      }
      if ((!minHeight || newHeight > parseInt(minHeight)) && offset.top + newHeight < viewport.height) {
        this.contentViewChild.nativeElement.style.height = contentHeight + newHeight - containerHeight + "px";
        if (this._style.height) {
          this._style.height = newHeight + "px";
          this.container.style.height = this._style.height;
        }
      }
      this.lastPageX = event.pageX;
      this.lastPageY = event.pageY;
    }
  }
  resizeEnd(event) {
    if (this.resizing) {
      this.resizing = false;
      removeClass(this.document.body, "p-unselectable-text");
      this.onResizeEnd.emit(event);
    }
  }
  bindGlobalListeners() {
    if (this.draggable) {
      this.bindDocumentDragListener();
      this.bindDocumentDragEndListener();
    }
    if (this.resizable) {
      this.bindDocumentResizeListeners();
    }
    if (this.closeOnEscape && this.closable) {
      this.bindDocumentEscapeListener();
    }
  }
  unbindGlobalListeners() {
    this.unbindDocumentDragListener();
    this.unbindDocumentDragEndListener();
    this.unbindDocumentResizeListeners();
    this.unbindDocumentEscapeListener();
  }
  bindDocumentDragListener() {
    if (!this.documentDragListener) {
      this.zone.runOutsideAngular(() => {
        this.documentDragListener = this.renderer.listen(this.document.defaultView, "mousemove", this.onDrag.bind(this));
      });
    }
  }
  unbindDocumentDragListener() {
    if (this.documentDragListener) {
      this.documentDragListener();
      this.documentDragListener = null;
    }
  }
  bindDocumentDragEndListener() {
    if (!this.documentDragEndListener) {
      this.zone.runOutsideAngular(() => {
        this.documentDragEndListener = this.renderer.listen(this.document.defaultView, "mouseup", this.endDrag.bind(this));
      });
    }
  }
  unbindDocumentDragEndListener() {
    if (this.documentDragEndListener) {
      this.documentDragEndListener();
      this.documentDragEndListener = null;
    }
  }
  bindDocumentResizeListeners() {
    if (!this.documentResizeListener && !this.documentResizeEndListener) {
      this.zone.runOutsideAngular(() => {
        this.documentResizeListener = this.renderer.listen(this.document.defaultView, "mousemove", this.onResize.bind(this));
        this.documentResizeEndListener = this.renderer.listen(this.document.defaultView, "mouseup", this.resizeEnd.bind(this));
      });
    }
  }
  unbindDocumentResizeListeners() {
    if (this.documentResizeListener && this.documentResizeEndListener) {
      this.documentResizeListener();
      this.documentResizeEndListener();
      this.documentResizeListener = null;
      this.documentResizeEndListener = null;
    }
  }
  bindDocumentEscapeListener() {
    const documentTarget = this.el ? this.el.nativeElement.ownerDocument : "document";
    this.documentEscapeListener = this.renderer.listen(documentTarget, "keydown", (event) => {
      if (event.key == "Escape") {
        this.close(event);
      }
    });
  }
  unbindDocumentEscapeListener() {
    if (this.documentEscapeListener) {
      this.documentEscapeListener();
      this.documentEscapeListener = null;
    }
  }
  appendContainer() {
    if (this.appendTo) {
      if (this.appendTo === "body") this.renderer.appendChild(this.document.body, this.wrapper);
      else appendChild(this.appendTo, this.wrapper);
    }
  }
  restoreAppend() {
    if (this.container && this.appendTo) {
      this.renderer.appendChild(this.el.nativeElement, this.wrapper);
    }
  }
  onAnimationStart(event) {
    switch (event.toState) {
      case "visible":
        this.container = event.element;
        this.wrapper = this.container?.parentElement;
        this.appendContainer();
        this.moveOnTop();
        this.bindGlobalListeners();
        this.container?.setAttribute(this.id, "");
        if (this.modal) {
          this.enableModality();
        }
        if (this.focusOnShow) {
          this.focus();
        }
        break;
      case "void":
        if (this.wrapper && this.modal) {
          addClass(this.wrapper, "p-overlay-mask-leave");
        }
        break;
    }
  }
  onAnimationEnd(event) {
    switch (event.toState) {
      case "void":
        this.onContainerDestroy();
        this.onHide.emit({});
        this.cd.markForCheck();
        if (this.maskVisible !== this.visible) {
          this.maskVisible = this.visible;
        }
        break;
      case "visible":
        this.onShow.emit({});
        break;
    }
  }
  onContainerDestroy() {
    this.unbindGlobalListeners();
    this.dragging = false;
    this.maskVisible = false;
    if (this.maximized) {
      this.document.body.style.removeProperty("--scrollbar;-width");
      this.maximized = false;
    }
    if (this.modal) {
      this.disableModality();
    }
    if (hasClass(this.document.body, "p-overflow-hidden")) {
      removeClass(this.document.body, "p-overflow-hidden");
    }
    if (this.container && this.autoZIndex) {
      zindexutils.clear(this.container);
    }
    this.container = null;
    this.wrapper = null;
    this._style = this.originalStyle ? __spreadValues({}, this.originalStyle) : {};
  }
  destroyStyle() {
    if (this.styleElement) {
      this.renderer.removeChild(this.document.head, this.styleElement);
      this.styleElement = null;
    }
  }
  ngOnDestroy() {
    if (this.container) {
      this.restoreAppend();
      this.onContainerDestroy();
    }
    this.destroyStyle();
    super.ngOnDestroy();
  }
  static ɵfac = /* @__PURE__ */ (() => {
    let ɵDialog_BaseFactory;
    return function Dialog_Factory(__ngFactoryType__) {
      return (ɵDialog_BaseFactory || (ɵDialog_BaseFactory = ɵɵgetInheritedFactory(_Dialog)))(__ngFactoryType__ || _Dialog);
    };
  })();
  static ɵcmp = ɵɵdefineComponent({
    type: _Dialog,
    selectors: [["p-dialog"]],
    contentQueries: function Dialog_ContentQueries(rf, ctx, dirIndex) {
      if (rf & 1) {
        ɵɵcontentQuery(dirIndex, _c0, 4)(dirIndex, _c1, 4)(dirIndex, _c2, 4)(dirIndex, _c3, 4)(dirIndex, _c4, 4)(dirIndex, _c5, 4)(dirIndex, _c6, 4)(dirIndex, PrimeTemplate, 4);
      }
      if (rf & 2) {
        let _t;
        ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx._headerTemplate = _t.first);
        ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx._contentTemplate = _t.first);
        ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx._footerTemplate = _t.first);
        ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx._closeiconTemplate = _t.first);
        ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx._maximizeiconTemplate = _t.first);
        ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx._minimizeiconTemplate = _t.first);
        ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx._headlessTemplate = _t.first);
        ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.templates = _t);
      }
    },
    viewQuery: function Dialog_Query(rf, ctx) {
      if (rf & 1) {
        ɵɵviewQuery(_c7, 5)(_c1, 5)(_c2, 5);
      }
      if (rf & 2) {
        let _t;
        ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.headerViewChild = _t.first);
        ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.contentViewChild = _t.first);
        ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.footerViewChild = _t.first);
      }
    },
    inputs: {
      header: "header",
      draggable: [2, "draggable", "draggable", booleanAttribute],
      resizable: [2, "resizable", "resizable", booleanAttribute],
      positionLeft: "positionLeft",
      positionTop: "positionTop",
      contentStyle: "contentStyle",
      contentStyleClass: "contentStyleClass",
      modal: [2, "modal", "modal", booleanAttribute],
      closeOnEscape: [2, "closeOnEscape", "closeOnEscape", booleanAttribute],
      dismissableMask: [2, "dismissableMask", "dismissableMask", booleanAttribute],
      rtl: [2, "rtl", "rtl", booleanAttribute],
      closable: [2, "closable", "closable", booleanAttribute],
      responsive: "responsive",
      appendTo: "appendTo",
      breakpoints: "breakpoints",
      styleClass: "styleClass",
      maskStyleClass: "maskStyleClass",
      maskStyle: "maskStyle",
      showHeader: [2, "showHeader", "showHeader", booleanAttribute],
      breakpoint: "breakpoint",
      blockScroll: [2, "blockScroll", "blockScroll", booleanAttribute],
      autoZIndex: [2, "autoZIndex", "autoZIndex", booleanAttribute],
      baseZIndex: [2, "baseZIndex", "baseZIndex", numberAttribute],
      minX: [2, "minX", "minX", numberAttribute],
      minY: [2, "minY", "minY", numberAttribute],
      focusOnShow: [2, "focusOnShow", "focusOnShow", booleanAttribute],
      maximizable: [2, "maximizable", "maximizable", booleanAttribute],
      keepInViewport: [2, "keepInViewport", "keepInViewport", booleanAttribute],
      focusTrap: [2, "focusTrap", "focusTrap", booleanAttribute],
      transitionOptions: "transitionOptions",
      closeIcon: "closeIcon",
      closeAriaLabel: "closeAriaLabel",
      closeTabindex: "closeTabindex",
      minimizeIcon: "minimizeIcon",
      maximizeIcon: "maximizeIcon",
      closeButtonProps: "closeButtonProps",
      maximizeButtonProps: "maximizeButtonProps",
      visible: "visible",
      style: "style",
      position: "position",
      role: "role",
      headerTemplate: [0, "content", "headerTemplate"],
      contentTemplate: "contentTemplate",
      footerTemplate: "footerTemplate",
      closeIconTemplate: "closeIconTemplate",
      maximizeIconTemplate: "maximizeIconTemplate",
      minimizeIconTemplate: "minimizeIconTemplate",
      headlessTemplate: "headlessTemplate"
    },
    outputs: {
      onShow: "onShow",
      onHide: "onHide",
      visibleChange: "visibleChange",
      onResizeInit: "onResizeInit",
      onResizeEnd: "onResizeEnd",
      onDragEnd: "onDragEnd",
      onMaximize: "onMaximize"
    },
    features: [ɵɵProvidersFeature([DialogStyle]), ɵɵInheritDefinitionFeature],
    ngContentSelectors: _c9,
    decls: 1,
    vars: 1,
    consts: [["container", ""], ["notHeadless", ""], ["content", ""], ["titlebar", ""], ["icon", ""], ["footer", ""], [3, "ngClass", "class", "ngStyle", "style", 4, "ngIf"], [3, "ngClass", "ngStyle"], ["pFocusTrap", "", 3, "class", "ngClass", "ngStyle", "style", "pFocusTrapDisabled", 4, "ngIf"], ["pFocusTrap", "", 3, "ngClass", "ngStyle", "pFocusTrapDisabled"], [4, "ngIf", "ngIfElse"], [4, "ngTemplateOutlet"], ["style", "z-index: 90;", 3, "ngClass", "mousedown", 4, "ngIf"], [3, "ngClass", "mousedown", 4, "ngIf"], [3, "ngClass", 4, "ngIf"], [2, "z-index", "90", 3, "mousedown", "ngClass"], [3, "mousedown", "ngClass"], [3, "id", "ngClass", 4, "ngIf"], [3, "ngClass"], [3, "styleClass", "tabindex", "ariaLabel", "buttonProps", "onClick", "keydown.enter", 4, "ngIf"], [3, "styleClass", "ariaLabel", "tabindex", "buttonProps", "onClick", "keydown.enter", 4, "ngIf"], [3, "id", "ngClass"], [3, "onClick", "keydown.enter", "styleClass", "tabindex", "ariaLabel", "buttonProps"], [4, "ngIf"], [3, "onClick", "keydown.enter", "styleClass", "ariaLabel", "tabindex", "buttonProps"]],
    template: function Dialog_Template(rf, ctx) {
      if (rf & 1) {
        ɵɵprojectionDef(_c8);
        ɵɵtemplate(0, Dialog_div_0_Template, 2, 11, "div", 6);
      }
      if (rf & 2) {
        ɵɵproperty("ngIf", ctx.maskVisible);
      }
    },
    dependencies: [CommonModule, NgClass, NgIf, NgTemplateOutlet, NgStyle, Button, FocusTrap, TimesIcon, WindowMaximizeIcon, WindowMinimizeIcon, SharedModule],
    encapsulation: 2,
    data: {
      animation: [trigger("animation", [transition("void => visible", [useAnimation(showAnimation)]), transition("visible => void", [useAnimation(hideAnimation)])])]
    },
    changeDetection: 0
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(Dialog, [{
    type: Component,
    args: [{
      selector: "p-dialog",
      standalone: true,
      imports: [CommonModule, Button, FocusTrap, TimesIcon, WindowMaximizeIcon, WindowMinimizeIcon, SharedModule],
      template: `
        <div
            *ngIf="maskVisible"
            [ngClass]="maskClass"
            [class]="maskStyleClass"
            [ngStyle]="{
                position: 'fixed',
                height: '100%',
                width: '100%',
                left: 0,
                top: 0,
                display: 'flex',
                'justify-content': position === 'left' || position === 'topleft' || position === 'bottomleft' ? 'flex-start' : position === 'right' || position === 'topright' || position === 'bottomright' ? 'flex-end' : 'center',
                'align-items': position === 'top' || position === 'topleft' || position === 'topright' ? 'flex-start' : position === 'bottom' || position === 'bottomleft' || position === 'bottomright' ? 'flex-end' : 'center',
                'pointer-events': modal ? 'auto' : 'none'
            }"
            [style]="maskStyle"
        >
            <div
                *ngIf="visible"
                #container
                [class]="styleClass"
                [ngClass]="{ 'p-dialog p-component': true, 'p-dialog-maximized': maximizable && maximized }"
                [ngStyle]="{ display: 'flex', 'flex-direction': 'column', 'pointer-events': 'auto' }"
                [style]="style"
                pFocusTrap
                [pFocusTrapDisabled]="focusTrap === false"
                [@animation]="{
                    value: 'visible',
                    params: { transform: transformOptions, transition: transitionOptions }
                }"
                (@animation.start)="onAnimationStart($event)"
                (@animation.done)="onAnimationEnd($event)"
                [attr.role]="role"
                [attr.aria-labelledby]="ariaLabelledBy"
                [attr.aria-modal]="true"
            >
                <ng-container *ngIf="_headlessTemplate || headlessTemplate || headlessT; else notHeadless">
                    <ng-container *ngTemplateOutlet="_headlessTemplate || headlessTemplate || headlessT"></ng-container>
                </ng-container>

                <ng-template #notHeadless>
                    <div *ngIf="resizable" [ngClass]="cx('resizeHandle')" style="z-index: 90;" (mousedown)="initResize($event)"></div>
                    <div #titlebar [ngClass]="cx('header')" (mousedown)="initDrag($event)" *ngIf="showHeader">
                        <span [id]="ariaLabelledBy" [ngClass]="cx('title')" *ngIf="!_headerTemplate && !headerTemplate && !headerT">{{ header }}</span>
                        <ng-container *ngTemplateOutlet="_headerTemplate || headerTemplate || headerT"></ng-container>
                        <div [ngClass]="cx('headerActions')">
                            <p-button *ngIf="maximizable" [styleClass]="cx('pcMaximizeButton')" (onClick)="maximize()" (keydown.enter)="maximize()" [tabindex]="maximizable ? '0' : '-1'" [ariaLabel]="maximizeLabel" [buttonProps]="maximizeButtonProps">
                                <span *ngIf="maximizeIcon && !_maximizeiconTemplate && !_minimizeiconTemplate" [ngClass]="maximized ? minimizeIcon : maximizeIcon"></span>
                                <ng-container *ngIf="!maximizeIcon && !maximizeButtonProps?.icon">
                                    <WindowMaximizeIcon *ngIf="!maximized && !_maximizeiconTemplate && !maximizeIconTemplate && !maximizeIconT" />
                                    <WindowMinimizeIcon *ngIf="maximized && !_minimizeiconTemplate && !minimizeIconTemplate && !minimizeIconT" />
                                </ng-container>
                                <ng-container *ngIf="!maximized">
                                    <ng-template *ngTemplateOutlet="_maximizeiconTemplate || maximizeIconTemplate || maximizeIconT"></ng-template>
                                </ng-container>
                                <ng-container *ngIf="maximized">
                                    <ng-template *ngTemplateOutlet="_minimizeiconTemplate || minimizeIconTemplate || minimizeIconT"></ng-template>
                                </ng-container>
                            </p-button>
                            <p-button *ngIf="closable" [styleClass]="cx('pcCloseButton')" [ariaLabel]="closeAriaLabel" (onClick)="close($event)" (keydown.enter)="close($event)" [tabindex]="closeTabindex" [buttonProps]="closeButtonProps">
                                <ng-template #icon>
                                    <ng-container *ngIf="!_closeiconTemplate && !closeIconTemplate && !closeIconT && !closeButtonProps?.icon">
                                        <span *ngIf="closeIcon" [ngClass]="closeIcon"></span>
                                        <TimesIcon *ngIf="!closeIcon" />
                                    </ng-container>
                                    <span *ngIf="_closeiconTemplate || closeIconTemplate || closeIconT">
                                        <ng-template *ngTemplateOutlet="_closeiconTemplate || closeIconTemplate || closeIconT"></ng-template>
                                    </span>
                                </ng-template>
                            </p-button>
                        </div>
                    </div>
                    <div #content [ngClass]="cx('content')" [class]="contentStyleClass" [ngStyle]="contentStyle" [attr.data-pc-section]="'content'">
                        <ng-content></ng-content>
                        <ng-container *ngTemplateOutlet="_contentTemplate || contentTemplate || contentT"></ng-container>
                    </div>
                    <div #footer [ngClass]="cx('footer')" *ngIf="_footerTemplate || footerTemplate || footerT">
                        <ng-content select="p-footer"></ng-content>
                        <ng-container *ngTemplateOutlet="_footerTemplate || footerTemplate || footerT"></ng-container>
                    </div>
                </ng-template>
            </div>
        </div>
    `,
      animations: [trigger("animation", [transition("void => visible", [useAnimation(showAnimation)]), transition("visible => void", [useAnimation(hideAnimation)])])],
      changeDetection: ChangeDetectionStrategy.OnPush,
      encapsulation: ViewEncapsulation.None,
      providers: [DialogStyle]
    }]
  }], null, {
    header: [{
      type: Input
    }],
    draggable: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    resizable: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    positionLeft: [{
      type: Input
    }],
    positionTop: [{
      type: Input
    }],
    contentStyle: [{
      type: Input
    }],
    contentStyleClass: [{
      type: Input
    }],
    modal: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    closeOnEscape: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    dismissableMask: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    rtl: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    closable: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    responsive: [{
      type: Input
    }],
    appendTo: [{
      type: Input
    }],
    breakpoints: [{
      type: Input
    }],
    styleClass: [{
      type: Input
    }],
    maskStyleClass: [{
      type: Input
    }],
    maskStyle: [{
      type: Input
    }],
    showHeader: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    breakpoint: [{
      type: Input
    }],
    blockScroll: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    autoZIndex: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    baseZIndex: [{
      type: Input,
      args: [{
        transform: numberAttribute
      }]
    }],
    minX: [{
      type: Input,
      args: [{
        transform: numberAttribute
      }]
    }],
    minY: [{
      type: Input,
      args: [{
        transform: numberAttribute
      }]
    }],
    focusOnShow: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    maximizable: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    keepInViewport: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    focusTrap: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    transitionOptions: [{
      type: Input
    }],
    closeIcon: [{
      type: Input
    }],
    closeAriaLabel: [{
      type: Input
    }],
    closeTabindex: [{
      type: Input
    }],
    minimizeIcon: [{
      type: Input
    }],
    maximizeIcon: [{
      type: Input
    }],
    closeButtonProps: [{
      type: Input
    }],
    maximizeButtonProps: [{
      type: Input
    }],
    visible: [{
      type: Input
    }],
    style: [{
      type: Input
    }],
    position: [{
      type: Input
    }],
    role: [{
      type: Input
    }],
    onShow: [{
      type: Output
    }],
    onHide: [{
      type: Output
    }],
    visibleChange: [{
      type: Output
    }],
    onResizeInit: [{
      type: Output
    }],
    onResizeEnd: [{
      type: Output
    }],
    onDragEnd: [{
      type: Output
    }],
    onMaximize: [{
      type: Output
    }],
    headerViewChild: [{
      type: ViewChild,
      args: ["titlebar"]
    }],
    contentViewChild: [{
      type: ViewChild,
      args: ["content"]
    }],
    footerViewChild: [{
      type: ViewChild,
      args: ["footer"]
    }],
    headerTemplate: [{
      type: Input,
      args: ["content"]
    }],
    contentTemplate: [{
      type: Input
    }],
    footerTemplate: [{
      type: Input
    }],
    closeIconTemplate: [{
      type: Input
    }],
    maximizeIconTemplate: [{
      type: Input
    }],
    minimizeIconTemplate: [{
      type: Input
    }],
    headlessTemplate: [{
      type: Input
    }],
    _headerTemplate: [{
      type: ContentChild,
      args: ["header", {
        descendants: false
      }]
    }],
    _contentTemplate: [{
      type: ContentChild,
      args: ["content", {
        descendants: false
      }]
    }],
    _footerTemplate: [{
      type: ContentChild,
      args: ["footer", {
        descendants: false
      }]
    }],
    _closeiconTemplate: [{
      type: ContentChild,
      args: ["closeicon", {
        descendants: false
      }]
    }],
    _maximizeiconTemplate: [{
      type: ContentChild,
      args: ["maximizeicon", {
        descendants: false
      }]
    }],
    _minimizeiconTemplate: [{
      type: ContentChild,
      args: ["minimizeicon", {
        descendants: false
      }]
    }],
    _headlessTemplate: [{
      type: ContentChild,
      args: ["headless", {
        descendants: false
      }]
    }],
    templates: [{
      type: ContentChildren,
      args: [PrimeTemplate]
    }]
  });
})();
var DialogModule = class _DialogModule {
  static ɵfac = function DialogModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _DialogModule)();
  };
  static ɵmod = ɵɵdefineNgModule({
    type: _DialogModule,
    imports: [Dialog, SharedModule],
    exports: [Dialog, SharedModule]
  });
  static ɵinj = ɵɵdefineInjector({
    imports: [Dialog, SharedModule, SharedModule]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(DialogModule, [{
    type: NgModule,
    args: [{
      imports: [Dialog, SharedModule],
      exports: [Dialog, SharedModule]
    }]
  }], null, null);
})();

// node_modules/primeng/fesm2022/primeng-dynamicdialog.mjs
var _c02 = ["mask"];
var _c15 = ["content"];
var _c22 = ["footer"];
var _c32 = ["titlebar"];
var _c42 = (a0, a1, a2) => ({
  position: "fixed",
  height: "100%",
  width: "100%",
  left: 0,
  top: 0,
  display: "flex",
  "justify-content": a0,
  "align-items": a1,
  "pointer-events": a2
});
var _c52 = (a0) => ({
  "p-dialog p-component": true,
  "p-dialog-maximized": a0
});
var _c62 = () => ({
  display: "flex",
  "flex-direction": "column",
  "pointer-events": "auto"
});
var _c72 = (a0, a1) => ({
  transform: a0,
  transition: a1
});
var _c82 = (a0) => ({
  value: "visible",
  params: a0
});
function DynamicDialogComponent_div_2_div_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r3 = ɵɵgetCurrentView();
    ɵɵelementStart(0, "div", 14);
    ɵɵlistener("mousedown", function DynamicDialogComponent_div_2_div_2_Template_div_mousedown_0_listener($event) {
      ɵɵrestoreView(_r3);
      const ctx_r1 = ɵɵnextContext(2);
      return ɵɵresetView(ctx_r1.initResize($event));
    });
    ɵɵelementEnd();
  }
  if (rf & 2) {
    ɵɵproperty("ngClass", "p-resizable-handle");
  }
}
function DynamicDialogComponent_div_2_div_3_ng_container_2_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementContainer(0);
  }
}
function DynamicDialogComponent_div_2_div_3_ng_container_3_p_button_4_ng_container_1_WindowMaximizeIcon_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelement(0, "WindowMaximizeIcon");
  }
}
function DynamicDialogComponent_div_2_div_3_ng_container_3_p_button_4_ng_container_1_WindowMinimizeIcon_2_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelement(0, "WindowMinimizeIcon");
  }
}
function DynamicDialogComponent_div_2_div_3_ng_container_3_p_button_4_ng_container_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementContainerStart(0);
    ɵɵtemplate(1, DynamicDialogComponent_div_2_div_3_ng_container_3_p_button_4_ng_container_1_WindowMaximizeIcon_1_Template, 1, 0, "WindowMaximizeIcon", 11)(2, DynamicDialogComponent_div_2_div_3_ng_container_3_p_button_4_ng_container_1_WindowMinimizeIcon_2_Template, 1, 0, "WindowMinimizeIcon", 11);
    ɵɵelementContainerEnd();
  }
  if (rf & 2) {
    const ctx_r1 = ɵɵnextContext(5);
    ɵɵadvance();
    ɵɵproperty("ngIf", !ctx_r1.maximized && !ctx_r1.maximizeIconTemplate);
    ɵɵadvance();
    ɵɵproperty("ngIf", ctx_r1.maximized && !ctx_r1.minimizeIconTemplate);
  }
}
function DynamicDialogComponent_div_2_div_3_ng_container_3_p_button_4_ng_container_2_1_ng_template_0_Template(rf, ctx) {
}
function DynamicDialogComponent_div_2_div_3_ng_container_3_p_button_4_ng_container_2_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵtemplate(0, DynamicDialogComponent_div_2_div_3_ng_container_3_p_button_4_ng_container_2_1_ng_template_0_Template, 0, 0, "ng-template");
  }
}
function DynamicDialogComponent_div_2_div_3_ng_container_3_p_button_4_ng_container_2_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementContainerStart(0);
    ɵɵtemplate(1, DynamicDialogComponent_div_2_div_3_ng_container_3_p_button_4_ng_container_2_1_Template, 1, 0, null, 21);
    ɵɵelementContainerEnd();
  }
  if (rf & 2) {
    const ctx_r1 = ɵɵnextContext(5);
    ɵɵadvance();
    ɵɵproperty("ngTemplateOutlet", ctx_r1.maximizeIconTemplate);
  }
}
function DynamicDialogComponent_div_2_div_3_ng_container_3_p_button_4_ng_container_3_1_ng_template_0_Template(rf, ctx) {
}
function DynamicDialogComponent_div_2_div_3_ng_container_3_p_button_4_ng_container_3_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵtemplate(0, DynamicDialogComponent_div_2_div_3_ng_container_3_p_button_4_ng_container_3_1_ng_template_0_Template, 0, 0, "ng-template");
  }
}
function DynamicDialogComponent_div_2_div_3_ng_container_3_p_button_4_ng_container_3_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementContainerStart(0);
    ɵɵtemplate(1, DynamicDialogComponent_div_2_div_3_ng_container_3_p_button_4_ng_container_3_1_Template, 1, 0, null, 21);
    ɵɵelementContainerEnd();
  }
  if (rf & 2) {
    const ctx_r1 = ɵɵnextContext(5);
    ɵɵadvance();
    ɵɵproperty("ngTemplateOutlet", ctx_r1.minimizeIconTemplate);
  }
}
function DynamicDialogComponent_div_2_div_3_ng_container_3_p_button_4_Template(rf, ctx) {
  if (rf & 1) {
    const _r5 = ɵɵgetCurrentView();
    ɵɵelementStart(0, "p-button", 20);
    ɵɵlistener("onClick", function DynamicDialogComponent_div_2_div_3_ng_container_3_p_button_4_Template_p_button_onClick_0_listener() {
      ɵɵrestoreView(_r5);
      const ctx_r1 = ɵɵnextContext(4);
      return ɵɵresetView(ctx_r1.maximize());
    })("keydown.enter", function DynamicDialogComponent_div_2_div_3_ng_container_3_p_button_4_Template_p_button_keydown_enter_0_listener() {
      ɵɵrestoreView(_r5);
      const ctx_r1 = ɵɵnextContext(4);
      return ɵɵresetView(ctx_r1.maximize());
    });
    ɵɵtemplate(1, DynamicDialogComponent_div_2_div_3_ng_container_3_p_button_4_ng_container_1_Template, 3, 2, "ng-container", 11)(2, DynamicDialogComponent_div_2_div_3_ng_container_3_p_button_4_ng_container_2_Template, 2, 1, "ng-container", 11)(3, DynamicDialogComponent_div_2_div_3_ng_container_3_p_button_4_ng_container_3_Template, 2, 1, "ng-container", 11);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = ɵɵnextContext(4);
    ɵɵproperty("styleClass", "p-dialog-maximize-button")("tabindex", ctx_r1.maximizable ? "0" : "-1");
    ɵɵadvance();
    ɵɵproperty("ngIf", !ctx_r1.maximizeIcon);
    ɵɵadvance();
    ɵɵproperty("ngIf", !ctx_r1.maximized);
    ɵɵadvance();
    ɵɵproperty("ngIf", ctx_r1.maximized);
  }
}
function DynamicDialogComponent_div_2_div_3_ng_container_3_p_button_5_ng_container_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementContainerStart(0);
    ɵɵelement(1, "TimesIcon");
    ɵɵelementContainerEnd();
  }
}
function DynamicDialogComponent_div_2_div_3_ng_container_3_p_button_5_span_2_1_ng_template_0_Template(rf, ctx) {
}
function DynamicDialogComponent_div_2_div_3_ng_container_3_p_button_5_span_2_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵtemplate(0, DynamicDialogComponent_div_2_div_3_ng_container_3_p_button_5_span_2_1_ng_template_0_Template, 0, 0, "ng-template");
  }
}
function DynamicDialogComponent_div_2_div_3_ng_container_3_p_button_5_span_2_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "span");
    ɵɵtemplate(1, DynamicDialogComponent_div_2_div_3_ng_container_3_p_button_5_span_2_1_Template, 1, 0, null, 21);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = ɵɵnextContext(5);
    ɵɵadvance();
    ɵɵproperty("ngTemplateOutlet", ctx_r1.closeIconTemplate);
  }
}
function DynamicDialogComponent_div_2_div_3_ng_container_3_p_button_5_Template(rf, ctx) {
  if (rf & 1) {
    const _r6 = ɵɵgetCurrentView();
    ɵɵelementStart(0, "p-button", 22);
    ɵɵlistener("onClick", function DynamicDialogComponent_div_2_div_3_ng_container_3_p_button_5_Template_p_button_onClick_0_listener() {
      ɵɵrestoreView(_r6);
      const ctx_r1 = ɵɵnextContext(4);
      return ɵɵresetView(ctx_r1.hide());
    })("keydown.enter", function DynamicDialogComponent_div_2_div_3_ng_container_3_p_button_5_Template_p_button_keydown_enter_0_listener() {
      ɵɵrestoreView(_r6);
      const ctx_r1 = ɵɵnextContext(4);
      return ɵɵresetView(ctx_r1.hide());
    });
    ɵɵtemplate(1, DynamicDialogComponent_div_2_div_3_ng_container_3_p_button_5_ng_container_1_Template, 2, 0, "ng-container", 11)(2, DynamicDialogComponent_div_2_div_3_ng_container_3_p_button_5_span_2_Template, 2, 1, "span", 11);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = ɵɵnextContext(4);
    ɵɵproperty("styleClass", "p-dialog-close-button")("ariaLabel", ctx_r1.ddconfig.closeAriaLabel || ctx_r1.defaultCloseAriaLabel);
    ɵɵadvance();
    ɵɵproperty("ngIf", !ctx_r1.closeIconTemplate);
    ɵɵadvance();
    ɵɵproperty("ngIf", ctx_r1.closeIconTemplate);
  }
}
function DynamicDialogComponent_div_2_div_3_ng_container_3_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementContainerStart(0);
    ɵɵelementStart(1, "span", 16);
    ɵɵtext(2);
    ɵɵelementEnd();
    ɵɵelementStart(3, "div", 17);
    ɵɵtemplate(4, DynamicDialogComponent_div_2_div_3_ng_container_3_p_button_4_Template, 4, 5, "p-button", 18)(5, DynamicDialogComponent_div_2_div_3_ng_container_3_p_button_5_Template, 3, 4, "p-button", 19);
    ɵɵelementEnd();
    ɵɵelementContainerEnd();
  }
  if (rf & 2) {
    const ctx_r1 = ɵɵnextContext(3);
    ɵɵadvance();
    ɵɵproperty("ngClass", "p-dialog-title")("id", ctx_r1.ariaLabelledBy);
    ɵɵadvance();
    ɵɵtextInterpolate(ctx_r1.ddconfig.header);
    ɵɵadvance();
    ɵɵproperty("ngClass", "p-dialog-header-actions");
    ɵɵadvance();
    ɵɵproperty("ngIf", ctx_r1.ddconfig.maximizable);
    ɵɵadvance();
    ɵɵproperty("ngIf", ctx_r1.closable);
  }
}
function DynamicDialogComponent_div_2_div_3_Template(rf, ctx) {
  if (rf & 1) {
    const _r4 = ɵɵgetCurrentView();
    ɵɵelementStart(0, "div", 15, 3);
    ɵɵlistener("mousedown", function DynamicDialogComponent_div_2_div_3_Template_div_mousedown_0_listener($event) {
      ɵɵrestoreView(_r4);
      const ctx_r1 = ɵɵnextContext(2);
      return ɵɵresetView(ctx_r1.initDrag($event));
    });
    ɵɵtemplate(2, DynamicDialogComponent_div_2_div_3_ng_container_2_Template, 1, 0, "ng-container", 12)(3, DynamicDialogComponent_div_2_div_3_ng_container_3_Template, 6, 6, "ng-container", 11);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = ɵɵnextContext(2);
    ɵɵproperty("ngClass", "p-dialog-header");
    ɵɵadvance(2);
    ɵɵproperty("ngComponentOutlet", ctx_r1.headerTemplate);
    ɵɵadvance();
    ɵɵproperty("ngIf", !ctx_r1.headerTemplate);
  }
}
function DynamicDialogComponent_div_2_6_ng_template_0_Template(rf, ctx) {
}
function DynamicDialogComponent_div_2_6_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵtemplate(0, DynamicDialogComponent_div_2_6_ng_template_0_Template, 0, 0, "ng-template", 23);
  }
}
function DynamicDialogComponent_div_2_ng_container_7_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementContainer(0);
  }
}
function DynamicDialogComponent_div_2_div_8_ng_container_2_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementContainerStart(0);
    ɵɵtext(1);
    ɵɵelementContainerEnd();
  }
  if (rf & 2) {
    const ctx_r1 = ɵɵnextContext(3);
    ɵɵadvance();
    ɵɵtextInterpolate1(" ", ctx_r1.ddconfig.footer, " ");
  }
}
function DynamicDialogComponent_div_2_div_8_ng_container_3_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementContainer(0);
  }
}
function DynamicDialogComponent_div_2_div_8_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "div", 17, 4);
    ɵɵtemplate(2, DynamicDialogComponent_div_2_div_8_ng_container_2_Template, 2, 1, "ng-container", 11)(3, DynamicDialogComponent_div_2_div_8_ng_container_3_Template, 1, 0, "ng-container", 12);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = ɵɵnextContext(2);
    ɵɵproperty("ngClass", "p-dialog-footer");
    ɵɵadvance(2);
    ɵɵproperty("ngIf", !ctx_r1.footerTemplate);
    ɵɵadvance();
    ɵɵproperty("ngComponentOutlet", ctx_r1.footerTemplate);
  }
}
function DynamicDialogComponent_div_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = ɵɵgetCurrentView();
    ɵɵelementStart(0, "div", 7, 1);
    ɵɵlistener("@animation.start", function DynamicDialogComponent_div_2_Template_div_animation_animation_start_0_listener($event) {
      ɵɵrestoreView(_r1);
      const ctx_r1 = ɵɵnextContext();
      return ɵɵresetView(ctx_r1.onAnimationStart($event));
    })("@animation.done", function DynamicDialogComponent_div_2_Template_div_animation_animation_done_0_listener($event) {
      ɵɵrestoreView(_r1);
      const ctx_r1 = ɵɵnextContext();
      return ɵɵresetView(ctx_r1.onAnimationEnd($event));
    });
    ɵɵtemplate(2, DynamicDialogComponent_div_2_div_2_Template, 1, 1, "div", 8)(3, DynamicDialogComponent_div_2_div_3_Template, 4, 3, "div", 9);
    ɵɵelementStart(4, "div", 10, 2);
    ɵɵtemplate(6, DynamicDialogComponent_div_2_6_Template, 1, 0, null, 11)(7, DynamicDialogComponent_div_2_ng_container_7_Template, 1, 0, "ng-container", 12);
    ɵɵelementEnd();
    ɵɵtemplate(8, DynamicDialogComponent_div_2_div_8_Template, 4, 3, "div", 13);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = ɵɵnextContext();
    ɵɵstyleMap(ctx_r1.ddconfig.style);
    ɵɵclassMap(ctx_r1.ddconfig.styleClass);
    ɵɵstyleProp("width", ctx_r1.ddconfig.width)("height", ctx_r1.ddconfig.height);
    ɵɵproperty("ngClass", ɵɵpureFunction1(22, _c52, ctx_r1.maximizable && ctx_r1.maximized))("ngStyle", ɵɵpureFunction0(24, _c62))("@animation", ɵɵpureFunction1(28, _c82, ɵɵpureFunction2(25, _c72, ctx_r1.transformOptions, ctx_r1.ddconfig.transitionOptions || "150ms cubic-bezier(0, 0, 0.2, 1)")))("pFocusTrapDisabled", ctx_r1.ddconfig.focusTrap === false);
    ɵɵattribute("aria-labelledby", ctx_r1.ariaLabelledBy)("aria-modal", true)("id", ctx_r1.dialogId);
    ɵɵadvance(2);
    ɵɵproperty("ngIf", ctx_r1.ddconfig.resizable);
    ɵɵadvance();
    ɵɵproperty("ngIf", ctx_r1.ddconfig.showHeader !== false);
    ɵɵadvance();
    ɵɵproperty("ngClass", "p-dialog-content")("ngStyle", ctx_r1.ddconfig.contentStyle);
    ɵɵadvance(2);
    ɵɵproperty("ngIf", !ctx_r1.contentTemplate);
    ɵɵadvance();
    ɵɵproperty("ngComponentOutlet", ctx_r1.contentTemplate);
    ɵɵadvance();
    ɵɵproperty("ngIf", ctx_r1.ddconfig.footer || ctx_r1.footerTemplate);
  }
}
var DynamicDialogContent = class _DynamicDialogContent {
  viewContainerRef;
  constructor(viewContainerRef) {
    this.viewContainerRef = viewContainerRef;
  }
  static ɵfac = function DynamicDialogContent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _DynamicDialogContent)(ɵɵdirectiveInject(ViewContainerRef));
  };
  static ɵdir = ɵɵdefineDirective({
    type: _DynamicDialogContent,
    selectors: [["", "pDynamicDialogContent", ""]]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(DynamicDialogContent, [{
    type: Directive,
    args: [{
      selector: "[pDynamicDialogContent]",
      standalone: true
    }]
  }], () => [{
    type: ViewContainerRef
  }], null);
})();
var DynamicDialogStyle = class _DynamicDialogStyle extends DialogStyle {
  name = "dialog";
  static ɵfac = /* @__PURE__ */ (() => {
    let ɵDynamicDialogStyle_BaseFactory;
    return function DynamicDialogStyle_Factory(__ngFactoryType__) {
      return (ɵDynamicDialogStyle_BaseFactory || (ɵDynamicDialogStyle_BaseFactory = ɵɵgetInheritedFactory(_DynamicDialogStyle)))(__ngFactoryType__ || _DynamicDialogStyle);
    };
  })();
  static ɵprov = ɵɵdefineInjectable({
    token: _DynamicDialogStyle,
    factory: _DynamicDialogStyle.ɵfac
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(DynamicDialogStyle, [{
    type: Injectable
  }], null, null);
})();
var DynamicDialogClasses;
(function(DynamicDialogClasses2) {
  DynamicDialogClasses2["mask"] = "p-dialog-mask";
  DynamicDialogClasses2["root"] = "p-dialog";
  DynamicDialogClasses2["header"] = "p-dialog-header";
  DynamicDialogClasses2["title"] = "p-dialog-title";
  DynamicDialogClasses2["headerActions"] = "p-dialog-header-actions";
  DynamicDialogClasses2["pcMaximizeButton"] = "p-dialog-maximize-button";
  DynamicDialogClasses2["pcCloseButton"] = "p-dialog-close-button";
  DynamicDialogClasses2["content"] = "p-dialog-content";
  DynamicDialogClasses2["footer"] = "p-dialog-footer";
})(DynamicDialogClasses || (DynamicDialogClasses = {}));
var DynamicDialogConfig = class {
  /**
   * An object to pass to the component loaded inside the Dialog.
   * @group Props
   */
  data;
  /**
   * An object to pass to the component loaded inside the Dialog.
   * @group Props
   */
  inputValues;
  /**
   * Header text of the dialog.
   * @group Props
   */
  header;
  /**
   * Identifies the element (or elements) that labels the element it is applied to.
   * @group Props
   */
  ariaLabelledBy;
  /**
   * Footer text of the dialog.
   * @group Props
   */
  footer;
  /**
   * Width of the dialog.
   * @group Props
   */
  width;
  /**
   * Height of the dialog.
   * @group Props
   */
  height;
  /**
   * Specifies if pressing escape key should hide the dialog.
   * @group Props
   */
  closeOnEscape = false;
  /**
   * Specifies if autofocus should happen on show.
   * @group Props
   */
  focusOnShow = true;
  /**
   * When enabled, can only focus on elements inside the dialog.
   * @group Props
   */
  focusTrap = true;
  /**
   * Base zIndex value to use in layering.
   * @group Props
   */
  baseZIndex;
  /**
   * Whether to re-enforce layering through applying zIndex.
   * @group Props
   */
  autoZIndex = false;
  /**
   * Specifies if clicking the modal background should hide the dialog.
   * @group Props
   */
  dismissableMask = false;
  /**
   * Inline style of the component.
   * @group Props
   */
  rtl = false;
  /**
   * Inline style of the component.
   * @group Props
   */
  style;
  /**
   * Inline style of the content.
   * @group Props
   */
  contentStyle;
  /**
   * Style class of the component.
   * @group Props
   */
  styleClass;
  /**
   * Transition options of the animation.
   * @group Props
   */
  transitionOptions;
  /**
   * Adds a close icon to the header to hide the dialog.
   * @group Props
   */
  closable = false;
  /**
   * Whether to show the header or not.
   * @group Props
   */
  showHeader = false;
  /**
   * Defines if background should be blocked when dialog is displayed.
   * @group Props
   */
  modal = false;
  /**
   * Style class of the mask.
   * @group Props
   */
  maskStyleClass;
  /**
   * Enables resizing of the content.
   * @group Props
   */
  resizable = false;
  /**
   * Enables dragging to change the position using header.
   * @group Props
   */
  draggable = false;
  /**
   * Keeps dialog in the viewport.
   * @group Props
   */
  keepInViewport = false;
  /**
   * Minimum value for the left coordinate of dialog in dragging.
   * @group Props
   */
  minX;
  /**
   * Minimum value for the top coordinate of dialog in dragging.
   * @group Props
   */
  minY;
  /**
   * Whether the dialog can be displayed full screen.
   * @group Props
   */
  maximizable = false;
  /**
   * Name of the maximize icon.
   * @group Props
   */
  maximizeIcon;
  /**
   * Name of the minimize icon.
   * @group Props
   */
  minimizeIcon;
  /**
   * Position of the dialog, options are "center", "top", "bottom", "left", "right", "top-left", "top-right", "bottom-left" or "bottom-right".
   * @group Props
   */
  position;
  /**
   * Defines a string that labels the close button for accessibility.
   * @group Props
   */
  closeAriaLabel;
  /**
   * Target element to attach the overlay, valid values are "body" or a local ng-template variable of another element (note: use binding with brackets for template variables, e.g. [appendTo]="mydiv" for a div element having #mydiv as variable name).
   * @group Props
   */
  appendTo;
  /**
   * A boolean to determine if it can be duplicate.
   * @group Props
   */
  duplicate = false;
  /**
   * Object literal to define widths per screen size.
   * @group Props
   */
  breakpoints;
  /**
   * Dialog templates.
   * @group Props
   */
  templates;
};
var DynamicDialogRef = class {
  constructor() {
  }
  /**
   * Closes dialog.
   * @group Method
   */
  close(result) {
    this._onClose.next(result);
    setTimeout(() => {
      this._onClose.complete();
    }, 1e3);
  }
  /**
   * Destroys the dialog instance.
   * @group Method
   */
  destroy() {
    this._onDestroy.next(null);
  }
  /**
   * Callback to invoke on drag start.
   * @param {MouseEvent} event - Mouse event.
   * @group Method
   */
  dragStart(event) {
    this._onDragStart.next(event);
  }
  /**
   * Callback to invoke on drag end.
   * @param {MouseEvent} event - Mouse event.
   * @group Method
   */
  dragEnd(event) {
    this._onDragEnd.next(event);
  }
  /**
   * Callback to invoke on resize start.
   * @param {MouseEvent} event - Mouse event.
   * @group Method
   */
  resizeInit(event) {
    this._onResizeInit.next(event);
  }
  /**
   * Callback to invoke on resize start.
   * @param {MouseEvent} event - Mouse event.
   * @group Method
   */
  resizeEnd(event) {
    this._onResizeEnd.next(event);
  }
  /**
   * Callback to invoke on dialog is maximized.
   * @param {*} value - Size value.
   * @group Method
   */
  maximize(value) {
    this._onMaximize.next(value);
  }
  _onClose = new Subject();
  /**
   * Event triggered on dialog is closed.
   * @group Events
   */
  onClose = this._onClose.asObservable();
  _onDestroy = new Subject();
  /**
   * Event triggered on dialog instance is destroyed.
   * @group Events
   */
  onDestroy = this._onDestroy.asObservable();
  _onDragStart = new Subject();
  /**
   * Event triggered on drag start.
   * @param {MouseEvent} event - Mouse event.
   * @group Events
   */
  onDragStart = this._onDragStart.asObservable();
  _onDragEnd = new Subject();
  /**
   * Event triggered on drag end.
   * @param {MouseEvent} event - Mouse event.
   * @group Events
   */
  onDragEnd = this._onDragEnd.asObservable();
  _onResizeInit = new Subject();
  /**
   * Event triggered on resize start.
   * @param {MouseEvent} event - Mouse event.
   * @group Events
   */
  onResizeInit = this._onResizeInit.asObservable();
  _onResizeEnd = new Subject();
  /**
   * Event triggered on resize end.
   * @param {MouseEvent} event - Mouse event.
   * @group Events
   */
  onResizeEnd = this._onResizeEnd.asObservable();
  _onMaximize = new Subject();
  /**
   * Event triggered on dialog is maximized.
   * @param {*} value - Size value.
   * @group Events
   */
  onMaximize = this._onMaximize.asObservable();
  /**
   * Event triggered on child component load.
   * @param {*} value - Chi.
   * @group Events
   */
  onChildComponentLoaded = new Subject();
};
var showAnimation2 = animation([style({
  transform: "{{transform}}",
  opacity: 0
}), animate("{{transition}}", style({
  transform: "none",
  opacity: 1
}))]);
var hideAnimation2 = animation([animate("{{transition}}", style({
  transform: "{{transform}}",
  opacity: 0
}))]);
var DynamicDialogComponent = class _DynamicDialogComponent extends BaseComponent {
  renderer;
  ddconfig;
  dialogRef;
  zone;
  parentDialog;
  visible = true;
  componentRef;
  mask;
  resizing;
  dragging;
  maximized;
  _style = {};
  originalStyle;
  lastPageX;
  lastPageY;
  ariaLabelledBy;
  id = uuid("pn_id_");
  styleElement;
  insertionPoint;
  maskViewChild;
  contentViewChild;
  footerViewChild;
  headerViewChild;
  childComponentType;
  inputValues;
  container;
  wrapper;
  documentKeydownListener;
  documentEscapeListener;
  maskClickListener;
  transformOptions = "scale(0.7)";
  documentResizeListener;
  documentResizeEndListener;
  documentDragListener;
  documentDragEndListener;
  _componentStyle = inject(DynamicDialogStyle);
  get minX() {
    return this.ddconfig.minX ? this.ddconfig.minX : 0;
  }
  get minY() {
    return this.ddconfig.minY ? this.ddconfig.minY : 0;
  }
  get keepInViewport() {
    return this.ddconfig.keepInViewport;
  }
  get maximizable() {
    return this.ddconfig.maximizable;
  }
  get maximizeIcon() {
    return this.ddconfig.maximizeIcon;
  }
  get minimizeIcon() {
    return this.ddconfig.minimizeIcon;
  }
  get closable() {
    return this.ddconfig.closable;
  }
  get style() {
    return this._style;
  }
  get position() {
    return this.ddconfig.position;
  }
  get defaultCloseAriaLabel() {
    return this.config.getTranslation(TranslationKeys.ARIA)["close"];
  }
  set style(value) {
    if (value) {
      this._style = __spreadValues({}, value);
      this.originalStyle = value;
    }
  }
  get parent() {
    const domElements = Array.from(this.document.getElementsByClassName("p-dialog"));
    if (domElements.length > 1) {
      return domElements.pop();
    }
  }
  get parentContent() {
    const domElements = Array.from(this.document.getElementsByClassName("p-dialog"));
    if (domElements.length > 0) {
      const contentElements = domElements[domElements.length - 1].querySelector(".p-dialog-content");
      if (contentElements) return Array.isArray(contentElements) ? contentElements[0] : contentElements;
    }
  }
  get header() {
    return this.ddconfig.header;
  }
  get data() {
    return this.ddconfig.data;
  }
  get breakpoints() {
    return this.ddconfig.breakpoints;
  }
  get footerTemplate() {
    return this.ddconfig?.templates?.footer;
  }
  get headerTemplate() {
    return this.ddconfig?.templates?.header;
  }
  get contentTemplate() {
    return this.ddconfig?.templates?.content;
  }
  get minimizeIconTemplate() {
    return this.ddconfig?.templates?.minimizeicon;
  }
  get maximizeIconTemplate() {
    return this.ddconfig?.templates?.maximizeicon;
  }
  get closeIconTemplate() {
    return this.ddconfig?.templates?.closeicon;
  }
  get maskClass() {
    const positions = ["left", "right", "top", "topleft", "topright", "bottom", "bottomleft", "bottomright"];
    const pos = positions.find((item) => item === this.position);
    return {
      "p-dialog-mask": true,
      "p-overlay-mask p-overlay-mask-enter": this.ddconfig.modal || this.ddconfig.dismissableMask,
      [`p-dialog-${pos}`]: pos
    };
  }
  get dialogId() {
    return this.attrSelector;
  }
  zIndexForLayering;
  constructor(renderer, ddconfig, dialogRef, zone, parentDialog) {
    super();
    this.renderer = renderer;
    this.ddconfig = ddconfig;
    this.dialogRef = dialogRef;
    this.zone = zone;
    this.parentDialog = parentDialog;
  }
  ngOnInit() {
    super.ngOnInit();
    if (this.breakpoints) {
      this.createStyle();
    }
  }
  createStyle() {
    if (isPlatformBrowser(this.platformId)) {
      if (!this.styleElement) {
        this.styleElement = this.renderer.createElement("style");
        this.styleElement.type = "text/css";
        this.renderer.appendChild(this.document.head, this.styleElement);
        let innerHTML = "";
        for (let breakpoint in this.breakpoints) {
          innerHTML += `
                        @media screen and (max-width: ${breakpoint}) {
                            .p-dialog[id=${this.dialogId}]:not(.p-dialog-maximized) {
                                width: ${this.breakpoints[breakpoint]} !important;
                            }
                        }
                    `;
        }
        this.renderer.setProperty(this.styleElement, "innerHTML", innerHTML);
        setAttribute(this.styleElement, "nonce", this.config?.csp()?.nonce);
      }
    }
  }
  destroyStyle() {
    if (this.styleElement) {
      this.renderer.removeChild(this.document.head, this.styleElement);
      this.styleElement = null;
    }
  }
  ngAfterViewInit() {
    super.ngAfterViewInit();
    this.loadChildComponent(this.childComponentType);
    this.ariaLabelledBy = this.getAriaLabelledBy();
    this.cd.detectChanges();
  }
  getAriaLabelledBy() {
    const {
      header,
      showHeader
    } = this.ddconfig;
    if (header === null || showHeader === false) {
      return null;
    }
    return uuid("pn_id_") + "_header";
  }
  loadChildComponent(componentType) {
    let viewContainerRef = this.insertionPoint?.viewContainerRef;
    viewContainerRef?.clear();
    this.componentRef = viewContainerRef?.createComponent(componentType);
    if (this.inputValues) {
      Object.entries(this.inputValues).forEach(([key, value]) => {
        this.componentRef.setInput(key, value);
      });
    }
    this.dialogRef.onChildComponentLoaded.next(this.componentRef.instance);
  }
  moveOnTop() {
    if (this.ddconfig.autoZIndex !== false) {
      zindexutils.set("modal", this.container, (this.ddconfig.baseZIndex || 0) + this.config.zIndex.modal);
      this.wrapper.style.zIndex = String(parseInt(this.container.style.zIndex, 10) - 1);
    } else {
      this.zIndexForLayering = zindexutils.generateZIndex("modal", (this.ddconfig.baseZIndex || 0) + this.config.zIndex.modal);
    }
  }
  onAnimationStart(event) {
    switch (event.toState) {
      case "visible":
        this.container = event.element;
        this.wrapper = this.container.parentElement;
        this.moveOnTop();
        if (this.parent) {
          this.unbindGlobalListeners();
        }
        this.bindGlobalListeners();
        this.container?.setAttribute(this.id, "");
        if (this.ddconfig.modal !== false) {
          this.enableModality();
        }
        if (this.ddconfig.focusOnShow !== false) {
          this.focus();
        }
        break;
      case "void":
        if (this.wrapper && this.ddconfig.modal !== false) {
          addClass(this.wrapper, "p-overlay-mask-leave");
        }
        break;
    }
  }
  onAnimationEnd(event) {
    if (event.toState === "void") {
      if (this.parentContent) {
        this.focus(this.parentContent);
      }
      this.onContainerDestroy();
      this.dialogRef.destroy();
    }
  }
  onContainerDestroy() {
    this.unbindGlobalListeners();
    if (this.container && this.ddconfig.autoZIndex !== false) {
      zindexutils.clear(this.container);
    }
    if (this.zIndexForLayering) {
      zindexutils.revertZIndex(this.zIndexForLayering);
    }
    if (this.ddconfig.modal !== false) {
      this.disableModality();
    }
    this.container = null;
  }
  close() {
    this.visible = false;
    this.cd.markForCheck();
  }
  hide() {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }
  enableModality() {
    if (this.ddconfig.dismissableMask) {
      this.maskClickListener = this.renderer.listen(this.wrapper, "mousedown", (event) => {
        if (this.wrapper && this.wrapper.isSameNode(event.target)) {
          this.hide();
        }
      });
    }
    if (this.ddconfig.modal !== false) {
      addClass(this.document.body, "p-overflow-hidden");
    }
  }
  disableModality() {
    if (this.wrapper) {
      if (this.ddconfig.dismissableMask) {
        this.unbindMaskClickListener();
      }
      if (this.ddconfig.modal !== false) {
        removeClass(this.document.body, "p-overflow-hidden");
      }
      if (!this.cd.destroyed) {
        this.cd.detectChanges();
      }
    }
  }
  focus(focusParentElement = this.contentViewChild.nativeElement) {
    let focusable = DomHandler.getFocusableElement(focusParentElement, "[autofocus]");
    if (focusable) {
      this.zone.runOutsideAngular(() => {
        setTimeout(() => focusable.focus(), 5);
      });
      return;
    }
    const focusableElement = DomHandler.getFocusableElement(focusParentElement);
    if (focusableElement) {
      this.zone.runOutsideAngular(() => {
        setTimeout(() => focusableElement.focus(), 5);
      });
    } else if (this.footerViewChild) {
      this.focus(this.footerViewChild.nativeElement);
    } else if (!focusableElement && this.headerViewChild) {
      this.focus(this.headerViewChild.nativeElement);
    }
  }
  maximize() {
    this.maximized = !this.maximized;
    if (this.maximized) {
      addClass(this.document.body, "p-overflow-hidden");
    } else {
      removeClass(this.document.body, "p-overflow-hidden");
    }
    this.dialogRef.maximize({
      maximized: this.maximized
    });
  }
  initResize(event) {
    if (this.ddconfig.resizable) {
      if (!this.documentResizeListener) {
        this.bindDocumentResizeListeners();
      }
      this.resizing = true;
      this.lastPageX = event.pageX;
      this.lastPageY = event.pageY;
      addClass(this.document.body, "p-unselectable-text");
      this.dialogRef.resizeInit(event);
    }
  }
  onResize(event) {
    if (this.resizing) {
      let deltaX = event.pageX - this.lastPageX;
      let deltaY = event.pageY - this.lastPageY;
      let containerWidth = getOuterWidth(this.container);
      let containerHeight = getOuterHeight(this.container);
      let contentHeight = getOuterHeight(this.contentViewChild.nativeElement);
      let newWidth = containerWidth + deltaX;
      let newHeight = containerHeight + deltaY;
      let minWidth = this.container.style.minWidth;
      let minHeight = this.container.style.minHeight;
      let offset = this.container.getBoundingClientRect();
      let viewport = getViewport();
      let hasBeenDragged = !parseInt(this.container.style.top) || !parseInt(this.container.style.left);
      if (hasBeenDragged) {
        newWidth += deltaX;
        newHeight += deltaY;
      }
      if ((!minWidth || newWidth > parseInt(minWidth)) && offset.left + newWidth < viewport.width) {
        this._style.width = newWidth + "px";
        this.container.style.width = this._style.width;
      }
      if ((!minHeight || newHeight > parseInt(minHeight)) && offset.top + newHeight < viewport.height) {
        this.contentViewChild.nativeElement.style.height = contentHeight + newHeight - containerHeight + "px";
        if (this._style.height) {
          this._style.height = newHeight + "px";
          this.container.style.height = this._style.height;
        }
      }
      this.lastPageX = event.pageX;
      this.lastPageY = event.pageY;
    }
  }
  resizeEnd(event) {
    if (this.resizing) {
      this.resizing = false;
      removeClass(this.document.body, "p-unselectable-text");
      this.dialogRef.resizeEnd(event);
    }
  }
  initDrag(event) {
    if (hasClass(event.target, "p-dialog-header-icon") || hasClass(event.target.parentElement, "p-dialog-header-icon")) {
      return;
    }
    if (this.ddconfig.draggable) {
      this.dragging = true;
      this.lastPageX = event.pageX;
      this.lastPageY = event.pageY;
      this.container.style.margin = "0";
      addClass(this.document.body, "p-unselectable-text");
      this.dialogRef.dragStart(event);
    }
  }
  onDrag(event) {
    if (this.dragging) {
      let containerWidth = getOuterWidth(this.container);
      let containerHeight = getOuterHeight(this.container);
      let deltaX = event.pageX - this.lastPageX;
      let deltaY = event.pageY - this.lastPageY;
      let offset = this.container.getBoundingClientRect();
      let leftPos = offset.left + deltaX;
      let topPos = offset.top + deltaY;
      let viewport = getViewport();
      this.container.style.position = "fixed";
      if (this.keepInViewport) {
        if (leftPos >= this.minX && leftPos + containerWidth < viewport.width) {
          this._style.left = leftPos + "px";
          this.lastPageX = event.pageX;
          this.container.style.left = leftPos + "px";
        }
        if (topPos >= this.minY && topPos + containerHeight < viewport.height) {
          this._style.top = topPos + "px";
          this.lastPageY = event.pageY;
          this.container.style.top = topPos + "px";
        }
      } else {
        this.lastPageX = event.pageX;
        this.container.style.left = leftPos + "px";
        this.lastPageY = event.pageY;
        this.container.style.top = topPos + "px";
      }
    }
  }
  endDrag(event) {
    if (this.dragging) {
      this.dragging = false;
      removeClass(this.document.body, "p-unselectable-text");
      this.dialogRef.dragEnd(event);
      this.cd.detectChanges();
    }
  }
  resetPosition() {
    this.container.style.position = "";
    this.container.style.left = "";
    this.container.style.top = "";
    this.container.style.margin = "";
  }
  bindDocumentDragListener() {
    if (isPlatformBrowser(this.platformId)) {
      this.zone.runOutsideAngular(() => {
        this.documentDragListener = this.renderer.listen(this.document, "mousemove", this.onDrag.bind(this));
      });
    }
  }
  bindDocumentDragEndListener() {
    if (isPlatformBrowser(this.platformId)) {
      this.zone.runOutsideAngular(() => {
        this.documentDragEndListener = this.renderer.listen(this.document, "mouseup", this.endDrag.bind(this));
      });
    }
  }
  unbindDocumentDragEndListener() {
    if (this.documentDragEndListener) {
      this.documentDragEndListener();
      this.documentDragListener = null;
    }
  }
  unbindDocumentDragListener() {
    if (this.documentDragListener) {
      this.documentDragListener();
      this.documentDragListener = null;
    }
  }
  bindDocumentResizeListeners() {
    if (isPlatformBrowser(this.platformId)) {
      this.zone.runOutsideAngular(() => {
        this.documentResizeListener = this.renderer.listen(this.document, "mousemove", this.onResize.bind(this));
        this.documentResizeEndListener = this.renderer.listen(this.document, "mouseup", this.resizeEnd.bind(this));
      });
    }
  }
  unbindDocumentResizeListeners() {
    if (this.documentResizeListener && this.documentResizeEndListener) {
      this.documentResizeListener();
      this.documentResizeEndListener();
      this.documentResizeListener = null;
      this.documentResizeEndListener = null;
    }
  }
  bindGlobalListeners() {
    if (this.ddconfig.closeOnEscape !== false) {
      this.bindDocumentEscapeListener();
    }
    if (this.ddconfig.resizable) {
      this.bindDocumentResizeListeners();
    }
    if (this.ddconfig.draggable) {
      this.bindDocumentDragListener();
      this.bindDocumentDragEndListener();
    }
  }
  unbindGlobalListeners() {
    this.unbindDocumentEscapeListener();
    this.unbindDocumentResizeListeners();
    this.unbindDocumentDragListener();
    this.unbindDocumentDragEndListener();
  }
  bindDocumentEscapeListener() {
    const documentTarget = this.maskViewChild ? this.maskViewChild.nativeElement.ownerDocument : "document";
    this.documentEscapeListener = this.renderer.listen(documentTarget, "keydown", (event) => {
      if (event.which == 27) {
        const currentZIndex = zindexutils.getCurrent();
        if (parseInt(this.container.style.zIndex) == currentZIndex || this.zIndexForLayering == currentZIndex) {
          this.hide();
        }
      }
    });
  }
  unbindDocumentEscapeListener() {
    if (this.documentEscapeListener) {
      this.documentEscapeListener();
      this.documentEscapeListener = null;
    }
  }
  unbindMaskClickListener() {
    if (this.maskClickListener) {
      this.maskClickListener();
      this.maskClickListener = null;
    }
  }
  ngOnDestroy() {
    this.onContainerDestroy();
    if (this.componentRef) {
      this.componentRef.destroy();
    }
    this.destroyStyle();
    super.ngOnDestroy();
  }
  static ɵfac = function DynamicDialogComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _DynamicDialogComponent)(ɵɵdirectiveInject(Renderer2), ɵɵdirectiveInject(DynamicDialogConfig), ɵɵdirectiveInject(DynamicDialogRef), ɵɵdirectiveInject(NgZone), ɵɵdirectiveInject(_DynamicDialogComponent, 12));
  };
  static ɵcmp = ɵɵdefineComponent({
    type: _DynamicDialogComponent,
    selectors: [["p-dynamicDialog"], ["p-dynamicdialog"], ["p-dynamic-dialog"]],
    viewQuery: function DynamicDialogComponent_Query(rf, ctx) {
      if (rf & 1) {
        ɵɵviewQuery(DynamicDialogContent, 5)(_c02, 5)(_c15, 5)(_c22, 5)(_c32, 5);
      }
      if (rf & 2) {
        let _t;
        ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.insertionPoint = _t.first);
        ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.maskViewChild = _t.first);
        ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.contentViewChild = _t.first);
        ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.footerViewChild = _t.first);
        ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.headerViewChild = _t.first);
      }
    },
    features: [ɵɵProvidersFeature([DynamicDialogStyle]), ɵɵInheritDefinitionFeature],
    decls: 3,
    vars: 9,
    consts: [["mask", ""], ["container", ""], ["content", ""], ["titlebar", ""], ["footer", ""], [3, "ngStyle", "ngClass"], ["role", "dialog", "pFocusTrap", "", 3, "ngClass", "ngStyle", "style", "class", "pFocusTrapDisabled", "width", "height", 4, "ngIf"], ["role", "dialog", "pFocusTrap", "", 3, "ngClass", "ngStyle", "pFocusTrapDisabled"], ["style", "z-index: 90;", 3, "ngClass", "mousedown", 4, "ngIf"], [3, "ngClass", "mousedown", 4, "ngIf"], [3, "ngClass", "ngStyle"], [4, "ngIf"], [4, "ngComponentOutlet"], [3, "ngClass", 4, "ngIf"], [2, "z-index", "90", 3, "mousedown", "ngClass"], [3, "mousedown", "ngClass"], [3, "ngClass", "id"], [3, "ngClass"], ["rounded", "", "text", "", 3, "styleClass", "tabindex", "onClick", "keydown.enter", 4, "ngIf"], ["rounded", "", "text", "", "severity", "secondary", 3, "styleClass", "ariaLabel", "onClick", "keydown.enter", 4, "ngIf"], ["rounded", "", "text", "", 3, "onClick", "keydown.enter", "styleClass", "tabindex"], [4, "ngTemplateOutlet"], ["rounded", "", "text", "", "severity", "secondary", 3, "onClick", "keydown.enter", "styleClass", "ariaLabel"], ["pDynamicDialogContent", ""]],
    template: function DynamicDialogComponent_Template(rf, ctx) {
      if (rf & 1) {
        ɵɵelementStart(0, "div", 5, 0);
        ɵɵtemplate(2, DynamicDialogComponent_div_2_Template, 9, 30, "div", 6);
        ɵɵelementEnd();
      }
      if (rf & 2) {
        ɵɵclassMap(ctx.ddconfig.maskStyleClass);
        ɵɵproperty("ngStyle", ɵɵpureFunction3(5, _c42, ctx.position === "left" || ctx.position === "topleft" || ctx.position === "bottomleft" ? "flex-start" : ctx.position === "right" || ctx.position === "topright" || ctx.position === "bottomright" ? "flex-end" : "center", ctx.position === "top" || ctx.position === "topleft" || ctx.position === "topright" ? "flex-start" : ctx.position === "bottom" || ctx.position === "bottomleft" || ctx.position === "bottomright" ? "flex-end" : "center", ctx.ddconfig.modal ? "auto" : "none"))("ngClass", ctx.maskClass);
        ɵɵadvance(2);
        ɵɵproperty("ngIf", ctx.visible);
      }
    },
    dependencies: [CommonModule, NgClass, NgComponentOutlet, NgIf, NgTemplateOutlet, NgStyle, SharedModule, DynamicDialogContent, WindowMaximizeIcon, WindowMinimizeIcon, TimesIcon, Button, FocusTrap],
    encapsulation: 2,
    data: {
      animation: [trigger("animation", [transition("void => visible", [useAnimation(showAnimation2)]), transition("visible => void", [useAnimation(hideAnimation2)])])]
    }
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(DynamicDialogComponent, [{
    type: Component,
    args: [{
      selector: "p-dynamicDialog, p-dynamicdialog, p-dynamic-dialog",
      standalone: true,
      imports: [CommonModule, SharedModule, DynamicDialogContent, WindowMaximizeIcon, WindowMinimizeIcon, TimesIcon, Button, FocusTrap],
      template: `
        <div
            #mask
            [ngStyle]="{
                position: 'fixed',
                height: '100%',
                width: '100%',
                left: 0,
                top: 0,
                display: 'flex',
                'justify-content': position === 'left' || position === 'topleft' || position === 'bottomleft' ? 'flex-start' : position === 'right' || position === 'topright' || position === 'bottomright' ? 'flex-end' : 'center',
                'align-items': position === 'top' || position === 'topleft' || position === 'topright' ? 'flex-start' : position === 'bottom' || position === 'bottomleft' || position === 'bottomright' ? 'flex-end' : 'center',
                'pointer-events': ddconfig.modal ? 'auto' : 'none'
            }"
            [class]="ddconfig.maskStyleClass"
            [ngClass]="maskClass"
        >
            <div
                *ngIf="visible"
                #container
                [ngClass]="{ 'p-dialog p-component': true, 'p-dialog-maximized': maximizable && maximized }"
                [ngStyle]="{ display: 'flex', 'flex-direction': 'column', 'pointer-events': 'auto' }"
                [style]="ddconfig.style"
                [class]="ddconfig.styleClass"
                [@animation]="{
                    value: 'visible',
                    params: {
                        transform: transformOptions,
                        transition: ddconfig.transitionOptions || '150ms cubic-bezier(0, 0, 0.2, 1)'
                    }
                }"
                (@animation.start)="onAnimationStart($event)"
                (@animation.done)="onAnimationEnd($event)"
                role="dialog"
                pFocusTrap
                [pFocusTrapDisabled]="ddconfig.focusTrap === false"
                [style.width]="ddconfig.width"
                [style.height]="ddconfig.height"
                [attr.aria-labelledby]="ariaLabelledBy"
                [attr.aria-modal]="true"
                [attr.id]="dialogId"
            >
                <div *ngIf="ddconfig.resizable" [ngClass]="'p-resizable-handle'" style="z-index: 90;" (mousedown)="initResize($event)"></div>
                <div #titlebar [ngClass]="'p-dialog-header'" (mousedown)="initDrag($event)" *ngIf="ddconfig.showHeader !== false">
                    <ng-container *ngComponentOutlet="headerTemplate"></ng-container>
                    <ng-container *ngIf="!headerTemplate">
                        <span [ngClass]="'p-dialog-title'" [id]="ariaLabelledBy">{{ ddconfig.header }}</span>
                        <div [ngClass]="'p-dialog-header-actions'">
                            <p-button *ngIf="ddconfig.maximizable" [styleClass]="'p-dialog-maximize-button'" (onClick)="maximize()" (keydown.enter)="maximize()" rounded text [tabindex]="maximizable ? '0' : '-1'">
                                <ng-container *ngIf="!maximizeIcon">
                                    <WindowMaximizeIcon *ngIf="!maximized && !maximizeIconTemplate" />
                                    <WindowMinimizeIcon *ngIf="maximized && !minimizeIconTemplate" />
                                </ng-container>
                                <ng-container *ngIf="!maximized">
                                    <ng-template *ngTemplateOutlet="maximizeIconTemplate"></ng-template>
                                </ng-container>
                                <ng-container *ngIf="maximized">
                                    <ng-template *ngTemplateOutlet="minimizeIconTemplate"></ng-template>
                                </ng-container>
                            </p-button>
                            <p-button *ngIf="closable" [styleClass]="'p-dialog-close-button'" [ariaLabel]="ddconfig.closeAriaLabel || defaultCloseAriaLabel" (onClick)="hide()" (keydown.enter)="hide()" rounded text severity="secondary">
                                <ng-container *ngIf="!closeIconTemplate">
                                    <TimesIcon />
                                </ng-container>
                                <span *ngIf="closeIconTemplate">
                                    <ng-template *ngTemplateOutlet="closeIconTemplate"></ng-template>
                                </span>
                            </p-button>
                        </div>
                    </ng-container>
                </div>
                <div #content [ngClass]="'p-dialog-content'" [ngStyle]="ddconfig.contentStyle">
                    <ng-template pDynamicDialogContent *ngIf="!contentTemplate"></ng-template>
                    <ng-container *ngComponentOutlet="contentTemplate"></ng-container>
                </div>
                <div #footer [ngClass]="'p-dialog-footer'" *ngIf="ddconfig.footer || footerTemplate">
                    <ng-container *ngIf="!footerTemplate">
                        {{ ddconfig.footer }}
                    </ng-container>
                    <ng-container *ngComponentOutlet="footerTemplate"></ng-container>
                </div>
            </div>
        </div>
    `,
      animations: [trigger("animation", [transition("void => visible", [useAnimation(showAnimation2)]), transition("visible => void", [useAnimation(hideAnimation2)])])],
      changeDetection: ChangeDetectionStrategy.Default,
      encapsulation: ViewEncapsulation.None,
      providers: [DynamicDialogStyle]
    }]
  }], () => [{
    type: Renderer2
  }, {
    type: DynamicDialogConfig
  }, {
    type: DynamicDialogRef
  }, {
    type: NgZone
  }, {
    type: DynamicDialogComponent,
    decorators: [{
      type: SkipSelf
    }, {
      type: Optional
    }]
  }], {
    insertionPoint: [{
      type: ViewChild,
      args: [DynamicDialogContent]
    }],
    maskViewChild: [{
      type: ViewChild,
      args: ["mask"]
    }],
    contentViewChild: [{
      type: ViewChild,
      args: ["content"]
    }],
    footerViewChild: [{
      type: ViewChild,
      args: ["footer"]
    }],
    headerViewChild: [{
      type: ViewChild,
      args: ["titlebar"]
    }]
  });
})();
var DynamicDialogModule = class _DynamicDialogModule {
  static ɵfac = function DynamicDialogModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _DynamicDialogModule)();
  };
  static ɵmod = ɵɵdefineNgModule({
    type: _DynamicDialogModule,
    imports: [DynamicDialogComponent, SharedModule],
    exports: [DynamicDialogComponent, SharedModule]
  });
  static ɵinj = ɵɵdefineInjector({
    imports: [DynamicDialogComponent, SharedModule, SharedModule]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(DynamicDialogModule, [{
    type: NgModule,
    args: [{
      imports: [DynamicDialogComponent, SharedModule],
      exports: [DynamicDialogComponent, SharedModule]
    }]
  }], null, null);
})();
var DynamicDialogInjector = class {
  _parentInjector;
  _additionalTokens;
  constructor(_parentInjector, _additionalTokens) {
    this._parentInjector = _parentInjector;
    this._additionalTokens = _additionalTokens;
  }
  get(token, notFoundValue, options) {
    const value = this._additionalTokens.get(token);
    if (value) return value;
    return this._parentInjector.get(token, notFoundValue);
  }
};
var DialogService = class _DialogService {
  appRef;
  injector;
  document;
  dialogComponentRefMap = /* @__PURE__ */ new Map();
  constructor(appRef, injector, document2) {
    this.appRef = appRef;
    this.injector = injector;
    this.document = document2;
  }
  /**
   * Displays the dialog using the dynamic dialog object options.
   * @param {*} componentType - Dynamic component for content template.
   * @param {DynamicDialogConfig} config - DynamicDialog object.
   * @returns {DynamicDialogRef} DynamicDialog instance.
   * @group Method
   */
  open(componentType, config) {
    if (!this.duplicationPermission(componentType, config)) {
      return null;
    }
    const dialogRef = this.appendDialogComponentToBody(config, componentType);
    this.dialogComponentRefMap.get(dialogRef).instance.childComponentType = componentType;
    this.dialogComponentRefMap.get(dialogRef).instance.inputValues = config.inputValues;
    return dialogRef;
  }
  /**
   * Returns the dynamic dialog component instance.
   * @param {ref} DynamicDialogRef - DynamicDialog instance.
   * @group Method
   */
  getInstance(ref) {
    return this.dialogComponentRefMap.get(ref).instance;
  }
  appendDialogComponentToBody(config, componentType) {
    const map = /* @__PURE__ */ new WeakMap();
    map.set(DynamicDialogConfig, config);
    const dialogRef = new DynamicDialogRef();
    map.set(DynamicDialogRef, dialogRef);
    const sub = dialogRef.onClose.subscribe(() => {
      this.dialogComponentRefMap.get(dialogRef).instance.close();
    });
    const destroySub = dialogRef.onDestroy.subscribe(() => {
      this.removeDialogComponentFromBody(dialogRef);
      destroySub.unsubscribe();
      sub.unsubscribe();
    });
    const componentRef = createComponent(DynamicDialogComponent, {
      environmentInjector: this.appRef.injector,
      elementInjector: new DynamicDialogInjector(this.injector, map)
    });
    this.appRef.attachView(componentRef.hostView);
    const domElem = componentRef.hostView.rootNodes[0];
    if (!config.appendTo || config.appendTo === "body") {
      this.document.body.appendChild(domElem);
    } else {
      appendChild(config.appendTo, domElem);
    }
    this.dialogComponentRefMap.set(dialogRef, componentRef);
    return dialogRef;
  }
  removeDialogComponentFromBody(dialogRef) {
    if (!dialogRef || !this.dialogComponentRefMap.has(dialogRef)) {
      return;
    }
    const dialogComponentRef = this.dialogComponentRefMap.get(dialogRef);
    this.appRef.detachView(dialogComponentRef.hostView);
    dialogComponentRef.destroy();
    dialogComponentRef.changeDetectorRef.detectChanges();
    this.dialogComponentRefMap.delete(dialogRef);
  }
  duplicationPermission(componentType, config) {
    if (config.duplicate) {
      return true;
    }
    let permission = true;
    for (const [key, value] of this.dialogComponentRefMap) {
      if (value.instance.childComponentType === componentType) {
        permission = false;
        break;
      }
    }
    return permission;
  }
  static ɵfac = function DialogService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _DialogService)(ɵɵinject(ApplicationRef), ɵɵinject(Injector), ɵɵinject(DOCUMENT));
  };
  static ɵprov = ɵɵdefineInjectable({
    token: _DialogService,
    factory: _DialogService.ɵfac
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(DialogService, [{
    type: Injectable
  }], () => [{
    type: ApplicationRef
  }, {
    type: Injector
  }, {
    type: Document,
    decorators: [{
      type: Inject,
      args: [DOCUMENT]
    }]
  }], null);
})();
export {
  DialogService,
  DynamicDialogClasses,
  DynamicDialogComponent,
  DynamicDialogConfig,
  DynamicDialogInjector,
  DynamicDialogModule,
  DynamicDialogRef,
  DynamicDialogStyle
};
//# sourceMappingURL=primeng_dynamicdialog.js.map
