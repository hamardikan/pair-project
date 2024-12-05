const isLoggedIn = (req, res, next) => {
    if (!req.session.userId) {
        const error = 'Please login first'
        return res.redirect(`/login?error=${error}`)
    }
    next()
}

module.exports = { isLoggedIn }