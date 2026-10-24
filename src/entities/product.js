
const { EntitySchema } = require("typeorm");

const Product = new EntitySchema({
  name: "Product",
  tableName: "products",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    name: {
      type: "varchar",
      length: 150,
    },
    description: {
      type: "text",
      nullable: true,
    },
    type: {
      type: "varchar",
      length: 20,
    },
    price: {
      type: "decimal",
      precision: 10,
      scale: 2,
    },
    stock: {
      type: "int",
      default: 0,
    },
    imageUrl: {
      type: "varchar",
      length: 500,
      nullable: true,
    },
    isActive: {
      type: "boolean",
      default: true,
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
    category: {
      type: "many-to-one",
      target: "Category",
      joinColumn: true,
      nullable: false,
    },
  },
});

module.exports = Product;
