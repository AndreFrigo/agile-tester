const global={
    //app di agile
    app: null,

    // Italiano:1, Inglese:2, Spagnolo:3
    language: null,

    //dati per la creazione di un nuovo indirizzo agile (test: addThinManAddress)
    agileAddress: {address: "agile_test", timeout: 23, port: 378},

    //dati per creazione USB redirection (test: addUsbRedirection)
    agileUSB: {description: "agile_usb_test", vid: 2323, pid: 3232}
}
module.exports = {global};