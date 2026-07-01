import React, { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import CIcon from '@coreui/icons-react'
import { cilInfo, cilX, cilChevronLeft, cilChevronRight } from '@coreui/icons'
import './UserTour.css'

const TOUR_STEPS = {
  '/dashboard': [
    {
      selector: '.welcome-card-tour',
      title: 'Panel Principal',
      content: '¡Bienvenido al Sistema Judicial Integrado! Aquí puedes ver un resumen rápido del estado de las denuncias, oficiales y zonas registradas.',
      placement: 'bottom'
    },
    {
      selector: '.tour-sidebar-wrapper',
      title: 'Menú de Navegación',
      content: 'Usa esta barra lateral para acceder a los distintos módulos del sistema: Denuncias, Oficiales, Usuarios, Asignaciones y Zonas.',
      placement: 'right'
    },
    {
      selector: '.header-nav',
      title: 'Barra de Encabezado',
      content: 'Aquí encontrarás notificaciones, el selector de tema (Claro/Oscuro) y las opciones de tu perfil de usuario.',
      placement: 'bottom'
    }
  ],
  '/users': [
    {
      selector: '.tour-users-title',
      title: 'Gestión de Usuarios',
      content: 'Esta pantalla te permite administrar las cuentas de acceso del sistema: administradores, funcionarios, oficiales y civiles.',
      placement: 'bottom'
    },
    {
      selector: '.tour-users-search',
      title: 'Buscador Rápido',
      content: 'Escribe el nombre, apellido, correo o Cédula para filtrar y encontrar un usuario en segundos.',
      placement: 'bottom'
    },
    {
      selector: '.tour-users-new-btn',
      title: 'Crear Nuevo Usuario',
      content: 'Haz clic aquí para registrar un nuevo usuario. Te guiará paso a paso en un formulario interactivo.',
      placement: 'left'
    },
    {
      selector: '.tour-users-table',
      title: 'Lista de Usuarios',
      content: 'Visualiza la información detallada de cada usuario, su rol asignado, estado de cuenta y métodos de contacto.',
      placement: 'top'
    },
    {
      selector: '.tour-users-actions-first',
      title: 'Opciones y Acciones',
      content: 'Usa estos botones para ver detalles completos, editar el perfil del usuario, cambiar su rol/estado o eliminarlo.',
      placement: 'left'
    }
  ],
  '/users-form-step-1': [
    {
      selector: '.modal-content',
      title: 'Paso 1: Datos Personales',
      content: 'Comencemos ingresando la identificación básica del usuario. Los campos marcados con (*) son estrictamente obligatorios.',
      placement: 'center'
    },
    {
      selector: '.tour-user-form-firstname',
      title: 'Primer Nombre',
      content: 'Escribe aquí el primer nombre del usuario. Debe contener únicamente letras, sin números ni caracteres especiales.',
      placement: 'right'
    },
    {
      selector: '.tour-user-form-lastname',
      title: 'Primer Apellido',
      content: 'Escribe aquí el primer apellido del usuario. También se valida que posea únicamente letras.',
      placement: 'right'
    },
    {
      selector: '.tour-user-form-dni',
      title: 'Cédula de Identidad',
      content: 'Selecciona el tipo de nacionalidad (V para Venezolano, E para Extranjero) e ingresa el número. El sistema comprobará al instante si ya está registrado.',
      placement: 'bottom'
    },
    {
      selector: '.tour-user-form-birth',
      title: 'Fecha de Nacimiento',
      content: 'Ingresa la fecha de nacimiento. La plataforma requiere obligatoriamente que el usuario sea mayor de edad (mínimo 18 años).',
      placement: 'top'
    },
    {
      selector: '.modal-footer .colorbutton',
      title: 'Siguiente Paso',
      content: 'Una vez rellenados los campos obligatorios sin errores, haz clic en "Siguiente" para continuar al paso de Contacto.',
      placement: 'top'
    }
  ],
  '/users-form-step-2': [
    {
      selector: '.modal-content',
      title: 'Paso 2: Información de Contacto',
      content: 'Aquí configuramos los medios de localización del usuario. Debes ingresar al menos un método de contacto válido.',
      placement: 'center'
    },
    {
      selector: '.tour-user-form-email',
      title: 'Correo Electrónico',
      content: 'Escribe la dirección de correo electrónico del usuario. Será útil para notificaciones de seguridad del sistema.',
      placement: 'right'
    },
    {
      selector: '.tour-user-form-phone',
      title: 'Número de Teléfono',
      content: 'Selecciona la operadora correspondiente e ingresa el número de teléfono celular (7 dígitos).',
      placement: 'top'
    },
    {
      selector: '.modal-footer .colorbutton',
      title: 'Avanzar / Retroceder',
      content: 'Haz clic en "Siguiente" para ir a las credenciales, o en "Atrás" si deseas modificar los datos personales.',
      placement: 'top'
    }
  ],
  '/users-form-step-3': [
    {
      selector: '.modal-content',
      title: 'Paso 3: Credenciales y Estado',
      content: 'En este último paso definimos los permisos de acceso y las claves de ingreso a la plataforma.',
      placement: 'center'
    },
    {
      selector: '.tour-user-form-role',
      title: 'Rol en la Comandancia',
      content: 'Selecciona el perfil de acceso: Civil, Funcionario, Oficial o Administrador, según el rango de funciones que desempeñará.',
      placement: 'bottom'
    },
    {
      selector: '.tour-user-form-status',
      title: 'Estado del Usuario',
      content: 'Define si la cuenta iniciará Activa, Suspendida o Inactiva temporalmente.',
      placement: 'bottom'
    },
    {
      selector: '.tour-user-form-password',
      title: 'Clave de Seguridad',
      content: 'Establece una contraseña segura (mínimo 6 caracteres) para el inicio de sesión. Si estás editando, puedes dejarla vacía para conservar la anterior.',
      placement: 'top'
    },
    {
      selector: '.tour-user-form-confirm-password',
      title: 'Confirmar Contraseña',
      content: 'Repite la misma contraseña para verificar que no haya errores de escritura. Ambas deben coincidir exactamente para proceder.',
      placement: 'top'
    },
    {
      selector: 'button[type="submit"]',
      title: 'Guardar Registro',
      content: 'Haz clic en este botón para registrar o actualizar el perfil de usuario en la base de datos de la comandancia.',
      placement: 'top'
    }
  ],
  '/complaints': [
    {
      selector: '.tour-complaints-title',
      title: 'Módulo de Denuncias',
      content: 'Aquí puedes registrar, visualizar y realizar el seguimiento de todas las denuncias en el sistema.',
      placement: 'bottom'
    },
    {
      selector: '.tour-complaints-new-btn',
      title: 'Nueva Denuncia',
      content: 'Registra una nueva denuncia ingresando la información del denunciante, la descripción de los hechos y la ubicación del suceso.',
      placement: 'left'
    },
    {
      selector: '.tour-complaints-table',
      title: 'Listado de Casos',
      content: 'Visualiza el estado de cada denuncia (Pendiente, En Proceso, Resuelta), la fecha y los detalles del caso.',
      placement: 'top'
    },
    {
      selector: '.tour-complaints-actions-first',
      title: 'Opciones de la Denuncia',
      content: 'Usa estos botones para ver los detalles del caso, descargar la denuncia en formato PDF, editar su información o eliminarla.',
      placement: 'left'
    }
  ],
  '/officers': [
    {
      selector: '.tour-officers-title',
      title: 'Gestión de Oficiales',
      content: 'Esta pantalla te permite administrar las cuentas y el personal activo de la fuerza policial, rangos y cuadrantes.',
      placement: 'bottom'
    },
    {
      selector: '.tour-officers-search',
      title: 'Buscar Oficiales',
      content: 'Usa este buscador rápido ingresando nombre, apellido, número de placa o unidad para filtrar los oficiales al instante.',
      placement: 'bottom'
    },
    {
      selector: '.tour-officers-new-btn',
      title: 'Registrar Nuevo Oficial',
      content: 'Presiona este botón para dar de alta a un nuevo oficial y rellenar sus datos de patrullaje, rango y placa.',
      placement: 'left'
    },
    {
      selector: '.tour-officers-actions-first',
      title: 'Acciones del Oficial',
      content: 'Desde aquí puedes ver la información completa del oficial, modificar sus detalles de rango o suspender/eliminar su perfil del sistema.',
      placement: 'left'
    }
  ],
  '/assignments': [
    {
      selector: '.tour-assignments-title',
      title: 'Módulo de Asignaciones',
      content: 'Este panel te permite vincular denuncias de delitos con tribunales, jueces principales, fiscales, oficiales a cargo, testigos y miembros del jurado.',
      placement: 'bottom'
    },
    {
      selector: '.tour-assignments-new-btn',
      title: 'Nueva Asignación Judicial',
      content: 'Haz clic aquí para iniciar el registro de un nuevo caso y asignarle personal. Te guiará paso a paso.',
      placement: 'left'
    },
    {
      selector: '.tour-assignments-actions-first',
      title: 'Ficha y Acciones',
      content: 'Usa este botón de información para abrir la visualización completa del caso, descargar su reporte PDF oficial o gestionar su estado de proceso.',
      placement: 'left'
    }
  ],
  '/zones': [
    {
      selector: '.tour-zones-title',
      title: 'Mapa de Zonas de Patrullaje',
      content: 'Representación geográfica interactiva de la jurisdicción. Los sectores coloreados delimitan cada zona de patrullaje, y los puntos muestran denuncias (rojo: pendientes; verde: resueltas). Haz clic en una zona para ver sus estadísticas detalladas.',
      placement: 'bottom'
    },
    {
      selector: '.tour-zones-sidebar-title',
      title: 'Panel de Zonas',
      content: 'Panel lateral que agrupa denuncias por zona. Permite buscar reportes, expandir sectores, ubicarlos en el mapa con el botón del pin, o ver indicadores generales con el botón de estadísticas globales al final.',
      placement: 'left'
    },
    {
      selector: '.tour-zones-global-stats-btn',
      title: 'Estadísticas Globales de Zonas',
      content: 'Haz clic en este botón para abrir las métricas consolidadas de la jurisdicción: distribución total de casos por prioridad y estado de resolución.',
      placement: 'left'
    }
  ],
  '/profile': [
    {
      selector: '.tour-profile-card',
      title: 'Tu Perfil de Usuario',
      content: 'Revisa tu información personal, cambia tu contraseña y configura tus datos de contacto.',
      placement: 'bottom'
    }
  ],
  '/officers-form-step-1': [
    {
      selector: '.modal-content',
      title: 'Paso 1: Datos del Oficial',
      content: 'Introduce los nombres, apellidos y cédula de identidad del nuevo oficial.',
      placement: 'center'
    },
    {
      selector: '.tour-officer-form-firstname',
      title: 'Primer Nombre',
      content: 'Ingresa el nombre del oficial. Debe contener únicamente caracteres alfabéticos.',
      placement: 'right'
    },
    {
      selector: '.tour-officer-form-lastname',
      title: 'Primer Apellido',
      content: 'Ingresa el apellido principal del oficial de patrullaje.',
      placement: 'right'
    },
    {
      selector: '.tour-officer-form-dni',
      title: 'Cédula del Oficial',
      content: 'La cédula será el identificador único del oficial en el sistema de patrullaje y asignación.',
      placement: 'bottom'
    },
    {
      selector: '.modal-footer .colorbutton',
      title: 'Continuar',
      content: 'Presiona "Siguiente" para pasar a la información de contacto.',
      placement: 'top'
    }
  ],
  '/officers-form-step-2': [
    {
      selector: '.modal-content',
      title: 'Paso 2: Contacto del Oficial',
      content: 'Ingresa el correo y teléfono del oficial para mantener comunicación con la central de comandos.',
      placement: 'center'
    },
    {
      selector: '.tour-officer-form-email',
      title: 'Correo Electrónico',
      content: 'Correo del oficial, útil para reportes automatizados y notificaciones.',
      placement: 'right'
    },
    {
      selector: '.tour-officer-form-phone',
      title: 'Número Telefónico',
      content: 'Número móvil para coordinaciones directas y envío de alertas de incidencias.',
      placement: 'top'
    },
    {
      selector: '.modal-footer .colorbutton',
      title: 'Siguiente paso',
      content: 'Haz clic para ir a los detalles de patrullaje y servicio.',
      placement: 'top'
    }
  ],
  '/officers-form-step-3': [
    {
      selector: '.modal-content',
      title: 'Paso 3: Detalles de Servicio',
      content: 'Establece la unidad policial, rango activo y el estado de servicio actual del oficial.',
      placement: 'center'
    },
    {
      selector: '.tour-officer-form-unit',
      title: 'Unidad de Adscripción',
      content: 'Especifica el departamento o división a la que pertenece el oficial (Ej. CICPC - Homicidios, Patrullaje Zona Norte).',
      placement: 'bottom'
    },
    {
      selector: '.tour-officer-form-rank',
      title: 'Rango Policial',
      content: 'Selecciona la jerarquía del oficial, desde Cadete hasta Comandante o Jefe de Comando.',
      placement: 'bottom'
    },
    {
      selector: '.tour-officer-form-status',
      title: 'Estado de Actividad',
      content: 'Define si el oficial se encuentra Activo, Suspendido, Inactivo o En Formación.',
      placement: 'bottom'
    },
    {
      selector: 'button[type="submit"]',
      title: 'Guardar Ficha del Oficial',
      content: 'Confirma los datos para guardar la ficha técnica del oficial en la base de datos.',
      placement: 'top'
    }
  ],
  '/complaints-form-step-1': [
    {
      selector: '.modal-content',
      title: 'Paso 1: Delito y Hechos',
      content: 'Comencemos categorizando el delito y redactando la descripción de los hechos.',
      placement: 'center'
    },
    {
      selector: '.tour-complaint-form-crime',
      title: 'Tipo de Delito',
      content: 'Selecciona el delito que corresponda. El sistema provee definiciones precargadas de la Ley Orgánica para cada tipo.',
      placement: 'bottom'
    },
    {
      selector: '.tour-complaint-form-description',
      title: 'Descripción del Suceso',
      content: 'Describe detalladamente los hechos de forma objetiva (lugar, modus operandi, pertenencias sustraídas o daños).',
      placement: 'top'
    },
    {
      selector: '.tour-complaint-form-date',
      title: 'Fecha del Suceso',
      content: 'Registra el día exacto en que ocurrió el suceso delictivo.',
      placement: 'top'
    }
  ],
  '/complaints-form-step-2': [
    {
      selector: '.modal-content',
      title: 'Paso 2: Datos del Denunciante',
      content: 'Establecemos quién realiza el reporte para poder ponernos en contacto e iniciar la citación oficial.',
      placement: 'center'
    },
    {
      selector: '.tour-complaint-form-name',
      title: 'Nombre del Denunciante',
      content: 'Nombre completo de quien denuncia. Si es un civil registrado, escribe su nombre para ver sugerencias y rellenar automáticamente.',
      placement: 'bottom'
    },
    {
      selector: '.tour-complaint-form-phone',
      title: 'Teléfono de Contacto',
      content: 'Número telefónico móvil activo para comunicación directa con el cuerpo policial.',
      placement: 'top'
    },
    {
      selector: '.tour-complaint-form-email',
      title: 'Correo Electrónico',
      content: 'Dirección de correo para remitir copias certificadas del expediente digital.',
      placement: 'top'
    }
  ],
  '/complaints-form-step-3': [
    {
      selector: '.modal-content',
      title: 'Paso 3: Ubicación Geográfica',
      content: 'Definimos el lugar físico del incidente para cuadrantes de patrullaje.',
      placement: 'center'
    },
    {
      selector: '.tour-complaint-form-zone',
      title: 'Zona o Cuadrante',
      content: 'Asocia el caso a una de las zonas de patrullaje de San Cristóbal.',
      placement: 'bottom'
    },
    {
      selector: '.tour-complaint-form-address',
      title: 'Dirección Escrita',
      content: 'Describe detalladamente la dirección, calles principales y puntos de referencia cercanos.',
      placement: 'bottom'
    },
    {
      selector: '.tour-complaint-form-map',
      title: 'Mapa e Hidrografía Geográfica',
      content: 'Haz clic directamente sobre el mapa interactivo en el lugar exacto. Las coordenadas de latitud/longitud y la zona se asignarán automáticamente.',
      placement: 'top'
    }
  ],
  '/complaints-form-step-4': [
    {
      selector: '.modal-content',
      title: 'Paso 4: Asignación y Evidencia',
      content: 'Último paso. Asigna responsabilidades y adjunta material probatorio.',
      placement: 'center'
    },
    {
      selector: '.tour-complaint-form-officer',
      title: 'Oficial Receptor / Investigador',
      content: 'Selecciona al oficial policial de guardia que quedará a cargo de la investigación preliminar.',
      placement: 'bottom'
    },
    {
      selector: '.tour-complaint-form-priority',
      title: 'Prioridad del Caso',
      content: 'Clasifica la urgencia: Baja, Media, Alta o Urgente según la gravedad de los hechos.',
      placement: 'bottom'
    },
    {
      selector: '.tour-complaint-form-status',
      title: 'Estado del Reporte',
      content: 'Indica el estado actual del trámite administrativo (ej. Recibido, En Investigación, Resuelto).',
      placement: 'bottom'
    },
    {
      selector: '.tour-complaint-form-file',
      title: 'Cargar Evidencias Multimedia',
      content: 'Sube fotografías de la escena, grabaciones de audio, actas escaneadas o videos que sirvan como material probatorio.',
      placement: 'top'
    }
  ],
  '/complaints-info': [
    {
      selector: '.modal-content',
      title: 'Detalles de la Denuncia',
      content: 'Ficha técnica certificada de la denuncia con toda la información cargada por el civil o funcionario.',
      placement: 'center'
    },
    {
      selector: '.tour-complaint-info-card',
      title: 'Hechos Denunciados',
      content: 'Muestra el delito tipificado, descripción completa de lo acontecido, estado actual y prioridad.',
      placement: 'bottom'
    },
    {
      selector: '.tour-complaint-info-location-card',
      title: 'Dirección y Geolocalización',
      content: 'Indica las calles y avenidas asociadas y presenta un mapa interactivo señalando el punto preciso del suceso.',
      placement: 'top'
    },
    {
      selector: '.tour-complaint-info-complainant-card',
      title: 'Datos del Ciudadano',
      content: 'Ficha de contacto del denunciante: nombre, teléfono celular y correo electrónico.',
      placement: 'right'
    },
    {
      selector: '.tour-complaint-info-chronology-card',
      title: 'Cronograma y Responsable',
      content: 'Muestra la fecha del reporte y el oficial policial asignado al patrullaje e investigación de este caso.',
      placement: 'left'
    },
    {
      selector: '.tour-complaint-info-evidence-card',
      title: 'Visor de Evidencia',
      content: 'Galería de fotos y archivos adjuntos como pruebas sustanciales.',
      placement: 'top'
    },
    {
      selector: '.tour-complaint-info-pdf-btn',
      title: 'Exportar Reporte PDF',
      content: 'Descarga un informe policial en formato PDF con membrete y sellos de seguridad oficiales.',
      placement: 'top'
    }
  ],
  '/assignments-form-step-1': [
    {
      selector: '.modal-content',
      title: 'Paso 1: Delito y Tribunal',
      content: 'Asignamos los datos jurídicos fundamentales del caso.',
      placement: 'center'
    },
    {
      selector: '.tour-assignment-form-title',
      title: 'Delito Asignado',
      content: 'Selecciona el delito tipificado que se imputa en este proceso penal.',
      placement: 'bottom'
    },
    {
      selector: '.tour-assignment-form-description',
      title: 'Resumen Jurídico',
      content: 'Escribe un resumen de los cargos, hechos o estado del caso judicial a procesar.',
      placement: 'top'
    },
    {
      selector: '.tour-assignment-form-court',
      title: 'Tribunal Competente',
      content: 'Selecciona la sala de tribunal que llevará la causa. Al seleccionarla, la ubicación física de la sede se rellenará automáticamente.',
      placement: 'bottom'
    },
    {
      selector: '.tour-assignment-form-judge',
      title: 'Juez Principal',
      content: 'Selecciona al magistrado o juez a cargo de presidir las audiencias y dictaminar sentencia.',
      placement: 'bottom'
    }
  ],
  '/assignments-form-step-2': [
    {
      selector: '.modal-content',
      title: 'Paso 2: Cronograma y Estados',
      content: 'Define las fechas clave del proceso penal, estado de la causa y prioridad.',
      placement: 'center'
    },
    {
      selector: '.tour-assignment-form-hearing-date',
      title: 'Audiencia de Presentación',
      content: 'Define la fecha y hora de la audiencia. El sistema valida que no sea una fecha pasada.',
      placement: 'bottom'
    },
    {
      selector: '.tour-assignment-form-trial-date',
      title: 'Fecha de Juicio Oral',
      content: 'Establece la fecha y hora del juicio oral y público. Debe ser posterior a la audiencia.',
      placement: 'bottom'
    },
    {
      selector: '.tour-assignment-form-status',
      title: 'Estado del Caso',
      content: 'Clasifica la fase actual: Programada, En Progreso, Completada, Pospuesta o Cancelada.',
      placement: 'bottom'
    },
    {
      selector: '.tour-assignment-form-priority',
      title: 'Prioridad de Agenda',
      content: 'Prioridad del caso (Alta, Media o Baja) para la organización de la agenda judicial.',
      placement: 'bottom'
    }
  ],
  '/assignments-form-step-3': [
    {
      selector: '.modal-content',
      title: 'Paso 3: Partes y Participantes',
      content: 'Vincula a todas las personas y roles que forman parte activa de este juicio.',
      placement: 'center'
    },
    {
      selector: '.tour-assignment-form-officials',
      title: 'Oficiales y Defensores',
      content: 'Añade los oficiales de policía investigadores, detectives o abogados defensores vinculados.',
      placement: 'top'
    },
    {
      selector: '.tour-assignment-form-funcionaries',
      title: 'Personal Judicial',
      content: 'Registra secretarios, fiscales, relatores o alguaciles asignados a la sala de audiencias.',
      placement: 'top'
    },
    {
      selector: '.tour-assignment-form-witnesses',
      title: 'Testigos del Caso',
      content: 'Declara a los ciudadanos que comparecerán ante el tribunal en calidad de testigos.',
      placement: 'top'
    },
    {
      selector: '.tour-assignment-form-jury',
      title: 'Miembros del Jurado',
      content: 'Registra los ciudadanos elegidos por sorteo para constituir el jurado de la causa.',
      placement: 'top'
    }
  ],
  '/assignments-info': [
    {
      selector: '.modal-content',
      title: 'Detalles de la Asignación',
      content: 'Resumen completo de la causa penal abierta, participantes e itinerario de fechas.',
      placement: 'center'
    },
    {
      selector: '.tour-assignment-info-case-card',
      title: 'Ficha del Caso',
      content: 'Título de la imputación, número de expediente y estado procesal.',
      placement: 'bottom'
    },
    {
      selector: '.tour-assignment-info-court-card',
      title: 'Ficha del Tribunal',
      content: 'Sede judicial asignada, dirección y el Juez Principal a cargo de dictaminar.',
      placement: 'right'
    },
    {
      selector: '.tour-assignment-info-participants-card',
      title: 'Consolidado de Participantes',
      content: 'Estadísticas del total de personas involucradas (Oficiales, Testigos, Alguaciles, Jurados).',
      placement: 'left'
    },
    {
      selector: '.tour-assignment-info-hearing-card',
      title: 'Fecha de Audiencia',
      content: 'Día y hora pautados para la audiencia preliminar.',
      placement: 'top'
    },
    {
      selector: '.tour-assignment-info-trial-card',
      title: 'Fecha de Juicio',
      content: 'Día y hora reservados en la agenda judicial para el juicio oral.',
      placement: 'top'
    },
    {
      selector: '.tour-assignment-info-pdf-btn',
      title: 'Descargar Informe de Causa',
      content: 'Descarga la citación y detalles del expediente en formato PDF listo para firmar.',
      placement: 'top'
    }
  ],
  '/zones-info': [
    {
      selector: '.modal-content',
      title: 'Estadísticas de la Zona',
      content: 'Detalles de criminalidad y denuncias asociadas a este cuadrante de patrullaje.',
      placement: 'center'
    },
    {
      selector: '.tour-zone-info-status',
      title: 'Frecuencia de Casos por Estado',
      content: 'Muestra cuántas denuncias de la zona están Resueltas, En Investigación o Pendientes, junto a su porcentaje del total.',
      placement: 'bottom'
    },
    {
      selector: '.tour-zone-info-priority',
      title: 'Urgencia de Casos',
      content: 'Gráficas de barra con la distribución de denuncias según prioridad.',
      placement: 'bottom'
    },
    {
      selector: '.tour-zone-info-list',
      title: 'Denuncias Vinculadas',
      content: 'Listado interactivo de todas las denuncias ocurridas en esta zona. Haz clic sobre cualquiera para abrir sus detalles.',
      placement: 'top'
    },
    {
      selector: '.tour-zone-info-xls-btn',
      title: 'Exportar a Excel',
      content: 'Descarga un informe detallado con todas las denuncias de la zona en formato XLS (Excel).',
      placement: 'top'
    }
  ],
  '/officers-info': [
    {
      selector: '.modal-content',
      title: 'Panel de Información del Oficial',
      content: 'Este panel de información muestra la ficha técnica completa del oficial policial: hoja de vida, contacto e historial de denuncias.',
      placement: 'center'
    },
    {
      selector: '.tour-officer-info-profile',
      title: 'Perfil y Rango',
      content: 'Detalla su rango de fuerza (Oficial, Sargento, etc.), unidad de adscripción y estado actual en el sistema.',
      placement: 'bottom'
    },
    {
      selector: '.tour-officer-info-contact',
      title: 'Datos de Contacto',
      content: 'Muestra la cédula de identidad del oficial, su correo electrónico y número de teléfono corporativo.',
      placement: 'right'
    },
    {
      selector: '.tour-officer-info-stats',
      title: 'Métricas de Desempeño',
      content: 'Resume el historial del oficial: casos resueltos, casos en investigación y volumen total asignado.',
      placement: 'left'
    }
  ],
  '/users-info': [
    {
      selector: '.modal-content',
      title: 'Panel de Detalles del Usuario',
      content: 'Este panel de información muestra la ficha técnica completa del usuario seleccionado: rol de acceso, estado y contacto.',
      placement: 'center'
    },
    {
      selector: '.tour-user-info-profile',
      title: 'Ficha de Perfil',
      content: 'Muestra la foto del usuario, su nombre completo y el rol asignado en la comandancia.',
      placement: 'bottom'
    },
    {
      selector: '.tour-user-info-contact',
      title: 'Identificación y Contacto',
      content: 'Muestra el número de Cédula de Identidad (DNI), dirección de correo electrónico y teléfono móvil del usuario.',
      placement: 'top'
    },
    {
      selector: '.tour-user-info-system',
      title: 'Información de Cuenta',
      content: 'Muestra su nivel de permisos, estado (Activo, Suspendido, Inactivo), y fecha de alta en la plataforma.',
      placement: 'left'
    }
  ]
}

const UserTour = () => {
  const location = useLocation()
  const [active, setActive] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const [currentSteps, setCurrentSteps] = useState([])
  const [highlightRect, setHighlightRect] = useState({ top: 0, left: 0, width: 0, height: 0, visible: false })
  const [popoverStyle, setPopoverStyle] = useState({ top: 0, left: 0 })
  const [arrowClass, setArrowClass] = useState('')
  const popoverRef = useRef(null)

  // Determinar los pasos según la ruta y si hay modales visibles
  const getActiveSteps = () => {
    const currentPath = location.pathname.toLowerCase()

    // Si hay un modal abierto, ver su título para activar el manual correspondiente
    const modalTitleEl = document.querySelector('.modal .modal-title')
    if (modalTitleEl) {
      const titleText = modalTitleEl.textContent.toLowerCase()

      // Separar formularios de paneles de información por el título
      if (titleText.includes('usuario')) {
        if (titleText.includes('información') || titleText.includes('informacion')) {
          return TOUR_STEPS['/users-info'] || []
        }

        // Determinar paso actual por el subtítulo o elemento H5 presente en el modal body (evitando CModalTitle)
        const stepHeaderEl = document.querySelector('.modal .modal-body h5')
        if (stepHeaderEl) {
          const headerText = stepHeaderEl.textContent.toLowerCase()
          if (headerText.includes('personal')) {
            return TOUR_STEPS['/users-form-step-1'] || []
          }
          if (headerText.includes('contacto')) {
            return TOUR_STEPS['/users-form-step-2'] || []
          }
          if (headerText.includes('sistema')) {
            return TOUR_STEPS['/users-form-step-3'] || []
          }
        }

        return TOUR_STEPS['/users-form-step-1'] || []
      }
      if (titleText.includes('oficial')) {
        if (titleText.includes('información') || titleText.includes('informacion')) {
          return TOUR_STEPS['/officers-info'] || []
        }

        // Determinar paso actual por el subtítulo o elemento H5 presente en el modal body (evitando CModalTitle)
        const stepHeaderEl = document.querySelector('.modal .modal-body h5')
        if (stepHeaderEl) {
          const headerText = stepHeaderEl.textContent.toLowerCase()
          if (headerText.includes('personal')) {
            return TOUR_STEPS['/officers-form-step-1'] || []
          }
          if (headerText.includes('contacto')) {
            return TOUR_STEPS['/officers-form-step-2'] || []
          }
          if (headerText.includes('servicio')) {
            return TOUR_STEPS['/officers-form-step-3'] || []
          }
        }

        return TOUR_STEPS['/officers-form-step-1'] || []
      }
      if (titleText.includes('denuncia')) {
        if (titleText.includes('información') || titleText.includes('informacion') || titleText.includes('detalles')) {
          return TOUR_STEPS['/complaints-info'] || []
        }
        if (titleText.includes('paso 1') || titleText.includes('hechos') || titleText.includes('información de la denuncia') || titleText.includes('informacion de la denuncia')) {
          return TOUR_STEPS['/complaints-form-step-1'] || []
        }
        if (titleText.includes('paso 2') || titleText.includes('denunciante')) {
          return TOUR_STEPS['/complaints-form-step-2'] || []
        }
        if (titleText.includes('paso 3') || titleText.includes('ubicación') || titleText.includes('ubicacion')) {
          return TOUR_STEPS['/complaints-form-step-3'] || []
        }
        if (titleText.includes('paso 4') || titleText.includes('asignación') || titleText.includes('asignacion')) {
          return TOUR_STEPS['/complaints-form-step-4'] || []
        }

        const stepHeaderEl = document.querySelector('.modal .modal-body h6')
        if (stepHeaderEl) {
          const headerText = stepHeaderEl.textContent.toLowerCase()
          if (headerText.includes('denuncia') && !headerText.includes('denunciante')) {
            return TOUR_STEPS['/complaints-form-step-1'] || []
          }
          if (headerText.includes('denunciante')) {
            return TOUR_STEPS['/complaints-form-step-2'] || []
          }
          if (headerText.includes('ubicación') || headerText.includes('ubicacion')) {
            return TOUR_STEPS['/complaints-form-step-3'] || []
          }
          if (headerText.includes('asignación') || headerText.includes('asignacion') || headerText.includes('evidencia')) {
            return TOUR_STEPS['/complaints-form-step-4'] || []
          }
        }
        return TOUR_STEPS['/complaints-form-step-1'] || []
      }
      if (titleText.includes('asignación') || titleText.includes('asignacion')) {
        if (titleText.includes('paso 1') || titleText.includes('delito') || titleText.includes('caso')) {
          return TOUR_STEPS['/assignments-form-step-1'] || []
        }
        if (titleText.includes('paso 2') || titleText.includes('fechas') || titleText.includes('cronograma')) {
          return TOUR_STEPS['/assignments-form-step-2'] || []
        }
        if (titleText.includes('paso 3') || titleText.includes('partes') || titleText.includes('participantes') || titleText.includes('oficiales')) {
          return TOUR_STEPS['/assignments-form-step-3'] || []
        }

        const stepHeaderEl = document.querySelector('.modal .modal-body h6')
        if (stepHeaderEl) {
          const headerText = stepHeaderEl.textContent.toLowerCase()
          if (headerText.includes('información del caso') || headerText.includes('informacion del caso')) {
            return TOUR_STEPS['/assignments-form-step-1'] || []
          }
          if (headerText.includes('fechas importantes') || headerText.includes('fecha')) {
            return TOUR_STEPS['/assignments-form-step-2'] || []
          }
          if (headerText.includes('oficiales') || headerText.includes('participantes')) {
            return TOUR_STEPS['/assignments-form-step-3'] || []
          }
        }

        return TOUR_STEPS['/assignments-info'] || []
      }
      if (titleText.includes('zona')) {
        return TOUR_STEPS['/zones-info'] || []
      }
    }

    return TOUR_STEPS[currentPath] || TOUR_STEPS['/dashboard']
  }

  // Iniciar el tour
  const startTour = () => {
    const steps = getActiveSteps()
    if (steps && steps.length > 0) {
      setCurrentSteps(steps)
      setStepIndex(0)
      setActive(true)
    } else {
      alert('Esta pantalla no tiene un tutorial configurado aún.')
    }
  }

  // Cerrar el tour
  const closeTour = () => {
    setActive(false)
    setHighlightRect({ top: 0, left: 0, width: 0, height: 0, visible: false })
  }

  // Avanzar
  const nextStep = () => {
    if (stepIndex < currentSteps.length - 1) {
      setStepIndex(stepIndex + 1)
    } else {
      closeTour()
    }
  }

  // Retroceder
  const prevStep = () => {
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1)
    }
  }

  // Actualizar posiciones de destaque y popover
  const updatePosition = () => {
    if (!active || currentSteps.length === 0) return

    const step = currentSteps[stepIndex]
    if (!step) return

    // Buscar elemento
    let el = document.querySelector(step.selector)

    // Si no encuentra el selector y estamos en el formulario, intentar re-escanear
    if (!el && step.selector === '.modal-content') {
      el = document.querySelector('.modal-content')
    }

    if (el) {
      // Hacer scroll suave hacia el elemento
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })

      const rect = el.getBoundingClientRect()

      // Expandir ligeramente el recuadro para que respire el elemento
      const padding = 6
      const highlight = {
        top: rect.top - padding,
        left: rect.left - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
        visible: true,
        isCenter: false
      }
      setHighlightRect(highlight)

      // Calcular posición del popover
      const popoverWidth = 320
      const popoverHeight = popoverRef.current ? popoverRef.current.offsetHeight : 180
      let top = 0
      let left = 0
      let placement = step.placement

      // Auto-flip si no hay suficiente espacio vertical
      if (placement === 'bottom' && rect.bottom + 14 + popoverHeight > window.innerHeight - 10) {
        placement = 'top'
      } else if (placement === 'top' && rect.top - 14 - popoverHeight < 10) {
        placement = 'bottom'
      }

      // Si la colocación por defecto no cabe, podemos reajustarla
      if (placement === 'bottom') {
        top = rect.bottom + 14
        left = rect.left + rect.width / 2 - popoverWidth / 2
        setArrowClass('user-tour-arrow-bottom')
      } else if (placement === 'top') {
        top = rect.top - popoverHeight - 14
        left = rect.left + rect.width / 2 - popoverWidth / 2
        setArrowClass('user-tour-arrow-top')
      } else if (placement === 'right') {
        top = rect.top + rect.height / 2 - popoverHeight / 2
        left = rect.right + 14
        if (left + popoverWidth > window.innerWidth) {
          // Cambiar a la izquierda si no cabe a la derecha
          left = rect.left - popoverWidth - 14
          setArrowClass('user-tour-arrow-left')
        } else {
          setArrowClass('user-tour-arrow-right')
        }
      } else if (placement === 'left') {
        top = rect.top + rect.height / 2 - popoverHeight / 2
        left = rect.left - popoverWidth - 14
        if (left < 10) {
          left = rect.right + 14
          setArrowClass('user-tour-arrow-right')
        } else {
          setArrowClass('user-tour-arrow-left')
        }
      } else {
        // Center/Default
        top = window.innerHeight / 2 - popoverHeight / 2
        left = window.innerWidth / 2 - popoverWidth / 2
        setArrowClass('')
        highlight.isCenter = true
        setHighlightRect(highlight)
      }

      // Restricciones de pantalla para asegurar visibilidad total (Clamping)
      if (left < 10) left = 10
      if (left + popoverWidth > window.innerWidth - 10) {
        left = window.innerWidth - popoverWidth - 10
      }

      if (top < 10) top = 10
      if (top + popoverHeight > window.innerHeight - 10) {
        top = window.innerHeight - popoverHeight - 10
      }

      setPopoverStyle({ top, left })
    } else {
      // Elemento no disponible, mostrar en el centro de la pantalla
      setHighlightRect({
        top: window.innerHeight / 2,
        left: window.innerWidth / 2,
        width: 0,
        height: 0,
        visible: true,
        isCenter: true
      })
      const popoverWidth = 320
      const popoverHeight = 180
      setPopoverStyle({
        top: window.innerHeight / 2 - popoverHeight / 2,
        left: window.innerWidth / 2 - popoverWidth / 2
      })
      setArrowClass('')
    }
  }

  // Detectar cambios de paso o estado del tour
  useEffect(() => {
    if (active) {
      // Pequeño timeout para permitir renderizado u transiciones de modal
      const timer = setTimeout(() => {
        updatePosition()
      }, 300)

      window.addEventListener('resize', updatePosition)
      window.addEventListener('scroll', updatePosition)

      return () => {
        clearTimeout(timer)
        window.removeEventListener('resize', updatePosition)
        window.removeEventListener('scroll', updatePosition)
      }
    }
  }, [active, stepIndex, currentSteps])

  // Efecto para actualizar los pasos dinámicamente si cambia el contexto del DOM (por ejemplo, avanzar paso en el formulario)
  useEffect(() => {
    if (active) {
      const interval = setInterval(() => {
        const newSteps = getActiveSteps()
        if (newSteps.length > 0 && (!currentSteps[0] || newSteps[0].title !== currentSteps[0].title)) {
          setCurrentSteps(newSteps)
          setStepIndex(0)
        }
      }, 500)
      return () => clearInterval(interval)
    }
  }, [active, currentSteps])

  // Detectar cambio de ruta para reiniciar o cerrar el tour
  useEffect(() => {
    closeTour()
  }, [location.pathname])

  const currentStep = currentSteps[stepIndex]

  return (
    <>
      {/* Botón flotante siempre visible en la esquina inferior derecha */}
      <button
        className="user-tour-trigger-btn shadow"
        onClick={startTour}
        title="Manual del Usuario / Tutorial interactivo"
      >
        <div className="user-tour-trigger-pulse"></div>
        <CIcon icon={cilInfo} size="lg" />
      </button>

      {/* Interfaz del Tour */}
      {active && currentStep && (
        <div className="user-tour-container">
          {/* Overlay oscuro */}
          <div className="user-tour-overlay" onClick={closeTour}></div>

          {/* Caja de resalto */}
          <div
            className={`user-tour-highlight ${highlightRect.isCenter ? 'user-tour-highlight-center' : ''}`}
            style={!highlightRect.isCenter ? {
              top: `${highlightRect.top}px`,
              left: `${highlightRect.left}px`,
              width: `${highlightRect.width}px`,
              height: `${highlightRect.height}px`,
              display: highlightRect.visible ? 'block' : 'none'
            } : {}}
          ></div>

          {/* Popover explicativo */}
          <div
            ref={popoverRef}
            className={`user-tour-popover visible`}
            style={{
              top: `${popoverStyle.top}px`,
              left: `${popoverStyle.left}px`
            }}
          >
            {arrowClass && <div className={`user-tour-arrow ${arrowClass}`}></div>}

            <div className="user-tour-popover-header">
              <h6 className="user-tour-popover-title">{currentStep.title}</h6>
              <button className="user-tour-popover-close" onClick={closeTour}>
                <CIcon icon={cilX} size="sm" />
              </button>
            </div>

            <div className="user-tour-popover-body">
              {currentStep.content}
            </div>

            <div className="user-tour-popover-footer">
              <span className="user-tour-progress">
                {stepIndex + 1} de {currentSteps.length}
              </span>
              <div className="user-tour-actions">
                {stepIndex > 0 && (
                  <button className="user-tour-btn user-tour-btn-outline" onClick={prevStep}>
                    Atrás
                  </button>
                )}
                <button className="user-tour-btn user-tour-btn-primary" onClick={nextStep}>
                  {stepIndex === currentSteps.length - 1 ? 'Finalizar' : 'Siguiente'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default UserTour
