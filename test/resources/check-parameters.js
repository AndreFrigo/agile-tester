const {db} = require ("../db.js");
const {global} = require ("../global.js");
const {utils} = require("../utils.js");
const { expect } = require("chai");
var localDB = null



describe("Check resource parameters", function(){

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
        db.conn.select(1)
        db.conn.set("connections", "[]")
    }) 

    afterEach(async function(){
        db.conn.set("connections", localDB)
        await global.app.stop()
    })

    
    const wrongValues = [
        {name:"" ,url:"" },
        {name:"prova" ,url:"" },
        {name:"" ,url:"google.com" },
        {name:"prova" ,url:"prova" },
        {name:"123" ,url:"123" },
        {name:"!!!" ,url:"google.com.i" },
        {name:"aaa" ,url:"aaa" },
        {name:"aaa" ,url:"google" }
    ]
    wrongValues.forEach(elem => {
        it("should return false if name or url are wrong", async () => {
            expect(await utils.addResource(elem.name, elem.url)).to.be.false
        })
    })

    const rightValues = [
        {name:"name1" ,url:"https://www.google.com" },
        {name:"name2" ,url:"google.com" }
    ]
    rightValues.forEach(elem => {

        it("should return true if the resource has been added", async () => {
            expect(await utils.addResource(elem.name, elem.url)).to.be.true
        })

        it("should return true if the resource has been added and the success notification appeared", async () => {
            const res = await utils.addResource(elem.name, elem.url)
            await utils.sleep(1000)
            const notification = await utils.checkSuccessNotification()
            expect(res && notification).to.be.true
        })
    })

})
