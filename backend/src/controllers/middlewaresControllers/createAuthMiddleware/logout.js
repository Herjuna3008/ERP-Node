const { AppDataSource } = require('@/typeorm-data-source');

const logout = async (req, res, { userModel }) => {
  const UserPassword = AppDataSource.getRepository(userModel + 'Password');

  // const token = req.cookies[`token_${cloud._id}`];

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extract the token

  const record = await UserPassword.findOne({ where: { user: { id: req.admin.id } } });
  if (token) {
    record.loggedSessions = (record.loggedSessions || []).filter((t) => t !== token);
  } else {
    record.loggedSessions = [];
  }
  await UserPassword.save(record);

  return res.json({
    success: true,
    result: {},
    message: 'Successfully logout',
  });
};

module.exports = logout;
