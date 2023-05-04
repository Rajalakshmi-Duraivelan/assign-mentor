const express = require("express");
const mongodb = require('mongodb');
const { connections, mongo } = require("mongoose");
//const mongoose = require("mongoose");
const dotenv = require("dotenv").config();

const mongoclient = mongodb.MongoClient;


const app = express();
const URL = process.env.DB;

app.use(express.json());

let mentor=[];
let student =[];

app.get('/',(req,res) => {
    res.status(200).send("Mentor and Student Assigning with Database!!")
});

app.post('/create-mentor', async(req,res) => {
    try {
        const connection = await mongodb.MongoClient.connect(process.env.DB);
        const db = connection.db(process.env.dbName);
        const mentor = await db.collection("mentors").insertOne(req.body);
        await connection.close();
        res.json({ message: "Mentor created", id:mentor.insertedId});
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Something went wrong"});
    }
});

app.post('/create-student', async(req,res) => {
    try {
        const connection = await mongodb.MongoClient.connect(process.env.DB);
        const db = connection.db(process.env.dbName);
        const student = await db.collection("students").insertOne(req.body);
        await connection.close();
        res.json({ message: "Student created", id:student.insertedId});
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Internal server error"});
    }
});

app.get("/mentors",async (req,res) => {
    try {
        const connection = await mongodb.MongoClient.connect(process.env.DB);
        const db = connection.db(process.env.dbName);
        const mentor = await db.collection("mentors").find({}).toArray();
        await connection.close();
        res.json(mentor);
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Internal server error"})
    }
});

app.get("/students",async (req,res) => {
    try {
        const connection = await mongodb.MongoClient.connect(process.env.DB);
        const db = connection.db(process.env.dbName);
        const student = await db.collection("students").find({}).toArray();
        await connection.close();
        res.json(student);
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Internal server error"});
    }
});

app.put('/assign_student/:id', async(req,res) => {
    try {
        const connection = await mongoclient.connect(process.env.DB);
        const db = connection.db(process.env.dbName);
        console.log(db);
        
        const mentordata = await db.collection("mentors").findOne({ mentor_id: req.params.id });
        console.log(mentordata);
        if (mentordata) {
            // delete req.body.mentor_id;
            const mentor = await db.collection('mentors').updateOne({mentor_id:req.params.id}, { $set: req.body });
            await connection.close();
            res.json(mentor)
        }
        else {
            res.status(404).json({ message: "mentor not found" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Internal server error"});
    }
})

app.get('/mentor_student/:id', async(req,res)=>{
    try{
        const connection = await mongoclient.connect(process.env.DB);
        const db = connection.db(process.env.dbName);
        const mid = req.params;
        const mentor = await db.collection("mentors").findOne({_id: new mongodb.ObjectId(mid)});
        console.log(mentor,mid);
        await connection.close();
        if(mentor){
            res.json(`Students : ${mentor.student} assigned to ${mentor.name}`);
        }else{
            res.status(404).json({message: "No such mentor"});
        }
    }catch(error){
        console.log(error);
        res.status(500).json({message:"Internal Server Error"});
    }
});

app.put('/assign_change_mentor/:id', async(req,res) => {
    try {
        const connection = await mongodb.MongoClient.connect(process.env.DB);
        const db = connection.db(process.env.dbName);
        const studentdata = await db.collection("students").findOne({_id:mongodb.ObjectId(req.params.id)});
        if(studentdata){
            delete req.body.student_id;
            const student = await db.collection("students").updateOne({_id:mongodb.ObjectId(req.params.id)},{$set:req.body});
            await connection.close();
            res.json(student);
        }else{
            res.status(404).json({message:"No such student"});
        }
        await connection.close();
        res.json(student);
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Internal Server Error"});        
    }
})

app.listen(process.env.PORT, ()=> console.log("App started"));