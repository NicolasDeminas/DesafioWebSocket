const fs = require("fs");
const moment = require("moment");
const now = moment().format("DD/MM/YYYY HH:mm:ss");

const writeMessageFile = async (arr) => {
  await fs.promises.writeFile("./mensajes.txt", JSON.stringify(arr, null, 2), {
    encoding: "utf-8",
  });
};

const readMessageFile = async () => {
  let file = await fs.promises.readFile("./mensajes.txt", {
    encoding: "utf-8",
  });
  return file;
};

class Mensajes {
  constructor() {
    this.message = [];
  }

  async save(message) {
    let fileExits = await readMessageFile(); //String
    if (fileExits && fileExits.length >= 0) {
      let dataFile = JSON.parse(fileExits);
      message.id = dataFile.length + 1;
      message.fecha = now;
      dataFile.push(message);
      this.message = dataFile;
      writeMessageFile(this.message);
    } else {
      message.id = 1;
      message.fecha = now;
      this.message.push(message);
      writeMessageFile(this.message);
    }
  }

  async getAll() {
    let fileExists = await readMessageFile();
    if (fileExists && fileExists.length >= 0) {
      let fileData = JSON.parse(fileExists);
      //console.log(fileData.length);
      return fileData;
    }
  }
}

module.exports = Mensajes;
