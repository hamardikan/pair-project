const isLoggedIn = (req, res, next) => {
    console.log('Session:', req.session); 
    if (!req.session.user) {
        const error = 'Please login first'
        return res.redirect(`/login?error=${error}`)
    }
    next()
}

const isAdmin = (req, res, next) => {
    if (req.session.user.role !== 'admin') {
        const error = 'Unauthorized access'
        return res.redirect(`/posts?error=${error}`)
    }
    next()
}

module.exports = { isLoggedIn, isAdmin }