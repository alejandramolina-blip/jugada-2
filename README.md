# Jugada Maestra ⚽

*Plataforma Completa para la Administración de Clubes de Fútbol Amateur*

Desarrollado para **Don Rafa**, administrador de **"Los Halcones del Barrio"**, un club amateur de fútbol local que requería migrar sus registros físicos en papel a un sistema digital moderno, integrado y responsivo.

---

## 🚀 Tecnologías Utilizadas

* **React 19** con ganchos de estado modernos e interfaces puras.
* **TypeScript** para un desarrollo seguro con tipado completo.
* **Vite** como entorno de ejecución veloz y optimizado.
* **Tailwind CSS** para un diseño moderno con UI premium (inspirado en Power BI, Stripe y Notion).
* **Recharts** para análisis métrico interactivo y visualización del estado financiero e historial de asistencia.
* **Lucide React** para una iconografía limpia y consistente.

---

## 📂 Estructura del Proyecto

El proyecto está organizado siguiendo pautas de arquitectura limpia y modular:

```text
/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── index.html
├── README.md
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── types/
│   │   └── index.ts        # Interfaces completas e invariables de negocio
│   ├── utils/
│   │   └── helpers.ts      # Utilidades de LocalStorage e internacionalización de CLP
│   ├── data/
│   │   └── seedData.ts     # Carga por defecto de registros para la primera visita de "Los Halcones"
│   ├── components/
│   │   ├── Dashboard.tsx   # Panel principal que unifica métricas, gráficos e informes
│   │   ├── PlayersView.tsx  # CRUD de jugadores por categorías
│   │   ├── PaymentsView.tsx # Control administrativo de cobro de membresías
│   │   ├── AttendanceView.tsx # Pasar lista colectiva por fecha y categoría
│   │   ├── CalendarView.tsx   # Agenda mensual de entrenamientos, eventos y partidos
│   │   ├── KPISection.tsx   # Fichas de indicadores analíticos claves (KPIs)
│   │   └── ChartsSection.tsx # Implementación nativa de gráficos estadísticos (Recharts)
│   └── pages/
│       └── HomePage.tsx     # Shell maestro responsivo y barra de navegación lateral
```

---

## 📈 Características Destacadas

### 1. Panel Analítico (Dashboard)
* **Kpis Estratégicos:** Total de plantilla, total de cuotas recaudadas, porcentaje ponderado de asistencias de la temporada y recuento de deudores morosos.
* **Gráficos Integrados:** Visualiza balances acumulados, la evolución cíclica de la participación, asistencia por rama y el estado de la recaudación mediante gráficos de barras de Recharts.
* **Tabla de Morosos:** Identifica inmediatamente los jugadores con deudas vencidas y los montos acumulados para realizar un cobro oportuno.

### 2. Módulo de Jugadores
* Registro completo: Nombre, apellido, categoría (*Infantil, Juvenil, Adulto*), fecha de nacimiento, contacto y estatus habilitado.
* Buscador dinámico de personas con filtros avanzados.

### 3. Gestión Financiera (Pagos)
* Control de cuotas mensuales asociando jugadores, mes, año, montos personalizados en Pesos Chilenos (CLP) y fecha exacta de recepción.
* Cambia entre estatus de forma ágil (*Pagado, Pendiente, Atrasado*).

### 4. Control de Asistencias
* Permite seleccionar una fecha y una categoría de entrenamiento.
* Accesos rápidos para marcar a todo el colectivo presente o ausente.
* Almacena hojas completas de rendimiento histórico en el navegador.

### 5. Agenda & Calendario Mensual (Notion Style)
* Visualiza todas las citas clave agrupadas en un calendario mensual.
* Iconografía y etiquetas de distinción por naturaleza del evento (*Entrenamiento*, *Partido*, *Social/Pleno*).
* Permite agendar interacciones específicas directamente haciendo clic en los días correspondientes.

---

## 💾 Persistencia en LocalStorage Sincronizada

Toda la interacción del usuario se almacena localmente en el navegador a través de adaptadores seguros. Si se desea restaurar el sistema al estado inicial que incluye datos de prueba detallados de grandes deportistas como Diego Maradona o Lionel Messi integrando las distintas ramas de "Los Halcones", se puede utilizar el botón **"Restaurar BD Inicial"** ubicado en el pie del panel lateral izquierdo.
