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


    //ritorna not null se c'è una wifi disponibile con l'ssid dato, altrimenti null
    checkSsid : async function (ssid) {
        //Va nella sezione impostazioni di rete
        const menu = global.app.client.$('#menu-link-2');
        var click = null;
        try{
            click = await menu.click();
        }catch{
        }
        global.app.client.waitUntilWindowLoaded();


        await utils.sleep(1000)


        //Va nella sezione wifi
        const wifi = global.app.client.$("#ab > a");
        click = null;
        try{
            click = await wifi.click();
        }catch{
        }
        global.app.client.waitUntilWindowLoaded();


        await utils.sleep(1000)


        //Clicca su aggiungi rete wifi
        const add = global.app.client.$("#wifiTab > div > div > div.header-inputs > a");
        click = null;
        try{
            click = await add.click();
        }catch{
        }
        global.app.client.waitUntilWindowLoaded();


        await utils.sleep(1000)


        //apre la lista delle reti disponibili
        const button = global.app.client.$("#wifi");
        var click = null;
        try{
            click = await button.click();
        }catch{
        }
        global.app.client.waitUntilWindowLoaded();


        await utils.sleep(1000)


        var ret = null
        try{
            ret = await global.app.client.$("span.network-ssid=" + ssid).click();
        }catch{
            ret = null
        }
        
        await utils.sleep(1000)

        return ret
    },


    //ritorna not null se ha confermato la wifi, null se la password non è corretta o la rete non è presente nell'elenco
    saveWifi: async function (ssid, psw){
        await utils.checkSsid(ssid)

        //inserisce la password
        const password = global.app.client.$("#add-connection-modal > div > div.modal-content > div > div > div.row:nth-child(4) > div > div > input");
        try{
            password.click();
            var x = await password.setValue(psw);
            while(!x){
                
            }
        }catch{
        }


        await utils.sleep(1000)


        //conferma premendo ok
        const ok = global.app.client.$("#add-connection-modal > div > div.modal-footer > div > a:nth-child(1)");
        var click = null;
        try{
            click = await ok.click();
        }catch{
            click = null
        }
        await utils.sleep(1500)
        if(click == null){
            //preme su annulla
            try{
                await global.app.client.$("#add-connection-modal > div > div.modal-footer > div > a:nth-child(2)").click();
            }catch{
            }
        }
        return click
    },


    //ritorna not null se ha creato la regola, altrimenti null
    addRule: async function (vid, pid){

        const menu = global.app.client.$('#menu-link-11');
        var click = null;
        try{
            click = await menu.click();
        }catch{
        }
        global.app.client.waitUntilWindowLoaded();


        await utils.sleep(1500);
        

        click = null;                    
        const addRule = global.app.client.$("#main-div > div.main-content > main > section > div.fixed-header > div > div > a");
        try{
            click = await addRule.click();
        }catch{
        }
        global.app.client.waitUntilWindowLoaded();


        await utils.sleep(1000)
        

        var v = global.app.client.$("#vid");
        try{
            v.click();
            var x = await v.setValue(vid);
            while(!x){
                
            }
        }catch{
        }


        await utils.sleep(1000)


        v = global.app.client.$("#pid");
        try{
            v.click();
            var x = await v.setValue(pid);
            while(!x){
                
            }
        }catch{
        }


        await utils.sleep(1000)


        const ok = global.app.client.$("#add-usb-rule-modal > div > div.modal-footer > div > a:nth-child(1)")
        click = null;
        try{
            click = await ok.click()
        }catch{
            click = null;
        }
        if(click == null){
            //premi su annulla
            try{
                await global.app.client.$("#add-usb-rule-modal > div > div.modal-footer > div > a:nth-child(2)").click()
            }catch{  
            }
        }
        return click 
    },


    //ritorna null se non ha potuto confermare, altrimenti not null
    addAddress: async function(address, port, timeout){

        //va in thinman settings
        const menu = global.app.client.$('#menu-link-3');
        var click = null;
        try{
            click = await menu.click();
        }catch{
        }
        global.app.client.waitUntilWindowLoaded();
    
    
        await utils.sleep(1000)
    
    
        //preme su add address
        const add = global.app.client.$('h5 > a');
        var click = null;
        try{
            click = await add.click();
        }catch{
        }
        global.app.client.waitUntilWindowLoaded();
    
    
        await utils.sleep(1000)
    
    
        //inserisce l'hostname
        const hostname = global.app.client.$("#new-address");
        try{
            hostname.click();
            var x = await hostname.setValue(address);
            while(!x){
                
            }
        }catch{
        }
    
    
        await utils.sleep(1000)
    
    
        //inserisce la porta
        const p = global.app.client.$("#new-port");
        
        try{
            p.click();
            
            if(port == ""){
                //cancellazione manuale, con clearElement non funziona in questo caso
                var r = false
                r = await new Promise(function (resolve, reject){
                    p.getValue().then(function(result){
                        for(i=0;i<result.length;i++){	
                            global.app.client.keys("Backspace");	
                        }
                        resolve(true)
                    })
                }) 
                while(!r){
    
                }
            }else{
                x = false
                x = await p.setValue(port)
                while(!x){
    
                }
            }
        }catch{
    
        }
    
    
        await utils.sleep(1000)
    
    
        //inserisce il timeout
        const t = global.app.client.$("#new-timeout");
    
        try{
            t.click();
            //TODO: condizione particolare, sarebbe da evitare 
            if(timeout == "" || isNaN(timeout)){
                //cancellazione manuale, con clearElement non funziona in questo caso
                var r = false
                r = await new Promise(function (resolve, reject){
                    t.getValue().then(function(result){
                        for(i=0;i<result.length;i++){	
                            global.app.client.keys("Backspace");	
                        }
                        resolve(true)
                    })
                }) 
                while(!r){
    
                }
            }else{
                x = false
                x = await t.setValue(timeout)
                while(!x){
    
                }
            }
        }catch{
            
        }
    
    
        await utils.sleep(1000)
    
    
        const confirm = global.app.client.$("#main-div > div.main-content > main > section > div > div > div.modal-footer > div.buttons > a:nth-child(1)");
        var ret = null;
        try{
            ret = await confirm.click();
        }catch{
            ret = null
        }
        if(ret == null){
            //preme su annulla
            try{
                await global.app.client.$("#main-div > div.main-content > main > section > div > div > div.modal-footer > div.buttons > a:nth-child(2)").click()
            }catch{
            }
        }
        return ret
    }
    




}

module.exports = {utils}