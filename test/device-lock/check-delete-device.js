const {db} = require ("../db.js");
const {global} = require ("../global.js");
const {utils} = require("../utils.js");
const { expect } = require("chai");
var localDB = null

describe("check delete device", function(){

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
        await global.app.start()
        //cambia database locale
        db.conn.set("config_usb_lock", "{\"lock_enabled\":false,\"lock_except\":[],\"lock_specific\":[{\"vid\":\"9999\",\"pid\":\"9999\"}]}")
    }) 

    afterEach(async function(){
        db.conn.set("config_usb_lock", localDB)
        await global.app.stop()
    })

    it("should return true if the device has been deleted", async () => {
        expect(await utils.deviceLock.deleteRule(9999, 9999)).to.be.true
    })

    it("should return true if the device has been deleted and is not in the agile list anymore", async () => {
        var del = null
        var found = null
        del = await utils.deviceLock.deleteRule(9999, 9999)
        found = await utils.deviceLock.checkList(9999, 9999)
        expect(del && found == false).to.be.true
    })
})