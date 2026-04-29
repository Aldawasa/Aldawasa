const https = require('https');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { phone } = JSON.parse(event.body || '{}');
  if (!phone) return { statusCode: 400, body: JSON.stringify({ error: 'phone required' }) };

  const ODOO_URL = 'health-path.erp-ksa.aumet.com';
  const DB = 'health-path.erp-ksa.aumet.com';
  const USER = 'sami@aumet.com';
  const PASS = 'Sami@1212';

  function xmlCall(path, body) {
    return new Promise((resolve, reject) => {
      const req = https.request(
        { hostname: ODOO_URL, path, method: 'POST', headers: { 'Content-Type': 'text/xml', 'Content-Length': Buffer.byteLength(body) } },
        (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => resolve(data));
        }
      );
      req.on('error', reject);
      req.write(body);
      req.end();
    });
  }

  try {
    // Step 1: authenticate
    const authBody = `<?xml version="1.0"?><methodCall><methodName>authenticate</methodName><params><param><value><string>${DB}</string></value></param><param><value><string>${USER}</string></value></param><param><value><string>${PASS}</string></value></param><param><value><struct></struct></value></param></params></methodCall>`;
    const authResp = await xmlCall('/xmlrpc/2/common', authBody);
    const uid = authResp.match(/<int>(\d+)<\/int>/)?.[1];
    if (!uid) return { statusCode: 500, body: JSON.stringify({ error: 'auth failed' }) };

    // Step 2: search by phone variants
    const variants = [phone, phone.replace(/^0/, '+966'), phone.replace(/^0/, '966')];

    for (const ph of variants) {
      const searchBody = `<?xml version="1.0"?><methodCall><methodName>execute_kw</methodName><params><param><value><string>${DB}</string></value></param><param><value><int>${uid}</int></value></param><param><value><string>${PASS}</string></value></param><param><value><string>res.partner</string></value></param><param><value><string>search_read</string></value></param><param><value><array><data><value><array><data><value><array><data><value><string>phone</string></value><value><string>=</string></value><value><string>${ph}</string></value></data></array></value></data></array></value></data></array></value></param><param><value><struct><member><name>fields</name><value><array><data><value><string>remaining_points</string></value></data></array></value></member><member><name>limit</name><value><int>1</int></value></member></struct></value></param></params></methodCall>`;
      const resp = await xmlCall('/xmlrpc/2/object', searchBody);

      if (resp.includes('remaining_points')) {
        const m = resp.match(/<name>remaining_points<\/name>\s*<value>\s*<(?:int|i4)>(\d+)<\/(?:int|i4)>/);
        const points = m ? parseInt(m[1]) : 0;
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify({ found: true, points })
        };
      }
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ found: false })
    };

  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
