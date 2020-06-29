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
        await global.app.start()
        //cambia database locale
        db.conn.select(1)
        db.conn.set("thinman", "{\"enabled\":true,\"dhcp_opt\":163,\"address\":[],\"automatic_port\":true,\"listening_port\":443,\"fallback\":\"use_device\",\"passthrough\":false}")
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
        {address:"1234", port:"1a1", timeout:123},
        {address:"ggg", port:123, timeout:0}
    ]
    wrongValues.forEach(elem => {
        
        it("should return null for invalid address, port or timeout", async () => {
            expect(await utils.addAddress(elem.address, elem.port, elem.timeout)).to.be.null
        })
    })

    const rightValues = [
        {address:"test", port:123, timeout:123}
    ]
    rightValues.forEach(elem => {

        it("should return not null if the address has been added", async () => {
            expect(await utils.addAddress(elem.address, elem.port, elem.timeout)).to.not.be.null
        })

        it("should return true if an address has been created and then deleted successfully", async () => {

            //crea l'address
            const add = await utils.addAddress(elem.address, elem.port, elem.timeout)

            await utils.sleep(1500)

            //elimina l'address creato
            const del = await utils.deleteAddress(elem.address)

            //controlla che entrambe siano andate a buon fine
            expect(add != null && del != null).to.be.true
        })

        it("should return true if an address has been created, deleted and is not in the list anymore", async () => {
            
            //crea l'address
            const add = await utils.addAddress(elem.address, elem.port, elem.timeout)

            await utils.sleep(1000)

            //elimina l'address creato
            const del = await utils.deleteAddress(elem.address)

            await utils.sleep(1000)

            //controlla che non sia nella lista
            const list = await utils.checkDelete(elem.address)

            //controlla che entrambe siano andate a buon fine
            expect(add != null && del != null && list == true).to.be.true
        })
    })
})