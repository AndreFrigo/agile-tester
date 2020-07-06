const {db} = require ("../db.js");
const {global} = require ("../global.js");
const {utils} = require("../utils.js");
const { expect } = require("chai");
var localDB = null


describe("Check address parameters", function(){

    this.timeout(30000)

    before(async function(){
        //salva database locale
        db.conn.select(1)
        localDB = await new Promise(function (resolve, reject){
            db.conn.get("thinman", function(err, res){
                if(err) reject(err)
                resolve(res)
            });
        })
    })

    beforeEach(async function(){
        //cambia database locale
        db.conn.select(1)
        db.conn.set("thinman", "{\"enabled\":true,\"dhcp_opt\":163,\"address\":[],\"automatic_port\":true,\"listening_port\":443,\"fallback\":\"use_device\",\"passthrough\":false}")
        await utils.start()
    }) 

    afterEach(async function(){
        db.conn.set("thinman", localDB)
        await global.app.stop()
    })


    const wrongValues = [
        {address:"", port:123, timeout:123},
        {address:"prova", port:"", timeout:123},
        {address:"aaaaaa", port:123, timeout:""},
        {address:"sss", port:"aaa", timeout:123},
        {address:"ddd", port:"1.5", timeout:1000},
        {address:"fff", port:335, timeout:"abc"},
        {address:"1234", port:"1a1", timeout:123}
    ]
    wrongValues.forEach(elem => {
        
        it("should return false for invalid address, port or timeout", async () => {
            expect(await utils.thinmanSettings.addAddress(elem.address, elem.port, elem.timeout)).to.be.false
        })
    })

    const rightValues = [
        {address:"test", port:123, timeout:123},
        {address:"ggg", port:123, timeout:0},
        {address:"sdf", port:123, timeout:3e2}
    ]
    rightValues.forEach(elem => {

        it("should return true if the address has been added", async () => {
            expect(await utils.thinmanSettings.addAddress(elem.address, elem.port, elem.timeout)).to.be.true
        })

        it("should return true if an address has been created and then deleted successfully", async () => {

            //crea l'address
            const add = await utils.thinmanSettings.addAddress(elem.address, elem.port, elem.timeout)

            await utils.sleep(1500)

            //elimina l'address creato
            const del = await utils.thinmanSettings.deleteAddress(elem.address)

            //controlla che entrambe siano andate a buon fine
            expect(add && del).to.be.true
        })

        it("should return true if an address has been created, deleted and is not in the list anymore", async () => {
            
            //crea l'address
            const add = await utils.thinmanSettings.addAddress(elem.address, elem.port, elem.timeout)

            await utils.sleep(1000)

            //elimina l'address creato
            const del = await utils.thinmanSettings.deleteAddress(elem.address)

            await utils.sleep(1000)

            //controlla che non sia nella lista
            const list = await utils.thinmanSettings.isInAgileList(elem.address)

            //controlla che entrambe siano andate a buon fine
            expect(add && del && list == false).to.be.true
        })
    })
})
