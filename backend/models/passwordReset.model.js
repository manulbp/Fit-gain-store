import mongoose from 'mongoose';

const passwordResetSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    code: { type: String, required: true },
    expiresAt: { type: Date, required: true },
}, { collection: 'PasswordReset', timestamps: true });

const PasswordReset = mongoose.models.PasswordReset || mongoose.model('PasswordReset', passwordResetSchema);
export default PasswordReset;