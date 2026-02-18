const { User, Order, Product } = require('../models');

const getDashboardStats = async (req, res) => {
  try {
    const { from, to } = req.query;
    const dateFilter = {};
    if (from || to) {
      dateFilter.createdAt = {};
      if (from) dateFilter.createdAt.$gte = new Date(from);
      if (to) dateFilter.createdAt.$lte = new Date(to);
    }

    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalProducts = await Product.countDocuments({ status: 'active' });

    // For counts/revenue, we use the filter if provided, otherwise lifetime
    const totalOrders = await Order.countDocuments(dateFilter);

    const revenueMatch = { orderStatus: { $ne: 'Cancelled' }, ...dateFilter };
    const revenue = await Order.aggregate([
      { $match: revenueMatch },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'fullName email');

    const topProducts = await Product.find({ status: 'active' })
      .sort({ salesCount: -1 })
      .limit(5)
      .select('title salesCount price images');

    const ordersByStatus = await Order.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } }
    ]);

    // Sales History
    let historyStart = new Date();
    if (from) {
      historyStart = new Date(from);
    } else {
      historyStart.setDate(historyStart.getDate() - 7);
    }

    const historyMatch = {
      createdAt: { $gte: historyStart },
      orderStatus: { $ne: 'Cancelled' }
    };
    if (to) historyMatch.createdAt.$lte = new Date(to);

    const salesHistory = await Order.aggregate([
      { $match: historyMatch },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$total" },
          orders: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // Low Stock Alert
    const lowStockItems = await Product.find({ stock: { $lt: 10 }, status: 'active' })
      .limit(5)
      .select('title stock price images');

    // Unread Messages Count
    const { Message } = require('../models');
    const unreadMessagesCount = await Message.countDocuments({ isRead: false });

    // Live Activity Feed (Mixed Orders and Messages)
    const recentMessages = await Message.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name subject createdAt');

    const recentActivity = [
      ...recentOrders.map(o => ({
        type: 'order',
        title: `New order #${o.orderNumber}`,
        user: o.isGuest ? o.guestInfo?.fullName : o.userId?.fullName,
        amount: o.total,
        time: o.createdAt
      })),
      ...recentMessages.map(m => ({
        type: 'message',
        title: `Message: ${m.subject}`,
        user: m.name,
        time: m.createdAt
      }))
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 10);

    res.json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue: revenue[0]?.total || 0,
      recentOrders,
      topProducts,
      ordersByStatus,
      salesHistory,
      lowStockItems,
      unreadMessagesCount,
      recentActivity
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;

    const query = { role: 'user' };
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password -otp -otpExpiry -refreshToken')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id)
      .select('-password -otp -otpExpiry -refreshToken')
      .populate('wishlist', 'title price images');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const orders = await Order.find({ userId: id })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ user, orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      isActive: user.isActive
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  getUserDetails,
  toggleUserStatus
};
