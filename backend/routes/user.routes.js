import express from 'express'
import { all, deleteUser, editUser, updateUser, viewUser } from '../controllers/user.controller.js'

const userRouter = express.Router()

userRouter.get('/all',all)
userRouter.post('/view/:id',viewUser)
userRouter.post('/edit/:id',editUser)
userRouter.post('/update/:id',updateUser)
userRouter.post('/delete/:id',deleteUser)

export default userRouter