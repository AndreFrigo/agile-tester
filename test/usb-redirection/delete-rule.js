const {db} = require ("../db.js");
const {global} = require ("../global.js");
const {utils} = require("../utils.js");
const { expect } = require("chai");
var localDB = null

describe("Test delete usb redirection rule tests", function(){

    this.timeout(100000)

    before(async function(){
        //salva database locale
        db.conn.select(1)
        localDB = await new Promise(function (resolve, reject){
            db.conn.get("config_citrix", function(err, res){
                if(err) reject(err)
                resolve(res)
            });
        })
    })

    beforeEach(async function(){
        //cambia database locale
        db.conn.select(1)
        db.conn.set("config_citrix", "{\"usb_redirection\":{\"auto_redirect_on_start\":true,\"auto_redirect_on_plug\":false,\"rules\":[{\"type\":\"ALLOW\",\"vid\":\"1234\",\"pid\":\"1234\",\"class\":\"\",\"subclass\":\"\",\"prot\":\"\",\"description\":\"prova_usb\",\"split\":false,\"interfaces\":[]}],\"default\":\"ALLOW\"}}")
        await utils.start()
    }) 

    afterEach(async function(){
        db.conn.select(1)
        db.conn.set("config_citrix", localDB)
        await global.app.stop()
    })


    it("should return true if the rule has been delete successfully", async () => {
        expect(await utils.usbRedirection.deleteRule(1234, 1234)).to.be.true
    })

    it("should return false if it tries to delete a rule that does not exist", async () => {
        expect(await utils.usbRedirection.deleteRule(3333,6666)).to.be.false
    })

    it("should return true if the rule has been deleted and is not in the list anymore", async () => {
        var del = null
        var found = null
        del = await utils.usbRedirection.deleteRule(1234, 1234)
        await utils.sleep(500)
        found = await utils.usbRedirection.findRule(1234, 1234)
        await utils.sleep(500)
        expect(del && found == false).to.be.true
    })

    it("should return true if the rule has been deleted and is not in the database anymore", async () => {
        var del = null
        var found = null
        del = await utils.usbRedirection.deleteRule(1234, 1234)
        await utils.sleep(500)
        found = await db.getUSBFromVidPid(1234, 1234)
        await utils.sleep(500)
        expect(del && found == null).to.be.true
    })
})