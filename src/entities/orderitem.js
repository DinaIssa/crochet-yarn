
const { EntitySchema } = require("typeorm");

const OrderItem = new EntitySchema({
  name: "OrderItem",
  tableName: "order_items",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    quantity: {
      type: "int",
    },
    unitPrice: {
      type: "decimal",
      precision: 10,
      scale: 2,
    },
    productName: {
      type: "varchar",
      length: 150,
    },
  },
  relations: {
    order: {
      type: "many-to-one",
      target: "Order",
      joinColumn: true,
      nullable: false,
      onDelete: "CASCADE",
    },
    product: {
      type: "many-to-one",
      target: "Product",
      joinColumn: true,
      nullable: true,
      onDelete: "SET NULL",
    },
  },
});

module.exports = OrderItem;
