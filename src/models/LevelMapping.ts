import { Model, DataTypes, Sequelize } from 'sequelize';
import { ApprovalLevels } from './ApprovalLevels';

export class LevelMapping extends Model {
  public id!: number;
  public approvallevels!: number;
  public user_id!: string | null;
  public usergroup!: string | null;
  public variable!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Association
  public approvalLevel?: ApprovalLevels;

  public static initialize(sequelize: Sequelize): typeof LevelMapping {
    this.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        approvallevels: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'approval_levels',
            key: 'id',
          },
        },
        user_id: {
          type: DataTypes.STRING(30),
          allowNull: true,
        },
        usergroup: {
          type: DataTypes.STRING(30),
          allowNull: true,
        },
        variable: {
          type: DataTypes.CHAR(10),
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: 'level_mappings',
        timestamps: true, // This enables createdAt and updatedAt
      }
    );
    return this;
  }

  public static associate() {
    // Define associations
    LevelMapping.belongsTo(ApprovalLevels, {
      foreignKey: 'approvallevels',
      as: 'approvalLevel',
      onDelete: 'CASCADE'
    });
  }
}

export default LevelMapping;
