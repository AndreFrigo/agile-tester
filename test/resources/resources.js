const {db} = require ("../db.js");
const {global} = require ("../global.js");
const {utils} = require("../utils.js");
const { expect } = require("chai");
var localDB = null

//return not null se la risorsa è stata creata con successo ed è apparsa la notifica di successo, null altrimenti
const addResource = async function (resourceName, resourceUrl) {

    //va in risorse
    const menu = global.app.client.$("#menu-link-6");
    var click = null;
    try{
        click = await menu.click();
    }catch{
    }
    global.app.client.waitUntilWindowLoaded();


    await utils.sleep(1000)


    //clicca su add resource
    const addResource = global.app.client.$("#main-div > div.main-content > main > section > div > div.fixed-header > div > a");
    click = null;
    try{
        click = await addResource.click();
    }catch{
    }
    global.app.client.waitUntilWindowLoaded();


    await utils.sleep(1000)


    //seleziona local browser
    const localBrowser = global.app.client.$("#add-connection-modal > div.custom-modal.open > div.modal-content > div > div > div.row > div.col.s12 > div.connection-col > div:nth-child(4) > label");
    click = null;
    try{
        click = await localBrowser.click();
    }catch{
    }


    await utils.sleep(1000)


    //inserisce il nome 
    const text = global.app.client.$("#add-connection-name");
    try{
        text.click();
        await text.setValue(resourceName);
    }catch{
    }


    await utils.sleep(1000)


    //inserisce l'url
    const url = global.app.client.$("#add-connection-server");
    try{
        url.click();
        await url.setValue(resourceUrl);
    }catch{
    }


    await utils.sleep(1000)


    //preme ok per confermare, se non è disponibile preme annulla 
    const ok = global.app.client.$("#add-connection-modal.form > div.custom-modal.open > div.modal-footer > div.buttons > a:nth-child(1)");
    var ret = null;
    var notification = null
    try{
        ret = await ok.click();
    }catch{
        ret = null
    }
    await utils.sleep(1000)
    if(ret == null){
        try{
            await global.app.client.$("#add-connection-modal.form > div.custom-modal.open > div.modal-footer > div.buttons > a:nth-child(2)").click();
        }catch{
        }
    }else{
        try{
            //titolo del pop-up
            notification = await global.app.client.$("#main-div > div:nth-child(3) > span > div.notification > div.header > p.title").getText();
        }catch{
            notification = null
        }
        //aggiorna lingua
        global.language = await db.dbLanguage()
        var succ = null
        switch(global.language){
            case 1: {
                succ = "Successo"
                break
            }
            case 2: {
                succ = "Success"
                break
            }
            case 3: {
                succ = "Exito"
                break
            }
        }
        if(notification != succ) ret = null
    }
    return ret
}


describe("Add a new resource", function(){

    before(async function(){
        await global.app.start()
    })
    before(async function(){    
        //Aggiungi una risorsa nel db
        db.conn.select(1)
        db.conn.set("connections", "[{\"name\":\"test\",\"type\":\"URL\",\"autostart\":false,\"onExitAction\":\"\",\"passthrough\":false,\"local\":true,\"server\":false,\"options\":{\"url\":\"https://prova.it\",\"kiosk\":false,\"fullscreen\":false,\"browser\":\"iexplore\"},\"id\":\"afe39343-6643-49a5-a684-572ead42d3ee\"}]")
    }) 
    after(async function(){
        await global.app.stop()
    })

    this.timeout(30000)
    
    

    describe("Resource tests", function(){

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
            it("should return null if name or url are wrong", async () => {
                expect(await addResource(elem.name, elem.url)).to.be.null
            })
        })

        const rightValues = [
            {name:"name1" ,url:"https://www.google.com" },
            {name:"name2" ,url:"google.com" }
        ]
        rightValues.forEach(elem => {
            //TODO: spezzare in due test? 1 risorsa aggiunta, 2 risorsa aggiunta e pop up apparso ???
            it("should return not null if the resource has been added and the success notification appeared", async () => {
                expect(await addResource(elem.name, elem.url)).to.not.be.null
            })
        })
    })

})