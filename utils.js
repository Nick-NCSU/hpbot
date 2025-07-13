const loadEnv = (key) => {
  if(process.env[key] === undefined) console.error(`Undefined environment variable ${key}`);
  return process.env[key];
}

module.exports = {
  loadEnv
}