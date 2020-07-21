const {db} = require ("../db.js");
const {global} = require ("../global.js");
const {utils} = require("../utils.js");
const { expect } = require("chai");
const values = require("../test-values.js")
var localDB = null



describe("Add USB redirection rule", function(){

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
        db.conn.set("config_citrix", "{\"usb_redirection\":{\"auto_redirect_on_start\":true,\"auto_redirect_on_plug\":false,\"rules\":[],\"default\":\"ALLOW\"}}")
        await utils.start()
    }) 

    afterEach(async function(){
        db.conn.set("config_citrix", localDB)
        await global.app.stop()
    })
    

    describe("Usb redirection tests", async () => {

        const wrongValues = values.usbRedirection.add.wrongValues
        wrongValues.forEach(elem => {
            it("should return false for invalid description, vid or pid", async () => {
                expect(await utils.usbRedirection.addRule(elem.description, elem.vid, elem.pid)).to.be.false
            })
        })

        const rightValues = values.usbRedirection.add.rightValues
        rightValues.forEach(elem => {
            it("should return true if the rule has been added", async () => {
                expect(await utils.usbRedirection.addRule(elem.description, elem.vid, elem.pid)).to.be.true
            })

            it("should return true if the rule has been added and then deleted", async () => {
                var add = null
                var del = null
                add = await utils.usbRedirection.addRule(elem.description, elem.vid, elem.pid)
                await utils.sleep(500)
                del = await utils.usbRedirection.deleteRule(elem.vid, elem.pid)
                await utils.sleep(500)
                expect(add && del).to.be.true
            })
        })
    })

})    

