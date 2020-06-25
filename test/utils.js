const {db} = require ("./db.js");
const {global} = require ("./global.js");

const utils={
    //funzione di wait
    sleep : time => new Promise(r => setTimeout(r, time)),

    //return not null se la risorsa è stata creata con successo, null altrimenti
    addResource : async function (resourceName, resourceUrl) {

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
        }
        return ret
    },




}

module.exports = {utils}