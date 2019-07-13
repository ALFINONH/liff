
const USER_SERVICE_UUID         = '91E4E176-D0B9-464D-9FE4-52EE3E9F1552'; // LED, Button
// User service characteristics
const LED_CHARACTERISTIC_UUID   = 'E9062E71-9E62-4BC6-B0D3-35CDCD9B027B';
const BTN_CHARACTERISTIC_UUID   = '62FBD229-6EDD-4D1A-B554-5C4E1BB29169';

// PSDI Service UUID: Fixed value for Developer Trial
const PSDI_SERVICE_UUID         = 'E625601E-9E55-4597-A598-76018A0D293D'; // Device ID
const PSDI_CHARACTERISTIC_UUID  = '26E2B12B-85F0-4F3F-9FDD-91D114270E6E';

// UI settings
let ledState = false; // true: LED on, false: LED off
let clickCount = 0;

window.onload = () => {
    initializeApp();
};


function handlerToggleLed() {
    ledState = !ledState;

    uiToggleLedButton(ledState);
    liffToggleDeviceLedState(ledState);
}

// ------------ //
// UI functions //
// ------------ //

function uiToggleLedButton(state) {
    const el = document.getElementById("btn-led-toggle");
    el.innerText = state ? "Switch LED OFF" : "Switch LED ON";

    if (state) {
      el.classList.add("led-on");
    } else {
      el.classList.remove("led-on");
    }
}

function uiCountPressButton() {
    clickCount++;

    const el = document.getElementById("click-count");
    el.innerText = clickCount;
}

function uiToggleStateButton(pressed) {
    const el = document.getElementById("btn-state");

    if (pressed) {
        el.classList.add("pressed");
        el.innerText = "Pressed";
    } else {
        el.classList.remove("pressed");
        el.innerText = "Released";
    }
}

function uiToggleDeviceConnected(connected) {
    const elStatus = document.getElementById("status");
    const elControls = document.getElementById("controls");

    elStatus.classList.remove("error");

    if (connected) {
        // Hide loading animation
        uiToggleLoadingAnimation(false);
        // Show status connected
        elStatus.classList.remove("inactive");
        elStatus.classList.add("success");
        elStatus.innerText = "Device connected";
        // Show controls
        elControls.classList.remove("hidden");
    } else {
        // Show loading animation
        uiToggleLoadingAnimation(true);
        // Show status disconnected
        elStatus.classList.remove("success");
        elStatus.classList.add("inactive");
        elStatus.innerText = "Device disconnected";
        // Hide controls
        elControls.classList.add("hidden");
    }
}

function uiToggleLoadingAnimation(isLoading) {
    const elLoading = document.getElementById("loading-animation");

    if (isLoading) {
        // Show loading animation
        elLoading.classList.remove("hidden");
    } else {
        // Hide loading animation
        elLoading.classList.add("hidden");
    }
}

function uiStatusError(message, showLoadingAnimation) {
    uiToggleLoadingAnimation(showLoadingAnimation);

    const elStatus = document.getElementById("status");
    const elControls = document.getElementById("controls");

    // Show status error
    elStatus.classList.remove("success");
    elStatus.classList.remove("inactive");
    elStatus.classList.add("error");
    elStatus.innerText = message;

    // Hide controls
    elControls.classList.add("hidden");
}

function makeErrorMsg(errorObj) {
    return "Error\n" + errorObj.code + "\n" + errorObj.message;
}

// -------------- //
// LIFF functions //
// -------------- //

function initializeApp() {
    liff.init(() => initializeLiff(), error => uiStatusError(makeErrorMsg(error), false));
}

function initializeLiff() {
    liff.initPlugins(['bluetooth']).then(() => {
        liffCheckAvailablityAndDo(() => liffRequestDevice());
    }).catch(error => {
        uiStatusError(makeErrorMsg(error), false);
    });
}

function liffCheckAvailablityAndDo(callbackIfAvailable) {
    // Check Bluetooth availability
    liff.bluetooth.getAvailability().then(isAvailable => {
        if (isAvailable) {
            uiToggleDeviceConnected(false);
            callbackIfAvailable();
        } else {
            uiStatusError("Bluetooth not available", true);
            setTimeout(() => liffCheckAvailablityAndDo(callbackIfAvailable), 10000);
        }
    }).catch(error => {
        uiStatusError(makeErrorMsg(error), false);
    });;
}

function liffRequestDevice() {
    liff.bluetooth.requestDevice().then(device => {
        liffConnectToDevice(device);
    }).catch(error => {
        uiStatusError(makeErrorMsg(error), false);
    });
}

function liffConnectToDevice(device) {
    device.gatt.connect().then(() => {
        document.getElementById("device-name").innerText = device.name;
        document.getElementById("device-id").innerText = device.id;

        // Show status connected
        uiToggleDeviceConnected(true);

        // Get service
        device.gatt.getPrimaryService(USER_SERVICE_UUID).then(service => {
            liffGetUserService(service);
        }).catch(error => {
            uiStatusError(makeErrorMsg(error), false);
        });
        device.gatt.getPrimaryService(PSDI_SERVICE_UUID).then(service => {
            liffGetPSDIService(service);
        }).catch(error => {
            uiStatusError(makeErrorMsg(error), false);
        });

        // Device disconnect callback
        const disconnectCallback = () => {
            // Show status disconnected
            uiToggleDeviceConnected(false);

            // Remove disconnect callback
            device.removeEventListener('gattserverdisconnected', disconnectCallback);

            // Reset LED state
            ledState = false;
            // Reset UI elements
            uiToggleLedButton(false);
            uiToggleStateButton(false);

            // Try to reconnect
            initializeLiff();
        };

        device.addEventListener('gattserverdisconnected', disconnectCallback);
    }).catch(error => {
        uiStatusError(makeErrorMsg(error), false);
    });
}

function liffGetUserService(service) {
    // Button pressed state
    service.getCharacteristic(BTN_CHARACTERISTIC_UUID).then(characteristic => {
        liffGetButtonStateCharacteristic(characteristic);
    }).catch(error => {
        uiStatusError(makeErrorMsg(error), false);
    });

    // Toggle LED
    service.getCharacteristic(LED_CHARACTERISTIC_UUID).then(characteristic => {
        window.ledCharacteristic = characteristic;

        // Switch off by default
        liffToggleDeviceLedState(false);
    }).catch(error => {
        uiStatusError(makeErrorMsg(error), false);
    });
}

function liffGetPSDIService(service) {
    // Get PSDI value
    service.getCharacteristic(PSDI_CHARACTERISTIC_UUID).then(characteristic => {
        return characteristic.readValue();
    }).then(value => {
        // Byte array to hex string
        const psdi = new Uint8Array(value.buffer)
            .reduce((output, byte) => output + ("0" + byte.toString(16)).slice(-2), "");
        document.getElementById("device-psdi").innerText = psdi;
    }).catch(error => {
        uiStatusError(makeErrorMsg(error), false);
    });
}

function liffGetButtonStateCharacteristic(characteristic) {
    characteristic.startNotifications().then(() => {
        characteristic.addEventListener('characteristicvaluechanged', e => {
            const val = (new Uint8Array(e.target.value.buffer))[0];
            if (val > 0) {
                // press
                uiToggleStateButton(true);
            } else {
                // release
                uiToggleStateButton(false);
                uiCountPressButton();
            }
        });
    }).catch(error => {
        uiStatusError(makeErrorMsg(error), false);
    });
}

function liffToggleDeviceLedState(state) {
    // on: 0x01
    // off: 0x00
    window.ledCharacteristic.writeValue(
        state ? new Uint8Array([0x01]) : new Uint8Array([0x00])
    ).catch(error => {
        uiStatusError(makeErrorMsg(error), false);
    });
}


window.onload = function (e) {
    liff.init(function () {
        getP();
    });
};

function getP(){
    var tipe = getParameterByName('type')
    if (!tipe) {
        document.getElementById('textx').addEventListener('click', function () {
            liff.sendMessages([{
                type: 'text',
                text: atob('bGluZTovL2FwcC8xNjAyNjg3MzA4LUdYcTRWdms5P3R5cGU9dGV4dCZ0ZXh0PVlvdXIlMjBUZXh0Cgp0eXBlID0+IHRleHQKdGV4dCA9PiB5b3VyIHRleHQ=')
            }]).then(function () {
                liff.closeWindow();
            });
        });
        document.getElementById('imagex').addEventListener('click', function () {
            liff.sendMessages([{
                type: 'text',
                text: atob('bGluZTovL2FwcC8xNjAyNjg3MzA4LUdYcTRWdms5P3R5cGU9aW1hZ2UmaW1nPWh0dHBzOi8vd2FsbHBhcGVyc3R1ZGlvMTAuY29tL3N0YXRpYy93cGRiL3dhbGxwYXBlcnMvMTAwMHg1NjMvMTY4ODkxLmpwZwoKdHlwZSA9PiBpbWFnZQppbWcgPT4gTGluayAobXVzdCBiZSBIVFRQUyk=')
            }]).then(function () {
                liff.closeWindow();
            });
        });
        document.getElementById('videox').addEventListener('click', function () {
            liff.sendMessages([{
                type: 'text',
                text: atob('https://textpro.me/images/user_image/2019/02/5c699f54c8d3d.jpg')
            }]).then(function () {
                liff.closeWindow();
            });
        });
        document.getElementById('audiox').addEventListener('click', function () {
            liff.sendMessages([{
                type: 'text',
                text: atob('bGluZTovL2FwcC8xNjAyNjg3MzA4LUdYcTRWdms5P3R5cGU9YXVkaW8mbGluaz1odHRwczovL3BsYXRlbGV0cy5mdW4vcHVibGljL3NvdW5kcy9tdXNpYy5tcDM=')
            }]).then(function () {
                liff.closeWindow();
            });
        });
        document.getElementById('stickerx').addEventListener('click', function () {
            liff.sendMessages([{
                type: 'text',
                text: atob('V2l0aCBBbmltYXRpb246CmxpbmU6Ly9hcHAvMTYwMjY4NzMwOC1HWHE0VnZrOT90eXBlPXN0aWNrZXImc3RrPWFuaW0mc2lkPTMyMTI4MjMxJnBrZz0zMDk5MzEyCgpObyBBbmltYXRpb246CmxpbmU6Ly9hcHAvMTYwMjY4NzMwOC1HWHE0VnZrOT90eXBlPXN0aWNrZXImc3RrPW5vYW5pbSZzaWQ9MzIxMjgyMzEmcGtnPTMwOTkzMTIKCnR5cGUgPT4gc3RpY2tlcgpzdGsgPT4gYW5pbSAvIG5vYW5pbQpzaWQgPT4gc3RpY2tlciBpZApwa2cgPT4gcGFja2FnZXMgaWQ=')
            }]).then(function () {
                liff.closeWindow();
            });
        });
    } else {
        makeText();
        makeImage();
        makeVideo();
        makeAudio();
        makeSticker();
        meProfile();
    }
    }

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
function getProfile(){
    liff.getProfile().then(function (profile) {
        document.getElementById('userid').textContent = 'Hai  ' + profile.displayName;
        document.getElementById('main').src = profile.pictureUrl;        
        document.getElementById('close').addEventListener('click', function () {
            liff.closeWindow();
        });
    });
}

function makeText(){
    var tipe = getParameterByName('type');
    if (tipe === 'text') {
        liff.sendMessages([{
            type: 'text',
            text: getParameterByName('text')
        }]).then(function () {
            liff.closeWindow();
        });
    }
}

function makeImage(){
    var tipe = getParameterByName('type');
    if (tipe === 'image') {
        liff.sendMessages([{
            type: 'image',
            originalContentUrl: getParameterByName('img'),
            previewImageUrl: getParameterByName('img')
        }]).then(function () {
            liff.closeWindow();
        });
    }
}

function makeVideo(){
    var tipe = getParameterByName('type');
    if (tipe === 'video') {
        liff.sendMessages([{
            type: 'video',
            originalContentUrl: getParameterByName('ocu'),
            previewImageUrl: getParameterByName('piu')
        }]).then(function () {
            liff.closeWindow();
        });
    }
}

function makeAudio(){
    var tipe = getParameterByName('type');
    if (tipe === 'audio') {
        liff.sendMessages([{
            type: 'audio',
            originalContentUrl: getParameterByName('link'),
            duration: 60000
        }]).then(function () {
            liff.closeWindow();
        });
    }
}

function makeSticker(){
    var tipe = getParameterByName('type');
    if (tipe === 'sticker') {
        var stk = getParameterByName('stk');
        var sid = getParameterByName('sid');
        var pkg = getParameterByName('pkg');
        var ep = '';
        if (stk === 'anim') {
            ep = "/IOS/sticker_animation@2x.png";
        } else {
            ep = "/IOS/sticker@2x.png";
        }
        liff.sendMessages([{
          type: "template",
          altText: "Sticker",
          template: {
             type: "image_carousel",
             columns: [{
                 imageUrl: "https://stickershop.line-scdn.net/stickershop/v1/sticker/"+sid+ep,
                 action: {
                     type: "uri",
                     uri: "line://shop/sticker/detail/"+pkg}}
                          ]
                        }
        }]).then(function () {
            liff.closeWindow();
        });
    }
}

function meProfile(){
    var tipe = getParameterByName('type');
    liff.getProfile().then(function (prof) {
        var stat = prof.statusMessage;
        if (stat == null) {
            var stat = " - ";
        }
        if (stat.length > 60) {
            var stat = "Status Message is to long! Max 60 words";
        }
        if (tipe === 'profile') {
            liff.sendMessages([{
                type: "template",
                altText: "Profile "+prof.displayName,
                template: {
                    type: "buttons",
                    thumbnailImageUrl: prof.pictureUrl,
                    imageAspectRatio: "square",
                    imageSize: "cover",
                    title: prof.displayName,
                    color: "#FF0000",
                    align: "center",
                    text: stat,
                    color: "#FF0000",
                    align: "center",
                    actions: [
                        {
                            type:"uri",
                            label:"Me",
                            uri:"line://app/1604066537-dl9GVZzo?type=profile"
                        }
                    ]
                }
            }]).then(function () {
                liff.closeWindow();
            });
        }
    });
}
