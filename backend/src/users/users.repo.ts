import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { UpdateUserInput, User } from "./entities/user.entity";
@Injectable()
export class UsersRepo
{
    constructor(
        private prisma:PrismaService
    ){}
    getUserById(id:number)
    {
        return this.prisma.users?.findUnique({
            where :{
                id
            },
            select :{
                email:true,
                name:true,
                role:true
            }
        })
    }
            updateUser(payload:UpdateUserInput)
        {
            return this.prisma.users.update({
                where:{
                    id:payload.id
                },
                data:{
                    name:payload.name
                },
                select:{
                    name:true,
                    email:true,
                    role:true
                }
            })
        }
}