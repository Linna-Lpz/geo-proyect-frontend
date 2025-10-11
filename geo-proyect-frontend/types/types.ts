export type Faculty = {
  facultad_id: number
  nombre: string
  departamentos?: Department[]
}

export type Department = {
  departamento_id: number
  nombre: string
  facultad_id: number
  facultad?: Faculty
  carreras?: Career[]
}

export type Career = {
  codigo_carrera: string
  grado_id: number
  antecedente_id: number
  es_acreditada: boolean
  nombre_carrera: string
  departamento_id: number
  departamento?: Department
  facultad?: Faculty
}