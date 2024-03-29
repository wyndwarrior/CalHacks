var VR_POSITION_SCALE = 25;

function printVector(values) {
    var str = "[";

    str += values.x.toFixed(2) + ", ";
    str += values.y.toFixed(2) + ", ";
    str += values.z.toFixed(2);

    if ("w" in values) {
        str += ", " + values.w.toFixed(2);
    }

    str += "]";
    return str;
}

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

 //
 // Rendering
 //
var renderer = new THREE.WebGLRenderer({
    preserveDrawingBuffer: true
});
var scene = new THREE.Scene();
var cssScene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

renderer.setClearColor(0x111111, 0.0);

camera.position.z = 130;

function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
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

 //
 // Update Loop
 //

var radius = 50,
    segments = 16,
    rings = 16;

// create a new mesh with
// sphere geometry - we will cover
// the sphereMaterial next!

var sphereMaterial =
  new THREE.MeshLambertMaterial(
    {
      color: 0xCC0000
    });
var sphere = new THREE.Mesh(

  new THREE.SphereGeometry(
    radius,
    segments,
    rings),

  sphereMaterial);

// add the sphere to the scene
scene.add(sphere);
var ambient = new THREE.AmbientLight(0x444444);
scene.add(ambient);

var material = new THREE.MeshBasicMaterial({ wireframe: true });
var geometry = new THREE.PlaneGeometry();
var planeMesh= new THREE.Mesh( geometry, material );
// add it to the WebGL scene
scene.add(planeMesh);


  var element = document.createElement('iframe')
  element.src = 'draw.html'
  element.style.width = '1024px';
  element.style.height = '1024px';
// create the object3d for this element
var cssObject = new THREE.CSS3DObject( element );
// we reference the same position and rotation 
cssObject.position = planeMesh.position;
cssObject.rotation = planeMesh.rotation;
// add it to the css scene
cssScene.add(cssObject);

var cssRenderer = new THREE.CSS3DRenderer();
cssRenderer.setSize( window.innerWidth, window.innerHeight );
cssRenderer.domElement.style.position = 'absolute';
cssRenderer.domElement.style.top = 0;

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


function render(t) {
    requestAnimationFrame(render);
    if (!updateVRDevice()) {
        // If we don't have a VR device just spin the model around to give us
        // something pretty to look at.
        //rift.rotation.y += 0.01;
    }

    cssRenderer.render(cssScene, camera);

    if (vrMode) {
        // Render left eye
        renderer.enableScissorTest(true);
        renderer.setScissor(0, 0, window.innerWidth / 2, window.innerHeight);
        renderer.setViewport(0, 0, window.innerWidth / 2, window.innerHeight);
        renderer.render(scene, cameraLeft);

        // Render right eye
        renderer.setScissor(window.innerWidth / 2, 0, window.innerWidth / 2, window.innerHeight);
        renderer.setViewport(window.innerWidth / 2, 0, window.innerWidth / 2, window.innerHeight);
        renderer.render(scene, cameraRight);
    } else {
        // Render mono view
        renderer.enableScissorTest(false);
        renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
        renderer.render(scene, camera);
    }
}

cssRenderer.domElement.firstChild.appendChild(element);

$(document).ready(function(){
    //document.body.appendChild(renderer.domElement);
    document.body.appendChild(cssRenderer.domElement);
});
render();

function formatNumber(x) {
  x = parseFloat(x);
  if (x > 1e9) return numberWithCommas((x / 1e9).toFixed(2)) + "B";
  if (x > 1e6) return numberWithCommas((x / 1e6).toFixed(2)) + "M";
  return numberWithCommas(x.toFixed(2))
}

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}