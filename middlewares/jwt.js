const jwt = require("express-jwt");
const secret = process.env.JWT_SECRET;

const authenticate = jwt({
	secret: 'secret'
	// secret: secret
});

module.exports = authenticate;