import { Model, DataTypes, Sequelize } from 'sequelize';
import { sequelize } from '../config/database';

interface SeasonAttributes {
  id?: number;  // Optional for creation
  name: string;
  start_month: string | null;
  end_month: string | null;
  created_user: string | null;
  updated_user: string | null;
  is_delete: boolean;
  company_id: string | null;
  site_id: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface for creation attributes
export interface SeasonCreationAttributes extends Omit<SeasonAttributes, 'id'> {
  id?: number;  // Optional for creation
}

export class Season extends Model<SeasonAttributes, SeasonCreationAttributes> implements SeasonAttributes {
  public id!: number;
  public name!: string;
  public start_month!: string | null;
  public end_month!: string | null;
  public created_user!: string | null;
  public updated_user!: string | null;
  public is_delete!: boolean;
  public company_id!: string | null;
  public site_id!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static initialize(sequelize: Sequelize): typeof Season {
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
        start_month: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        end_month: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        created_user: {
          type: DataTypes.CHAR(25),
          allowNull: true,
        },
        updated_user: {
          type: DataTypes.CHAR(25),
          allowNull: true,
        },
        is_delete: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        company_id: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        site_id: {
          type: DataTypes.TEXT,
          allowNull: true,
        }
      },
      {
        sequelize,
        tableName: 'seasons',
        timestamps: true,
      }
    );
    return this;
  }
}
