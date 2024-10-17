const jwt = require('jsonwebtoken');
const RESPONSE = require("../constants/response");

const { MESSAGE } = require("../constants/message");
const { StatusCode } = require("../constants/HttpStatusCode");
const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        if (!token) {
            // return next('Please login to access the data');
            RESPONSE.Failure.Message = StatusCode.FORBIDDEN.message;
            return res.status(StatusCode.FORBIDDEN.code).send(RESPONSE.Failure);
        }
        const verify =  jwt.verify(token,"pravinApi", (err, decoded) => {
            if (err) {
                RESPONSE.Failure.Message = StatusCode.UNAUTHORIZED.message;
                return res.status(StatusCode.UNAUTHORIZED.code).send(RESPONSE.Failure);
            }
            req.user_id = decoded.user_id;
            next();
        });
    } catch (error) {
        RESPONSE.Failure.Message = StatusCode.UNAUTHORIZED.message;
        return res.status(StatusCode.UNAUTHORIZED.code).send(RESPONSE.Failure);
    }
};

module.exports = isAuthenticated;
