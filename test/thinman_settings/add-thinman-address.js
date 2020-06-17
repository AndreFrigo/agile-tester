const {db} = require ("../db.js");
const {global} = require ("../global.js");
var assert = require('assert');


//Aggiunge un address all'elenco dei ThinMan (info in agileAddress)
describe("Add a new address of ThinMan", function(){
    //Va nella sezione ThinMan Setting
    it("Navigates to ThinMan Settings", async () => {
        const click = await global.app.client.click('#menu-link-3');
        global.app.client.waitUntilWindowLoaded();
        assert.ok(click, "error while opening the thinman settings menù");
    })
    //Preme su add address
    it("Press Add Address", async () => {
        const addAddress = global.app.client.$('h5 > a');
        const click = await addAddress.click();
        global.app.client.waitUntilWindowLoaded();
        assert.ok(click, "error while clicking the button");
    })
    //inserisce l'hostname settato in agileAddress
    it("Insert hostname", async () => { 
        const hostname = global.app.client.$("#new-address");
        hostname.setValue(global.agileAddress.address);
        hostname.getValue().then(function(v){
            assert.equal(global.agileAddress.address, v, "error while inserting the hostname");
        })
    })
    //inserisce la porta settata in agileAddress
    it("Insert port", async () => {
        const port = global.app.client.$("#new-port");
        port.click();
        port.clearElement();
        //TODO: need to insert a pause
        port.setValue(global.agileAddress.port);
        port.getValue().then(function(v){
            assert.equal(v, global.agileAddress.port, "error while inserting the port");
        })
    })
    //inserisce il timeout settato in agileAddress
    it("Insert timeout", async () => {
        const timeout = global.app.client.$("#new-timeout");
        timeout.click();
        timeout.clearElement();
        //TODO: need to insert a pause
        timeout.setValue(global.agileAddress.timeout);
        timeout.getValue().then(function(v){
            assert.equal(v, global.agileAddress.timeout, "error while inserting the timeout");
        })
    })
    //preme ok creando così il nuovo indirizzo
    it("Create the new address", async () => {
        const ok = global.app.client.$("#main-div > div.main-content > main > section > div > div > div.modal-footer > div.buttons > a");
        const click = await ok.click();
        assert.ok(click, "error while clicking the button");
    })
    //controlla se l'indirizzo è stato inserito nel db 
    it("Check if the new address is in the db ", async () => {
        //indirizzo con lo stesso hostname di quello desiderato
        const address = await db.getThinManFromHostname(global.agileAddress.address);
        if(address){
            if(address.port == global.agileAddress.port && address.timeout == global.agileAddress.timeout){
                assert.ok(true,"the new address has not been created successfully");
            }else{
                assert.ok(false, "port or timeout are different from the given values")
            }
        }else{
            assert.ok(false, "can't find an address with the given hostname")
        }
    })

    //controlla se l'indirizzo è ora presente nella lista di agile
    it("Check if the new address is in the list of agile", async () => {
        //numero di address agile 
        const length = await db.getThinManListLength();

        var thinman = global.app.client.$("#main-div > div.main-content > main > section > div > ul > li > div.collapsible-body > div.row > div.col.s12 > ul");
        var child = null;
        //indica se ho trovato un'address con quell'hostname
        var found = null;
        for(i=1;i<=length;i++){
            //cerco l'address
            child = thinman.$("li:nth-child("+i+") > div > div");
            //string per html che dipende dalla lingua in uso
            var indirizzo = null;
            if(global.language == 1) indirizzo = "Indirizzo"
            else if(global.language == 2) indirizzo = "Address"
            else if(global.language == 3) indirizzo = "Dirección"
            //guardo se gli address corrispondono
            const x = await child.$("div.address-info > div").getHTML();
            if(x == "<div><b>"+indirizzo+":</b> "+ global.agileAddress.address +"</div>"){
                //aggiorno found
                found = true;
            }
        } 
        assert.ok(found, "l'elemento non si trova ancora nella lista")
    })
})
