const WINDOWS_AGILE_PATH = "C:\\Program Files (x86)\\Praim\\Agile\\AgileConfigurator\\AgileConfigurator.exe"
const LINUX_AGILE_PATH = "/usr/lib/agile-configurator/AgileConfigurator"
const ADMIN_USERNAME = "admin"
const ADMIN_PASSWORD = "admin"
const DP_PASS_WIN = "75FBCFC18643144DE9EC8F0DC8C099F2B7B105C3192DE68196231BA90669A9D8581D75FC5C1D14C1302D16A8567BBD3D19596A34A2B66F1A8ED2571B38CA7574BC8F05A96AC52FF6811375F1A3E3BF262A7C7E7A4C5572222D5CA3D923C24502B5A4D8AB59B1E3681084A9BF996D73B2560997FA29DDB65194F46DF43C0C1E43D21C9373E04587D212ECB3D954BEA5B99FE50C176E99FDEF13B6FD402B4FBEF0763F8735E34EC8611E5396C2E2345E6B730285FEF9BBB21B4379DBBF33AA4FF3D100EC13ABE330D2383B553BE543C1A75C7CBAF38BD3AFFDB31E4974621F92B2F7B3DD7350C5B36960C732D9CB2DF1D3CA614319523D08309889"
const DB_PASS_LIN = "014a181ba2253c6e8a248d52b6f245863abca7f98f526d554a7890e8b176bc0e1b4f71d050a6072299121cf741e7abdbe52e1f50109f4213987499570d43cdf78be179a5f685654710d2592fbc347e7e93dd7eb418770770d013e2b4d46fcba8e43b6b1a41359bde5581d4b22b7558a86e1b04e775a3279063321cb10bdc1b55cf1e78dc7b17048b7cf32d53b60b9e315412099ae86ecdceecf8102e8cfa9493c38efdd39b15c66b46ed2a34321b053a99e1e589fd5c0a7681830d2ab56448b7"

const info={
    //l: linux, w: windows
    env: 'w',

    //info sull'admin (per linux)
    adminUsername: null,
    adminPassword: null,

    //pass per l'accesso al database
    dbPassWin: null,
    dbPassLin: null,

    //path per l'app di Agile
    path: null,

    //ids
    SYSTEM_SETTINGS: null,
    NETWORK_SETTINGS: null,
    THINMAN_SETTINGS: null,
    REMOTE_ASSISTANCE: null,
    WRITE_FILTER: null,
    RESOURCES: null,
    STARTUP: null,
    CERTIFICATE_MANAGER: null,
    USB_REDIRECTION: null,
    DEVICE_LOCK: null,
    AGILE_AUTHENTICATION: null,
    MODE: null
}

before(function(){
    //path per l'app di Agile
    if(info.env == "w"){
        info.path = WINDOWS_AGILE_PATH
    }else if(info.env == "l"){
        info.path = LINUX_AGILE_PATH
    }

    //credenziali admin 
    info.adminUsername = ADMIN_USERNAME
    info.adminPassword = ADMIN_PASSWORD

    //password per accesso al database
    info.dbPassWin = DB_PASS_WIN
    info.dbPassLin = DB_PASS_LIN

    //id per windows e linux
    if(info.env == 'w' || info.env == 'l'){
        info.SYSTEM_SETTINGS = '#menu-link-1'
        info.NETWORK_SETTINGS = '#menu-link-2'
        info.THINMAN_SETTINGS = '#menu-link-3'
        info.REMOTE_ASSISTANCE = '#menu-link-4'
        info.WRITE_FILTER = '#menu-link-5'
        info.RESOURCES = '#menu-link-6'
        info.STARTUP = '#menu-link-7'
        info.CERTIFICATE_MANAGER = '#menu-link-8'
        info.USB_REDIRECTION = '#menu-link-10'
        info.DEVICE_LOCK = '#menu-link-11'
        info.AGILE_AUTHENTICATION = '#menu-link-12'
        info.MODE = '#menu-link-13'
    }
})