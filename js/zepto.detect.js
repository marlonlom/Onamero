(function (e) {
    function t(e) {
        var t = document.createElement("input");
        t.setAttribute("type", e);
        return t.type !== "text"
    }
    e.extend(e, {
        detect: {
            audio: !! document.createElement("audio").canPlayType,
            canvas: !! document.createElement("canvas").getContext,
            command: "type" in document.createElement("command"),
            time: "valueAsDate" in document.createElement("time"),
            video: !! document.createElement("video").canPlayType,
            offline: navigator.hasOwnProperty("onLine") && navigator.onLine,
            appCache: !! window.applicationCache,
            contentEditable: "isContentEditable" in document.createElement("span"),
            dragDrop: "draggable" in document.createElement("span"),
            geolocation: !! navigator.geolocation,
            history: !! (window.history && window.history.pushState),
            webSockets: !! window.WebSocket,
            webWorkers: !! window.Worker,
            autofocus: "autofocus" in document.createElement("input"),
            inputPlaceholder: "placeholder" in document.createElement("input"),
            textareaPlaceholder: "placeholder" in document.createElement("textarea"),
            inputTypeEmail: t("email"),
            inputTypeNumber: t("number"),
            inputTypeSearch: t("search"),
            inputTypeTel: t("tel"),
            inputTypeUrl: t("url"),
            indexDB: !! window.indexedDB,
            localStorage: "localStorage" in window && window["localStorage"] !== null,
            webSQL: !! window.openDatabase,
            orientation: "orientation" in window,
            touch: "ontouchend" in document,
            scrollTop: ("pageXOffset" in window || "scrollTop" in document.documentElement) && !e.os.webos,
            standalone: "standalone" in window.navigator && window.navigator.standalone
        }
    });
    e.extend(e, {
        device: {
            mobile: screen.width < 768,
            tablet: screen.width >= 768 && e.detect.orientation,
            desktop: screen.width >= 800 && !e.detect.orientation
        }
    })
})(Zepto)