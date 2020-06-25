const {db} = require ("../db.js");
const {global} = require ("../global.js");
const {utils} = require("../utils.js");
const { expect } = require("chai");
var localDB = null



describe("Check delete address", function(){

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
        db.conn.set("thinman", "{\"enabled\":true,\"dhcp_opt\":163,\"address\":[{\"address\":\"prova_thinman\",\"port\":443,\"timeout\":15}],\"automatic_port\":true,\"listening_port\":443,\"fallback\":\"use_device\",\"passthrough\":false}")
    }) 

    afterEach(async function(){
        db.conn.set("thinman", localDB)
        await global.app.stop()
    })

    it("Should return true if the address has been deleted", async () => {
        //Elimina address
        expect(await utils.deleteAddress("prova_thinman")).to.not.be.null
    })

    it("Should return true if the address has been deleted and is not in the list anymore", async () => {
        //Elimina address
        await utils.deleteAddress("prova_thinman")
        await utils.sleep(1000)
        expect(await utils.checkDelete("prova_thinman")).to.be.true
    })

    it("should return null if the address has been deleted and is not in the database anymore", async () => {
        //Elimina address
        await utils.deleteAddress("prova_thinman")
        await utils.sleep(1500)
        const res = await db.getThinManFromHostname("prova_thinman");
        expect(res).to.be.null
    })

    it("should return null if there is not any address to delete with the given hostname", async () => {
        expect(await utils.deleteAddress("prova")).to.be.null
    })

})


