const ADD_CONNECTION_SERVER = "#add-connection-server"

module.exports = {
    about: {
       menuID: "#menu-link-0"
    },
    systemSettings:{
        menuID: "#menu-link-1",
        language:{
            //link for LANGUAGE
            languageTab: "#language-tab.tab > a",
            //label corresponding to the index (es. Agile language, Keyboard layout)
            label: (index) => {return "#language > span > div:nth-child(" + index + ") > span"},
            //dropdown corrisponding to the index (es. dropdown for Agile language)
            dropdown: (index) => {return "#language > span > div:nth-child(" + index + ") > div > div > input.select-dropdown"}
        },
        sound:{
            //link for SOUND
            soundTab: "#sound-tab.tab > a",
            //range for output volume
            outputVolume: "#outputVolume",
            //span where to read the output volume level after setting it
            outputLevel: "#sound > span > div > p > span > span"
        }
    },
    networkSettings:{
        menuID: "#menu-link-2",
        wifi:{
            //link for WIFI
            wifiTab: "#ab > a",
            //list of wifi saved
            list: "#wifiTab > div > div > div.section-wrapper.scrollable > div",
            //div containing ssid of a wifi of the list 
            ssid: (index) => {return this.networkSettings.wifi + " > div:nth-child(" + index + ") > div > div.block-item-properties-wrapper > div"},
            addWifi: {
                //button ADD WIFI NETWORK
                button: "#wifiTab > div > div > div.header-inputs > a",
                //select network dropdown
                selectNetwork: "#wifi",
                //password text field
                password: "#add-connection-modal > div > div.modal-content > div > div > div.row:nth-child(4) > div > div > input",
                //button OK to confirm
                ok: "#add-connection-modal > div > div.modal-footer > div > a:nth-child(1)"
            }
        }
    },
    thinmanSettings:{
        menuID: "#menu-link-3",
        //list of thinman saved
        list: "#main-div > div.main-content > main > section > div > ul > li > div.collapsible-body > div.row > div.col.s12 > ul",
        //div containing address of a thinman in the list
        address: (index) => {return this.thinmanSettings.list + " > li:nth-child(" + index + ") > div > div > div.address-info > div"},
        //button for deleting a thinman of the list
        delete: (index) => {return this.thinmanSettings.list + " > li:nth-child(" + index + ") > div > div > div.address-item-delete > i"},
        //button for testing a thinman of the list
        test: (index) => {return this.thinmanSettings.list + " > li:nth-child(" + index + ") > div > div > div:nth-child(2) > a"},
        addAddress:{
            //button ADD ADDRESS
            button: "h5 > a",
            //text field for hostname or ip address
            hostname: "#new-address",
            //text field for port
            port: "#new-port",
            //text field for timeout 
            timeout: "#new-timeout",
            //button ok to confirm
            ok: "#main-div > div.main-content > main > section > div > div > div.modal-footer > div.buttons > a:nth-child(1)"
        }
    },
    remoteAssistance:{
        menuID: "#menu-link-4",
        //checkbox for enabling remote assistance
        enable: "#enable-remote-assistance",
        //label to click for enabling remote assistance
        labelEnable: "#main-div > div.main-content > main > section > div > div.row > div > label",
        //checkbox for showing notifiction icon
        showNotificationIcon: "#show-icon",
        //label to click for showing notifiction icon
        labelShowNotificationIcon: "#main-div > div.main-content > main > section > div > div.row:nth-child(2) > div > div.row > div > div > label",
        //checkbox for requiring user authorization
        requireAuthorization: "#allow-reject",
        //label to click for requiring user authorization
        labelRequireAuthorization: "#main-div > div.main-content > main > section > div > div.row:nth-child(2) > div > div.row:nth-child(2) > div > div > label",
        //checkbox for enabling auto-accept
        autoAccept: "#check-auto-accept",
        //label to click for enabling auto-accept
        labelAutoAccept: "#main-div > div.main-content > main > section > div > div.row:nth-child(2) > div > div.row:nth-child(2) > div > div.col > div > label",
        //text field for auto-accept time
        timeAutoAccept: "#auto-accept"
    },
    writeFilter:{
        menuID: "#menu-link-5"
    },
    resources:{
        menuID: "#menu-link-6",
        //div containing name of a resource of the list
        name: (index) => {return "#connection" + index + " > div > div.connection-item-properties > div > div"},
        //div to click for accessing the resource (for testing it)
        element: (index) => {return "#connection" + index + " > div > div.connection-item-properties > div > div"},
        //button for testing a resource (already opened) in the list
        test: (index) => {return "#connection" + index + " > div.connection-modal > div.connection-footer > span > a.test-connection"},
        //button to click for deleting a resource of the list
        delete: (index) => {return "#connection" + index + " > div > div.block-item-delete > i"},
        //button to click to confirm the delete
        confirmDelete: (index) => {return "#connection" + index + " > div.connection-modal > div.connection-footer > a:nth-child(2)"},
        addResource:{
            //button ADD RESOURCE
            button: "#main-div > div.main-content > main > section > div > div.fixed-header > div > a",
            //text field for any resource name
            name: "#add-connection-name",
            citrix:{
                //label to click for selecting citrix
                label: "#add-connection-modal > div.custom-modal.open > div.modal-content > div > div > div.row > div.col.s12 > div.connection-col > div:nth-child(1) > label",
                //text field for server
                server: ADD_CONNECTION_SERVER,
                //text field for domain
                domain: "#add-connection-domain",
                //button ok to confirm
                ok: "#add-connection-modal > div > div.modal-footer > div > a:nth-child(1)"
            },
            microsoft:{
                //label to click for selecting microsoft
                label: "#add-connection-modal > div.custom-modal.open > div.modal-content > div > div > div.row > div.col.s12 > div.connection-col > div:nth-child(2) > label",
                //button to click to open the file chooser
                file: "#add-connection-modal > div > div.modal-content > div > div > div.row:nth-child(5) > div > div > div > div.waves-effect.btn > span",
                //button ok to confirm
                ok: "#add-connection-modal > div > div.modal-footer > div > a:nth-child(1)"
            },
            vmware:{
                //label to click for selecting vmware
                label: "#add-connection-modal > div.custom-modal.open > div.modal-content > div > div > div.row > div.col.s12 > div.connection-col > div:nth-child(3) > label",
                //text field for server
                server: ADD_CONNECTION_SERVER,
                //button ok to confirm
                ok: "#add-connection-modal > div > div.modal-footer > div > a:nth-child(1)"
            },
            localBrowser:{
                //label to click for selecting local browser
                label: "#add-connection-modal > div.custom-modal.open > div.modal-content > div > div > div.row > div.col.s12 > div.connection-col > div:nth-child(4) > label",
                //text field for server
                server: ADD_CONNECTION_SERVER,
                //button ok to confirm
                ok: "#add-connection-modal.form > div.custom-modal.open > div.modal-footer > div.buttons > a:nth-child(1)"
            },
            localApplication:{
                //label to click for selecting local application
                label: "#add-connection-modal > div.custom-modal.open > div.modal-content > div > div > div.row > div.col.s12 > div.connection-col > div:nth-child(5) > label",
                //button to click to open the file chooser
                file: "#add-connection-modal > div > div.modal-content > div > div > div.row:nth-child(4) > div > div > div > div.waves-effect.btn > span",
                //button ok to confirm
                ok: "#add-connection-modal > div > div.modal-footer > div > a:nth-child(1)"
            }
        }
    },
    startup:{
        menuID: "#menu-link-7",
        //div containing all the properties of a single startup
        properties: (index) => {return "#connection" + index + " > div > div.autorun-item-properties > div.autorun-item-properties-wrapper"},
        //div containing the startup name
        name: (index) => {return this.startup.properties(index) + " > div"},
        //span containing the startup command
        name: (index) => {return this.startup.properties(index) + " > p > span"},
        addStartup:{
            //button ADD STARTUP
            button: "#main-div > div.main-content > main > section > div > div.fixed-header > div > a",
            //text field for inserting name
            name: "#name",
            //text field for inserting command
            command: "#command",
            //button ok to confirm
            ok: "#add-connection-modal.form > div.custom-modal.open > div.modal-footer > div.buttons > a:nth-child(1)"
        }
    },
    certificateManager:{
        menuID: "#menu-link-8",
        //button IMPORT CERTIFICATE
        importCertificate: "#main-div > div.main-content > main > section > div.fixed-header > div > div > div.waves-effect.btn-flat > span > i"
    },
    usbRedirection:{
        menuID: "#menu-link-10",
        //list of rules
        list: "#citrix > div > div.usbredir-list > div",
        //p where there are vid and pid of a rule of the list
        vidPid: (index) => {return this.usbRedirection.list + " > div:nth-child(" + index + ") > div > div.usbredir-item-properties > div > p"},
        //button to click for deleting a rule of the list
        delete: (index) => {return this.usbRedirection.list + " > div:nth-child(" + index + ") > div > div.usbredir-item-delete > i"},
        addRule:{
            //button ADD REDIRECTION RULE
            button: "#citrix > div > div > div > a",
            //text field for description
            description: "#description",
            //text field for vid
            vid: "#vid",
            //text field for pid
            pid: "#pid",
            //button ok to confirm
            ok: "#add-usb-rule-modal > div.custom-modal.open > div.modal-footer > div.buttons > a:nth-child(1)"
        }
    },
    deviceLock:{
        menuID: "#menu-link-11",
        //list of devices
        list: "#main-div > div.main-content > main > section > div.section-wrapper > div.usbredir-list > div",
        //div containing the vid and pid of a device of the list
        vidPid: (index) => {return this.deviceLock.list + " > div:nth-child(" + index + ") > div > div.usbredir-item-properties > div > div"},
        //button to click for deleting a device of the list
        delete: (index) => {return this.deviceLock.list + " > div:nth-child(" + index + ") > div > div.usbredir-item-delete > i"},
        addRule:{
            //button ADD RULE
            button:"#main-div > div.main-content > main > section > div.fixed-header > div > div > a",
            //text field for vid
            vid: "#vid",
            //text field for pid
            pid: "#pid",
            //button ok to confirm
            ok: "#add-usb-rule-modal > div > div.modal-footer > div > a:nth-child(1)"
        }
    },
    agileAuthentication:{
        menuID: "#menu-link-12",
        //dropdown for authentication type (imprivata, wifi, thinman smart identity) with data-activates attribute 
        dropdown: "#main-div > div.main-content > main > section > div > div > div.input-field > div > input",
        wifi:{
            //dropdown for choosing which wifi to use
            dropdown: "#wifi",
            //dropdown for choosing authentication
            authentication: "#main-div > div > main > section > div > ul > li > div.collapsible-body > div.row:nth-child(2) > div > div > input",
            //filed containing password and class has-error or not
            passwordField: "#main-div > div > main > section > div > ul > li > div.collapsible-body > div.row:nth-child(4) > div > div",
            //password input
            passwordInput: this.passwordField + " > input"
        },
        imprivata:{
            //server address
            address: "#addres",
            //checkbox for ignoring ssl errors
            ignoreSsl: "#ignoreSSL",
            //label to click for ignoring ssl errors
            labelIgnoreSsl: "#main-div > div.main-content > main > section > div > ul > li > div.collapsible-body > div.row.align-children.top-element > div.col.s4 > div > label",
            //button TEST CONNECTION
            test: "#main-div > div.main-content > main > section > div > ul > li > div.collapsible-body > div:nth-child(4) > div:nth-child(1) > a"
        }

    },
    mode:{
        menuID: "#menu-link-13"
    },
    //label with the title of a notification (success, warning, error)
    notification: "#main-div > div:nth-child(3) > span > div.notification > div.header > p.title"
}