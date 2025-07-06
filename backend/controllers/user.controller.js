import userModel from "../models/user.model.js";

async function all(req, res) {
    try {
        const users = await userModel.find().select('-password').lean();
        res.status(200).json({
            success: true,
            message: 'Users retrieved successfully',
            data: { allUser: users },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve users',
            data: null,
        });
    }
}

async function viewUser(req, res) {
    try {
        const user = await userModel.findById(req.params.id).select('-password').lean();
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
                data: null,
            });
        }
        res.status(200).json({
            success: true,
            message: 'User retrieved successfully',
            data: user,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve user',
            data: null,
        });
    }
}

async function editUser(req, res) {
    try {
        const user = await userModel.findById(req.params.id).select('-password').lean();
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
                data: null,
            });
        }
        res.status(200).json({
            success: true,
            message: 'User retrieved for editing',
            data: user,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve user',
            data: null,
        });
    }
}

async function updateUser(req, res) {
    try {
        const { name, email, role } = req.body;
        if (!name || !email ) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, and role are required',
                data: null,
            });
        }
        const user = await userModel.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
                data: null,
            });
        }
        user.name = name;
        user.email = email;
        user.role = role;
        await user.save();
        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: user,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Email already exists',
                data: null,
            });
        }
        res.status(500).json({
            success: false,
            message: 'Failed to update user',
            data: null,
        });
    }
}

async function deleteUserss(req, res) {
    try {
        const { _id } = req.body;
        if (!_id) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required',
                data: null,
            });
        }
        const user = await User.findByIdAndDelete(_id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
                data: null,
            });
        }
        res.status(200).json({
            success: true,
            message: 'User deleted successfully',
            data: null,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete user',
            data: null,
        });
    }
}

async function deleteUser(req, res) {
    try {
        const { id } = req.params; // Use req.params.id to match /delete/:id
        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required',
                data: null,
            });
        }

        const user = await userModel.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
                data: null,
            });
        }

        res.status(200).json({
            success: true,
            message: 'User deleted successfully',
            data: null,
        });
    } catch (error) {
        console.error('Error deleting user:', error); // Log error for debugging
        res.status(500).json({
            success: false,
            message: 'Failed to delete user',
            data: null,
        });
    }
}

export { all, viewUser, editUser, updateUser, deleteUser };