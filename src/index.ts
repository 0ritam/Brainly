//ugly way to remove complain error -<@ts-ignore> // to add teh declaration file using npm we have to use the following coomand-> npm install -d @types/express
import express from "express";
import jwt from "jsonwebtoken";
import { ContentModel, UserModel } from "./db";
import { JWT_PASSWORD } from "./config";
import { userMiddleware } from "./middleware";


const app = express();
app.use(express.json());


app.post("/api/v1/signup",(req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    try{
        UserModel.create({
            username: username,
            password:password
        })
        
        res.json({
            message: "User SignedUp Successfully"
        })
    } catch(e){
        res.status(411).json({
            message: "User already exists"
        })
    }
    
})

app.post("/api/v1/signin",async(req, res) => {

    const username = req.body.username;
    const password = req.body.password;

    const existingUser = await UserModel.findOne({
        username,
        password
    })

    if(existingUser) {
        const token = jwt.sign({
            id: existingUser._id
        }, JWT_PASSWORD)

        res.json({
            token
        })
    } else {
        res.status(403).json({
            message: "Incorrect Credentials"
        })
    }



})

app.post("/api/v1/content",userMiddleware, async (req, res) => {

    const link = req.body.link;
    const type = req.body.type;
    await ContentModel.create({
        link,
        type,
        //@ts-ignore
        userId: req.userId,
        tags: []
    })

    res.json({
        message:"Conetent Addded"
    })

})

app.get("/api/v1/content",(req, res) => {

})

app.post("/api/v1/content",(req, res) => {

})

app.post("/api/v1/brain/share",(req, res) => {

})

app.get("/api/v1/brain/:sharelink",(req, res) => {

})

app.listen (3000);
