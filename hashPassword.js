const bcrypt = require('bcrypt');

(async () => {
  const hashed = await bcrypt.hash("user", 10);
  console.log("Hashed password:", hashed);
})();
