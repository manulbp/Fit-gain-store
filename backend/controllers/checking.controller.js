
import Joi from 'joi';
import bcrypt from 'bcrypt';
import { Login } from '../models/login.model.js';

export const checkLogin = async (req, res) => {

    try {
        const { error } = validate(req.body);

        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const user = await Login.findOne({ username: req.body.username });
        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const validPassword = await bcrypt.compare(
            req.body.password, user.password
        );

        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid username or password' });

        }

        const token = user.generateAuthToken();
        return res.status(200).json({
            success: true,
            message: "Login successful",
            token: token,
            user: {
                userId: user._id,
                username: user.username,
                email: user.email
            }
        });
    }
    catch (error) {
        console.error('Error loggin user: ', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }


}

const validate = (data) => {
    const schema = Joi.object({
        username: Joi.string().label("Username"),
        password: Joi.string().label("Password")
    });

    return schema.validate(data);
}
