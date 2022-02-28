function bodyDataHas(propertyName) {
    return function (req, res, nxt) {
      const { data = {} } = req.body;
  
      data[propertyName]
        ? nxt()
        : nxt({
            status: 400,
            message: `Must include ${propertyName} property`,
          });
    };
  }
  
  module.exports = bodyDataHas;