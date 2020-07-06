const {db} = require ("../db.js");
const {global} = require ("../global.js");
const {utils} = require("../utils.js");
const { expect } = require("chai");
var localDB = null

describe("add a citrix resource test", function(){

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
        db.conn.set("connections", "[]")
        await utils.start()
    }) 
    
    afterEach(async function(){
        db.conn.set("connections", localDB)
        await global.app.stop()
    })

    const rightValues = [
        {name: "name", server: "xxx.it", domain:""}
    ]
    rightValues.forEach(elem => {
        it("should return true if the resource has been added", async () => {
            expect(await utils.resources.addCitrix(elem.name, elem.server, elem.domain)).to.be.true
        })
    })

    const wrongValues = [
        {name: "", server: "xxx.it", domain:"aa"},
        {name: "name", server: "xxx", domain:"aaa"},
        {name: "name", server: "", domain:""}
    ]
    wrongValues.forEach(elem => {
        it("should return false if some data are not correct", async () => {
            expect(await utils.resources.addCitrix(elem.name, elem.server, elem.domain)).to.be.false
        })
    })

})