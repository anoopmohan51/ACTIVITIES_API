import { Sequelize, DataTypes } from 'sequelize';
import dotenv from 'dotenv';
import { Season } from '../models/Season';
import { Experience } from '../models/Experience';
import { Category } from '../models/Category';
import { ExperienceVideo } from '../models/ExperienceVideo';
import { ExperienceImage } from '../models/ExperienceImage';
import { ApprovalLevels } from '../models/ApprovalLevels';
import { LevelMapping } from '../models/LevelMapping';
import { ApprovalLogs } from '../models/ApprovalLogs';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'activities_db',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
};

export const sequelize = new Sequelize({
  ...dbConfig,
  dialect: 'postgres',
  logging: false, // Disable logging for better performance
  pool: {
    max: 10, // Maximum number of connection in pool
    min: 0, // Minimum number of connection in pool
    acquire: 30000, // The maximum time, in milliseconds, that pool will try to get connection before throwing error
    idle: 10000 // The maximum time, in milliseconds, that a connection can be idle before being released
  },
  dialectOptions: {
    statement_timeout: 1000, // Timeout for queries (1s)
    idle_in_transaction_session_timeout: 10000 // Timeout for idle transactions (10s)
  }
});

export const initDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    // Initialize models
    await initModels();
    
    // Only check model consistency in development
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: false });
      console.log('Database models checked successfully.');
    }
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
};

export const initModels = async () => {
  // Initialize Activity model
  const Activity = sequelize.define('Activity', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'in_progress', 'completed'),
      defaultValue: 'pending',
    },
    priority: {
      type: DataTypes.INTEGER,
      allowNull: true,
    }
  }, {
    tableName: 'activities',
    timestamps: true,
  });

  // Initialize models in the correct order
  Category.initialize(sequelize);  // Initialize Category first since it's referenced by Experience
  Season.initialize(sequelize);    // Initialize Season since it's referenced by Experience
  Experience.initialize(sequelize); // Initialize Experience
  ExperienceVideo.initialize(sequelize); // Initialize ExperienceVideo after Experience
  ExperienceImage.initialize(sequelize); // Initialize ExperienceImage after Experience
  ApprovalLevels.initialize(sequelize); // Initialize ApprovalLevels
  LevelMapping.initialize(sequelize); // Initialize LevelMapping after ApprovalLevels
  ApprovalLogs.initialize(sequelize); // Initialize ApprovalLogs after Experience

  // Set up associations after all models are initialized
  Experience.associate();
  ExperienceVideo.associate();
  ExperienceImage.associate();
  ApprovalLevels.associate();
  LevelMapping.associate();
  ApprovalLogs.associate(); // Set up ApprovalLogs associations

  return {
    Activity,
    Category,
    Season,
    Experience,
    ExperienceVideo,
    ExperienceImage,
    ApprovalLevels,
    LevelMapping,
    ApprovalLogs
  };
};