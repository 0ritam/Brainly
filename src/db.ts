import mongoose, {model, Schema } from "mongoose";

mongoose.connect("mongodb+srv://ritam:brainly2115@brain.nywop.mongodb.net/brainly")

const UserSchema = new Schema({
    username :{type:String,required:true, unique:true},
    password: {type:String,required:true},  
});

const ContentSchema = new Schema({
    link: String,
    title:String,
    tags: [{type: mongoose.Types.ObjectId, ref: 'User'}],
    userId: {type: mongoose.Types.ObjectId, ref: 'User', required:true}
})

export const ContentModel = model("Content", ContentSchema);



export const UserModel = model("User", UserSchema);
