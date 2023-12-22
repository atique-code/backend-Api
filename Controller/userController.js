const Validateuser = require("../Validator/validateUser")
const userModel = require("../Model/authModel")
const bcrypt = require("bcrypt")
require("dotenv").config()
const jwt = require("jsonwebtoken")
const nodemailer = require("nodemailer")

const secret_key = process.env.secret_key



exports.userCreated = async(req, res)=>{
    
    try {
        await Validateuser.validateAsync(req.body)
        const {email, password} = req.body
        let checkEmail = await userModel.findOne({email})

        if(checkEmail){
            return res.status(201).json({
                message: "user already created",
                data: checkEmail
            })
        }
        else {
            const hashFormPassword = await bcrypt.hash(password, 12);
            const OTP = Math.floor(Math.random()*900000);
            // console.log(OTP)

            req.body.password = hashFormPassword;
            req.body.otp = OTP;

            const user = userModel(req.body)
            await user.save()

            const token = jwt.sign({user_id: user._id}, secret_key, {expiresIn: "2h"})

            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.smtpemail,
                    pass: process.env.smtppasskey,
                  
                },
                tls: {
                    rejectUnauthorized: false
                }
            })

            const info = {
                from: process.env.smtpemail,
                to : email,
                subject: "Welcome to SMIT Mail service",
                    html : `
                        <h1>Verify your OTP</h1>
                        <p> your OTP is ${OTP} </p>
                    `
            }


            transporter.sendMail(info, (err, result)=>{
                if(err) {
                    console.log(err)
                }
                else {
                    console.log(result)
                    return res.status(201).json({
                        message: "user successfully create",
                        data: user,
                        token
                    })
                }
            })
                   
        }
        
    } catch (e) {
        return res.status(500).json({
            message: "internal server error",
            error: e
        })
    }
}



exports.verifyOtp = async (req,res)=>{
    try{
        const {body,headers} = req
        const {authorization} = headers
        const {OTP} = body
        console.log(OTP)
        if(!authorization){
            return res.status(401).json({
                message:"token not provide"
            })
        }
        else{
            if(OTP==undefined){
                return res.status(401).json({
                    message:"otp not provide"
                })
            }
            else if(OTP.length!=6){
                return res.status(401).json({
                    message:"Otp must be 6 letter"
                })
            }
            else{
                
                jwt.verify(authorization,secret_key,async(err,decode)=>{
                    if(err){
                        return res.status(401).json({
                            message:"unauthorization"
                        })
                    }
                    console.log(decode)
                    req.userid = decode.user_id
                    var userFind = await userModel.findById(req.userid)
                    console.log(userFind)
                    if(userFind.otp ==OTP){
                        await userFind.updateOne({
                            isVerify: true
                        })
                        return res.status(200).json({
                            message:"verify otp "
                        })
                    }
                    else{
                        return res.status(401).json({
                            message:"invalid otp"
                        })
                    }

                })
            }
        }

        

    }
    catch(e){
        return res.status(500).json({
            message: "Internal server error",
            error: e
        });


    }

}