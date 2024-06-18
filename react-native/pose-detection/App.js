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
const expo_camera_1 = require("expo-camera");
const tf = __importStar(require("@tensorflow/tfjs"));
const posedetection = __importStar(require("@tensorflow-models/pose-detection"));
const ScreenOrientation = __importStar(require("expo-screen-orientation"));
const tfjs_react_native_1 = require("@tensorflow/tfjs-react-native");
const react_native_svg_1 = __importStar(require("react-native-svg"));
// tslint:disable-next-line: variable-name
const TensorCamera = (0, tfjs_react_native_1.cameraWithTensors)(expo_camera_1.Camera);
const IS_ANDROID = react_native_1.Platform.OS === 'android';
const IS_IOS = react_native_1.Platform.OS === 'ios';
// Camera preview size.
//
// From experiments, to render camera feed without distortion, 16:9 ratio
// should be used fo iOS devices and 4:3 ratio should be used for android
// devices.
//
// This might not cover all cases.
const CAM_PREVIEW_WIDTH = react_native_1.Dimensions.get('window').width;
const CAM_PREVIEW_HEIGHT = CAM_PREVIEW_WIDTH / (IS_IOS ? 9 / 16 : 3 / 4);
// The score threshold for pose detection results.
const MIN_KEYPOINT_SCORE = 0.3;
// The size of the resized output from TensorCamera.
//
// For movenet, the size here doesn't matter too much because the model will
// preprocess the input (crop, resize, etc). For best result, use the size that
// doesn't distort the image.
const OUTPUT_TENSOR_WIDTH = 180;
const OUTPUT_TENSOR_HEIGHT = OUTPUT_TENSOR_WIDTH / (IS_IOS ? 9 / 16 : 3 / 4);
// Whether to auto-render TensorCamera preview.
const AUTO_RENDER = false;
// Whether to load model from app bundle (true) or through network (false).
const LOAD_MODEL_FROM_BUNDLE = false;
function App() {
    const cameraRef = (0, react_1.useRef)(null);
    const [tfReady, setTfReady] = (0, react_1.useState)(false);
    const [model, setModel] = (0, react_1.useState)();
    const [poses, setPoses] = (0, react_1.useState)();
    const [fps, setFps] = (0, react_1.useState)(0);
    const [orientation, setOrientation] = (0, react_1.useState)();
    const [cameraType, setCameraType] = (0, react_1.useState)(expo_camera_1.Camera.Constants.Type.front);
    // Use `useRef` so that changing it won't trigger a re-render.
    //
    // - null: unset (initial value).
    // - 0: animation frame/loop has been canceled.
    // - >0: animation frame has been scheduled.
    const rafId = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        async function prepare() {
            rafId.current = null;
            // Set initial orientation.
            const curOrientation = await ScreenOrientation.getOrientationAsync();
            setOrientation(curOrientation);
            // Listens to orientation change.
            ScreenOrientation.addOrientationChangeListener((event) => {
                setOrientation(event.orientationInfo.orientation);
            });
            // Camera permission.
            await expo_camera_1.Camera.requestCameraPermissionsAsync();
            // Wait for tfjs to initialize the backend.
            await tf.ready();
            // Load movenet model.
            // https://github.com/tensorflow/tfjs-models/tree/master/pose-detection
            const movenetModelConfig = {
                modelType: posedetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
                enableSmoothing: true,
            };
            if (LOAD_MODEL_FROM_BUNDLE) {
                const modelJson = require('./offline_model/model.json');
                const modelWeights1 = require('./offline_model/group1-shard1of2.bin');
                const modelWeights2 = require('./offline_model/group1-shard2of2.bin');
                movenetModelConfig.modelUrl = (0, tfjs_react_native_1.bundleResourceIO)(modelJson, [
                    modelWeights1,
                    modelWeights2,
                ]);
            }
            const model = await posedetection.createDetector(posedetection.SupportedModels.MoveNet, movenetModelConfig);
            setModel(model);
            // Ready!
            setTfReady(true);
        }
        prepare();
    }, []);
    (0, react_1.useEffect)(() => {
        // Called when the app is unmounted.
        return () => {
            if (rafId.current != null && rafId.current !== 0) {
                cancelAnimationFrame(rafId.current);
                rafId.current = 0;
            }
        };
    }, []);
    const handleCameraStream = async (images, updatePreview, gl) => {
        const loop = async () => {
            // Get the tensor and run pose detection.
            const imageTensor = images.next().value;
            const startTs = Date.now();
            const poses = await model.estimatePoses(imageTensor, undefined, Date.now());
            const latency = Date.now() - startTs;
            setFps(Math.floor(1000 / latency));
            setPoses(poses);
            tf.dispose([imageTensor]);
            if (rafId.current === 0) {
                return;
            }
            // Render camera preview manually when autorender=false.
            if (!AUTO_RENDER) {
                updatePreview();
                gl.endFrameEXP();
            }
            rafId.current = requestAnimationFrame(loop);
        };
        loop();
    };
    const renderPose = () => {
        if (poses != null && poses.length > 0) {
            const keypoints = poses[0].keypoints
                .filter((k) => (k.score ?? 0) > MIN_KEYPOINT_SCORE)
                .map((k) => {
                // Flip horizontally on android or when using back camera on iOS.
                const flipX = IS_ANDROID || cameraType === expo_camera_1.Camera.Constants.Type.back;
                const x = flipX ? getOutputTensorWidth() - k.x : k.x;
                const y = k.y;
                const cx = (x / getOutputTensorWidth()) *
                    (isPortrait() ? CAM_PREVIEW_WIDTH : CAM_PREVIEW_HEIGHT);
                const cy = (y / getOutputTensorHeight()) *
                    (isPortrait() ? CAM_PREVIEW_HEIGHT : CAM_PREVIEW_WIDTH);
                return (<react_native_svg_1.Circle key={`skeletonkp_${k.name}`} cx={cx} cy={cy} r='4' strokeWidth='2' fill='#00AA00' stroke='white'/>);
            });
            return <react_native_svg_1.default style={styles.svg}>{keypoints}</react_native_svg_1.default>;
        }
        else {
            return <react_native_1.View></react_native_1.View>;
        }
    };
    const renderFps = () => {
        return (<react_native_1.View style={styles.fpsContainer}>
        <react_native_1.Text>FPS: {fps}</react_native_1.Text>
      </react_native_1.View>);
    };
    const renderCameraTypeSwitcher = () => {
        return (<react_native_1.View style={styles.cameraTypeSwitcher} onTouchEnd={handleSwitchCameraType}>
        <react_native_1.Text>
          Switch to{' '}
          {cameraType === expo_camera_1.Camera.Constants.Type.front ? 'back' : 'front'} camera
        </react_native_1.Text>
      </react_native_1.View>);
    };
    const handleSwitchCameraType = () => {
        if (cameraType === expo_camera_1.Camera.Constants.Type.front) {
            setCameraType(expo_camera_1.Camera.Constants.Type.back);
        }
        else {
            setCameraType(expo_camera_1.Camera.Constants.Type.front);
        }
    };
    const isPortrait = () => {
        return (orientation === ScreenOrientation.Orientation.PORTRAIT_UP ||
            orientation === ScreenOrientation.Orientation.PORTRAIT_DOWN);
    };
    const getOutputTensorWidth = () => {
        // On iOS landscape mode, switch width and height of the output tensor to
        // get better result. Without this, the image stored in the output tensor
        // would be stretched too much.
        //
        // Same for getOutputTensorHeight below.
        return isPortrait() || IS_ANDROID
            ? OUTPUT_TENSOR_WIDTH
            : OUTPUT_TENSOR_HEIGHT;
    };
    const getOutputTensorHeight = () => {
        return isPortrait() || IS_ANDROID
            ? OUTPUT_TENSOR_HEIGHT
            : OUTPUT_TENSOR_WIDTH;
    };
    const getTextureRotationAngleInDegrees = () => {
        // On Android, the camera texture will rotate behind the scene as the phone
        // changes orientation, so we don't need to rotate it in TensorCamera.
        if (IS_ANDROID) {
            return 0;
        }
        // For iOS, the camera texture won't rotate automatically. Calculate the
        // rotation angles here which will be passed to TensorCamera to rotate it
        // internally.
        switch (orientation) {
            // Not supported on iOS as of 11/2021, but add it here just in case.
            case ScreenOrientation.Orientation.PORTRAIT_DOWN:
                return 180;
            case ScreenOrientation.Orientation.LANDSCAPE_LEFT:
                return cameraType === expo_camera_1.Camera.Constants.Type.front ? 270 : 90;
            case ScreenOrientation.Orientation.LANDSCAPE_RIGHT:
                return cameraType === expo_camera_1.Camera.Constants.Type.front ? 90 : 270;
            default:
                return 0;
        }
    };
    if (!tfReady) {
        return (<react_native_1.View style={styles.loadingMsg}>
        <react_native_1.Text>Loading...</react_native_1.Text>
      </react_native_1.View>);
    }
    else {
        return (
        // Note that you don't need to specify `cameraTextureWidth` and
        // `cameraTextureHeight` prop in `TensorCamera` below.
        <react_native_1.View style={isPortrait() ? styles.containerPortrait : styles.containerLandscape}>
        <TensorCamera ref={cameraRef} style={styles.camera} autorender={AUTO_RENDER} type={cameraType} 
        // tensor related props
        resizeWidth={getOutputTensorWidth()} resizeHeight={getOutputTensorHeight()} resizeDepth={3} rotation={getTextureRotationAngleInDegrees()} onReady={handleCameraStream}/>
        {renderPose()}
        {renderFps()}
        {renderCameraTypeSwitcher()}
      </react_native_1.View>);
    }
}
exports.default = App;
const styles = react_native_1.StyleSheet.create({
    containerPortrait: {
        position: 'relative',
        width: CAM_PREVIEW_WIDTH,
        height: CAM_PREVIEW_HEIGHT,
        marginTop: react_native_1.Dimensions.get('window').height / 2 - CAM_PREVIEW_HEIGHT / 2,
    },
    containerLandscape: {
        position: 'relative',
        width: CAM_PREVIEW_HEIGHT,
        height: CAM_PREVIEW_WIDTH,
        marginLeft: react_native_1.Dimensions.get('window').height / 2 - CAM_PREVIEW_HEIGHT / 2,
    },
    loadingMsg: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    camera: {
        width: '100%',
        height: '100%',
        zIndex: 1,
    },
    svg: {
        width: '100%',
        height: '100%',
        position: 'absolute',
        zIndex: 30,
    },
    fpsContainer: {
        position: 'absolute',
        top: 10,
        left: 10,
        width: 80,
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, .7)',
        borderRadius: 2,
        padding: 8,
        zIndex: 20,
    },
    cameraTypeSwitcher: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 180,
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, .7)',
        borderRadius: 2,
        padding: 8,
        zIndex: 20,
    },
});
