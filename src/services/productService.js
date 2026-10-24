
const {
  findAllProducts,
  findProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../repositories/productRepository");

const yarnDb = require("../database/yarnDb");
const Category = require("../entities/category");

const categoryRepository = yarnDb.getRepository(Category);

async function getAllProducts() {
  return await findAllProducts();
}

async function getProductById(id) {
  return await findProductById(id);
}

async function addProduct(productData) {
  const category = await categoryRepository.findOneBy({
    id: productData.categoryId,
  });

  if (!category) {
    return { categoryNotFound: true };
  }

  const { categoryId, ...data } = productData;

  return await createProduct({
    ...data,
    category,
  });
}

async function editProduct(id, productData) {
  if (productData.categoryId !== undefined) {
    const category = await categoryRepository.findOneBy({
      id: productData.categoryId,
    });

    if (!category) {
      return { categoryNotFound: true };
    }

    productData.category = category;
    delete productData.categoryId;
  }

  return await updateProduct(id, productData);
}

async function removeProduct(id) {
  return await deleteProduct(id);
}

module.exports = {
  getAllProducts,
  getProductById,
  addProduct,
  editProduct,
  removeProduct,
};
