const { literal, Op } = require("sequelize");
const { Extrafile } = require("../db");

const findExtraFiles = /https?:\/\/[a-zA-Z0-9.-]+(?::\d+)?\/public\/extraFiles\/[^\s'"()<>]+\.(png|jpe?g)/g;

async function useExtraFileHandler(text, type) {
    try {
        if (type === 'articles' || type === 'courses' || type === 'books') {
            const fileLinks = text.match(findExtraFiles);

            if (fileLinks) {
                await Extrafile.update(
                    { [type]: literal(`${type} + 1`) },
                    { where: { link: { [Op.in]: fileLinks } } }
                )
            }
        } else {
            throw Error('type must be articles or courses or books')
        }
    } catch (error) {
        return error
    }
}

async function removeExtraFileHandler(text, type) {
    try {
        if (type === 'articles' || type === 'courses' || type === 'books') {
            const fileLinks = text.match(findExtraFiles);

            if (fileLinks) {
                await Extrafile.update(
                    { [type]: literal(`${type} - 1`) },
                    { where: { link: { [Op.in]: fileLinks } } }
                )
            }
        } else {
            throw Error('type must be articles or courses or books')
        }
    } catch (error) {
        return error
    }
}

module.exports = {
    useExtraFileHandler,
    removeExtraFileHandler
}