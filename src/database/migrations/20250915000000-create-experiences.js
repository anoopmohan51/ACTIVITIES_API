const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable('experiences', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      categoryId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'categories',
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
          model: 'seasons',
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
        type: DataTypes.JSON,
        allowNull: true,
      },
      videosUrl: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      imagesUrl: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      whatWillYouDo: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      tags: {
        type: DataTypes.JSON,
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
        type: DataTypes.JSON,
        allowNull: true,
      },
      whatsExcluded: {
        type: DataTypes.JSON,
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
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('experiences');
  }
};
