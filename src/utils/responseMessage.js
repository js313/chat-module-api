function formatWord(word) {
  // Remove the plural form of the word (if present)
  try {
    if (word?.endsWith("s")) {
      word = word?.slice(0, -1);
    }

    // Capitalize the first letter of every word and replace underscores with spaces
    return word
      ?.split("_")
      ?.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      ?.join(" ");
  } catch (error) {
    return "Data";
  }
}

let message = {
  success: {
    get: function get(tablename) {
      return `Success! ${formatWord(
        tablename
      )} has been retrieved successfully.`;
    },
    create: function create(tablename) {
      return `Success! ${formatWord(tablename)} has been created successfully.`;
    },
    update: function update(tablename) {
      return `Success! ${formatWord(tablename)} has been updated successfully.`;
    },
    remove: function remove(tablename) {
      return `Success! ${formatWord(tablename)} has been removed successfully.`;
    },
  },
  error: {
    get: function get(tablename) {
      return `Error: Unable to retrieve ${formatWord(tablename)}`;
    },
    create: function create(tablename) {
      return `Error: Unable to create ${formatWord(tablename)}`;
    },
    update: function update(tablename) {
      return `Error: Unable to update ${formatWord(tablename)}`;
    },
    remove: function remove(tablename) {
      return `Error: Unable to remove ${formatWord(tablename)}`;
    },
  },
};

module.exports = message;
