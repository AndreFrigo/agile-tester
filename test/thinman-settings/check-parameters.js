const {db} = require ("../db.js");
const {global} = require ("../global.js");
const {utils} = require("../utils.js");
const { expect } = require("chai");
var localDB = null



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


    await utils.sleep(1000)


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


    await utils.sleep(1000)


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





describe("Check address parameters", function(){

    this.timeout(30000)

    before(async function(){
        //salva database locale
        db.conn.select(1)
        localDB = await new Promise(function (resolve, reject){
            db.conn.get("thinman", function(err, res){
                if(err) reject(err)
                resolve(res)
            });
        })
    })

    beforeEach(async function(){
        await global.app.start()
        //cambia database locale
        db.conn.select(1)
        db.conn.set("thinman", "{\"enabled\":true,\"dhcp_opt\":163,\"address\":[],\"automatic_port\":true,\"listening_port\":443,\"fallback\":\"use_device\",\"passthrough\":false}")
    }) 

    afterEach(async function(){
        db.conn.set("thinman", localDB)
        await global.app.stop()
    })


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
            expect(await utils.addAddress(elem.address, elem.port, elem.timeout)).to.be.null
        })
    })

    const rightValues = [
        {address:"test", port:123, timeout:123}
    ]
    rightValues.forEach(elem => {
        it("should return not null if the address has been added", async () => {
            expect(await utils.addAddress(elem.address, elem.port, elem.timeout)).to.not.be.null
        })
    })
})



// //Elimina un address dall'elenco dei ThinMan
// describe("Delete agile address", function(){

//     before(async function(){    
//         //Aggiungi address
//         db.conn.select(1)
//         db.conn.set("thinman", "{\"enabled\":true,\"dhcp_opt\":163,\"address\":[{\"address\":\"prova_thinman\",\"port\":443,\"timeout\":15}],\"automatic_port\":true,\"listening_port\":443,\"fallback\":\"use_device\",\"passthrough\":false}")
//     })  


//     this.timeout(30000)

//     describe("Database tests", function(){

//         beforeEach(async function(){
//             //Aggiungi address
//             db.conn.select(1)
//             db.conn.set("thinman", "{\"enabled\":true,\"dhcp_opt\":163,\"address\":[{\"address\":\"prova_thinman\",\"port\":443,\"timeout\":15}],\"automatic_port\":true,\"listening_port\":443,\"fallback\":\"use_device\",\"passthrough\":false}")
            
//             await global.app.start()
//         })
//         afterEach(async function(){
//             await global.app.stop()
//         })


//         it("Should return true if the address has been deleted", async () => {
//             //Elimina address
//             expect(await deleteAddress("prova_thinman")).to.not.be.null
//         })

//         it("Should return true if the address has been deleted and is not in the list anymore", async () => {
//             //Elimina address
//             await deleteAddress("prova_thinman")
//             await utils.sleep(1000)
//             expect(await checkDelete("prova_thinman")).to.be.true
//         })

//         it("should return null if the address has been deleted and is not in the database anymore", async () => {
//             //Elimina address
//             await deleteAddress("prova_thinman")
//             await utils.sleep(1500)
//             const res = await db.getThinManFromHostname("prova_thinman");
//             expect(res).to.be.null
//         })

//         it("should return null if there is not any address with the given hostname", async () => {
//             expect(await deleteAddress("prova")).to.be.null
//         })

//     })

//     describe("Delete thinman address tests", async () => {

//         beforeEach(async function(){
//             //Aggiungi address
//             db.conn.select(1)
//             db.conn.set("thinman", "{\"enabled\":true,\"dhcp_opt\":163,\"address\":[{\"address\":\"prova_thinman\",\"port\":443,\"timeout\":15}],\"automatic_port\":true,\"listening_port\":443,\"fallback\":\"use_device\",\"passthrough\":false}")
            
//             await global.app.start()
//         })
//         afterEach(async function(){
//             await global.app.stop()
//         })
        
//         const rightValues = [
//             {address:"test", port:123, timeout:123}
//         ]
//         rightValues.forEach(elem => {
//             it("should return true if an address has been created and then deleted successfully", async () => {

//                 //crea l'address
//                 const add = await utils.addAddress(elem.address, elem.port, elem.timeout)

//                 await utils.sleep(1500)

//                 //elimina l'address creato
//                 const del = await deleteAddress(elem.address)

//                 //controlla che entrambe siano andate a buon fine
//                 expect(add != null && del != null).to.be.true
//             })

//             it("should return true if an address has been created, deleted and is not in the list anymore", async () => {
                
//                 //crea l'address
//                 const add = await utils.addAddress(elem.address, elem.port, elem.timeout)

//                 await utils.sleep(1000)

//                 //elimina l'address creato
//                 const del = await deleteAddress(elem.address)

//                 await utils.sleep(1000)

//                 //controlla che non sia nella lista
//                 const list = await checkDelete(elem.address)

//                 //controlla che entrambe siano andate a buon fine
//                 expect(add != null && del != null && list == true).to.be.true
//             })
//         })          
//     })

// })
