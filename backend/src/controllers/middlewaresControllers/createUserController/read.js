const { AppDataSource } = require('@/typeorm-data-source');

const read = async (userModel, req, res) => {
  const User = AppDataSource.getRepository(userModel);

  const tmpResult = await User.findOne({
    where: { id: req.params.id, removed: false },
  });
  // If no results found, return a successful response with an empty result
  if (!tmpResult) {
    return res.status(200).json({
      success: false,
      result: null,
      message: 'No document found ',
    });
  } else {
    // Return success response
    let result = {
      _id: tmpResult.id,
      enabled: tmpResult.enabled,
      email: tmpResult.email,
      name: tmpResult.name,
      surname: tmpResult.surname,
      photo: tmpResult.photo,
      role: tmpResult.role,
    };

    return res.status(200).json({
      success: true,
      result,
      message: 'we found this document ',
    });
  }
};

module.exports = read;
