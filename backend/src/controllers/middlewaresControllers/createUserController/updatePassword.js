const bcrypt = require('bcryptjs');
const { generate: uniqueId } = require('shortid');
const { AppDataSource } = require('@/typeorm-data-source');

const updatePassword = async (userModel, req, res) => {
  const UserPassword = AppDataSource.getRepository(userModel + 'Password');

  const reqUserName = userModel.toLowerCase();
  const userProfile = req[reqUserName];

  let { password } = req.body;

  if (password.length < 8)
    return res.status(400).json({
      msg: 'The password needs to be at least 8 characters long.',
    });

  // Find document by id and updates with the required fields

  if (userProfile.email === 'admin@admin.com') {
    return res.status(403).json({
      success: false,
      result: null,
      message: "you couldn't update demo password",
    });
  }

  const salt = uniqueId();

  const passwordHash = bcrypt.hashSync(salt + password);

  const UserPasswordData = {
    password: passwordHash,
    salt: salt,
  };

  let resultPassword = await UserPassword.findOne({ where: { user: { id: req.params.id }, removed: false } });
  if (resultPassword) {
    resultPassword.password = passwordHash;
    resultPassword.salt = salt;
    resultPassword = await UserPassword.save(resultPassword);
  }

  // Code to handle the successful response

  if (!resultPassword) {
    return res.status(403).json({
      success: false,
      result: null,
      message: "User Password couldn't save correctly",
    });
  }

  return res.status(200).json({
    success: true,
    result: {},
    message: 'we update the password by this id: ' + userProfile.id,
  });
};

module.exports = updatePassword;
