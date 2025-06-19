export async function verifyJWT(request, response){
	try {
		await request.jwtVerify();
	} catch (error) {
		response.status(401).send({
			status: 'error',
			message: 'Unauthorized',
			error: error.message,
		});
		return;
	}
}