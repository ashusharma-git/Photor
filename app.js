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
const passportLocalMongoose  = require('passport-local-mongoose');



app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));


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
// mongoose.set("useCreateIndex", true);




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
userSchema.plugin(passportLocalMongoose);

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
    const user  = new User({
        username: req.body.userid,
        password: req.body.passwd
    });
    req.login(user, (err)=>{
        console.log("in 90");
        if(err){
            console.log(err);
        }
        else{
            console.log("in 96 "+ req.body.userid + req.body.passwd);
            passport.authenticate("local")(req, res, ()=>{
                console.log("in 97.  authenticated");
                res.send("logged in......");
            })
        }
    })
});

app.post("/register", (req, res)=>{

    User.register({username: req.body.userid}, req.body.passwd, (err, user)=>{
        if(err){
            console.log(err);
            res.redirect("/login");
        }
        else {
            console.log("user created......");
            passport.authenticate("local")(req, res, ()=>{
                console.log("user authenticated......");
                res.redirect("/upload");
            });
        }
    });

});


app.get("/upload", (req, res)=>{

    if(req.isAuthenticated()){
        ImageModel.find((err, images)=>{
            if(err) console.log(err);
            else {
                res.render("wall", {images: images})
            }
        })
    }
    else {
        res.redirect("/login");
    }
});

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
                async function resize() {
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

app.get("/logout", (req, res)=>{
    req.logout();
    res.redirect("/");
})


app.listen(3000, ()=>{
    console.log("Server started on PORT 3000");
});
