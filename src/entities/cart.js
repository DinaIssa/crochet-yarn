
const { EntitySchema } = require("typeorm");

const Cart = new EntitySchema({
  name: "Cart",
  tableName: "carts",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    createdAt: {
      type: "timestamp",
      createDate: true,
    },
    updatedAt: {
      type: "timestamp",
      updateDate: true,
    },
  },
  relations: {
    user: {
      type: "one-to-one",
      target: "User",
      joinColumn: true,
      nullable: false,
      unique: true,
    },
  },
});

module.exports = Cart;
