const {db} = require ("../db.js");
const {global} = require ("../global.js");
const {utils} = require("../utils.js");
const { expect } = require("chai");
var localDB = null


//Aggiunge una nuova regola per il blocco di un device
describe("Check device lock parameters", function(){

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
        db.conn.select(1)
        db.conn.set("config_usb_lock", "{\"lock_enabled\":false,\"lock_except\":[],\"lock_specific\":[]}")
    }) 

    afterEach(async function(){
        db.conn.set("config_usb_lock", localDB)
        await global.app.stop()
    })
    

    //pid e vid con cui provare il test should return false if the rule can't be confirmed
    const wrongValues = [
        {v:0, p:0},
        {v:1234, p:0}, 
        {v:1234, p:123}, 
        {v:1234, p:12345}, 
        {v:123, p:1234}, 
        {v:123, p:12}, 
        {v:12, p:1234}, 
        {v:"12a12", p:1234}, 
        {v:"", p:1234},
        {v:"123", p:1234},
        {v:"", p:"abcd"},
        {v:1234, p:"qwer"},
        {v:"aaaaaaa", p:1234},
        {v:"aaaa", p:12374}
    ]
    wrongValues.forEach(elem => {
        it("should return false if the rule can't be confirmed", async () => {
            expect(await utils.addRule(elem.v, elem.p)).to.be.false
        })
    })

    const rightValues = [
        {v:1234, p:1234},
        {v:8705, p:2640},
        {v:"aaaa", p:1234}
    ]
    rightValues.forEach(elem => {                
        it("should return true if the rule has been confirmed", async () => {
            expect( await utils.addRule(elem.v, elem.p)).to.be.true
        })
    })

})
