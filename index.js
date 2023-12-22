const exp = require("express");
var parser = require("body-parser");
const bodyParser = require("body-parser");
const mainRouter = require("./Router/mainRouter")
const app = exp();
const port = 5000;
const mongoose = require("mongoose")
require("dotenv").config()

const dbUrl = process.env.ConnectionString
mongoose.connect(dbUrl)


const db = mongoose.connection

db.once("open",()=>{
    console.log("MONGODB CONNECT  ")
})

db.on("error",()=>{
    console.log("connect error ")
})

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.get("/", (req, res)=>{
    console.log("first API call here");
    res.send("API Called")
})

app.post("/", (req, res)=>{
    console.log(req.body)
    res.send("post API Called")
})

app.use(mainRouter)

//we have assign port here//
app.listen(port, ()=> {
    console.log("Nodejs is ruuning on the port ", port);
})