const exp = require("express");
const userController = require("../Controller/userController")
const router = exp.Router();




router.post("/signup", userController.userCreated )
router.post("/verifyOtp", userController.verifyOtp)

router.post("/signin", (req, res)=>{
    console.log(req.body)
    res.send("Sign in user API")
})

module.exports = router