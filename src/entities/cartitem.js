
const { EntitySchema } = require("typeorm");

const CartItem = new EntitySchema({
  name: "CartItem",
  tableName: "cart_items",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    quantity: {
      type: "int",
      default: 1,
    },
  },
  relations: {
    cart: {
      type: "many-to-one",
      target: "Cart",
      joinColumn: true,
      nullable: false,
      onDelete: "CASCADE",
    },
    product: {
      type: "many-to-one",
      target: "Product",
      joinColumn: true,
      nullable: false,
      onDelete: "RESTRICT",
    },
  },
});

module.exports = CartItem;
