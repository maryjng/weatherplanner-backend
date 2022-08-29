const express = require("express");
const cors = require("cors");

const { NotFoundError } = require("./expressError");

const { authenticateJWT } = require("./middleware/auth");
const authRoutes = require("./routes/auth");
const appointmentsRoutes = require("./routes/appointments");
const usersRoutes = require("./routes/users");
const apiRoutes = require("./routes/weatherapi")

const morgan = require('morgan');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));
app.use(authenticateJWT);

// app.use('/api', require('./routes/api.route'));
app.use("/auth", authRoutes);
app.use('/appointments', appointmentsRoutes)
app.use('/users', usersRoutes)
app.use('/weatherapi', apiRoutes)


app.use(function (err, req, res, next) {
  if (process.env.NODE_ENV !== "test") console.error(err.stack);
  const status = err.status || 500;
  const message = err.message;

  return res.status(status).json({
    error: { message, status },
  });
});

module.exports = app;

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 @ http://localhost:${PORT}`));
