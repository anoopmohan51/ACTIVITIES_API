import { Model, DataTypes, Sequelize } from 'sequelize';
import { Experience } from './Experience';

export class ApprovalLogs extends Model {
  public id!: number;
  public user_id!: string | null;
  public experience_id!: number | null;
  public company_id!: string | null;
  public site_id!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Association
  public experience?: Experience;

  public static initialize(sequelize: Sequelize): typeof ApprovalLogs {
    this.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        user_id: {
          type: DataTypes.STRING(30),
          allowNull: true,
        },
        experience_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: 'experiences',
            key: 'id',
          },
        },
        company_id: {
          type: DataTypes.STRING(30),
          allowNull: true,
        },
        site_id: {
          type: DataTypes.STRING(30),
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: 'approval_logs',
        timestamps: true, // This enables createdAt and updatedAt
      }
    );
    return this;
  }

  public static associate() {
    // Define associations
    ApprovalLogs.belongsTo(Experience, {
      foreignKey: 'experience_id',
      as: 'experience',
      onDelete: 'CASCADE'
    });
  }
}

export default ApprovalLogs;

