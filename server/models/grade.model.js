import { tableConfig } from '../utils'

/**
 * Grade Schema
 */
const Grade = (sequelize, DataTypes) => {
    const Grade = sequelize.define(
        'Grade',
        {
            grade_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            grade_name: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: false,
            },
            section: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: false,
            },
            grade_section: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: false,
            },
            school_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                unique: false,
                references: { model: 'School', key: 'school_id' },
            },
        },
        tableConfig,
    )

    return Grade
}

export default Grade
