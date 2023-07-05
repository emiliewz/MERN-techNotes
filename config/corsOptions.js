const allowedOrigins = require("./allowedOrigins");

const corsOptions = {
  origin: (origin, callback) => {
    // allows allowedOrigins or other debug tools, such as postman,
    // which does not provide an origin to access our REST API
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      // first param, err, we do not have an error, so set to null
      // second param, allowed boolean, since it is sucessful, so we set it to true
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  //set the access control allow credentials header
  credentials: true,
  optionsSuccessStatus: 200,
};

module.exports = corsOptions;
