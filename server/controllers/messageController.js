const { Message } = require('../models');

const createMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    const newMessage = await Message.create({
      userId: req.user?._id,
      name,
      email,
      subject,
      message
    });

    res.status(201).json({
      message: 'Message sent successfully',
      data: newMessage
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMessages = async (req, res) => {
  try {
    const { page = 1, limit = 20, isRead } = req.query;
    
    const query = {};
    if (isRead !== undefined) query.isRead = isRead === 'true';

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Message.countDocuments(query);

    res.json({
      messages,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMessage = async (req, res) => {
  try {
    const { id } = req.params;
    
    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Mark as read
    if (!message.isRead) {
      message.isRead = true;
      await message.save();
    }

    res.json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const replyToMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { reply } = req.body;
    
    const message = await Message.findByIdAndUpdate(
      id,
      { reply, repliedAt: new Date() },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Send reply email
    const { sendEmail } = require('../utils/emailService');
    await sendEmail(
      message.email,
      `Re: ${message.subject}`,
      `<p>Dear ${message.name},</p><p>${reply}</p>`
    );

    res.json({
      message: 'Reply sent successfully',
      data: message
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    
    const message = await Message.findByIdAndDelete(id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createMessage,
  getMessages,
  getMessage,
  replyToMessage,
  deleteMessage
};
