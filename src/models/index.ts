import { sequelize } from '../config/database';
import { Season } from './Season';
import { Category } from './Category';
import { Experience } from './Experience';
import { ExperienceVideo } from './ExperienceVideo';

export const db = {
  sequelize,
  Season,
  Category,
  Experience,
  ExperienceVideo
};

export default db;
