import { Component, OnInit, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Usuario } from '../services/usuario';
import { Propuesta } from '../services/propuesta';
import { PerfilOng } from '../services/perfil-ong';
import { Organizador } from '../services/organizador';
import { Auth } from '../services/auth';

@Component({
  selector: 'app-statistic',
  templateUrl: './statistic.page.html',
  styleUrls: ['./statistic.page.scss'],
  standalone: false
})
export class StatisticPage implements OnInit {
  
  private usuarioSvc = inject(Usuario);
  private propuestaSvc = inject(Propuesta);
  private perfilOngSvc = inject(PerfilOng);
  private organizadorSvc = inject(Organizador);
  public auth = inject(Auth);

  stats = {
    totalUsuarios: 0, totalPropuestas: 0, propuestasPublicas: 0,
    totalOngs: 0, ongsVerificadas: 0, totalOrganizadores: 0
  };
  cargando = true;

  async ngOnInit() {
    console.log('📊 Dashboard Admin iniciado');
    await this.cargarEstadisticas();
  }

  async cargarEstadisticas() {
    this.cargando = true;
    try {
      const [usuarios, todas, publicas, ongs, verificadas, organizadores] = 
        await Promise.all([
          firstValueFrom(this.usuarioSvc.getAll()),
          firstValueFrom(this.propuestaSvc.getAll()),
          firstValueFrom(this.propuestaSvc.getPublicas()),
          firstValueFrom(this.perfilOngSvc.getAll()),
          firstValueFrom(this.perfilOngSvc.getVerificadas()),
          firstValueFrom(this.organizadorSvc.getAll())
        ]);

      const totalUsuariosTodosTipos = usuarios.length + ongs.length + organizadores.length;

      this.stats = {
        totalUsuarios: totalUsuariosTodosTipos, 
        totalPropuestas: todas.length,
        propuestasPublicas: publicas.length,
        totalOngs: ongs.length,
        ongsVerificadas: verificadas.length,
        totalOrganizadores: organizadores.length
      };
    } catch (error) {
      console.error('Error estadísticas:', error);
    } finally {
      this.cargando = false;
    }
  }
}