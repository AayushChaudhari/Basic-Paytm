const express = require('express');

const router = express.Router();
const zod = require("zod");
const jwt = require("jsonwebtoken");
const { User, Account } = require('../db');
const { authMiddleware } = require("../middleware");
const {JWT_SECRET} = require('../config');


const signupSchema = zod.object({
    userName: zod.string().email(),
    firstName: zod.string(),
    lastName: zod.string(),
    password: zod.string(),
})

const signinSchema = zod.object({
    userName: zod.string().email(),
    password: zod.string()
})

const updateBody = zod.object({
    password: zod.string().optional(),
    firstName: zod.string().optional(),
    lastName: zod.string().optional()
})

router.get("/me", authMiddleware, async (req,res) => {
    const userId = req.userId;
    const user = await User.findOne({_id:userId});
    if(user){
        res.json({
            firstName:user.firstName,
            lastName: user.lastName,
        });
    } else {
        res.status(404).json({
            message: "User not found"
        });
    }
})

router.post("/signup", async (req,res)=> {
    
    const {success} = signupSchema.safeParse(req.body);
    if(!success){
        return res.json({
            message:"Incorrect inputs"
        })
    }
    const existingUser = await User.findOne({
        userName: req.body.userName
    })
    if(existingUser) {
        return res.status(411).json({
            message:"Email already taken"
        })
    }
    const user = await User.create({
        userName: req.body.userName,
        password: req.body.password,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
    });
    const userId = user._id;

    await Account.create({
        userId,
        balance: 1 + Math.round((Math.random() * 10000)*100)
    })

    const token = jwt.sign({
        userId
    }, JWT_SECRET);
    res.json({
        message: "User Created Successfully",
        token: token
    })
})

router.post("/signin", async (req,res) => {
    const {success} = signinSchema.safeParse(req.body);
    if(!success) {
        return res.json({
            message: "Invalid Inputs"
        })
    }
    const user = await User.findOne({
        userName: req.body.userName,
        password: req.body.password
    });
    if(!user){
        return res.status(404).json({
            message: "User not found"
        })
    }
    
    const token = await jwt.sign({ userId: user._id }, JWT_SECRET);
    res.status(200).json({ token: token });
})

router.put("/",authMiddleware, async (req,res) => {
    const { success } = updateBody.safeParse(req.body);
    if(!success){
        res.status(411).json({
            message:"Error while updating information"
        })
    }

    await User.updateOne(req.body,{
        id:req.userId
    })
    res.json({
        message:"Updated Successfully"
    })
})

router.get("/bulk", async (req, res) => {
    const filter = req.query.filter || "";

    const users = await User.find({
        $or: [{
            firstName: {
                "$regex": filter
            }
        }, {
            lastName: {
                "$regex": filter
            }
        }]
    })

    res.json({
        user: users.map(user => ({
            userName: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id
        }))
    })
})

module.exports = router;