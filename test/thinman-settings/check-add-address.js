const {db} = require ("../db.js");
const {global} = require ("../global.js");
const {utils} = require("../utils.js");
const { expect } = require("chai");
var localDB = null

describe("Check add address", function(){

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
        //cambia database locale
        db.conn.set("thinman", "{\"enabled\":true,\"dhcp_opt\":163,\"address\":[{\"address\":\"prova_thinman\",\"port\":443,\"timeout\":15}],\"automatic_port\":true,\"listening_port\":443,\"fallback\":\"use_device\",\"passthrough\":false}")
        await utils.start()
    })

    afterEach(async function(){
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
        expect(await utils.thinmanSettings.isInAgileList("prova_thinman")).to.be.true
    })


})