export class PerfilONGModel {
    idUsuario?: number;
    nombreLegal: string;
    cif: string;
    descripcion?: string;
    direccion?: string;
    telefonoContacto?: string;
    web?: string;
    estadoVerificacion: string;
    createdAt?: Date;
    idAdminVerificador?: number;

    constructor(data: Partial<PerfilONGModel> = {}) {
        this.idUsuario = data.idUsuario;
        this.nombreLegal = data.nombreLegal?.trim() ?? '';
        this.cif = data.cif?.trim().toUpperCase() ?? '';
        this.descripcion = data.descripcion?.trim() ?? undefined;
        this.direccion = data.direccion?.trim() ?? undefined;
        this.telefonoContacto = data.telefonoContacto?.trim() ?? undefined;
        this.web = data.web?.trim().toLocaleLowerCase().startsWith('http') ? data.web.trim() : undefined;
        this.estadoVerificacion = data.estadoVerificacion?.trim() ?? 'pendiente';
        this.createdAt = data.createdAt ? new Date(data.createdAt) : undefined;
        this.idAdminVerificador = data.idAdminVerificador;
    }

    static fromApi(api: any): PerfilONGModel {
        return new PerfilONGModel({
        idUsuario: api?.Id_Usuario || api?.idUsuario,
        nombreLegal: api?.Nombre_Legal || api?.nombreLegal,
        cif: api?.CIF || api?.cif,
        descripcion: api?.Descripcion || api?.descripcion,
        direccion: api?.Direccion || api?.direccion,
        telefonoContacto: api?.Telefono_Contacto || api?.telefonoContacto,
        web: api?.Web || api?.web,
        estadoVerificacion: api?.Estado_Verificacion || api?.estadoVerificacion,
        createdAt: api?.Fecha_Verificacion || api?.fechaVerificacion,
        idAdminVerificador: api?.Id_Admin_Verificador || api?.idAdminVerificador
        });
    }

    get displayName(): string {
    return this.nombreLegal || 'ONG sin nombre';
  }

  get isVerified(): boolean {
    return this.estadoVerificacion === 'verificado';
  }

  get isPending(): boolean {
    return this.estadoVerificacion === 'pendiente';
  }

  get hasWebsite(): boolean {
    return !!(this.web && this.web.startsWith('http'));
  }

  get fullInfo(): string {
    return `${this.nombreLegal} (${this.cif}) ${this.isVerified ? 'OK' : '⏳'}`;
  }
}
