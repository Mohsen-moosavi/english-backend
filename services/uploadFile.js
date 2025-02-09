const fs = require("fs")
const path = require("path");
const configs = require("../configs");

const mergeChunks = async (fileName, totalChunks) => {
      
  const chunkDir = path.join(__dirname , '..' , 'public' , 'files' , 'chunks');
  const mergedFilePath = path.join(__dirname , '..' , 'public' , 'files');
  
  if (!fs.existsSync(mergedFilePath)) {
    fs.mkdirSync(mergedFilePath);
  }
  
  const writeStream = fs.createWriteStream( path.join(mergedFilePath , fileName));
  try {
    for (let i = 0; i < totalChunks; i++) {
      const chunkFilePath = path.join(chunkDir , `${fileName}.part_${i}`);
      const chunkBuffer = await fs.promises.readFile(chunkFilePath);
      writeStream.write(chunkBuffer);
      fs.unlinkSync(chunkFilePath); // Delete the individual chunk file after merging
    }
    
    writeStream.end();
    return `${configs.domain}/public/files/${fileName}`
  } catch (error) {
    writeStream.end(); 
    fs.rmdirSync(path.join(__dirname , '..' , '..' , 'public' , 'files' , 'chunks') ,{ recursive: true, force: true })
  }
  };

  module.exports ={
    mergeChunks
  }