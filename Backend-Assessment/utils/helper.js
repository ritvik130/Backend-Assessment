const calculateTaskPriority = (dueDate) => {
    const today = new Date();
    const dueDateTime = new Date(dueDate);
  
    const timeDifference = dueDateTime.getTime() - today.getTime();
    const daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));
  
    if (daysDifference === 0) {
      // Due date is today
      return 0;
    } else if (daysDifference <= 2) {
      // Due date is between tomorrow and day after tomorrow
      return 1;
    } else if (daysDifference <= 4) {
      // 3-4 days remaining
      return 2;
    } else {
      // 5 or more days remaining
      return 3;
    }
}; 
module.exports = calculateTaskPriority;