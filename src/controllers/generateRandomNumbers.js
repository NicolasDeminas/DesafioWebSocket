function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

process.on("message", (message) => {
  if (message === "generateRandomNumber") {
    let arr = [];

    const dependencies = JSON.parse(process.argv[2]).message;

    for (let i = 0; i < dependencies; i++) {
      let random = getRandomNumber(1, 1000).toString();
      arr.push(random);
    }
    let data = {};
    arr.map((x) => {
      if (!data[x]) {
        data[x] = 1;
      }
      if (data[x]) {
        data[x] = data[x] + 1;
      }
    });

    process.send(data);
  }
});
