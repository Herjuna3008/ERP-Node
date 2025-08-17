const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Joi = require('joi');
const shortid = require('shortid');
const { AppDataSource } = require('@/typeorm-data-source');

const resetPassword = async (req, res, { userModel }) => {
  const UserPasswordRepo = AppDataSource.getRepository(userModel + 'Password');
  const UserRepo = AppDataSource.getRepository(userModel);
  const { password, userId, resetToken } = req.body;

  const databasePassword = await UserPasswordRepo.findOne({ where: { user: { id: userId }, removed: false } });
  const user = await UserRepo.findOne({ where: { id: userId, removed: false } });

  if (!user.enabled)
    return res.status(409).json({
      success: false,
      result: null,
      message: 'Your account is disabled, contact your account adminstrator',
    });

  if (!databasePassword || !user)
    return res.status(404).json({
      success: false,
      result: null,
      message: 'No account with this email has been registered.',
    });

  const isMatch = resetToken === databasePassword.resetToken;
  if (!isMatch || databasePassword.resetToken === undefined || databasePassword.resetToken === null)
    return res.status(403).json({
      success: false,
      result: null,
      message: 'Invalid reset token',
    });

  // validate
  const objectSchema = Joi.object({
    password: Joi.string().required(),
    userId: Joi.string().required(),
    resetToken: Joi.string().required(),
  });

  const { error, value } = objectSchema.validate({ password, userId, resetToken });
  if (error) {
    return res.status(409).json({
      success: false,
      result: null,
      error: error,
      message: 'Invalid reset password object',
      errorMessage: error.message,
    });
  }

  const salt = shortid.generate();
  const hashedPassword = bcrypt.hashSync(salt + password);
  const emailToken = shortid.generate();

  const token = jwt.sign(
    {
      id: userId,
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  databasePassword.loggedSessions = databasePassword.loggedSessions || [];
  databasePassword.loggedSessions.push(token);
  databasePassword.password = hashedPassword;
  databasePassword.salt = salt;
  databasePassword.emailToken = emailToken;
  databasePassword.resetToken = shortid.generate();
  databasePassword.emailVerified = true;
  await UserPasswordRepo.save(databasePassword);

  if (
    resetToken === databasePassword.resetToken &&
    databasePassword.resetToken !== undefined &&
    databasePassword.resetToken !== null
  )
    //  .cookie(`token_${user.cloud}`, token, {
    //       maxAge: 24 * 60 * 60 * 1000,
    //       sameSite: 'None',
    //       httpOnly: true,
    //       secure: true,
    //       domain: req.hostname,
    //       path: '/',
    //       Partitioned: true,
    //     })
    return res.status(200).json({
      success: true,
      result: {
        _id: user.id,
        name: user.name,
        surname: user.surname,
        role: user.role,
        email: user.email,
        photo: user.photo,
        token: token,
        maxAge: req.body.remember ? 365 : null,
      },
      message: 'Successfully resetPassword user',
    });
};

module.exports = resetPassword;
