export interface OngSimplificada {
  id: number;
  nombre: string;
}

export class PropuestaModel {
  idPropuesta?: number;
  idOrganizador: number;
  idTipoBien: number;
  titulo: string;
  descripcion: string;
  fechaInicio: Date;
  fechaFin: Date;
  fechaPublicacion?: Date;
  fechaAsignacion?: Date;
  fechaActualizacion?: Date;
  fechaCompletada?: Date;
  motivoCancelacion?: string;
  estadoPropuesta: string;
  lugar: string;
  imagen?: string;
  
  idOngAsignada: number;
  ongAsignada?: OngSimplificada; 

  constructor(data: Partial<PropuestaModel> = {}) {
    this.idPropuesta = data.idPropuesta;
    this.idOrganizador = data.idOrganizador ?? 0;
    this.idTipoBien = data.idTipoBien ?? 0;
    this.titulo = data.titulo ?? '';
    this.descripcion = data.descripcion ?? '';
    this.fechaInicio = data.fechaInicio ? new Date(data.fechaInicio) : new Date();
    this.fechaFin = data.fechaFin ? new Date(data.fechaFin) : new Date();
    this.estadoPropuesta = data.estadoPropuesta ?? 'borrador';
    this.lugar = data.lugar ?? '';
    this.imagen = data.imagen ?? '';
    this.idOngAsignada = data.idOngAsignada ?? 0;
    
    this.ongAsignada = data.ongAsignada;

    this.fechaPublicacion = data.fechaPublicacion ? new Date(data.fechaPublicacion) : undefined;
    this.fechaAsignacion = data.fechaAsignacion ? new Date(data.fechaAsignacion) : undefined;
    this.fechaActualizacion = data.fechaActualizacion ? new Date(data.fechaActualizacion) : undefined;
    this.fechaCompletada = data.fechaCompletada ? new Date(data.fechaCompletada) : undefined;
    this.motivoCancelacion = data.motivoCancelacion ?? undefined;
  }

  static fromApi(api: any): PropuestaModel {
    let ongObj: OngSimplificada | undefined = undefined;

    if (api?.Ong || api?.ongAsignada) {
       const source = api.Ong || api.ongAsignada;
       ongObj = {
         id: source.id || source.Id_Usuario,
         nombre: source.nombre || source.Nombre || source.Nombre_Legal
       };
    } else if (api?.Nombre_Ong_Asignada || api?.nombreOngAsignada) {
       ongObj = {
         id: api.Id_Ong_Asignada || api.idOngAsignada || 0,
         nombre: api.Nombre_Ong_Asignada || api.nombreOngAsignada
       };
    }

    return new PropuestaModel({
      idPropuesta: api?.Id_Propuesta || api?.idPropuesta,
      idOrganizador: api?.Id_Organizador || api?.idOrganizador,
      idTipoBien: api?.Id_Tipo_Bien || api?.idTipoBien,
      titulo: api?.Titulo || api?.titulo,
      descripcion: api?.Descripcion || api?.descripcion,
      fechaInicio: api?.Fecha_Inicio || api?.fechaInicio,
      fechaFin: api?.Fecha_Fin || api?.fechaFin,
      fechaPublicacion: api?.Fecha_Publicacion || api?.fechaPublicacion,
      fechaAsignacion: api?.Fecha_Asignacion || api?.fechaAsignacion,
      fechaActualizacion: api?.Fecha_Actualizacion || api?.fechaActualizacion,
      fechaCompletada: api?.Fecha_Completada || api?.fechaCompletada,
      motivoCancelacion: api?.Motivo_Cancelacion || api?.motivoCancelacion,
      estadoPropuesta: api?.Estado_Propuesta || api?.estadoPropuesta,
      lugar: api?.Lugar || api?.lugar,
      imagen: api?.Imagen || api?.imagen,
      idOngAsignada: api?.Id_Ong_Asignada || api?.idOngAsignada,
      
      ongAsignada: ongObj
    });
  }

  get isPublicada(): boolean {
    return this.estadoPropuesta === 'publicada';
  }

  get isBorrador(): boolean {
    return this.estadoPropuesta === 'borrador';
  }

  get displayTitle(): string {
    return this.titulo || 'Sin título';
  }

  get displayFechas(): string {
    return `${this.fechaInicio.toLocaleDateString()} - ${this.fechaFin.toLocaleDateString()}`;
  }

  get tipoBienNombre(): string {
    const tipos: { [key: number]: string } = {
      1: 'Alimentos',
      2: 'Material escolar',
      3: 'Ropa'
    };
    return tipos[this.idTipoBien] || 'Otros';
  }
}
