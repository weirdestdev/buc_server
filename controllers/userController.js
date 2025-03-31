const ApiError = require("../error/ApiError");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models/models');

const generateJwt = (id, email, fullname, phone, purpose, status, role) => {
    return jwt.sign({ id, email, fullname, phone, purpose, status, role },
        process.env.SECRET_KEY,
        { expiresIn: '24h' }
    );
}

class UserController {
    async registration(req, res, next) {
        const { email, password, fullname, phone, purpose } = req.body;
        if (!email || !password) {
            return next(ApiError.badRequest('Invalid email or password'));
        }

        const candidateByEmail = await User.findOne({ where: { email } });
        if (candidateByEmail) {
            return next(ApiError.badRequest('User with this email already exists'));
        }

        const candidateByPhone = await User.findOne({ where: { phone } });
        if (candidateByPhone) {
            return next(ApiError.badRequest('User with this phone number already exists'));
        }

        const hashPassword = await bcrypt.hash(password, 5);

        const user = await User.create({
            email,
            password: hashPassword,
            fullname,
            phone,
            purpose,
        });

        const token = generateJwt(user.id, email, fullname, phone, user.purpose, user.status, user.role);

        return res.json({ token });
    }

    async login(req, res, next) {
        const {email, password} = req.body;
        const user = await User.findOne({where: {email}});
        if(!user) {
            return next(ApiError.internal('User not found'));
        }
        let comparePassword = bcrypt.compareSync(password, user.password);
        if(!comparePassword) {
            return next(ApiError.internal('Incorrect password'));
        }
        const token = generateJwt(user.id, user.email, user.fullname, user.phone, user.purpose, user.status, user.role);
        return res.json({token});
    }

    async adminLogin(req, res, next) {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return next(ApiError.internal('User not found'));
        }
        
        const comparePassword = bcrypt.compareSync(password, user.password);
        if (!comparePassword) {
            return next(ApiError.internal('Incorrect password'));
        }
        
        // Проверяем роль пользователя для админ-панели
        if (user.role !== 'admin' && user.role !== 'moderator') {
            return next(ApiError.internal('Access Denied'));
        }
        
        const token = generateJwt(
            user.id, 
            user.email, 
            user.fullname, 
            user.phone, 
            user.purpose, 
            user.status, 
            user.role
        );
        
        return res.json({ token });
    }

    async auth(req, res, next) {
        const user = await User.findOne({ where: { email: req.user.email } });
        if (!user) {
            return next(ApiError.internal('User not found'));
        }
        const token = generateJwt(user.id, user.email, user.fullname, user.phone, user.purpose, user.status, user.role);
        return res.json({ token });
    }

    async adminAuth(req, res, next) {
        const user = await User.findOne({ where: { email: req.user.email } });
        if (!user) {
            return next(ApiError.internal('User not found'));
        }

        if(user.role !== "admin") {
            return next(ApiError.internal('Not the admin'));
        }
        
        const token = generateJwt(user.id, user.email, user.fullname, user.phone, user.purpose, user.status, user.role);
        return res.json({ token });
    }
}

module.exports = new UserController();