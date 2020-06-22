const {db} = require ("../db.js");
const {global} = require ("../global.js");
var assert = require('assert');

function addThinmanAddress(address, port, timeout){
    
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

        //inserisce l'hostname 
        it("Insert hostname", async () => { 
            const hostname = global.app.client.$("#new-address");
            hostname.setValue(address);
            hostname.getValue().then(function(v){
                assert.equal(address, v, "error while inserting the hostname");
            })
        })

        //inserisce la porta 
        it("Insert port", async () => {
            const p = global.app.client.$("#new-port");
            p.click();
            var done = false;
            done = async () => {
                const x = new Promise(function(resolve, reject){
                    p.clearElement();
                    resolve(true);
                })
                return x;
            }
            while (!done){

            }
            p.setValue(port);
            p.getValue().then(function(v){
                assert.equal(v, port, "error while inserting the port");
            })
        })

        //inserisce il timeout
        it("Insert timeout", async () => {
            const t = global.app.client.$("#new-timeout");
            t.click();
            var done = false;
            done = async () => {
                const x = new Promise(function(resolve, reject){
                    t.clearElement();
                    resolve(true);
                })
                return x;
            }
            while (!done){
                
            }
            t.setValue(timeout);
            t.getValue().then(function(v){
                assert.equal(v, timeout, "error while inserting the timeout");
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
            const a = await db.getThinManFromHostname(address);
            if(a){
                if(a.port == port && a.timeout == timeout){
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
                if(x == "<div><b>"+indirizzo+":</b> "+ address +"</div>"){
                    //aggiorno found
                    found = true;
                }
            } 
            assert.ok(found, "l'elemento non si trova ancora nella lista")
        })
    })
}

function deleteThinmanAddress(address){
    //Elimina un address dall'elenco dei ThinMan
    describe("Delete agile address", function(){

        //Controlla che ci sia un indirizzo con l'hostname dato
        it("Check if there is an address with the given hostname in the db", async () => {
            const a = await db.getThinManFromHostname(address);
            assert.ok(a, "there isn't any address with the given hostname");
        })

        //Va nella sezione ThinMan Setting
        it("Navigates to ThinMan Settings", async () => {
            const click = await global.app.client.click('#menu-link-3');
            global.app.client.waitUntilWindowLoaded();
            assert.ok(click);
        })
        
        //Elimina l'address
        it("Delete the selected address", async () => {
            //numero di address agile 
            const length = await db.getThinManListLength();

            var thinman = global.app.client.$("#main-div > div.main-content > main > section > div > ul > li > div.collapsible-body > div.row > div.col.s12 > ul");
            var child = null;
            //selector per il bottone da premere
            var elimina = null;
            for(i=1;i<=length;i++){
                //cerco l'address che voglio eliminare
                child = thinman.$("li:nth-child("+i+") > div > div");
                //string per html che dipende dalla lingua in uso
                var indirizzo = null;
                if(global.language == 1) indirizzo = "Indirizzo"
                else if(global.language == 2) indirizzo = "Address"
                else if(global.language == 3) indirizzo = "Dirección"
                //guardo se gli address corrispondono
                const x = await child.$("div.address-info > div").getHTML();
                if(x == "<div><b>"+indirizzo+":</b> "+ address +"</div>"){
                    //salvo elemento da eliminare per eliminarlo in seguito
                    elimina = "#main-div > div.main-content > main > section > div > ul > li > div.collapsible-body > div.row > div.col.s12 > ul > li:nth-child("+i+") > div > div > div.address-item-delete > i";
                }
            } 
            //bottone da premere per eliminare l'elemento
            const elim = await global.app.client.$(elimina).click();
            assert.ok(elim);
        })

        //Controlla che non ci sia più l'indirizzo con l'hostname dato
        it("Check if the address is not in the list of address anymore", async () => {
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
                if(x == "<div><b>"+indirizzo+":</b> "+ address +"</div>"){
                    //aggiorno found
                    found = true;
                }
            } 
            assert.ok(!found, "l'elemento si trova ancora nella lista")
        })

        //Controlla che non ci sia più l'indirizzo con l'hostname dato nel database
        it("Check if the address is not in the db anymore", async () => {
            const a = await db.getThinManFromHostname(address);
            assert.ok(a==null, "the address with the given hostname is still in the database");
        })

    })
}


module.exports = {
    addThinmanAddress: addThinmanAddress,
    deleteThinmanAddress: deleteThinmanAddress
}