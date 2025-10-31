import { Model, DataTypes, Sequelize } from 'sequelize';
import { LevelMapping } from './LevelMapping';

export class ApprovalLevels extends Model {
  public id!: number;
  public level!: number | null;
  public type!: string | null;
  public company_id!: string | null;
  public created_user!: string | null;
  public updated_user!: string | null;
  public is_delete!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Association
  public levelMappings?: LevelMapping[];

  public static initialize(sequelize: Sequelize): typeof ApprovalLevels {
    this.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        level: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        type: {
          type: DataTypes.STRING(10),
          allowNull: true,
        },
        company_id: {
          type: DataTypes.STRING(30),
          allowNull: true,
        },
        created_user: {
          type: DataTypes.STRING(30),
          allowNull: true,
        },
        updated_user: {
          type: DataTypes.STRING(30),
          allowNull: true,
        },
        is_delete: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
      },
      {
        sequelize,
        tableName: 'approval_levels',
        timestamps: true, // This enables createdAt and updatedAt
      }
    );
    return this;
  }

  public static associate() {
    // Define associations
    ApprovalLevels.hasMany(LevelMapping, {
      foreignKey: 'approvallevels',
      as: 'levelMappings',
      onDelete: 'CASCADE'
    });
  }
}

export default ApprovalLevels;
