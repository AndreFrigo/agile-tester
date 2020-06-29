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
        expect(await utils.enableRemoteAssistance()).to.be.true
    })


})