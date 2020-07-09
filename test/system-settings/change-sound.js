const {db} = require ("../db.js");
const {global} = require ("../global.js");
const {utils} = require("../utils.js");
const { expect } = require("chai");
const { info } = require("../set-before-test.js");

var localDBconfig = null
var localDBinfo = null

describe("set output sound", function(){

    this.timeout(30000)

    before(async function(){
        //salva database locale
        db.conn.select(1)
        localDBconfig = await new Promise(function (resolve, reject){
            db.conn.get("config_audio", function(err, res){
                if(err) reject(err)
                resolve(res)
            });
        })
        db.conn.select(0)
        localDBinfo = await new Promise(function (resolve, reject){
            db.conn.get("info_audio", function(err, res){
                if(err) reject(err)
                resolve(res)
            });
        })
    })

    beforeEach(async function(){
        //cambia database locale
        db.conn.select(1)
        db.conn.set("config_audio", "{\"out\":{\"volume\":0,\"mute\":true},\"in\":{\"volume\":0,\"mute\":false}}")
        db.conn.publish("config_audio", "{\"action\":\"volume_out\",\"id\":\"canale\"}")
        db.conn.select(0)
        db.conn.set("info_audio", "{\"out\":{\"Description\":\"Speakers (Realtek(R) Audio)\",\"volume\":0,\"mute\":true},\"in\":{\"Description\":\"Microphone (Realtek(R) Audio)\",\"volume\":0,\"mute\":false}}")
        db.conn.publish("info_audio", "{\"event\":\"audio\"}");
        await utils.start()
    }) 

    afterEach(async function(){
        //console.log("localdbconf: "+localDBconfig+", localdbinfo: "+localDBinfo)
        db.conn.select(1)
        db.conn.set("config_audio", localDBconfig)
        db.conn.publish("config_audio", "{\"action\":\"volume_out\",\"id\":\"canale\"}")
        db.conn.select(0)
        db.conn.set("info_audio", localDBinfo)
        db.conn.publish("info_audio", "{\"event\":\"audio\"}");
        await global.app.stop()
    })

    //essendo la scelta dell'audio implementata come range, è impossibile settare valori errati
    const rightValues = [20, 50, 100]
    rightValues.forEach(elem => {
        it("should return true if audio changed in the agile indicator", async () => {
            expect(await setAudio(elem)).to.be.true
        })

        it("should return true if audio changed in the agile indicator and in database", async () => {
            //viene concesso un errore di +-1 a causa delle approssimazioni
            var changeAgile = null
            var changeDb = null
            changeAgile = await setAudio(elem)
            changeDb = await db.getOutputVolume()
            expect(changeAgile && changeDb < elem +1 && changeDb > elem -1).to.be.true
        })
    })

})

//input valore dell'output audio da settare
//output true se il valore è stato settato (con +1 di errore), false altrimenti, null se ci sono errori 
const setAudio = async function(val){
    var done = true
    //va nelle impostazioni di sistema
    const menu = global.app.client.$(info.SYSTEM_SETTINGS)
    try{
        await menu.click();
    }catch{
        done = false
    }
    global.app.client.waitUntilWindowLoaded();


    await utils.sleep(1000)


    //va nella sezione audio
    const sound = global.app.client.$("#sound-tab.tab > a");
    try{
        await sound.click();
    }catch{
        done = false
    }
    global.app.client.waitUntilWindowLoaded();


    await utils.sleep(1000)

    var widthElem = null
    try{
        widthElem = await global.app.client.getCssProperty("#outputVolume", "width")
    }catch{
        done = false
    }

    var width = null
    width = widthElem.parsed.value
    
    //formula ricavata dal grafico x: expected value, y: actual value. L'equazione della retta è y = 1.1x - 6, viene concesso un errore di +-1 a causa dell'approssimazione 
    var x = Math.round(((val + 6)/1.1)*width/100)   

    //opzions deprecated
    try{
        await global.app.client.moveToObject("#outputVolume",x,0)
        await utils.sleep(1000)
        await global.app.client.buttonPress()
        await utils.sleep(500)
        await global.app.client.buttonPress()
    }catch{
        done = false
    }
    await utils.sleep(500)
    //legge il valore attuale dall'interfaccia agile
    var currentValue = null
    try{
        currentValue = await global.app.client.$("#sound > span > div > p > span > span").getText()
    }catch{
        done = false
    }
    var ret = false
    try{
        if(currentValue <= val + 1 && currentValue >= val -1){
            ret = true
        }
    }catch{
        done = false
    }

    if(done){
        return ret
    }else{
        return null
    }
    
}
