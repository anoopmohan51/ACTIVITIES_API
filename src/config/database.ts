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
  port: parseInt(process.env.DB_PORT || '3306'),
  database: process.env.DB_NAME || 'activities_db',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
};

export const sequelize = new Sequelize({
  ...dbConfig,
  dialect: 'mysql',
  logging: false, // Disable logging for better performance
  pool: {
    max: 10, // Maximum number of connection in pool
    min: 0, // Minimum number of connection in pool
    acquire: 30000, // The maximum time, in milliseconds, that pool will try to get connection before throwing error
    idle: 10000 // The maximum time, in milliseconds, that a connection can be idle before being released
  },
  dialectOptions: {
    connectTimeout: 60000 // MySQL connection timeout
  }
});

export const initDatabase = async () => {
  const maxRetries = 5;
  const retryDelay = 5000; // 5 seconds
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
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
      return; // Success, exit the retry loop
    } catch (error: any) {
      console.error(`Database connection attempt ${attempt}/${maxRetries} failed:`, error.message);
      
      if (attempt === maxRetries) {
        console.error('Unable to connect to the database after multiple attempts:', error);
        throw error;
      }
      
      // Wait before retrying
      console.log(`Retrying in ${retryDelay / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
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