import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { RefreshToken, RefreshTokenInput } from "src/types/auth.types";

@Injectable()
export class AuthRepo {
    constructor(private prisma: PrismaService) { }
    async createRefreshToken(refreshToken: RefreshToken) {
        return await this.prisma.refresh_tokens.create({
            data: {
                user_id: refreshToken.userId,
                token: refreshToken.token,
                expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)//multi server ?
            }
        })
    }
    async revokeRefreshToken(refreshToken: RefreshTokenInput) {
        return await this.prisma.refresh_tokens.update({
            where: {
                token: refreshToken.token
            },
            data: {
                revoked: true
            }
        })
    }
    async validateRefreshToken(refreshToken: RefreshTokenInput) {
        return await this.prisma.refresh_tokens.findFirst({
            where: {
                token: refreshToken.token,
                revoked: false,
                expires_at: {
                    gt: new Date()
                }
            }
        })
    }
}