"use strict";
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
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const tf = __importStar(require("@tensorflow/tfjs"));
const tfjs_react_native_1 = require("@tensorflow/tfjs-react-native");
const mobilenet = __importStar(require("@tensorflow-models/mobilenet"));
const App = () => {
    const [isTfReady, setIsTfReady] = (0, react_1.useState)(false);
    const [result, setResult] = (0, react_1.useState)('');
    const image = (0, react_1.useRef)(null);
    const load = async () => {
        try {
            // Load mobilenet.
            await tf.ready();
            const model = await mobilenet.load();
            setIsTfReady(true);
            // Start inference and show result.
            const image = require('./basketball.jpg');
            const imageAssetPath = react_native_1.Image.resolveAssetSource(image);
            const response = await (0, tfjs_react_native_1.fetch)(imageAssetPath.uri, {}, { isBinary: true });
            const imageDataArrayBuffer = await response.arrayBuffer();
            const imageData = new Uint8Array(imageDataArrayBuffer);
            const imageTensor = (0, tfjs_react_native_1.decodeJpeg)(imageData);
            const prediction = await model.classify(imageTensor);
            if (prediction && prediction.length > 0) {
                setResult(`${prediction[0].className} (${prediction[0].probability.toFixed(3)})`);
            }
        }
        catch (err) {
            console.log(err);
        }
    };
    (0, react_1.useEffect)(() => {
        load();
    }, []);
    return (<react_native_1.View style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
      <react_native_1.Image ref={image} source={require('./basketball.jpg')} style={{ width: 200, height: 200 }}/>
      {!isTfReady && <react_native_1.Text>Loading TFJS model...</react_native_1.Text>}
      {isTfReady && result === '' && <react_native_1.Text>Classifying...</react_native_1.Text>}
      {result !== '' && <react_native_1.Text>{result}</react_native_1.Text>}
    </react_native_1.View>);
};
exports.default = App;
