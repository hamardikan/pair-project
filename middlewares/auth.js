const isLoggedIn = (req, res, next) => {
    console.log('Session:', req.session); 
    if (!req.session.user) {
        const error = 'Please login first'
        return res.redirect(`/login?error=${error}`)
    }
    next()
}

const isNotLoggedIn = (req, res, next) => {
    if(req.session.user){
        const error = 'You are already logged in';
        return res.redirect("/");
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

module.exports = { isLoggedIn, isAdmin, isNotLoggedIn }