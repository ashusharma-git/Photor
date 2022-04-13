require('dotenv').config();

const express = require("express");
const app = express();
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');
const multer = require("multer");
const bodyParser = require("body-parser");
const ImageModel = require('./image.model');
const path = require("path/posix");
const Jimp = require('jimp');
const session = require('express-session')
const passport = require('passport');
const PassportLocalMongoose  = require('passport-local-mongoose');



app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(express.static("public"));


app.use(session({
    secret: 'kitkatkitkit..',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
  


mongoose.connect("mongodb://localhost:27017/userDB")
        .then(()=>{
            console.log("----userDB CONNECTION ESTABLISHED----");
        })
        .catch((err)=>{
            console.log(err);
        })
;




const Storage = multer.diskStorage({
    destination: './public/uploads',
    filename: (req, file, cb)=>{
        cb(null, file.fieldname + '-' + Date.now()+path.extname(file.originalname));
        //cb(null, file.originalname);
    }
});
const upload = multer({
    storage: Storage
}).single('img')




const userSchema = new mongoose.Schema({
    // name: String,
    username: String,
    password: String
});
// userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ['password']});
userSchema.plugin(PassportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/", (req, res)=>{
    res.render("login");
})

app.get("/login", (req, res)=>{
    res.render("login");
})

app.post("/login", (req, res)=>{
    const userid= req.body.userid;
    const passwd= req.body.passwd;
    console.log("userid " + userid+ " "+ passwd);

    User.findOne({username: userid}, (err, foundUser)=>{
        if(!err){
            if(foundUser) {
                console.log("User Found");
                if(foundUser.password===passwd){
                    res.redirect("/upload");
                }
                else {
                    console.log("Wrong Password!!");
                    res.send("Wrong Password");
                }
            }
            else console.log("User does not exist");
        }
        else {
            console.log(err);
            res.send("No user found");
        }
    })
});

app.post("/register", (req, res)=>{
    const newUser = new User({
        // name: req.body.name,
        username: req.body.userid,
        password: req.body.passwd
    });

    newUser.save((err)=>{
        if(!err){
            res.render("login");
        }
        else console.log(err);
    });
});


app.get("/upload", (req, res)=>{
    ImageModel.find((err, images)=>{
        if(err) console.log(err);
        else {
            res.render("wall", {images: images})
        }
    })
    // res.render("wall.ejs");
})

app.post("/upload", (req, res)=>{
    upload(req, res, (err)=>{
        if(err) console.log(err);
        else {
            // console.log(req.file);
            // console.log(path.extname(req.file.originalname));
            const newImage = new ImageModel({
                name: req.file.filename,
                contentType: 'image'
            })
            newImage.save()
            .then(()=>{
                async function resize() { // Function name is same as of file name
                    // Reading Image
                    const image = await Jimp.read(`./public/uploads/${req.file.filename}`);
                    image.resize(750,Jimp.AUTO,Jimp.RESIZE_BEZIER, function(err){
                       if (err) throw err;
                    })
                    .quality(50)
                    .write(`./public/uploads/${req.file.filename}`);
                }
                resize();
               
                res.redirect("/upload");
            })
            .catch((err)=>console.log(err))
        }
    })
});




app.listen(3000, ()=>{
    console.log("Server started on PORT 3000");
});