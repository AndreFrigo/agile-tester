const {global} = require ("../global.js");
const {utils} = require("../utils.js");
const { expect } = require("chai");
const agileService = require("agile-os-interface")
const values = require("../test-values.js")

var localDB = null


describe("Test thinman address parameters", function(){

    //timeout lungo perchè può attendere diversi secondi per il test della connessione
    this.timeout(90000)

    before(async function(){
        //salva database locale
        localDB = await new Promise(function(resolve, reject){
            agileService.getThinmanConfig(null, (err,res) => {
                if (err) reject(err)
                resolve(res)
            })
        })
    }) 

    beforeEach(async function(){
        //cambia database locale
        await new Promise(function(resolve, reject){
            agileService.setThinmanConfig({
                address: [],
                dhcp_opt: 163,
                enabled: false,
                fallback: 'use_device',
                listening_port: 443,
                automatic_port: true
              }
              , (err,res) => {
                if (err) reject(err)
                resolve(res)
            })
        })
        
        await utils.start()
    })

    afterEach(async function(){
        await new Promise(function(resolve, reject){
            agileService.setThinmanConfig(localDB, (err,res) => {
                if (err) reject(err)
                resolve(res)
            })
        })
        await global.app.stop()
    })


    const wrongValues = values.thinmanSettings.addAddress.wrongValues
    wrongValues.forEach(elem => {
        
        it("should return false for invalid address, port or timeout", async () => {
            expect(await utils.thinmanSettings.addAddress(elem.address, elem.port, elem.timeout)).to.be.false
        })
    })

    const rightValues = values.thinmanSettings.addAddress.rightValues
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

    const realValues = values.thinmanSettings.testAddress.rightValues
    realValues.forEach(elem => {
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

        it("should return true if the address has been added and the connection is working", async () => {
            const add = await utils.thinmanSettings.addAddress(elem.address, elem.port, elem.timeout)
            await utils.sleep(500)
            const succ = await utils.thinmanSettings.testAddress(elem.address)
            expect(add && succ).to.be.true
        })
    })
})
