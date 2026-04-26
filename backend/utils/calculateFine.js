/**
 * Calculate fine for a late book return
 * @param {Date} dueDate - The due date for the book return
 * @param {Date} returnDate - The actual return date
 * @param {Number} ratePerDay - Fine rate per day (default from env)
 * @returns {Number} Fine amount (0 if returned on time)
 */
const calculateFine = (dueDate, returnDate, ratePerDay) => {
  const rate = ratePerDay || parseInt(process.env.FINE_PER_DAY) || 5;
  const due = new Date(dueDate);
  const returned = new Date(returnDate);

  if (Number.isNaN(due.getTime())) {
    throw new Error('Invalid due date provided');
  }
  if (Number.isNaN(returned.getTime())) {
    throw new Error('Invalid return date provided');
  }

  // No fine if returned on or before due date
  if (returned <= due) {
    return 0;
  }

  // Calculate difference in days
  const diffTime = returned.getTime() - due.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays * rate;
};

module.exports = calculateFine;
