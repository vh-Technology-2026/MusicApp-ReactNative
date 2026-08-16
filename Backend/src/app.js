const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Forward requests to Cloudflare Worker router
app.all('*', async (req, res) => {
  try {
    const { router } = await import('./routes/index.js');
    const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    const headers = new Headers();
    Object.entries(req.headers).forEach(([k, v]) => {
      if (v) headers.set(k, Array.isArray(v) ? v.join(', ') : v);
    });

    const body = ['POST', 'PUT', 'PATCH'].includes(req.method)
      ? JSON.stringify(req.body)
      : undefined;

    const requestObj = new Request(fullUrl, { method: req.method, headers, body });
    const dummyEnv = globalThis.env || {};
    const workerRes = await router(requestObj, dummyEnv);

    res.status(workerRes.status);
    workerRes.headers.forEach((val, key) => res.setHeader(key, val));
    const data = await workerRes.text();
    res.send(data);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = app;
