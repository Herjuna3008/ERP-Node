const Joi = require('joi');

const { AppDataSource } = require('@/typeorm-data-source');

const checkAndCorrectURL = require('./checkAndCorrectURL');
const sendMail = require('./sendMail');
const shortid = require('shortid');
const { loadSettings } = require('@/middlewares/settings');

const { useAppSettings } = require('@/settings');

const forgetPassword = async (req, res, { userModel }) => {
  const UserPasswordRepo = AppDataSource.getRepository(userModel + 'Password');
  const UserRepo = AppDataSource.getRepository(userModel);
  const { email } = req.body;

  // validate
  const objectSchema = Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: true } })
      .required(),
  });

  const { error, value } = objectSchema.validate({ email });
  if (error) {
    return res.status(409).json({
      success: false,
      result: null,
      error: error,
      message: 'Invalid email.',
      errorMessage: error.message,
    });
  }

  const user = await UserRepo.findOne({ where: { email: email, removed: false } });
  const databasePassword = await UserPasswordRepo.findOne({ where: { user: { id: user.id }, removed: false } });

  // console.log(user);
  if (!user)
    return res.status(404).json({
      success: false,
      result: null,
      message: 'No account with this email has been registered.',
    });

  const resetToken = shortid.generate();
  databasePassword.resetToken = resetToken;
  await UserPasswordRepo.save(databasePassword);

  const settings = useAppSettings();
  const idurar_app_email = settings['idurar_app_email'];
  const idurar_base_url = settings['idurar_base_url'];

  const url = checkAndCorrectURL(idurar_base_url);

  const link = url + '/resetpassword/' + user.id + '/' + resetToken;

  await sendMail({
    email,
    name: user.name,
    link,
    subject: 'Reset your password | idurar',
    idurar_app_email,
    type: 'passwordVerfication',
  });

  return res.status(200).json({
    success: true,
    result: null,
    message: 'Check your email inbox , to reset your password',
  });
};

module.exports = forgetPassword;
