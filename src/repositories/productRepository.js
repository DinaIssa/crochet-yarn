
const yarnDb = require("../database/yarnDb");
const Product = require("../entities/product");

const productRepository = yarnDb.getRepository(Product);

async function findAllProducts() {
  return await productRepository.find({
    relations: ["category"],
  });
}

async function findProductById(id) {
  return await productRepository.findOne({
    where: { id },
    relations: ["category"],
  });
}

async function createProduct(productData) {
  const product = productRepository.create(productData);
  return await productRepository.save(product);
}

async function updateProduct(id, productData) {
  const product = await findProductById(id);

  if (!product) {
    return null;
  }

  Object.assign(product, productData);

  return await productRepository.save(product);
}

async function deleteProduct(id) {
  const product = await findProductById(id);

  if (!product) {
    return null;
  }

  await productRepository.remove(product);

  return product;
}

module.exports = {
  findAllProducts,
  findProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
