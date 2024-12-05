const isLoggedIn = (req, res, next) => {
    console.log('Session:', req.session); 
    if (!req.session.user) {
        const error = 'Please login first'
        return res.redirect(`/login?error=${error}`)
    }
    next()
}

module.exports = { isLoggedIn }