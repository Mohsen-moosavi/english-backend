const fs = require('fs');
const path = require('path');


function removeImage(filename) {
    if (fs.existsSync(path.join(__dirname, '..', 'public', 'images', filename))) {
        fs.unlinkSync(path.join(__dirname, '..', 'public', 'images', filename))
    }
}

function removeIntroductionVideo(filename) {
    if (fs.existsSync(path.join(__dirname, '..', 'public', 'introductionVideo', filename))) {
        fs.unlinkSync(path.join(__dirname, '..', 'public', 'introductionVideo', filename))
    }
}

async function uploadCanceled(req,res,next){
    try {
        const {nicName} = req.query;
        if(fs.existsSync(path.join(__dirname,'..','public','introductionVideo','chunks'))){
            fs.readdir(path.join(__dirname,'..','public','introductionVideo','chunks'),(err,files)=>{
                files.map(file=>{
                    if(file.startsWith(`${nicName}___`)){
                        fs.unlinkSync(path.join(__dirname,'..','public','introductionVideo','chunks',file))
                    }
                })
            })
        }

        if(fs.existsSync(path.join(__dirname,'..','public','files','chunks'))){
            fs.readdir(path.join(__dirname,'..','public','files','chunks'),(err,files)=>{
                files.map(file=>{
                    if(file.startsWith(`${nicName}___`)){
                        fs.unlinkSync(path.join(__dirname,'..','public','files','chunks',file))
                    }
                })
            })
        }

        if(fs.existsSync(path.join(__dirname,'..','public','videos','chunks'))){
            fs.readdir(path.join(__dirname,'..','public','videos','chunks'),(err,files)=>{
                files.map(file=>{
                    if(file.startsWith(`${nicName}___`)){
                        fs.unlinkSync(path.join(__dirname,'..','public','videos','chunks',file))
                    }
                })
            })
        }
    } catch (error) {
        next(error)
    }
}

module.exports = {
    removeImage,
    removeIntroductionVideo,
    uploadCanceled
}