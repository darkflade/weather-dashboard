import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import axios from 'axios';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

const ip = String(process.env['SERVER_IP']);
const port = Number(process.env['SERVER_PORT']) || 4000;
const OW_KEY = process.env['OW_API_KEY'];
const OW_URL = process.env['OW_URL'];

const searchIp = process.env['SEARCH_IP'];
const searchPort = process.env['SEARCH_PORT'];
const searchAddress = searchIp + ':' + searchPort;
/*
app.get('/api/forecast', async (req, res) => {
  try {
    const query = req.query['q'];
    let language = req.query['lang'];
    if (!query) return res.status(400).json({ error: 'q required' });
    if (!language) language="en";

    const response = await axios.get(`${OW_URL}/forecast`, {
      params: {
        query,
        appid: OW_KEY,
        units: 'metric',
        lang: language,
        cnt: req.query['cnt'] || 8,
      },
    });

    return res.json(response.data);
  } catch (err: any) {
    console.error('OpenWeather error:', err?.response?.data || err.message);
    return res.status(502).json({ error: 'weather fetch failed' });
  }
});

// Пример для Rust-сервиса (поиск городов)
app.get('/api/search', async (req, res) => {
  const query = req.query['q'];
  if (!query) return res.json([]);
  try {
    // Rust сервис поднимаешь отдельно, тут только проксируешь
    const r = await axios.get(`http://${searchAddress}/search?q=${query}`);
    res.json(r.data);
  } catch (e) {
    console.error(e);
    res.status(502).json({ error: 'rust search unavailable' });
  }

  return;
});
*/
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

if (isMainModule(import.meta.url)) {
  app.listen(
    port,
    ip,
    0,
    (error) => {
    if (error) {
      throw error;
    }
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

export const reqHandler = createNodeRequestHandler(app);
