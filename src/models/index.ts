import { sequelize } from '../config/database';
import { Season } from './Season';
import { Category } from './Category';
import { Experience } from './Experience';
import { ExperienceVideo } from './ExperienceVideo';
import { ApprovalLevels } from './ApprovalLevels';
import { LevelMapping } from './LevelMapping';
import { ApprovalLogs } from './ApprovalLogs';

export const db = {
  sequelize,
  Season,
  Category,
  Experience,
  ExperienceVideo,
  ApprovalLevels,
  LevelMapping,
  ApprovalLogs
};

export default db;
