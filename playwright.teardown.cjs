// code adapted from https://chatgpt.com/share/67de7c9f-658c-8013-bf52-0f4e48431a31
module.exports = async () => {
  if (global.__MONGOD__) {
    await global.__MONGOD__.stop();
  }

  if (global.__BACKEND__) {
    global.__BACKEND__.kill();
  }
};
