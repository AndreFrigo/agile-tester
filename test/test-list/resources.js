const {db} = require ("../db.js");
const {global} = require ("../global.js");
const { expect } = require("chai");


const checkResource = async function (resourceName, resourceUrl) {

    //va in risorse
    const menu = global.app.client.$("#menu-link-6");
    var click = null;
    try{
        click = await menu.click();
    }catch{
    }
    global.app.client.waitUntilWindowLoaded();


    await global.sleep(1000)


    //clicca su add resource
    const addResource = global.app.client.$("#main-div > div.main-content > main > section > div > div.fixed-header > div > a");
    click = null;
    try{
        click = await addResource.click();
    }catch{
    }
    global.app.client.waitUntilWindowLoaded();


    await global.sleep(1000)


    //seleziona local browser
    const localBrowser = global.app.client.$("#add-connection-modal > div.custom-modal.open > div.modal-content > div > div > div.row > div.col.s12 > div.connection-col > div:nth-child(4) > label");
    click = null;
    try{
        click = await localBrowser.click();
    }catch{
    }


    await global.sleep(1000)


    //inserisce il nome 
    const text = global.app.client.$("#add-connection-name");
    try{
        text.click();
        await text.setValue(resourceName);
    }catch{
    }


    await global.sleep(1000)


    //inserisce l'url
    const url = global.app.client.$("#add-connection-server");
    try{
        url.click();
        await url.setValue(resourceUrl);
    }catch{
    }


    await global.sleep(1000)


    //preme ok per confermare, se non è disponibile preme annulla 
    const ok = global.app.client.$("#add-connection-modal.form > div.custom-modal.open > div.modal-footer > div.buttons > a:nth-child(1)");
    var ret = null;
    try{
        ret = await ok.click();
    }catch{
        ret = null
    }
    await global.sleep(1000)
    if(ret == null){
        try{
            await global.app.client.$("#add-connection-modal.form > div.custom-modal.open > div.modal-footer > div.buttons > a:nth-child(2)").click();
        }catch{
        }
    }
    return ret
}
function addResource(){
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
        
        describe("Database tests", function(){

            it("should return true if the resource is in the database", async () => {
                var found = false
                const resource = await db.getResourceFromName("test");
                if(resource && resource.options.url == "https://prova.it"){
                    found = true
                }
                expect(found).to.be.true
            })


            it("should return null if there is already a resource with the same name", async () => {
                expect(await checkResource("test", "https://prova.it")).to.be.null
            })


            it("should return true if the resource is in the list", async() => {
                //va in risorse
                const menu = global.app.client.$("#menu-link-6");
                var click = null;
                try{
                    click = await menu.click();
                }catch{
                }
                global.app.client.waitUntilWindowLoaded();


                await global.sleep(1000)


                const length = await db.getResourceListLength();
                var found = false;
                var n = null;
                var u = null;
                for(i = 0; i < length; i++){
                    const base = "#connection"+i+" > div > div.connection-item-properties > div";
                    try{
                        n = await global.app.client.$(base + " > div").getText();
                        u = await global.app.client.$(base + " > p > span").getText();
                    }catch{
                    } 
                    if(n == "agile_local "+ "test" && u == "subdirectory_arrow_right" + "https://prova.it"){
                        found = true;
                    }
                }
                expect(found).to.be.true
            })

        })

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
                    expect(await checkResource(elem.name, elem.url)).to.be.null
                })
            })

            const rightValues = [
                {name:"name1" ,url:"https://www.google.com" },
                {name:"name2" ,url:"google.com" }
            ]
            rightValues.forEach(elem => {
                it("should return not null if name and url are correct", async () => {
                    expect(await checkResource(elem.name, elem.url)).to.not.be.null
                })

                 // //TODO: controlla il pop-up
                // it("Check notification", async () => {
                //     const notification = await global.app.client.$("#main-div > div:nth-child(3) > span > div.notification > div.header > p.title").getText();
                //     console.log(notification);
                //     //valori possibili del pop up Successo Success Exito
                //     assert.ok(true);
                // })
            })
        })

    })
}

module.exports = {
    addResource: addResource
}