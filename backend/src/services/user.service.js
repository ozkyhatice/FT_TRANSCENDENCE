import prisma from '../db/client.js';

export async function getUserByUsernameService(username) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        username: username
      },
      select: {
        id: true,
        username: true,
        createdAt: true
      }
    });

    return user;
  } catch (error) {
    throw new Error(`Error finding user: ${error.message}`);
  }
}

export async function getUserByIdService(userId) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId
      },
      select: {
        id: true,
        username: true,
        createdAt: true
      }
    });

    return user;
  } catch (error) {
    throw new Error(`Error finding user by ID: ${error.message}`);
  }
}

export async function getUsersByIdsService(userIds) {
  try {
    const users = await prisma.user.findMany({
      where: {
        id: {
          in: userIds
        }
      },
      select: {
        id: true,
        username: true,
        createdAt: true
      }
    });

    return users;
  } catch (error) {
    throw new Error(`Error finding users by IDs: ${error.message}`);
  }
}
