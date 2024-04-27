import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AuthService {
    private readonly externalApiUrl = process.env.URL_USERS_API;

    async validateUser(uid: string) {
        try {
            const params = {
                fieldName: 'uid',
                fieldValue: uid
            };
            const response = await axios.get(this.externalApiUrl + `/users/findByField`, { params });
            return response.data;
        } catch (error) {
            console.error('Error al llamar a la API externa:', error);
            //throw new Error('Error al validar el usuario en la API externa');
            return null;
        }
    }
}
