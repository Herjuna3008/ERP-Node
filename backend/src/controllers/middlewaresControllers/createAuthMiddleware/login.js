const Joi = require('joi');

const authUser = require('./authUser');
const { AppDataSource } = require('@/typeorm-data-source');

const login = async (req, res, { userModel }) => {
  const UserPasswordRepository = AppDataSource.getRepository(userModel + 'Password');
  const UserRepository = AppDataSource.getRepository(userModel);
  const { email, password } = req.body;

  // validate
  const objectSchema = Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: true } })
      .required(),
    password: Joi.string().required(),
  });

  const { error, value } = objectSchema.validate({ email, password });
  if (error) {
    return res.status(409).json({
      success: false,
      result: null,
      error: error,
      message: 'Invalid/Missing credentials.',
      errorMessage: error.message,
    });
  }

  const user = await UserRepository.findOne({ where: { email: email, removed: false } });

  console.log(user);
  if (!user)
    return res.status(404).json({
      success: false,
      result: null,
      message: 'No account with this email has been registered.',
    });

  const databasePassword = await UserPasswordRepository.findOne({ where: { user: { id: user.id }, removed: false } });

  if (!user.enabled)
    return res.status(409).json({
      success: false,
      result: null,
      message: 'Your account is disabled, contact your account adminstrator',
    });

  //  authUser if your has correct password
  authUser(req, res, {
    user,
    databasePassword,
    password,
    UserPasswordRepository,
  });
};

module.exports = login;
