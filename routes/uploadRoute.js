const express = require("express");
const router = express.Router();

const upload = require("../middlewares/multer");
const Picture = require("../models/PictureModel");
const cloudinary = require("../config/cloudinary");
const asyncHandler = require("express-async-handler");

//POST Picture Route
router.post("/", upload.single("picture"), asyncHandler(async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path);

    //Create Image
    let picture = new Picture({
      name: req.body.name,
      link: result.secure_url,
      cloudinaryId: result.public_id,
      // user: '123'
    });

    //Save Picture
    const createdImage = await picture.save();

    if (createdImage) {
      res.status(201).json(createdImage);
    } else {
      res.status(400).json({ message: 'Cannot Post Picture'});
    }
  } catch (err) {
    console.log(err);
  }

}))

//GET Picture Route
router.get('/', asyncHandler(async (req, res) => {
  try {
    let pictures = await Picture.find().sort({ createdAt: -1 });
    if (pictures.length) {
      res.json(pictures)
    } else {
      res.status(400).json({ message: 'Pictures Not Found'});
    }
  } catch (err) {
    console.log(err)
    throw new Error('Picture Cannot Be Found')
  }
}))

//GET a Specific Picture
router.get('/:id', asyncHandler(async (req, res) => {
  try {
    // Find Picture by id
    let picture = await Picture.findById(req.params.id);

    if (picture) {
      res.json(picture)
    } else {
      res.status(400).json({ message: 'Picture Not Found'});
    }
  } catch (err) {
    console.log(err);
    throw new Error('Picture Cannot Be Found')
  }
}))

//Update Specific Picture
router.put('/:id', upload.single('picture'), asyncHandler(async (req, res) => {

  try {
    let picture = await Picture.findById(req.params.id);

    if (picture) {
      await cloudinary.uploader.destroy(picture.cloudinaryId)

      const result = await cloudinary.uploader.upload(req.file.path)

      if (!result) {
        return res.status(400).json({ message: 'Cannot Edit Picture!'});
      }

      const { name } = req.body;

      dataUpdate = {
        name: name || picture.name,
        link: result.secure_url || picture.link,
        cloudinaryId: result.public_id || user.cloudinaryId
      };

      picture = await Picture.findByIdAndUpdate(req.params.id, dataUpdate, { new: true })

      if (picture) {
        res.status(201).json(picture);
      } else {
        res.status(400).json({ message: 'Cannot Edit Picture'});
      }
    } else {
      res.status(400).json({ message: 'Picture Not Found'});
    }
  } catch (err) {
    console.log(err)
    throw new Error('Picture Cannot Be Found')
  }
}));

//Delete Picture Route
router.delete('/:id', asyncHandler(async (req, res) => {
  try {
    const picture = await Picture.findById(req.params.id);

    if (picture) {
      await cloudinary.uploader.destroy(picture.cloudinaryId)
      await picture.remove();

      res.json({ message: "Picture Deleted Successfully" });
    } else {
      res.status(400).json({ message: "Picture Not Found" });
    }
  } catch (err) {
    console.log(err)
    throw new Error('Picture Cannot Be Found')
  }
}));

module.exports = router;
