const {db} = require ("../db.js");
const {global} = require ("../global.js");
const {utils} = require("../utils.js");
const { expect } = require("chai");
var localDB = null

describe("check remote assistance settings", function(){

    this.timeout(30000)

    before(async function(){
        //salva database locale
        db.conn.select(1)
        localDB = await new Promise(function (resolve, reject){
            db.conn.get("remote_assistance", function(err, res){
                if(err) reject(err)
                resolve(res)
            });
        })
    })

    beforeEach(async function(){
        await global.app.start()
        //cambia database locale
        db.conn.set("remote_assistance", "{\"enabled\":false,\"always_on\":{\"enabled\":false,\"password\":null},\"acceptance\":{\"allow_reject\":false,\"auto_accept\":null},\"protection\":{\"enable\":false,\"password\":\"\"},\"appearance\":{\"show_icon\":false,\"show_desktop\":false}}")
    }) 

    afterEach(async function(){
        db.conn.set("remote_assistance", localDB)
        await global.app.stop()
    })

    it("should return true if remote assistance is enabled", async () => {
        const raAgile = await utils.enableRemoteAssistance()
        await utils.sleep(500)
        const radb = await db.getRemoteAssistance()
        expect(raAgile && radb.enabled).to.be.true
    })

    it("should return true if show notification icon is checked", async () => {
        await utils.enableRemoteAssistance()
        await utils.sleep(500)
        const checkbox = global.app.client.$("#show-icon")
        var val = null
        var isEnable = null
        var click = null
        try{
            val = await checkbox.getValue()
        }catch{
        }
        if(val == "false"){
            const label = global.app.client.$("#main-div > div.main-content > main > section > div > div.row:nth-child(2) > div > div.row > div > div > label")
            try{
                click = label.click()
            }catch{
            }
        }else if (val == "true"){
            isEnable = true
        }
        if(click != null) isEnable = true
        await utils.sleep(500)
        const radb = await db.getRemoteAssistance()
        expect(isEnable && radb.appearance.show_icon).to.be.true
    })

    it("should return true if require user authentication is checked", async () => {
        await utils.enableRemoteAssistance()
        await utils.sleep(500)
        const checkbox = global.app.client.$("#allow-reject")
        var val = null
        var isEnable = null
        var click = null
        try{
            val = await checkbox.getValue()
        }catch{
        }
        if(val == "false"){
            const label = global.app.client.$("#main-div > div.main-content > main > section > div > div.row:nth-child(2) > div > div.row:nth-child(2) > div > div > label")
            try{
                click = label.click()
            }catch{
            }
        }else if (val == "true"){
            isEnable = true
        }
        if(click != null) isEnable = true
        await utils.sleep(500)
        const radb = await db.getRemoteAssistance()
        expect(isEnable && radb.acceptance.allow_reject).to.be.true
    })

    const rightValues = [23, 3e2]
    rightValues.forEach(elem => {
        it("should return true if auto-accept and enable remote assistance is checked and his lable is correct", async () => {
            expect(await utils.setAutoAccept(elem)).to.be.true
        })
    })

    const wrongValues = [0, "abc", 1234567, "", -7, 2e7]
    wrongValues.forEach(elem => {
        it("should return false if auto-accept or enable remote assistance are not checked, or if the lable is not correct", async () => {
            expect(await utils.setAutoAccept(elem)).to.be.false
        })
    })
    


})