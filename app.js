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
    R0lGODdh: "image/gif",
    R0lGODlh: "image/gif",
    iVBORw0KGgo: "image/png",
    RVhF: "application/exe",
    TVA0: "video/mp4"
}
  
function detectMimeType(b64) {
    for (var s in signatures) {
        if (b64.indexOf(s) === 0) {
            return signatures[s];
        }
    }
}
const b64toBlob = (b64Data, contentType='', sliceSize=512) => {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];
  
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);
  
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }
  
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }
  
    const blob = new Blob(byteArrays, {type: contentType});
    return blob;
}
  
  

app.set('view-engine' ,'ejs')
app.use(express.urlencoded({extended: false}))
app.use(express.static(__dirname + '/public'))

app.listen(process.env.PORT || 5000, function(){
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
  });

app.get('/', (req, res) =>{
    res.render('index.ejs')
})
app.post('/encrypt', upload.single('file'), (req,res)=>{
    seed = req.body.seed
    data = {
        data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename))
    }
    buffer = data.data
    base64data = buffer.toString('base64')
    encryptor=seedToKey(seed)
    encryptedData = encrypt(base64data, encryptor.key, encryptor.vector)
    var text = encryptedData
    res.set({'Content-Disposition': 'attachment; filename=\"data.txt\"','Content-type': 'text/txt'})
    res.send(text);
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
