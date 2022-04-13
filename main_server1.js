require('dotenv').config();
const express = require("express");
const app = express();
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');
const multer = require("multer");
const bodyParser = require("body-parser");
const ImageModel = require('./image.model');
const path = require("path/posix");
const crypto = require('crypto');
const {GridFsStorage} = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');

app.use(bodyParser.urlencoded({extended:true}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');
app.use(express.static("public"));


// mongoose.connect("mongodb://localhost:27017/userDB")
//         .then(()=>{
//             console.log("----userDB CONNECTION ESTABLISHED----");
//         })
//         .catch((err)=>{
//             console.log(err);
//         })
// ;


// const userSchema = new mongoose.Schema({
//     name: String,
//     userid: String,
//     password: String
// });
// userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ['password']});

// const User = new mongoose.model("User", userSchema);

        
        
// Mongo URI
const mongoURI = 'mongodb://localhost:27017/mongouploads';
// Create mongo connection
const conn = mongoose.createConnection(mongoURI);
// Init gfs
let gfs;
conn.once('open', () => {
  // Init stream
  console.log("Connceted..........")
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads');
});
// Create storage engine
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
      // console.log("fileee");
    return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
            if (err) {
                return reject(err);
            }
            const filename = buf.toString('hex') + path.extname(file.originalname);
            const fileInfo = {
                filename: filename,
                bucketName: 'uploads'
            };
            console.log(fileInfo.filename);
            resolve(fileInfo);
        });
    });
  }
});
const upload = multer({ storage });




app.get("/", (req, res)=>{
    res.render("login");
})

app.get("/login", (req, res)=>{
    res.render("login");
})

app.post("/register", (req, res)=>{
    const newUser = new User({
        name: req.body.name,
        userid: req.body.userid,
        password: req.body.passwd
    });

    newUser.save((err)=>{
        if(!err){
            res.render("secrets");
        }
        else console.log(err);
    });
});

app.post("/login", (req, res)=>{
    const userid= req.body.userid;
    const passwd= req.body.passwd;
    console.log("userid " + userid+ " "+ passwd);

    User.findOne({userid: userid}, (err, foundUser)=>{
        if(!err){
            if(foundUser) {
                console.log("User Found");
                if(foundUser.password===passwd){
                    res.render("secrets");
                }
                else console.log("Wrong Password!!");
            }
            else console.log("User does not exist");
        }
        else console.log(err);
    })
});





app.get("/upload", (req, res) => {
    gfs.files.find().toArray((err, files) => {
      // Check if files
        if (!files || files.length === 0) {
            res.render('wall', { files: false });
        } else {
            files.map(file => {
            if (
                file.contentType === 'image/jpeg' ||
                file.contentType === 'image/png'
            ) {
                file.isImage = true;
            } else {
                file.isImage = false;
            }
            });
            res.render('wall', { files: files });
        }
    });
});

app.post('/upload', upload.single('file'), (req, res) => {
    res.json({ file: req.file });
    res.redirect('/upload');
});



app.get('/files', (req, res) => {
    gfs.files.find().toArray((err, files) => {
      // Check if files
      if (!files || files.length === 0) {
        return res.status(404).json({
          err: 'No files exist'
        });
      }
      // Files exist
      return res.json(files);
    });
  });
  
  // @route GET /files/:filename
  // @desc  Display single file object
  app.get('/files/:filename', (req, res) => {
    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
      // Check if file
      if (!file || file.length === 0) {
        return res.status(404).json({
          err: 'No file exists'
        });
      }
      // File exists
      return res.json(file);
    });
  });
  
  // @route GET /image/:filename
  // @desc Display Image
  app.get('/image/:filename', (req, res) => {
    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
      // Check if file
      if (!file || file.length === 0) {
        return res.status(404).json({
          err: 'No file exists'
        });
      }
  
      // Check if image
      if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
        // Read output to browser
        const readstream = gfs.createReadStream(file.filename);
        readstream.pipe(res);
      } else {
        res.status(404).json({
          err: 'Not an image'
        });
      }
    });
  });
  


app.listen(3000, ()=>{
    console.log("Server started on PORT 3000");
});


//abc@sharma.in
//zxcvbnm