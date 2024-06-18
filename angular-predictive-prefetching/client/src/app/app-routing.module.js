"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routes = void 0;
const merch_display_component_1 = require("./merch-display/merch-display.component");
exports.routes = [
    { path: '', component: merch_display_component_1.MerchDisplayComponent },
    { path: ':category', component: merch_display_component_1.MerchDisplayComponent },
];
