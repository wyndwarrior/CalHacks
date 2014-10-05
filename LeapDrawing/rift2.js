

 //
 // WebVR Device initialization
 //
var sensorDevice = null;
var hmdDevice = null;
var vrMode = false;
var stats = document.getElementById("stats");

function PerspectiveMatrixFromVRFieldOfView(fov, zNear, zFar) {
    var outMat = new THREE.Matrix4();
    var out = outMat.elements;
    var upTan = Math.tan(fov.upDegrees * Math.PI / 180.0);
    var downTan = Math.tan(fov.downDegrees * Math.PI / 180.0);
    var leftTan = Math.tan(fov.leftDegrees * Math.PI / 180.0);
    var rightTan = Math.tan(fov.rightDegrees * Math.PI / 180.0);

    var xScale = 2.0 / (leftTan + rightTan);
    var yScale = 2.0 / (upTan + downTan);

    out[0] = xScale;
    out[4] = 0.0;
    out[8] = -((leftTan - rightTan) * xScale * 0.5);
    out[12] = 0.0;

    out[1] = 0.0;
    out[5] = yScale;
    out[9] = ((upTan - downTan) * yScale * 0.5);
    out[13] = 0.0;

    out[2] = 0.0;
    out[6] = 0.0;
    out[10] = zFar / (zNear - zFar);
    out[14] = (zFar * zNear) / (zNear - zFar);

    out[3] = 0.0;
    out[7] = 0.0;
    out[11] = -1.0;
    out[15] = 0.0;

    return outMat;
}

var cameraLeft = new THREE.PerspectiveCamera(75, 4 / 3, 0.1, 1000);
var cameraRight = new THREE.PerspectiveCamera(75, 4 / 3, 0.1, 1000);

var fovScale = 1.0;

function resizeFOV(amount) {
    var fovLeft, fovRight;

    if (!hmdDevice) {
        return;
    }

    if (amount != 0 && 'setFieldOfView' in hmdDevice) {
        fovScale += amount;
        if (fovScale < 0.1) {
            fovScale = 0.1;
        }

        fovLeft = hmdDevice.getRecommendedEyeFieldOfView("left");
        fovRight = hmdDevice.getRecommendedEyeFieldOfView("right");

        fovLeft.upDegrees *= fovScale;
        fovLeft.downDegrees *= fovScale;
        fovLeft.leftDegrees *= fovScale;
        fovLeft.rightDegrees *= fovScale;

        fovRight.upDegrees *= fovScale;
        fovRight.downDegrees *= fovScale;
        fovRight.leftDegrees *= fovScale;
        fovRight.rightDegrees *= fovScale;

        hmdDevice.setFieldOfView(fovLeft, fovRight);
    }

    if ('getRecommendedRenderTargetSize' in hmdDevice) {
        var renderTargetSize = hmdDevice.getRecommendedRenderTargetSize();
        document.getElementById("renderTarget").innerHTML = renderTargetSize.width + "x" + renderTargetSize.height;
    }

    if ('getCurrentEyeFieldOfView' in hmdDevice) {
        fovLeft = hmdDevice.getCurrentEyeFieldOfView("left");
        fovRight = hmdDevice.getCurrentEyeFieldOfView("right");
    } else {
        fovLeft = hmdDevice.getRecommendedEyeFieldOfView("left");
        fovRight = hmdDevice.getRecommendedEyeFieldOfView("right");
    }

    cameraLeft.projectionMatrix = PerspectiveMatrixFromVRFieldOfView(fovLeft, 0.1, 1000);
    cameraRight.projectionMatrix = PerspectiveMatrixFromVRFieldOfView(fovRight, 0.1, 1000);
}

function EnumerateVRDevices(devices) {
    // First find an HMD device
    for (var i = 0; i < devices.length; ++i) {
        if (devices[i] instanceof HMDVRDevice) {
            hmdDevice = devices[i];

            var eyeOffsetLeft = hmdDevice.getEyeTranslation("left");
            var eyeOffsetRight = hmdDevice.getEyeTranslation("right")

            cameraLeft.position.sub(eyeOffsetLeft);
            cameraLeft.position.z = 130;

            cameraRight.position.sub(eyeOffsetRight);
            cameraRight.position.z = 130;

            resizeFOV(0.0);
        }
    }

    // Next find a sensor that matches the HMD hardwareUnitId
    for (var i = 0; i < devices.length; ++i) {
        if (devices[i] instanceof PositionSensorVRDevice &&
            (!hmdDevice || devices[i].hardwareUnitId == hmdDevice.hardwareUnitId)) {
            sensorDevice = devices[i];
        }
    }
}

if (navigator.getVRDevices) {
    navigator.getVRDevices().then(EnumerateVRDevices);
} else if (navigator.mozGetVRDevices) {
    navigator.mozGetVRDevices(EnumerateVRDevices);
} else {
    stats.classList.add("error");
    stats.innerHTML = "WebVR API not supported";
}

window.addEventListener("keydown", function(ev) {
    if (hmdDevice) {
        if (ev.keyCode == "R".charCodeAt(0)) {
            sensorDevice.resetSensor();
        }
        if (ev.keyCode == 187 || ev.keyCode == 61) { // "+" key
            resizeFOV(0.1);
        }
        if (ev.keyCode == 189 || ev.keyCode == 173) { // "-" key
            resizeFOV(-0.1);
        }
    }
});

var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);


camera.position.z = 15;

function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}
resize();
window.addEventListener("resize", resize, false);

 // Fullscreen VR mode handling

function onFullscreenChange() {
    if (!document.webkitFullscreenElement && !document.mozFullScreenElement) {
        vrMode = false;
    }
    resize();
}

document.addEventListener("webkitfullscreenchange", onFullscreenChange, false);
document.addEventListener("mozfullscreenchange", onFullscreenChange, false);

var vrBtn = document.getElementById("vrBtn");
if (vrBtn) {
    vrBtn.addEventListener("click", function() {
        vrMode = true;
        if (renderer.domElement.webkitRequestFullscreen) {
            renderer.domElement.webkitRequestFullscreen({
                vrDisplay: hmdDevice
            });
        } else if (renderer.domElement.mozRequestFullScreen) {
            renderer.domElement.mozRequestFullScreen({
                vrDisplay: hmdDevice
            });
        }
    }, false);
}

function updateVRDevice() {
    if (!sensorDevice) return false;
    var vrState = sensorDevice.getState();

    camera.quaternion.x = vrState.orientation.x;
    camera.quaternion.y = vrState.orientation.y;
    camera.quaternion.z = vrState.orientation.z;
    camera.quaternion.w = vrState.orientation.w;
    cameraLeft.quaternion.x = vrState.orientation.x;
    cameraLeft.quaternion.y = vrState.orientation.y;
    cameraLeft.quaternion.z = vrState.orientation.z;
    cameraLeft.quaternion.w = vrState.orientation.w;
    cameraRight.quaternion.x = vrState.orientation.x;
    cameraRight.quaternion.y = vrState.orientation.y;
    cameraRight.quaternion.z = vrState.orientation.z;
    cameraRight.quaternion.w = vrState.orientation.w;


    //console.log(vrState.orientation);
    
    return true;
}

