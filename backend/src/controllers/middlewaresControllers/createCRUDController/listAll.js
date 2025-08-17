const listAll = async (repository, req, res) => {
  const sort = req.query.sort || 'desc';
  const enabled = req.query.enabled;

  try {
    const where = { removed: false };
    if (enabled !== undefined) where.enabled = enabled;
    const result = await repository.find({
      where,
      order: { created: sort.toUpperCase() === 'ASC' ? 'ASC' : 'DESC' },
    });

    if (result.length > 0) {
      return res.status(200).json({
        success: true,
        result,
        message: 'Successfully found all documents',
      });
    } else {
      return res.status(203).json({
        success: false,
        result: [],
        message: 'Collection is Empty',
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      result: null,
      message: error.message,
    });
  }
};

module.exports = listAll;
