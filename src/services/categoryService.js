
const {
  findAllCategories,
  findCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../repositories/categoryRepository");

async function getAllCategories() {
  return await findAllCategories();
}

async function getCategoryById(id) {
  return await findCategoryById(id);
}

async function addCategory(categoryData) {
  return await createCategory(categoryData);
}

async function editCategory(id, categoryData) {
  return await updateCategory(id, categoryData);
}

async function removeCategory(id) {
  return await deleteCategory(id);
}

module.exports = {
  getAllCategories,
  getCategoryById,
  addCategory,
  editCategory,
  removeCategory,
};
