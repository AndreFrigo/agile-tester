const {db} = require ("../db.js");
const {global} = require ("../global.js");
const {utils} = require("../utils.js");
const { expect } = require("chai");
var localDB = null

describe("Check add device", function () {
    
    this.timeout(30000)

    before(async function(){
        //salva database locale
        db.conn.select(1)
        localDB = await new Promise(function (resolve, reject){
            db.conn.get("config_usb_lock", function(err, res){
                if(err) reject(err)
                resolve(res)
            });
        })
    })

    beforeEach(async function(){
        //cambia database locale
        db.conn.set("config_usb_lock", "{\"lock_enabled\":false,\"lock_except\":[],\"lock_specific\":[{\"vid\":\"9999\",\"pid\":\"9999\"}]}")
        await utils.start()
    }) 

    afterEach(async function(){
        db.conn.set("config_usb_lock", localDB)
        await global.app.stop()
    })

    it("should return not null if the device is already in the db list", async () => {
        var device = null;
        device = await db.getDeviceLock(9999,9999)
        expect(device).to.not.be.null;
    })

    it("should return true if the device is in the agile list", async () => {
        expect(await utils.deviceLock.checkList(9999, 9999)).to.be.true
    })

    it("should return false if it tries to add a device with same vid and pid", async () => {
        expect(await utils.deviceLock.addRule(9999,9999)).to.be.false
    })
})