
const protectedRoute = async (req,res) => {
    console.log('You are authenticated')
    // console.log('logged in user' , req.user)
    return res.status(200).json({ success: true, message: 'You are authenticated',  
      user: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email
      }
     });
}

module.exports = { protectedRoute }