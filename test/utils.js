const {db} = require ("./db.js");
const {global} = require ("./global.js");
const {info} = require("./set-before-test.js")
var robot = null
const path = require("path")

const utils={
    //funzione di wait
    sleep : time => new Promise(r => setTimeout(r, time)),

    //funzione per avviare l'applicazione
    start: async function(){
        await global.app.start()
        
        //se siamo su windows si utilizza robotjs
        if(info.os == "w"){
            robot = require("robotjs")
            
            // minimizza il terminale vuoto
            await robot.keyToggle("space", "down", ["alt"])
            await robot.keyTap("n")
            await utils.sleep(500)
            await robot.keyToggle("space", "up", ["alt"])
        }

        // //setta l'applicazione come finestra principale 
        // await global.app.browserWindow.setAlwaysOnTop(true);
        // await global.app.browserWindow.focus();

        //se siamo su linux l'applicazione non viene avviata da amministratore e quindi è necesssario inserire le credenziali
        if(info.os == 'l'){
            try{
                await utils.sleep(500)
                await global.app.client.$("#admin-username").setValue(info.adminUsername)
                await utils.sleep(500)
                await global.app.client.$("#admin-password").setValue(info.adminPassword)
                await utils.sleep(500)
                await global.app.client.$("#license-wrapper > div > div.col.s12.license-body > div > div.col.s3 > a").click()
                await utils.sleep(500)
                await global.app.client.waitUntilWindowLoaded()
                try{
                    //chiude il notification pop-up
                    await global.app.client.$("#main-div > div:nth-child(3) > span > div.notification > a").click();
                }catch{
                }
            }catch{
                console.log("Errore autenticazione")
            }
        }

        //Dopo il login attende che l'applicazione sia completamente avviata e non in caricamento
        var ok = null
        while(ok == null){
            try{
                ok = await global.app.client.$(info.ABOUT).getText()
            }catch{
                ok = null
                await utils.sleep(1000)
            }
        }
        
    },

    //return true se è apparso il pop up , altrimenti false 
    //param type: tipo di notifica: success | warning
    checkNotification: async function(type){
        var notification = null
        try{
            //titolo del pop-up
            notification = await global.app.client.$("#main-div > div:nth-child(3) > span > div.notification > div.header > p.title").getText();
        }catch{
            notification = null
        }
        //aggiorna lingua
        const language = await db.dbLanguage()
        var not = null
        switch(language){
            case 1: {
                if(type == "success") not = "Successo"
                else if(type == "warning") not = "Attenzione"
                break
            }
            case 2: {
                if(type == "success") not = "Success"
                else if(type == "warning") not = "Warning"
                break
            }
            case 3: {
                if(type == "success") not = "Exito"
                else if(type == "warning") not = "Atención"
                break
            }
        }
        return notification == not
    },
    //output titolo della notifica
    waitNotification: async function(){
        //attesa massima 60 secondi 
        var notification = null
        while(notification == null && i<30){
            try{
                //titolo del pop-up
                notification = await global.app.client.$("#main-div > div:nth-child(3) > span > div.notification > div.header > p.title").getText();
            }catch{
                notification = null
            }
            i++
            await utils.sleep(2000)
        }
        return notification
    },

    //seleziona il file con il nome dato in input nella cartella agile-tester/files
    //return true se tutto è andato bene, altrimenti false
    fileChooser: async function(fileName){
        var done = true
        //va nella sezione path
        try{
            for(i=0;i<5;i++){
                robot.keyTap("tab")
                await utils.sleep(100)
            }
            robot.keyTap("enter")
            await utils.sleep(200)
        }catch{
            done = false
        }

        //inserisce la path
        const p = path.join(path.dirname(__filename), "../files")
        try{
            robot.typeString(p)
            await utils.sleep(500)
            robot.keyTap("enter")
        }catch{
            done = false
        }

        //va nella sezione nome del file
        try{
            for(i=0;i<6;i++){
                robot.keyTap("tab")
                await utils.sleep(100)
            }
        }catch{
            done = false
        }

        //Inserisce il nome del file
        try{
            await robot.typeString(fileName)

            await utils.sleep(500)

            //preme invio per confermare
            robot.keyTap("enter")
        }catch{
            done = false
        }

        return done
    },

    resources:{
        //return true se la risorsa è stata creata con successo, false se non è stata creata e null se qualche passo intermedio non è andato a buon fine
        addLocalBrowser : async function (resourceName, resourceUrl) {

            var done = true
            //va in risorse
            const menu = global.app.client.$(info.RESOURCES);
            try{
                await menu.click();
            }catch{
                done = false
            }
            global.app.client.waitUntilWindowLoaded();


            await utils.sleep(1000)


            //clicca su add resource
            const addResource = global.app.client.$("#main-div > div.main-content > main > section > div > div.fixed-header > div > a");
            
            try{
                await addResource.click();
            }catch{
                done = false
            }
            global.app.client.waitUntilWindowLoaded();


            await utils.sleep(1000)


            //seleziona local browser
            const localBrowser = global.app.client.$("#add-connection-modal > div.custom-modal.open > div.modal-content > div > div > div.row > div.col.s12 > div.connection-col > div:nth-child(4) > label");
            try{
                await localBrowser.click();
            }catch{
                done = false
            }


            await utils.sleep(1000)


            //inserisce il nome 
            const text = global.app.client.$("#add-connection-name");
            try{
                text.click();
                await text.setValue(resourceName);
            }catch{
                done = false
            }


            await utils.sleep(1000)


            //inserisce l'url
            const url = global.app.client.$("#add-connection-server");
            try{
                url.click();
                await url.setValue(resourceUrl);
            }catch{
                done = false
            }


            await utils.sleep(1000)


            //preme ok per confermare
            const ok = global.app.client.$("#add-connection-modal.form > div.custom-modal.open > div.modal-footer > div.buttons > a:nth-child(1)");
            var ret = null;
            try{
                ret = await ok.click();
            }catch{
                ret = null
            }
            if(done){
                return ret != null
            }else{
                return null
            }
        },


        //return true se la risorsa è stata eliminata, false se la risorsa non è presente nella lista, null se ci sono stati problemi 
        deleteResource: async function(name){
            var done = true
            //va in risorse
            const menu = global.app.client.$(info.RESOURCES);
            try{
                await menu.click();
            }catch{
                done = false
            }
            global.app.client.waitUntilWindowLoaded();


            await utils.sleep(500)


            var del = null
            const length = await db.getResourceListLength();
            var n = null;
            var index = -1
            for(i = 0; i < length; i++){
                const base = "#connection"+i+" > div > div.connection-item-properties > div";
                try{
                    n = await global.app.client.$(base + " > div").getText();
                }catch{
                    done = false
                } 
                if(n == "agile_local " + name || n == "agile_remote " + name){
                    index = i
                }
            }


            await utils.sleep(500)


            if(index != -1){
                try{
                    await global.app.client.$("#connection"+index+" > div > div.block-item-delete > i").click()
                }catch{
                    done = false
                }
    
                await utils.sleep(500)
    
    
                try{
                    del = await global.app.client.$("#connection"+index+" > div.connection-modal > div.connection-footer > a:nth-child(2)").click()
                }catch{
                    done = false
                }
            }else{
                del = null
            }
            if(done){
                return del != null
            }else{
                return null
            }
        },

        //ritorna true se l'elemento cercato è nella lista, altrimenti false, null se ci sono errori
        //param type: citrix => 1, Microsoft => 2, VMware => 3, Local Browser => 4, Local Application => 5
        isInAgileList: async function(type, name){
            var done = true
            //va in risorse
            const menu = global.app.client.$(info.RESOURCES);
            try{
                await menu.click();
            }catch{
                done = false
            }
            global.app.client.waitUntilWindowLoaded();


            await utils.sleep(1000)


            const length = await db.getResourceListLength();
            var found = false;
            var n = null;
            
            for(i = 0; i < length; i++){
                //prendo le informazioni dell'elemento
                try{
                    n = await global.app.client.$("#connection"+i+" > div > div.connection-item-properties > div > div").getText();
                }catch{
                    done = false
                } 
                //controllo se elemento trovato e cercato corrispondono 
                switch(type){
                    //Citrix
                    case 1:{
                        if(n == "agile_remote " + name){
                            found = true 
                        }
                        break
                    }
                    //Microsoft
                    case 2:{
                        if(n == "agile_local " + name){
                            found = true 
                        }
                        break
                    }
                    //VMware
                    case 3:{
                        if(n == "agile_remote " + name){
                            found = true 
                        }
                        break
                    }
                    //Local Browser
                    case 4:{
                        if(n == "agile_local " + name){
                            found = true 
                        }
                        break
                    }
                    //Local Application 
                    case 5:{
                        if(n == "agile_local " + name){
                            found = true
                        }
                        break
                    }
                    default:{
                        done = false
                        break
                    }
                }
            }

            if(done){
                return found
            }else{
                return null
            }
        },

        //param resourceName: nome da assegnare alla risorsa, resourceInfo: nome della risorsa da aggiungere
        //ritorna true se la creazione è stata confermata, false altrimenti, null se ci sono stati errori
        addLocalApplication: async function(resourceName, resourceInfo){
            var done = true
            //va in risorse
            const menu = global.app.client.$(info.RESOURCES);
            var click = null;
            try{
                await menu.click();
            }catch{
                done = false
            }
            global.app.client.waitUntilWindowLoaded();


            await utils.sleep(1000)


            //clicca su add resource
            const addResource = global.app.client.$("#main-div > div.main-content > main > section > div > div.fixed-header > div > a");
            try{
                await addResource.click();
            }catch{
                done = false
            }
            global.app.client.waitUntilWindowLoaded();


            await utils.sleep(1000)


            //inserisce il nome 
            try{
                await global.app.client.$("#add-connection-name").setValue(resourceName)
            }catch{
                done = false
            }


            await utils.sleep(1000)


            //seleziona local app
            const localApp = global.app.client.$("#add-connection-modal > div.custom-modal.open > div.modal-content > div > div > div.row > div.col.s12 > div.connection-col > div:nth-child(5) > label");
            try{
                await localApp.click();
            }catch{
                done = false
            }


            await utils.sleep(1000)


            //clicca in file
            const file = global.app.client.$("#add-connection-modal > div > div.modal-content > div > div > div.row:nth-child(4) > div > div > div > div.waves-effect.btn > span")
            try{
                await file.click()
            }catch{
                done = false
            }

            await utils.sleep(1000)


            //inserisce il nome del file nel file picker (deve trovarsi nella directory agile-tester/files)
            if(await utils.fileChooser(resourceInfo) == false){
                done = false
            }

            await utils.sleep(1000)


            //preme su ok per confermare
            try{
                click = await global.app.client.$("#add-connection-modal > div > div.modal-footer > div > a:nth-child(1)").click()
            }catch(err){
                click = null
            }

            if(done){
                if(click != null){
                    return true
                }else{
                    return false
                }
            }else{
                return null
            }

        },
        //return true se ha aggiunto la risorsa, altrimenti false, null se ci sono errori
        addCitrix: async function(name, server, domain){
            var done = true
            //va in risorse
            const menu = global.app.client.$(info.RESOURCES);
            var click = null;
            try{
                await menu.click();
            }catch{
                done = false
            }
            global.app.client.waitUntilWindowLoaded();


            await utils.sleep(1000)


            //clicca su add resource
            const addResource = global.app.client.$("#main-div > div.main-content > main > section > div > div.fixed-header > div > a");
            try{
                await addResource.click();
            }catch{
                done = false
            }
            global.app.client.waitUntilWindowLoaded();


            await utils.sleep(1000)


            //seleziona citrix
            const citrix = global.app.client.$("#add-connection-modal > div.custom-modal.open > div.modal-content > div > div > div.row > div.col.s12 > div.connection-col > div:nth-child(1) > label");
            try{
                await citrix.click();
            }catch{
                done = false
            }


            await utils.sleep(500)


            //inserisce il nome 
            try{
                await global.app.client.$("#add-connection-name").setValue(name)
            }catch{
                done = false
            }


            await utils.sleep(1000)


            //inserisce il server 
            try{
                await global.app.client.$("#add-connection-server").setValue(server)
            }catch{
                done = false
            }

            await utils.sleep(1000)

            
            //inserisce il domain 
            try{
                await global.app.client.$("#add-connection-domain").setValue(domain)
            }catch{
                done = false
            }

            await utils.sleep(1000)


            //preme su ok per confermare
            try{
                click = await global.app.client.$("#add-connection-modal > div > div.modal-footer > div > a:nth-child(1)").click()
            }catch{
                click = null
            }

            if(done){
                if(click != null){
                    return true
                }else{
                    return false
                }
            }else{
                return null
            }            

        },
        //return true se la risorsa è stata aggiunta, altrimenti false, null se ci sono errori
        addMicrosoft: async function(name, resourceInfo){
            var done = true
            //va in risorse
            const menu = global.app.client.$(info.RESOURCES);
            var click = null;
            try{
                await menu.click();
            }catch{
                done = false
            }
            global.app.client.waitUntilWindowLoaded();


            await utils.sleep(1000)


            //clicca su add resource
            const addResource = global.app.client.$("#main-div > div.main-content > main > section > div > div.fixed-header > div > a");
            try{
                await addResource.click();
            }catch{
                done = false
            }
            global.app.client.waitUntilWindowLoaded();


            await utils.sleep(1000)


            //seleziona microsoft
            const citrix = global.app.client.$("#add-connection-modal > div.custom-modal.open > div.modal-content > div > div > div.row > div.col.s12 > div.connection-col > div:nth-child(2) > label");
            try{
                await citrix.click();
            }catch{
                done = false
            }


            await utils.sleep(500)


            //inserisce il nome 
            try{
                await global.app.client.$("#add-connection-name").setValue(name)
            }catch{
                done = false
            }


            await utils.sleep(1000)


            //clicca in file
            const file = global.app.client.$("#add-connection-modal > div > div.modal-content > div > div > div.row:nth-child(5) > div > div > div > div.waves-effect.btn > span")
            try{
                await file.click()
            }catch{
                done = false
            }

            await utils.sleep(1000)


            //inserisce il nome del file nel file picker (deve trovarsi nella directory agile-tester/files)
            if(await utils.fileChooser(resourceInfo) == false){
                done = false
            }

            await utils.sleep(1000)

            //preme su ok per confermare
            try{
                click = await global.app.client.$("#add-connection-modal > div > div.modal-footer > div > a:nth-child(1)").click()
            }catch{
                click = null
            }

            if(done){
                if(click != null){
                    return true
                }else{
                    return false
                }
            }else{
                return null
            }

        },

        //return true se l'ha creata, altrimenti false, null se ci sono stati errori
        addVMware: async function(name, server){
            var done = true
            //va in risorse
            const menu = global.app.client.$(info.RESOURCES);
            var click = null;
            try{
                await menu.click();
            }catch{
                done = false
            }
            global.app.client.waitUntilWindowLoaded();


            await utils.sleep(1000)


            //clicca su add resource
            const addResource = global.app.client.$("#main-div > div.main-content > main > section > div > div.fixed-header > div > a");
            try{
                await addResource.click();
            }catch{
                done = false
            }
            global.app.client.waitUntilWindowLoaded();


            await utils.sleep(1000)


            //seleziona VMware
            const citrix = global.app.client.$("#add-connection-modal > div.custom-modal.open > div.modal-content > div > div > div.row > div.col.s12 > div.connection-col > div:nth-child(3) > label");
            try{
                await citrix.click();
            }catch{
                done = false
            }


            await utils.sleep(1000)


            //inserisce il nome 
            try{
                await global.app.client.$("#add-connection-name").setValue(name)
            }catch{
                done = false
            }


            await utils.sleep(1000)


            //inserisce il server 
            try{
                await global.app.client.$("#add-connection-server").setValue(server)
            }catch{
                done = false
            }


            await utils.sleep(500)


            //preme su ok per confermare
            try{
                click = await global.app.client.$("#add-connection-modal > div > div.modal-footer > div > a:nth-child(1)").click()
            }catch{
                click = null
            }

            if(done){
                if(click != null){
                    return true
                }else{
                    return false
                }
            }else{
                return null
            }
        },
        //input: type: 1|2|3|4|5 identifica il tipo di risorsa, name: il nome della risorsa
        //output: true se il test ha prodotto una notifica di successo, false altrimenti, null in caso di errori
        test: async function(type, name){
            var done = true
            //va in risorse
            const menu = global.app.client.$(info.RESOURCES);
            try{
                await menu.click();
            }catch{
                done = false
            }
            global.app.client.waitUntilWindowLoaded();


            await utils.sleep(1000)


            const length = await db.getResourceListLength();
            var elem = false;
            var n = null;
            
            for(i = 0; i < length; i++){
                //prendo le informazioni dell'elemento
                try{
                    n = await global.app.client.$("#connection"+i+" > div > div.connection-item-properties > div > div").getText();
                }catch{
                    done = false
                } 
                //controllo se elemento trovato e cercato corrispondono 
                switch(type){
                    //Citrix
                    case 1:{
                        if(n == "agile_remote " + name){
                            elem = "#connection"+i
                        }
                        break
                    }
                    //Microsoft
                    case 2:{
                        if(n == "agile_local " + name){
                            elem = "#connection"+i
                        }
                        break
                    }
                    //VMware
                    case 3:{
                        if(n == "agile_remote " + name){
                            elem = "#connection"+i
                        }
                        break
                    }
                    //Local Browser
                    case 4:{
                        if(n == "agile_local " + name){
                            elem = "#connection"+i
                        }
                        break
                    }
                    //Local Application 
                    case 5:{
                        if(n == "agile_local " + name){
                            elem = "#connection"+i
                        }
                        break
                    }
                    default:{
                        done = false
                        break
                    }
                }
            }

            //preme sull'elemento
            try{
                await global.app.client.$(elem + " > div > div.connection-item-properties > div > div").click()
            }catch{
                done = false
            }

            await utils.sleep(1000)


            //preme su test
            try{
                global.app.client.$(elem + " > div.connection-modal > div.connection-footer > span > a.test-connection").click()
            }catch{
                done = false
                console.log("Errore click test")
            }

            await utils.sleep(1500)

            var not = null
            not = await utils.checkNotification("success")


            if(done){
                return not
            }else{
                return null
            }
        }

    },
    
    networkSettings:{

        //ritorna true se c'è una wifi disponibile con l'ssid dato, altrimenti false, null se qualcosa non ha funzionato
        checkSsid : async function (ssid) {
            var done = true
            //Va nella sezione impostazioni di rete
            const menu = global.app.client.$(info.NETWORK_SETTINGS);
            try{
                await menu.click();
            }catch{
                done = false
            }
            global.app.client.waitUntilWindowLoaded();


            await utils.sleep(1000)


            //Va nella sezione wifi
            const wifi = global.app.client.$("#ab > a");
            try{
                await wifi.click();
            }catch{
                done = false
            }
            global.app.client.waitUntilWindowLoaded();


            await utils.sleep(1000)


            //Clicca su aggiungi rete wifi
            const add = global.app.client.$("#wifiTab > div > div > div.header-inputs > a");
            try{
                await add.click();
            }catch{
                done = false
            }
            global.app.client.waitUntilWindowLoaded();


            await utils.sleep(1000)


            //apre la lista delle reti disponibili
            const button = global.app.client.$("#wifi");
            try{
                await button.click();
            }catch{
                done = false
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

            if(done){
                return ret != null
            }else{
                return null
            }
        },


        //ritorna true se ha confermato la wifi, false se la password non è corretta o la rete non è presente nell'elenco, null se qualcosa non ha funzionato
        saveWifi: async function (ssid, psw){
            var done = true
            const first = await utils.networkSettings.checkSsid(ssid)

            //inserisce la password
            const password = global.app.client.$("#add-connection-modal > div > div.modal-content > div > div > div.row:nth-child(4) > div > div > input");
            try{
                password.click();
                await password.setValue(psw);
            }catch{
                done = false
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
            if(done){
                return first && click != null
            }else{
                return null
            }
        }
    },

    deviceLock:{

        //ritorna true se ha creato la regola, altrimenti false, null se qualcosa non ha funzionato
        addRule: async function (vid, pid){
            var done = true
            const menu = global.app.client.$(info.DEVICE_LOCK);
            var click = null;
            try{
                await menu.click();
            }catch{
                done = false
            }
            global.app.client.waitUntilWindowLoaded();


            await utils.sleep(1500);
            

            const addRule = global.app.client.$("#main-div > div.main-content > main > section > div.fixed-header > div > div > a");
            try{
                await addRule.click();
            }catch{
                done = false
            }
            global.app.client.waitUntilWindowLoaded();


            await utils.sleep(1000)
            

            var v = global.app.client.$("#vid");
            try{
                v.click();
                await v.setValue(vid);
            }catch{
                done = false
            }


            await utils.sleep(1000)


            v = global.app.client.$("#pid");
            try{
                v.click();
                await v.setValue(pid);
            }catch{
                done = false
            }


            await utils.sleep(1000)


            const ok = global.app.client.$("#add-usb-rule-modal > div > div.modal-footer > div > a:nth-child(1)")
            try{
                click = await ok.click()
            }catch{
                click = null;
            }
            if(done){
                return click != null
            }else{
                return null
            }
        },
        //ritorna true se ha eliminato con successo, altrimenti false, null se ci sono errori
        deleteRule: async function(vid, pid){
            var done = true
            //va in impostazioi
            const menu = global.app.client.$(info.DEVICE_LOCK);
            try{
                await menu.click();
            }catch{
                done = false
            }
            global.app.client.waitUntilWindowLoaded();
            

            await utils.sleep(500)


            const length = await db.getDeviceLockListLength()

            await utils.sleep(500)
            var click = null
            var base = null
            var vidPid = null
            var index = null
            for(i=1; i<=length;i++){
                base = "#main-div > div.main-content > main > section > div.section-wrapper > div.usbredir-list > div > div:nth-child("+i+") > div"
                try{
                    vidPid = await global.app.client.$(base + " > div.usbredir-item-properties > div > div").getText()
                }catch{
                    done = false
                }
                if(vid != null && pid != null && vidPid == "Vid: "+vid+", Pid: "+pid){
                    index = i
                }else if((vid == null || vid == "") && pid != null && vidPid == "Pid: "+pid){
                    index = i
                }else if(vid != null && (pid == null || pid == "") && vidPid == "Vid: "+vid){
                    index = i
                }
                
            }
            if(index != null){
                try{
                    click = await global.app.client.$("#main-div > div.main-content > main > section > div.section-wrapper > div.usbredir-list > div > div:nth-child("+index+") > div > div.usbredir-item-delete > i").click()
                }catch(err){
                    done = false
                }
            }
            
            if(done){
                return click != null
            }else{
                return null
            }

        },

        //ritorna true se l'elemento è nella lista, false altrimenti, null in caso di errori
        isInAgileList: async function(vid, pid){
            var done = true
            //apre device lock menu
            const menu = global.app.client.$(info.DEVICE_LOCK);
            try{
                await menu.click();
            }catch{
                done = false
            }
            global.app.client.waitUntilWindowLoaded();


            await utils.sleep(1500);


            const length = await db.getDeviceLockListLength();
            const base = "#main-div > div.main-content > main > section > div.section-wrapper.with-header.scrollable > div > div"
            var found = false;
            var vidPid = null;
            for(i = 1; i <= length; i++){
                try{
                    vidPid = await global.app.client.$(base + " > div:nth-child("+i+") > div > div.usbredir-item-properties > div > div").getText();
                }catch{
                    done = false
                }
                if(vid != null && pid != null && vidPid == "Vid: "+vid+", Pid: "+pid){
                    found = true
                }else if((vid == null || vid == "") && pid != null && vidPid == "Pid: "+pid){
                    found = true
                }else if(vid != null && (pid == null || pid == "") && vidPid == "Vid: "+vid){
                    found = true
                } 
            }
            if(done){
                return found
            }else{
                return null
            }

        }
    },

    thinmanSettings: {
        //ritorna true se ha aggiunto l'address, altrimenti false, null se qualcosa non ha funzionato
        addAddress: async function(address, port, timeout){
            var done = true
            //va in thinman settings
            const menu = global.app.client.$(info.THINMAN_SETTINGS);
            try{
                await menu.click();
            }catch{
                done = false
            }
            global.app.client.waitUntilWindowLoaded();
        
        
            await utils.sleep(1000)
        
        
            //preme su add address
            const add = global.app.client.$('h5 > a');
            try{
                await add.click();
            }catch{
                done = false
            }
            global.app.client.waitUntilWindowLoaded();
        
        
            await utils.sleep(1000)
        
        
            //inserisce l'hostname
            const hostname = global.app.client.$("#new-address");
            try{
                hostname.click();
                await hostname.setValue(address);
            }catch{
                done = false
            }
        
        
            await utils.sleep(1000)
        
        
            //inserisce la porta
            const p = global.app.client.$("#new-port");
            
            try{
                p.click();
                
                if(port == ""){
                    //cancellazione manuale, con clearElement non funziona in questo caso
                    await new Promise(function (resolve, reject){
                        p.getValue().then(function(result){
                            for(i=0;i<result.length;i++){	
                                global.app.client.keys("Backspace");	
                            }
                            resolve(true)
                        })
                    }) 
                }else{
                    await p.setValue(port)
                }
            }catch{
                done = false
            }
        
        
            await utils.sleep(1000)
        
        
            //inserisce il timeout
            const t = global.app.client.$("#new-timeout");
        
            try{
                t.click()
                const val = timeout.toString()
                await new Promise(function (resolve, reject){
                    t.getValue().then(async function(result){
                        //cancella il valore predefinito
                        for(i=0;i<=result.length;i++){	
                            await global.app.client.keys("Backspace");	
                        }

                        await utils.sleep(500)

                        //inserisce manualmente il valore da settare
                        for(i=0;i<val.length;i++){
                            await global.app.client.keys(val[i])
                        }
                        resolve(true)
                    })
                })                    
            }catch{
                done = false
            }

        
            await utils.sleep(1000)
        
        
            const confirm = global.app.client.$("#main-div > div.main-content > main > section > div > div > div.modal-footer > div.buttons > a:nth-child(1)");
            var ret = null;
            try{
                ret = await confirm.click();
            }catch{
                ret = null
            }
            if(done){
                return ret != null
            }else{
                return null
            }
        },


        //return true se ha premuto sul bottone elimina, altrimenti false, null se qualcosa non ha funzionato
        deleteAddress: async function(address){
            var done = true
            //va in thinman settings
            const menu = global.app.client.$(info.THINMAN_SETTINGS);
            try{
                await menu.click();
            }catch{
                done = false
            }
            global.app.client.waitUntilWindowLoaded();


            await utils.sleep(1000)


            //numero di address agile 
            const length = await db.getThinManListLength();
            var thinman = "#main-div > div.main-content > main > section > div > ul > li > div.collapsible-body > div.row > div.col.s12 > ul"
            var child = null;
            //selector per il bottone da premere
            var elimina = null;
            //aggiorno lingua
            const language = await db.dbLanguage()
            //string per html che dipende dalla lingua in uso
            var indirizzo = null;
            if(language == 1) indirizzo = "Indirizzo"
            else if(language == 2) indirizzo = "Address"
            else if(language == 3) indirizzo = "Dirección"
            
            for(i=1;i<=length;i++){
                //cerco l'address che voglio eliminare
                child = thinman + " > li:nth-child("+i+") > div > div"
                //guardo se gli address corrispondono
                var x = null;
                try{
                    x = await global.app.client.$(child + " > div.address-info > div").getHTML();
                }catch{
                    done = false
                }
                if(x == "<div><b>"+indirizzo+":</b> "+ address +"</div>"){
                    //salvo elemento da eliminare per eliminarlo in seguito
                    elimina = "#main-div > div.main-content > main > section > div > ul > li > div.collapsible-body > div.row > div.col.s12 > ul > li:nth-child("+i+") > div > div > div.address-item-delete > i";
                }
            } 
            //bottone da premere per eliminare l'elemento
            var elim = null;
            try{
                elim = await global.app.client.$(elimina).click();
            }catch{
                elim = null
            }
            if(done){
                return elim != null
            }else{
                return null
            }
        },


        //return true se non l'address con l'hostname dato è nella lista, altrimenti false, null se qualcosa non ha funzionato
        isInAgileList: async function(address){
            var done = true
            //va in thinman settings
            const menu = global.app.client.$(info.THINMAN_SETTINGS);
            try{
                await menu.click();
            }catch{
                done = false
            }
            global.app.client.waitUntilWindowLoaded();


            await utils.sleep(1000)


            //numero di address agile 
            const length = await db.getThinManListLength();

            var thinman = "#main-div > div.main-content > main > section > div > ul > li > div.collapsible-body > div.row > div.col.s12 > ul"
            var child = null;
            //indica se ho trovato un'address con quell'hostname
            var found = false;
            //aggiorno lingua
            const language = await db.dbLanguage()
            //string per html che dipende dalla lingua in uso
            var indirizzo = null;
            if(language == 1) indirizzo = "Indirizzo"
            else if(language == 2) indirizzo = "Address"
            else if(language == 3) indirizzo = "Dirección"

            for(i=1;i<=length;i++){
                //cerco l'address
                child = thinman + " > li:nth-child("+i+") > div > div"
                //guardo se gli address corrispondono
                var x = null;
                try{
                    x = await global.app.client.$(child + " > div.address-info > div").getHTML();
                }catch{
                    done = false
                }
                if(x == "<div><b>"+indirizzo+":</b> "+ address +"</div>"){
                    //aggiorno found
                    found = true;
                }
            }
            if(done){
                return found
            }else{
                return null
            }
            
        },

        //return true se ha premuto sul bottone test ed è apparsa la notifica di successo, altrimenti false, null se qualcosa non ha funzionato
        testAddress: async function(address){
            var done = true
            //va in thinman settings
            const menu = global.app.client.$(info.THINMAN_SETTINGS);
            try{
                await menu.click();
            }catch{
                done = false
            }
            global.app.client.waitUntilWindowLoaded();


            await utils.sleep(1000)


            //numero di address agile 
            const length = await db.getThinManListLength();
            var thinman = "#main-div > div.main-content > main > section > div > ul > li > div.collapsible-body > div.row > div.col.s12 > ul"
            var child = null;
            //selector per il bottone da premere
            var test = null;
            //aggiorno lingua
            const language = await db.dbLanguage()
            //string per html che dipende dalla lingua in uso
            var indirizzo = null;
            if(language == 1) indirizzo = "Indirizzo"
            else if(language == 2) indirizzo = "Address"
            else if(language == 3) indirizzo = "Dirección"
            
            for(i=1;i<=length;i++){
                //cerco l'address che voglio eliminare
                child = thinman + " > li:nth-child("+i+") > div > div"
                //guardo se gli address corrispondono
                var x = null;
                try{
                    x = await global.app.client.$(child + " > div.address-info > div").getHTML();
                }catch{
                    done = false
                }
                if(x == "<div><b>"+indirizzo+":</b> "+ address +"</div>"){
                    //salvo elemento da testare per testarlo in seguito
                    test = "#main-div > div.main-content > main > section > div > ul > li > div.collapsible-body > div.row > div.col.s12 > ul > li:nth-child("+i+") > div > div > div:nth-child(2) > a";
                }
            } 
            //bottone da premere per testare l'elemento
            var t = null;
            try{
                t = await global.app.client.$(test).click();
            }catch{
                t = null
            }

            await utils.sleep(1500)

            //a volte ci mette un po' quindi attende fino a 60 secondi per ricevere la notifica e poi controlla il titolo
            const notTitle = await utils.waitNotification()

            const lan = await db.dbLanguage()
            var ok = false
            switch(lan){
                case 1: {
                    if(notTitle == "Successo") ok = true
                    break
                }
                case 2: {
                    if(notTitle == "Success") ok = true
                    break
                }
                case 3: {
                    if(notTitle == "Exito") ok = true
                    break
                }
            }

            if(done){
                return t != null && ok
            }else{
                return null
            }
        }
    },

    usbRedirection: {
        //return true se ha confermato la creazione della regola, false altrimenti, null se qualcosa non ha funzionato 
        addRule: async function(description, vid, pid){
            var done = true
            //Apre menù USB Redirection
            const menu = global.app.client.$(info.USB_REDIRECTION);
            try{
                await menu.click();
            }catch{
                done = false
            }
            global.app.client.waitUntilWindowLoaded();


            await utils.sleep(1000)


            //clicca add redirection rule
            const button = global.app.client.$('#citrix > div > div > div > a');
            try{
                await button.click();
            }catch{
                done = false
            }
            global.app.client.waitUntilWindowLoaded();


            await utils.sleep(1000)


            //inserisce descrizione 
            const d = global.app.client.$("#description");
            try{
                d.click();
                await d.setValue(description);
            }catch{
                done = false
            }


            await utils.sleep(1000)


            //inserisce il vid
            if(vid != null){
                const v = global.app.client.$("#vid");
                try{
                    v.click();
                    await v.setValue(vid);
                }catch{
                    done = false
                }
            }
            

            await utils.sleep(1000)


            //inserisce il pid

            if(pid != null){
                const p = global.app.client.$("#pid");
                try{
                    p.click();
                    await p.setValue(pid);
                }catch{
                    done = false
                }
            }


            await utils.sleep(1000)


            //conferma
            const ok = global.app.client.$("#add-usb-rule-modal > div.custom-modal.open > div.modal-footer > div.buttons > a:nth-child(1)");
            var click = null;
            try{
                click = await ok.click();
            }catch{
                click = null
            }
            if(done){
                return click != null
            }else{
                return null
            }
        },

        //return true se ha eliminato la regola, false altrimenti, null se ci sono stati errori 
        deleteRule: async function(vid, pid){
            var done = true
            //Apre menù USB Redirection
            const menu = global.app.client.$(info.USB_REDIRECTION);
            var click = null;
            try{
                await menu.click();
            }catch{
                done = false
            }
            global.app.client.waitUntilWindowLoaded();


            await utils.sleep(1000)


            const length = await db.getUSBRedirectionListLength()
            var base = null
            var vidPid = null
            var index = null
            for(i=1; i<=length;i++){
                base = "#citrix > div > div.usbredir-list > div > div:nth-child("+i+") > div"
                try{
                    vidPid = await global.app.client.$(base + " > div.usbredir-item-properties > div > p").getText()
                }catch{
                    done = false
                }
                if(vid != null && pid != null && vidPid == "Vid: "+vid+", Pid: "+pid){
                    index = i
                }else if((vid == null || vid == "") && pid != null && vidPid == "Pid: "+pid){
                    index = i
                }else if(vid != null && (pid == null || pid == "") && vidPid == "Vid: "+vid){
                    index = i
                }
                
            }
            if(index != null){
                try{
                    click = await global.app.client.$("#citrix > div > div.usbredir-list > div > div:nth-child("+index+") > div > div.usbredir-item-delete > i").click()
                }catch{
                    done = false
                }
            }
            
            if(done){
                return click != null
            }else{
                return null
            }

        },

        //return true se ha trovato la rule nella lista di agile, altrimenti false, null se ci sono errori
        findRule: async function(vid, pid){
            var done = true
            //apre menu usb redirection
            const menu = global.app.client.$(info.USB_REDIRECTION);
            try{
                await menu.click();
            }catch{
                done = false
            }
            global.app.client.waitUntilWindowLoaded();


            await utils.sleep(500)


            //numero di address agile 
            const length = await db.getUSBRedirectionListLength();

            //indica se ho trovato un'address con quell'hostname
            var found = false;
            var vidPid = null;

            for(i = 1; i <= length; i++){
                try{
                    vidPid = await global.app.client.$("#citrix > div > div.usbredir-list > div > div:nth-child("+i+") > div > div.usbredir-item-properties > div > p > span").getText();
                }catch{
                    done = false
                }
                if(vid != null && pid != null && vidPid == "Vid: "+vid+", Pid: "+pid){
                    found = true
                }else if((vid == null || vid == "") && pid != null && vidPid == "Pid: "+pid){
                    found = true
                }else if(vid != null && (pid == null || pid == "") && vidPid == "Vid: "+vid){
                    found = true
                }
            }

            if(done){
                return found
            }else{
                return null
            }
        }
    },

    startup: {
        //ritorna true se ha creato la startup, altrimenti false, null se qualcosa non ha funzionato
        addStartup: async function(name, command){
            var done = true
            //va in startup
            const menu = global.app.client.$(info.STARTUP);
            try{
                await menu.click();
            }catch{
                done = false
            }
            global.app.client.waitUntilWindowLoaded();


            await utils.sleep(1000)


            //preme su Add startup
            const button = global.app.client.$("#main-div > div.main-content > main > section > div > div.fixed-header > div > a")
            try{
                await button.click();
            }catch{
                done = false
            }
            global.app.client.waitUntilWindowLoaded();


            await utils.sleep(1000)


            //inserisce nome 
            const n = global.app.client.$("#name");
            try{
                n.click();
                await n.setValue(name);
            }catch{
                done = false
            }


            await utils.sleep(1000)


            //inserisce comando 
            const c = global.app.client.$("#command");
            try{
                c.click();
                await c.setValue(command);
            }catch{
                done = false
            }


            await utils.sleep(1000)


            //conferma
            const ok = global.app.client.$("#add-connection-modal.form > div.custom-modal.open > div.modal-footer > div.buttons > a:nth-child(1)");
            var ret = null;
            try{
                ret = await ok.click();
            }catch{
                ret = null
            }

            if(done){
                return ret != null
            }else{
                return null
            }
        }
    },
    
    remoteAssistance: {
        //ritorna true se remote assistance è enabled, altrimenti false. ritorna null se qualcosa non ha funzionato 
        enableRemoteAssistance: async function(){
            var done = true
            //va nella sezione remote assistance
            const menu = global.app.client.$(info.REMOTE_ASSISTANCE);
            try{
                await menu.click();
            }catch{
                done = false
            }
            global.app.client.waitUntilWindowLoaded();


            await utils.sleep(1000)

            var checkbox = null
            try{
                checkbox = global.app.client.$("#enable-remote-assistance")
            }catch{
                done = false
            }
            var val = null
            var isEnable = false
            try{
                val = await checkbox.getValue()
            }catch{
                done = false
            }
            if(val == "false"){
                const label = global.app.client.$("#main-div > div.main-content > main > section > div > div.row > div > label")
                try{
                    await label.click()
                    isEnable = true
                }catch{
                    done = false
                }
            }else if(val == "true"){
                isEnable = true
            }
            
            if(done){
                return isEnable
            }else{
                return null
            }
        },


        //input: valore da inserire
        //output: true se enable remote assistance e require user authorization sono spuntate e auto-accept after ... seconds ha il valore corretto, altrimenti false, null se qualcosa non ha funzionato
        setAutoAccept: async function(v){
            var done = true
            await utils.remoteAssistance.enableRemoteAssistance()
            await utils.sleep(500)
            var checkbox = global.app.client.$("#allow-reject")
            var val = null
            try{
                val = await checkbox.getValue()
            }catch{
                done = false
            }
            if(val == "false"){
                const label = global.app.client.$("#main-div > div.main-content > main > section > div > div.row:nth-child(2) > div > div.row:nth-child(2) > div > div > label")
                try{
                    await label.click()
                }catch{
                    done = false
                }
            }
            await utils.sleep(500)
            var isEnable = false
            val = null
            checkbox = global.app.client.$("#check-auto-accept")
            try{
                val = await checkbox.getValue()
            }catch{
                done = false
            }
            if(val == "false"){
                const label = global.app.client.$("#main-div > div.main-content > main > section > div > div.row:nth-child(2) > div > div.row:nth-child(2) > div > div.col > div > label")
                try{
                    await label.click()
                    isEnable = true
                }catch{
                    done = false
                }
            }else if (val == "true"){
                isEnable = true
            }
            await utils.sleep(500)
            const time = global.app.client.$("#auto-accept")
            if(isEnable){
                try{
                    time.click()
                    const val = v.toString()
                    await new Promise(function (resolve, reject){
                        time.getValue().then(function(result){
                            //cancella il valore predefinito
                            for(i=0;i<result.length;i++){	
                                global.app.client.keys("Backspace");	
                            }
                            //inserisce manualmente il valore da settare
                            for(i=0;i<val.length;i++){
                                global.app.client.keys(val[i])
                            }
                            resolve(true)
                        })
                    })                    
                }catch{
                    done = false
                }
            }


            await utils.sleep(1000)
            
            
            //preme sul menù per confermare 
            const menu = global.app.client.$(info.REMOTE_ASSISTANCE);
            try{
                await menu.click();
            }catch{
                done = false
            }

            await utils.sleep(500)

            const radb = await db.getRemoteAssistance()
            if(done){
                return (radb.enabled && radb.acceptance.allow_reject && radb.acceptance.auto_accept == v)
            }else{
                return null
            }
            
        }
    },
    
    agileAuthentication: {
        //input: 
            //ssid: ssid della wifi da scegliere
        //output: 
            //true se l'ssid è corretto, altrimenti false, null se qualcosa non ha funzionato
        checkWifiAuthenticationSsid: async function(ssid){
            var done = true
            //va nella sezione agile authentication
            const menu = global.app.client.$(info.AGILE_AUTHENTICATION);
            try{
                await menu.click();
            }catch{
                done = false
            }
            global.app.client.waitUntilWindowLoaded();


            await utils.sleep(1000)


            const dropdown = global.app.client.$("#main-div > div.main-content > main > section > div > div > div.input-field > div > input")
            var dataActivates = null
            try{
                dropdown.click()
                dataActivates = await dropdown.getAttribute("data-activates")
            }catch{
                done = false
            }


            await utils.sleep(500)


            const wifi = global.app.client.$("#"+dataActivates+" > li:nth-child(2)")
            try{
                wifi.click()
            }catch{
                done = false
            }

            await utils.sleep(500)


            try{
                global.app.client.$("#wifi").click()
            }catch{
                done = false
            }


            await utils.sleep(500)


            var ret = null
            try{
                ret = await global.app.client.$("span.network-ssid=" + ssid).click();
            }catch{
                ret = null
            }
            if(done){
                return ret != null
            }else{
                return null
            }
        },

        //input: 
            //ssid: ssid della wifi da scegliere
            //password: password della wifi da scegliere
        //output: 
            //true se tutto è andato a buon fine, altrimenti false
        addWifiAuthentication: async function(ssid, password){
            var done = true
            var classe = null

            await this.checkWifiAuthenticationSsid(ssid)

            await utils.sleep(500)

            const auth = global.app.client.$("#main-div > div > main > section > div > ul > li > div.collapsible-body > div.row:nth-child(2) > div > div > input")
            var dataActivates = null
            try{
                auth.click()
                dataActivates = await auth.getAttribute("data-activates")
            }catch{
                done = false
            }


            await utils.sleep(500)


            try{
                global.app.client.$("#"+dataActivates+" > li:nth-child(4)").click()
            }catch{
                done = false
            }


            await utils.sleep(500)


            const base = "#main-div > div > main > section > div > ul > li > div.collapsible-body > div.row:nth-child(4) > div > div"
            const psw = global.app.client.$(base+" > input")

            try{
                psw.click()
                await psw.setValue(password)
            }catch{
                done = false
            }


            await utils.sleep(500)


            //clicca altrove per confermare 
            try{
                global.app.client.$(info.AGILE_AUTHENTICATION).click()
            }catch{
                done = false
            }


            await utils.sleep(500)


            try{
                classe = await global.app.client.$(base).getAttribute("class")
            }catch{
                done = false
            }

            if(done){
                return classe == "password-element"
            }else{
                return null
            }   
        },

        addImprivata: async function(address){
            var done = true
            //va nella sezione agile authentication
            const menu = global.app.client.$(info.AGILE_AUTHENTICATION);
            try{
                await menu.click();
            }catch{
                done = false
            }
            global.app.client.waitUntilWindowLoaded();


            await utils.sleep(1000)


            //apre dropdown di scelta
            const dropdown = global.app.client.$("#main-div > div.main-content > main > section > div > div > div.input-field > div > input")
            var dataActivates = null
            try{
                dropdown.click()
                dataActivates = await dropdown.getAttribute("data-activates")
            }catch{
                done = false
            }


            await utils.sleep(500)


            //sceglie imprivata
            const imprivata = global.app.client.$("#"+dataActivates+" > li:nth-child(3)")
            try{
                await imprivata.click()
            }catch{
                done = false
            }

            await utils.sleep(500)


            //inserisce l'address 
            try{
                await global.app.client.$("#addres").setValue(address)
            }catch{
                done = false
            }


            await utils.sleep(500)


            //spunta ignora errori ssl
            try{
                if(await global.app.client.$("#ignoreSSL").getValue() == false){
                    await global.app.client.$("#ignoreSSL").click()
                }
            }catch{
                done = false
            }

            await utils.sleep(500)


            //preme altrove per confermare
            try{
                await global.app.client.$(info.AGILE_AUTHENTICATION).click()
            }catch{
                done = false
            }


            await utils.sleep(500)


            var ret = null
            const error = await global.app.client.$("#addres").getAttribute("aria-invalid")
            try{
                if(error == "true"){
                    ret = false
                }else if(error == "false"){
                    ret = true
                }
            }catch{
                done = false
            }



            if(done){
                return ret == true
            }else{
                return null
            }
        }
    },

    certificateManager: {
        getAgileListLength: async function(){
            var done = true
            //va in certificati
            const menu = global.app.client.$(info.CERTIFICATE_MANAGER);
            try{
                await menu.click();
            }catch{
                done = false
            }
            global.app.client.waitUntilWindowLoaded();


            await utils.sleep(1000)


            //itera nella lista e ne conta le righe 
            const list = "#main-div > div.main-content > main > section > div.section-wrapper"
            var num = 0
            var cont = true
            var x = null
            while(cont){
                x=null
                try{
                    x = await global.app.client.$(list + " > div:nth-child("+num+1+") > div").getHTML()
                    if(x != null) num++
                }catch{
                    cont = false
                }
            }

            if(done){
                return num
            }else{
                return null
            }
        },
        
        addCertificate: async function(name){

            const certNumber = await utils.certificateManager.getAgileListLength()
            var done = true
            //va in certificati
            const menu = global.app.client.$(info.CERTIFICATE_MANAGER);
            try{
                await menu.click();
            }catch{
                done = false
            }
            global.app.client.waitUntilWindowLoaded();


            await utils.sleep(1000)


            //clicca su import certificate
            const importCertificate = global.app.client.$("#main-div > div.main-content > main > section > div.fixed-header > div > div > div.waves-effect.btn-flat > span > i");
            try{
                await importCertificate.click();
            }catch{
                done = false
            }
            global.app.client.waitUntilWindowLoaded();


            await utils.sleep(1000)

            //inserisce il nome del file nel file picker (deve trovarsi nella directory agile-tester/files)
            if(await utils.fileChooser(name) == false){
                done = false
            }

            await utils.sleep(1000)

            var ret = false
            if(await utils.certificateManager.getAgileListLength() > certNumber){
                ret = true
            }

            if(done){
                return ret
            }else{
                return null
            }
        }
    }
    
}

module.exports = {utils}