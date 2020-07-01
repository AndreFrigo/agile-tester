const {db} = require ("../db.js");
const {global} = require ("../global.js");
const {utils} = require("../utils.js");
const { expect } = require("chai");
var localDB = null

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
        localDBinfo = await new Promise(function (resolve, reject){
            db.conn.get("info_audio", function(err, res){
                if(err) reject(err)
                resolve(res)
            });
        })
    })

    beforeEach(async function(){
        //TODO: impostare volume di sistema
        await global.app.start()
        //cambia database locale
        db.conn.select(1)
        db.conn.set("config_audio", "{\"out\":{\"volume\":0,\"mute\":true},\"in\":{\"volume\":0,\"mute\":false}}")
        db.conn.select(0)
        db.conn.set("info_audio", "{\"out\":{\"Description\":\"Speakers (Realtek(R) Audio)\",\"volume\":0,\"mute\":true},\"in\":{\"Description\":\"Microphone (Realtek(R) Audio)\",\"volume\":0,\"mute\":false}}")
    }) 

    afterEach(async function(){
        //TODO: impostare volume di sistema
        db.conn.select(1)
        db.conn.set("config_audio", localDBconfig)
        db.conn.select(0)
        db.conn.set("info_audio", localDBinfo)
        await global.app.stop()
    })

    //essendo la scelta dell'audio implementata come range, è impossibile settare valori errati
    const rightValues = [20, 50, 100]
    rightValues.forEach(elem => {
        it("should return true if audio changed in the agile indicator", async () => {
            expect(await setAudio(elem)).to.be.true
        })

        it("should return true if audio changed in the agile indicator and in database", async () => {
            var changeAgile = null
            var changeDb = null
            changeAgile = await setAudio(elem)
            changeDb = await db.getOutputVolume()
            expect(changeAgile && changeDb < elem +5 && changeDb > elem -5).to.be.true
        })
    })

})

//input valore dell'output audio da settare
//output true se il valore è stato settato (con +-5 di errore), false altrimenti, null se ci sono errori 
const setAudio = async function(val){
    var done = true
    //va in impostazioni 
    const menu = global.app.client.$('#menu-link-1');
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
    }catch(err){
        console.log("Error catch 0: "+err)
        done = false
    }
    
    var width = null
    width = widthElem.parsed.value
    
    await utils.sleep(500)
    //la funzione non corrisponde, quindi viene divisa in più parti e shiftata a dovere, errore concesso +-5
    var x = Math.round((width*val)/100)   
    if(x<width/3) x+=7
    else if(x<width/2) x+=3  
    else if(x>2*width/3) x-=3 

    //opzions deprecated
    try{
        await global.app.client.moveToObject("#outputVolume",x,0)
        await utils.sleep(1000)
        await global.app.client.buttonPress()
        await utils.sleep(500)
        await global.app.client.buttonPress()
    }catch(err){
        console.log("Error catch 1: "+err)
        done = false
    }
    await utils.sleep(500)
    //legge il valore attuale dall'interfaccia agile
    var currentValue = null
    try{
        currentValue = await global.app.client.$("#sound > span > div > p > span > span").getText()
    }catch(err){
        console.log("Error catch 3: "+err)
        done = false
    }
    var ret = false
    try{
        if(currentValue <= val + 5 && currentValue >= val -5){
            ret = true
        }
    }catch{
        console.log("Error catch 4: "+err)
        done = false
    }

    if(done){
        return ret
    }else{
        return null
    }
    
}
