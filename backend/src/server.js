require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`VSMS API listening on http://localhost:${PORT}`);
  console.log(`Swagger docs at  http://localhost:${PORT}/api-docs`);
});
