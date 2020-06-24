const {db} = require ("../db.js");
const {global} = require ("../global.js");
const { expect } = require("chai");


//ritorna null se non ha potuto confermare, altrimenti not null
const checkAddress = async function(address, port, timeout){

    //va in thinman settings
    const menu = global.app.client.$('#menu-link-3');
    var click = null;
    try{
        click = await menu.click();
    }catch{
    }
    global.app.client.waitUntilWindowLoaded();


    await global.sleep(1000)


    //preme su add address
    const addAddress = global.app.client.$('h5 > a');
    var click = null;
    try{
        click = await addAddress.click();
    }catch{
    }
    global.app.client.waitUntilWindowLoaded();


    await global.sleep(1000)


    //inserisce l'hostname
    const hostname = global.app.client.$("#new-address");
    try{
        hostname.click();
        var x = await hostname.setValue(address);
        while(!x){
            
        }
    }catch{
    }


    await global.sleep(1500)


    //inserisce la porta
    const p = global.app.client.$("#new-port");
    
    try{
        p.click();
        
        if(port == ""){
            //cancellazione manuale, con clearElement non funziona in questo caso
            var r = false
            r = await new Promise(function (resolve, reject){
                p.getValue().then(function(result){
                    for(i=0;i<result.length;i++){	
                        global.app.client.keys("Backspace");	
                    }
                    resolve(true)
                })
            }) 
            while(!r){

            }
        }else{
            x = false
            x = await p.setValue(port)
            while(!x){

            }
        }
    }catch{

    }


    await global.sleep(1500)


    //inserisce il timeout
    const t = global.app.client.$("#new-timeout");

    try{
        t.click();
        //TODO: condizione particolare, sarebbe da evitare 
        if(timeout == "" || isNaN(timeout)){
            //cancellazione manuale, con clearElement non funziona in questo caso
            var r = false
            r = await new Promise(function (resolve, reject){
                t.getValue().then(function(result){
                    for(i=0;i<result.length;i++){	
                        global.app.client.keys("Backspace");	
                    }
                    resolve(true)
                })
            }) 
            while(!r){

            }
        }else{
            x = false
            x = await t.setValue(timeout)
            while(!x){

            }
        }
    }catch{
        
    }


    await global.sleep(2000)


    const confirm = global.app.client.$("#main-div > div.main-content > main > section > div > div > div.modal-footer > div.buttons > a:nth-child(1)");
    var ret = null;
    try{
        ret = await confirm.click();
    }catch{
        ret = null
    }
    if(ret == null){
        //preme su annulla
        try{
            await global.app.client.$("#main-div > div.main-content > main > section > div > div > div.modal-footer > div.buttons > a:nth-child(2)").click()
        }catch{
        }
    }
    return ret
}

function addThinmanAddress(){
    
    //Aggiunge un address all'elenco dei ThinMan (info in agileAddress)
    describe("Add a new address of ThinMan", function(){

        before(async function(){
            await global.app.start()
        })
        after(async function(){
            await global.app.stop()
        })

        this.timeout(30000)

        describe("Database tests", function(){

            before(async function(){    
                //Aggiungi un thinman nel db
                db.conn.select(1)
                db.conn.set("thinman", "{\"enabled\":true,\"dhcp_opt\":163,\"address\":[{\"address\":\"prova_thinman\",\"port\":443,\"timeout\":15}],\"automatic_port\":true,\"listening_port\":443,\"fallback\":\"use_device\",\"passthrough\":false}")
            }) 

            it("should return true if the address is in the database", async () => {
                var found = false
                const elem = await db.getThinManFromHostname("prova_thinman")
                if(elem.address == "prova_thinman" && elem.port == 443 && elem.timeout == 15){
                    found = true
                }
                expect(found).to.be.true
            })

            it("should return null if there is already an address with the same hostname", async () => {
                expect(await checkAddress("prova_thinman", 443, 15)).to.be.null
            })

            it("should return true if the thinman address is in the list", async () => {

                //va in thinman settings
                const menu = global.app.client.$('#menu-link-3');
                var click = null;
                try{
                    click = await menu.click();
                }catch{
                }
                global.app.client.waitUntilWindowLoaded();


                await global.sleep(1000)


                //aggiorno lingua da database
                global.language = await db.dbLanguage()
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
                    var x = null;
                    try{
                        x = await child.$("div.address-info > div").getHTML();
                    }catch{
                    }
                    if(x == "<div><b>"+indirizzo+":</b> "+ "prova_thinman" +"</div>"){
                        //aggiorno found
                        found = true;
                    }
                } 
                expect(found).to.be.true
            })
        })

        describe("Add thinman address tests", async () => {
            const wrongValues = [
                {address:"", port:123, timeout:123},
                {address:"prova", port:"", timeout:123},
                {address:"aaaaaa", port:123, timeout:""},
                {address:"sss", port:"aaa", timeout:123},
                {address:"ddd", port:"1.5", timeout:1000},
                {address:"fff", port:335, timeout:"abc"},
                {address:"1234", port:"1a1", timeout:123},
                {address:"ggg", port:123, timeout:0}
            ]
            wrongValues.forEach(elem => {
                it("should return null for invalid address, port or timeout", async () => {
                    expect(await checkAddress(elem.address, elem.port, elem.timeout)).to.be.null
                })
            })

            const rightValues = [
                {address:"test", port:123, timeout:123}
            ]
            rightValues.forEach(elem => {
                it("should return not null if the address has been added", async () => {
                    expect(await checkAddress(elem.address, elem.port, elem.timeout)).to.not.be.null
                })
            })
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
            const menu = global.app.client.$('#menu-link-3');
            var click = null;
            try{
                click = await menu.click();
            }catch{
                assert.ok(false, "Impossible to find the thinman settings link")
            }
            global.app.client.waitUntilWindowLoaded();
            assert.ok(click, "error while opening the thinman settings menù");
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
                var x = null;
                try{
                    x = await child.$("div.address-info > div").getHTML();
                }catch{
                    assert.ok(false, "Impossible to find the list element")
                }
                if(x == "<div><b>"+indirizzo+":</b> "+ address +"</div>"){
                    //salvo elemento da eliminare per eliminarlo in seguito
                    elimina = "#main-div > div.main-content > main > section > div > ul > li > div.collapsible-body > div.row > div.col.s12 > ul > li:nth-child("+i+") > div > div > div.address-item-delete > i";
                }
            } 
            //bottone da premere per eliminare l'elemento
            var elim = null;
            try{
                elim = await global.app.client.$(elimina).click();
            }catch{
                assert.ok(false, "Impossible to click the delete button")
            }
            assert.ok(elim, "Impossible to delete the element");
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
                var x = null;
                try{
                    x = await child.$("div.address-info > div").getHTML();
                }catch{
                    assert.ok(false, "Impossible to find the list element")
                }
                if(x == "<div><b>"+indirizzo+":</b> "+ address +"</div>"){
                    //aggiorno found
                    found = true;
                }
            } 
            assert.ok(!found, "The element is in the list")
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