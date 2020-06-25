const {db} = require ("../db.js");
const {global} = require ("../global.js");
const { expect } = require("chai");


//ritorna null se non ha potuto confermare, altrimenti not null
const addAddress = async function(address, port, timeout){

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
    const add = global.app.client.$('h5 > a');
    var click = null;
    try{
        click = await add.click();
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

//return not null se ha premuto sul bottone elimina
const deleteAddress = async function(address){

    //va in thinman settings
    const menu = global.app.client.$('#menu-link-3');
    var click = null;
    try{
        click = await menu.click();
    }catch{
    }
    global.app.client.waitUntilWindowLoaded();


    await global.sleep(1000)


    //numero di address agile 
    const length = await db.getThinManListLength();
    var thinman = "#main-div > div.main-content > main > section > div > ul > li > div.collapsible-body > div.row > div.col.s12 > ul"
    var child = null;
    //selector per il bottone da premere
    var elimina = null;
    //aggiorno lingua
    global.language = await db.dbLanguage()
    //string per html che dipende dalla lingua in uso
    var indirizzo = null;
    if(global.language == 1) indirizzo = "Indirizzo"
    else if(global.language == 2) indirizzo = "Address"
    else if(global.language == 3) indirizzo = "Dirección"
    
    for(i=1;i<=length;i++){
        //cerco l'address che voglio eliminare
        child = thinman + " > li:nth-child("+i+") > div > div"
        //guardo se gli address corrispondono
        var x = null;
        try{
            x = await global.app.client.$(child + " > div.address-info > div").getHTML();
        }catch{
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
        elim = null
    }
    return elim
}

//return true se non c'è un address con l'hostname dato, altrimenti false
const checkDelete = async function(address){

    //va in thinman settings
    const menu = global.app.client.$('#menu-link-3');
    var click = null;
    try{
        click = await menu.click();
    }catch{
    }
    global.app.client.waitUntilWindowLoaded();


    await global.sleep(1000)


    //numero di address agile 
    const length = await db.getThinManListLength();

    var thinman = "#main-div > div.main-content > main > section > div > ul > li > div.collapsible-body > div.row > div.col.s12 > ul"
    var child = null;
    //indica se ho trovato un'address con quell'hostname
    var found = null;
    //aggiorno lingua
    global.language = await db.dbLanguage()
    //string per html che dipende dalla lingua in uso
    var indirizzo = null;
    if(global.language == 1) indirizzo = "Indirizzo"
    else if(global.language == 2) indirizzo = "Address"
    else if(global.language == 3) indirizzo = "Dirección"

    for(i=1;i<=length;i++){
        //cerco l'address
        child = thinman + " > li:nth-child("+i+") > div > div"
        //guardo se gli address corrispondono
        var x = null;
        try{
            x = await global.app.client.$(child + " > div.address-info > div").getHTML();
        }catch{
        }
        if(x == "<div><b>"+indirizzo+":</b> "+ address +"</div>"){
            //aggiorno found
            found = true;
        }
    } 
    return !found
}




function addThinmanAddress(){
    
    //Aggiunge un address all'elenco dei ThinMan (info in agileAddress)
    describe("Add a new address of ThinMan", function(){

        before(async function(){
            await global.app.start()
        })
        before(async function(){    
            //Aggiungi un thinman nel db
            db.conn.select(1)
            db.conn.set("thinman", "{\"enabled\":true,\"dhcp_opt\":163,\"address\":[{\"address\":\"prova_thinman\",\"port\":443,\"timeout\":15}],\"automatic_port\":true,\"listening_port\":443,\"fallback\":\"use_device\",\"passthrough\":false}")
        }) 
        after(async function(){
            await global.app.stop()
        })

        this.timeout(30000)

        describe("Database tests", function(){

            it("should return true if the address is in the database", async () => {
                var found = false
                const elem = await db.getThinManFromHostname("prova_thinman")
                if(elem.address == "prova_thinman" && elem.port == 443 && elem.timeout == 15){
                    found = true
                }
                expect(found).to.be.true
            })

            it("should return null if there is already an address with the same hostname", async () => {
                expect(await addAddress("prova_thinman", 443, 15)).to.be.null
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

                var thinman = "#main-div > div.main-content > main > section > div > ul > li > div.collapsible-body > div.row > div.col.s12 > ul"
                var child = null;
                //indica se ho trovato un'address con quell'hostname
                var found = null;
                //aggiorno lingua
                global.language = await db.dbLanguage()
                //string per html che dipende dalla lingua in uso
                var indirizzo = null;
                if(global.language == 1) indirizzo = "Indirizzo"
                else if(global.language == 2) indirizzo = "Address"
                else if(global.language == 3) indirizzo = "Dirección"

                for(i=1;i<=length;i++){
                    //cerco l'address
                    child = thinman + " > li:nth-child("+i+") > div > div"
                    //guardo se gli address corrispondono
                    var x = null;
                    try{
                        x = await global.app.client.$(child + " > div.address-info > div").getHTML();
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
                    expect(await addAddress(elem.address, elem.port, elem.timeout)).to.be.null
                })
            })

            const rightValues = [
                {address:"test", port:123, timeout:123}
            ]
            rightValues.forEach(elem => {
                it("should return not null if the address has been added", async () => {
                    expect(await addAddress(elem.address, elem.port, elem.timeout)).to.not.be.null
                })
            })
        })

    })
}

function deleteThinmanAddress(address){
    //Elimina un address dall'elenco dei ThinMan
    describe("Delete agile address", function(){

        before(async function(){    
           //Aggiungi address
           db.conn.select(1)
           db.conn.set("thinman", "{\"enabled\":true,\"dhcp_opt\":163,\"address\":[{\"address\":\"prova_thinman\",\"port\":443,\"timeout\":15}],\"automatic_port\":true,\"listening_port\":443,\"fallback\":\"use_device\",\"passthrough\":false}")
        })  


        this.timeout(30000)

        describe("Database tests", function(){

            beforeEach(async function(){
                //Aggiungi address
                db.conn.select(1)
                db.conn.set("thinman", "{\"enabled\":true,\"dhcp_opt\":163,\"address\":[{\"address\":\"prova_thinman\",\"port\":443,\"timeout\":15}],\"automatic_port\":true,\"listening_port\":443,\"fallback\":\"use_device\",\"passthrough\":false}")
                
                await global.app.start()
            })
            afterEach(async function(){
                await global.app.stop()
            })


            it("Should return true if the address has been deleted", async () => {
                //Elimina address
                expect(await deleteAddress("prova_thinman")).to.not.be.null
            })

            it("Should return true if the address has been deleted and is not in the list anymore", async () => {
                //Elimina address
                await deleteAddress("prova_thinman")
                await global.sleep(1000)
                expect(await checkDelete("prova_thinman")).to.be.true
            })

            it("should return null if the address has been deleted and is not in the database anymore", async () => {
                //Elimina address
                await deleteAddress("prova_thinman")
                await global.sleep(1500)
                const res = await db.getThinManFromHostname("prova_thinman");
                expect(res).to.be.null
            })

            it("should return null if there is not any address with the given hostname", async () => {
                expect(await deleteAddress("prova")).to.be.null
            })

        })

        describe("Delete thinman address tests", async () => {

            beforeEach(async function(){
                //Aggiungi address
                db.conn.select(1)
                db.conn.set("thinman", "{\"enabled\":true,\"dhcp_opt\":163,\"address\":[{\"address\":\"prova_thinman\",\"port\":443,\"timeout\":15}],\"automatic_port\":true,\"listening_port\":443,\"fallback\":\"use_device\",\"passthrough\":false}")
                
                await global.app.start()
            })
            afterEach(async function(){
                await global.app.stop()
            })
            
            const rightValues = [
                {address:"test", port:123, timeout:123}
            ]
            rightValues.forEach(elem => {
                it("should return true if an address has been created and then deleted successfully", async () => {

                    //crea l'address
                    const add = await addAddress(elem.address, elem.port, elem.timeout)

                    await global.sleep(1500)

                    //elimina l'address creato
                    const del = await deleteAddress(elem.address)

                    //controlla che entrambe siano andate a buon fine
                    expect(add != null && del != null).to.be.true
                })

                it("should return true if an address has been created, deleted and is not in the list anymore", async () => {
                    
                    //crea l'address
                    const add = await addAddress(elem.address, elem.port, elem.timeout)

                    await global.sleep(1000)

                    //elimina l'address creato
                    const del = await deleteAddress(elem.address)

                    await global.sleep(1000)

                    //controlla che non sia nella lista
                    const list = await checkDelete(elem.address)

                    //controlla che entrambe siano andate a buon fine
                    expect(add != null && del != null && list == true).to.be.true
                })
            })          
        })

    })
}


module.exports = {
    addThinmanAddress: addThinmanAddress,
    deleteThinmanAddress: deleteThinmanAddress
}