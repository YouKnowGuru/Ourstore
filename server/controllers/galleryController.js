const { Gallery } = require('../models');
const { uploadToCloudinary } = require('../middleware/uploadMiddleware');

const getGallery = async (req, res) => {
  try {
    const { album } = req.query;
    
    const query = { isActive: true };
    if (album) query.album = album;

    const galleries = await Gallery.find(query).sort({ createdAt: -1 });

    res.json(galleries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createGallery = async (req, res) => {
  try {
    const { title, album } = req.body;
    
    const images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const url = await uploadToCloudinary(file, 'ourstore/gallery');
        images.push({ url, caption: '' });
      }
    }

    const gallery = await Gallery.create({
      title,
      album,
      images
    });

    res.status(201).json({
      message: 'Gallery created successfully',
      gallery
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addImages = async (req, res) => {
  try {
    const { id } = req.params;
    
    const gallery = await Gallery.findById(id);
    if (!gallery) {
      return res.status(404).json({ message: 'Gallery not found' });
    }

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const url = await uploadToCloudinary(file, 'ourstore/gallery');
        gallery.images.push({ url, caption: '' });
      }
    }

    await gallery.save();

    res.json({
      message: 'Images added successfully',
      gallery
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateImageCaption = async (req, res) => {
  try {
    const { id, imageId } = req.params;
    const { caption } = req.body;
    
    const gallery = await Gallery.findById(id);
    if (!gallery) {
      return res.status(404).json({ message: 'Gallery not found' });
    }

    const image = gallery.images.id(imageId);
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    image.caption = caption;
    await gallery.save();

    res.json({ message: 'Caption updated', gallery });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteImage = async (req, res) => {
  try {
    const { id, imageId } = req.params;
    
    const gallery = await Gallery.findById(id);
    if (!gallery) {
      return res.status(404).json({ message: 'Gallery not found' });
    }

    gallery.images = gallery.images.filter(img => img._id.toString() !== imageId);
    await gallery.save();

    res.json({ message: 'Image deleted', gallery });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteGallery = async (req, res) => {
  try {
    const { id } = req.params;
    
    const gallery = await Gallery.findByIdAndDelete(id);
    if (!gallery) {
      return res.status(404).json({ message: 'Gallery not found' });
    }

    res.json({ message: 'Gallery deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getGallery,
  createGallery,
  addImages,
  updateImageCaption,
  deleteImage,
  deleteGallery
};
