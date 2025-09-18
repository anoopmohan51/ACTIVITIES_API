import { Model, DataTypes, Sequelize, CreationOptional, ForeignKey } from 'sequelize';
import { Experience } from './Experience';

interface ExperienceVideoAttributes {
    id?: number;
    experience_id: ForeignKey<Experience['id']>;
    name?: string;
    path: string;
    uploaded_file_name?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export class ExperienceVideo extends Model<ExperienceVideoAttributes> {
    declare id: CreationOptional<number>;
    declare experience_id: ForeignKey<Experience['id']>;
    declare name: CreationOptional<string>;
    declare path: string;
    declare uploaded_file_name: CreationOptional<string>;
    declare readonly createdAt: CreationOptional<Date>;
    declare readonly updatedAt: CreationOptional<Date>;

    static associate() {
        // Define associations
        this.belongsTo(Experience, {
            foreignKey: 'experience_id',
            as: 'experience'
        });
    }

    static initialize(sequelize: Sequelize) {
        this.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                },
                experience_id: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    references: {
                        model: Experience,
                        key: 'id'
                    }
                },
                name: {
                    type: DataTypes.STRING,
                    allowNull: true
                },
                path: {
                    type: DataTypes.TEXT,
                    allowNull: false,
                },
                uploaded_file_name: {
                    type: DataTypes.STRING,
                    allowNull: true
                },
                createdAt: {
                    type: DataTypes.DATE,
                    allowNull: false,
                },
                updatedAt: {
                    type: DataTypes.DATE,
                    allowNull: false,
                }
            },
            {
                sequelize,
                tableName: 'experienceVideos',
                modelName: 'ExperienceVideo',
            }
        );
    }
}

export default ExperienceVideo;
