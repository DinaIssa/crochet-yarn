
const { EntitySchema } = require("typeorm");

const Order = new EntitySchema({
  name: "Order",
  tableName: "orders",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    status: {
      type: "varchar",
      length: 30,
      default: "pending",
    },
    totalAmount: {
      type: "decimal",
      precision: 10,
      scale: 2,
    },
    shippingAddress: {
      type: "text",
      nullable: true,
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
      type: "many-to-one",
      target: "User",
      joinColumn: true,
      nullable: false,
      onDelete: "RESTRICT",
    },
  },
});

module.exports = Order;
