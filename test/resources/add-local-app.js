const {db} = require ("../db.js");
const {global} = require ("../global.js");
const {utils} = require("../utils.js");
const { expect } = require("chai");
var localDB = null

describe("test", function(){

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
        await global.app.start()
        //cambia database locale
        db.conn.set("connections", "[{\"name\":\"test\",\"type\":\"URL\",\"autostart\":false,\"onExitAction\":\"\",\"passthrough\":false,\"local\":true,\"server\":false,\"options\":{\"url\":\"https://prova.it\",\"kiosk\":false,\"fullscreen\":false,\"browser\":\"iexplore\"},\"id\":\"afe39343-6643-49a5-a684-572ead42d3ee\"}]")
    }) 

    afterEach(async function(){
        db.conn.set("connections", localDB)
        //await global.app.stop()
    })

    it("try", async () => {
        await utils.resources.addLocal("AgileRad")
    })
})