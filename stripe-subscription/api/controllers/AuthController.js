const Utilities = require('../Utilities')
const User = require('../models/User')

class AuthController {

    async login(req, res){
        try {
            const user = await User.findOne({ email: req.body.email })
            if (!user) return Utilities.apiResponse(res, 422, 'User Not Registered', [])
            const isMatch = await user.isValidPassword(req.body.password)
            if (!isMatch) return Utilities.apiResponse(res, 422, 'Email or Password not valid', [])
            delete user._doc.password
            delete user._doc.__v
            const accessToken = await Utilities.signAccessToken(user._doc)
            Utilities.apiResponse(res, 200, 'User Loggedin Successfully!', {...user._doc, accessToken})
        } catch (error) {
            Utilities.apiResponse(res, 500, error)
        }
    }

    async signup(req, res){
        try {
            const doesExist = await User.findOne({ email: req.body.email })
            if (doesExist) return Utilities.apiResponse(res, 422, 'Email is already been registered')
            const user = new User(req.body)
            const savedUser = await user.save()
            let data = {
                _id: savedUser._id,
                name: savedUser.name,
                email: savedUser.email
            }
            const accessToken = await Utilities.signAccessToken(data)
            Utilities.apiResponse(res, 200, 'User Created Successfully!', {...data, accessToken})
        } catch (error) {
            Utilities.apiResponse(res, 500, error)
        }
    }

    async getUserDetails(req, res){
        try {
            const user = await User.findOne({_id: req.payload._id})
            Utilities.apiResponse(res, 200, 'Get User Details Successfully', user)
        } catch (error) {
            Utilities.apiResponse(res, 500, error)
        }
    }

}

module.exports = new AuthController();