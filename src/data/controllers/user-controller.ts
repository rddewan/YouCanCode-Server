import { Request, Response } from 'express';
import { IUserDto } from '../dtos/user.dto';
import { IUserQueryParams } from '../../model/types/user-query-params';

export const me = async (req: Request, res: Response) => {
 
    res.status(200).send("Hello from user controller");
}

export const create = async (req: Request<{},{}, IUserDto>, res: Response) => {
     
    res.status(200).send("Hello from user controller");
}

export const getUserById = async (req: Request<{},{},{},IUserQueryParams>, res: Response) => {
    const userId = req.query.id;
    
    res.status(200).send("Hello from user controller");
}