export class UsuarioModel {
    idUsuario?: number;
    nombre: string;
    email: string;
    passwordHash: string;
    telefono?: string;
    activo: boolean;
    createdAt?: Date;
    updatedAt?: Date;

    constructor(data: Partial<UsuarioModel> = {}) {
        this.idUsuario = data.idUsuario;
        this.nombre = data.nombre ?? '';
        this.email = data.email?.toLowerCase().trim() ?? '';
        this.passwordHash = data.passwordHash ?? '';
        this.telefono = data.telefono?.trim() ?? undefined;
        this.activo = data.activo ?? true;
        this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
        this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
    }

    static fromApi(api: any): UsuarioModel {
        return new UsuarioModel({
            idUsuario: api?.Id_Usuario || api?.idUsuario,
            nombre: api?.Nombre || api?.nombre,
            email: api?.Email || api?.email,
            passwordHash: api?.Password_Hash || api?.passwordHash,
            telefono: api?.Telefono || api?.telefono,
            activo: api?.Activo !== undefined ? api.Activo : true,
            createdAt: api?.CreatedAt || api?.createdAt,
            updatedAt: api?.Updated_At || api?.updatedAt
        });
    }

    get isActive(): boolean {
        return this.activo === true;
    }

    get displayName(): string {
        return this.nombre || 'Usuario sin nombre';
    }

}

