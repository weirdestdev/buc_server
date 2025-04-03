const sequelize = require('../db');
const { DataTypes } = require('sequelize');

const User = sequelize.define('user', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    fullname: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING, unique: true, allowNull: false },
    purpose: {
        type: DataTypes.ENUM(
            'buy',
            'sell',
            'rent',
            'collaborate',
            'curious'
        ),
        allowNull: false,
        defaultValue: 'buy',
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'blocked'),
        allowNull: false,
        defaultValue: 'pending',
    },
    role: {
        type: DataTypes.ENUM('user', 'moderator', 'admin'),
        allowNull: false,
        defaultValue: 'user',
    },
});

const MemberRequest = sequelize.define('member_request', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    // Если запрос привязан к пользователю, можно добавить userId
    // userId: { 
    //   type: DataTypes.INTEGER, 
    //   allowNull: false 
    // },
    memberName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    message: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('new', 'viewed', 'completed'),
        allowNull: false,
        defaultValue: 'new',
    },
}, {
    // Используем стандартные timestamp поля createdAt и updatedAt
    timestamps: true,
});



const CategoriesData = sequelize.define('categories_data', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    type: {
        type: DataTypes.ENUM('string', 'int', 'double', 'date'),
        allowNull: false,
        defaultValue: 'string',
    },
    min_size: { type: DataTypes.INTEGER, allowNull: false },
    max_size: { type: DataTypes.INTEGER, allowNull: false },
    icon: { type: DataTypes.STRING, allowNull: true },
});

const Categories = sequelize.define('categories', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    icon: { type: DataTypes.STRING, allowNull: false },
    isLocked: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    }
});

const RentalsImages = sequelize.define('rentals_images', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    image: { type: DataTypes.STRING, allowNull: false }
});

const RentTime = sequelize.define('rent_time', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false }
});

const Docs = sequelize.define('docs', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    docType: {
        type: DataTypes.ENUM('terms', 'privacy', 'cookie'),
        allowNull: false,
        unique: true,
    },
    path: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});


// Изменили поле status на 3 категории: our portfolio, leisure, rentals
const Rentals = sequelize.define('rentals', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.STRING(200), allowNull: true },
    address: { type: DataTypes.STRING, allowNull: true },
    price: { type: DataTypes.FLOAT, allowNull: false },
    unit_of_numeration: { type: DataTypes.STRING, allowNull: true },
    status: {
        type: DataTypes.ENUM('our portfolio', 'leisure', 'rentals'),
        allowNull: false,
        defaultValue: 'our portfolio',
    },
    featured: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    }
});

// Новая модель для хранения значений кастомных полей, введённых для каждого объявления
const RentalCustomData = sequelize.define('rental_custom_data', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    value: { type: DataTypes.STRING, allowNull: true },
});

// Связи между моделями
User.hasMany(Rentals, { foreignKey: 'userId', onDelete: 'CASCADE' });
Rentals.belongsTo(User, { foreignKey: 'userId' });

Rentals.belongsTo(Categories, { foreignKey: 'categoryId', onDelete: 'CASCADE' });
Categories.hasMany(Rentals, { foreignKey: 'categoryId' });

Categories.belongsToMany(CategoriesData, {
    through: 'categories_data_connection',
    foreignKey: 'categoryId',
    otherKey: 'categoriesDataId',
    as: 'customFields'
});
CategoriesData.belongsToMany(Categories, {
    through: 'categories_data_connection',
    foreignKey: 'categoriesDataId',
    otherKey: 'categoryId',
    as: 'categories'
});

Rentals.hasMany(RentalsImages, { foreignKey: 'rentalId', onDelete: 'CASCADE' });
RentalsImages.belongsTo(Rentals, { foreignKey: 'rentalId' });

Rentals.belongsTo(RentTime, { foreignKey: 'rentTimeId', onDelete: 'CASCADE' });
RentTime.hasMany(Rentals, { foreignKey: 'rentTimeId' });

Rentals.hasMany(RentalCustomData, { foreignKey: 'rentalId', onDelete: 'CASCADE' });
RentalCustomData.belongsTo(Rentals, { foreignKey: 'rentalId' });

CategoriesData.hasMany(RentalCustomData, { foreignKey: 'categoriesDataId', onDelete: 'CASCADE' });
RentalCustomData.belongsTo(CategoriesData, { foreignKey: 'categoriesDataId' });

User.hasMany(MemberRequest, { foreignKey: 'userId', onDelete: 'CASCADE' });
MemberRequest.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
    User,
    Rentals,
    Categories,
    CategoriesData,
    RentalsImages,
    RentTime,
    RentalCustomData,
    Docs
};
