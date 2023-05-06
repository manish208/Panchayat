const express = require('express');
const cors = require('cors');
const path = require('path');
const mongodb = require('mongodb');
require('./db');

const registerData = require('./models/register')
const userData = require('./models/user');
const circularData = require('./models/circular')

const app = express();

app.use(express.urlencoded({extended: true})); 
app.use(cors({ origin: '*' }));

const { upload }  = require('./multer');

app.use(express.json())
//Circular API for get, post, and delete
app.get('/circulars', async (req, res) => {
    let data = await circularData.find();
    res.send(data);
});

app.post('/circulars', upload.single("attachFile"), async (req, res) => {
    console.log(req.file);
    let data = new circularData(req.body)
    try {
        data.attachFile = req.file.filename;
        let result = await data.save();
        console.log('filename', req.file);
        console.log(req.body);
        res.send({ success: true, message: "Circular Recorded" })
    } catch (error) {
        res.send({ success: false, message: "Circular No. Can't Be Duplicate." })
    }
})

app.get('/download/:filename', (req, res) => {
    const filePath = __dirname + '/upload/' + req.params.filename;
    res.setHeader('Content-Disposition', `attachment; filename=${req.params.filename}`);
    res.setHeader('Content-Type', 'application/pdf'); // set the Content-Type header to application/pdf
    res.sendFile(filePath);
  });

app.delete('/circulars/:id', (req, res)=>{
    let id = req.params.id;
    circularData.findByIdAndDelete(id).then((result)=>{
        res.status(200).send(result)
    }).catch((err)=>{
        res.status(500).send(err);
    })
})
/*
app.delete('/circulars/:id', async (req, res)=>{
    console.log(req.params.id)
    let data  = circularData;
    const result = await data.deleteOne({_id: new mongodb.ObjectId(req.params.id)})
    res.send(result);
})
*/

//Users get API
app.get('/users', async (req, res)=>{
    let data = await userData.find();
    res.status(200).send(data);
});

app.post('/admin', async (req, res) => {
    let query = {
        username: req.body.username,
        password: req.body.password
    }
    let data = await userData.find(query);
    console.log(data);
    if (data.length == 0) {
        res.send({ success: false, message: "Invalid Login details" })
    } else {
        res.send({ success: true, message: "Account has been login" })
    }
})

app.post('/login', async(req, res) => {
    let query = {
        phone: req.body.phone,
        password: req.body.password
    };
        let getdata = await registerData.find(query);
        console.log(getdata);
        if(getdata.length==0){
            res.send({success: false, message: "Invalid Login details "})
        }
        res.send({success: true, message: "Account has been login "})
})

// Citizens post, get, update, delete API's
app.post('/citizens', upload.single("image"), async (req, res) => {
    console.log(req.file);
    let data = new registerData(req.body)
    try{
    data.imagePath = req.file.filename;
    let result = await data.save();
    console.log('filname',req.file);
    res.send({success: true, message: "Account has been created "})
    }catch(error){
        res.send({success: false, message: "Email Already Exists"})
    }
})

app.get('/citizens', async (req, res) => {
    let data = await registerData.find();
    res.send(data);
})
/*
app.delete('/citizens/:_id', async (req, res) => {
    let data = await registerData.findOneAndDelete({_id: req.params});
    console.log("Data" +data)
    res.status(200).send({success: true, message: "Record Deleted Sucessfully"})
}) */

app.delete('citizens/:_id', (req, res)=>{
    registerData.findOneAndDelete({_id: req.params.id})
    .then(()=>{
        res.send({status: 'Circular Deleted'})
    }).catch(err=>{
        res.send('Error ' +err)
    })
})

app.put('/citizens/:_id', async (req, res) => {
    console.log(req.params)
    let data = await registerData.updateOne(
        req.params,
        { $set: req.body }
    );
    res.status(200).send(data);
})

app.listen(4201, (err)=>{
    if(!err){
    console.log("Server Started...");
    }else{
        console.log("Server Stopped...");
    }
});