export const me = async (req, res) => {
	// if (req.user) {
	// 	const userID = req.user.id;
	// }
	res.status(200).send("Hello from user controller");
};
export const create = async (req, res) => {
	// if (req.user) {
	// 	const userID = req.user.id;
	// }
	res.status(200).send("Hello from user controller");
};
export const getUserById = async (req, res) => {
	const routeParamsId = req.params.id;
	const userId = req.query.id;
	res.status(200).json({
		status: "success",
		data: {
			id: userId || routeParamsId,
		},
	});
};
//# sourceMappingURL=user-controller.js.map
