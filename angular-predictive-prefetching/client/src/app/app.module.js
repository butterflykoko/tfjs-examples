"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const platform_browser_1 = require("@angular/platform-browser");
const core_1 = require("@angular/core");
const app_component_1 = require("./app.component");
const animations_1 = require("@angular/platform-browser/animations");
const navigation_component_1 = require("./navigation/navigation.component");
const layout_1 = require("@angular/cdk/layout");
const toolbar_1 = require("@angular/material/toolbar");
const sidenav_1 = require("@angular/material/sidenav");
const icon_1 = require("@angular/material/icon");
const mdc_button_1 = require("@angular/material-experimental/mdc-button");
const mdc_list_1 = require("@angular/material-experimental/mdc-list");
const mdc_card_1 = require("@angular/material-experimental/mdc-card");
const logo_component_1 = require("./navigation/logo/logo.component");
const expansion_1 = require("@angular/material/expansion");
const merch_display_component_1 = require("./merch-display/merch-display.component");
const merch_card_component_1 = require("./merch-display/merch-card/merch-card.component");
const router_1 = require("@angular/router");
const app_routing_module_1 = require("./app-routing.module");
let AppModule = (() => {
    let _classDecorators = [(0, core_1.NgModule)({
            declarations: [
                app_component_1.AppComponent,
                navigation_component_1.NavigationComponent,
                logo_component_1.LogoComponent,
                merch_display_component_1.MerchDisplayComponent,
                merch_card_component_1.MerchCardComponent,
            ],
            imports: [
                platform_browser_1.BrowserModule,
                animations_1.BrowserAnimationsModule,
                layout_1.LayoutModule,
                expansion_1.MatExpansionModule,
                toolbar_1.MatToolbarModule,
                mdc_card_1.MatCardModule,
                mdc_button_1.MatButtonModule,
                sidenav_1.MatSidenavModule,
                icon_1.MatIconModule,
                mdc_list_1.MatListModule,
                router_1.RouterModule.forRoot(app_routing_module_1.routes),
            ],
            bootstrap: [app_component_1.AppComponent],
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AppModule = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AppModule = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
    };
    return AppModule = _classThis;
})();
exports.AppModule = AppModule;
