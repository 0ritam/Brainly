//ugly way to remove complain error -<@ts-ignore> // to add teh declaration file using npm we have to use the following coomand-> npm install -d @types/express
import express from "express";
import jwt from "jsonwebtoken";
import { ContentModel, LinkModel, UserModel } from "./db";
import { JWT_PASSWORD } from "./config";
import { userMiddleware } from "./middleware";
import { random } from "./utils";
import cors from "cors";


const app = express();
app.use(express.json());
app.use(cors())


app.post("/api/v1/signup", async (req, res) => {
    // TODO: zod validation , hash the password
    const username = req.body.username;
    const password = req.body.password;

    try {
        await UserModel.create({
            username: username,
            password: password
        }) 

        res.json({
            message: "User signed up"
        })
    } catch(e) {
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
        title:req.body.title,
        //@ts-ignore
        userId: req.userId,
        tags: []
    })

    res.json({
        message:"Conetent Addded"
    })

})

app.get("/api/v1/content",userMiddleware,async(req, res) => {
    //@ts-ignore
    const userId = req.userId;
    const content  = await ContentModel.find({
        userId: userId

    }).populate("userId", "username")
    res.json({
        content
    })

})

app.delete("/api/v1/content",userMiddleware,async(req, res) => {
    const contentId = req.body.contentId
    
    await ContentModel.deleteMany({
        contentId,
        //@ts-ignore
        userId: req.userId
    })
    res.json({
        message:"Content Deleted"
    })


})

app.post("/api/v1/brain/share",userMiddleware, async (req, res) => {

      const share = req.body.share;
      if(share) {

        const existingLink = await LinkModel.findOne({
            //@ts-ignore
            userId: req.userId
        });

        if(existingLink){
            res.json({
                hash:existingLink.hash
            })
            return;
        }
        
        const hash = random(10)
        await LinkModel.create({
            //@ts-ignore
            userId:req.userId,
            hash :hash
        })

        res.json({
            hash
          })
      }  else{
        await LinkModel.deleteOne({
            //@ts-ignore
            userId: req.userId
        })
      }

      res.json({
        message:"Removed link"
      })
    


})

app.get("/api/v1/brain/:sharelink", async(req, res) => {

    const hash = req.params.sharelink;

    const link = await LinkModel.findOne({
        hash
    });

    if(!link) {
        res.status(411).json({
            message: "Sorry incorrect input"
        })
        return;
        
    }
    //userId  //this is called early return in js as i can also put this is in an elase also but you save intendation here by returning early
    const content = await ContentModel.find ({
        userId: link.userId
    })

    const user = await UserModel.findOne({
        _id: link.userId    //not userId bcoz in user table _id no userId

    })

    if(!user) {
        res.status(411).json({
            message: "User not forund , err should not ideally happen"
        })
        return;
    }

    res.json({
        username: user.username, //? optional chaining// but we made a !user : as it tell sthat if teh a link exists then logicaaly a user will be there also, but some case when we when we delete user from database but we dont remove link related to that user form the dtabase  
        content: content
    })

})

app.listen (3000);
