import { tableConfig } from '../utils'
/**
 * User Schema
 */
const User = (sequelize, DataTypes) => {
    const User = sequelize.define(
        'User',
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            username: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: false,
            },
            type: { type: DataTypes.INTEGER, allowNull: false, unique: false },
            token: { type: DataTypes.STRING, allowNull: false, unique: false },
        },
        tableConfig,
    )

    return User
}

export default User
