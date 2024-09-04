function S(id) { return document.getElementById(id); }

function openFullscreen(elem) {
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) { /* Safari */
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE11 */
        elem.msRequestFullscreen();
    }
}

S("FullscreenIcon").addEventListener("click", function (ev) {
    ev.preventDefault()
    openFullscreen(document.documentElement)
})


var controllerButtons = ["1", "2", "3", "4"].map((x) => S("ControllerB" + x))

controllerButtons.forEach(elem => {
    elem.addEventListener("touchstart", function (ev) {
        ev.preventDefault()
        elem.classList.add("bg-slate-500")
    })

    elem.addEventListener("touchcancel", function (ev) {
        ev.preventDefault()
        elem.classList.remove("bg-slate-500")
    })

    elem.addEventListener("touchend", function (ev) {
        ev.preventDefault()
        elem.classList.remove("bg-slate-500")
    })
});


var dataStoreCounter = 0

var dataStoreHostname = window.location.hostname.toString()

function getDataStore() {
    return new Promise(function (resolve, reject) {
        fetch("http://" + dataStoreHostname + ":3000/datastoreget", {
            method: "GET",
        }).then((res) => {
            if (res.status === 200) {
                dataStoreCounter = parseInt(res.headers.get("sdss-data-store-counter"), 10)
                res.text().then((v) => { resolve(JSON.parse(v)) })
            } else {
                reject()
            }
        })
    })
}

function setDataStore(data) {
    return new Promise(function (resolve, reject) {
        fetch("http://" + dataStoreHostname + ":3000/datastoreset", {
            method: "POST",
            headers: {
                "sdss-data-store-counter": ((dataStoreCounter + 1) % 1000000000).toString(10)
            },
            body: JSON.stringify(data)
        }).then((res) => {
            if (res.status == 200) {
                dataStoreCounter = dataStoreCounter + 1
                resolve()
            } else {
                reject()
            }
        })
    })
}




var peerConn = new RTCPeerConnection()
var dataChan = peerConn.createDataChannel("mainchannel")

peerConn.createOffer().then((offer) => {
    peerConn.setLocalDescription(offer)
    console.log(offer)

    var allIceCandidates = []

    peerConn.addEventListener("icecandidate", (ev) => {
        if (ev.candidate !== null) {
            if (ev.candidate.protocol === "udp") {
                allIceCandidates.push(ev.candidate)
            }
        } else {
            function addInfoToDataStore() {
                var connInfo = {
                    offer: offer,
                    all_ice_candidates: allIceCandidates
                }
                getDataStore().then((ds) => {
                    console.log(ds)
                    if (!ds.hasOwnProperty("new_controller_requests")) {
                        ds.new_controller_requests = []
                    }
                    if (!ds.hasOwnProperty("next_id")) {
                        ds.next_id = 1
                    }
                    connInfo.id = ds.next_id
                    ds.next_id++
                    ds.new_controller_requests.push(connInfo)
                    setDataStore(ds).then().catch(() => { addInfoToDataStore() }, 2000)
                }).catch(() => setTimeout(() => { addInfoToDataStore() }, 2000))
            }
            addInfoToDataStore()
        }
    })
})

