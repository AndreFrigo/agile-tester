const {db} = require ("../db.js");
const {global} = require ("../global.js");
var assert = require('assert');

function addResource(resourceName, resourceUrl){
    describe("Add a new resource", function(){

        //controlla che non ci sia gia una risorsa con lo stesso nome nel db
        it("Check if there is already a resource with the given name", async () => {
            const resource = await db.getResourceFromName(resourceName);
            assert.ok(resource==null, "There is already a resource with the given name!")
        })

        //va nelle risorse
        it("Navigates to resources", async () => {
            const click = await global.app.client.click('#menu-link-6');
            global.app.client.waitUntilWindowLoaded();
            assert.ok(click, "error while opening the resources menù");
        })

        //clicca su add resource
        it("Clicks on Add Resource", async () => {
            const click = await global.app.client.$("#main-div > div.main-content > main > section > div > div.fixed-header > div > a").click();
            global.app.client.waitUntilWindowLoaded();
            assert.ok(click, "error while clicking Add Resource");
        })

        //setta local browser come resource type
        it("Select local application as Resource Type", async () => {
            const click = await global.app.client.$("#add-connection-modal > div.custom-modal.open > div.modal-content > div > div > div.row > div.col.s12 > div.connection-col > div:nth-child(4) > label").click();
            assert.ok(click, "error while selecting local application");
        })

        //inserisce il nome della risorsa da creare 
        it("Insert resource name", async () => {
            const text = global.app.client.$("#add-connection-name");
            text.setValue(resourceName);
            text.getValue().then(function(v){
                assert.equal(resourceName, v, "error while inserting the resource name");
            })
        })

        //inserisce l'url della pagina da visitare 
        it("Insert URL", async () => {
            const url = global.app.client.$("#add-connection-server");
            url.setValue(resourceUrl);
            url.getValue().then(function(v){
                assert.equal(resourceUrl, v, "error while inserting the resource name");
            })
        })

        //conferma
        it("Click on Ok to confirm", async () => {
            const click = await global.app.client.$(".a=Ok").click();
            assert.ok(click, "Error while clicking ok to confirm")
        })

        //controlla che la risorsa si trovi nel db
        it("Check if the resource is in the db", async () => {
            const resource = await db.getResourceFromName(resourceName);
            if(resource){
                if(resource.options.url == resourceUrl){
                    assert.ok(true);
                }else{
                    assert.ok(false, "There is a resource with the given name, but with different url")
                }
            }else{
                assert.ok(false, "The resource with the given name is not in the db")
            }
        })

        //controlla che sia nell'elenco delle risorse di agile
        it("Check if the resource is in the agile list", async () => {
            const length = await db.getResourceListLength();
            var found = false;
            for(i = 0; i < length; i++){
                const base = "#connection"+i+" > div > div.connection-item-properties > div";
                const n = await global.app.client.$(base + " > div").getText();
                const u = await global.app.client.$(base + " > p > span").getText(); 
                if(n == "agile_local "+ resourceName && u == "subdirectory_arrow_right" + resourceUrl){
                    found = true;
                }
            }
            assert.ok(found, "The resource is not in the agile list")
        })
    })
}

module.exports = {
    addResource: addResource
}