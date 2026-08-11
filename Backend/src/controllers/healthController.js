const { sendSuccess } = require('../utils/responseHandler');

const getHealthStatus = (req, res) => {
  const healthInfo = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`
  };
  return sendSuccess(res, 'Server is running smoothly', healthInfo);
};

module.exports = {
  getHealthStatus
};
