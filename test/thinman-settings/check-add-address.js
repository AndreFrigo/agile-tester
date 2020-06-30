const {db} = require ("../db.js");
const {global} = require ("../global.js");
const {utils} = require("../utils.js");
const { expect } = require("chai");
var localDB = null

describe("Check add address", function(){

    this.timeout(30000)

    before(async function(){
        await global.app.start()
        //salva database locale
        db.conn.select(1)
        localDB = await new Promise(function (resolve, reject){
            db.conn.get("thinman", function(err, res){
                if(err) reject(err)
                resolve(res)
            });
        })
        //cambia database locale
        db.conn.set("thinman", "{\"enabled\":true,\"dhcp_opt\":163,\"address\":[{\"address\":\"prova_thinman\",\"port\":443,\"timeout\":15}],\"automatic_port\":true,\"listening_port\":443,\"fallback\":\"use_device\",\"passthrough\":false}")
    }) 

    after(async function(){
        db.conn.set("thinman", localDB)
        await global.app.stop()
    })

    it("should return true if the address is in the database", async () => {
        var found = false
        const elem = await db.getThinManFromHostname("prova_thinman")
        if(elem.address == "prova_thinman" && elem.port == 443 && elem.timeout == 15){
            found = true
        }
        expect(found).to.be.true
    })

    it("should return false if it tries to add an address with the same hostname", async () => {
        expect(await utils.thinmanSettings.addAddress("prova_thinman", 443, 15)).to.be.false
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


        await utils.sleep(1000)


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