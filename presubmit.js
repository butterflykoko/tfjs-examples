"use strict";
/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path_1 = require("path");
const shell = __importStar(require("shelljs"));
// Exit if any commands error.
shell.set('-e');
process.on('unhandledRejection', e => {
    throw e;
});
const dir = '.';
const dirs = fs.readdirSync(dir)
    .filter(f => fs.statSync((0, path_1.join)(dir, f)).isDirectory())
    .filter(f => !f.startsWith('.') && f !== 'node_modules');
dirs.forEach(dir => {
    shell.cd(dir);
    if (!fs.existsSync('./package.json')) {
        shell.cd('../');
        return;
    }
    const packageJSON = JSON.parse(fs.readFileSync('./package.json', { encoding: 'utf-8' }));
    if (packageJSON['scripts']['test'] != null) {
        console.log(`~~~~~~~~~~~~ Testing ${dir} ~~~~~~~~~~~~`);
        shell.exec('yarn');
        shell.exec('yarn test');
        console.log('\n');
    }
    if (packageJSON['scripts']['lint'] != null) {
        console.log(`~~~~~~~~~~~~ Linting ${dir} ~~~~~~~~~~~~`);
        shell.exec('yarn');
        shell.exec('yarn lint');
        console.log('\n');
    }
    shell.cd('../');
});
