const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

async function initialize(passport, getUserByEmail, getUserById) {
    const authenticateUser = async (email, password, done) => {
        getUserByEmail(email, async (user) => {
            if (user == null) {
                return done(null, false, { message: 'No user with that email' });
            }

            if (await bcrypt.compare(password, user.password)) {
                return done(null, user);
            } else {
                return done(null, false, { message: 'Password incorrect' });
            }
        });
    }

    passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser));
    passport.serializeUser((user, done) => done(null, user.id))
    passport.deserializeUser(async (id, done) => {
        getUserById(id, (user) => {
            return done(null, user);
        });
    });
}

module.exports = initialize;