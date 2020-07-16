const {db} = require ("../db.js");
const {global} = require ("../global.js");
const {utils} = require("../utils.js");
const { expect } = require("chai");
const agileService = require ("agile-os-interface")
const {audio} = require("system-control")
//requires npm install win-audio for windows and npm install loudness for unix
var localVolume = null
var localMute = null

describe("set output sound", function(){

    this.timeout(100000)

    before(async function(){
        //salva database locale
        localVolume = await new Promise(function(resolve, reject){
            agileService.getVolume(null, (err,res) => {
                if (err) reject(err)
                resolve(res)
            })
        })
        localMute = await new Promise(function(resolve, reject){
            agileService.isMute(null, (err,res) => {
                if (err) reject(err)
                resolve(res)
            })
        })
    })

    beforeEach(async function(){
        //cambia database locale
        await new Promise(function(resolve, reject){
            agileService.setVolume(0, (err,res) => {
                if (err) reject(err)
                resolve(res)
            })
        })
        await utils.start()
    }) 

    afterEach(async function(){
        await new Promise(function(resolve, reject){
            agileService.setVolume(localVolume, (err,res) => {
                if (err) reject(err)
                resolve(res)
            })
        })
        await new Promise(function(resolve, reject){
            agileService.mute(localMute, (err,res) => {
                if (err) reject(err)
                resolve(res)
            })
        })
        await global.app.stop()
    })

    //essendo la scelta dell'audio implementata come range, è impossibile settare valori errati
    const rightValues = [20, 50, 100]
    rightValues.forEach(elem => {
        it("should return true if audio changed in the agile indicator", async () => {
            expect(await utils.systemSettings.setAudio(elem)).to.be.true
        })

        it("should return true if audio changed in the agile indicator and in database", async () => {
            //viene concesso un errore di +-1 a causa delle approssimazioni
            var changeAgile = null
            var changeDb = null
            changeAgile = await utils.systemSettings.setAudio(elem)
            changeDb = await db.getOutputVolume()
            expect(changeAgile && changeDb <= elem +1 && changeDb >= elem -1).to.be.true
        })

        it("should return true if audio changed in the agile indicator and the system audio corresponds", async () => {
            const changeAgile = await utils.systemSettings.setAudio(elem)
            await utils.sleep(500)
            const actualVolume = await audio.volume()
            expect(changeAgile && actualVolume <= elem +1 && actualVolume >= elem -1).to.be.true
        })
    })

})
