import { Model, DataTypes, Sequelize } from 'sequelize';
import { Experience } from './Experience';

export class ApprovalLogs extends Model {
  public id!: number;
  public experience_id!: number | null;
  public company_id!: string | null;
  public site_id!: string | null;
  public current_level!: number | null;
  public previous_level!: number | null;
  public approved_by!: string | null;
  public status!: string | null;
  public action!: string | null;
  public reason_for_reject!: string | null;
  public readonly createdAt!: Date;

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
        current_level: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        previous_level: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        approved_by: {
          type: DataTypes.STRING(30),
          allowNull: true,
        },
        status: {
          type: DataTypes.STRING(50),
          allowNull: true,
        },
        action: {
          type: DataTypes.STRING(50),
          allowNull: true,
        },
        reason_for_reject: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: 'approval_logs',
        timestamps: true,
        updatedAt: false, // Disable updatedAt, keep only createdAt
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

