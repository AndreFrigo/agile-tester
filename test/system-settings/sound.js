const {db} = require ("../db.js");
const {global} = require ("../global.js");
const {utils} = require("../utils.js");
const { expect } = require("chai");
var localDB = null

describe("sound", function(){

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
        await global.app.start()
        //cambia database locale
        db.conn.select(1)
        db.conn.set("config_audio", "{\"out\":{\"volume\":0,\"mute\":true},\"in\":{\"volume\":0,\"mute\":false}}")
        db.conn.set("info_audio", "{\"out\":{\"Description\":\"Speakers (Realtek(R) Audio)\",\"volume\":0,\"mute\":true},\"in\":{\"Description\":\"Microphone (Realtek(R) Audio)\",\"volume\":0,\"mute\":false}}")
    }) 

    afterEach(async function(){
        db.conn.select(1)
        db.conn.set("config_audio", localDBconfig)
        db.conn.set("info_audio", localDBinfo)
        //await global.app.stop()
    })

    it("test audio", async () => {
        await setAudio(23)
    })

})

setAudio = async function(){
    //va in impostazioni 
    const menu = global.app.client.$('#menu-link-1');
    var click = null;
    try{
        await menu.click();
    }catch{
    }
    global.app.client.waitUntilWindowLoaded();


    await utils.sleep(1000)


    //va nella sezione lingua
    const sound = global.app.client.$("#sound-tab.tab > a");
    click = null;
    try{
        await sound.click();
    }catch{
    }
    global.app.client.waitUntilWindowLoaded();


    await utils.sleep(1000)


    const range = global.app.client.$("#outputVolume")
    
    var val = 75
    
    
    var width = await global.app.client.getElementSize("#outputVolume", "width")  //controllare che width è, con margini e padding?
    await utils.sleep(500)
    var x = Math.round((width*val)/100)   //con valori tendenti a 100 questo è alto, con valori bassi questo è basso
    console.log("X: "+x)
    console.log("width "+width)
    await global.app.client.leftClick("#outputVolume", x, 0)
    await utils.sleep(500)
    await global.app.client.leftClick("#outputVolume", x, 0)
    
    const span = global.app.client.$("#sound > span > div > p > span")
    
    
}
