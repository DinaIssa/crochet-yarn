
const { EntitySchema } = require("typeorm");

const Category = new EntitySchema({
  name: "Category",
  tableName: "categories",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    name: {
      type: "varchar",
      length: 100,
      unique: true,
    },
    description: {
      type: "text",
      nullable: true,
    },
    createdAt: {
      type: "timestamp",
      createDate: true,
    },
  },
});

module.exports = Category;
