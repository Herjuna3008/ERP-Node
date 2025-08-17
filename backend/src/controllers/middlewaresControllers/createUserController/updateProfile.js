const { AppDataSource } = require('@/typeorm-data-source');

const updateProfile = async (userModel, req, res) => {
  const User = AppDataSource.getRepository(userModel);

  const reqUserName = userModel.toLowerCase();
  const userProfile = req[reqUserName];

  if (userProfile.email === 'admin@admin.com') {
    return res.status(403).json({
      success: false,
      result: null,
      message: "you couldn't update demo informations",
    });
  }

  let updates = req.body.photo
    ? {
        email: req.body.email,
        name: req.body.name,
        surname: req.body.surname,
        photo: req.body.photo,
      }
    : {
        email: req.body.email,
        name: req.body.name,
        surname: req.body.surname,
      };
  // Find document by id and updates with the required fields
  let result = await User.findOne({ where: { id: userProfile.id, removed: false } });
  if (!result) {
    return res.status(404).json({
      success: false,
      result: null,
      message: 'No profile found by this id: ' + userProfile._id,
    });
  }
  User.merge(result, updates);
  result = await User.save(result);
  return res.status(200).json({
    success: true,
    result: {
      _id: result?.id,
      enabled: result?.enabled,
      email: result?.email,
      name: result?.name,
      surname: result?.surname,
      photo: result?.photo,
      role: result?.role,
    },
    message: 'we update this profile by this id: ' + userProfile.id,
  });
};

module.exports = updateProfile;
