if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
         //register service worker
        navigator.serviceWorker
        .register("/public/sw.js")
        .then((reg) => {
            //display success message
            console.log(`Service Worker Registration (Scope: ${reg.scope}`);
        })
        .catch((error) => {
            //display error
            console.log(`Service Worker Error (${error})`);
        });
    })
   
    } else {
        //if connection is not HTTPS or browser does not support service worker
        console.log("Service worker not Available");
    }