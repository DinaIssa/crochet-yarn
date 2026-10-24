
const {
  findCartByUserId,
  createCart,
  findCartItems,
  findCartItemById,
  findCartItemByProduct,
  findProductById,
  addCartItem,
  updateCartItem,
  deleteCartItem,
  deleteCartItems,
} = require("../repositories/cartRepository");

async function getOrCreateCart(userId) {
  let cart = await findCartByUserId(userId);

  if (!cart) {
    cart = await createCart(userId);
  }

  return cart;
}

function formatCart(cart, items) {
  const formattedItems = items.map((item) => {
    const price = Number(item.product.price);

    return {
      id: item.id,
      quantity: item.quantity,
      product: item.product,
      subtotal: Number((price * item.quantity).toFixed(2)),
    };
  });

  const totalAmount = formattedItems.reduce(
    (total, item) => total + item.subtotal,
    0
  );

  return {
    id: cart.id,
    items: formattedItems,
    totalItems: formattedItems.reduce(
      (total, item) => total + item.quantity,
      0
    ),
    totalAmount: Number(totalAmount.toFixed(2)),
  };
}

async function getUserCart(userId) {
  const cart = await getOrCreateCart(userId);
  const items = await findCartItems(cart.id);

  return formatCart(cart, items);
}

async function addProductToCart(userId, productId, quantity) {
  const product = await findProductById(productId);

  if (!product || !product.isActive) {
    return { productNotFound: true };
  }

  if (product.stock < 1) {
    return { outOfStock: true };
  }

  const cart = await getOrCreateCart(userId);
  const existingItem = await findCartItemByProduct(
    cart.id,
    productId
  );

  const newQuantity = existingItem
    ? existingItem.quantity + quantity
    : quantity;

  if (newQuantity > product.stock) {
    return {
      insufficientStock: true,
      availableStock: product.stock,
    };
  }

  if (existingItem) {
    await updateCartItem(existingItem, newQuantity);
  } else {
    await addCartItem(cart.id, productId, quantity);
  }

  return {
    cart: await getUserCart(userId),
  };
}

async function changeCartItemQuantity(userId, itemId, quantity) {
  const cart = await findCartByUserId(userId);

  if (!cart) {
    return { itemNotFound: true };
  }

  const item = await findCartItemById(cart.id, itemId);

  if (!item) {
    return { itemNotFound: true };
  }

  if (!item.product.isActive) {
    return { productNotFound: true };
  }

  if (quantity > item.product.stock) {
    return {
      insufficientStock: true,
      availableStock: item.product.stock,
    };
  }

  await updateCartItem(item, quantity);

  return {
    cart: await getUserCart(userId),
  };
}

async function removeCartItem(userId, itemId) {
  const cart = await findCartByUserId(userId);

  if (!cart) {
    return { itemNotFound: true };
  }

  const item = await findCartItemById(cart.id, itemId);

  if (!item) {
    return { itemNotFound: true };
  }

  await deleteCartItem(item);

  return {
    cart: await getUserCart(userId),
  };
}

async function clearUserCart(userId) {
  const cart = await findCartByUserId(userId);

  if (cart) {
    await deleteCartItems(cart.id);
  }

  return { cart: await getUserCart(userId) };
}

module.exports = {
  getUserCart,
  addProductToCart,
  changeCartItemQuantity,
  removeCartItem,
  clearUserCart,
};
