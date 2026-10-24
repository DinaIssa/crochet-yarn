
const yarnDb = require("../database/yarnDb");
const Category = require("../entities/category");
const Product = require("../entities/product");

const categoryRepository = yarnDb.getRepository(Category);
const productRepository = yarnDb.getRepository(Product);

async function findAllCategories() {
  return await categoryRepository.find();
}

async function findCategoryById(id) {
  return await categoryRepository.findOneBy({ id });
}

async function createCategory(categoryData) {
  const category = categoryRepository.create(categoryData);
  return await categoryRepository.save(category);
}

async function updateCategory(id, categoryData) {
  const category = await findCategoryById(id);

  if (!category) {
    return null;
  }

  Object.assign(category, categoryData);
  return await categoryRepository.save(category);
}

async function countProductsByCategory(id) {
  return await productRepository
    .createQueryBuilder("product")
    .innerJoin("product.category", "category")
    .where("category.id = :id", { id })
    .getCount();
}

async function deleteCategory(id) {
  const category = await findCategoryById(id);

  if (!category) {
    return null;
  }

  const productsCount = await countProductsByCategory(id);

  if (productsCount > 0) {
    return {
      blocked: true,
      productsCount,
    };
  }

  await categoryRepository.remove(category);

  return {
    blocked: false,
    category,
  };
}

module.exports = {
  findAllCategories,
  findCategoryById,
  createCategory,
  updateCategory,
  countProductsByCategory,
  deleteCategory,
};
