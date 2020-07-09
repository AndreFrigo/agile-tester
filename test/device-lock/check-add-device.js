const {db} = require ("../db.js");
const {global} = require ("../global.js");
const {utils} = require("../utils.js");
const { expect } = require("chai");
const agileService = require("agile-os-interface")
var localDB = null

describe("Check add device", function () {
    
    this.timeout(30000)

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
            agileService.getUsbLock(null, (err,res) => {
                if (err) reject(err)
                resolve(res)
            })
        })
        await global.app.stop()
    })

    it("should return not null if the device is already in the db list", async () => {
        var device = null;
        device = await db.getDeviceLock(9999,9999)
        expect(device).to.not.be.null;
    })

    it("should return true if the device is in the agile list", async () => {
        expect(await utils.deviceLock.isInAgileList(9999, 9999)).to.be.true
    })

    it("should return false if it tries to add a device with same vid and pid", async () => {
        expect(await utils.deviceLock.addRule(9999,9999)).to.be.false
    })
})