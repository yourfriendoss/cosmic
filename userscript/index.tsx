import * as React from 'preact';

import { BrowserLogger } from "./BrowserLogger";

import { install } from '@twind/core'
import config from '../twind.config.js'

install(config)

function dragElement(elmnt: HTMLElement) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    if (document.getElementById(elmnt.id + "-header")) {
        document.getElementById(elmnt.id + "-header")!.onmousedown = dragMouseDown;
    } else {
        elmnt.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e: MouseEvent) {
        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e: MouseEvent) {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

window.addEventListener('load', evt => {
    const LOGGER = new BrowserLogger('CosmicUI');

    const App = () => {
        let response = "Unknown.";
        if(ws.readyState == ws.OPEN) {
            response = "Connected.";
        } else if(ws.readyState == ws.CLOSED) {
            response = "Closed."
        } else if(ws.readyState == ws.CONNECTING) {
            response = "Attempting to connect."
        }

        return (
            <>
                <div class="text-[20px] bg-[#00000055] rounded p-[5px] max-w-[200px]">
                    <div class="min-w-[100px] bg-slate-300 rounded p-[5px]" id="cosmic-window-header">Cosmic</div>
                    <h1>Websocket status: {response}</h1>
                </div>
            </>
        )
    }

    let serverUri = localStorage.getItem('cosmic_uri');

    if (!serverUri) {
        serverUri = 'wss://cosmic.141.lv';
    }

    const ws = new WebSocket(serverUri);

    ws.addEventListener("open", () => {
        ws.send(JSON.stringify({
            m: "hi"
        }))
    })

    // tailwind fucks with some of MPP's styles so here we fix them :+1:
    const fixTwind = document.createElement("style");
    fixTwind.innerHTML = `.ugly-button {
        height: auto !important;
    }
    #room {
        height: 20px !important;
    }`
    document.body.prepend(fixTwind);

    const rootDiv = document.createElement("div");
    rootDiv.id = "cosmic-window"
    rootDiv.style.zIndex = "999";
    rootDiv.style.position = "absolute";
    rootDiv.style.top = ""+window.innerHeight/2;
    rootDiv.style.left = ""+window.innerWidth/2;

    document.body.prepend(rootDiv);

    function renderReact() {
        React.render(<App />, rootDiv);
        window.requestAnimationFrame(renderReact)
    }
    window.requestAnimationFrame(renderReact)

    dragElement(rootDiv);

    LOGGER.log('CosmicUI Loaded');
});
