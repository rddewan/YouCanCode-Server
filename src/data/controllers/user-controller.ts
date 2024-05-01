import { Request, Response } from 'express';
import { IUserDto } from '../dtos/user.dto';

export const me = async (req: Request, res: Response) => {
 
    res.status(200).send("Hello from user controller");
}

export const create = async (req: Request<{},{}, IUserDto>, res: Response) => {
     
    res.status(200).send("Hello from user controller");
}