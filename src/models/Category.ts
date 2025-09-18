import { Model, DataTypes, Sequelize } from 'sequelize';

export class Category extends Model {
  public id!: number;
  public name!: string;
  public description!: string | null;
  public company_id!: string | null;
  public site_id!: string | null;
  public created_user!: number | null;
  public updated_user!: number | null;
  public is_delete!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static initialize(sequelize: Sequelize): typeof Category {
    this.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        name: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        company_id: {
          type: DataTypes.CHAR,
          allowNull: true,
        },
        site_id: {
          type: DataTypes.CHAR,
          allowNull: true,
        },
        created_user: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        updated_user: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        is_delete: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
      },
      {
        sequelize,
        tableName: 'categories',
        timestamps: true, // This enables createdAt and updatedAt
      }
    );
    return this;
  }
}

export default Category;