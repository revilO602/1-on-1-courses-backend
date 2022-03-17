const {db} = require('./init')
const {Course} = require('../models/Course')
const {User} = require('../models/User')
const {CourseCategory} = require('../models/CourseCategory')
const {CourseMaterial} = require('../models/CourseMaterial')
const {Timeslot} = require('../models/Timeslot')

async function createTables(){
    await db.sync({ force: true });
    console.log('DATABASE RESET')
    // const guitar = await Product.create({ name: "Guitar",
    //     image: "https://cdn.pixabay.com/photo/2013/07/12/15/06/guitar-149427_960_720.png", price: 20.56});
    // const drums = await Product.create({ name: "Drums",
    //     image: "https://cdn.pixabay.com/photo/2014/04/03/00/35/drums-308752_960_720.png", price: 20.56});
    // const piano = await Product.create({ name: "Piano",
    //     image: "https://cdn.pixabay.com/photo/2012/04/13/00/39/piano-31357_960_720.png", price: 20.56});
    // const advert = await Advert.create({ link: "https://cdn.pixabay.com/photo/2018/01/06/19/26/isolated-3065717_960_720.png",
    //     image: "https://cdn.pixabay.com/photo/2018/01/06/19/26/isolated-3065717_960_720.png"});
    // console.log("Creating products");
    // console.log(guitar.toJSON());
    // console.log(drums.toJSON());
    // console.log(piano.toJSON());
    // console.log("Creating advertisement");
    // console.log(advert.toJSON());
}

module.exports = {
    createTables: createTables,
}
