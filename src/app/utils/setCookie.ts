import { Response } from "express";
import envConfig from "../config/env";


export interface AuthTokens {
    accessToken?: string;
    refreshToken?: string;
}

export const setAuthCookie = (res: Response, tokenInfo: AuthTokens) => {
    if (tokenInfo.accessToken) {
        res.cookie("accessToken", tokenInfo.accessToken, {
            httpOnly: true,
            secure: envConfig.NODE_ENV === "production",
            sameSite: "none"
        })
    }

    if (tokenInfo.refreshToken) {
        res.cookie("refreshToken", tokenInfo.refreshToken, {
            httpOnly: true,
            secure: envConfig.NODE_ENV === "production",
            sameSite: "none"
        })
    }
}