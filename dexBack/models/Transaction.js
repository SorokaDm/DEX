const mongoose = require("mongoose");
const { Schema } = mongoose;

const transactionSchema = new Schema({
  number: { type: Number, unique: true },
  user: { type: String, required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  input: { type: Number, required: true },
  output: { type: Number, required: true },
  status: { type: String, required: true },
});

transactionSchema.pre("save", async function (next) {
  try {
    if (!this.isNew) {
      return next(); // Якщо запис не новий, не змінюйте номер
    }
    const lastTransaction = await this.constructor
      .findOne()
      .sort({ number: -1 }); // Знайдіть останню транзакцію
    if (!lastTransaction) {
      this.number = 1; // Якщо немає інших транзакцій, встановіть номер на 1
    } else {
      this.number = lastTransaction.number + 1; // Збільште номер останньої транзакції на 1
    }
    next();
  } catch (error) {
    next(error);
  }
});

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
