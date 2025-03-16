const AUTH_TYPES = {
	SAME_ORG: "same-org",
};

const authorize = (...authTypes) => {
	return (req, res, next) => {
		for(const authType of authTypes){
			switch(authType){
				case AUTH_TYPES.SAME_ORG:{
					const userOrgId = req.user.data.org_id; // user file is attached at user.data
					const requestedOrgId = req.params.id; // id in request -> /api/org/:id

					if(userOrgId !== requestedOrgId){
						return res.status(403).json({message:"Access denied: unauthorized organization"});
					}
					break;
				}

				default:
					return res.status(400).json({message:"Invalid authorization type"});
			}
		}

		next();
	};
};

module.exports={authorize,AUTH_TYPES};