const fs = require("fs")
const path = require("path");
const configs = require("../configs");

const mergeChunks = async (fileName, totalChunks , dirChunkPath) => {
      
  const chunkDir = path.join(__dirname , '..' , 'public' , dirChunkPath , 'chunks');
  const mergedFilePath = path.join(__dirname , '..' , 'public' , dirChunkPath);
  
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

    if(fs.existsSync(path.join(chunkDir , `${fileName}.part_${totalChunks}`))){
      const chunkBuffer = await fs.promises.readFile(path.join(chunkDir , `${fileName}.part_${totalChunks}`));
      writeStream.write(chunkBuffer);
      fs.unlinkSync(path.join(chunkDir , `${fileName}.part_${totalChunks}`))
    }
    
    writeStream.end();
    return `${configs.domain}/public/${dirChunkPath}/${fileName}`
  } catch (error) {
    writeStream.end(); 
    fs.rmdirSync(path.join(__dirname , '..' , '..' , 'public' , dirChunkPath , 'chunks') ,{ recursive: true, force: true })
  }
  };

  module.exports ={
    mergeChunks
  }