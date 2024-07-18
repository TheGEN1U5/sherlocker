const express = require('express')

const port = process.env.PORT || 5000
const app = express()
const forge = require('node-forge')
const dotenv = require('dotenv').config()



var multer = require('multer'); 
var fs = require('fs');
var path = require('path');
var bodyParser = require('body-parser')
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now())
    }
});
var upload = multer({ storage: storage });
var secretArr = process.env.SECRET.split('')
seedToKey = (seed)=>{
    var ED_KEYarr = []
    var ED_IVarr = []
    seedArr = seed.split("")
    for (let i = 0; i < seedArr.length; i++) {
        if (i%2 != 0){
            ED_KEYarr.push(seedArr[i])
        }else{
            ED_KEYarr.push(secretArr[parseInt(seedArr[i])])
        }
    }
    for (let i = 0; i < seedArr.length; i++) {
        if (i%2 == 0){
            ED_IVarr.push(seedArr[i])
        }else{
            ED_IVarr.push(secretArr[parseInt(seedArr[i])])
        }
    }
    ED_KEY = ED_KEYarr.join('')
    ED_IV = ED_IVarr.join('')
    return {key:ED_KEY , vector:ED_IV}
}
const encrypt = (message, key, iv) =>{
    var cipher = forge.cipher.createCipher('AES-CBC', key);
    cipher.start({iv: iv});
    cipher.update(forge.util.createBuffer(message));
    cipher.finish();
    var encrypted = cipher.output;
    return encrypted
}

const decrypt = (encrypted, key, iv)=>{
    var decipher = forge.cipher.createDecipher('AES-CBC', key);
    decipher.start({iv: iv});
    decipher.update(forge.util.createBuffer(encrypted));
    var decryptedStr = decipher.output.toString();
    return decryptedStr
}
var signatures = {
    JVBERi0: "application/pdf",
    "/9j": "image/jpeg", 
    "/9g": "image/jpeg", 
    R0lGODdh: "image/gif",
    iVBORw0KGgo: "image/png",
    RVhF: "application/exe",
    TVA0: "video/mp4",
    UEsDBB: "application/doc",
    UEsDBA: "application/zip"

}
  
function detectMimeType(b64) {
    for (var s in signatures) {
        if (b64.indexOf(s) === 0) {
            return signatures[s];
        }
    }
}
  
  

app.set('view-engine' ,'ejs')
app.use(express.urlencoded({extended: false}))
app.use(express.static(__dirname + '/public'))

app.listen(process.env.PORT || 5000, function(){
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
  });

app.get('/', (req, res) =>{
    res.render('index.ejs',{err: ''})
})
app.post('/encrypt', upload.single('file'), (req,res)=>{
    seed = req.body.seed
    filname = 
    data = {
        data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename))
    }
    buffer = data.data
    base64data = buffer.toString('base64')
    fs.unlinkSync(path.join(__dirname + '/uploads/' + req.file.filename))
    if(detectMimeType(base64data) == undefined){
        res.render('index.ejs', {err: "Sorry, this file type is unsupported. Please mail brycelynch2020@gmail.com to get this in the next version"})
    }
    else{
        encryptor=seedToKey(seed)
        encryptedData = encrypt(base64data, encryptor.key, encryptor.vector)
        var text = encryptedData
        res.set({'Content-Disposition': 'attachment; filename=\"data.txt\"','Content-type': 'text/txt'})
        res.send(text);
    }
})

app.get('/decrypt', (req, res)=>{
    res.render('decrypt.ejs')
})
app.post('/decrypt', upload.single('file'), (req,res)=>{
    seed = req.body.seed
    data = {
        data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename))
    }
    buffer = data.data
    string = buffer.toString('utf8')
    encryptedData = JSON.parse(string)
    encryptor=seedToKey(seed)
    decryptedData = decrypt(encryptedData, encryptor.key, encryptor.vector)
    cleanData = decryptedData.replace(/[\b\x07\x05\x10\x01\x02\x03\x04\x05\x06\x07\x08\x09]/g, '')
    extension = detectMimeType(cleanData).split('/')[1]
    res.render('success.ejs',{b64:cleanData,mime:detectMimeType(cleanData),ext:extension})
})
