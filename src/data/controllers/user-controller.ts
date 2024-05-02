import { Request, Response } from 'express';
import { IUserDto } from '../dtos/user.dto';
import { UserQueryParams } from '../../model/types/user-query-params';
import { UserRouteParams } from '../../model/types/user-route-params';


export const me = async (req: Request, res: Response) => {
 
    res.status(200).send("Hello from user controller");
}

export const create = async (req: Request<{},{}, IUserDto>, res: Response) => {
     
    res.status(200).send("Hello from user controller");
}

export const getUserById = async (req: Request<UserRouteParams,{},{},UserQueryParams>, res: Response<{id?: String}>) => {
    const routeParamsId = req.params.id;
    const userId = req.query.id;
    
    res.status(200).json({id: routeParamsId});
}