const {db} = require ("../db.js");
const {global} = require ("../global.js");
var assert = require('assert');


//Elimina un address dall'elenco dei ThinMan (info in agileAddress)
describe("Delete agile address", function(){

    //Controlla che ci sia un indirizzo con l'hostname dato
    it("Check if there is an address with the given hostname in the db", async () => {
        const address = await db.getThinManFromHostname(global.agileAddress.address);
        assert.ok(address, "there isn't any address with the given hostname");
    })

    //Va nella sezione ThinMan Setting
    it("Navigates to ThinMan Settings", async () => {
        const click = await global.app.client.click('#menu-link-3');
        global.app.client.waitUntilWindowLoaded();
        assert.ok(click);
    })
    

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
            if(x == "<div><b>"+indirizzo+":</b> "+ global.agileAddress.address +"</div>"){
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
            if(x == "<div><b>"+indirizzo+":</b> "+ global.agileAddress.address +"</div>"){
                //aggiorno found
                found = true;
            }
        } 
        assert.ok(!found, "l'elemento si trova ancora nella lista")
    })
    //Controlla che non ci sia più l'indirizzo con l'hostname dato nel database
    it("Check if the address is not in the db anymore", async () => {
        const address = await db.getThinManFromHostname(global.agileAddress.address);
        assert.ok(address==null, "the address with the given hostname is still in the database");
    })

})
