const {db} = require ("../db.js");
const {global} = require ("../global.js");
const {utils} = require("../utils.js");
const { expect } = require("chai");
var localDB = null

describe("test add VMware recource", function(){

    this.timeout(30000)

    before(async function(){
        //salva database locale
        db.conn.select(1)
        localDB = await new Promise(function (resolve, reject){
            db.conn.get("connections", function(err, res){
                if(err) reject(err)
                resolve(res)
            });
        })
    })

    beforeEach(async function(){
        //cambia database locale
        db.conn.set("connections", "[{\"name\":\"test\",\"type\":\"VMWARE\",\"autostart\":false,\"onExitAction\":\"\",\"passthrough\":false,\"local\":false,\"server\":true,\"options\":{\"url\":\"test.com\",\"allow_unauthorized\":false,\"domain\":\"\",\"hideDomain\":false,\"exclude\":{\"name\":[],\"type\":[]}},\"id\":\"066366b2-804c-4eb5-b0f5-699c8ef66a4d\"}]")
        await utils.start()
    }) 

    afterEach(async function(){
        db.conn.set("connections", localDB)
        await global.app.stop()
    })

    it("should return true if the resource is in the database", async () => {
        var found = false
        const resource = await db.getResourceFromName("test");
        if(resource && resource.options.url == "test.com"){
            found = true
        }
        expect(found).to.be.true
    })


    it("should return false if it tries to add a resource with the same name", async () => {
        expect(await utils.resources.addVMware("test", "test.com")).to.be.false
    })


    it("should return true if the resource is in the Agile list", async() => {
        expect(await utils.resources.isInAgileList(3, "test", "test.com")).to.be.true
    })
})