import prisma from '../db/client.js';
import bcrypt from 'bcrypt';

export async function registerUserService(username, password, request) {
    const existingUser = await prisma.user.findUnique({
        where: { username }
    });

    if (existingUser) {
        throw new Error('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            username,
            password: hashedPassword
        }
    });
    const token = request.server.jwt.sign(
        { userId: user.id, username: user.username },
        { expiresIn: '7d' }
    );

    return { user, token };
}


export async function loginUserService(username, password, request) {
    const user = await prisma.user.findUnique({
        where: { username }
    });

    if (!user) {
        throw new Error('Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
        throw new Error('Invalid credentials');
    }

    const token = request.server.jwt.sign(
        { userId: user.id, username: user.username },
        { expiresIn: '7d' }
    );

    return { user, token };
}

export async function getUserByIdService(id) {
    const user = await prisma.user.findUnique({
        where: { id }
    });

    return user;
}

export async function getUserByUsernameService(username) {
    const user = await prisma.user.findUnique({
        where: { username }
    });

    return user;
}

export async function updateUserService(id, { username, password }) {
    const dataToUpdate = {};
    if (username) dataToUpdate.username = username.trim();
    if (password) dataToUpdate.password = await bcrypt.hash(password, 10);

    const updatedUser = await prisma.user.update({
        where: { id },
        data: dataToUpdate,
        select: {
            id: true,
            username: true,
        }
    });

    return {
        id: updatedUser.id,
        username: updatedUser.username,
        updatedAt: updatedUser.updatedAt
    }
}

