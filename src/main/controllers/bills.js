const Bill = require('../models/bill');

// Get all bills for the user
const getBills = async (req, res) => {
  try {
    const bills = await Bill.find({ user: req.user._id })
      .sort({ dueDate: 1 });
    res.send(bills);
  } catch (error) {
    res.status(500).send({ error: 'Error fetching bills' });
  }
};

// Create a new bill
const createBill = async (req, res) => {
  try {
    const bill = new Bill({
      ...req.body,
      user: req.user._id
    });
    await bill.save();
    res.status(201).send(bill);
  } catch (error) {
    res.status(400).send({ error: 'Error creating bill' });
  }
};

// Update a bill
const updateBill = async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'amount', 'dueDate', 'frequency', 'category', 'notes', 'autoPay', 'isActive'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' });
  }

  try {
    const bill = await Bill.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!bill) {
      return res.status(404).send();
    }

    updates.forEach(update => bill[update] = req.body[update]);
    await bill.save();
    res.send(bill);
  } catch (error) {
    res.status(400).send({ error: 'Error updating bill' });
  }
};

// Delete a bill
const deleteBill = async (req, res) => {
  try {
    const bill = await Bill.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!bill) {
      return res.status(404).send();
    }

    res.send(bill);
  } catch (error) {
    res.status(500).send({ error: 'Error deleting bill' });
  }
};

// Mark a bill as paid
const markAsPaid = async (req, res) => {
  try {
    const bill = await Bill.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!bill) {
      return res.status(404).send();
    }

    bill.paymentHistory.push({
      date: new Date(),
      amount: bill.amount,
      status: 'paid',
      method: 'manual'
    });

    // Update next due date based on frequency
    const nextDueDate = new Date(bill.dueDate);
    switch (bill.frequency) {
      case 'daily':
        nextDueDate.setDate(nextDueDate.getDate() + 1);
        break;
      case 'weekly':
        nextDueDate.setDate(nextDueDate.getDate() + 7);
        break;
      case 'monthly':
        nextDueDate.setMonth(nextDueDate.getMonth() + 1);
        break;
      case 'quarterly':
        nextDueDate.setMonth(nextDueDate.getMonth() + 3);
        break;
      case 'yearly':
        nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
        break;
    }

    bill.dueDate = nextDueDate;
    await bill.save();
    res.send(bill);
  } catch (error) {
    res.status(400).send({ error: 'Error marking bill as paid' });
  }
};

module.exports = {
  getBills,
  createBill,
  updateBill,
  deleteBill,
  markAsPaid
}; 