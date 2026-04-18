const Portfolio = require('../models/Portfolio');

// @desc    Create or get portfolio
// @route   POST /api/portfolio/create
exports.createPortfolio = async (req, res) => {
  try {
    let portfolio = await Portfolio.findOne({ userId: req.user._id });
    if (portfolio) {
      return res.status(400).json({ message: 'Portfolio already exists', portfolio });
    }

    portfolio = await Portfolio.create({
      userId: req.user._id,
      personalInfo: {
        fullName: req.user.name,
        email: req.user.email,
      },
    });

    res.status(201).json(portfolio);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get user's portfolio
// @route   GET /api/portfolio/user
exports.getUserPortfolio = async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ userId: req.user._id });
    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }
    res.json(portfolio);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update portfolio
// @route   PUT /api/portfolio/:id
exports.updatePortfolio = async (req, res) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id);
    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    if (portfolio.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedPortfolio = await Portfolio.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedPortfolio);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete portfolio
// @route   DELETE /api/portfolio/:id
exports.deletePortfolio = async (req, res) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id);
    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    if (portfolio.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Portfolio.findByIdAndDelete(req.params.id);
    res.json({ message: 'Portfolio deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get public portfolio by slug
// @route   GET /api/portfolio/public/:slug
exports.getPublicPortfolio = async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({
      slug: req.params.slug,
      isPublished: true,
    }).populate('userId', 'name avatar');

    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    res.json(portfolio);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Publish portfolio (generate slug)
// @route   PUT /api/portfolio/:id/publish
exports.publishPortfolio = async (req, res) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id);
    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    if (portfolio.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Generate slug from user's name
    let baseSlug = portfolio.personalInfo.fullName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Ensure slug uniqueness
    let slug = baseSlug;
    let counter = 1;
    while (await Portfolio.findOne({ slug, _id: { $ne: portfolio._id } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    portfolio.slug = slug;
    portfolio.isPublished = true;
    await portfolio.save();

    res.json({ slug: portfolio.slug, portfolio });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Upload portfolio image
// @route   POST /api/portfolio/upload-image
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const imageUrl = process.env.USE_CLOUDINARY === 'true'
      ? req.file.path
      : `/uploads/${req.file.filename}`;

    res.json({ url: imageUrl });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
