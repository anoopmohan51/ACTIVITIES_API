import { Model, DataTypes, Sequelize, CreationOptional } from 'sequelize';
import { Category } from './Category';
import { Season } from './Season';
import { ExperienceVideo } from './ExperienceVideo';
import { ExperienceImage } from './ExperienceImage';

interface ExperienceAttributes {
    images?: ExperienceImage[];
    id?: number;
    name: string;
    status?: string;
    categoryId?: number;
    location?: string;
    seasonId?: number;
    difficultyLevel?: string;
    duration?: string;
    isExcursion: boolean;
    isGuided: boolean;
    guideType?: string;
    noOfGuides?: string;
    minimumParticipant?: number;
    maximumParticipant?: number;
    travellMedium?: string;
    prefferedTime?: string;
    operatingDays?: string[];
    videosUrl?: string;
    imagesUrl?: string[];
    whatWillYouDo?: string;
    tags?: string[];
    whatYouWillExperience?: string;
    experienceHighlights?: string;
    stepByStepItinerary?: string;
    whoCanParticipate?: string;
    whatToWear?: string;
    rulesAndRegulation?: string;
    carriableItems?: string;
    whatsIncluded?: string[];
    whatsExcluded?: string[];
    isPickupServiceAvailable?: boolean;
    pickupServiceDetails?: string;
    cancellationPolicy?: string;
    safetyProtocols?: string;
    additionalInformation?: string;
    termsAndConditions?: string;
    costBreakdown?: string;
    billingInstructions?: string;
    company_id?: string;
    site_id?: string;
    created_user?: number;
    updated_user?: number;
    is_delete: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export class Experience extends Model<ExperienceAttributes> {
    declare images?: ExperienceImage[];
    declare id: CreationOptional<number>;
    declare name: string;
    declare status: CreationOptional<string>;
    declare categoryId: CreationOptional<number>;
    declare location: CreationOptional<string>;
    declare seasonId: CreationOptional<number>;
    declare difficultyLevel: CreationOptional<string>;
    declare duration: CreationOptional<string>;
    declare isExcursion: boolean;
    declare isGuided: boolean;
    declare guideType: CreationOptional<string>;
    declare noOfGuides: CreationOptional<string>;
    declare minimumParticipant: CreationOptional<number>;
    declare maximumParticipant: CreationOptional<number>;
    declare travellMedium: CreationOptional<string>;
    declare prefferedTime: CreationOptional<string>;
    declare operatingDays: CreationOptional<string[]>;
    declare videosUrl: CreationOptional<string>;
    declare imagesUrl: CreationOptional<string[]>;
    declare whatWillYouDo: CreationOptional<string>;
    declare tags: CreationOptional<string[]>;
    declare whatYouWillExperience: CreationOptional<string>;
    declare experienceHighlights: CreationOptional<string>;
    declare stepByStepItinerary: CreationOptional<string>;
    declare whoCanParticipate: CreationOptional<string>;
    declare whatToWear: CreationOptional<string>;
    declare rulesAndRegulation: CreationOptional<string>;
    declare carriableItems: CreationOptional<string>;
    declare whatsIncluded: CreationOptional<string[]>;
    declare whatsExcluded: CreationOptional<string[]>;
    declare isPickupServiceAvailable: CreationOptional<boolean>;
    declare pickupServiceDetails: CreationOptional<string>;
    declare cancellationPolicy: CreationOptional<string>;
    declare safetyProtocols: CreationOptional<string>;
    declare additionalInformation: CreationOptional<string>;
    declare termsAndConditions: CreationOptional<string>;
    declare costBreakdown: CreationOptional<string>;
    declare billingInstructions: CreationOptional<string>;
    declare company_id: CreationOptional<string>;
    declare site_id: CreationOptional<string>;
    declare created_user: CreationOptional<number>;
    declare updated_user: CreationOptional<number>;
    declare is_delete: boolean;
    declare readonly createdAt: CreationOptional<Date>;
    declare readonly updatedAt: CreationOptional<Date>;

    static associate() {
        // Define associations
        this.belongsTo(Category, {
            foreignKey: 'categoryId',
            as: 'category',
            targetKey: 'id'
        });
        this.belongsTo(Season, {
            foreignKey: 'seasonId',
            as: 'season',
            targetKey: 'id'
        });
        this.hasMany(ExperienceVideo, {
            foreignKey: 'experience_id',
            as: 'videos',
            onDelete: 'CASCADE'
        });
        this.hasMany(ExperienceImage, {
            foreignKey: 'experience_id',
            as: 'images',
            onDelete: 'CASCADE'
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
                name: {
                    type: DataTypes.TEXT,
                    allowNull: false,
                },
                status: {
                    type: DataTypes.TEXT,
                    allowNull: false,
                    defaultValue: 'pending'
                },
                categoryId: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                    references: {
                        model: Category,
                        key: 'id'
                    }
                },
                location: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                },
                seasonId: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                    references: {
                        model: Season,
                        key: 'id'
                    }
                },
                difficultyLevel: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                },
                duration: {
                    type: DataTypes.CHAR(30),
                    allowNull: true,
                },
                isExcursion: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: false,
                },
                isGuided: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: false,
                },
                guideType: {
                    type: DataTypes.CHAR(30),
                    allowNull: true,
                },
                noOfGuides: {
                    type: DataTypes.CHAR(30),
                    allowNull: true,
                },
                minimumParticipant: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                },
                maximumParticipant: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                },
                travellMedium: {
                    type: DataTypes.CHAR(50),
                    allowNull: true,
                },
                prefferedTime: {
                    type: DataTypes.CHAR(50),
                    allowNull: true,
                },
                operatingDays: {
                    type: DataTypes.ARRAY(DataTypes.STRING),
                    allowNull: true,
                },
                videosUrl: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                },
                imagesUrl: {
                    type: DataTypes.ARRAY(DataTypes.STRING),
                    allowNull: true,
                },
                whatWillYouDo: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                },
                tags: {
                    type: DataTypes.ARRAY(DataTypes.STRING),
                    allowNull: true,
                },
                whatYouWillExperience: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                },
                experienceHighlights: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                },
                stepByStepItinerary: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                },
                whoCanParticipate: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                },
                whatToWear: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                },
                rulesAndRegulation: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                },
                carriableItems: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                },
                whatsIncluded: {
                    type: DataTypes.ARRAY(DataTypes.STRING),
                    allowNull: true,
                },
                whatsExcluded: {
                    type: DataTypes.ARRAY(DataTypes.STRING),
                    allowNull: true,
                },
                isPickupServiceAvailable: {
                    type: DataTypes.BOOLEAN,
                    allowNull: true,
                },
                pickupServiceDetails: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                },
                cancellationPolicy: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                },
                safetyProtocols: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                },
                additionalInformation: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                },
                termsAndConditions: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                },
                costBreakdown: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                },
                billingInstructions: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                },
                company_id: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                },
                site_id: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                },
                created_user: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                },
                updated_user: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                },
                is_delete: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: false,
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
                tableName: 'experiences',
                modelName: 'Experience',
            }
        );
    }
}

export default Experience;