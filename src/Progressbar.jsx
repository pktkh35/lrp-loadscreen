import { useEffect, useState } from "react"

const Progressbar = () => {
    const types = [
        "INIT_CORE",
        "INIT_BEFORE_MAP_LOADED",
        "INIT_AFTER_MAP_LOADED",
        "INIT_SESSION"
    ];
    const progressBars = {
        "INIT_CORE": {
            enabled: false, //NOTE: Disabled because INIT_CORE seems to not get called properly. (race condition).
        },

        "INIT_BEFORE_MAP_LOADED": {
            enabled: true,
        },

        "MAP": {
            enabled: false,
        },

        "INIT_AFTER_MAP_LOADED": {
            enabled: true,
        },

        "INIT_SESSION": {
            enabled: true,
        }
    }
    const [states, setStates] = useState({});
    const [progressbar, setProgressbar] = useState(0);

    useEffect(() => {
        window.progressCache = window.progressCache || 0;
        window.progressthisCount = window.progressthisCount || 0;

        const handlers = {
            startInitFunctionOrder(data) {
                window.progressCache = data.count
            },

            initFunctionInvoking(data) {
                document.querySelector('.progressbar .bar').style.left = '0%';
                document.querySelector('.progressbar .bar').style.width = ((data.idx / window.progressCache) * 100) + '%';
            },

            startDataFileEntries(data) {
                window.progressCache = data.count;
            },

            performMapLoadFunction(data) {
                ++window.progressthisCount;

                document.querySelector('.progressbar .bar').style.left = '0%';
                document.querySelector('.progressbar .bar').style.width = ((window.progressthisCount / window.progressCache) * 100) + '%';
            },
        };

        const onMessage = e => {
            (handlers[e.data.eventName] || function () { })(e.data);
        }

        window.addEventListener("message", onMessage)
        return () => {
            window.removeEventListener("message", onMessage)
        }
    }, [progressbar, setProgressbar, states, setStates])

    return <div className="progressbar">
        <div className="bar"></div>
    </div>
}

export default Progressbar