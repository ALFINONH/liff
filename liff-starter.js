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
            var stat = " Status sedang kosong alias kesepian";
        }
        if (stat.length > 999999999) {
            var stat = "Status Message is to long! Max 999999999 words";
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
                            label:"My Profile",
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

function initializeApp(data) {
    document.getElementById('useridfield').textContent = data.context.userId;
    document.getElementById('utouidfield').textContent = data.context.utouId;
    document.getElementById('roomidfield').textContent = data.context.roomId;
    document.getElementById('groupidfield').textContent = data.context.groupId;

    document.getElementById('openwindowbutton').addEventListener('click', function () {
        liff.openWindow({
            url: 'line://app/1604066537-dl9GVZzo?type=profile'
        });
    });

    document.getElementById('closewindowbutton').addEventListener('click', function () {
        liff.closeWindow();
    });

    document.getElementById('sendmessagebutton').addEventListener('click', function () {
        liff.sendMessages([{
            type: 'text',
            text: "Hai KANG FINO..I LOVE YOU...WKWKWKWK!"
        }, {
            type: 'sticker',
            packageId: '2',
            stickerId: '144'
        }]).then(function () {
            window.alert("Message sent");
        }).catch(function (error) {
            window.alert("Error sending message: " + error);
        });
    });

    document.getElementById('getprofilebutton').addEventListener('click', function () {
        liff.getProfile().then(function (profile) {
            document.getElementById('useridprofilefield').textContent = profile.userId;
            document.getElementById('displaynamefield').textContent = profile.displayName;

            var profilePictureDiv = document.getElementById('profilepicturediv');
            if (profilePictureDiv.firstElementChild) {
                profilePictureDiv.removeChild(profilePictureDiv.firstElementChild);
            }
            var img = document.createElement('img');
            img.src = profile.pictureUrl;
            img.alt = "Profile Picture";
            profilePictureDiv.appendChild(img);

            document.getElementById('statusmessagefield').textContent = profile.statusMessage;
            toggleProfileData();
        }).catch(function (error) {
            window.alert("Error getting profile: " + error);
        });
    });
}

function toggleProfileData() {
    var elem = document.getElementById('profileinfo');
    if (elem.offsetWidth > 0 && elem.offsetHeight > 0) {
        elem.style.display = "none";
    } else {
        elem.style.display = "block";
    }
}
