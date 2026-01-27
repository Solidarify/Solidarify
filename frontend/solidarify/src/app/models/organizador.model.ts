export class OrganizadorModel {
    idUsuario?: number;
    nombre: string;
    cif: string;
    email: string;
    cargo?: string;
    telefonoDirecto?: string;
    zonaResponsable?: string;
    observaciones?: string;
    createdAt?: Date;

    constructor(data: Partial<OrganizadorModel> = {}) {
        this.idUsuario = data.idUsuario;
        this.nombre = data.nombre?.trim() ?? '';
        this.cif = data.cif?.trim().toUpperCase() ?? '';
        this.email = data.email?.toLocaleLowerCase().trim() ?? '';
        this.cargo = data.cargo?.trim() ?? undefined;
        this.telefonoDirecto = data.telefonoDirecto?.trim() ?? undefined;
        this.zonaResponsable = data.zonaResponsable?.trim() ?? undefined;
        this.observaciones = data.observaciones?.trim() ?? undefined;
        this.createdAt = data.createdAt ? new Date(data.createdAt) : undefined;
    }

    static fromApi(api:any): OrganizadorModel {
        return new OrganizadorModel({
            idUsuario: api?.Id_Usuario || api?.idUsuario,
            nombre: api?.Nombre || api?.nombreOrganizacion,
            cif: api?.CIF || api?.cif,
            email: api?.Email || api?.emailOrganizacion,
            cargo: api?.Cargo || api?.cargo,
            telefonoDirecto: api?.Telefono_Directo || api?.telefonoDirecto,
            zonaResponsable: api?.Zona_Responsable || api?.zonaResponsable,
            observaciones: api?.Observaciones || api?.observaciones,
            createdAt: api?.Fecha_Creacion || api?.createdAt
        });
    }

    get displayName(): string {
    return this.nombre || 'Organizador sin nombre';
  }

  get fullInfo(): string {
    return `${this.nombre} (${this.cif}) - ${this.zonaResponsable || 'Sin zona'}`;
  }

  get hasContactInfo(): boolean {
    return !!(this.telefonoDirecto || this.email);
  }

  get contactSummary(): string {
    const info: string[] = [];
    if (this.email) info.push(this.email);
    if (this.telefonoDirecto) info.push(this.telefonoDirecto);
    return info.join(' | ');
  }
}
