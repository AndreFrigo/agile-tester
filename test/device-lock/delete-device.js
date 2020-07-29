const {db} = require ("../db.js");
const {global} = require ("../global.js");
const {utils} = require("../utils.js");
const { expect } = require("chai");
const agileService = require("agile-os-interface")

var localDB = null

describe("Test delete device lock rule", function(){

    this.timeout(100000)

    before(async function(){
        //salva database locale
        localDB = await new Promise(function(resolve, reject){
            agileService.getUsbLock(null, (err,res) => {
                if (err) reject(err)
                resolve(res)
            })
        })
    })

    beforeEach(async function(){
        //cambia database locale
        await new Promise(function(resolve, reject){
            agileService.setUsbLock({"lock_except":[],"lock_specific":[{"vid":"9999","pid":"9999"}],"lock_enabled":false}, (err,res) => {
                if (err) reject(err)
                resolve(res)
            })
        })
        await utils.start()
    }) 

    afterEach(async function(){
        await new Promise(function(resolve, reject){
            agileService.setUsbLock(localDB, (err,res) => {
                if (err) reject(err)
                resolve(res)
            })
        })
        await global.app.stop()
    })

    it("should return true if the device has been deleted", async () => {
        expect(await utils.deviceLock.deleteRule(9999, 9999)).to.be.true
    })

    it("should return true if the device has been deleted and is not in the agile list anymore", async () => {
        var del = null
        var found = null
        del = await utils.deviceLock.deleteRule(9999, 9999)
        await utils.sleep(500)
        found = await utils.deviceLock.isInAgileList(9999, 9999)
        expect(del && found == false).to.be.true
    })

    it("should return true if the device has been deleted and is not in the database anymore", async () => {
        var del = null
        var found = true
        del = await utils.deviceLock.deleteRule(9999, 9999)
        await utils.sleep(500)
        found = await db.getDeviceLock(9999, 9999)
        expect(del && found == null).to.be.true
    })
})