export enum Department {
    CE = 'CE',
    IT = 'IT',
    ENTC = 'ENTC',
    ECE = 'ECE',
    AIDS = 'AIDS'
  }

export interface IAuthResponse {
    user?: IUser;
    admin?: IAdmin;
    token: string;
}

export interface IUser {
    id?: number;
    name?: string;
    email: string;
    password: string;
    department: Department;
    year: number;
    passoutYear: number;
    roll: number;
    hours: number;
}

export interface IAdmin {
    id?: number;
    name?: string;
    email: string;
    password: string;
}


